(() => {
  function placeOptimizerButton() {
    const button = document.getElementById('batchImageOptimizerBtn');
    if (!button) return false;

    const target = document.querySelector('#app > .panel.row');
    if (!target) return false;

    button.style.position = 'static';
    button.style.left = 'auto';
    button.style.bottom = 'auto';
    button.style.zIndex = 'auto';
    button.style.display = 'inline-block';
    button.style.visibility = 'visible';
    button.style.opacity = '1';
    button.style.margin = '0';
    button.style.order = '99';
    button.textContent = '🖼️ بهینه‌سازی عکس‌های قبلی';

    if (!target.contains(button)) target.appendChild(button);
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (placeOptimizerButton() || tries >= 30) clearInterval(timer);
  }, 300);
})();
