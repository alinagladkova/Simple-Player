"use strict";

const startData = [
  {
    id: 14,
    singer: "Rick Astley",
    name: "Never gonna give you up",
    audioPath: "Rick Astley (Рик Эстли) - Never Gonna Give You Up",
    imgPath: "astley",
  },
  {
    id: 78,
    singer: "Hurts",
    name: "Wonderful life",
    audioPath: "Hurts - Wonderful Life(livesong.me)",
    imgPath: "hurts",
  },
  {
    id: 528,
    singer: "Linkin park",
    name: "Numb",
    audioPath: "Linkin Park - Numb",
    imgPath: "lp",
  },
  {
    id: 65,
    singer: "H.I.M.",
    name: "Join Me In Death",
    audioPath: "H.I.M. - Join Me In Death",
    imgPath: "Join_Me_in_Death",
  },
  {
    id: 222,
    singer: "Scorpions",
    name: "Still Loving You",
    audioPath: "Scorpions - Still Loving You",
    imgPath: "-YjzXNQ2vYM",
  },
];

function createElement(html) {
  const root = document.createElement("div");
  root.insertAdjacentHTML("beforeend", html);
  return root.firstElementChild;
}

class Player {
  _element = null;
  _subElements = {};
  _audio = null;

  _state = {
    currentTrack: null,
    currentTrackIndex: 0,
    storage: [],
    isPlay: false,
    currentTrackDuration: 0,
    currentTrackCurrentTime: 0,
    volume: 0,
    volumeProgressArea: false,
  };

  constructor(startData, Track) {
    this._startData = startData;
    this._Track = Track;
    this._init();
  }

  _init() {
    this._element = createElement(this._getTemplate());
    this._subElements = this._getSubElements();

    this._setStateStorage(this._generateItemsObject());
    this._setStateCurrentTrack(this._state.storage[0]);
    this._getCurrentTrackLink();

    this._handleKeyDocument = this._handleKeyDocument.bind(this);
    this._handleClickDocument = this._handleClickDocument.bind(this);

    this._setAudioVolume(0.5);
    this._addListeners();
    this._updateListeners();
    this._render();
  }

  _addListeners() {
    this._subElements.play.addEventListener("click", () => {
      this._setStatePlay();
      this._play();
      this._render();
    });

    this._subElements.pause.addEventListener("click", () => {
      this._setStatePlay();
      this._pause();
      this._render();
    });

    this._subElements.next.addEventListener("click", () => {
      this._setStateCurrentTrackIndex(this._state.currentTrackIndex + 1);
      this._setStateCurrentTrack(this._state.storage[this._state.currentTrackIndex]);
      this._getCurrentTrackLink();
      this._updateListeners();
      // если трек не проигрывается
      if (!this._state.isPlay) {
        this._setStatePlay();
      }
      this._setStateStorage(this._generateItemsObject());
      this._setAudioVolume(this._state.volume);
      this._render();
      this._play();
    });

    this._subElements.prev.addEventListener("click", () => {
      this._setStateCurrentTrackIndex(this._state.currentTrackIndex - 1);
      this._setStateCurrentTrack(this._state.storage[this._state.currentTrackIndex]);
      this._getCurrentTrackLink();
      this._updateListeners();
      // если трек не проигрывается
      if (!this._state.isPlay) {
        this._setStatePlay();
      }
      this._setStateStorage(this._generateItemsObject());
      this._setAudioVolume(this._state.volume);
      this._render();
      this._play();
    });

    this._subElements.btnVolume.addEventListener("click", () => {
      this._setStateVolumeProgressArea();
      if (this._state.volumeProgressArea === true) {
        this._setAudioVolume(0);
        this._render();
      } else {
        this._openVolume();
      }
    });

    this._subElements.btnMute.addEventListener("click", () => {
      this._setAudioVolume(0.5);
      this._render();
    });

    // звук;
    this._subElements.volumeBar.addEventListener("click", (e) => {
      this._setAudioVolume(e.offsetY / 100);
      this._setAudioVolume(this._audio.volume);
      this._render();
    });

    //перемотка
    this._subElements.progressBar.addEventListener("click", (e) => {
      this._audio.currentTime = (e.offsetX / this._subElements.progressBar.clientWidth) * this._audio.duration;
      if (!this._state.isPlay) {
        this._setStatePlay();
        this._play();
      }
      this._render();
    });
  }

