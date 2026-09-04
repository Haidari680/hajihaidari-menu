/* pizza sizes module - stable customer bridge */
(function(){'use strict';
const U='https://bjpascssizuskiujnzvf.supabase.co',K='sb_publishable_VMPeQ2DMNfdwwAEAYQ2Y4A_3idOGTvr';
if(!window.supabase)return;
const db=window.supabase.createClient(U,K);let sizes={};
function addButtons(card,id,s){
 let box=card.querySelector('.pizza-size-options');
 if(!box){box=document.createElement('div');box.className='pizza-size-options';card.appendChild(box)}
 const rows=[['one','👤 یک‌نفره',s.one_price],['two','👥 دو‌نفره',s.two_price],['family','👨‍👩‍👧‍👦 خانوادگی',s.family_price]].filter(x=>x[2]!==null&&x[2]!==undefined&&x[2]!=='');
 box.innerHTML=rows.map(x=>`<button type="button" data-pizza-id="${id}" data-size="${x[0]}" data-price="${x[2]}">${x[1]} — ${Number(x[2]).toLocaleString('fa-AF')} افغانی</button>`).join('');
 box.querySelectorAll('button').forEach(b=>b.onclick=()=>{
   const foodId=Number(b.dataset.pizzaId),price=Number(b.dataset.price),size=b.dataset.size;
   if(typeof window.addToCart==='function') window.addToCart(foodId,price,size);
   else if(typeof window.add==='function') window.add(foodId,price,size);
 });
}
function cardId(card){
 let id=Number(card.dataset.foodId||card.dataset.id||0);if(id)return id;
 const selectors=['button[onclick*="addToCart"]','button[onclick*="add("]','button[onclick*="add ("]'];
 for(const sel of selectors){
   const b=card.querySelector(sel);
   if(b){const m=(b.getAttribute('onclick')||'').match(/(?:addToCart|add)\s*\(\s*(\d+)/);if(m)return Number(m[1])}
 }
 const all=card.querySelectorAll('[data-id],[data-food-id]');for(const e of all){id=Number(e.dataset.foodId||e.dataset.id||0);if(id)return id}
 return 0;
}
function render(){document.querySelectorAll('#grid .card,.grid .card,.card').forEach(card=>{const id=cardId(card),s=sizes[id];if(id&&s)addButtons(card,id,s)})}
async function load(){try{const p=await db.from('pizza_sizes').select('food_id,one_price,two_price,family_price');if(p.error)throw p.error;sizes={};(p.data||[]).forEach(x=>sizes[Number(x.food_id)]=x);render();const obs=new MutationObserver(()=>render());obs.observe(document.getElementById('grid')||document.body,{childList:true,subtree:true});let tries=0;const timer=setInterval(()=>{render();if(++tries>=60)clearInterval(timer)},500);if(!document.getElementById('pizza-size-style')){const st=document.createElement('style');st.id='pizza-size-style';st.textContent='.pizza-size-options{display:grid;gap:7px;margin-top:10px}.pizza-size-options button{width:100%;border:1px solid #e8b84f;border-radius:10px;padding:8px;background:#06152f;color:#f5d27a;font-weight:800}.pizza-size-options button:active{transform:scale(.99)}';document.head.appendChild(st)}}catch(e){console.warn('pizza sizes:',e)}}
window.loadPizzaModule=load;load();
})();
// FINAL-STABLE-PIZZA-PRICES-2026-09-04-CART