(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function setupNavigation() {
        var toggle = $('[data-menu-toggle]');
        var panel = $('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHeaderSearch() {
        $all('.site-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = $('input[type="search"]', form);
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('.hero-slide', hero);
        var dots = $all('.hero-dot', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupSearchPage() {
        var page = $('[data-search-page]');
        if (!page) {
            return;
        }
        var input = $('[data-search-input]', page);
        var category = $('[data-search-category]', page);
        var year = $('[data-search-year]', page);
        var cards = $all('[data-movie-card]', page);
        var empty = $('[data-empty-state]', page);
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function filter() {
            var q = normalizeText(input ? input.value : '');
            var c = category ? category.value : '';
            var y = year ? year.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalizeText([
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.region,
                    card.dataset.type
                ].join(' '));
                var matchesQuery = !q || haystack.indexOf(q) !== -1;
                var matchesCategory = !c || card.dataset.category === c;
                var matchesYear = !y || card.dataset.year === y;
                var show = matchesQuery && matchesCategory && matchesYear;
                card.classList.toggle('hidden-card', !show);
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, category, year].forEach(function (item) {
            if (item) {
                item.addEventListener('input', filter);
                item.addEventListener('change', filter);
            }
        });
        filter();
    }

    window.initializeMoviePlayer = function (videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !source) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function play() {
            load();
            var promise = video.play();
            if (promise && typeof promise.then === 'function') {
                promise.then(function () {
                    overlay.classList.add('is-hidden');
                }).catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            } else {
                overlay.classList.add('is-hidden');
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            overlay.classList.remove('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHeaderSearch();
        setupHero();
        setupSearchPage();
    });
}());
