(() => {
  const URL = 'https://bjpascssizuskiujnzvf.supabase.co';
  const KEY = 'sb_publishable_VMPe2QDMNfdwwAEAYQ2Y4A_3idOGTvr';
  const esc = v => String(v ?? '').replace(/[&<>\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[ch]));
  let catSb;

  const start = () => {
    if (!window.supabase) return setTimeout(start, 250);
    catSb = window.supabase.createClient(URL, KEY);
    const install = () => {
      const list = document.getElementById('catList');
      const input = document.getElementById('cn');
      const addBtn = document.querySelector('#cats button[onclick="addCat()"]');
      if (!list || !input || !addBtn) return setTimeout(install, 300);

      window.loadCats = loadCats;
      window.addCat = addCat;
      addBtn.onclick = addCat;
      loadCats();
    };
    install();
  };

  async function loadCats() {
    const list = document.getElementById('catList');
    const fc = document.getElementById('fc');
    const r = await catSb.from('categories').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
    if (r.error) {
      if (list) list.innerHTML = '<p class="muted">' + esc(r.error.message) + '</p>';
      return;
    }
    const d = r.data || [];
    const active = d.filter(c => c.active !== false);
    if (fc) fc.innerHTML = active.map(c => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('');
    if (!list) return;
    list.innerHTML = d.length ? d.map((c, i) => `
      <div class="item">
        <div class="row" style="justify-content:space-between">
          <div style="min-width:180px;flex:1"><b>${esc(c.name)}</b><div class="muted" style="font-size:12px;margin-top:4px">${c.active === false ? '🔴 مخفی از منو' : '🟢 نمایش در منو'}</div></div>
          <div class="row">
            <button class="btn" type="button" onclick="editCategory(${c.id}, ${JSON.stringify(c.name)})">✏️ ویرایش نام</button>
            <button class="btn ${c.active === false ? 'ok' : 'danger'}" type="button" onclick="toggleCategory(${c.id}, ${c.active !== false})">${c.active === false ? '👁 نمایش' : '🙈 مخفی'}</button>
            <button class="btn" type="button" onclick="moveCategory(${c.id}, -1)" ${i === 0 ? 'disabled' : ''}>⬆️</button>
            <button class="btn" type="button" onclick="moveCategory(${c.id}, 1)" ${i === d.length - 1 ? 'disabled' : ''}>⬇️</button>
            <button class="btn danger" type="button" onclick="deleteCategory(${c.id}, ${JSON.stringify(c.name)})">🗑 حذف</button>
          </div>
        </div>
      </div>`).join('') : '<p class="muted">هنوز دسته‌ای ثبت نشده.</p>';
  }

  async function addCat() {
    const input = document.getElementById('cn');
    const n = input.value.trim();
    if (!n) return;
    const exists = await catSb.from('categories').select('id').ilike('name', n).limit(1);
    if (exists.data?.length) return alert('این نام دسته قبلاً وجود دارد.');
    const max = await catSb.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1);
    const nextOrder = Number(max.data?.[0]?.sort_order ?? -1) + 1;
    const r = await catSb.from('categories').insert({ name: n, active: true, sort_order: nextOrder });
    if (r.error) alert(r.error.message); else { input.value = ''; await loadCats(); }
  }

  window.editCategory = async (id, current) => {
    const v = prompt('نام جدید دسته را وارد کنید:', current);
    if (v === null) return;
    const n = v.trim();
    if (!n || n === current) return;
    const exists = await catSb.from('categories').select('id').ilike('name', n).neq('id', id).limit(1);
    if (exists.data?.length) return alert('این نام دسته قبلاً وجود دارد.');
    const r = await catSb.from('categories').update({ name: n }).eq('id', id);
    if (r.error) alert(r.error.message); else await loadCats();
  };

  window.toggleCategory = async (id, active) => {
    const r = await catSb.from('categories').update({ active: !active }).eq('id', id);
    if (r.error) alert(r.error.message); else await loadCats();
  };

  window.deleteCategory = async (id, name) => {
    const foods = await catSb.from('foods').select('id').eq('category_id', id).limit(1);
    if (foods.error) return alert(foods.error.message);
    if (foods.data?.length) return alert('این دسته غذا دارد. اول غذاهای آن را به دسته دیگری منتقل یا حذف کنید.');
    if (!confirm('دسته «' + name + '» حذف شود؟')) return;
    const r = await catSb.from('categories').delete().eq('id', id);
    if (r.error) alert(r.error.message); else await loadCats();
  };

  window.moveCategory = async (id, direction) => {
    const r = await catSb.from('categories').select('id,sort_order').order('sort_order', { ascending: true }).order('id', { ascending: true });
    if (r.error) return alert(r.error.message);
    const a = r.data || [], i = a.findIndex(x => String(x.id) === String(id)), j = i + direction;
    if (i < 0 || j < 0 || j >= a.length) return;
    const first = a[i], second = a[j], one = Number(first.sort_order ?? i), two = Number(second.sort_order ?? j);
    let u = await catSb.from('categories').update({ sort_order: two }).eq('id', first.id);
    if (u.error) return alert(u.error.message);
    u = await catSb.from('categories').update({ sort_order: one }).eq('id', second.id);
    if (u.error) return alert(u.error.message);
    await loadCats();
  };

  start();
})();
