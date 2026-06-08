(function () {
    const container = document.getElementById('search-results');
    const title = document.getElementById('search-title');
    const count = document.getElementById('search-count');
    const input = document.getElementById('search-page-input');

    if (!container || !Array.isArray(window.QI_MOVIES)) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const initial = (params.get('q') || '').trim();

    if (input) {
        input.value = initial;
        input.addEventListener('input', function () {
            render(input.value.trim());
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function makeCard(movie) {
        const tags = (movie.tags || []).slice(0, 5).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card" data-title="', escapeHtml(movie.title), '" data-genre="', escapeHtml(movie.genre), '" data-region="', escapeHtml(movie.region), '" data-year="', escapeHtml(movie.year), '">',
            '<a class="poster-link" href="./', escapeHtml(movie.file), '" aria-label="', escapeHtml(movie.title), '">',
            '<img src="', escapeHtml(movie.poster), '" alt="', escapeHtml(movie.title), '" loading="lazy">',
            '<span class="play-chip">立即观看</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-line"><span>', escapeHtml(movie.year), '</span><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.type), '</span></div>',
            '<h2><a href="./', escapeHtml(movie.file), '">', escapeHtml(movie.title), '</a></h2>',
            '<p>', escapeHtml(movie.oneLine), '</p>',
            '<div class="tag-row">', tags, '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function render(query) {
        const normalized = query.toLowerCase();
        const source = window.QI_MOVIES;
        const matches = normalized
            ? source.filter(function (movie) {
                return [movie.title, movie.genre, movie.region, movie.year, movie.type, (movie.tags || []).join(' ')].join(' ').toLowerCase().includes(normalized);
            })
            : source.slice(0, 80);
        const visible = matches.slice(0, 240);
        container.innerHTML = visible.map(makeCard).join('');
        if (title) {
            title.textContent = normalized ? '搜索结果' : '热门推荐';
        }
        if (count) {
            count.textContent = normalized ? '为你匹配到相关影片' : '精选片库内容';
        }
    }

    render(initial);
})();
