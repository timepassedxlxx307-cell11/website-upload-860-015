(function () {
    const video = document.getElementById('movie-video');
    const button = document.getElementById('play-button');
    const panel = document.querySelector('.player-overlay');
    const configNode = document.getElementById('player-config');

    if (!video || !configNode) {
        return;
    }

    let config = {};
    try {
        config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
        config = {};
    }

    const source = config.source;
    let loaded = false;
    let hls = null;

    function prepare() {
        if (!source || loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function start() {
        prepare();
        if (panel) {
            panel.classList.add('hidden');
        }
        video.controls = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    if (panel) {
        panel.addEventListener('click', function (event) {
            if (event.target === panel) {
                start();
            }
        });
    }

    video.addEventListener('click', function () {
        if (!loaded) {
            start();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
})();
