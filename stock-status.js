/* Haji Haidari — customer stock status layer
   Safe standalone module: does not modify the existing CSS or rebuild index.html.
   It reads the existing hh_menu_data_v1 data and only annotates matching customer-menu text.
*/
(function () {
  "use strict";

  const KEY = "hh_menu_data_v1";
  const BADGE_CLASS = "hh-customer-stock-status";

  function getFoods() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "null");
      return data && Array.isArray(data.foods) ? data.foods : [];
    } catch (_) {
      return [];
    }
  }

  function addStatus(food) {
    const name = String(food.name || "").trim();
    if (!name) return;

    const available = food.available !== false;

    document.querySelectorAll("body *").forEach(function (el) {
      if (el.closest("#hh-admin") || el.closest("#hh-open")) return;
      if (el.children.length) return;
      if (el.textContent.trim() !== name) return;
      if (el.querySelector("." + BADGE_CLASS)) return;

      const badge = document.createElement("span");
      badge.className = BADGE_CLASS;
      badge.textContent = available ? " 🟢 موجود" : " 🔴 تمام شده";
      badge.setAttribute("data-stock-for", name);
      badge.style.display = "block";
      badge.style.marginTop = "4px";
      badge.style.fontWeight = "700";
      badge.style.fontSize = "0.9em";
      badge.style.color = available ? "#159447" : "#d62828";

      el.appendChild(badge);

      if (!available) {
        const clickable = el.closest("button, a, [role='button'], .food-card, .menu-item, .item-card");
        if (clickable) {
          clickable.setAttribute("aria-disabled", "true");
          clickable.setAttribute("data-stock-disabled", "true");
          clickable.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }, true);
        }
      }
    });
  }

  function render() {
    document.querySelectorAll("." + BADGE_CLASS).forEach(function (el) {
      el.remove();
    });
    getFoods().forEach(addStatus);
  }

  function start() {
    render();
    setInterval(render, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
