/* 🍕 Pizza sizes bridge — customer only */
(function(){
  'use strict';
  if(document.getElementById('login')&&document.getElementById('foodList')) return;

  const U='https://bjpascssizuskiujnzvf.supabase.co';
  const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcGFzY3NzaXp1c2tpdWpuelZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzE3MDUsImV4cCI6MjEwMjY0NzcwNX0.bo8Q2OaYZsa9lm1j0wRY2CAfubbjyX3vcjq9vntuBds';
  const labels={one:'👤 یک‌نفره',two:'👥 دو‌نفره',family:'👨‍👩‍👧 خانواده'};
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  let db=null,sizes={},pizzaIds=new Set(),foodsCache=[],booted=false;
  function getDb(){if(db)return db;try{db=window.supabase?.createClient(U,K)}catch(e){}return db}

  async function loadData(){
    const c=getDb();if(!c)return false;
    const [cr,sr,fr]=await Promise.all([
      c.from('categories').select('id,name').eq('active',true),
      c.from('pizza_sizes').select('food_id,one_price,two_price,family_price'),
      c.from('foods').select('id,name,category_id,stock_status,active').eq('active',true)
    ]);
    if(cr.error||sr.error||fr.error){console.error('pizza bridge load failed',cr.error||sr.error||fr.error);return false;}
    const categories=cr.data||[];
    pizzaIds=new Set(categories.filter(x=>/پیتزا|pizza/i.test(String(x.name||''))).map(x=>Number(x.id)));
    sizes=Object.fromEntries((sr.data||[]).map(x=>[String(x.food_id),x]));
    foodsCache=(fr.data||[]).map(x=>({...x,cat:(categories.find(c=>String(c.id)===String(x.category_id))||{}).name||''}));
    return true;
  }
  function getCart(){return Array.isArray(window.cart)?window.cart:[]}
  function persistCart(){try{localStorage.setItem('hh_cart',JSON.stringify(getCart()));window.bar?.();}catch(e){}}
  function addSize(food,key){
    const p=sizes[String(food.id)],price=Number(p?.[key+'_price']||0);if(!price||food.stock_status==='soldout')return;
    const c=getCart(),sid=-(Number(food.id)*10+({one:1,two:2,family:3}[key]||9));
    const old=c.find(x=>Number(x.id)===sid);
    if(old)old.q=(Number(old.q)||1)+1;else c.push({id:sid,name:food.name+' — '+labels[key],price,q:1,pizzaSize:key,pizzaFoodId:Number(food.id)});
    persistCart();window.renderCart?.();window.updateCartUI?.();
    const msg=document.createElement('div');msg.textContent='✅ به سبد خرید اضافه شد';msg.style.cssText='position:fixed;bottom:90px;right:50%;transform:translateX(50%);background:#17324d;color:#fff;padding:10px 16px;border-radius:12px;z-index:9999';document.body.appendChild(msg);setTimeout(()=>msg.remove(),1600);
  }
  function decorateCustomer(){
    const grid=$('grid');if(!grid||!foodsCache.length)return;
    grid.querySelectorAll('.card').forEach(card=>{
      if(card.querySelector('.pizza-size-block'))return;
      const title=card.querySelector('.body h3')?.textContent?.trim();
      const f=foodsCache.find(x=>String(x.name||'').trim()===title&&pizzaIds.has(Number(x.category_id)));
      if(!f)return;
      const p=sizes[String(f.id)];if(!p)return;
      const ss=Object.entries({one:p.one_price,two:p.two_price,family:p.family_price}).filter(([,v])=>Number(v)>0).map(([key,price])=>({key,label:labels[key],price:Number(price)}));
      if(!ss.length)return;
      const price=card.querySelector('.price');if(price)price.innerHTML='انتخاب اندازه و قیمت';
      const add=card.querySelector('.add');if(add)add.style.display='none';
      const block=document.createElement('div');block.className='pizza-size-block';
      block.innerHTML='<div class="pizza-size-title">🍕 اندازه پیتزا</div><div class="pizza-size-list">'+ss.map(s=>`<button type="button" class="pizza-size-btn"><span>${esc(s.label)}</span><strong>${s.price.toLocaleString('fa-AF')} افغانی</strong></button>`).join('')+'</div>';
      ss.forEach((s,i)=>block.querySelectorAll('button')[i].onclick=()=>addSize(f,s.key));
      card.querySelector('.body')?.appendChild(block);
    });
  }
  function installStyle(){
    if($('pizzaSizeStyle'))return;
    const st=document.createElement('style');st.id='pizzaSizeStyle';st.textContent='.pizza-size-block{margin-top:12px}.pizza-size-title{font-weight:900;color:#17324d;margin-bottom:8px}.pizza-size-list{display:grid;gap:7px}.pizza-size-btn{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;padding:9px 11px;border:1px solid #e4b84f;border-radius:10px;background:#fffaf0;color:#17324d}.pizza-size-btn strong{color:#0879d1;white-space:nowrap}';document.head.appendChild(st);
  }
  async function boot(){
    if(booted)return;booted=true;installStyle();
    const ok=await loadData();
    if(ok){decorateCustomer();setTimeout(decorateCustomer,300);setTimeout(decorateCustomer,1000);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50));else setTimeout(boot,50);
})();