  _updateListeners() {
    //обновление таймера
    this._audio.addEventListener("timeupdate", (e) => {
      this._setStateCurrentTrackCurrentTime(e.target.currentTime);
      this._setStateCurrentTrackDuration(e.target.duration);
      this._render();
    });
  }

  _handleKeyDocument(e) {
    if (e.key === "Escape") {
      this._closeVolume();
    }
  }

  _handleClickDocument(e) {
    if (!e.target.closest(".player__volume")) {
      this._closeVolume();
    }
  }

  _openVolume() {
    document.addEventListener("keydown", this._handleKeyDocument);
    document.addEventListener("click", this._handleClickDocument);
    this._subElements.volume.classList.add("volume__progress-area--active");
  }

  _closeVolume() {
    document.removeEventListener("keydown", this._handleKeyDocument);
    document.removeEventListener("click", this._handleClickDocument);
    this._subElements.volume.classList.remove("volume__progress-area--active");
  }

  _setStateCurrentTrack(obj) {
    this._state.currentTrack = obj;
  }

  _setStateStorage(newTracks) {
    this._state.storage = newTracks;
  }

  _setStatePlay() {
    this._state.isPlay = !this._state.isPlay;
  }

  _setStateCurrentTrackIndex(index) {
    this._state.currentTrackIndex = index;
    // index > this._state.storage.length ? (this._state.currentTrackIndex = 0) : (this._state.currentTrackIndex = index);
  }

  _setStateCurrentTrackCurrentTime(currentTime) {
    this._state.currentTrackCurrentTime = currentTime;
  }

  _setStateCurrentTrackDuration(duration) {
    this._state.currentTrackDuration = duration;
  }

  _setAudioVolume(volume) {
    this._state.volume = volume;
    this._audio.volume = volume;
  }

  _setStateVolumeProgressArea() {
    this._state.volumeProgressArea = this._subElements.volume.classList.contains("volume__progress-area--active") ? true : false;
  }

  _listTrackHandler(key) {
    this._setStateCurrentTrackIndex(key);
    this._setStateCurrentTrack(this._state.storage[key]);
    this._getCurrentTrackLink();
    this._updateListeners();
    this._setStateStorage(this._generateItemsObject());
    if (!this._state.isPlay) {
      this._setStatePlay();
    }
    this._setAudioVolume(this._state.volume);
    this._render();
    this._play();
  }

  _generateItemsObject() {
    return this._startData.map((track, i) => {
      if (this._state.currentTrackIndex === i) {
        return new this._Track({ ...track, key: i, active: true }, this._listTrackHandler.bind(this));
      }
      return new this._Track({ ...track, key: i, active: false }, this._listTrackHandler.bind(this));
    });
  }

  _generateItemsElements() {
    return this._state.storage.map((track) => track.element);
  }

  _getCurrentTrackLink() {
    if (this._audio) {
      // если трек уже установлен, надо ставить его на паузу, вдруг prev next
      this._pause();
    }
    this._audio = null;
    this._audio = new Audio(`audio/${this._state.currentTrack._audioPath}.mp3`);
  }

  _play() {
    this._audio.play();
  }

  _pause() {
    this._audio.pause();
  }

  _isNext() {
    return this._state.storage.length > this._state.currentTrackIndex + 1;
  }

  _isPrev() {
    return this._state.currentTrackIndex > 0;
  }

  _countDuration() {
    const totalMin = Math.floor(this._audio.duration / 60);
    let totalSec = Math.floor(this._audio.duration % 60);
    if (totalSec < 10) {
      totalSec = `0${totalSec}`;
    }
    return {
      totalMin,
      totalSec,
    };
  }

  _countCurrentTime() {
    const currentMin = Math.floor(this._audio.currentTime / 60);
    let currentSec = Math.floor(this._audio.currentTime % 60);

    if (currentSec < 10) {
      currentSec = `0${currentSec}`;
    }
    return {
      currentMin,
      currentSec,
    };
  }

