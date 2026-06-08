(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    setupHero();
    setupFilters();
    setupSearchPage();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));

    bars.forEach(function (bar) {
      var list = bar.parentElement.querySelector("[data-card-list]") || document;
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
      var queryInput = bar.querySelector("[data-card-filter]");
      var typeSelect = bar.querySelector("[data-type-filter]");
      var yearSelect = bar.querySelector("[data-year-filter]");

      populateSelect(typeSelect, cards, "type");
      populateSelect(yearSelect, cards, "year");

      function apply() {
        var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
        var typeValue = typeSelect ? typeSelect.value : "";
        var yearValue = yearSelect ? yearSelect.value : "";

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();

          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchedYear = !yearValue || card.getAttribute("data-year") === yearValue;
          card.hidden = !(matchedQuery && matchedType && matchedYear);
        });
      }

      [queryInput, typeSelect, yearSelect].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
    });
  }

  function populateSelect(select, cards, key) {
    if (!select || select.options.length > 1) {
      return;
    }

    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + key);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });

    values.sort().forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-form]");
    var status = document.querySelector("[data-search-status]");

    if (!results || !form || !window.SEARCH_MOVIES) {
      return;
    }

    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a href="' + escapeAttr(movie.url) + '" class="card-media" aria-label="观看' + escapeAttr(movie.title) + '">',
        '    <img src="' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
        '    <span class="card-duration">' + escapeHtml(movie.duration) + '</span>',
        '    <span class="card-play">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a class="card-title" href="' + escapeAttr(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="card-meta"><span>' + escapeHtml(movie.regionGroup) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function apply(query) {
      var value = query.trim().toLowerCase();
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.oneLine, movie.region, movie.regionGroup, movie.type, movie.year, movie.genre, movie.tags].join(" ").toLowerCase();
        return !value || haystack.indexOf(value) !== -1;
      }).slice(0, 120);

      if (status) {
        status.textContent = value ? "搜索结果：" + matched.length + " 部" : "热门推荐";
      }

      results.innerHTML = matched.map(card).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
      window.history.replaceState(null, "", url);
      apply(query);
    });

    if (initial) {
      apply(initial);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }
})();
