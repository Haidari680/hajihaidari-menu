/* امکانات مجموعه حاجی حیدری
   فقط دو وضعیت:
   🟢 موجود
   🔴 تمام شد
*/

(function () {
  "use strict";

  let cart = JSON.parse(localStorage.getItem("hh_cart") || "[]");

  function saveCart() {
    localStorage.setItem("hh_cart", JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

    const badge = document.getElementById("hh-cart-count");

    if (badge) {
      badge.textContent = count;
    }
  }

  window.HHMenu = {

    addToCart: function (name, price) {
      const item = cart.find(x => x.name === name);

      if (item) {
        item.qty++;
      } else {
        cart.push({
          name: name,
          price: Number(price) || 0,
          qty: 1
        });
      }

      saveCart();

      alert("🛒 " + name + " به سبد خرید اضافه شد.");
    },

    removeFromCart: function (name) {
      cart = cart.filter(x => x.name !== name);
      saveCart();
      this.showCart();
    },

    showCart: function () {
      if (!cart.length) {
        alert("🛒 سبد خرید خالی است.");
        return;
      }

      let total = 0;
      let text = "🛒 سبد خرید\n\n";

      cart.forEach(item => {
        const sum = item.price * item.qty;
        total += sum;

        text +=
          item.name +
          " × " +
          item.qty +
          " = " +
          sum.toLocaleString() +
          " افغانی\n";
      });

      text +=
        "\n----------------\n" +
        "مجموع: " +
        total.toLocaleString() +
        " افغانی";

      alert(text);
    },

    callWaiter: function () {
      alert("🔔 فراخوان گارسون ارسال شد.");
    },

    setStock: function (element, status) {
      if (!element) return;

      if (status === "finished") {
        element.textContent = "🔴 تمام شد";
        element.dataset.stock = "finished";
        element.classList.add("hh-finished");
      } else {
        element.textContent = "🟢 موجود";
        element.dataset.stock = "available";
        element.classList.remove("hh-finished");
      }
    }

  };

  updateCartCount();

})();
