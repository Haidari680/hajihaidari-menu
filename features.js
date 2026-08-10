(function () {
  "use strict";

  const STORAGE_KEY = "hh_menu_settings";

  const defaultSettings = {
    available: true,
    daily: false,
    cart: [],
    waiterCalled: false
  };

  let settings = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "null"
  ) || defaultSettings;

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  const panel = document.createElement("div");

  panel.id = "hh-control-panel";

  panel.innerHTML = `
    <div class="hh-title">🍽️ مدیریت منو</div>

    <div class="hh-row">
      <span>وضعیت غذا</span>
      <button id="hh-stock" class="hh-switch"></button>
    </div>

    <div class="hh-row">
      <span>⭐ غذای روز</span>
      <button id="hh-daily" class="hh-switch"></button>
    </div>

    <div class="hh-actions">
      <button id="hh-cart">🛒 سبد خرید</button>
      <button id="hh-waiter">🔔 فراخوان گارسون</button>
    </div>
  `;

  const style = document.createElement("style");

  style.textContent = `
    #hh-control-panel{
      position:fixed;
      bottom:15px;
      left:50%;
      transform:translateX(-50%);
      z-index:99999;
      width:min(430px,calc(100% - 20px));
      background:#fff;
      padding:12px;
      border-radius:16px;
      box-shadow:0 5px 25px rgba(0,0,0,.20);
      font-family:Tahoma,Arial,sans-serif;
      direction:rtl;
      box-sizing:border-box;
    }

    #hh-control-panel *{
      box-sizing:border-box;
    }

    .hh-title{
      text-align:center;
      font-weight:bold;
      font-size:15px;
      margin-bottom:9px;
    }

    .hh-row{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      padding:7px 3px;
      border-bottom:1px solid #eee;
      font-size:13px;
    }

    .hh-switch{
      min-width:105px;
      border:0;
      border-radius:20px;
      padding:7px 12px;
      color:#fff;
      cursor:pointer;
      font-family:inherit;
      font-weight:bold;
    }

    .hh-actions{
      display:flex;
      gap:7px;
      margin-top:9px;
    }

    .hh-actions button{
      flex:1;
      border:0;
      border-radius:10px;
      padding:9px 6px;
      cursor:pointer;
      background:#0757a8;
      color:#fff;
      font-family:inherit;
      font-size:12px;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(panel);

  const stockButton = document.getElementById("hh-stock");
  const dailyButton = document.getElementById("hh-daily");

  function updateButtons() {

    if (settings.available) {
      stockButton.textContent = "🟢 موجود";
      stockButton.style.background = "#159447";
    } else {
      stockButton.textContent = "🔴 تمام شد";
      stockButton.style.background = "#d62828";
    }

    if (settings.daily) {
      dailyButton.textContent = "⭐ فعال";
      dailyButton.style.background = "#0757a8";
    } else {
      dailyButton.textContent = "غیرفعال";
      dailyButton.style.background = "#777";
    }
  }

  stockButton.onclick = function () {
    settings.available = !settings.available;
    save();
    updateButtons();

    alert(
      settings.available
        ? "🟢 غذا دوباره موجود شد."
        : "🔴 غذا تمام شد."
    );
  };

  dailyButton.onclick = function () {
    settings.daily = !settings.daily;
    save();
    updateButtons();

    alert(
      settings.daily
        ? "⭐ این غذا غذای روز شد."
        : "غذای روز غیرفعال شد."
    );
  };

  document.getElementById("hh-cart").onclick = function () {
    if (!settings.cart.length) {
      alert("🛒 سبد خرید خالی است.");
      return;
    }

    alert("🛒 تعداد کالاها: " + settings.cart.length);
  };

  document.getElementById("hh-waiter").onclick = function () {
    settings.waiterCalled = true;
    save();

    alert("🔔 فراخوان گارسون ارسال شد.");
  };

  updateButtons();

})();
