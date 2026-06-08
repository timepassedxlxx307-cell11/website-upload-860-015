(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  document.querySelectorAll('img[data-cover]').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-hidden');
    }, { once: true });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
      dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
    });
  }

  function startSlider() {
    if (slides.length <= 1) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
      startSlider();
    });
  });

  showSlide(0);
  startSlider();

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
    var status = scope.querySelector('[data-filter-status]');
    var empty = scope.querySelector('[data-empty-state]');

    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && !input.value) {
      input.value = initial;
    }

    function applyFilter() {
      var query = normalize(input.value);
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var matched = !query || text.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });
      if (status) {
        status.textContent = query ? '已筛选 ' + shown + ' 个结果' : '输入关键词筛选片名、类型、地区与标签';
      }
      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });
})();
