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
    .card{
      border-radius:18px !important;
      overflow:hidden !important;
      border:1px solid #b77a20 !important;
      background:#06172f !important;
      box-shadow:0 12px 30px rgba(0,0,0,.38),inset 0 0 0 1px rgba(245,210,122,.06);
    }
    .photo{
      aspect-ratio:3/4 !important;
      padding:0 !important;
      display:block !important;
      overflow:hidden !important;
      background:#07172f !important;
      border-radius:0 !important;
    }
    .photo img{
      width:100% !important;
      height:100% !important;
      object-fit:cover !important;
      object-position:center !important;
      background:#07172f !important;
      border:0 !important;
      border-radius:0 !important;
      box-shadow:none !important;
      display:block !important;
      transition:transform .28s ease,filter .28s ease;
    }
    .card:hover .photo img{
      transform:scale(1.035);
      filter:brightness(1.05) saturate(1.08) contrast(1.03);
    }
    .body{
      background:linear-gradient(180deg,#071b38 0%,#06152f 100%) !important;
    }
    .body h3{font-weight:800 !important;}
    .price{color:#f5d27a !important;}
    .add{
      border-color:#e8a52d !important;
      color:#f5d27a !important;
      background:#06152f !important;
    }
    .photo.noimg{padding:20px !important;display:grid !important;place-items:center}
    .photo.noimg > div{font-size:15px;text-align:center}
    @media(max-width:650px){
      .grid{grid-template-columns:repeat(2,1fr) !important;gap:12px !important}
      .photo{aspect-ratio:3/4 !important}
    }
    @media(max-width:430px){
      .grid{grid-template-columns:repeat(2,1fr) !important;gap:10px !important}
      .photo{aspect-ratio:3/4 !important;padding:0 !important}
      .photo img{border-radius:0 !important}
      .body{padding:11px !important}
      .body h3{font-size:16px !important}
    }
  `;
  document.head.appendChild(css);
})();

// Add 10 more premium cold-drink photos to the real Supabase menu.
// The records are created in the same category, so their names/prices can
// subsequently be changed from the existing management panel.
(() => {
  const extraColdDrinks = [
    {
      name:'موهیتو نعناع', price:180,
      description:'نعناع تازه، لیمو و یخ خنک',
      image_url:'https://images.pexels.com/photos/11009215/pexels-photo-11009215.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      name:'بلو هاوایی', price:220,
      description:'نوشیدنی آبی خنک با مرکبات تازه',
      image_url:'https://images.pexels.com/photos/12580179/pexels-photo-12580179.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      name:'لیموناد توت‌فرنگی', price:200,
      description:'توت‌فرنگی تازه، لیمو و یخ',
      image_url:'https://images.pexels.com/photos/8755228/pexels-photo-8755228.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      name:'موکتل انبه', price:200,
      description:'انبه تازه با طعم استوایی',
      image_url:'https://images.pexels.com/photos/8755167/pexels-photo-8755167.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      name:'موکتل استوایی', price:190,
      description:'ترکیب میوه‌های تازه و خنک',
      image_url:'https://images.pexels.com/photos/18142607/pexels-photo-18142607.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      name:'موکتل هندوانه', price:180,
      description:'هندوانه تازه، نعناع و لیمو',
      image_url:'https://images.pexels.com/photos/17321332/pexels-photo-17321332.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      name:'موکتل هندوانه و لیمو', price:210,
      description:'هندوانه، لیمو و نعناع با یخ',
      image_url:'https://images.pexels.com/photos/8755255/pexels-photo-8755255.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      name:'موکتل هلو', price:190,
      description:'هلوی تازه با نعناع و یخ',
      image_url:'https://images.pexels.com/photos/17525269/pexels-photo-17525269.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      name:'نوشیدنی هلو و نعناع', price:180,
      description:'نوشیدنی خنک هلو با یخ',
      image_url:'https://images.pexels.com/photos/17525262/pexels-photo-17525262.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      name:'لیموناد مرکبات', price:170,
      description:'مرکبات تازه و یخ خنک',
      image_url:'https://images.pexels.com/photos/7377017/pexels-photo-7377017.jpeg?auto=compress&cs=tinysrgb&w=1200'
    }
  ];

  async function seedColdDrinks(){
    try{
      if(typeof sb === 'undefined' || typeof cats === 'undefined' || typeof foods === 'undefined') return;
      const cold = cats.find(c => String(c.name||'').trim() === 'نوشیدنی سرد');
      if(!cold) return;
      const existing = foods.filter(f => String(f.category_id) === String(cold.id));
      if(existing.length >= 15) return;

      const existingNames = new Set(existing.map(f => String(f.name||'').trim()));
      const missing = extraColdDrinks.filter(x => !existingNames.has(x.name)).slice(0, 15 - existing.length);
      if(!missing.length) return;

      const payload = missing.map(x => ({
        name:x.name,
        price:x.price,
        description:x.description,
        image_url:x.image_url,
        stock_status:'available',
        category_id:cold.id,
        active:true,
        daily:false
      }));

      const {error} = await sb.from('foods').insert(payload);
      if(error){
        console.warn('Cold drink seed skipped:', error.message);
        return;
      }
      setTimeout(() => location.reload(), 700);
    }catch(e){
      console.warn('Cold drink seed skipped:', e);
    }
  }

  window.addEventListener('load', () => setTimeout(seedColdDrinks, 2200));
})();
