(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var opened = document.body.classList.toggle('is-menu-open');
        toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        toggle.textContent = opened ? '×' : '☰';
      });
    }

    document.querySelectorAll('.live-filter').forEach(function (input) {
      var targetId = input.getAttribute('data-target');
      var list = document.getElementById(targetId);
      if (!list) {
        return;
      }
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        list.querySelectorAll('.movie-card').forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region')
          ].join(' ').toLowerCase();
          card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
        });
      });
    });

    renderSearchResults();
  });

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function renderSearchResults() {
    var container = document.getElementById('search-results');
    var input = document.getElementById('site-search-input');
    if (!container || !window.KANJUBA_SEARCH_DATA) {
      return;
    }
    var initial = getQueryValue('q');
    if (input) {
      input.value = initial;
      input.addEventListener('input', function () {
        drawSearch(container, input.value);
      });
    }
    drawSearch(container, initial);
  }

  function drawSearch(container, value) {
    var keyword = String(value || '').trim().toLowerCase();
    if (!keyword) {
      container.innerHTML = '';
      return;
    }
    var words = keyword.split(/\s+/).filter(Boolean);
    var matched = window.KANJUBA_SEARCH_DATA.filter(function (item) {
      var haystack = [
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.category,
        item.oneLine
      ].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 80);
    if (!matched.length) {
      container.innerHTML = '<div class="empty-message glass-effect">未找到匹配影片，换个关键词试试</div>';
      return;
    }
    container.innerHTML = matched.map(function (item) {
      return [
        '<a class="movie-card card-hover glass-effect" href="' + escapeHtml(item.url) + '">',
        '  <div class="card-cover">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="card-region">' + escapeHtml(item.region) + '</span>',
        '    <span class="play-hover">▶</span>',
        '  </div>',
        '  <div class="card-body">',
        '    <h3>' + escapeHtml(item.title) + '</h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="card-meta">',
        '      <span>' + escapeHtml(item.type) + '</span>',
        '      <span>' + escapeHtml(item.year) + '</span>',
        '    </div>',
        '  </div>',
        '</a>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.bindMoviePlayer = function (playerId, source) {
    var video = document.getElementById(playerId);
    if (!video || !source) {
      return;
    }
    var shell = video.closest('.video-shell');
    var button = document.querySelector('[data-player="' + playerId + '"]');
    var loaded = false;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (shell) {
        shell.classList.add('is-playing');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    if (shell) {
      shell.addEventListener('click', function (event) {
        if (!loaded && event.target !== video) {
          play();
        }
      });
    }

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });
  };
})();
