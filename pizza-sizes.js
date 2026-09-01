/* 🍕 Pizza sizes bridge — customer only */
(function(){
  'use strict';
  // admin.html already contains its own pizza-size management.
  // Never initialize Supabase/Auth from this module on the admin page.
  if(document.getElementById('login')&&document.getElementById('foodList')) return;

  const U='https://bjpascssizuskiujnzvf.supabase.co';
  // Current active public key from Supabase project (legacy anon key is kept for compatibility).
  const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcGFzY3NzaXp1c2tpdWpuelZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzE3MDUsImV4cCI6MjEwMjY0NzcwNX0.bo8Q2OaYZsa9lm1j0wRY2CAfubbjyX3vcjq9vntuBds';
  const labels={one:'👤 یک‌نفره',two:'👥 دو‌نفره',family:'👨‍👩‍👧 خانواده'};
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  let db=null,sizes={},pizzaIds=new Set(),booted=false;
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
  function getFoods(){return Array.isArray(window.foods)?window.foods:[]}
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
    const grid=$('grid');if(!grid)return;
    const foods=getFoods();if(!foods.length)return;
    grid.querySelectorAll('.card').forEach(card=>{
      if(card.querySelector('.pizza-size-block'))return;
      const title=card.querySelector('.body h3')?.textContent?.trim();
      const f=foods.find(x=>String(x.name||'').trim()===title&&pizzaIds.has(Number(x.category_id)));
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

  async function repairMenu(){
    const c=getDb();if(!c)return;
    try{
      const [s,sl,cr,fr]=await Promise.all([
        c.from('site_settings').select('key,value'),
        c.from('site_slides').select('*').eq('active',true).order('sort_order'),
        c.from('categories').select('id,name,active,sort_order').eq('active',true).order('sort_order'),
        c.from('foods').select('id,name,price,description,image_url,stock_status,category_id,active,daily').eq('active',true).order('id',{ascending:false})
      ]);
      if(s.error||sl.error||cr.error||fr.error)return;
      const settings=Object.fromEntries((s.data||[]).map(x=>[x.key,x.value]));
      if($('brand'))$('brand').textContent=settings.site_title||'مجموعه حاجی حیدری';
      if($('subtitle'))$('subtitle').textContent=settings.site_subtitle||'';
      if($('heroTitle'))$('heroTitle').textContent=settings.hero_title||($('brand')?.textContent||'مجموعه حاجی حیدری');
      if($('heroText'))$('heroText').textContent=settings.hero_text||'';
      document.title=(($('brand')?.textContent)||'مجموعه حاجی حیدری')+' | منوی دیجیتال';
      if(settings.logo_url&&$('logo')){$('logo').src=settings.logo_url;$('logo').style.display='block';$('brand').style.display='none';}
      if(settings.home_background_url&&$('hero'))$('hero').style.backgroundImage=`url(${JSON.stringify(settings.home_background_url)})`;
      if(settings.cart_enabled==='false')document.querySelectorAll('#cartBtn,.bar').forEach(x=>x.style.display='none');
      if(settings.waiter_enabled==='false'&&$('waiterBtn'))$('waiterBtn').style.display='none';
      [['b1n','branch1_name'],['b1a','branch1_address'],['b2n','branch2_name'],['b2a','branch2_address']].forEach(([a,b])=>{if($(a))$(a).textContent=settings[b]||'';});
      [['b1m','branch1_map'],['b2m','branch2_map']].forEach(([a,b])=>{if($(a)){if(settings[b])$(a).href=settings[b];else $(a).style.display='none';}});
      if(Array.isArray(window.slides))window.slides=sl.data||[];
      slides=sl.data||[];renderSlides();
      cats=cr.data||[];foods=(fr.data||[]).map(x=>({...x,cat:(cats.find(c=>String(c.id)===String(x.category_id))||{}).name||''}));
      renderCats();draw();bar();
      setTimeout(decorateCustomer,120);
    }catch(e){console.error('menu repair failed',e)}
  }

  async function orderFixed(){
    if(!getCart().length)return alert('سبد خرید خالی است.');
    const name=$('name')?.value.trim()||null,table=$('table')?.value.trim()||null,total=getCart().reduce((a,x)=>a+(Number(x.price)||0)*(Number(x.q)||0),0),no='HH-'+Date.now();
    const r=await getDb().from('orders').insert({order_no:no,customer_name:name,table_location:table,status:'new',total}).select('id').single();
    if(r.error)return alert(r.error.message);
    const items=getCart().map(x=>({order_id:r.data.id,food_id:x.pizzaFoodId||x.id,food_name:x.name,quantity:x.q,unit_price:x.price}));
    const ir=await getDb().from('order_items').insert(items);if(ir.error)return alert(ir.error.message);
    cart=[];persistCart();alert('✅ سفارش ثبت شد: '+no);window.closeCart?.();
  }
  async function waiterFixed(){
    const table=prompt('شماره میز / محل را وارد کنید:');if(!table)return;
    const r=await getDb().from('waiter_calls').insert({table_location:table,status:'new'});if(r.error)alert(r.error.message);else alert('🔔 فراخوان گارسون ثبت شد.');
  }

  async function boot(){
    if(booted)return;booted=true;installStyle();
    await loadData();
    await repairMenu();
    window.order=orderFixed;
    window.callWaiter=waiterFixed;
    setTimeout(decorateCustomer,150);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50));else setTimeout(boot,50);
})();