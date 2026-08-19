// Visual polish for the digital menu.
// Loaded after index.html so the existing menu logic stays unchanged.
(() => {
  const css = document.createElement('style');
  css.textContent = `
    .photo{
      aspect-ratio:4/3;
      padding:10px;
      display:grid;
      place-items:center;
      background:linear-gradient(145deg,#f8fafc,#eef2f6);
    }
    .photo img{
      width:100%;
      height:100%;
      object-fit:contain !important;
      background:transparent !important;
      border:0 !important;
      border-radius:18px;
      box-shadow:0 8px 20px rgba(7,23,47,.10);
      transition:transform .25s ease,filter .25s ease;
    }
    .card:hover .photo img{
      transform:scale(1.035);
      filter:drop-shadow(0 10px 16px rgba(7,23,47,.12));
    }
    .photo.noimg{padding:20px}
    .photo.noimg > div{font-size:15px;text-align:center}
    @media(max-width:430px){
      .photo{aspect-ratio:16/10;padding:8px}
      .photo img{border-radius:16px}
    }
  `;
  document.head.appendChild(css);
})();
