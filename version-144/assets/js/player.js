(function () {
  var hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
  var hlsPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = hlsUrl;
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return hlsPromise;
  }

  function attachVideo(wrapper) {
    var video = wrapper.querySelector("video");
    var overlay = wrapper.querySelector(".player-overlay");
    var url = wrapper.getAttribute("data-video-url");

    if (!video || !url) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else {
      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          wrapper.hlsInstance = hls;
        } else {
          video.src = url;
        }
      });
    }

    function playVideo() {
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    video.controls = true;
    video.addEventListener("click", toggleVideo);
    video.addEventListener("play", function () {
      wrapper.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      wrapper.classList.remove("is-playing");
    });
    video.addEventListener("ended", function () {
      wrapper.classList.remove("is-playing");
    });

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(attachVideo);
  });
})();
