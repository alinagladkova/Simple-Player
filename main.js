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
    singer: "Король и шут",
    name: "Лесник",
    audioPath: "Король и Шут - Лесник (OST Король и Шут)",
    imgPath: "king&joker",
  },
  {
    id: 222,
    singer: "The Offspring",
    name: "Why don't you get a job",
    audioPath: "The Offspring - Why Don't Get A Job",
    imgPath: "offspring",
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
    this._subElements.shuffle.classList.add("btn--active");
    this._subElements.repeatOne.classList.add("btn--active");
    this._addListeners();
    this._updateListeners();
    this._endedListeners();
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
      // this._endedListeners();

      this._playNext();
    });

    this._subElements.prev.addEventListener("click", () => {
      // this._endedListeners();

      this._playPrev();
    });

    this._subElements.repeat.addEventListener("click", () => {
      this._subElements.repeat.classList.add("btn--active");
      this._subElements.shuffle.classList.add("btn--active");
      this._subElements.repeatOne.classList.remove("btn--active");
      console.log(1);
    });

    this._subElements.repeatOne.addEventListener("click", () => {
      this._subElements.repeatOne.classList.add("btn--active");
      this._subElements.shuffle.classList.remove("btn--active");
      this._subElements.repeat.classList.add("btn--active");
      console.log(2);
    });

    this._subElements.shuffle.addEventListener("click", () => {
      this._subElements.shuffle.classList.add("btn--active");
      this._subElements.repeat.classList.remove("btn--active");
      this._subElements.repeatOne.classList.add("btn--active");
      console.log(3);
    });

    this._subElements.btnVolume.addEventListener("click", () => {
      this._openVolume();
    });

    //звук
    this._subElements.volumeBar.addEventListener("click", (e) => {
      this._audio.volume = e.offsetY / 100;
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
      // this._endedListeners();
      this._render();
    });
  }

  _endedListeners() {
    //repeat n shuffle
    this._audio.addEventListener("ended", () => {
      if (this._subElements.repeat.classList.contains("btn--active") && this._subElements.shuffle.classList.contains("btn--active")) {
        this._playNext();
        //как только заканчивается плейлист, то начинам заново
        //нужен цикл по массиву треков, который будет воспроизводиться (storage)
        //условие - если в массиве последний трек и кнопка далее, но след - первый трек
        if (this._state.currentTrackIndex > this._state.storage.length) {
          return console.log("repeat");
        }
      } else if (this._subElements.repeatOne.classList.contains("btn--active") && this._subElements.repeat.classList.contains("btn--active")) {
        this._setStatePlay();
        if (!this._state.isPlay) {
          this._setStatePlay();
        }
        this._play();
        this._render();
        return console.log("repeatOne");
      } else if (this._subElements.shuffle.classList.contains("btn--active") && this._subElements.repeatOne.classList.contains("btn--active")) {
        this._setStateCurrentTrackIndex(Math.floor(Math.random() * this._state.storage.length + 1));
        this._setStateCurrentTrack(this._state.storage[this._state.currentTrackIndex]);
        this._getCurrentTrackLink();
        this._setStatePlay();
        if (!this._state.isPlay) {
          this._setStatePlay();
        }
        this._setStateStorage(this._generateItemsObject());
        this._updateListeners();
        this._play();
        this._render();
        return console.log("shuffle");
      }
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
    // this._state.currentTrackIndex = index;
    index > this._state.storage.length ? (this._state.currentTrackIndex = 0) : (this._state.currentTrackIndex = index);
    console.log(this._state.currentTrackIndex);
  }

  _setStateCurrentTrackCurrentTime(currentTime) {
    this._state.currentTrackCurrentTime = currentTime;
  }

  _setStateCurrentTrackDuration(duration) {
    this._state.currentTrackDuration = duration;
  }

  _listTrackHandler(key) {
    this._setStateCurrentTrackIndex(key);
    this._setStateCurrentTrack(this._state.storage[key]);

    console.log(key);
    console.log(this._state.storage.length);

    key > this._state.storage.length ? this._setStateCurrentTrackIndex(0) : this._setStateCurrentTrackIndex(key);
    this._getCurrentTrackLink();
    this._updateListeners();

    this._setStateStorage(this._generateItemsObject());
    if (!this._state.isPlay) {
      this._setStatePlay();
    }
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
    console.log(this._state.currentTrack);
    this._audio = new Audio(`audio/${this._state.currentTrack._audioPath}.mp3`);
    //сделать чтото!
    if (this._audio === undefined) {
      this._audio = new Audio(`audio/${this._state.storage[this._state.currentTrackIndex]._audioPath}.mp3`);
    }
    // console.log(this._state.storage[this._state.currentTrackIndex]._audioPath);
    // console.log(this._audio);
  }

  _play() {
    this._audio.play();
  }

  _pause() {
    this._audio.pause();
  }

  _isNext() {
    this._state.storage.length > this._state.currentTrackIndex + 1;
  }

  _isPrev() {
    return this._state.currentTrackIndex > 0;
  }

  _playNext() {
    this._setStateCurrentTrackIndex(this._state.currentTrackIndex + 1);
    //если индекс больше, чем длина, то индекс = первому треку

    this._setStateCurrentTrack(this._state.storage[this._state.currentTrackIndex]);
    this._getCurrentTrackLink(); //меняется this.audio
    this._updateListeners();
    console.log(this._state.currentTrackIndex);
    // this._endedListeners();

    // если трек не проигрывается
    if (!this._state.isPlay) {
      this._setStatePlay();
    }
    this._setStateStorage(this._generateItemsObject());
    this._render();
    this._play();
  }

  _playPrev() {
    this._setStateCurrentTrackIndex(this._state.currentTrackIndex - 1);
    this._setStateCurrentTrack(this._state.storage[this._state.currentTrackIndex]);
    this._getCurrentTrackLink();
    this._updateListeners();
    // this._endedListeners();

    // если трек не проигрывается
    if (!this._state.isPlay) {
      this._setStatePlay();
    }
    this._setStateStorage(this._generateItemsObject());
    this._render();
    this._play();
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

    this._subElements.volumeProgress.style.height = `${this._audio.volume * 100}%`;

    this._subElements.actualProgress.style.width = `${(this._state.currentTrackCurrentTime / this._state.currentTrackDuration) * 100}%`;
    this._audio.onloadeddata = () => {
      this._subElements.duration.textContent = `${this._countDuration().totalMin}:${this._countDuration().totalSec}`;
    };

    this._subElements.currentTime.textContent = `${this._countCurrentTime().currentMin}:${this._countCurrentTime().currentSec}`;

    // !this._isNext() ? this._subElements.next.setAttribute("disabled", true) : this._subElements.next.removeAttribute("disabled");
    // !this._isPrev() ? this._subElements.prev.setAttribute("disabled", true) : this._subElements.prev.removeAttribute("disabled");
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
									<div class="volume__progress-area" data-element="volume">
										<div class="volume__progress-bar" data-element="volumeBar">
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
								<div class="player__extra" data-element="extra">
									<button class="btn btn--repeat" data-element="repeat"><i class="fa-solid fa-repeat"></i></button>
									<button class="btn btn--shuffle" data-element="shuffle"><i class="fa-solid fa-shuffle"></i></button>
									<button class="btn btn--repeatOne" data-element="repeatOne"><i class="fa-solid fa-1"></i></i></button>
								</div>
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
							<span class="track__singer">${this._singer} -</span>
							<span class="track__name">${this._name}</span>
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

/*
volume
сделать druggable
сделать mute при нажатии на иконку
закинуть начальное значение 50% audio volume

repeat
понять как сделать loop воспроизведения треков
понять что не так с условием current track index 

*/
