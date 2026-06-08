(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-key]'));
  var searchableList = document.querySelector('[data-searchable-list]');
  var noResults = document.querySelector('[data-no-results]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!searchableList) {
      return;
    }

    var query = filterInput ? normalize(filterInput.value) : '';
    var cards = Array.prototype.slice.call(searchableList.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var ok = !query || text.indexOf(query) !== -1;

      filterSelects.forEach(function (select) {
        var key = select.getAttribute('data-filter-key');
        var value = normalize(select.value);
        var target = normalize(card.getAttribute('data-' + key));
        if (value && target !== value) {
          ok = false;
        }
      });

      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');
    if (queryValue) {
      filterInput.value = queryValue;
    }
    filterInput.addEventListener('input', applyFilters);
  }

  filterSelects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  applyFilters();

  var playerShells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

  playerShells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('.player-click-layer');
    var stream = video ? video.getAttribute('data-stream') : '';
    var prepared = false;
    var hlsInstance = null;

    function prepareVideo() {
      if (!video || prepared || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      prepared = true;
    }

    function playVideo() {
      prepareVideo();
      shell.classList.add('is-playing');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!prepared) {
          playVideo();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
