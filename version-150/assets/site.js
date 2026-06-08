(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var isOpen = panel.hasAttribute("hidden") === false;
      if (isOpen) {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      } else {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      }
    });
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupPlayer() {
    var configElement = document.getElementById("movie-player-config");
    var video = document.getElementById("movie-video");
    if (!configElement || !video) {
      return;
    }
    var frame = video.closest(".player-frame");
    var button = frame ? frame.querySelector(".player-overlay") : null;
    var config;
    try {
      config = JSON.parse(configElement.textContent || "{}");
    } catch (error) {
      config = {};
    }
    var address = config.video;
    if (!address) {
      return;
    }
    var loader = window.Hls;
    if (loader && loader.isSupported && loader.isSupported()) {
      var stream = new loader({
        enableWorker: true,
        lowLatencyMode: true
      });
      stream.loadSource(address);
      stream.attachMedia(video);
      if (loader.Events && loader.Events.ERROR) {
        stream.on(loader.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (loader.ErrorTypes && data.type === loader.ErrorTypes.MEDIA_ERROR) {
            stream.recoverMediaError();
          } else {
            stream.destroy();
          }
        });
      }
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = address;
    } else {
      video.src = address;
    }

    function markPlaying(isPlaying) {
      if (frame) {
        frame.classList.toggle("is-playing", isPlaying);
      }
    }

    function play() {
      var action = video.play();
      markPlaying(true);
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          markPlaying(false);
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("play", function () {
      markPlaying(true);
    });
    video.addEventListener("pause", function () {
      markPlaying(false);
    });
    video.addEventListener("ended", function () {
      markPlaying(false);
    });
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function card(movie) {
    return [
      '<article class="movie-card card-hover glass-effect">',
      '<a class="card-cover" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<img class="poster-image" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="card-play">▶</span>',
      '<span class="card-badge">' + escapeHtml(movie.region) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.genre) + '</span>',
      '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearch() {
    var target = document.getElementById("search-results");
    if (!target || !window.movieSearchData) {
      return;
    }
    var title = document.getElementById("search-title");
    var query = (params().get("q") || "").trim().toLowerCase();
    var category = (params().get("category") || "").trim();
    var data = window.movieSearchData.slice();
    if (query) {
      data = data.filter(function (movie) {
        var haystack = [movie.title, movie.oneLine, movie.genre, movie.region, movie.type, movie.year, movie.tags].join(" ").toLowerCase();
        return haystack.indexOf(query) !== -1;
      });
    }
    if (category) {
      data = data.filter(function (movie) {
        return movie.category === category || movie.genre.indexOf(category) !== -1 || movie.tags.indexOf(category) !== -1;
      });
    }
    if (!query && !category) {
      data = data.slice(0, 96);
      if (title) {
        title.textContent = "热门影视推荐";
      }
    } else if (title) {
      title.textContent = query ? '搜索结果：“' + params().get("q") + '”' : category;
    }
    if (!data.length) {
      target.innerHTML = '<div class="glass-effect page-hero"><h2>未找到相关影片</h2><p>可以尝试更换片名、题材、地区或标签继续搜索。</p></div>';
      return;
    }
    target.innerHTML = data.slice(0, 240).map(card).join('');
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupPlayer();
    setupSearch();
  });
}());
