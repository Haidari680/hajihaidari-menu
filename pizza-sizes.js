/* 🍕 Pizza sizes: one-person / two-person / family */
(function(){
  const SIZE_LABELS={one:'👤 یک‌نفره',two:'👥 دو‌نفره',family:'👨‍👩‍👧‍👦 خانواده'};
  const SIZE_KEYS=['one','two','family'];
  let pizzaSizes={};
  let loaded=false;

  function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
  function isPizza(item){
    const c=(window.data?.categories||[]).find(x=>x.id==item.category);
    return !!c && String(c.name||'').includes('پیتزا');
  }
  async function fetchSizes(){
    if(!window.sb || !window.data) return;
    const ids=(window.data.items||[]).filter(isPizza).map(x=>x.id).filter(Boolean);
    if(!ids.length){loaded=true;return}
    const r=await window.sb.from('pizza_sizes').select('*').in('food_id',ids);
    if(!r.error) (r.data||[]).forEach(x=>{pizzaSizes[x.food_id]={one:x.one_price,two:x.two_price,family:x.family_price}});
    loaded=true;
  }
  function sizeRows(item){
    const s=pizzaSizes[item.id]||{};
    return SIZE_KEYS.map(k=>s[k]!=null&&Number(s[k])>0?`<button type="button" class="pz-size-btn" onclick="addPizzaToCart(${item.id},'${k}',${Number(s[k])})">${SIZE_LABELS[k]} — ${Number(s[k])} افغانی</button>`:'').join('');
  }
  window.addPizzaToCart=function(id,key,price){
    const item=(window.data?.items||[]).find(x=>x.id==id); if(!item)return;
    const chosen={...item,price:Number(price),pizzaSize:key,pizzaSizeLabel:SIZE_LABELS[key]};
    if(Array.isArray(window.cart)) window.cart.push(chosen);
    const cc=document.getElementById('cartCount'); if(cc) cc.textContent=window.cart?.length||0;
    alert(`${item.name} — ${SIZE_LABELS[key]} به ${window.data.settings.cartName} اضافه شد.`);
  };

  function injectStyles(){
    if(document.getElementById('pizza-size-style'))return;
    const st=document.createElement('style');st.id='pizza-size-style';st.textContent='.pizza-sizes{display:grid;gap:7px;margin:10px 0}.pz-size-btn{width:100%;border:1px solid #e5a72c;background:#fff;border-radius:10px;padding:9px;color:#071b3d;font-weight:800;cursor:pointer}.pz-size-btn:hover{background:#f8e4ad}.pizza-size-admin{margin-top:14px;padding:14px;border:1px solid #e5a72c;border-radius:14px;background:#fff}.pizza-size-admin .pz-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pizza-size-admin input{width:100%;padding:9px;border:1px solid #d9dee6;border-radius:9px}@media(max-width:650px){.pizza-size-admin .pz-grid{grid-template-columns:1fr}}';document.head.appendChild(st);
  }

  async function refreshCustomer(){
    if(!window.data)return;
    await fetchSizes();
    if(typeof window.renderMenu==='function') window.renderMenu();
  }
  const oldRender=window.renderMenu;
  if(oldRender){
    window.renderMenu=async function(){
      const r=oldRender.apply(this,arguments);
      if(r && typeof r.then==='function') await r;
      if(!loaded) await fetchSizes();
      if(!window.data)return;
      const items=(window.data.items||[]).filter(isPizza);
      document.querySelectorAll('#menu .card').forEach(card=>{
        const h=card.querySelector('h3'); if(!h)return;
        const item=items.find(x=>h.textContent.trim()===String(x.name).trim()); if(!item)return;
        const body=card.querySelector('.card-body'); if(!body)return;
        const old=body.querySelector('.pizza-sizes'); if(old)old.remove();
        const html=sizeRows(item); if(!html)return;
        const wrap=document.createElement('div');wrap.className='pizza-sizes';wrap.innerHTML=html;
        const price=body.querySelector('.price'); if(price) price.style.display='none';
        const actions=body.querySelector('.card-actions'); if(actions) actions.style.display='none';
        body.insertBefore(wrap,body.querySelector('.rating')?.nextSibling || null);
      });
    };
  }

  async function initAdmin(){
    if(!window.sb)return;
    injectStyles();
    const app=document.getElementById('foods'); if(!app || document.getElementById('pizzaSizeAdmin'))return;
    const panel=document.createElement('div');panel.id='pizzaSizeAdmin';panel.className='pizza-size-admin';
    panel.innerHTML='<h3>🍕 اندازه و قیمت پیتزا</h3><p class="muted">فقط برای دسته پیتزا. هر اندازه‌ای که قیمت نداشته باشد نمایش داده نمی‌شود.</p><select id="pzFoodSelect" style="width:100%;padding:10px;border:1px solid #d9dee6;border-radius:9px"></select><div class="pz-grid" style="margin-top:10px"><input id="pzOne" type="number" placeholder="قیمت یک‌نفره"><input id="pzTwo" type="number" placeholder="قیمت دو‌نفره"><input id="pzFamily" type="number" placeholder="قیمت خانواده"></div><button class="btn gold" id="pzSave" style="margin-top:10px">💾 ذخیره قیمت‌های پیتزا</button><p id="pzMsg" class="statusmsg"></p>';
    app.appendChild(panel);
    const cats=(await window.sb.from('categories').select('id,name')).data||[];
    const pc=cats.find(c=>String(c.name||'').includes('پیتزا'));
    const foods=(await window.sb.from('foods').select('id,name,category_id').eq('category_id',pc?.id||-1)).data||[];
    const sel=document.getElementById('pzFoodSelect');sel.innerHTML=foods.map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join('');
    async function loadOne(){const id=Number(sel.value);const r=await window.sb.from('pizza_sizes').select('*').eq('food_id',id).maybeSingle();const x=r.data||{};pzOne.value=x.one_price||'';pzTwo.value=x.two_price||'';pzFamily.value=x.family_price||''}
    sel.onchange=loadOne; if(foods.length)await loadOne();
    document.getElementById('pzSave').onclick=async()=>{const food_id=Number(sel.value);if(!food_id)return;const payload={food_id,one_price:Number(pzOne.value)||null,two_price:Number(pzTwo.value)||null,family_price:Number(pzFamily.value)||null};const r=await window.sb.from('pizza_sizes').upsert(payload,{onConflict:'food_id'});pzMsg.textContent=r.error?'❌ '+r.error.message:'✅ قیمت‌های پیتزا ذخیره شد.';if(!r.error){pizzaSizes[food_id]={one:payload.one_price,two:payload.two_price,family:payload.family_price};}};
  }

  injectStyles();
  if(document.getElementById('foods')) setTimeout(initAdmin,1200);
  else setTimeout(()=>{if(window.data)refreshCustomer()},1200);
})();
