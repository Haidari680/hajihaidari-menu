(function () {
  "use strict";
  window.HH_FEATURES = window.HH_FEATURES || {};

  window.selectCategory = function (category) {
    window.dispatchEvent(new CustomEvent("hh:category-change", { detail: { category: category } }));
    if (typeof window.renderMenu === "function") window.renderMenu(category);
  };

  const API = "https://bjpascssizuskiujnzvf.supabase.co/rest/v1/";
  const KEY = "sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvrK";
  const headers = { apikey: KEY, Authorization: "Bearer " + KEY };
  const foodByName = new Map();
  const pizzaByFood = new Map();
  let loaded = false;

  function fa(n) { return Number(n || 0).toLocaleString("fa-AF"); }
  function safe(v) { return String(v ?? "").replace(/[&<>\"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }

  async function loadPizzaData() {
    if (loaded) return;
    try {
      const [foodsRes, sizesRes] = await Promise.all([
        fetch(API + "foods?select=id,name,category_id", { headers }),
        fetch(API + "pizza_sizes?select=food_id,one_price,two_price,family_price", { headers })
      ]);
      if (!foodsRes.ok || !sizesRes.ok) return;
      const foods = await foodsRes.json();
      const sizes = await sizesRes.json();
      foods.forEach(f => foodByName.set(String(f.name || "").trim(), String(f.id)));
      sizes.forEach(p => pizzaByFood.set(String(p.food_id), p));
      loaded = true;
      decorate();
    } catch (e) { console.warn("Pizza price load failed", e); }
  }

  function decorate() {
    document.querySelectorAll("#grid .card").forEach(card => {
      if (card.querySelector(".hh-pizza-sizes")) return;
      const title = card.querySelector("h3,h2,.name,.food-name");
      if (!title) return;
      const id = card.dataset.foodId || card.dataset.id || foodByName.get(title.textContent.trim());
      const p = pizzaByFood.get(String(id || ""));
      if (!p) return;

      const options = [
        ["یک‌نفره", p.one_price],
        ["دو‌نفره", p.two_price],
        ["خانواده", p.family_price]
      ].filter(x => x[1] !== null && x[1] !== undefined && x[1] !== "");
      if (!options.length) return;

      const body = card.querySelector(".body") || card;
      const row = body.querySelector(".row");
      const box = document.createElement("div");
      box.className = "hh-pizza-sizes";
      box.innerHTML = '<div class="hh-pizza-label">🍕 اندازه و قیمت</div>' + options.map((x, i) =>
        '<button type="button" class="hh-pizza-size' + (i === 0 ? ' active' : '') + '" data-price="' + safe(x[1]) + '" data-size="' + safe(x[0]) + '">' + safe(x[0]) + '<strong>' + fa(x[1]) + ' افغانی</strong></button>'
      ).join("");
      if (row) body.insertBefore(box, row); else body.appendChild(box);

      const price = body.querySelector(".price");
      const add = body.querySelector(".add");
      if (price) price.innerHTML = fa(options[0][1]) + " افغانی";
      if (add) { add.dataset.pizzaSize = options[0][0]; add.dataset.pizzaPrice = options[0][1]; }

      box.addEventListener("click", e => {
        const b = e.target.closest(".hh-pizza-size");
        if (!b) return;
        box.querySelectorAll(".hh-pizza-size").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        if (price) price.innerHTML = fa(b.dataset.price) + " افغانی";
        if (add) { add.dataset.pizzaSize = b.dataset.size; add.dataset.pizzaPrice = b.dataset.price; }
      });
    });
  }

  const style = document.createElement("style");
  style.textContent = ".hh-pizza-sizes{margin-top:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.hh-pizza-label{grid-column:1/-1;color:#f5d27a;font-size:12px;font-weight:900}.hh-pizza-size{border:1px solid #53617a;background:#06152f;color:#eee;border-radius:9px;padding:6px 3px;font-size:10px}.hh-pizza-size strong{display:block;color:#f5d27a;font-size:10px;margin-top:3px}.hh-pizza-size.active{border-color:#f5d27a;background:#183253}@media(max-width:430px){.hh-pizza-size{font-size:9px;padding:5px 2px}.hh-pizza-size strong{font-size:9px}}";
  document.head.appendChild(style);

  const observer = new MutationObserver(() => decorate());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  loadPizzaData();
  window.addEventListener("load", loadPizzaData);
})();
