// Edit existing food name, price and description without changing the menu design.
(() => {
  const existingClient = (typeof sb !== 'undefined' && sb?.from && sb?.auth) ? sb : null;
  const client = existingClient || (window.supabase?.createClient
    ? window.supabase.createClient(
        'https://bjpascssizuskiujnzvf.supabase.co',
        'sb_publishable_VMPeQ2DMNfdwwAEAYQ2Y4A_3idOGTvr'
      )
    : null);

  const esc = v => String(v ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');

  function addEditButtons() {
    const list = document.getElementById('foodList');
    if (!list) return;
    list.querySelectorAll('.item').forEach(item => {
      if (item.querySelector('[data-food-edit]')) return;
      const toggle = item.querySelector('button[onclick^="toggleFood("]');
      if (!toggle) return;
      const m = toggle.getAttribute('onclick').match(/toggleFood\((\d+)/);
      if (!m) return;
      const id = m[1];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn gold';
      btn.dataset.foodEdit = id;
      btn.textContent = '✏️ ویرایش';
      btn.onclick = () => editFood(id);
      toggle.parentNode.insertBefore(btn, toggle);
    });
  }

  async function editFood(id) {
    if (!client) return alert('اتصال مدیریت آماده نیست. صفحه را با Ctrl+F5 تازه کنید.');
    const session = await client.auth.getSession();
    if (!session?.data?.session) return alert('ابتدا وارد پنل مدیریت شوید.');

    const r = await client.from('foods')
      .select('id,name,price,description')
      .eq('id', id)
      .single();

    if (r.error) return alert('خواندن غذا انجام نشد: ' + r.error.message);
    const food = r.data;

    const name = prompt('نام غذا:', food.name ?? '');
    if (name === null) return;

    const priceText = prompt('قیمت:', String(food.price ?? ''));
    if (priceText === null) return;
    const price = Number(priceText.replace(/,/g, '').trim());
    if (!Number.isFinite(price) || price < 0) return alert('قیمت واردشده درست نیست.');

    const description = prompt('توضیحات غذا:', food.description ?? '');
    if (description === null) return;

    const u = await client.from('foods').update({
      name: name.trim(),
      price,
      description: description.trim() || null
    }).eq('id', id);

    if (u.error) return alert('ذخیره تغییرات انجام نشد: ' + u.error.message);

    alert('✅ تغییرات غذا ذخیره شد.');
    if (typeof window.loadFoods === 'function') await window.loadFoods();
    setTimeout(addEditButtons, 100);
  }

  window.editFood = editFood;

  const originalLoadFoods = window.loadFoods;
  if (typeof originalLoadFoods === 'function') {
    window.loadFoods = async function(...args) {
      const result = await originalLoadFoods.apply(this, args);
      addEditButtons();
      return result;
    };
  }

  const observer = new MutationObserver(addEditButtons);
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(addEditButtons, 500);
})();