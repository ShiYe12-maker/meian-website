(function () {
  // === Intersection Observer 滚动动画 ===
  var items = document.querySelectorAll('.timeline__item');

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
    observer.observe(item);
  });
})();
