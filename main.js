class App {
  static API_KEY = "1f33e47047msh3f74868d842cb43p1a9ab9jsn640751cfde85";
  static SEARCH_URL =
    "https://online-movie-database.p.rapidapi.com/auto-complete?q=";
  static DEFAULT_HEADERS = {
    "X-RapidAPI-Key": App.API_KEY,
    "X-RapidAPI-Host": "online-movie-database.p.rapidapi.com",
  };

  static searchButton = document.querySelector("#search-button");
  static input = document.querySelector("input");
  static output = document.querySelector("#output");
  static watchListOutput = document.querySelector("#watchList");
  static watchListSwitcher = document.querySelector("#watch-list-switcher");
  static watchListRandomButton = document.querySelector("#random-film-btn");

  static SECTION = {
    main: "main",
    filmList: "filmList",
  };

  constructor(data = [], watchList = []) {
    this.data = data;
    this.watchList = watchList;
    this.currentSection = App.SECTION.main;

    //App.button.onclick = this.onButtonClick.bind(this);
    App.searchButton.onclick = () => this.onButtonClick();

    App.watchListSwitcher.onclick = () =>
      this.currentSection === App.SECTION.main
        ? this.renderWatchList()
        : this.renderMainView();

    App.watchListRandomButton.onclick = () => {
      //terningn border colors back
      this.turningColorBorder();

      const randomFilmData =
        this.getRandomFilm(
          this.currentSection === App.SECTION.main
            ? this.data
            : this.getWatchListData()
        ) || null;

      if (!randomFilmData) return alert("There is no random film");

      const randomFilmElement = document.querySelector(`#${randomFilmData.id}`);

      randomFilmElement.style.border = "2px solid lime";

      randomFilmElement.scrollIntoView({ behavior: "smooth" });
    };

    App.input.oninput = (e) => this.onInputChange(e);
  }

  turningColorBorder() {
    [...document.querySelectorAll(".film-elem")].forEach((el) => {
      if (this.checkIfWatchListContainsFilm(el.id)) {
        el.style.border = "2px solid #6e128a";
      } else {
        el.style.border = "2px solid white";
      }
    });
  }

  onInputChange(e) {
    if (this.currentSection === App.SECTION.filmList) {
      const films = this.getWatchListData();

      const filteredFilms = films.filter(({ l }) =>
        l.toLowerCase().includes(e.target.value.toLowerCase())
      );

      console.log(filteredFilms, "filteredfilms");
    }
  }

  //start search
  onButtonClick() {
    console.log(App.input.value);
    this.getDataBySearch(App.input.value).then(() => {
      App.input.value = "";
      console.log("Data", this.data);

      this.renderData(this.data, App.output);
    });
  }

  async getDataBySearch(filmName = "") {
    try {
      const response = await fetch(App.SEARCH_URL + filmName, {
        headers: App.DEFAULT_HEADERS,
      });
      const data = await response.json();

      this.data = data.d ? data.d : [];
    } catch (e) {
      console.log(e, "err");
      alert("Query is invalid");
      //this.data = [];
    }
  }

  getRandomFilm(films) {
    return films[Math.floor(Math.random() * films.length)];
  }

  getWatchListData() {
    return JSON.parse(localStorage.getItem("watchList") || "[]");
  }

  addWatchList(film) {
    const oldWatchList = this.getWatchListData();
    localStorage.setItem("watchList", JSON.stringify([...oldWatchList, film]));
  }

  removeWatchListData(id) {
    const oldWatchList = this.getWatchListData();
    localStorage.setItem(
      "watchList",
      JSON.stringify([...oldWatchList.filter((film) => film.id !== id)])
    );
  }

  checkIfWatchListContainsFilm(id) {
    return this.getWatchListData().find((film) => film.id === id)
      ? true
      : false;
  }

  renderData(
    dataToRender,
    outputElement = App.output,
    isUsingAsWatchList = false
  ) {
    outputElement.innerHTML = "";

    dataToRender.forEach((film) => {
      const {
        id,
        l: title,
        q,
        qid: type,
        rank,
        s: actors,
        y: year,
        i: imageData,
      } = film;
      const { imageUrl, width, height } = imageData || {
        imageUrl:
          "https://media.istockphoto.com/id/912345822/ru/%D0%B2%D0%B5%D0%BA%D1%82%D0%BE%D1%80%D0%BD%D0%B0%D1%8F/%D1%84%D0%B8%D0%BB%D1%8C%D0%BC-%D0%B8-%D1%84%D0%B8%D0%BB%D1%8C%D0%BC-%D1%81%D0%BE%D0%B2%D1%80%D0%B5%D0%BC%D0%B5%D0%BD%D0%BD%D1%8B%D0%B9-%D1%80%D0%B5%D1%82%D1%80%D0%BE-%D1%81%D1%82%D0%B0%D1%80%D0%B8%D0%BD%D0%BD%D1%8B%D0%B9-%D0%BF%D0%BB%D0%B0%D0%BA%D0%B0%D1%82-%D1%84%D0%BE%D0%BD.jpg?s=612x612&w=0&k=20&c=12v45IGtOaM8NIXKtB5zkF8rjl9QpExzzPNoNCVTsL4=",
        width: 300,
        height: 400,
      };

      const isFilmAddedToWatchList = this.checkIfWatchListContainsFilm(id);

      outputElement.innerHTML += `<div id="${id}" class="film-elem ${
        isFilmAddedToWatchList ? "watch-list-film" : ""
      }">
      <div>
        <img src="${imageUrl}" />
        <h3>${title}</h3>
        <span>Rating: ${rank}</span>
        <span>Actors: ${actors}</span>
        <span>Year: ${year || "unknown"}</span>
        </div>
        <div class="btn-wrapper">
        <button class="btn-watch-later">${
          isFilmAddedToWatchList
            ? "Delete From Watch List"
            : "Add To Watch Later"
        }</button>
        </div>
      </div>
      `;
    });

    const filmsBtn = document.querySelectorAll(".btn-watch-later");

    const filmElement = [...document.querySelectorAll(".film-elem")];

    console.log(filmElement, "FE");

    [...filmsBtn].forEach((e, i) => {
      e.onclick = () => {
        const currentFilm = dataToRender[i];
        if (this.checkIfWatchListContainsFilm(currentFilm.id)) {
          this.removeWatchListData(currentFilm.id);
          isUsingAsWatchList &&
            this.renderData(this.getWatchListData(), App.watchListOutput, true);

          this.turningColorBorder();

          e.textContent = "Add To Watch Later";
        } else {
          this.addWatchList(currentFilm);

          this.turningColorBorder();

          e.textContent = "Delete From Watch List";
        }
      };
    });
  }

  renderWatchList() {
    App.output.style.display = "none";
    App.watchListOutput.style.display = "flex";

    App.watchListSwitcher.textContent = "Go to main page";

    this.currentSection = App.SECTION.filmList;

    const watchListData = this.getWatchListData();

    this.renderData(watchListData, App.watchListOutput, true);

    App.searchButton.style.display = "none";
  }

  renderMainView() {
    App.output.style.display = "flex";
    App.watchListOutput.style.display = "none";

    App.watchListSwitcher.textContent = "Go to watch list";

    this.currentSection = App.SECTION.main;

    App.searchButton.style.display = "flex";
  }
}

new App();
