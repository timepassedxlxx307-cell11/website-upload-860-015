(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q'], input[type='search']");
                var target = form.getAttribute("data-search-path") || form.getAttribute("action") || "search.html";
                var query = input ? input.value.trim() : "";
                window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
            });
        });
    }

    function setupHeroSlider() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (slides.length <= 1) {
            return;
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function setupPageFilter() {
        var input = document.querySelector("[data-page-filter]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var clearButton = document.querySelector("[data-clear-filter]");
        var count = document.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        if (!input || !cards.length) {
            return;
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-category"),
                card.getAttribute("data-tags")
            ].join(" "));
        }

        function applyFilter() {
            var query = normalize(input.value);
            var year = yearSelect ? yearSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = cardText(card);
                var sameYear = !year || card.getAttribute("data-year") === year;
                var matched = (!query || text.indexOf(query) !== -1) && sameYear;
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + " 部影片";
            }
        }

        input.addEventListener("input", applyFilter);
        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilter);
        }
        if (clearButton) {
            clearButton.addEventListener("click", function () {
                input.value = "";
                if (yearSelect) {
                    yearSelect.value = "";
                }
                applyFilter();
            });
        }
        applyFilter();
    }

    function setupSearchPage() {
        var resultsRoot = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        var input = document.querySelector("[data-search-input]");
        var data = window.MOVIE_SEARCH_INDEX || [];
        if (!resultsRoot || !summary || !data.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }

        function render(items, label) {
            resultsRoot.innerHTML = items.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '  <a class="card-poster" href="' + movie.href + '">',
                    '    <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '    <span class="card-play">▶</span>',
                    '    <span class="card-category">' + escapeHtml(movie.category) + '</span>',
                    '    <span class="card-duration">' + escapeHtml(movie.duration) + '</span>',
                    '  </a>',
                    '  <div class="card-body">',
                    '    <h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>',
                    '    <p>' + escapeHtml(movie.description) + '</p>',
                    '    <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                    '    <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
                    '  </div>',
                    '</article>'
                ].join("");
            }).join("");
            summary.textContent = label;
        }

        var normalizedQuery = normalize(query);
        if (!normalizedQuery) {
            render(data.slice(0, 48), "默认展示 48 部推荐影片，可输入关键词搜索全部片库。");
            return;
        }

        var terms = normalizedQuery.split(/\s+/).filter(Boolean);
        var matched = data.filter(function (movie) {
            var text = normalize(movie.search);
            return terms.every(function (term) {
                return text.indexOf(term) !== -1;
            });
        });
        render(matched.slice(0, 240), "“" + query + "” 找到 " + matched.length + " 部影片" + (matched.length > 240 ? "，当前展示前 240 部。" : "。"));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupPlayer() {
        var video = document.querySelector("video[data-hls-src]");
        var button = document.querySelector("[data-player-start]");
        var message = document.querySelector("[data-player-message]");
        if (!video) {
            return;
        }

        var hlsInstance = null;
        var initialized = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function initialize() {
            if (initialized) {
                return Promise.resolve();
            }
            initialized = true;
            var source = video.getAttribute("data-hls-src");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                setMessage("已使用浏览器原生 HLS 能力加载播放源。");
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage("播放源加载完成，可以开始播放。");
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage("播放器遇到网络或解码问题，请刷新页面重试。");
                    }
                });
                return Promise.resolve();
            }

            video.src = source;
            setMessage("当前浏览器不支持 hls.js，已尝试直接加载 m3u8 播放源。");
            return Promise.resolve();
        }

        if (button) {
            button.addEventListener("click", function () {
                initialize().then(function () {
                    button.classList.add("is-hidden");
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            setMessage("浏览器阻止了自动播放，请再次点击播放器控件播放。");
                        });
                    }
                });
            });
        }

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        video.addEventListener("click", initialize, { once: true });
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHeroSlider();
        setupPageFilter();
        setupSearchPage();
        setupPlayer();
    });
})();
