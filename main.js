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

    this._addListeners();
    this._render();
  }

  _addListeners() {
    this._subElements.play.addEventListener("click", () => {
      this._setStatePlay();
      this._render();
      this._state.isPlay ? this._play() : this._pause();
    });

    this._subElements.next.addEventListener("click", () => {
      this._setStateCurrentTrackIndex(this._state.currentTrackIndex + 1);
      this._setStateCurrentTrack(this._state.storage[this._state.currentTrackIndex]);
      this._getCurrentTrackLink();
      this._render();
      this._play();
    });

    this._subElements.prev.addEventListener("click", () => {
      this._setStateCurrentTrackIndex(this._state.currentTrackIndex - 1);
      this._setStateCurrentTrack(this._state.storage[this._state.currentTrackIndex]);
      this._getCurrentTrackLink();
      this._render();
      this._play();
    });

    // this._getCurrentTrackLink().addEventListener("timeupdate", (e) => {
    //   this._subElements.startTime.textContent = `${e.target.currentTime}`;
    //   console.log(e.target.currentTime);
    //   // console.log(e.target.duration);
    //   let progressWidth = (e.target.currentTime / e.target.duration) * 100;
    //   this._subElements.progress.style.width = `${progressWidth}%`;

    //   // console.log(this._getCurrentTrackLink());
    // });
  }

  _setStateCurrentTrack(obj) {
    this._state.currentTrack = obj;
  }

  _setStateStorage(newTracks) {
    this._state.storage = [...this._state.storage, ...newTracks];
  }

  _setStatePlay() {
    this._state.isPlay = !this._state.isPlay;
  }

  _setStateCurrentTrackIndex(index) {
    this._state.currentTrackIndex = index;
  }

  _listTrackHandler(key) {
    this._setStateCurrentTrackIndex(key);
    this._setStateCurrentTrack(this._state.storage[key]);
    this._getCurrentTrackLink();
    this._render();
    this._play();
  }

  _generateItemsObject() {
    return this._startData.map((track, i) => {
      return new this._Track({ ...track, key: i }, this._listTrackHandler.bind(this));
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

  _render() {
    this._subElements.storage.append(...this._generateItemsElements());

    this._subElements.name.textContent = `${this._state.currentTrack._name}`;
    this._subElements.artist.textContent = `${this._state.currentTrack._singer}`;
    this._subElements.img.src = `images/${this._state.currentTrack._imgPath}.jpg`;

    if (this._state.isPlay) {
      this._subElements.play.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    } else {
      this._subElements.play.innerHTML = `<i class="fa-solid fa-play"></i>`;
    }

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
							<div class="player__control">
								<button class="btn btn--prev" data-element="prev"><i class="fa-solid fa-backward"></i></button>
								<button class="btn btn--play" data-element="play"></button>
								<button class="btn btn--next" data-element="next"><i class="fa-solid fa-forward"></i></button>
							</div>
							<div class="player__progress">
								<div class="player__progress-bar" data-element="progress"></div>
								<div class="player__timer">
								<span class="player__start-time" data-element="startTime">0:00</span>
								<span class="player__end-time">03:20</span>

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

  constructor({ id, singer, name, imgPath, audioPath, key }, listTrackHandler) {
    this._id = id;
    this._singer = singer;
    this._name = name;
    this._imgPath = imgPath;
    this._listTrackHandler = listTrackHandler;
    this._audioPath = audioPath;
    this._key = key;
    this._init();
  }

  _init() {
    this._element = createElement(this._getTemplate());
    this._subElements = this._getSubElements();
    this._addListeners();
  }

  _addListeners() {
    this._element.addEventListener("click", (e) => {
      this._listTrackHandler(this._key);
    });
  }

  _getTemplate() {
    return `<div class="track" data-id="${this._id}">
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

- добавить картинки для треков +
- отрисовать в плеере текущий трек +
- когда кликаем на трек, текущий должен меняться (после изменения там должен лежать объект) +
- оживить кнопки на плеере
- погуглить тег audio -> внедрить его в верстку methods play pause
- у плеера будут методы play pause +
- у плеера будут методы prev next +

*/

/*
- длительность и перемотка +время
- громкость
- повтор и тд
- воспроизведение следующего трека сразу
*/

/*
условие на смену плей паузы кнопки, когда листаем треки
*/
