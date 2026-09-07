(()=>{
  const wait=fn=>{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn()};
  wait(()=>{
    const foods=document.getElementById('foods'), list=document.getElementById('foodList');
    if(!foods||!list||typeof sb==='undefined') return;
    const box=document.createElement('div');
    box.className='field';
    box.style.margin='12px 0';
    box.innerHTML='<label>🔎 نمایش فقط یک دسته</label><select id="foodCategoryFilter"><option value="">همه دسته‌ها</option></select>';
    foods.insertBefore(box,list);
    const filter=document.getElementById('foodCategoryFilter');
    const loadFilterCats=async()=>{
      const r=await sb.from('categories').select('id,name').order('sort_order');
      if(!r.error) filter.innerHTML='<option value="">همه دسته‌ها</option>'+(r.data||[]).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
    };
    const loadFilteredFoods=async()=>{
      let q=sb.from('foods').select('id,name,price,image_url,stock_status,active,daily,categories(name)').order('id',{ascending:false});
      if(filter.value) q=q.eq('category_id',Number(filter.value));
      const r=await q;
      if(r.error){list.innerHTML='<p>'+esc(r.error.message)+'</p>';return;}
      const data=r.data||[];
      list.innerHTML=data.length?data.map(f=>`<div class="item"><div class="row"><div style="flex:1"><b>${esc(f.name)}</b><div class="muted">دسته: ${esc(f.categories?.name||'بدون دسته')} | قیمت: ${esc(f.price)}</div><div class="muted">${f.daily?'⭐ غذای روز | ':''}${f.stock_status==='available'?'🟢 موجود':f.stock_status==='low'?'🟠 موجودی کم':f.stock_status==='soldout'?'🔴 تمام شده':'🔵 به‌زودی'}</div></div>${f.image_url?`<img class="thumb" src="${esc(f.image_url)}" alt="${esc(f.name)}">`:''}</div><div class="row" style="margin-top:8px"><button class="btn ${f.active?'danger':'ok'}" onclick="toggleFood(${f.id},${f.active})">${f.active?'خاموش':'فعال'}</button><button class="btn danger" onclick="delFood(${f.id})">حذف</button></div></div>`).join(''):'<p class="muted">در این دسته غذایی ثبت نشده است.</p>';
    };
    filter.addEventListener('change',loadFilteredFoods);
    window.loadFoods=loadFilteredFoods;
    loadFilterCats().then(loadFilteredFoods);
  });
})();
