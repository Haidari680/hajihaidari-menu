/* 🍕 Pizza sizes bridge — admin + customer */
(function(){
  'use strict';
  const U='https://bjpascssizuskiujnzvf.supabase.co';
  const K='sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvrK';
  const labels={one:'👤 یک‌نفره',two:'👥 دو‌نفره',family:'👨‍👩‍👧 خانواده'};
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  let db=null,sizes={},pizzaIds=new Set(),booted=false,adminReady=false;
  function getDb(){if(db)return db;try{db=window.supabase?.createClient(U,K)}catch(e){}return db}
  async function loadData(){
    const c=getDb();if(!c)return false;
    const [cr,sr]=await Promise.all([
      c.from('categories').select('id,name').eq('active',true),
      c.from('pizza_sizes').select('food_id,one_price,two_price,family_price')
    ]);
    if(cr.error||sr.error)return false;
    pizzaIds=new Set((cr.data||[]).filter(x=>/پیتزا|pizza/i.test(String(x.name||''))).map(x=>Number(x.id)));
    sizes=Object.fromEntries((sr.data||[]).map(x=>[String(x.food_id),x]));
    return true;
  }
  function getFoods(){try{return Array.isArray(window.foods)?window.foods:[]}catch(e){return[]}}
  function getCart(){try{return Array.isArray(window.cart)?window.cart:[]}catch(e){return[]}}
  function persistCart(){try{localStorage.setItem('hh_cart',JSON.stringify(getCart()));if(typeof window.saveCart==='function')window.saveCart()}catch(e){}}
  function sizeList(id){const p=sizes[String(id)];if(!p)return[];return Object.entries({one:p.one_price,two:p.two_price,family:p.family_price}).filter(([,v])=>Number(v)>0).map(([key,price])=>({key,label:labels[key],price:Number(price)}))}
  function addSize(food,key){
    const p=sizes[String(food.id)],price=Number(p?.[key+'_price']||0);if(!price||food.stock_status==='soldout')return;
    const c=getCart(),sid=-(Number(food.id)*10+({one:1,two:2,family:3}[key]||9));
    const old=c.find(x=>Number(x.id)===sid);
    if(old)old.q=(Number(old.q)||1)+1;else c.push({id:sid,name:food.name+' — '+labels[key],price,q:1,pizzaSize:key,pizzaFoodId:Number(food.id)});
    persistCart();try{window.renderCart?.();window.updateCartUI?.()}catch(e){}
    const msg=document.createElement('div');msg.textContent='✅ به سبد خرید اضافه شد';msg.style.cssText='position:fixed;bottom:90px;right:50%;transform:translateX(50%);background:#17324d;color:#fff;padding:10px 16px;border-radius:12px;z-index:9999';document.body.appendChild(msg);setTimeout(()=>msg.remove(),1600);
  }
  function decorateCustomer(){
    const grid=$('grid');if(!grid)return;
    const foods=getFoods();if(!foods.length)return;
    grid.querySelectorAll('.card').forEach(card=>{
      if(card.querySelector('.pizza-size-block'))return;
      const title=card.querySelector('.body h3')?.textContent?.trim();
      const f=foods.find(x=>String(x.name||'').trim()===title&&pizzaIds.has(Number(x.category_id)));
      if(!f)return;
      const ss=sizeList(f.id);if(!ss.length)return;
      const price=card.querySelector('.price');if(price)price.innerHTML='انتخاب اندازه و قیمت';
      const add=card.querySelector('.add');if(add)add.style.display='none';
      const block=document.createElement('div');block.className='pizza-size-block';
      block.innerHTML='<div class="pizza-size-title">🍕 اندازه پیتزا</div><div class="pizza-size-list">'+ss.map(s=>`<button type="button" class="pizza-size-btn"><span>${esc(s.label)}</span><strong>${s.price.toLocaleString('fa-AF')} افغانی</strong></button>`).join('')+'</div>';
      ss.forEach((s,i)=>{const b=block.querySelectorAll('button')[i];b.onclick=()=>addSize(f,s.key)});
      card.querySelector('.body')?.appendChild(block);
    });
  }
  function installCustomerStyle(){
    if($('pizzaSizeStyle'))return;
    const st=document.createElement('style');st.id='pizzaSizeStyle';st.textContent='.pizza-size-block{margin-top:12px}.pizza-size-title{font-weight:900;color:#17324d;margin-bottom:8px}.pizza-size-list{display:grid;gap:7px}.pizza-size-btn{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;padding:9px 11px;border:1px solid #e4b84f;border-radius:10px;background:#fffaf0;color:#17324d}.pizza-size-btn strong{color:#0879d1;white-space:nowrap}';document.head.appendChild(st);
  }
  async function readAdminRows(){
    if(!adminReady)return;
    const c=getDb();if(!c||!$('foodList'))return;
    const r=await c.from('foods').select('id,name,category_id').eq('active',true);if(r.error)return;
    const pizza=(r.data||[]).filter(f=>pizzaIds.has(Number(f.category_id)));
    document.querySelectorAll('[data-pizza-editor]').forEach(x=>x.remove());
    pizza.forEach(f=>{
      const row=[...document.querySelectorAll('#foodList .item')].find(x=>x.textContent.includes(f.name));if(!row)return;
      const p=sizes[String(f.id)]||{};
      const box=document.createElement('div');box.dataset.pizzaEditor='1';box.className='pizza-edit';
      box.innerHTML=`<div style="font-weight:900;margin-bottom:10px">🍕 اندازه و قیمت پیتزا — ${esc(f.name)}</div><div class="sizes"><div class="sizebox"><label>👤 یک‌نفره<input id="pz1_${f.id}" type="number" value="${p.one_price??''}" placeholder="قیمت"></label></div><div class="sizebox"><label>👥 دو‌نفره<input id="pz2_${f.id}" type="number" value="${p.two_price??''}" placeholder="قیمت"></label></div><div class="sizebox"><label>👨‍👩‍👧 خانواده<input id="pzf_${f.id}" type="number" value="${p.family_price??''}" placeholder="قیمت"></label></div></div><button class="btn gold" style="margin-top:10px" onclick="window.savePizzaSizes(${f.id})">💾 ذخیره اندازه‌ها</button><span id="pzm_${f.id}" class="statusmsg" style="margin-right:10px"></span>`;
      row.appendChild(box);
    });
  }
  window.savePizzaSizes=async function(id){
    const c=getDb();if(!c)return;
    const vals={food_id:id,one_price:Number($('pz1_'+id)?.value||0)||null,two_price:Number($('pz2_'+id)?.value||0)||null,family_price:Number($('pzf_'+id)?.value||0)||null};
    const msg=$('pzm_'+id);
    try{
      let r=await c.from('pizza_sizes').upsert(vals,{onConflict:'food_id'});
      if(r.error){await c.from('pizza_sizes').delete().eq('food_id',id);r=await c.from('pizza_sizes').insert(vals);if(r.error)throw r.error}
      sizes[String(id)]=vals;
      if(msg){msg.textContent='✅ ذخیره شد';msg.style.color='#197a4b'}
      decorateCustomer();
    }catch(e){if(msg){msg.textContent='❌ '+e.message;msg.style.color='#b52b2b'}}
  };
  function patchAdmin(){
    if(!$('foodList')||window.__pizzaAdminPatched||!adminReady)return;
    window.__pizzaAdminPatched=true;
    const orig=window.loadFoods;
    if(typeof orig==='function'){
      window.loadFoods=async function(){const r=await orig.apply(this,arguments);setTimeout(readAdminRows,50);return r};
    }
    setTimeout(readAdminRows,100);
  }
  function patchCustomer(){
    if(window.__pizzaCustomerPatched)return;
    if(typeof window.load==='function'){
      const orig=window.load;window.load=async function(){const r=await orig.apply(this,arguments);setTimeout(decorateCustomer,80);return r};window.__pizzaCustomerPatched=true;
    }
  }
  async function initAdmin(){
    if(adminReady)return;
    const c=getDb();if(!c)return;
    const s=await c.auth.getSession();if(!s.data.session)return;
    adminReady=true;
    await loadData();
    patchAdmin();
    readAdminRows();
  }
  async function boot(){
    if(booted)return;booted=true;installCustomerStyle();
    const isAdmin=!!$('login')&&!!$('foodList');
    if(isAdmin){
      await initAdmin();
      const c=getDb();
      c?.auth.onAuthStateChange((event)=>{if(event==='SIGNED_IN')setTimeout(initAdmin,0)});
      return;
    }
    await loadData();
    patchCustomer();
    setTimeout(decorateCustomer,100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50));else setTimeout(boot,50);
})();