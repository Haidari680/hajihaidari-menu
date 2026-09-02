/* pizza sizes module - stable customer bridge */
(function(){'use strict';
const U='https://bjpascssizuskiujnzvf.supabase.co',K='sb_publishable_VMPeQ2DMNfdwwAEAYQ2Y4A_3idOGTvr';
if(!window.supabase)return;
const db=window.supabase.createClient(U,K);
const pizzaName=/پیتزا|pizza/i;
let sizes={};

function pizzaIds(categories){return (categories||[]).filter(x=>pizzaName.test(x.name||'')).map(x=>Number(x.id));}
function addButtons(card,id,s){
  let box=card.querySelector('.pizza-sizes');
  if(!box){box=document.createElement('div');box.className='pizza-sizes';card.appendChild(box)}
  const rows=[['one','👤 یک‌نفره',s.one_price],['two','👥 دو‌نفره',s.two_price],['family','👨‍👩‍👧 خانواده',s.family_price]].filter(x=>x[2]!==null&&x[2]!==undefined&&x[2]!=='');
  box.innerHTML=rows.map(x=>`<button type="button" data-pizza-id="${id}" data-size="${x[0]}" data-price="${x[2]}">${x[1]} — ${Number(x[2]).toLocaleString('fa-AF')} افغانی</button>`).join('');
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(typeof window.addToCart==='function')window.addToCart(Number(b.dataset.pizzaId),Number(b.dataset.price),b.dataset.size)});
}
function render(ids){
  const foods=Array.isArray(window.foods)?window.foods:[];
  if(!foods.length)return false;
  let rendered=false;
  document.querySelectorAll('.card').forEach(card=>{
    const id=Number(card.dataset.foodId||card.getAttribute('data-id'));
    if(!id)return;
    const f=foods.find(x=>Number(x.id)===id);
    if(!f||!ids.includes(Number(f.category_id)))return;
    const s=sizes[id];
    if(s){addButtons(card,id,s);rendered=true}
  });
  return rendered;
}
async function load(){
  try{
    const c=await db.from('categories').select('id,name');
    if(c.error)throw c.error;
    const ids=pizzaIds(c.data);
    if(!ids.length)return;
    const p=await db.from('pizza_sizes').select('food_id,one_price,two_price,family_price');
    if(p.error)throw p.error;
    sizes={};(p.data||[]).forEach(x=>sizes[Number(x.food_id)]=x);
    render(ids);
    /* index.html loads foods/cards asynchronously; render again after they exist */
    let tries=0;const timer=setInterval(()=>{tries++;render(ids);if(tries>=30)clearInterval(timer)},500);
    /* protect pizza image from cropping */
    if(!document.getElementById('pizza-size-style')){const st=document.createElement('style');st.id='pizza-size-style';st.textContent='.card .photo img{object-fit:contain!important;width:100%!important;height:100%!important} .pizza-sizes{display:grid;gap:7px;margin-top:10px}.pizza-sizes button{width:100%;border:1px solid #e8b84f;border-radius:10px;padding:8px;background:#06152f;color:#f5d27a;font-weight:800}';document.head.appendChild(st)}
  }catch(e){console.warn('pizza sizes:',e)}
}
window.loadPizzaModule=load;
load();
})();
// FIX-CUSTOMER-RENDER-AFTER-FOODS-2026-09-02