(function () {
  function showMessage(box, text) {
    if (!box) {
      return;
    }
    box.textContent = text;
    box.classList.add('is-visible');
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var message = player.querySelector('[data-player-message]');
    var source = player.getAttribute('data-source');
    var loaded = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return true;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        loaded = true;
        return true;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        loaded = true;
        return true;
      }
      showMessage(message, '播放暂不可用，请稍后再试');
      return false;
    }

    function play() {
      if (!attachSource()) {
        return;
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          showMessage(message, '点击播放按钮继续观看');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      play();
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
      if (message) {
        message.classList.remove('is-visible');
      }
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });

    video.addEventListener('error', function () {
      showMessage(message, '播放暂不可用，请稍后再试');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
