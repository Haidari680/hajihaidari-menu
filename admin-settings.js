(() => {
  const ready = () => {
    if (!window.sb || !document.getElementById('app')) return setTimeout(ready, 250);
    if (document.getElementById('featureSettings')) return;
    const panel = document.createElement('section');
    panel.id = 'featureSettings';
    panel.className = 'panel';
    panel.innerHTML = `<h2>⚙️ کنترل امکانات منو</h2><p class="muted">مشخص کن کدام دکمه‌ها برای مشتری در صفحه دیده شوند.</p><div class="row" style="gap:18px"><label class="item" style="flex:1;min-width:240px;cursor:pointer"><input id="showCartSetting" type="checkbox" checked> 🛒 نمایش سبد خرید در منوی مشتری</label><label class="item" style="flex:1;min-width:240px;cursor:pointer"><input id="showWaiterSetting" type="checkbox" checked> 🔔 نمایش فراخوان گارسون در منوی مشتری</label></div><button id="saveFeatureSettings" class="btn gold" type="button">💾 ذخیره تنظیمات</button><span id="featureMsg" class="statusmsg"></span>`;
    document.getElementById('app').prepend(panel);
    const msg = (t,c) => { const e=document.getElementById('featureMsg'); e.textContent=t; e.style.color=c||''; };
    const load = async () => {
      const r = await sb.from('site_settings').select('key,value').in('key',['show_cart','show_waiter']);
      if (r.error) { msg('❌ خطا در خواندن تنظیمات: '+r.error.message,'#b52b2b'); return; }
      const d = Object.fromEntries((r.data||[]).map(x=>[x.key,x.value!==false]));
      document.getElementById('showCartSetting').checked = d.show_cart !== false;
      document.getElementById('showWaiterSetting').checked = d.show_waiter !== false;
    };
    document.getElementById('saveFeatureSettings').onclick = async () => {
      const btn=document.getElementById('saveFeatureSettings'); btn.disabled=true; msg('⏳ در حال ذخیره...');
      try {
        const rows=[{key:'show_cart',value:document.getElementById('showCartSetting').checked},{key:'show_waiter',value:document.getElementById('showWaiterSetting').checked}];
        for (const row of rows) { const r=await sb.from('site_settings').update({value:row.value,updated_at:new Date().toISOString()}).eq('key',row.key); if(r.error) throw r.error; }
        msg('✅ تنظیمات ذخیره شد. منوی مشتری در بازدید بعدی/رفرش همین وضعیت را نشان می‌دهد.','#1f7a4d');
      } catch(e) { msg('❌ خطا: '+(e.message||e),'#b52b2b'); }
      finally { btn.disabled=false; }
    };
    load();
  };
  ready();
})();
