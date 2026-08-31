(function () {
  "use strict";

  window.HH_FEATURES = window.HH_FEATURES || {};

  window.selectCategory = function (category) {
    window.dispatchEvent(new CustomEvent("hh:category-change", { detail: { category: category } }));
    if (typeof window.renderMenu === "function") window.renderMenu(category);
  };

  // Pizza sizes/prices: read the same pizza_sizes records used by the admin panel
  // and add the selectable prices to the customer menu without changing the core menu code.
  const SUPABASE_URL = "https://bjpascssizuskiujnzvf.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvrK";
  let pizzaSizes = new Map();
  let pizzaLoaded = false;

  function fa(n) { return Number(n || 0).toLocaleString("fa-AF"); }
  function clean(v) { return String(v || "").replace(/[&<>\"']/g, function (m) { return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]); }); }

  async function loadPizzaSizes() {
    try {
      const r = await fetch(SUPABASE_URL + "/rest/v1/pizza_sizes?select=food_id,one_price,two_price,family_price", {
        headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
      });
      if (!r.ok) return;
      const rows = await r.json();
      pizzaSizes.clear();
      rows.forEach(function (x) {
        pizzaSizes.set(String(x.food_id), x);
      });
      pizzaLoaded = true;
      decoratePizzaCards();
    } catch (e) {
      console.warn("Pizza sizes could not be loaded", e);
    }
  }

  function getFoodId(card) {
    return card.dataset.foodId || card.dataset.id || card.getAttribute("data-food-id") || "";
  }

  function getName(card) {
    const h = card.querySelector("h3,h2,.name,.food-name");
    return h ? h.textContent.trim() : "";
  }

  function findFoodIdByName(name) {
    if (!window.foods || !Array.isArray(window.foods)) return "";
    const f = window.foods.find(function (x) { return String(x.name || "").trim() === name; });
    return f ? String(f.id) : "";
  }

  function decoratePizzaCards() {
    if (!pizzaLoaded) return;
    document.querySelectorAll("#grid .card").forEach(function (card) {
      let id = getFoodId(card) || findFoodIdByName(getName(card));
      if (!id || !pizzaSizes.has(String(id))) return;
      const p = pizzaSizes.get(String(id));
      if (card.querySelector(".hh-pizza-sizes")) return;

      const options = [
        ["one", "یک‌نفره", p.one_price],
        ["two", "دو‌نفره", p.two_price],
        ["family", "خانواده", p.family_price]
      ].filter(function (x) { return x[2] !== null && x[2] !== undefined && x[2] !== ""; });
      if (!options.length) return;

      const box = document.createElement("div");
      box.className = "hh-pizza-sizes";
      box.innerHTML = '<div class="hh-pizza-label">🍕 اندازه و قیمت</div>' + options.map(function (x, i) {
        return '<button type="button" class="hh-pizza-size' + (i === 0 ? ' active' : '') + '" data-price="' + clean(x[2]) + '" data-size="' + clean(x[1]) + '">' + clean(x[1]) + '<strong>' + fa(x[2]) + ' افغانی</strong></button>';
      }).join("");

      const body = card.querySelector(".body") || card;
      const row = body.querySelector(".row");
      if (row) body.insertBefore(box, row); else body.appendChild(box);

      const price = body.querySelector(".price");
      const add = body.querySelector(".add");
      const first = options[0][2];
      if (price) price.innerHTML = fa(first) + " افغانی";

      box.addEventListener("click", function (ev) {
        const btn = ev.target.closest(".hh-pizza-size");
        if (!btn) return;
        box.querySelectorAll(".hh-pizza-size").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        if (price) price.innerHTML = fa(btn.dataset.price) + " افغانی";
        if (add) {
          add.dataset.pizzaSize = btn.dataset.size;
          add.dataset.pizzaPrice = btn.dataset.price;
        }
      });
    });
  }

  const style = document.createElement("style");
  style.textContent = ".hh-pizza-sizes{margin-top:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.hh-pizza-label{grid-column:1/-1;color:#f5d27a;font-size:12px;font-weight:900}.hh-pizza-size{border:1px solid #53617a;background:#06152f;color:#eee;border-radius:9px;padding:6px 3px;font-size:10px}.hh-pizza-size strong{display:block;color:#f5d27a;font-size:10px;margin-top:3px}.hh-pizza-size.active{border-color:#f5d27a;background:#183253}.hh-pizza-size:disabled{opacity:.5}@media(max-width:430px){.hh-pizza-size{font-size:9px;padding:5px 2px}.hh-pizza-size strong{font-size:9px}}";
  document.head.appendChild(style);

  const observer = new MutationObserver(function () { decoratePizzaCards(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("load", function () { loadPizzaSizes(); setTimeout(loadPizzaSizes, 1200); });
  setTimeout(loadPizzaSizes, 500);
})();
