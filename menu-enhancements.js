(() => {
  const URL='https://bjpascssizuskiujnzvf.supabase.co', KEY='sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvr';
  const css=`
  .hero .slide img{object-fit:cover;object-position:center}
  .heroLogoImg{width:min(190px,38vw);height:82px;object-fit:contain;display:block;margin:auto;filter:drop-shadow(0 5px 14px #0008)}
  .heroText h1{font-weight:950;letter-spacing:-.5px}.heroText p{max-width:650px}
  @media(max-width:650px){.hero{height:340px}.heroText{padding-top:78px}.heroText h1{font-size:29px;line-height:1.25}.heroText p{font-size:12px;line-height:1.7;margin-bottom:12px}.cats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:8px;border-radius:17px}.cat{width:100%;padding:9px 7px;border-radius:12px;font-size:12px;overflow:hidden;text-overflow:ellipsis}.cat.on{font-weight:900}.logo b{font-size:17px}.logo small{font-size:10px}.top{top:10px;padding:0 10px}.topBtn{padding:7px 9px;font-size:11px}.heroLogoImg{width:135px;height:62px}.grid{gap:10px}.card{border-radius:16px}.body{padding:11px}.body h3{font-size:15px}.desc{font-size:11px;min-height:38px}.price{font-size:13px}.add{padding:8px 9px;font-size:11px}}
  `;
  const addCss=()=>{if(document.getElementById('menuEnhCss'))return;const s=document.createElement('style');s.id='menuEnhCss';s.textContent=css;document.head.appendChild(s)};
  const esc=v=>String(v??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[ch]));
  function optimizeImages(){document.querySelectorAll('img').forEach(im=>{if(im.dataset.optimized==='1')return;const raw=im.currentSrc||im.src;if(!raw||!raw.includes('/storage/v1/object/public/'))return;try{const u=new URL(raw);u.pathname=u.pathname.replace('/storage/v1/object/public/','/storage/v1/render/image/public/');u.searchParams.set('width',window.innerWidth<=650?'520':'900');u.searchParams.set('quality','70');u.searchParams.set('resize','contain');im.loading=im.closest('.hero')?'lazy':'lazy';im.decoding='async';im.fetchPriority='low';im.src=u.toString();im.dataset.optimized='1'}catch{}})}
  const start=()=>{if(!window.supabase)return setTimeout(start,250);addCss();const db=window.sb||window.supabase.createClient(URL,KEY);load(db);setTimeout(optimizeImages,300);new MutationObserver(()=>optimizeImages()).observe(document.body,{childList:true,subtree:true})};
  async function load(db){const r=await db.from('site_settings').select('key,value').in('key',['hero_logo','hero_slides','hero_texts']);if(r.error)return;const o=Object.fromEntries((r.data||[]).map(x=>[x.key,x.value]));
    if(o.hero_logo){const logo=document.querySelector('.logo');if(logo){const url=typeof o.hero_logo==='string'?o.hero_logo:o.hero_logo.url;if(url)logo.innerHTML='<img class="heroLogoImg" src="'+esc(url)+'" alt="لوگوی مجموعه حاجی حیدری"><small>طعم اصیل، تجربه‌ای ماندگار</small>'}}
    let slides=o.hero_slides;if(typeof slides==='string'){try{slides=JSON.parse(slides)}catch{}}
    if(Array.isArray(slides)&&slides.length){document.querySelectorAll('.hero .slide').forEach((el,i)=>{const x=slides[i];if(!x)return;const url=x.url||x;if(!url)return;let im=el.querySelector('img');if(!im){im=document.createElement('img');el.appendChild(im)}im.src=url;im.width=1200;im.height=390;im.loading='lazy';im.decoding='async';})}
    let texts=o.hero_texts;if(typeof texts==='string'){try{texts=JSON.parse(texts)}catch{}}if(texts&&typeof texts==='object'){const h=document.querySelector('.heroText h1'),p=document.querySelector('.heroText p');if(h&&texts.title)h.textContent=texts.title;if(p&&texts.subtitle)p.textContent=texts.subtitle}
    setTimeout(optimizeImages,100);
  }
  start();
})();