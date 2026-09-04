/* Customer pizza size/price bridge - FINAL 2026-09-05 */
(function(){
  'use strict';
  const U='https://bjpascssizuskiujnzvf.supabase.co';
  const K='sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvr';
  const money=n=>Number(n||0).toLocaleString('fa-AF');
  let rows=[];
  function cards(){return [...document.querySelectorAll('#grid .card')];}
  function findCard(food){
    const name=String(food.name||'').trim();
    return cards().find(card=>String(card.querySelector('h3')?.textContent||'').trim()===name);
  }
  function render(){
    if(!rows.length)return;
    rows.forEach(food=>{
      const card=findCard(food); if(!card)return;
      let box=card.querySelector('.pizza-size-options');
      if(!box){
        box=document.createElement('div');
        box.className='pizza-size-options';
        const body=card.querySelector('.body')||card;
        const row=body.querySelector('.row');
        row?body.insertBefore(box,row):body.appendChild(box);
      }
      const values=[
        ['one','👤 یک‌نفره',food.one_price],
        ['two','👥 دو‌نفره',food.two_price],
        ['family','👨‍👩‍👧‍👦 خانوادگی',food.family_price]
      ].filter(x=>x[2]!==null&&x[2]!==undefined&&x[2]!=='');
      box.innerHTML=values.map(x=>`<button type="button" data-food-id="${food.food_id}" data-size="${x[0]}" data-price="${x[2]}">${x[1]} — ${money(x[2])} افغانی</button>`).join('');
      box.querySelectorAll('button').forEach(btn=>btn.onclick=function(){
        const id=Number(this.dataset.foodId), price=Number(this.dataset.price), size=this.dataset.size;
        if(typeof window.addToCart==='function') window.addToCart(id,price,size);
        else if(typeof window.add==='function') window.add(id,price,size);
      });
    });
  }
  async function load(){
    try{
      if(!window.supabase)return;
      const db=window.supabase.createClient(U,K);
      const r=await db.from('pizza_sizes').select('food_id,one_price,two_price,family_price');
      if(r.error)throw r.error;
      const raw=r.data||[];
      if(!raw.length)return;
      const ids=[...new Set(raw.map(x=>Number(x.food_id)).filter(Boolean))];
      const f=await db.from('foods').select('id,name').in('id',ids);
      if(f.error)throw f.error;
      const names=new Map((f.data||[]).map(x=>[Number(x.id),String(x.name||'').trim()]));
      rows=raw.map(x=>{const id=Number(x.food_id);return {...x,food_id:id,name:names.get(id)||''}}).filter(x=>x.name);
      render();
      const target=document.getElementById('grid')||document.body;
      new MutationObserver(render).observe(target,{childList:true,subtree:true});
      let tries=0;
      const timer=setInterval(()=>{render();if(++tries>=120)clearInterval(timer)},250);
    }catch(e){console.warn('pizza customer bridge:',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
