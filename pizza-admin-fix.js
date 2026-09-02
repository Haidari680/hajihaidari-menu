/* FINAL admin pizza editor fix - legacy anon compatibility + stable pizza fields + RLS session */
(function(){
'use strict';
const U='https://bjpascssizuskiujnzvf.supabase.co';
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcGFzY3NzaXp1c2tpdWpuenZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzE3MDUsImV4cCI6MjEwMjY0NzcwNX0.bo8Q2OaYZsa9lm1j0wRY2CAfubbjyX3vcjq9vntuBds';
const db=window.supabase?.createClient(U,K);
const $=id=>document.getElementById(id);
function msg(id,t,c){const x=$(id);if(x){x.textContent=t;x.style.color=c||''}}
async function ensureAdminSession(){
 if(!db)throw new Error('اتصال Supabase برقرار نیست');
 let r=await db.auth.getSession();
 if(!r.data?.session){try{await db.auth.refreshSession()}catch(e){}}
 r=await db.auth.getSession();
 if(!r.data?.session)throw new Error('نشست مدیر معتبر نیست؛ دوباره وارد مدیریت شوید');
 return r.data.session;
}
async function getFood(id){
 const r=await db.from('foods').select('id,name,price,image_url,description,category_id,stock_status,active,daily,categories(name)').eq('id',id).single();
 if(r.error)throw r.error;return r.data;
}
function pizza(f){return /پیتزا|pizza/i.test(String(f?.categories?.name||''))}
function removeBox(){const x=$('pizzaAdminFix');if(x)x.remove()}
function addBox(){
 removeBox();
 const box=document.createElement('div');box.id='pizzaAdminFix';box.style.cssText='margin:14px 0;padding:14px;border:2px solid #e4b84f;border-radius:14px;background:#fffaf0';
 box.innerHTML='<h3 style="margin:0 0 12px">🍕 اندازه و قیمت پیتزا</h3><div class="pizza-price-grid"><label>👤 یک‌نفره<input id="pizzaOnePrice" type="number" min="0"></label><label>👥 دو‌نفره<input id="pizzaTwoPrice" type="number" min="0"></label><label>👨‍👩‍👧 خانواده<input id="pizzaFamilyPrice" type="number" min="0"></label></div>';
 const ef=$('ef');if(ef&&ef.closest('.grid'))ef.closest('.grid').after(box);else $('ed')?.parentElement?.after(box);
 return box;
}
async function ensureCategories(currentId){
 const r=await db.from('categories').select('id,name,active').order('sort_order');
 if(r.error)throw r.error;
 const cats=r.data||[];const active=cats.filter(c=>c.active||Number(c.id)===Number(currentId));
 $('ec').innerHTML=active.map(c=>`<option value="${c.id}">${String(c.name||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</option>`).join('');
 $('ec').value=String(currentId??'');
}
async function openPizza(id){
 const f=await getFood(id);
 await ensureCategories(f.category_id);
 $('editId').value=f.id;$('en').value=f.name||'';$('ep').value=f.price??'';$('es').value=f.stock_status||'available';$('ed').value=f.description||'';$('edaily').checked=!!f.daily;$('ef').value='';
 msg('editMsg','');$('editModal').classList.remove('hide');
 if(!pizza(f)){removeBox();return}
 addBox();
 const r=await db.from('pizza_sizes').select('one_price,two_price,family_price').eq('food_id',id).maybeSingle();
 if(r.error){msg('editMsg','❌ خطا در خواندن قیمت پیتزا: '+r.error.message,'#b52b2b');return}
 $('pizzaOnePrice').value=r.data?.one_price??'';$('pizzaTwoPrice').value=r.data?.two_price??'';$('pizzaFamilyPrice').value=r.data?.family_price??'';
}
window.openEdit=async function(id){try{await openPizza(Number(id))}catch(e){msg('editMsg','❌ '+(e?.message||'خطا در باز کردن ویرایش'),'#b52b2b');$('editModal')?.classList.remove('hide')}};
window.saveEdit=async function(){
 const id=Number($('editId').value);const v={name:$('en').value.trim(),price:Number($('ep').value||0),category_id:Number($('ec').value),description:$('ed').value.trim()||null,stock_status:$('es').value,daily:$('edaily').checked};
 if(!v.name||!v.category_id)return msg('editMsg','❌ نام و دسته را کامل کنید.','#b52b2b');
 $('saveEditBtn').disabled=true;
 try{
  await ensureAdminSession();
  const f=await getFood(id);const file=$('ef').files[0];
  if(file){const p='site/'+crypto.randomUUID()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const u=await db.storage.from('food-images').upload(p,file,{upsert:false});if(u.error)throw u.error;v.image_url=db.storage.from('food-images').getPublicUrl(p).data.publicUrl}
  const r=await db.from('foods').update(v).eq('id',id);if(r.error)throw r.error;
  if(pizza(f)){
   const row={food_id:id,one_price:Number($('pizzaOnePrice')?.value||0),two_price:Number($('pizzaTwoPrice')?.value||0),family_price:Number($('pizzaFamilyPrice')?.value||0)};
   const pz=await db.from('pizza_sizes').upsert(row,{onConflict:'food_id'});if(pz.error)throw pz.error;
  }
  msg('editMsg','✅ تغییرات با موفقیت ذخیره شد.','#197a4b');
  if(typeof window.loadFoods==='function')await window.loadFoods($('fc').value);
  setTimeout(()=>{removeBox();$('editModal').classList.add('hide')},500);
 }catch(e){msg('editMsg','❌ '+(e?.message||'خطا در ذخیره'),'#b52b2b')}
 finally{$('saveEditBtn').disabled=false}
};
const save=$('saveEditBtn');if(save){save.onclick=window.saveEdit;save.addEventListener('click',e=>{if(save.onclick!==window.saveEdit){e.preventDefault();e.stopImmediatePropagation();window.saveEdit()}},true)}
const s=document.createElement('style');s.textContent='#pizzaAdminFix{order:9}.pizza-price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.pizza-price-grid label{font-weight:700}.pizza-price-grid input{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:10px;border:1px solid #ccc;border-radius:9px;font:inherit}@media(max-width:700px){.pizza-price-grid{grid-template-columns:1fr}}';document.head.appendChild(s);
document.addEventListener('click',function(e){const btn=e.target.closest('button');if(!btn)return;const text=(btn.textContent||'').trim();if(!text.includes('ویرایش'))return;const m=btn.getAttribute('onclick')||'';const hit=m.match(/openEdit\((\d+)\)/);if(!hit)return;e.preventDefault();e.stopImmediatePropagation();window.openEdit(Number(hit[1]));},true);
})();
// PIZZA-EDIT-STABLE-2026-09-02-LEGACY-KEY