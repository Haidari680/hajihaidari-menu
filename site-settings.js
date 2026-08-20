(() => {
  const ready = () => {
    if (!window.sb) return setTimeout(ready, 250);
    const apply = rows => {
      const s = Object.fromEntries((rows || []).map(x => [x.key, x.value !== false]));
      const cartOn = s.show_cart !== false;
      const waiterOn = s.show_waiter !== false;
      document.querySelectorAll('.topBtn[onclick="openCart()"], .bar').forEach(el => { el.style.display = cartOn ? '' : 'none'; });
      document.querySelectorAll('.topBtn[onclick="callWaiter()"], [data-service="waiter"]').forEach(el => { el.style.display = waiterOn ? '' : 'none'; });
    };
    const load = async () => {
      const r = await sb.from('site_settings').select('key,value').in('key',['show_cart','show_waiter']);
      if (!r.error) apply(r.data);
    };
    load();
    sb.channel('site-settings-live').on('postgres_changes',{event:'*',schema:'public',table:'site_settings'},payload => load()).subscribe();
  };
  ready();
})();
