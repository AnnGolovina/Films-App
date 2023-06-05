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
      [...document.querySelectorAll(".film-elem")].forEach((el) => {
        if (this.checkIfWatchListContainsFilm(el.id)) {
          el.style.border = "2px solid #6e128a";
        } else {
          el.style.border = "1px solid white";
        }
      });

      const randomFilmData =
        this.getRandomFilm(
          this.currentSection === App.SECTION.main
            ? this.data
            : this.getWatchListData()
        ) || null;

      if (!randomFilmData) return alert("There is no random film");

      const randomFilmElement = document.querySelector(`#${randomFilmData.id}`);

      randomFilmElement.style.border = "1px solid lime";

      randomFilmElement.scrollIntoView({ behavior: "smooth" });
    };

    App.input.oninput = (e) => this.onInputChange(e);
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
          "https://images.all-free-download.com/images/graphicwebp/photo_video_sign_icon_flat_contrast_silhouette_geometric_outline_6921635.webp",
        width: 1000,
        height: 1000,
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

    [...filmsBtn].forEach((e, i) => {
      e.onclick = () => {
        const currentFilm = dataToRender[i];
        if (this.checkIfWatchListContainsFilm(currentFilm.id)) {
          this.removeWatchListData(currentFilm.id);
          isUsingAsWatchList &&
            this.renderData(this.getWatchListData(), App.watchListOutput, true);
          e.textContent = "Add To Watch Later";
        } else {
          this.addWatchList(currentFilm);
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
