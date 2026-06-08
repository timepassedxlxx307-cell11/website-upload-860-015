(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('form[action$="search.html"]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            const input = form.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';
            if (!value) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const prev = document.querySelector('.hero-prev');
    const next = document.querySelector('.hero-next');
    let active = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === active);
        });
    }

    function nextSlide() {
        showSlide(active + 1);
    }

    function startTimer() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(nextSlide, 5200);
    }

    function resetTimer() {
        if (timer) {
            window.clearInterval(timer);
        }
        startTimer();
    }

    if (slides.length) {
        showSlide(0);
        startTimer();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(active - 1);
            resetTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(active + 1);
            resetTimer();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            resetTimer();
        });
    });

    document.querySelectorAll('.filter-input').forEach(function (input) {
        const target = input.getAttribute('data-target');
        const root = target ? document.querySelector(target) : document;
        if (!root) {
            return;
        }
        input.addEventListener('input', function () {
            const value = input.value.trim().toLowerCase();
            root.querySelectorAll('.movie-card').forEach(function (card) {
                const haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                card.classList.toggle('hidden', value && !haystack.includes(value));
            });
        });
    });
})();
