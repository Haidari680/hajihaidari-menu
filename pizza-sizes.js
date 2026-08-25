/* 🍕 Pizza sizes: admin + customer */
(function(){
  const SIZE_LABELS={one:'👤 یک‌نفره',two:'👥 دو‌نفره',family:'👨‍👩‍👧‍👦 خانواده'};
  const SB_URL='https://bjpascssizuskiujnzvf.supabase.co',SB_KEY='sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvrK';
  let pizzaSizes={},client=null;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  function getClient(){
    if(client)return client;
    try{if(window.supabase?.createClient)client=window.supabase.createClient(SB_URL,SB_KEY);}catch(e){}
    return client;
  }
  async function fetchSizes(){const db=getClient();if(!db)return;try{const r=await db.from('pizza_sizes').select('food_id,one_price,two_price,family_price');if(!r.error)pizzaSizes=Object.fromEntries((r.data||[]).map(x=>[String(x.food_id),x]));}catch(e){}}
  function sizesFor(f){const p=pizzaSizes[String(f.id)];if(!p)return[];return Object.entries({one:p.one_price,two:p.two_price,family:p.family_price}).filter(([,v])=>v!==null&&v!==undefined&&Number(v)>0).map(([key,v])=>({key,label:SIZE_LABELS[key],price:Number(v)}));}
  function isPizza(f){return !!pizzaSizes[String(f.id)]||/پیتزا/i.test(f.cat||'');}
  window.addPizzaToCart=function(id,key){const f=window.foods?.find(x=>String(x.id)===String(id)),p=pizzaSizes[String(id)];if(!f||!p||f.stock_status==='soldout')return;const price=Number(p[key+'_price']||0);if(!price)return;const cartKey=`pz:${id}:${key}`,old=window.cart?.find(x=>String(x.id)===cartKey);if(old)old.q++;else window.cart.push({id:cartKey,food_id:f.id,name:`${f.name} — ${SIZE_LABELS[key]}`,price,q:1,pizzaSize:key});window.saveCart?.();};
  function renderPizza(){if(!window.foods||!window.$||!window.active)return;const d=window.active==='همه'?window.foods:window.foods.filter(f=>f.cat===window.active),grid=window.$('grid');if(!grid)return;grid.innerHTML=d.length?d.map(f=>{const sizes=isPizza(f)?sizesFor(f):[];const actions=sizes.length?`<div class="pizza-sizes">${sizes.map(s=>`<button class="pizza-size" type="button" onclick="addPizzaToCart(${f.id},'${s.key}')"><span>${esc(s.label)}</span><strong>${window.fa(s.price)} افغانی</strong></button>`).join('')}</div>`:`<div class="row"><span class="price">${window.fa(f.price)} افغانی</span><button class="add" ${f.stock_status==='soldout'?'disabled':''} onclick="add(${f.id})">+</button></div>`;return`<article class="card"><div class="photo">${f.image_url?`<img src="${esc(f.image_url)}" loading="lazy" decoding="async" alt="${esc(f.name)}">`:''}<span class="badge ${f.stock_status||'available'}">${window.st?.[f.stock_status]||'موجود'}</span></div><div class="body"><h3>${esc(f.name)}</h3><div class="desc">${esc(f.description||'')}</div>${sizes.length?'<div class="pizza-size-title">🍕 انتخاب اندازه و قیمت</div>':''}${actions}</div></article>`}).join(''):'<div class="empty">در این دسته غذایی نیست.</div>';window.bar?.();}
  async function adminPanel(){
    const app=$('foods'),db=getClient();
    if(!app||!db||$('pizzaSizeAdmin'))return;
    const panel=document.createElement('div');panel.id='pizzaSizeAdmin';panel.className='pizza-size-admin';
    panel.innerHTML='<h3>🍕 اندازه و قیمت پیتزا</h3><p class="muted">برای هر پیتزا قیمت سه اندازه را وارد کن. اندازه بدون قیمت برای مشتری نمایش داده نمی‌شود.</p><div class="field"><label>🍕 انتخاب پیتزا</label><select id="pzFood"><option>در حال بارگذاری...</option></select></div><div class="pz-grid"><div class="field"><label>👤 یک‌نفره</label><input id="pzOne" type="number" min="0" placeholder="قیمت"></div><div class="field"><label>👥 دو‌نفره</label><input id="pzTwo" type="number" min="0" placeholder="قیمت"></div><div class="field"><label>👨‍👩‍👧‍👦 خانواده</label><input id="pzFamily" type="number" min="0" placeholder="قیمت"></div></div><button class="btn gold" id="pzSave" type="button">💾 ذخیره قیمت‌های پیتزا</button><p id="pzMsg" class="statusmsg"></p>';
    app.appendChild(panel);
    const select=$('pzFood'),one=$('pzOne'),two=$('pzTwo'),family=$('pzFamily'),msg=$('pzMsg');
    async function load(){
      const cats=await db.from('categories').select('id,name').order('sort_order');
      const pc=(cats.data||[]).find(c=>/پیتزا/i.test(String(c.name||'')));
      if(!pc){select.innerHTML='<option>دسته پیتزا پیدا نشد</option>';return;}
      const foods=await db.from('foods').select('id,name,category_id').eq('category_id',pc.id).order('sort_order');
      select.innerHTML=(foods.data||[]).map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join('')||'<option value="">پیتزایی وجود ندارد</option>';
      await loadOne();
    }
    async function loadOne(){const id=Number(select.value);if(!id)return;one.value=two.value=family.value='';const r=await db.from('pizza_sizes').select('*').eq('food_id',id).maybeSingle();if(r.data){one.value=r.data.one_price??'';two.value=r.data.two_price??'';family.value=r.data.family_price??'';}}
    select.onchange=loadOne;
    $('pzSave').onclick=async()=>{const id=Number(select.value);if(!id)return;const payload={food_id:id,one_price:Number(one.value)||null,two_price:Number(two.value)||null,family_price:Number(family.value)||null};const r=await db.from('pizza_sizes').upsert(payload,{onConflict:'food_id'});msg.textContent=r.error?'❌ '+r.error.message:'✅ قیمت‌های پیتزا ذخیره شد.';if(!r.error){pizzaSizes[String(id)]=payload;renderPizza();}};
    await load();
  }
  const css=document.createElement('style');css.textContent='.pizza-size-title{font-size:13px;font-weight:900;color:#a66b00;margin:12px 0 8px}.pizza-sizes{display:grid;gap:8px;margin-top:8px}.pizza-size{width:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;border:1px solid #e5a72c;border-radius:12px;background:#fffaf0;color:#071b3d;padding:10px 11px;font:inherit;cursor:pointer}.pizza-size strong{color:#071b3d}.pizza-size:hover{background:#071b3d;color:#fff}.pizza-size:hover strong{color:#f5c54d}.pizza-size-admin{margin-top:18px;padding:18px;border:2px solid #e4b84f;border-radius:14px;background:#fff;box-shadow:0 6px 18px #07172f12}.pizza-size-admin h3{margin:0 0 8px}.pizza-size-admin .pz-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}@media(max-width:700px){.pizza-size-admin .pz-grid{grid-template-columns:1fr}}';document.head.appendChild(css);
  async function boot(){await fetchSizes();if($('foods')){await adminPanel();}else{setTimeout(renderPizza,100);}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,100));else setTimeout(boot,100);
})();