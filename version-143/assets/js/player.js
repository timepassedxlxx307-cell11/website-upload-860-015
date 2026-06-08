(function () {
  function initMoviePlayer(streamUrl, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }

    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function startPlayback() {
      attachStream();
      button.classList.add("is-hidden");
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
