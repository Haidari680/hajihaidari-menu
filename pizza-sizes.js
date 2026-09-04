/* pizza sizes - reliable customer renderer 2026-09-04 */
(function(){
'use strict';
const U='https://bjpascssizuskiujnzvf.supabase.co';
const K='sb_publishable_VMPeQ2DMNfdwwAEAYQ2Y4A_3idOGTvr';
let sizes={};
const money=n=>Number(n||0).toLocaleString('fa-AF');
function cards(){return [...document.querySelectorAll('#grid article.card,.grid article.card,#grid .card,.grid .card')];}
function render(){cards().forEach(card=>{
 const h=card.querySelector('.body h3,h3'); if(!h)return;
 const name=h.textContent.trim();
 const item=Object.values(sizes).find(x=>x.name===name); if(!item)return;
 let box=card.querySelector('.pizza-size-options');
 if(!box){box=document.createElement('div');box.className='pizza-size-options';const row=card.querySelector('.row');if(row)row.parentNode.insertBefore(box,row);else card.appendChild(box)}
 const rows=[['one','👤 یک‌نفره',item.one_price],['two','👥 دو‌نفره',item.two_price],['family','👨‍👩‍👧‍👦 خانوادگی',item.family_price]].filter(x=>x[2]!==null&&x[2]!==undefined&&x[2]!=='');
 box.innerHTML=rows.map(x=>`<button type="button" data-food-id="${item.food_id}" data-size="${x[0]}" data-price="${x[2]}">${x[1]} — ${money(x[2])} افغانی</button>`).join('');
 box.querySelectorAll('button').forEach(b=>b.onclick=()=>{
   const id=Number(b.dataset.foodId),price=Number(b.dataset.price),size=b.dataset.size;
   if(typeof window.addToCart==='function')window.addToCart(id,price,size);
   else if(typeof window.add==='function')window.add(id,price,size);
 });
});}
async function load(){
 try{
  const r=await fetch(U+'/rest/v1/pizza_sizes?select=food_id,one_price,two_price,family_price',{headers:{apikey:K,Authorization:'Bearer '+K}});
  if(!r.ok)throw Error('pizza_sizes '+r.status);
  const data=await r.json();const ids=data.map(x=>x.food_id).filter(Boolean);if(!ids.length)return;
  const f=await fetch(U+'/rest/v1/foods?select=id,name&id=in.('+ids.join(',')+')',{headers:{apikey:K,Authorization:'Bearer '+K}});
  if(!f.ok)throw Error('foods '+f.status);
  const foods=await f.json();const names=new Map(foods.map(x=>[Number(x.id),x.name]));sizes={};
  data.forEach(x=>{const id=Number(x.food_id),name=names.get(id);if(name)sizes[id]={...x,food_id:id,name:String(name).trim()};});
  render();
 }catch(e){console.warn('pizza sizes:',e)}
}
function boot(){
 if(!document.getElementById('pizza-size-style')){const st=document.createElement('style');st.id='pizza-size-style';st.textContent='.pizza-size-options{display:grid;gap:7px;margin:10px 0}.pizza-size-options button{width:100%;border:1px solid #e8b84f;border-radius:10px;padding:8px;background:#06152f;color:#f5d27a;font-weight:800;font-family:inherit}.pizza-size-options button:active{transform:scale(.99)}';document.head.appendChild(st)}
 load();const target=document.getElementById('grid')||document.body;new MutationObserver(render).observe(target,{childList:true,subtree:true});let n=0;const t=setInterval(()=>{render();if(++n>=120)clearInterval(t)},500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
// FINAL-RELIABLE-PIZZA-PRICES-2026-09-04