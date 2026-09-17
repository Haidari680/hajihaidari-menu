(() => {
  function placeOptimizerButton() {
    const button = document.getElementById('batchImageOptimizerBtn');
    const target = document.querySelector('#app > .panel.row');
    if (!button || !target) return false;

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

  if (placeOptimizerButton()) return;

  const observer = new MutationObserver(() => {
    if (placeOptimizerButton()) observer.disconnect();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 120000);
})();
