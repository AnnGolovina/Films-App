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

  constructor(data = [], watchList = []) {
    this.data = data;
    this.watchList = watchList;

    //App.button.onclick = this.onButtonClick;
    //App.button.onclick = this.onButtonClick.bind(this);
    App.searchButton.onclick = () => this.onButtonClick();
  }

  onInputChange() {}

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

  addWatchList(film) {
    const oldWatchList = JSON.parse(localStorage.getItem("watchList") || "[]");
    localStorage.setItem("watchList", JSON.stringify([...oldWatchList, film]));
  }

  renderData(dataToRender, outputElement = App.output) {
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

      outputElement.innerHTML += `<div class="film-elem">
      <div>
        <img src="${imageUrl}" />
        <h3>${title}</h3>
        <span>Rating: ${rank}</span>
        <span>Actors: ${actors}</span>
        <span>Year: ${year || "unknown"}</span>
        </div>
        <div class="btn-wrapper">
        <button class="btn-watch-later">Add To Watch Later</button>
        </div>
      </div>
      `;
    });

    const filmsBtn = document.querySelectorAll(".btn-watch-later");

    [...filmsBtn].forEach((e, i) => {
      e.onclick = () => {
        this.addWatchList(dataToRender[i]);
      };
    });
  }

  renderWatchList() {}
}

new App();
