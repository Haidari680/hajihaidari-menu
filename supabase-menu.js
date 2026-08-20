// Performance and visual polish for the digital menu.
(() => {
  const css = document.createElement('style');
  css.textContent = `
    .logo{border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important}
    .logo img{border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;border-radius:0!important;padding:0!important}
    .card{border-radius:18px!important;overflow:hidden!important;border:1px solid #b77a20!important;background:#06172f!important;box-shadow:0 12px 30px rgba(0,0,0,.38),inset 0 0 0 1px rgba(245,210,122,.06)}
    .photo{aspect-ratio:3/4!important;padding:0!important;display:block!important;overflow:hidden!important;background:#07172f!important;border-radius:0!important}
    .photo img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;background:#07172f!important;border:0!important;border-radius:0!important;box-shadow:none!important;display:block!important;transition:transform .28s ease,filter .28s ease}
    .card:hover .photo img{transform:scale(1.035);filter:brightness(1.05) saturate(1.08) contrast(1.03)}
    .body{background:linear-gradient(180deg,#071b38 0%,#06152f 100%)!important}
    .body h3{font-weight:800!important}.price{color:#f5d27a!important}.add{border-color:#e8a52d!important;color:#f5d27a!important;background:#06152f!important}
    @media(max-width:650px){.grid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important}.photo{aspect-ratio:3/4!important}}
    @media(max-width:430px){.grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}.photo{aspect-ratio:3/4!important}.body{padding:11px!important}.body h3{font-size:16px!important}}
  `;
  document.head.appendChild(css);

  // Keep every menu image lazy and asynchronous, including images added by the admin panel.
  const optimizeImages = () => document.querySelectorAll('.card img,.slide img').forEach((img,i) => {
    if(i > 0 || img.closest('.card')) img.loading = 'lazy';
    img.decoding = 'async';
  });
  window.addEventListener('load', optimizeImages, {once:true});
  new MutationObserver(optimizeImages).observe(document.body,{childList:true,subtree:true});
})();
