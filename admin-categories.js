(() => {
  const ready = () => {
    if (!window.sb || !window.$) return setTimeout(ready, 250);
    const catsSection = document.getElementById('cats');
    const list = document.getElementById('catList');
    if (!catsSection || !list) return;

    const oldLoadCats = window.loadCats;
    const oldAddCat = window.addCat;

    const escLocal = window.esc || (v => String(v ?? '').replace(/[&<>\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[ch])));

    window.loadCats = async function () {
      const r = await sb.from('categories').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
      if (r.error) {
        list.innerHTML = '<p class="muted">' + escLocal(r.error.message) + '</p>';
        return;
      }
      const d = r.data || [];
      const active = d.filter(c => c.active !== false);
      const fc = document.getElementById('fc');
      if (fc) fc.innerHTML = active.map(c => '<option value="' + c.id + '">' + escLocal(c.name) + '</option>').join('');

      list.innerHTML = d.length ? d.map((c, i) => `
        <div class="item category-admin-row" data-id="${c.id}">
          <div class="row" style="justify-content:space-between">
            <div style="min-width:180px;flex:1">
              <b>${escLocal(c.name)}</b>
              <div class="muted" style="font-size:12px;margin-top:4px">${c.active === false ? '🔴 مخفی از منو' : '🟢 نمایش در منو'}</div>
            </div>
            <div class="row">
              <button class="btn" type="button" onclick="editCategory(${c.id}, ${JSON.stringify(c.name)})">✏️ ویرایش نام</button>
              <button class="btn ${c.active === false ? 'ok' : 'danger'}" type="button" onclick="toggleCategory(${c.id}, ${c.active !== false})">${c.active === false ? '👁 نمایش' : '🙈 مخفی'}</button>
              <button class="btn" type="button" onclick="moveCategory(${c.id}, -1)" ${i === 0 ? 'disabled' : ''}>⬆️</button>
              <button class="btn" type="button" onclick="moveCategory(${c.id}, 1)" ${i === d.length - 1 ? 'disabled' : ''}>⬇️</button>
              <button class="btn danger" type="button" onclick="deleteCategory(${c.id}, ${JSON.stringify(c.name)})">🗑 حذف</button>
            </div>
          </div>
        </div>`).join('') : '<p class="muted">هنوز دسته‌ای ثبت نشده.</p>';
    };

    window.addCat = async function () {
      const input = document.getElementById('cn');
      const n = input.value.trim();
      if (!n) return;
      const exists = await sb.from('categories').select('id').ilike('name', n).limit(1);
      if (exists.data?.length) { alert('این نام دسته قبلاً وجود دارد.'); return; }
      const max = await sb.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1);
      const nextOrder = Number(max.data?.[0]?.sort_order ?? -1) + 1;
      const r = await sb.from('categories').insert({ name: n, active: true, sort_order: nextOrder });
      if (r.error) alert(r.error.message);
      else { input.value = ''; await window.loadCats(); }
    };

    window.editCategory = async function (id, current) {
      const name = prompt('نام جدید دسته را وارد کنید:', current);
      if (name === null) return;
      const n = name.trim();
      if (!n || n === current) return;
      const exists = await sb.from('categories').select('id').ilike('name', n).neq('id', id).limit(1);
      if (exists.data?.length) { alert('این نام دسته قبلاً وجود دارد.'); return; }
      const r = await sb.from('categories').update({ name: n }).eq('id', id);
      if (r.error) alert(r.error.message);
      else await window.loadCats();
    };

    window.toggleCategory = async function (id, currentlyActive) {
      const r = await sb.from('categories').update({ active: !currentlyActive }).eq('id', id);
      if (r.error) alert(r.error.message);
      else await window.loadCats();
    };

    window.deleteCategory = async function (id, name) {
      const foods = await sb.from('foods').select('id', { count: 'exact', head: false }).eq('category_id', id).limit(1);
      if (foods.error) { alert(foods.error.message); return; }
      if (foods.data?.length) {
        alert('این دسته غذا دارد. اول غذاهای داخل آن را به دسته دیگری منتقل یا حذف کنید؛ سپس دسته را حذف کنید.');
        return;
      }
      if (!confirm('دسته «' + name + '» حذف شود؟')) return;
      const r = await sb.from('categories').delete().eq('id', id);
      if (r.error) alert(r.error.message);
      else await window.loadCats();
    };

    window.moveCategory = async function (id, direction) {
      const r = await sb.from('categories').select('id,sort_order').order('sort_order', { ascending: true }).order('id', { ascending: true });
      if (r.error) { alert(r.error.message); return; }
      const arr = r.data || [];
      const i = arr.findIndex(x => String(x.id) === String(id));
      const j = i + direction;
      if (i < 0 || j < 0 || j >= arr.length) return;
      const a = arr[i], b = arr[j];
      const ao = Number(a.sort_order ?? i), bo = Number(b.sort_order ?? j);
      const u1 = await sb.from('categories').update({ sort_order: bo }).eq('id', a.id);
      if (u1.error) { alert(u1.error.message); return; }
      const u2 = await sb.from('categories').update({ sort_order: ao }).eq('id', b.id);
      if (u2.error) { alert(u2.error.message); return; }
      await window.loadCats();
    };

    window.loadCats();
  };
  ready();
})();
