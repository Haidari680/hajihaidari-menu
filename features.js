(function () {
  "use strict";

  // دسته‌بندی‌های اصلی منوی حاجی حیدری
  const HH_CATEGORIES = [
    "کباب",
    "پیتزا",
    "غذا",
    "آبمیوه",
    "نوشیدنی سرد",
    "سینی ها",
    "مخصوص ها",
    "ساده ها"
  ];

  // داده مدیریت؛ منطق موجود/تمام‌شده حفظ می‌شود.
  const KEY = "hh_menu_data_v1";
  let data = JSON.parse(localStorage.getItem(KEY) || "null") || {
    foods: [], cart: [], waiter: false
  };

  function save() {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  // دسته‌بندی را روی آیتم‌های مدیریت‌شده نگه می‌دارد.
  // برای آیتم‌های قدیمی، دستهٔ پیش‌فرض کباب است تا رفتار قبلی نشکند.
  data.foods.forEach(function (food) {
    if (!Number.isInteger(food.categoryIndex) || food.categoryIndex < 0 || food.categoryIndex >= HH_CATEGORIES.length) {
      food.categoryIndex = 0;
    }
  });
  save();

  // اتصال واقعی نقاط کلیک موجود در تصویر به فیلتر دسته‌بندی.
  // نقاط .hot که href/hash دارند از همان hash استفاده می‌کنند؛ اگر hash نام دسته باشد، فیلتر می‌شود.
  function normalize(value) {
    return String(value || "")
      .replace(/^#/, "")
      .replace(/[ـ\s]+/g, "")
      .trim();
  }

  function categoryIndexFrom(value) {
    const v = normalize(value);
    return HH_CATEGORIES.findIndex(function (name) {
      return normalize(name) === v;
    });
  }

  function filterCategory(index) {
    if (index < 0 || index >= HH_CATEGORIES.length) return;
    window.hhActiveCategory = index;

    // اگر منوی اصلی تابع رندر دارد، از آن استفاده کن.
    if (typeof window.renderMenu === "function") {
      try { window.renderMenu(index); return; } catch (_) {}
    }

    // پشتیبانی از ساختارهای رایج پروژه بدون دست‌زدن به تصویر اصلی.
    document.querySelectorAll("[data-category], [data-cat]").forEach(function (el) {
      const raw = el.getAttribute("data-category") ?? el.getAttribute("data-cat");
      const i = categoryIndexFrom(raw);
      if (i >= 0) el.style.display = i === index ? "" : "none";
    });
  }

  function wireCategoryClicks() {
    document.querySelectorAll(".hot").forEach(function (el) {
      const raw =
        el.getAttribute("data-category") ||
        el.getAttribute("data-cat") ||
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.getAttribute("href");
      const index = categoryIndexFrom(raw);
      if (index < 0) return;

      el.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        filterCategory(index);
      };
    });
  }

  // دسته‌بندی‌های متنی/دکمه‌ای موجود را هم وصل کن.
  function wireTextCategories() {
    document.querySelectorAll("button, a, [role='button']").forEach(function (el) {
      if (el.closest("#hh-admin")) return;
      const index = categoryIndexFrom(el.textContent);
      if (index < 0) return;
      if (el.dataset.hhCategoryBound === "1") return;
      el.dataset.hhCategoryBound = "1";
      el.addEventListener("click", function (event) {
        event.preventDefault();
        filterCategory(index);
      });
    });
  }

  wireCategoryClicks();
  wireTextCategories();

  // اگر تصویر/منو کمی دیرتر ساخته شد، اتصال را دوباره انجام بده؛ بدون تغییر ظاهر.
  const observer = new MutationObserver(function () {
    wireCategoryClicks();
    wireTextCategories();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // ===== مدیریت منو =====
  const style = document.createElement("style");
  style.textContent = `
    #hh-admin{position:fixed;bottom:15px;left:50%;transform:translateX(-50%);z-index:999999;width:min(460px,calc(100% - 20px));max-height:80vh;overflow:auto;background:#fff;color:#222;padding:14px;border-radius:18px;box-shadow:0 8px 30px rgba(0,0,0,.25);direction:rtl;font-family:Tahoma,Arial,sans-serif}
    #hh-admin *{box-sizing:border-box}.hh-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.hh-close{border:0;background:#eee;border-radius:50%;width:30px;height:30px;cursor:pointer}.hh-form{background:#f7f7f7;padding:10px;border-radius:12px;margin-bottom:12px}.hh-form input{width:100%;padding:9px;margin-bottom:7px;border:1px solid #ddd;border-radius:9px;font-family:inherit}.hh-add{width:100%;border:0;border-radius:9px;padding:10px;background:#0757a8;color:white;cursor:pointer;font-family:inherit;font-weight:bold}.hh-food{border:1px solid #eee;border-radius:12px;padding:10px;margin-bottom:8px}.hh-buttons{display:flex;gap:6px;flex-wrap:wrap}.hh-buttons button{border:0;border-radius:8px;padding:7px 9px;cursor:pointer;font-family:inherit;font-size:11px}.hh-stock-on{background:#159447;color:white}.hh-stock-off{background:#d62828;color:white}.hh-daily{background:#0757a8;color:white}.hh-delete{background:#eee;color:#333}.hh-category{background:#eee;color:#222}.hh-cart,.hh-waiter{width:100%;border:0;border-radius:9px;padding:10px;margin-top:7px;cursor:pointer;font-family:inherit;font-weight:bold}.hh-cart{background:#0757a8;color:white}.hh-waiter{background:#159447;color:white}#hh-open{position:fixed;bottom:15px;left:50%;transform:translateX(-50%);z-index:999998;border:0;border-radius:14px;padding:11px 18px;background:#0757a8;color:white;font-family:Tahoma,Arial,sans-serif;cursor:pointer;box-shadow:0 5px 18px rgba(0,0,0,.2);direction:rtl}
  `;
  document.head.appendChild(style);

  const openButton=document.createElement("button");
  openButton.id="hh-open";
  openButton.textContent="⚙️ مدیریت منو";
  document.body.appendChild(openButton);

  const admin=document.createElement("div");
  admin.id="hh-admin";
  admin.style.display="none";
  admin.innerHTML=`<div class="hh-head"><strong>🍽️ مدیریت منوی حاجی حیدری</strong><button class="hh-close">✕</button></div><div class="hh-form"><input id="hh-name" placeholder="نام غذا"><input id="hh-price" placeholder="قیمت (افغانی)" inputmode="numeric"><button class="hh-add">➕ افزودن غذا</button></div><div id="hh-foods"></div><button class="hh-cart">🛒 سبد خرید</button><button class="hh-waiter">🔔 فراخوان گارسون</button>`;
  document.body.appendChild(admin);

  const foodsBox=admin.querySelector("#hh-foods"), nameInput=admin.querySelector("#hh-name"), priceInput=admin.querySelector("#hh-price");
  function escapeHTML(text){return String(text).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
  function renderFoods(){
    foodsBox.innerHTML="";
    if(!data.foods.length){foodsBox.innerHTML='<div style="text-align:center;color:#777;padding:10px">هنوز غذایی اضافه نشده است.</div>';return;}
    data.foods.forEach(function(food,index){
      const item=document.createElement("div");item.className="hh-food";
      item.innerHTML=`<div><b>${escapeHTML(food.name)}</b></div><div style="color:#666;font-size:12px;margin:4px 0 8px">${Number(food.price||0).toLocaleString()} افغانی</div><div class="hh-buttons"><button class="${food.available!==false?'hh-stock-on':'hh-stock-off'}" data-a="stock">${food.available!==false?'🟢 موجود':'🔴 تمام شد'}</button><button class="hh-daily" data-a="daily">${food.daily?'⭐ غذای روز':'☆ غذای روز'}</button><button class="hh-category" data-a="category">دسته: ${escapeHTML(HH_CATEGORIES[food.categoryIndex]||HH_CATEGORIES[0])}</button><button class="hh-delete" data-a="delete">🗑️ حذف</button></div>`;
      item.querySelector('[data-a="stock"]').onclick=function(){food.available=food.available===false;save();renderFoods();};
      item.querySelector('[data-a="daily"]').onclick=function(){food.daily=!food.daily;save();renderFoods();};
      item.querySelector('[data-a="category"]').onclick=function(){
        const next=(Number(food.categoryIndex)+1)%HH_CATEGORIES.length;food.categoryIndex=next;save();renderFoods();
      };
      item.querySelector('[data-a="delete"]').onclick=function(){if(confirm("این غذا حذف شود؟")){data.foods.splice(index,1);save();renderFoods();}};
      foodsBox.appendChild(item);
    });
  }
  admin.querySelector(".hh-add").onclick=function(){const name=nameInput.value.trim(),price=priceInput.value.trim();if(!name){alert("نام غذا را وارد کنید.");return;}data.foods.push({id:Date.now(),name:name,price:price||0,available:true,daily:false,categoryIndex:0});save();nameInput.value="";priceInput.value="";renderFoods();};
  admin.querySelector(".hh-close").onclick=function(){admin.style.display="none";openButton.style.display="block";};
  openButton.onclick=function(){admin.style.display="block";openButton.style.display="none";renderFoods();};
  admin.querySelector(".hh-cart").onclick=function(){alert(data.cart.length?"🛒 تعداد اقلام سبد خرید: "+data.cart.length:"🛒 سبد خرید خالی است.");};
  admin.querySelector(".hh-waiter").onclick=function(){data.waiter=true;save();alert("🔔 فراخوان گارسون ارسال شد.");};
})();
