(function () {
  "use strict";

  // ===== Firebase Online Connection =====
  const firebaseConfig = {
    apiKey: "AIzaSyCnlFBwHhnb3VHo4-VY0SFQE3MZtNkAyfw",
    authDomain: "haji-haidari-menu.firebaseapp.com",
    projectId: "haji-haidari-menu",
    storageBucket: "haji-haidari-menu.firebasestorage.app",
    messagingSenderId: "120704162175",
    appId: "1:120704162175:web:f3350069a69c2d9b6fa24a"
  };

  let hhFirebase = null;
  let hhFirestore = null;

  async function initFirebase() {
    try {
      const appModule = await import(
        "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"
      );

      const firestoreModule = await import(
        "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
      );

      hhFirebase = appModule.initializeApp(firebaseConfig);
      hhFirestore = firestoreModule.getFirestore(hhFirebase);

      console.log("Firebase connected");
      return true;
    } catch (error) {
      console.error("Firebase connection error:", error);
      return false;
    }
  }

  initFirebase();

  // ===== Local Menu Data =====
  const KEY = "hh_menu_data_v1";

  let data =
    JSON.parse(localStorage.getItem(KEY) || "null") || {
      foods: [],
      cart: [],
      waiter: false
    };

  function save() {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  // ===== Admin Style =====
  const style = document.createElement("style");

  style.textContent = `
    #hh-admin {
      position: fixed;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      width: min(460px, calc(100% - 20px));
      max-height: 80vh;
      overflow: auto;
      background: #fff;
      color: #222;
      padding: 14px;
      border-radius: 18px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
      direction: rtl;
      font-family: Tahoma, Arial, sans-serif;
    }

    #hh-admin * {
      box-sizing: border-box;
    }

    .hh-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .hh-head strong {
      font-size: 16px;
    }

    .hh-close {
      border: 0;
      background: #eee;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
    }

    .hh-form {
      background: #f7f7f7;
      padding: 10px;
      border-radius: 12px;
      margin-bottom: 12px;
    }

    .hh-form input {
      width: 100%;
      padding: 9px;
      margin-bottom: 7px;
      border: 1px solid #ddd;
      border-radius: 9px;
      font-family: inherit;
    }

    .hh-add {
      width: 100%;
      border: 0;
      border-radius: 9px;
      padding: 10px;
      background: #0757a8;
      color: white;
      cursor: pointer;
      font-family: inherit;
      font-weight: bold;
    }

    .hh-food {
      border: 1px solid #eee;
      border-radius: 12px;
      padding: 10px;
      margin-bottom: 8px;
    }

    .hh-food-name {
      font-weight: bold;
      font-size: 14px;
    }

    .hh-price {
      color: #666;
      font-size: 12px;
      margin: 4px 0 8px;
    }

    .hh-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .hh-buttons button {
      border: 0;
      border-radius: 8px;
      padding: 7px 9px;
      cursor: pointer;
      font-family: inherit;
      font-size: 11px;
    }

    .hh-stock-on {
      background: #159447;
      color: white;
    }

    .hh-stock-off {
      background: #d62828;
      color: white;
    }

    .hh-daily {
      background: #0757a8;
      color: white;
    }

    .hh-delete {
      background: #eee;
      color: #333;
    }

    .hh-cart,
    .hh-waiter {
      width: 100%;
      border: 0;
      border-radius: 9px;
      padding: 10px;
      margin-top: 7px;
      cursor: pointer;
      font-family: inherit;
      font-weight: bold;
    }

    .hh-cart {
      background: #0757a8;
      color: white;
    }

    .hh-waiter {
      background: #159447;
      color: white;
    }

    .hh-empty {
      text-align: center;
      color: #777;
      padding: 10px;
      font-size: 12px;
    }

    #hh-open {
      position: fixed;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999998;
      border: 0;
      border-radius: 14px;
      padding: 11px 18px;
      background: #0757a8;
      color: white;
      font-family: Tahoma, Arial, sans-serif;
      cursor: pointer;
      box-shadow: 0 5px 18px rgba(0, 0, 0, 0.2);
      direction: rtl;
    }
  `;

  document.head.appendChild(style);

  // ===== Open Admin Button =====
  const openButton = document.createElement("button");
  openButton.id = "hh-open";
  openButton.textContent = "⚙️ مدیریت منو";
  document.body.appendChild(openButton);

  // ===== Admin Panel =====
  const admin = document.createElement("div");
  admin.id = "hh-admin";
  admin.style.display = "none";

  admin.innerHTML = `
    <div class="hh-head">
      <strong>🍽️ مدیریت منوی حاجی حیدری</strong>
      <button class="hh-close">✕</button>
    </div>

    <div class="hh-form">
      <input id="hh-name" placeholder="نام غذا">

      <input
        id="hh-price"
        placeholder="قیمت (افغانی)"
        inputmode="numeric"
      >

      <button class="hh-add">➕ افزودن غذا</button>
    </div>

    <div id="hh-foods"></div>

    <button class="hh-cart">🛒 سبد خرید</button>
    <button class="hh-waiter">🔔 فراخوان گارسون</button>
  `;

  document.body.appendChild(admin);

  const foodsBox = admin.querySelector("#hh-foods");
  const nameInput = admin.querySelector("#hh-name");
  const priceInput = admin.querySelector("#hh-price");

  // ===== Render Foods =====
  function renderFoods() {
    foodsBox.innerHTML = "";

    if (!data.foods.length) {
      foodsBox.innerHTML =
        `<div class="hh-empty">هنوز غذایی اضافه نشده است.</div>`;
      return;
    }

    data.foods.forEach((food, index) => {
      const item = document.createElement("div");
      item.className = "hh-food";

      item.innerHTML = `
        <div class="hh-food-name">
          ${escapeHTML(food.name)}
        </div>

        <div class="hh-price">
          ${Number(food.price || 0).toLocaleString()} افغانی
        </div>

        <div class="hh-buttons">

          <button
            class="${food.available ? "hh-stock-on" : "hh-stock-off"}"
            data-action="stock"
          >
            ${food.available ? "🟢 موجود" : "🔴 تمام شد"}
          </button>

          <button
            class="hh-daily"
            data-action="daily"
          >
            ${food.daily ? "⭐ غذای روز" : "☆ غذای روز"}
          </button>

          <button
            class="hh-delete"
            data-action="delete"
          >
            🗑️ حذف
          </button>

        </div>
      `;

      item.querySelector('[data-action="stock"]').onclick = function () {
        food.available = !food.available;
        save();
        renderFoods();
      };

      item.querySelector('[data-action="daily"]').onclick = function () {
        food.daily = !food.daily;
        save();
        renderFoods();
      };

      item.querySelector('[data-action="delete"]').onclick = function () {
        if (confirm("این غذا حذف شود؟")) {
          data.foods.splice(index, 1);
          save();
          renderFoods();
        }
      };

      foodsBox.appendChild(item);
    });
  }

  // ===== Add Food =====
  function addFood() {
    const name = nameInput.value.trim();
    const price = priceInput.value.trim();

    if (!name) {
      alert("نام غذا را وارد کنید.");
      return;
    }

    data.foods.push({
      id: Date.now(),
      name: name,
      price: price || 0,
      available: true,
      daily: false
    });

    save();

    nameInput.value = "";
    priceInput.value = "";

    renderFoods();
  }

  // ===== Escape HTML =====
  function escapeHTML(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ===== Events =====
  admin.querySelector(".hh-add").onclick = addFood;

  admin.querySelector(".hh-close").onclick = function () {
    admin.style.display = "none";
    openButton.style.display = "block";
  };

  openButton.onclick = function () {
    admin.style.display = "block";
    openButton.style.display = "none";
    renderFoods();
  };

  admin.querySelector(".hh-cart").onclick = function () {
    if (!data.cart.length) {
      alert("🛒 سبد خرید خالی است.");
      return;
    }

    alert("🛒 تعداد اقلام سبد خرید: " + data.cart.length);
  };

  admin.querySelector(".hh-waiter").onclick = function () {
    data.waiter = true;
    save();
    alert("🔔 فراخوان گارسون ارسال شد.");
  };

  // ===== Start =====
  renderFoods();
  // ===== نمایش غذای روز در صفحه مشتری =====
function showDailyFoods() {
  document.querySelectorAll(".hh-daily-badge").forEach(function (el) {
    el.remove();
  });

  const dailyFoods = data.foods.filter(function (food) {
    return food.daily === true && food.available !== false;
  });

  if (!dailyFoods.length) return;

  const names = dailyFoods.map(function (food) {
    return String(food.name || "").trim();
  });

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );

  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach(function (node) {
    const parent = node.parentElement;

    if (!parent) return;
    if (parent.closest("#hh-admin")) return;
    if (parent.closest(".hh-daily-badge")) return;

    const text = node.textContent.trim();

    names.forEach(function (name) {
      if (!name) return;

      if (text === name) {
        const badge = document.createElement("span");

        badge.className = "hh-daily-badge";
        badge.textContent = " ⭐ غذای روز";

        badge.style.display = "inline-block";
        badge.style.marginRight = "8px";
        badge.style.fontWeight = "bold";
        badge.style.fontSize = "14px";
        badge.style.color = "#d99b00";
        badge.style.whiteSpace = "nowrap";

        parent.appendChild(badge);
      }
    });
  });
}

setTimeout(showDailyFoods, 1000);
// ===== اتصال مدیریت غذا به منوی اصلی =====
function syncFoodsToMainMenu() {
  try {
    const adminData =
      JSON.parse(localStorage.getItem("hh_menu_data_v1") || "null");

    if (!adminData || !Array.isArray(adminData.foods)) return;

    const mainData =
      JSON.parse(localStorage.getItem("hajihaidariMenu") || "null");

    if (!mainData || !Array.isArray(mainData.items)) return;

    adminData.foods.forEach(function (food) {

      const existing = mainData.items.find(function (item) {
        return String(item.id) === String(food.id);
      });

      if (existing) {
        existing.name = food.name;
        existing.price = Number(food.price || 0);
        existing.daily = food.daily === true;
        existing.available = food.available !== false;
        return;
      }

      mainData.items.push({
        id: food.id,
        category: 1,
        name: food.name,
        price: Number(food.price || 0),
        oldPrice: 0,
        image: "",
        description: "",
        daily: food.daily === true,
        rating: 0,
        available: food.available !== false
      });
    });

    localStorage.setItem(
      "hajihaidariMenu",
      JSON.stringify(mainData)
    );

    if (typeof window.renderMenu === "function") {
      window.renderMenu();
    }

    if (typeof window.renderDaily === "function") {
      window.renderDaily();
    }

  } catch (error) {
    console.error("HH menu sync error:", error);
  }
}

// بعد از تغییر مدیریت، منوی اصلی را هم تازه کن
setInterval(syncFoodsToMainMenu, 700);
  // ===== نمایش غذاهای مدیریت در منوی اصلی =====
function HH_showManagedFoods() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("hh_menu_data_v1") || "null"
    );

    if (!saved || !Array.isArray(saved.foods)) return;

    saved.foods.forEach(function (food) {
      if (!food || !food.name) return;

      // اگر قبلاً نمایش داده شده، دوباره نساز
      if (
        document.querySelector(
          '[data-hh-food-id="' + String(food.id) + '"]'
        )
      ) {
        return;
      }

      // پیدا کردن عنوان بخش کباب
      const headings = Array.from(
        document.querySelectorAll("h1,h2,h3,h4,h5,div")
      );

      const kebabTitle = headings.find(function (el) {
        return el.textContent.trim() === "کباب";
      });

      if (!kebabTitle) return;

      // پیدا کردن نزدیک‌ترین محل مناسب برای کارت غذا
      let container =
        kebabTitle.parentElement ||
        kebabTitle.closest("section") ||
        kebabTitle.parentElement;

      if (!container) return;

      const card = document.createElement("div");

      card.setAttribute("data-hh-food-id", String(food.id));

      card.style.cssText = `
        background:#fff;
        border-radius:16px;
        padding:16px;
        margin:10px 0;
        direction:rtl;
        text-align:right;
        box-shadow:0 3px 12px rgba(0,0,0,.12);
        border:1px solid #eee;
      `;

      card.innerHTML = `
        <div style="font-size:18px;font-weight:bold;color:#071f49;">
          ${HH_escape(food.name)}
        </div>

        <div style="margin-top:8px;font-weight:bold;color:#c89400;">
          ${Number(food.price || 0).toLocaleString("fa-IR")} افغانی
        </div>

        <div style="
          margin-top:6px;
          font-size:13px;
          color:${food.available === false ? "#d62828" : "#159447"};
        ">
          ${food.available === false ? "🔴 تمام شده" : "🟢 موجود"}
        </div>
      `;

      container.appendChild(card);
    });
  } catch (e) {
    console.error("HH menu display error:", e);
  }
}

function HH_escape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// بعد از بارگذاری صفحه
setTimeout(HH_showManagedFoods, 1500);

// وقتی مدیریت غذا تغییر کرد، دوباره بررسی کن
setInterval(HH_showManagedFoods, 2000);
  })();
