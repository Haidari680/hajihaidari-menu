/* pizza sizes module - FINAL CUSTOMER BRIDGE */
(function(){'use strict';
const U='https://bjpascssizuskiujnzvf.supabase.co',K='sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvr';
if(!window.supabase)return;
const db=window.supabase.createClient(U,K);
let sizes={};

function money(v){return Number(v||0).toLocaleString('fa-AF')}

function addButtons(card,id,s){
 let box=card.querySelector('.pizza-sizes');
 if(!box){box=document.createElement('div');box.className='pizza-sizes';card.appendChild(box)}
 const rows=[['one','👤 یک‌نفره',s.one_price],['two','👥 دو‌نفره',s.two_price],['family','👨‍👩‍👧 خانواده',s.family_price]].filter(x=>x[2]!==null&&x[2]!==undefined&&x[2]!=='');
 box.innerHTML=rows.map(x=>`<button type="button" data-pizza-id="${id}" data-size="${x[0]}" data-price="${x[2]}">${x[1]} — ${money(x[2])} افغانی</button>`).join('');
 box.querySelectorAll('button').forEach(b=>b.onclick=()=>{
   const fn=window.addToCart;
   if(typeof fn==='function') fn(Number(b.dataset.pizzaId),Number(b.dataset.price),b.dataset.size);
 });
}

function cardId(card){
 let id=Number(card.dataset.foodId||card.dataset.id||0); if(id)return id;
 const els=card.querySelectorAll('[data-food-id],[data-id]');
 for(const e of els){id=Number(e.dataset.foodId||e.dataset.id||0);if(id)return id}
 const buttons=card.querySelectorAll('[onclick]');
 for(const b of buttons){const text=b.getAttribute('onclick')||'';const m=text.match(/(?:addToCart|openEdit)\s*\(\s*(\d+)/);if(m)return Number(m[1])}
 return 0;
}

function render(){
 document.querySelectorAll('.card').forEach(card=>{
   const id=cardId(card),s=sizes[id];
   if(id&&s)addButtons(card,id,s);
 });
}

function fixImages(){
 document.querySelectorAll('.card .photo img').forEach(img=>{
   img.style.objectFit='contain';
   img.style.width='100%';
   img.style.height='100%';
   img.style.display='block';
   img.style.background='#0b2547';
   img.style.padding='4px';
 });
}

async function load(){
 try{
  const p=await db.from('pizza_sizes').select('food_id,one_price,two_price,family_price');
  if(p.error)throw p.error;
  sizes={};
  (p.data||[]).forEach(x=>{sizes[Number(x.food_id)]=x});
  render();fixImages();
  const root=document.getElementById('grid')||document.body;
  const obs=new MutationObserver(()=>{render();fixImages()});
  obs.observe(root,{childList:true,subtree:true});
  let tries=0;
  const timer=setInterval(()=>{render();fixImages();if(++tries>=60)clearInterval(timer)},500);
  if(!document.getElementById('pizza-size-style')){
   const st=document.createElement('style');st.id='pizza-size-style';
   st.textContent='.card .photo{background:#0b2547;overflow:hidden;display:flex;align-items:center;justify-content:center}.card .photo img{object-fit:contain!important;width:100%!important;height:100%!important;display:block!important;padding:4px!important}.pizza-sizes{display:grid;grid-template-columns:1fr;gap:7px;margin-top:10px}.pizza-sizes button{width:100%;border:1px solid #e8b84f;border-radius:10px;padding:8px;background:#06152f;color:#f5d27a;font-weight:800}';
   document.head.appendChild(st);
  }
 }catch(e){console.warn('pizza sizes:',e)}
}
window.loadPizzaModule=load;
load();
})();
// CUSTOMER-PIZZA-IMAGE-PRICE-FINAL-2026-09-02