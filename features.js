(function () {
  "use strict";

  window.HH_FEATURES = window.HH_FEATURES || {};

  window.selectCategory = function (category) {
    window.dispatchEvent(new CustomEvent("hh:category-change", { detail: { category: category } }));
    if (typeof window.renderMenu === "function") {
      window.renderMenu(category);
    }
  };
})();
