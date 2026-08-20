// Visual polish for the digital menu.
// Loaded after index.html so the existing menu logic stays unchanged.
(() => {
  const css = document.createElement('style');
  css.textContent = `
    .logo{
      border:0 !important;
      outline:0 !important;
      box-shadow:none !important;
      background:transparent !important;
    }
    .logo img{
      border:0 !important;
      outline:0 !important;
      box-shadow:none !important;
      background:transparent !important;
      border-radius:0 !important;
      padding:0 !important;
    }
    .photo{
      aspect-ratio:4/3;
      padding:0 !important;
      display:block;
      overflow:hidden;
      background:#07172f !important;
    }
    .photo img{
      width:100%;
      height:100%;
      object-fit:cover !important;
      object-position:center;
      background:#07172f !important;
      border:0 !important;
      border-radius:0 !important;
      box-shadow:none !important;
      display:block;
      transition:transform .25s ease,filter .25s ease;
    }
    .card:hover .photo img{
      transform:scale(1.035);
      filter:brightness(1.04) saturate(1.05);
    }
    .photo.noimg{padding:20px !important;display:grid}
    .photo.noimg > div{font-size:15px;text-align:center}
    @media(max-width:430px){
      .photo{aspect-ratio:16/10;padding:0 !important}
      .photo img{border-radius:0 !important}
    }
  `;
  document.head.appendChild(css);
})();
