"use strict";

const musicBox = [
  {
    id: 14,
    singer: "Rick Astley",
    name: "Never gonna give you up",
    size: 15,
  },
  {
    id: 78,
    singer: "Hurts",
    name: "Wonderful life",
    size: 14,
  },
  {
    id: 528,
    singer: "Linkin park",
    name: "Numb",
    size: 20,
  },
  {
    id: 65,
    singer: "Король и шут",
    name: "Лесник",
    size: 6,
  },
  {
    id: 222,
    singer: "The Offspring",
    name: "Why don't you get a job",
    size: 22,
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

  _state = {
    storage: [],
    currTrack: undefined,
    currMemory: 0,
  };

  constructor({ memoryMax }, musicBox, Track) {
    this._memoryMax = memoryMax;
    this._musicBox = musicBox;
    this._Track = Track;
    this._init();
  }

  _init() {
    this._element = createElement(this._getTemplate());
    this._subElements = this._getSubElements();
    this._render();
  }

  addTrack(track) {
    this._setStateStorage(track);
    //как проверить что трек в storage, чтобы его не добавляло снова?
    //проверила методы includes, find. Постоянно выдает false, даже если трек уже в storage, соответственно память неправильно рассчитывается

    if (this._state.storage.includes(track)) {
      return;
    } else {
      this._state.storage.push(track);
      this._fillMemory(track.size);
    }

    // if (this._memoryMax <= this._state.currMemory) {
    // }
    this._render();

    /* 
    1. проверить есть ли там трек, если есть return
    2. проверить по памяти (влезает ли он)
    3. push
    4. _fillMemory(track.size)
    
    */
  }

  _setStateStorage(track) {
    //отдельный метод состояния
    // this._state.storage = this._state.storage.filter((song) => song.id !== track.id);
    this._state.storage.push(track);
  }

  removeTrack(track) {
    this._render();

    /* 
					2.найти трек в storage по id {}
					3. удаляем из storage
					4. _cleanMemory(track.size)
					
					*/
  }

  _generateTracks() {
    return this._musicBox.map((track) => {
      return new this._Track(track, this.addTrack.bind(this), this.removeTrack.bind(this), this._play.bind(this)).element;
    });
  }

  // _setStateCurrentTrack(currentSong.id){

  // }

  // _getTrackById(id) {
  //   this._state.currTrack = id;
  // }

  _fillMemory(size) {
    this._state.currMemory += size;
    this._render();
  }

  _cleanMemory(size) {
    this._state.currMemory -= size;
    this._render();
  }

  _stop() {
    // this._currentSong.stop();
    // setStateCurrentTrack(undefined);
    // _render();
  }

  _play(id) {
    //сюда еще не дошла
    // setStateCurrentTrack(currentSong.id)
    // _render()
    // this._currentSong = new Audio(currentSong.path).play() path ->tracks ->
    // if (this._state.storage.includes(trackName)) {
    // }
  }

  _render() {
    this._subElements.data.textContent = `В плейлисте ${this._state.storage.length} песен.`;
    this._subElements.memory.textContent = `Занято ${this._state.currMemory} mb памяти из ${this._memoryMax} mb. Осталось ${
      this._memoryMax - this._state.currMemory
    } mb`;
    // this._subElements.playNow.textContent = ``;
    // this._subElements.playNow.textContent = `Проигрывается песня: ${singer} - ${trackName}`;

    this._subElements.storage.innerHTML = "";
    this._subElements.storage.append(...this._generateTracks());
  }

  _getTemplate() {
    return `<div class="player">
							<p class="player__data" data-element="data"></p>
							<p class="player__memory" data-element="memory"></p>
							<p class="player__playNow" data-element="playNow"></p>
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

  constructor({ id, singer, name, size }, addTrack, removeTrack, playTrack) {
    this._id = id;
    this._singer = singer;
    this._name = name;
    this._size = size;

    this._addTrack = addTrack;
    this._removeTrack = removeTrack;

    this._playTrack = playTrack;
    this._init();
  }

  _init() {
    this._element = createElement(this._getTemplate());
    this._subElements = this._getSubElements();
    this._addListener();
    this._render();
  }

  _addListener() {
    this._subElements.btnAdd.addEventListener("click", () => {
      //как передать полностью объект? this.element мы не можем деструктуризировать. Выбрала такой странный вариант:
      const trackData = { id: this._id, singer: this._singer, name: this._name, size: this._size };
      this._addTrack(trackData);
      //надо понять когда трек добавляется, а когда удаляется? 1 вариант: toggle? 2вариант: сделать вторую кнопку

      // this._removeTrack(this._element);
      // this._render();
    });

    this._subElements.btnPlay.addEventListener("click", () => {
      this._playTrack(this._id);
    });
  }

  _render() {
    //this._added надо заменить, но на что? как Track поймет когда он какой?
    if (this._added) {
      this._subElements.btnAdd.textContent = `-`;
      this._element.classList.add("track-wrapper--active");
      this._subElements.btnPlay.classList.add("track-wrapper__btnPlay--active");
    } else {
      this._subElements.btnAdd.textContent = `+`;
      this._element.classList.remove("track-wrapper--active");
      this._subElements.btnPlay.classList.remove("track-wrapper__btnPlay--active");
    }
  }

  _getTemplate() {
    return `<div class="track-wrapper">
							<button class="btn track-wrapper__btnPlay btn--play" data-element='btnPlay'><i class="fa-solid fa-play"></i></button>
							<button class="btn track-wrapper__btn btn--add" data-element='btnAdd'></button>
							<div class="track-wrapper__track">${this._singer} - ${this._name}</div>
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

root.insertAdjacentElement(
  "beforeend",
  new Player(
    {
      memoryMax: 100,
    },
    musicBox,
    Track
  ).element
);

/*
+ создайте класс плеер:

какие свойства есть:
- хранилище загруженных песен +
- объем памяти в МБ (заполнено/макс) +

- добавить песню (не забывать заполнять память) +
- воспроизвести по названию (если есть в плеере, то метод выбрасывает строку 
	"проигрываю песню: название песни")
- выдача сколько памяти заполнено +
- выдача сколько памяти осталось +
- удалить песню из плеера по названию +


создать класс песни и самостоятельно подумать какие там есть свойства и методы
сделать взаимодействие объектов песен с плеером
*/

// class Player {
//   constructor(musicBox, Track) {
//     this._musicBox = musicBox;
//     this._Track = Track;
//   }

//   // добавить еще чуток треков (по одному)
//   addTrack(trackDataObj) {
//     const newTrack = new this._Track(trackDataObj);
//     setStateStorage({
//       ...this._state.storage,
//       ...newTrack,
//     });
//     this._render();
//   }

//   _getTemplate() {
//     return `<div class="player">
// 							<p class="player__data" data-element="data"></p>
// 							<p class="player__memory" data-element="memory"></p>
// 							<p class="player__playNow" data-element="playNow"></p>
// 							<div class="player__storage" data-element="storage"></div>
//               buttondata-element="btnAdd"
// 						</div>`;
//   }

//   _addListeners() {
//     this._subElements.btnAdd.addEventListener('click', () => {
//       _addTrack
//     })
//   }

//   removeTrack(id) {
//     // удаляю трек
//     this._state.storage = this._state.storage.filter();
//     this._render();
//   }

//   _render() {
//     this._subElements.storage.innerHTML = "";
//     this._subElements.storage.append(...this._generateItems());
//   }
// }

// const player = new Player(musicBox, Track);
