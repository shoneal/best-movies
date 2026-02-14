const emptyMessages = {
  have_watched: {
    first: "Я пока не смотрел ни один из этих фильмов…",
    second:
      "Если вы посмотрели фильм из списка, обязательно установите флажок под его записью, и здесь появится итоговое количество просмотров. (Я сохраню ваш прогресс)",
  },
  want_to_watch: {
    first: "…но я уверен, что что-то из этого мне подойдёт.",
    second:
      "Следите за фильмами, которые вы хотите посмотреть, установив флажки под их записями.",
  },
};
const basicLink = "https://shoneal.github.io/best-movies/";
const VideoUtils = {
  cleanName(str) {
    return str
      .replace(/\s+/g, "-")
      .replace(/[:;!?–*./\\/]/g, "")
      .replace(/-{2,}/g, "-");
  },

  getPoster(original) {
    return `${basicLink}video/poster/${this.cleanName(original)}.jpg`;
  },

  getCover(original) {
    return `${basicLink}images/sizes/300/${this.cleanName(original)}.jpg`;
  },
};

function renderHeader() {
  const container = document.querySelector(".header_videos");
  const countEl = document.querySelector(".header_title_count");
  const caseEl = document.querySelector(".header_title_case");

  const filmsList = Object.values(films);
  const filmCount = filmsList.length;
  countEl.textContent = filmCount;
  caseEl.textContent = (function (n) {
    const last2 = n % 100;
    if (last2 >= 11 && last2 <= 19) return "лучших фильмов";
    const last1 = n % 10;
    return last1 === 1
      ? "лучший фильм"
      : last1 >= 2 && last1 <= 4
      ? "лучших фильма"
      : "лучших фильмов";
  })(filmCount);

  container.innerHTML = "";

  const indices = new Set();
  const totalVideos = 12;
  while (indices.size < totalVideos) {
    indices.add(Math.floor(Math.random() * filmsList.length));
  }
  let loadedCount = 0;

  function checkLogoPosition() {
    const blocks = container.querySelectorAll(".header_video_block");
    const second = blocks[1];
    const third = blocks[2];

    if (!second || !third) return;

    const logo = document.querySelector(".header_logo");
    if (!logo) return;

    const logoRect = logo.getBoundingClientRect();
    const secondRect = second.getBoundingClientRect();
    const thirdRect = third.getBoundingClientRect();

    const logoTopCrossesSecond = logoRect.top >= secondRect.top;
    const logoTopCrossesThird = logoRect.top >= thirdRect.top;
    const darkTheme = document.documentElement.classList.contains("dark-theme");

    logo.style.filter =
      darkTheme || logoTopCrossesSecond || logoTopCrossesThird
        ? "invert(100%)"
        : "";
  }

  window.addEventListener("resize", checkLogoPosition);
  document.addEventListener("DOMContentLoaded", checkLogoPosition);

  [...indices].forEach((idx, i) => {
    const film = filmsList[idx];
    const cleaned = VideoUtils.cleanName(film.original);

    const block = document.createElement("div");
    block.className = `header_video_block header_video_block_${i + 1}`;

    const video = document.createElement("video");
    video.className = "header_video";
    video.preload = "metadata";
    video.loop = video.muted = video.autoplay = video.playsInline = true;
    video.poster = VideoUtils.getPoster(film.original);

    ["mobile", "desktop"].forEach((type) => {
      const source = document.createElement("source");
      source.src = `${basicLink}video/${type}/${cleaned}.mp4`;
      source.type = "video/mp4";
      source.media =
        type === "mobile" ? "(max-width: 500px)" : "(min-width: 501px)";
      video.appendChild(source);
    });
    video.src = `${basicLink}video/desktop/${cleaned}.mp4`;

    const wrapper = document.createElement("div");
    wrapper.className = "header_video_wrapper";
    block.appendChild(wrapper);
    wrapper.appendChild(video);
    container.appendChild(block);

    video.addEventListener("loadedmetadata", () => {
      loadedCount++;

      if (loadedCount === totalVideos) {
        const videos = container.querySelectorAll(".header_video");
        videos.forEach((v) => (v.style.opacity = "1"));
        checkLogoPosition();
      }
    });
  });
}
function initHeaderScroll() {
  const header = document.querySelector(".header");
  const blocks = document.querySelectorAll(".header_video_block");

  const h = parseFloat(getComputedStyle(header).height);
  const s = header.offsetTop;
  const e = s + h;
  const eFast = e - h / 3;

  const pos = [
    ["-200%", "-200%", "-200%", "0%"], // 1
    ["-100%", "-200%", "-200%", "-200%"], // 2
    ["0%", "-200%", "-200%", "-100%"], // 3
    ["100%", "-200%", "0%", "0%"], // 4
    ["-200%", "-100%", "100%", "-200%"], // 5
    ["100%", "-100%", "-100%", "-200%"], // 6
    ["-200%", "0%", "-100%", "0%"], // 7
    ["100%", "0%", "100%", "-100%"], // 8
    ["-200%", "100%", "0%", "-100%"], // 9
    ["-100%", "100%", "100%", "0%"], // 10
    ["0%", "100%", "0%", "-200%"], // 11
    ["100%", "100%", "-100%", "-100%"], // 12
  ];

  let t = 0;

  function update() {
    blocks.forEach((b, i) => {
      const [sx, sy, ex, ey] = pos[i];
      b.style.transform = `translate3D(calc(${sx} + ${t} * (${ex} - ${sx})), calc(${sy} + ${t} * (${ey} - ${sy})), -100px)`;
    });
  }

  function scroll() {
    const y = window.scrollY;
    if (y <= s) t = 0;
    else if (y >= eFast) t = 1;
    else t = (y - s) / (eFast - s);
    update();
  }

  update();
  window.addEventListener("scroll", scroll, { passive: true });
}
function addScrollHandler() {
  const navHeight = document.querySelector(".navigation").offsetHeight;
  function handleScroll(selector) {
    document.querySelectorAll(selector).forEach((container) => {
      container.addEventListener("click", (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          const targetPosition =
            target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: targetPosition });
        }
      });
    });
  }
  handleScroll(".navigation");
  handleScroll(".watchlist_movie_list");
}

