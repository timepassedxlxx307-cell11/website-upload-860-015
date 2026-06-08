(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var searchRoot = document.querySelector('[data-search-root]');

    if (searchRoot) {
        var input = searchRoot.querySelector('[data-search-input]');
        var typeSelect = searchRoot.querySelector('[data-type-filter]');
        var categorySelect = searchRoot.querySelector('[data-category-filter]');
        var cards = Array.prototype.slice.call(searchRoot.querySelectorAll('[data-search-card]'));

        function text(value) {
            return (value || '').toString().toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = text(input && input.value);
            var typeValue = text(typeSelect && typeSelect.value);
            var categoryValue = text(categorySelect && categorySelect.value);

            cards.forEach(function (card) {
                var haystack = text(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-summary'));
                var cardType = text(card.getAttribute('data-type'));
                var cardCategory = text(card.getAttribute('data-category'));
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var typeMatch = !typeValue || cardType === typeValue;
                var categoryMatch = !categoryValue || cardCategory === categoryValue;
                card.classList.toggle('hidden-card', !(keywordMatch && typeMatch && categoryMatch));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilters);
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', applyFilters);
        }
    }
})();
