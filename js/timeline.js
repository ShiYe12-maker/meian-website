(function () {
  // === 时期筛选 ===
  var filterBar = document.getElementById('timelineFilter');
  var items = document.querySelectorAll('.timeline__item');

  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-bar__btn');
      if (!btn) return;

      // 切换 active
      filterBar.querySelectorAll('.filter-bar__btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      var period = btn.dataset.period || '';
      items.forEach(function (item) {
        item.style.display = (!period || item.dataset.period === period) ? '' : 'none';
      });

      // 重新触发滚动动画
      setTimeout(updateVisibility, 100);
    });
  }

  // === Intersection Observer 滚动动画 ===
  function updateVisibility() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach(function (item) {
      if (item.style.display !== 'none') {
        observer.observe(item);
      }
    });
  }

  updateVisibility();
})();