document.addEventListener("DOMContentLoaded", () => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }

  const seenSet = new Set(
    JSON.parse(localStorage.getItem("movieWatchlist"))?.seen || []
  );
  const wantSet = new Set(
    JSON.parse(localStorage.getItem("movieWatchlist"))?.want || []
  );
  const sortedFilms = Object.values(films)
    .sort((a, b) => a.place - b.place)
    .reverse();

  function createWatchlistContainers() {
    const template = document.querySelector(".watchlist_container");

    [
      ["have_watched_container", "have_watched_container"],
      ["want_to_watch_container", "want_to_watch_container"],
    ].forEach(([id, cls]) => {
      const clone = template.cloneNode(true);
      clone.id = id;
      clone.classList.add(cls);
      document.querySelector(".watchlist_containers").append(clone);
    });

    template.remove();
  }
  const watchlistTitles = {
    seen: document.querySelector(".navigation_watchlist p:first-child")
      .textContent,
    want: document.querySelector(".navigation_watchlist p:nth-child(2)")
      .textContent,
  };

  renderHeader();
  initHeaderScroll();
  updateNavigationPlaces();
  renderMovies();
  createWatchlistContainers();
  updateWatchlist();
  updateWatchlistCounts();
  addScrollHandler();

  function updateNavigationPlaces() {
    const container = document.querySelector(".navigation_places");
    let html = "";

    for (let i = Math.floor(sortedFilms.length / 5) * 5; i >= 5; i -= 5) {
      html += `<a href="#movie-${i}">${i}</a>`;
    }

    container.innerHTML = html;
  }

  function updateWatchlistCounts() {
    const haveNum = document.querySelector(
      ".navigation_watchlist p:first-child .num"
    );
    const wantNum = document.querySelector(
      ".navigation_watchlist p:nth-child(2) .num"
    );

    if (!haveNum || !wantNum) return;

    const tasks = [
      { elem: haveNum, value: seenSet.size },
      { elem: wantNum, value: wantSet.size },
    ];

    tasks.forEach(({ elem, value }) => {
      if (elem.textContent !== String(value)) {
        elem.classList.add("fade-out");
        setTimeout(() => {
          elem.textContent = value;
          elem.classList.remove("fade-out");
        }, 200);
      }
    });
  }

  function renderMovies() {
    const container = document.querySelector(".all_movies");
    container.innerHTML = "";

    function createMovieItem(film) {
      const template = document.getElementById("movie-template").content;
      const clone = document.importNode(template, true);
      const item = clone.querySelector(".movie_item");
      item.id = `movie-${film.place}`;

      const video = clone.querySelector(".movie_video");
      const cleaned = VideoUtils.cleanName(film.original);
      video.poster = VideoUtils.getPoster(film.original);

      ["mobile", "desktop"].forEach((type) => {
        const source = document.createElement("source");
        source.src = `${basicLink}video/${type}/${cleaned}.mp4`;
        source.type = "video/mp4";
        source.media =
          type === "mobile" ? "(max-width: 500px)" : "(min-width: 501px)";
        video.appendChild(source);
      });

      video.src = `${basicLink}video/desktop/${cleaned}.mp4`;

      video.addEventListener("loadedmetadata", () => {
        video.style.opacity = "1";
      });

      clone.querySelector(".movie_place").textContent = film.place;
      clone.querySelector(".movie_name").textContent = film.title;
      clone.querySelector(
        ".movie_director_and_year"
      ).textContent = `${film.director}, ${film.year}`;
      clone.querySelector(".movie_opinion").textContent = film.opinion;
      clone.querySelector(
        ".movie_link"
      ).textContent = `“${film.title}” на Кинопоиске`;
      clone.querySelector(".movie_link").href = film.link;

      const quotesContainer = clone.querySelector(".movie_quotes");
      if (film.quote && film.quote.length > 0) {
        quotesContainer.innerHTML = film.quote
          .map(
            (q) => `
            <div class="movie_quote">
                <p>“${q.quote}”</p>
                <p>${q.who}</p>
            </div>
        `
          )
          .join("");
      } else {
        quotesContainer.remove();
      }

      const poster = clone.querySelector(".saving_poster");
      poster.src = VideoUtils.getCover(film.original);
      poster.alt = film.title;
      poster.addEventListener("load", () => {
        poster.style.opacity = "1";
      });

      const seenCheckbox = clone.querySelector('input[name="already-seen"]');
      const wantCheckbox = clone.querySelector('input[name="want-to-watch"]');

      seenCheckbox.checked = seenSet.has(film.place);
      wantCheckbox.checked = wantSet.has(film.place);

      seenCheckbox.onchange = () =>
        toggleMovie(film.place, "seen", seenCheckbox.checked);
      wantCheckbox.onchange = () =>
        toggleMovie(film.place, "want", wantCheckbox.checked);

      return clone;
    }

    sortedFilms.forEach((film) => {
      const item = createMovieItem(film);
      container.appendChild(item);
    });
  }

  function toggleMovie(place, type, checked) {
    const item = document.getElementById(`movie-${place}`);
    const seenCheck = item.querySelector('input[name="already-seen"]');
    const wantCheck = item.querySelector('input[name="want-to-watch"]');

    if (type === "seen" && checked) {
      wantSet.delete(place);
      wantCheck.checked = false;
    }
    if (type === "want" && checked) {
      seenSet.delete(place);
      seenCheck.checked = false;
    }

    checked
      ? type === "seen"
        ? seenSet.add(place)
        : wantSet.add(place)
      : type === "seen"
      ? seenSet.delete(place)
      : wantSet.delete(place);

    updateWatchlist();
    updateWatchlistCounts();
    localStorage.setItem(
      "movieWatchlist",
      JSON.stringify({ seen: [...seenSet], want: [...wantSet] })
    );
  }

  function updateWatchlist() {
    updateContainer("have_watched_container", seenSet, watchlistTitles.seen);
    updateContainer("want_to_watch_container", wantSet, watchlistTitles.want);
  }

  function getBaseWidth(size) {
    const widthMap = {
      91: 29,
      74: 32,
      58: 36,
      37: 40,
      31: 50,
      26: 56,
      21: 60,
      17: 64,
      13: 80,
      10: 84,
      7: 100,
      5: 110,
      3: 150,
    };

    const sortedKeys = Object.keys(widthMap)
      .map(Number)
      .sort((a, b) => b - a);

    for (const key of sortedKeys) {
      if (size >= key) return widthMap[key];
    }

    return 160;
  }
  function calculateDimensions(size, screenWidth) {
    const baseWidth = getBaseWidth(size);
    const reduction = screenWidth < 415 ? (415 - screenWidth) * 0.00241 : 0;

    return {
      imgWidth: baseWidth * (1 - reduction),
      scale: 1 - reduction,
    };
  }

  function createScreenshot(element, width, height) {
    const clone = element.cloneNode(true);
    clone.style.backgroundColor = getComputedStyle(element).backgroundColor;
    clone.style.transform = "none";
    clone.style.boxSizing = "border-box";
    clone.style.margin = "0";
    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.width = `${width}px`;
    clone.style.maxWidth = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.padding = `290px 125px`;

    const subtitle = clone.querySelector(".watchlist_subtitle");
    subtitle.style.fontSize = `79px`;

    const title = clone.querySelector(".watchlist_title");
    title.style.fontSize = `232px`;
    title.style.marginBottom = `160px`;

    const logo = clone.querySelector(".watchlist_logo");
    logo.style.height = `230px`;
    logo.style.width = `auto`;
    logo.style.bottom = "145px";
    logo.style.right = "145px";

    const posters = clone.querySelector(".watchlist_posters");
    const originalPosters = element.querySelector(".watchlist_posters");
    const size = posters.querySelectorAll("img").length;
    posters.style.height = `78.65%`;
    posters.style.gap = `30px`;
    posters.innerHTML = "";
    originalPosters.querySelectorAll("img").forEach((originalImg, index) => {
      const newImg = document.createElement("img");
      newImg.src = originalImg.src.replace(
        "posters/",
        `sizes/${getBaseWidth(size) * 6}/`
      );
      newImg.style.width = `${getBaseWidth(size) * 6}px`;
      newImg.style.borderRadius = `20px`;
      newImg.style.opacity = `1`;
      newImg.style.objectFit = "contain";
      posters.appendChild(newImg);
    });

    document.body.appendChild(clone);
    return clone;
  }

  function updateContainer(id, set, title) {
    const container = document.getElementById(id);
    const wrapper = container.querySelector(".watchlist_wrapper");
    const button = container.querySelector(".copy-button");
    const list = container.querySelector(".watchlist_movie_list");
    const screenWidth = window.innerWidth;
    const { imgWidth, scale } = calculateDimensions(set.size, screenWidth);
    const headerTitle = document.querySelector(".header_title").innerText;
    const wrapperLogo = `${basicLink}images/letter.png`;
    if (!set.size) {
      const message =
        emptyMessages[
          id === "have_watched_container" ? "have_watched" : "want_to_watch"
        ];
      wrapper.innerHTML = `
      <div class="watchlist_empty_messages">
      <p class="watchlist_title">${message.first}</p>
            <p class="watchlist_ps">${message.second}</p>
            <img class="watchlist_logo" src="${wrapperLogo}"/>
            </div>
        `;
      list.innerHTML = "";
      button.disabled = true;
      return;
    }

    const totalFilms = sortedFilms.length;
    const newTitle =
      set.size === totalFilms
        ? id === "have_watched_container"
          ? watchlistTitles.seen + " все"
          : watchlistTitles.want + " все"
        : title;

    wrapper.innerHTML = `
        <h4 class="watchlist_subtitle">${headerTitle}</h4>
        <p class="watchlist_title">${newTitle}&nbsp;${set.size}.</p>
        <div class="watchlist_posters"></div>
        <img class="watchlist_logo" src="${wrapperLogo}"/>
    `;
    const posters = container.querySelector(".watchlist_posters");

    if (posters) {
      posters.style.setProperty("--img-width", `${imgWidth}px`);
      wrapper.style.transform = `scale(${scale})`;

      posters.innerHTML = [...set]
        .map((place) => {
          const film = sortedFilms.find((f) => f.place === place);
          return `<img src="${VideoUtils.getCover(film.original)}" alt="${
            film.title
          }" crossorigin="anonymous">`;
        })
        .join("");

      posters.querySelectorAll("img").forEach((img) => {
        img.addEventListener("load", () => {
          img.style.opacity = "1";
        });
      });
    }

    list.innerHTML = [...set]
      .map((place) => {
        const film = sortedFilms.find((f) => f.place === place);
        return `<a href="#movie-${place}">${film.title}</a>`;
      })
      .join(" ● ");

    button.disabled = false;
    const originalText = button.textContent;
    const screenshotSize = { width: 2491, height: 4428 };

    button.onclick = async () => {
      try {
        if (button.disabled) return;

        button.textContent = "Загрузка...";
        button.disabled = true;

        const clone = createScreenshot(
          wrapper,
          screenshotSize.width,
          screenshotSize.height
        );

        await new Promise((resolve) => {
          clone.querySelectorAll("img").forEach((img) => {
            img.onload = () => {
              resolve();
            };
          });
        });

        try {
          const canvas = await html2canvas(clone, {
            width: screenshotSize.width,
            height: screenshotSize.height,
            logging: false,
            useCORS: true,
          });

          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/jpeg", 1.0);
          link.download = "watchlist.jpg";
          link.click();

          document.body.removeChild(clone);
        } finally {
          button.textContent = originalText;
          button.disabled = false;
        }
      } catch (error) {
        console.error("Ошибка при создании скриншота:", error);
        alert("Произошла ошибка при создании скриншота");
      }
    };
  }

  window.addEventListener("resize", () => {
    const screenWidth = window.innerWidth;

    ["have_watched_container", "want_to_watch_container"].forEach((id) => {
      const container = document.getElementById(id);
      if (!container) return;

      const wrapper = container.querySelector(".watchlist_wrapper");
      const posters = container.querySelector(".watchlist_posters");
      const set = id === "have_watched_container" ? seenSet : wantSet;
      const size = set.size;

      const { imgWidth, scale } = calculateDimensions(size, screenWidth);

      if (posters) {
        posters.style.setProperty("--img-width", `${imgWidth}px`);
      }

      wrapper.style.transform = `scale(${scale})`;
    });
  });

  document.querySelector(".navigation") &&
    (() => {
      const nav = document.querySelector(".navigation");

      const checkPos = () =>
        nav.classList.toggle("open", nav.getBoundingClientRect().top <= 0);

      checkPos();
      window.addEventListener("scroll", checkPos);
      window.addEventListener("resize", checkPos);
    })();
});
