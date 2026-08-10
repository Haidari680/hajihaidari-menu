(function () {
  "use strict";

  const box = document.createElement("div");

  box.innerHTML = `
    <div id="hh-test-panel">
      <button onclick="HHMenu.showCart()">🛒 سبد خرید</button>
      <button onclick="HHMenu.callWaiter()">🔔 فراخوان گارسون</button>
      <span>🟢 موجود</span>
      <span>🔴 تمام شد</span>
      <b>تست امکانات</b>
    </div>
  `;

  const style = document.createElement("style");

  style.textContent = `
    #hh-test-panel{
      position:fixed;
      bottom:15px;
      left:50%;
      transform:translateX(-50%);
      z-index:99999;
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
      justify-content:center;
      background:white;
      padding:10px;
      border-radius:14px;
      box-shadow:0 4px 18px #0003;
      font-family:Tahoma,Arial,sans-serif;
      direction:rtl;
    }

    #hh-test-panel button{
      border:0;
      background:#0757a8;
      color:white;
      padding:9px 13px;
      border-radius:10px;
      cursor:pointer;
      font-family:inherit;
    }

    #hh-test-panel span{
      font-size:12px;
      padding:6px 9px;
      border-radius:15px;
      background:#f1f1f1;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(box);

  let cart = JSON.parse(localStorage.getItem("hh_cart") || "[]");

  window.HHMenu = {

    showCart: function () {
      if (!cart.length) {
        alert("🛒 سبد خرید خالی است.");
        return;
      }

      let total = 0;
      let text = "🛒 سبد خرید\n\n";

      cart.forEach(item => {
        total += item.price * item.qty;
        text += `${item.name} × ${item.qty}\n`;
      });

      text += `\nمجموع: ${total.toLocaleString()} افغانی`;

      alert(text);
    },

    callWaiter: function () {
      alert("🔔 فراخوان گارسون ارسال شد.");
    }

  };

})();
