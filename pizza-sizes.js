/* 🍕 پیتزا: اندازه، قیمت، عکس و سبد خرید */
(function(){
  'use strict';
  const U='https://bjpascssizuskiujnzvf.supabase.co';
  const K='sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvrK';
  const labels={one:'👤 یک‌نفره',two:'👥 دو‌نفره',family:'👨‍👩‍👧‍👦 خانواده'};
  let db=null,sizes={},pizzaCats=new Set(),ready=false;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  function getDb(){if(db)return db;try{if(window.supabase?.createClient)db=window.supabase.createClient(U,K)}catch(e){}return db}
  function imageUrl(url){
    if(!url)return '';
    try{const u=new URL(url);if(u.hostname.endsWith('.supabase.co')&&u.pathname.includes('/storage/v1/object/public/')){u.pathname=u.pathname.replace('/storage/v1/object/public/','/storage/v1/render/image/public/');u.searchParams.set('width','900');u.searchParams.set('quality','78');u.searchParams.set('resize','contain');return u.toString()}}catch(e){}
    return url;
  }
  async function loadData(){
    const c=getDb();if(!c)return false;
    const [cr,sr]=await Promise.all([
      c.from('categories').select('id,name').eq('active',true),
      c.from('pizza_sizes').select('food_id,one_price,two_price,family_price')
    ]);
    if(cr.error||sr.error)return false;
    pizzaCats=new Set((cr.data||[]).filter(x=>/پیتزا|pizza/i.test(String(x.name||''))).map(x=>Number(x.id)));
    sizes=Object.fromEntries((sr.data||[]).map(x=>[String(x.food_id),x]));
    ready=true;return true;
  }
  function isPizza(f){return !!f&&pizzaCats.has(Number(f.category_id))}
  function getSizes(id){const p=sizes[String(id)];if(!p)return[];return Object.entries({one:p.one_price,two:p.two_price,family:p.family_price}).filter(([,v])=>Number(v)>0).map(([key,v])=>({key,label:labels[key],price:Number(v)}))}
  function cartId(foodId,key){return -(Number(foodId)*10+({one:1,two:2,family:3}[key]||9))}
  function addSize(food,key){
    const f=foods.find(x=>Number(x.id)===Number(food.id));
    const p=sizes[String(food.id)];if(!f||!p)return;
    const price=Number(p[key+'_price']||0);if(price<=0||f.stock_status==='soldout')return;
    const id=cartId(f.id,key),name=f.name+' — '+labels[key];
    const existing=cart.find(x=>Number(x.id)===id);
    if(existing)existing.q+=1;else cart.push({id,name,price,q:1,pizzaSize:key,pizzaFoodId:Number(f.id)});
    saveCart();
  }
  function decorate(){
    if(!ready||!Array.isArray(foods)||!$('grid'))return;
    document.querySelectorAll('#grid .card').forEach(card=>{
      if(card.querySelector('.pizza-size-block'))return;
      const title=card.querySelector('.body h3')?.textContent?.trim();if(!title)return;
      const food=foods.find(f=>f.name===title&&isPizza(f));if(!food)return;
      const ss=getSizes(food.id);if(!ss.length)return;
      const oldPrice=card.querySelector('.price');if(oldPrice)oldPrice.textContent='انتخاب اندازه';
      const oldAdd=card.querySelector('.add');if(oldAdd)oldAdd.style.display='none';
      const img=card.querySelector('.photo img');if(img&&img.src)img.src=imageUrl(img.src);
      const block=document.createElement('div');block.className='pizza-size-block';
      block.innerHTML='<div class="pizza-size-title">🍕 اندازه و قیمت</div><div class="pizza-size-list">'+ss.map(s=>'<button class="pizza-size-btn" type="button"><span>'+esc(s.label)+'</span><strong>'+s.price.toLocaleString('fa-AF')+' افغانی</strong></button>').join('')+'</div>';
      ss.forEach((s,i)=>block.querySelectorAll('button')[i].onclick=()=>addSize(food,s.key));
      card.querySelector('.body')?.appendChild(block);
    });
  }
  function patch(){
    if(typeof window.setCat==='function'&&!window.setCat.__pizza){const old=window.setCat;const fn=function(){const r=old.apply(this,arguments);setTimeout(decorate,20);return r};fn.__pizza=true;window.setCat=fn}
    if(typeof window.draw==='function'&&!window.draw.__pizza){const old=window.draw;const fn=function(){const r=old.apply(this,arguments);setTimeout(decorate,20);return r};fn.__pizza=true;window.draw=fn}
  }
  const style=document.createElement('style');style.textContent='.pizza-size-block{margin-top:12px}.pizza-size-title{font-size:13px;font-weight:900;color:#e8b84f;margin:0 0 8px}.pizza-size-list{display:grid;gap:7px}.pizza-size-btn{width:100%;display:flex;justify-content:space-between;align-items:center;border:1px solid #e8b84f;border-radius:11px;background:#fff8e8;color:#07172f;padding:9px 10px;font:inherit;cursor:pointer}.pizza-size-btn strong{color:#07172f}.pizza-size-btn:hover{background:#07172f;color:#fff}.pizza-size-btn:hover strong{color:#f5d27a}@media(max-width:430px){.pizza-size-btn{font-size:12px;padding:8px}}';document.head.appendChild(style);
  async function boot(){
    if(!getDb())return;
    await loadData();patch();
    let tries=0;const timer=setInterval(()=>{try{decorate();patch()}catch(e){}if((Array.isArray(foods)&&foods.length)||++tries>80)clearInterval(timer)},250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50));else setTimeout(boot,50);
})();