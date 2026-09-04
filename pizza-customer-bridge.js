/* Customer pizza size/price bridge - stable 2026-09-04 */
(function(){
  'use strict';
  const U='https://bjpascssizuskiujnzvf.supabase.co';
  const K='sb_publishable_VMPeQ2DMNfdwwAEAYQ2Y4A_3idOGTvr';
  let db, rows=[];
  const money=n=>Number(n||0).toLocaleString('fa-AF');
  function findCard(food){
    const cards=[...document.querySelectorAll('#grid .card,.grid .card,.card')];
    return cards.find(card=>{
      const h=card.querySelector('h3');
      return h && h.textContent.trim()===String(food.name||'').trim();
    });
  }
  function render(){
    rows.forEach(food=>{
      const card=findCard(food);
      if(!card) return;
      let box=card.querySelector('.pizza-size-options');
      if(!box){ box=document.createElement('div'); box.className='pizza-size-options'; card.appendChild(box); }
      const values=[
        ['one','👤 یک‌نفره',food.one_price],
        ['two','👥 دو‌نفره',food.two_price],
        ['family','👨‍👩‍👧‍👦 خانوادگی',food.family_price]
      ].filter(x=>x[2]!==null && x[2]!==undefined && x[2]!=='');
      if(!values.length){ box.innerHTML=''; return; }
      box.innerHTML=values.map(x=>`<button type="button" data-food-id="${food.food_id}" data-size="${x[0]}" data-price="${x[2]}">${x[1]} — ${money(x[2])} افغانی</button>`).join('');
      box.querySelectorAll('button').forEach(btn=>btn.onclick=function(){
        if(typeof window.addToCart==='function') window.addToCart(Number(this.dataset.foodId),Number(this.dataset.price),this.dataset.size);
      });
    });
  }
  async function load(){
    try{
      if(!window.supabase) return;
      db=window.supabase.createClient(U,K);
      const r=await db.from('pizza_sizes').select('food_id,one_price,two_price,family_price');
      if(r.error) throw r.error;
      rows=r.data||[];
      if(!rows.length) return;
      const f=await db.from('foods').select('id,name').in('id',rows.map(x=>x.food_id));
      if(f.error) throw f.error;
      const names=new Map((f.data||[]).map(x=>[Number(x.id),x.name]));
      rows=rows.map(x=>({...x,name:names.get(Number(x.food_id))||''})).filter(x=>x.name);
      render();
      const target=document.getElementById('grid')||document.body;
      new MutationObserver(render).observe(target,{childList:true,subtree:true});
      let tries=0;
      const timer=setInterval(()=>{render(); if(++tries>=60) clearInterval(timer)},500);
    }catch(e){ console.warn('pizza customer bridge:',e); }
  }
  const boot=()=>load();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
