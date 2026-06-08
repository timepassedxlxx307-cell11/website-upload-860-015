(function () {
    var video = document.getElementById('movie-player');

    if (!video) {
        return;
    }

    var sourceElement = video.querySelector('source');
    var source = sourceElement ? sourceElement.getAttribute('src') : '';
    var layer = document.querySelector('.player-start-layer');
    var button = document.querySelector('[data-play-button]');
    var hls = null;

    function attach() {
        if (!source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function hideLayer() {
        if (layer) {
            layer.classList.add('is-hidden');
        }
    }

    function start() {
        hideLayer();
        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    }

    attach();

    if (button) {
        button.addEventListener('click', start);
    }

    if (layer) {
        layer.addEventListener('click', function (event) {
            if (event.target === layer) {
                start();
            }
        });
    }

    video.addEventListener('play', hideLayer);
    window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
})();
