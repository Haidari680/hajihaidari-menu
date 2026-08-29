/* 🍕 پیتزا: اتصال واقعی منوی مشتری + اندازه‌ها و قیمت‌ها */
(function(){
  'use strict';
  const SIZE_LABELS={one:'👤 یک‌نفره',two:'👥 دو‌نفره',family:'👨‍👩‍👧‍👦 خانواده'};
  const SB_URL='https://bjpascssizuskiujnzvf.supabase.co';
  const SB_KEY='sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvrK';
  let client=null,foodSizes={},pizzaCategoryIds=new Set();
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  function getClient(){
    if(client)return client;
    try{if(window.supabase?.createClient)client=window.supabase.createClient(SB_URL,SB_KEY);}catch(e){}
    return client;
  }
  function loadSupabase(){
    if(window.supabase?.createClient)return Promise.resolve();
    return new Promise(resolve=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=resolve;document.head.appendChild(s);});
  }
  async function fetchSizes(){
    const db=getClient();if(!db)return;
    const r=await db.from('pizza_sizes').select('food_id,one_price,two_price,family_price');
    if(!r.error)foodSizes=Object.fromEntries((r.data||[]).map(x=>[String(x.food_id),x]));
  }
  async function fetchPizzaCategories(){
    const db=getClient();if(!db)return;
    const r=await db.from('categories').select('id,name').eq('active',true);
    if(r.error){pizzaCategoryIds=new Set();return;}
    pizzaCategoryIds=new Set((r.data||[]).filter(c=>/پیتزا|pizza/i.test(String(c.name||''))).map(c=>Number(c.id)));
  }
  function sizesFor(id){
    const p=foodSizes[String(id)];if(!p)return[];
    return Object.entries({one:p.one_price,two:p.two_price,family:p.family_price}).filter(([,v])=>v!==null&&v!==undefined&&Number(v)>0).map(([key,v])=>({key,label:SIZE_LABELS[key],price:Number(v)}));
  }
  function imageUrl(url){
    if(!url)return '';
    try{
      const u=new URL(url);
      if(u.hostname.endsWith('.supabase.co')&&u.pathname.includes('/storage/v1/object/public/')){
        u.pathname=u.pathname.replace('/storage/v1/object/public/','/storage/v1/render/image/public/');
        u.searchParams.set('width','900');u.searchParams.set('quality','78');u.searchParams.set('resize','contain');u.searchParams.set('format','webp');
        return u.toString();
      }
    }catch(e){}
    return url;
  }
  async function syncCustomerMenu(){
    if($('foods'))return;
    const db=getClient();if(!db||!window.data)return;
    const [cats,foods]=await Promise.all([
      db.from('categories').select('id,name,sort_order,active').eq('active',true).order('sort_order').order('id'),
      db.from('foods').select('id,category_id,name,description,price,image_url,stock_status,daily,active,sort_order').eq('active',true).order('sort_order').order('id')
    ]);
    if(cats.error||foods.error)return;
    const categories=(cats.data||[]).map(c=>({id:Number(c.id),name:c.name}));
    const items=(foods.data||[]).map(f=>({
      id:Number(f.id),category:Number(f.category_id),name:f.name,price:Number(f.price||0),oldPrice:0,
      image:imageUrl(f.image_url),description:f.description||'',daily:!!f.daily,rating:5,
      stockStatus:f.stock_status||'available'
    }));
    if(categories.length)window.data.categories=categories;
    window.data.items=items;
    window.data.__supabaseMenu=true;
    if(typeof window.renderAll==='function')window.renderAll();
    decoratePizzaCards();
  }
  function addSizeToCart(food,key){
    const item=(window.data?.items||[]).find(x=>String(x.id)===String(food.id));
    const p=foodSizes[String(food.id)];
    if(!item||!p||item.stockStatus==='soldout')return;
    const price=Number(p[key+'_price']||0);if(!price)return;
    const temp={...item,id:`pizza-size-${food.id}-${key}`,name:`${item.name} — ${SIZE_LABELS[key]}`,price,q:1,pizzaSize:key};
    const list=window.data.items;list.push(temp);
    try{window.addToCart?.(temp.id);}finally{window.data.items=list.filter(x=>x!==temp);}
    if(typeof window.bar==='function')window.bar();
  }
  window.addFoodSizeToCart=addSizeToCart;
  function decoratePizzaCards(){
    if(!$('menu')||!window.data?.items)return;
    const cards=Array.from(document.querySelectorAll('#menu .card'));
    cards.forEach(card=>{
      if(card.querySelector('.pizza-size-block'))return;
      const title=card.querySelector('.card-body h3')?.textContent?.trim();
      if(!title)return;
      const item=window.data.items.find(x=>x.name===title&&pizzaCategoryIds.has(Number(x.category)));
      if(!item)return;
      const sizes=sizesFor(item.id);if(!sizes.length)return;
      const price=card.querySelector('.price');
      if(price)price.innerHTML='انتخاب اندازه و قیمت';
      const old=card.querySelector('.card-actions');if(old)old.style.display='none';
      const block=document.createElement('div');block.className='pizza-size-block';
      block.innerHTML=`<div class="pizza-size-title">🍕 اندازه و قیمت</div><div class="pizza-size-list">${sizes.map(s=>`<button class="pizza-size-btn" type="button"><span>${esc(s.label)}</span><strong>${Number(s.price).toLocaleString('fa-AF')} افغانی</strong></button>`).join('')}</div>`;
      block.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>addSizeToCart(item,sizes[i].key));
      card.querySelector('.card-body')?.appendChild(block);
    });
  }
  function patchRender(){
    if(typeof window.renderMenu!=='function'||window.renderMenu.__pizzaPatched)return;
    const original=window.renderMenu;
    const wrapped=function(){const r=original.apply(this,arguments);setTimeout(decoratePizzaCards,0);return r;};
    wrapped.__pizzaPatched=true;window.renderMenu=wrapped;
  }
  async function adminPanel(){
    const app=$('foods'),db=getClient(),catSelect=$('fc');
    if(!app||!db||!catSelect||$('pizzaSizeAdmin'))return;
    const panel=document.createElement('div');panel.id='pizzaSizeAdmin';panel.className='pizza-size-admin hide';
    panel.innerHTML='<h3>🍕 اندازه و قیمت پیتزا</h3><p class="muted">این بخش فقط وقتی دسته «پیتزا» انتخاب شود نمایش داده می‌شود.</p><div class="field"><label>🍕 انتخاب پیتزا</label><select id="pzFood"><option>در حال بارگذاری...</option></select></div><div class="pz-grid"><div class="field"><label>👤 یک‌نفره</label><input id="pzOne" type="number" min="0" placeholder="قیمت"></div><div class="field"><label>👥 دو‌نفره</label><input id="pzTwo" type="number" min="0" placeholder="قیمت"></div><div class="field"><label>👨‍👩‍👧‍👦 خانواده</label><input id="pzFamily" type="number" min="0" placeholder="قیمت"></div></div><button class="btn gold" id="pzSave" type="button">💾 ذخیره قیمت‌های پیتزا</button><p id="pzMsg" class="statusmsg"></p>';
    app.appendChild(panel);
    const select=$('pzFood'),one=$('pzOne'),two=$('pzTwo'),family=$('pzFamily'),msg=$('pzMsg');
    async function load(){
      const ids=Array.from(pizzaCategoryIds);if(!ids.length){msg.textContent='❌ دسته پیتزا پیدا نشد.';return;}
      const r=await db.from('foods').select('id,name,category_id').in('category_id',ids).order('sort_order').order('id');
      if(r.error){msg.textContent='❌ '+r.error.message;return;}
      select.innerHTML=(r.data||[]).map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join('')||'<option value="">پیتزایی وجود ندارد</option>';
      await loadOne();
    }
    async function loadOne(){const id=Number(select.value);if(!id)return;one.value=two.value=family.value='';const r=await db.from('pizza_sizes').select('*').eq('food_id',id).maybeSingle();if(r.data){one.value=r.data.one_price??'';two.value=r.data.two_price??'';family.value=r.data.family_price??'';}}
    function sync(){const yes=pizzaCategoryIds.has(Number(catSelect.value));panel.classList.toggle('hide',!yes);if(yes)load();}
    select.onchange=loadOne;catSelect.addEventListener('change',sync);
    $('pzSave').onclick=async()=>{const id=Number(select.value);if(!id)return;const payload={food_id:id,one_price:Number(one.value)||null,two_price:Number(two.value)||null,family_price:Number(family.value)||null};const r=await db.from('pizza_sizes').upsert(payload,{onConflict:'food_id'});msg.textContent=r.error?'❌ '+r.error.message:'✅ قیمت‌های پیتزا ذخیره شد.';msg.style.color=r.error?'#b52b2b':'#197a4b';if(!r.error){foodSizes[String(id)]=payload;}};
    await fetchPizzaCategories();sync();
  }
  const css=document.createElement('style');css.textContent='.pizza-size-block{margin-top:12px}.pizza-size-title{font-size:13px;font-weight:900;color:#e5a72c;margin:0 0 8px}.pizza-size-list{display:grid;grid-template-columns:1fr;gap:7px}.pizza-size-btn{width:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;border:1px solid #e5a72c;border-radius:11px;background:#fffaf0;color:#071b3d;padding:9px 10px;font:inherit;cursor:pointer}.pizza-size-btn:hover{background:#071b3d;color:#fff}.pizza-size-btn strong{color:#071b3d}.pizza-size-btn:hover strong{color:#f5c54d}.pizza-size-admin{margin-top:18px;padding:18px;border:2px solid #e4b84f;border-radius:14px;background:#fff;box-shadow:0 6px 18px #07172f12}.pizza-size-admin h3{margin:0 0 8px}.pizza-size-admin .pz-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}@media(max-width:700px){.pizza-size-admin .pz-grid{grid-template-columns:1fr}}';document.head.appendChild(css);
  async function boot(){
    await loadSupabase();
    client=getClient();
    if(!client)return;
    await fetchPizzaCategories();
    await fetchSizes();
    if($('foods')){await adminPanel();return;}
    patchRender();
    await syncCustomerMenu();
    setTimeout(decoratePizzaCards,150);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,150));else setTimeout(boot,150);
})();