  _render() {
    this._subElements.storage.innerHTML = "";
    this._subElements.storage.append(...this._generateItemsElements());

    this._subElements.name.textContent = `${this._state.currentTrack._name}`;
    this._subElements.artist.textContent = `${this._state.currentTrack._singer}`;
    this._subElements.img.src = `images/${this._state.currentTrack._imgPath}.jpg`;

    if (this._state.isPlay) {
      this._subElements.play.classList.add("btn--active");
      this._subElements.pause.classList.remove("btn--active");
    } else {
      this._subElements.play.classList.remove("btn--active");
      this._subElements.pause.classList.add("btn--active");
    }

    if (this._audio.volume === 0) {
      this._subElements.btnVolume.classList.add("btn--active");
      this._subElements.btnMute.classList.remove("btn--active");
    } else {
      this._subElements.btnVolume.classList.remove("btn--active");
      this._subElements.btnMute.classList.add("btn--active");
    }

    this._subElements.volumeProgress.style.height = `${this._audio.volume * 100}%`;

    this._subElements.actualProgress.style.width = `${(this._state.currentTrackCurrentTime / this._state.currentTrackDuration) * 100}%`;
    this._audio.onloadeddata = () => {
      this._subElements.duration.textContent = `${this._countDuration().totalMin}:${this._countDuration().totalSec}`;
    };

    this._subElements.currentTime.textContent = `${this._countCurrentTime().currentMin}:${this._countCurrentTime().currentSec}`;

    !this._isNext() ? this._subElements.next.setAttribute("disabled", true) : this._subElements.next.removeAttribute("disabled");
    !this._isPrev() ? this._subElements.prev.setAttribute("disabled", true) : this._subElements.prev.removeAttribute("disabled");
  }

  _getTemplate() {
    return `<div class="player">
							<div class="player__img-wrapper">
								<img class="player__img" data-element="img" src="" alt="" />
							</div>
							<div class="player__title">
								<span class="player__name" data-element="name"></span>
								<span class="player__artist" data-element="artist"></span>
							</div>
							<div class="player__action">
								<div class="player__volume">
									<button class="btn btn--volume" data-element="btnVolume"><i class="fa-solid fa-volume-high"></i></button>
									<button class="btn btn--mute" data-element="btnMute"><i class="fa-solid fa-volume-xmark"></i></button>
									<div class="volume__progress-area" data-element="volume">
										<div class="volume__progress-bar" data-element="volumeBar">
											<div class="volume__progress-btn" data-element="sliderBtn"></div>
											<div class="volume__progress-actual" data-element="volumeProgress"></div>
										</div>
									</div>
								</div>
								<div class="player__control">
									<button class="btn btn--prev" data-element="prev"><i class="fa-solid fa-backward"></i></button>
									<button class="btn btn--pause" data-element="pause"><i class="fa-solid fa-pause"></i></button>
									<button class="btn btn--play" data-element="play"><i class="fa-solid fa-play"></i></button>
									<button class="btn btn--next" data-element="next"><i class="fa-solid fa-forward"></i></button>
								</div>
							<div class="progress-area" data-element="progressArea">
								<div class="progress-area__progress-bar" data-element="progressBar">
									<div class="progress-area__progress-actual" data-element="actualProgress"></div>
								</div>
								<div class="progress-area__timer">
									<span class="progress-area__current-time" data-element="currentTime"></span>
									<span class="progress-area__duration" data-element="duration"></span>
								</div>
							</div>
							<div class="player__storage" data-element="storage"></div>
      			</div>`;
  }

  _getSubElements() {
    return Array.from(this._element.querySelectorAll("[data-element]")).reduce((acc, el) => {
      return {
        ...acc,
        [el.getAttribute("data-element")]: el,
      };
    }, {});
  }

  get element() {
    return this._element;
  }
}

class Track {
  _element = null;
  _subElements = {};

  constructor({ id, singer, name, imgPath, audioPath, key, active }, listTrackHandler) {
    this._id = id;
    this._singer = singer;
    this._name = name;
    this._imgPath = imgPath;
    this._listTrackHandler = listTrackHandler;
    this._audioPath = audioPath;
    this._key = key;
    this._active = active;
    this._init();
  }

  _init() {
    this._element = createElement(this._getTemplate());
    this._subElements = this._getSubElements();
    this._addListeners();
  }

  _addListeners() {
    this._element.addEventListener("click", () => {
      this._listTrackHandler(this._key);
    });
  }

  _getTemplate() {
    return `<div class="track ${this._active ? "track--active" : ""}" data-id="${this._id}">
							<img class="track__img" src="images/${this._imgPath}.jpg" alt="" />
							<span class="track__singer">${this._singer} - </span>
							<span class="track__name"> ${this._name}</span>
          	</div>`;
  }

  _getSubElements() {
    return Array.from(this._element.querySelectorAll("[data-element]")).reduce((acc, el) => {
      return {
        ...acc,
        [el.getAttribute("data-element")]: el,
      };
    }, {});
  }

  get element() {
    return this._element;
  }
}

const root = document.querySelector(".root");
root.insertAdjacentElement("beforeend", new Player(startData, Track).element);
