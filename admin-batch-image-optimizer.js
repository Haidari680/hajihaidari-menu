// One-click batch optimizer for existing Supabase food/site images.
// Preserves aspect ratio, creates WebP copies, and updates the database URLs.
(() => {
  const SUPABASE_URL = 'https://bjpascssizuskiujnzvf.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VMPeQ2DMNfdwwAEAYQ2Y4A_3idOGTvr';
  const BUCKET = 'food-images';
  const MAX_SIZE = 1400;
  const QUALITY = 0.90;
  const CONCURRENCY = 3;

  const button = document.getElementById('batchImageOptimizerBtn') || (() => {
    const b = document.createElement('button');
    b.id = 'batchImageOptimizerBtn';
    b.type = 'button';
    b.textContent = '🖼️ بهینه‌سازی عکس‌های قبلی';
    b.style.cssText = 'position:fixed;left:18px;bottom:18px;z-index:10050;background:#07172f;color:#fff;border:1px solid #d8b45a;border-radius:12px;padding:11px 15px;font:800 13px Tahoma,Arial,sans-serif;box-shadow:0 8px 22px #0004;cursor:pointer;display:block!important;visibility:visible!important;opacity:1!important';
    document.body.appendChild(b);
    return b;
  })();

  const supabase = window.supabase || null;
  const client = supabase?.createClient ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

  function isSupabaseImage(url) {
    return typeof url === 'string' && url.startsWith(SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/');
  }

  function getPath(url) {
    const prefix = SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/';
    return decodeURIComponent(url.slice(prefix.length).split('?')[0]);
  }

  function publicUrl(path) {
    return SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + path.split('/').map(encodeURIComponent).join('/');
  }

  function optimize(blob, name) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, MAX_SIZE / Math.max(img.naturalWidth, img.naturalHeight));
          const width = Math.max(1, Math.round(img.naturalWidth * scale));
          const height = Math.max(1, Math.round(img.naturalHeight * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { alpha: true });
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(out => {
            URL.revokeObjectURL(url);
            if (!out) return reject(new Error('WebP conversion failed'));
            resolve(new File([out], name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' }));
          }, 'image/webp', QUALITY);
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image decode failed')); };
      img.src = url;
    });
  }

  async function optimizeOne(row, table) {
    const oldUrl = row.image_url;
    if (!isSupabaseImage(oldUrl)) return { skipped: true };
    const oldPath = getPath(oldUrl);
    const response = await fetch(oldUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('download failed: ' + response.status);
    const source = await response.blob();
    const file = await optimize(source, oldPath.split('/').pop() || 'image');
    const newPath = 'optimized/' + oldPath.replace(/\.[^.]+$/, '') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.webp';
    const { error: uploadError } = await client.storage.from(BUCKET).upload(newPath, file, {
      cacheControl: '31536000',
      contentType: 'image/webp',
      upsert: false
    });
    if (uploadError) throw uploadError;
    const newUrl = publicUrl(newPath);
    const { error: updateError } = await client.from(table).update({ image_url: newUrl }).eq('id', row.id);
    if (updateError) throw updateError;
    return { optimized: true };
  }

  async function run() {
    if (!client) {
      alert('اتصال Supabase در این صفحه آماده نیست. صفحه را یک‌بار با Ctrl+F5 تازه کنید.');
      return;
    }
    button.disabled = true;
    const oldText = button.textContent;
    button.textContent = '⏳ در حال بهینه‌سازی...';
    try {
      const [foodsRes, slidesRes] = await Promise.all([
        client.from('foods').select('id,image_url').not('image_url', 'is', null),
        client.from('site_slides').select('id,image_url').not('image_url', 'is', null)
      ]);
      if (foodsRes.error) throw foodsRes.error;
      if (slidesRes.error) throw slidesRes.error;
      const jobs = [
        ...(foodsRes.data || []).map(row => ({ row, table: 'foods' })),
        ...(slidesRes.data || []).map(row => ({ row, table: 'site_slides' }))
      ].filter(x => isSupabaseImage(x.row.image_url));
      if (!jobs.length) {
        alert('عکس Supabase برای بهینه‌سازی پیدا نشد.');
        return;
      }
      let done = 0, failed = 0, skipped = 0;
      for (let i = 0; i < jobs.length; i += CONCURRENCY) {
        const batch = jobs.slice(i, i + CONCURRENCY);
        const results = await Promise.all(batch.map(async job => {
          try { return await optimizeOne(job.row, job.table); }
          catch (e) { console.error('Image optimization failed', job.row.id, e); return { failed: true }; }
        }));
        done += results.filter(r => r.optimized).length;
        failed += results.filter(r => r.failed).length;
        skipped += results.filter(r => r.skipped).length;
        button.textContent = `⏳ ${Math.min(i + batch.length, jobs.length)}/${jobs.length} عکس`;
      }
      alert(`بهینه‌سازی تمام شد.\n\nبهینه شد: ${done}\nخطا: ${failed}\nرد شد: ${skipped}`);
    } catch (e) {
      console.error(e);
      alert('بهینه‌سازی انجام نشد: ' + (e?.message || e));
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  }

  window.__batchImageOptimizerRun = run;
  button.onclick = run;
})();
