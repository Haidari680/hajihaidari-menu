// Performance and visual polish for the digital menu.
(() => {
  const css = document.createElement('style');
  css.textContent = `
    .logo{border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important}
    .logo img{border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;border-radius:0!important;padding:0!important}
    .card{border-radius:18px!important;overflow:hidden!important;border:1px solid #b77a20!important;background:#06172f!important;box-shadow:0 12px 30px rgba(0,0,0,.38),inset 0 0 0 1px rgba(245,210,122,.06)}
    .photo{aspect-ratio:3/4!important;padding:0!important;display:block!important;overflow:hidden!important;background:#07172f!important;border-radius:0!important}
    .photo img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;background:#07172f!important;border:0!important;border-radius:0!important;box-shadow:none!important;display:block!important;transition:transform .28s ease,filter .28s ease;cursor:zoom-in}
    .card:hover .photo img{transform:scale(1.035);filter:brightness(1.05) saturate(1.08) contrast(1.03)}
    .body{background:linear-gradient(180deg,#071b38 0%,#06152f 100%)!important}
    .body h3{font-weight:800!important}.price{color:#f5d27a!important}.add{border-color:#e8a52d!important;color:#f5d27a!important;background:#06152f!important}
    .delete-item{border:0;background:#6b1d2a;color:#fff;border-radius:8px;width:30px;height:30px;cursor:pointer;font-weight:900;margin-right:4px}
    .food-image-modal{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.86);display:none;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(3px)}
    .food-image-modal.open{display:flex}
    .food-image-modal img{max-width:min(94vw,900px);max-height:86vh;width:auto;height:auto;object-fit:contain;border-radius:18px;box-shadow:0 12px 45px rgba(0,0,0,.65);animation:foodZoomIn .18s ease-out}
    .food-image-close{position:absolute;top:16px;right:16px;width:42px;height:42px;border:1px solid #e8b84f;border-radius:50%;background:#06152f;color:#fff;font-size:27px;line-height:1;cursor:pointer}
    .food-image-hint{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);background:#06152fe8;color:#fff;border:1px solid #e8b84f;border-radius:12px;padding:8px 13px;font-size:12px}
    @keyframes foodZoomIn{from{transform:scale(.94);opacity:.6}to{transform:scale(1);opacity:1}}
    @media(max-width:650px){.grid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important}.photo{aspect-ratio:3/4!important}.food-image-modal{padding:12px}.food-image-modal img{max-width:96vw;max-height:80vh}.food-image-close{top:10px;right:10px}}
    @media(max-width:430px){.grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}.photo{aspect-ratio:3/4!important}.body{padding:11px!important}.body h3{font-size:16px!important}}
  `;
  document.head.appendChild(css);

  const optimizeImages = () => document.querySelectorAll('.card img,.slide img').forEach((img,i) => {
    if(i > 0 || img.closest('.card')) img.loading = 'lazy';
    img.decoding = 'async';
  });
  window.addEventListener('load', optimizeImages, {once:true});
  new MutationObserver(optimizeImages).observe(document.body,{childList:true,subtree:true});

  // Reliable cart total + delete control.
  window.removeFromCart = function(id) {
    cart = cart.filter(item => String(item.id) !== String(id));
    localStorage.setItem('hh_cart', JSON.stringify(cart));
    bar();
    renderCart();
  };

  window.bar = function() {
    const count = cart.reduce((total,item) => total + Number(item.q || 0), 0);
    const total = cart.reduce((sum,item) => sum + (Number(item.price) || 0) * (Number(item.q) || 0), 0);
    $('tc').textContent = fa(count);
    $('bc').textContent = fa(count);
    $('bt').textContent = fa(total);
  };

  window.renderCart = function() {
    const total = cart.reduce((sum,item) => sum + (Number(item.price) || 0) * (Number(item.q) || 0), 0);
    $('lines').innerHTML = cart.length ? cart.map(item => {
      const lineTotal = (Number(item.price) || 0) * (Number(item.q) || 0);
      return `<div class="line"><b>${esc(item.name)}</b><span>${fa(lineTotal)}</span><span class="qty"><button onclick="qty(${item.id},-1)">−</button> ${fa(item.q)} <button onclick="qty(${item.id},1)">+</button><button class="delete-item" title="حذف" aria-label="حذف ${esc(item.name)}" onclick="removeFromCart(${item.id})">🗑</button></span></div>`;
    }).join('') : '<div class="empty">سبد خرید خالی است.</div>';
    $('sum').textContent = fa(total);
  };

  // Food image zoom preview: click/tap any food photo to see a larger version.
  const imageModal = document.createElement('div');
  imageModal.className = 'food-image-modal';
  imageModal.innerHTML = '<button class="food-image-close" aria-label="بستن">×</button><img alt="نمای بزرگ غذا"><div class="food-image-hint">برای بستن، بیرون عکس را لمس کنید</div>';
  document.body.appendChild(imageModal);
  const previewImg = imageModal.querySelector('img');
  const closeImage = () => imageModal.classList.remove('open');
  imageModal.addEventListener('click', e => { if(e.target === imageModal || e.target.classList.contains('food-image-close')) closeImage(); });
  document.addEventListener('click', e => {
    const img = e.target.closest('.card .photo img');
    if(!img) return;
    previewImg.src = img.currentSrc || img.src;
    previewImg.alt = img.alt || 'نمای بزرگ غذا';
    imageModal.classList.add('open');
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeImage(); });

  // Repaint totals once the existing page finishes loading.
  window.addEventListener('load', () => { bar(); if ($('ov').classList.contains('open')) renderCart(); });
})();
