/* Robust admin pizza editor. Loaded only by admin.html. */
(function(){
'use strict';
const U='https://bjpascssizuskiujnzvf.supabase.co';
const K='sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvrK';
const db=window.supabase?.createClient(U,K);
const $=id=>document.getElementById(id);
function isPizza(f){return !!f && /پیتزا|pizza/i.test(String(f.categories?.name||''));}
async function init(){if(!db||!$('foodList'))return;let n=0;const timer=setInterval(()=>{n++;if(typeof window.openEdit==='function'&&typeof window.saveEdit==='function'){clearInterval(timer);install()}if(n>100)clearInterval(timer)},250)}
function install(){
 if(window.openEdit.__pizzaFix)return;
 const originalOpen=window.openEdit;
 window.openEdit=async function(id){
  originalOpen(id); const f=(window.foodsCache||[]).find(x=>Number(x.id)===Number(id)); const old=$('pizzaAdminFix');if(old)old.remove();if(!isPizza(f))return;
  const box=document.createElement('div');box.id='pizzaAdminFix';box.style.cssText='margin:14px 0;padding:14px;border:2px solid #e4b84f;border-radius:14px;background:#fffaf0';
  box.innerHTML='<h3 style="margin:0 0 12px">🍕 اندازه و قیمت پیتزا</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px"><label>👤 یک‌نفره<input id="pizzaOnePrice" type="number" min="0" style="display:block;width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:9px"></label><label>👥 دو‌نفره<input id="pizzaTwoPrice" type="number" min="0" style="display:block;width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:9px"></label><label>👨‍👩‍👧 خانواده<input id="pizzaFamilyPrice" type="number" min="0" style="display:block;width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:9px"></label></div>';
  $('ef').closest('.grid').after(box); const r=await db.from('pizza_sizes').select('one_price,two_price,family_price').eq('food_id',id).maybeSingle();if(r.error){$('editMsg').textContent='❌ خطا در خواندن قیمت پیتزا: '+r.error.message;return;}$('pizzaOnePrice').value=r.data?.one_price??'';$('pizzaTwoPrice').value=r.data?.two_price??'';$('pizzaFamilyPrice').value=r.data?.family_price??'';
 };window.openEdit.__pizzaFix=true;
 const originalSave=window.saveEdit;window.saveEdit=async function(){const id=Number($('editId').value),f=(window.foodsCache||[]).find(x=>Number(x.id)===id);if(isPizza(f)&&$('pizzaAdminFix')){const row={food_id:id,one_price:Number($('pizzaOnePrice').value||0),two_price:Number($('pizzaTwoPrice').value||0),family_price:Number($('pizzaFamilyPrice').value||0)};const r=await db.from('pizza_sizes').upsert(row,{onConflict:'food_id'});if(r.error){$('editMsg').textContent='❌ ذخیره قیمت پیتزا: '+r.error.message;$('editMsg').style.color='#b52b2b';return}}await originalSave()};window.saveEdit.__pizzaFix=true;
 const s=document.createElement('style');s.textContent='@media(max-width:700px){#pizzaAdminFix>div{grid-template-columns:1fr!important}}';document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,300));else setTimeout(init,300);
})();
// v2: force-load marker
