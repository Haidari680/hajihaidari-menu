const HH_SUPABASE_URL='https://bjpascssizuskiujnzvf.supabase.co';
const HH_SUPABASE_KEY='sb_publishable_VMPe2QDMNfdwwAEAY2QY4A_3idOGTvr';

async function loadHaidariSupabaseMenu(){
  try{
    if(!window.supabase) throw new Error('کتابخانه Supabase بارگذاری نشده است.');
    const client=window.supabase.createClient(HH_SUPABASE_URL,HH_SUPABASE_KEY);
    const [cr,fr]=await Promise.all([
      client.from('categories').select('*').eq('active',true).order('sort_order'),
      client.from('foods').select('*').eq('active',true).order('id',{ascending:false})
    ]);
    if(cr.error) throw cr.error;
    if(fr.error) throw fr.error;

    const cats=(cr.data||[]).map(c=>({id:c.id,name:c.name}));
    const items=(fr.data||[]).map(f=>({
      id:f.id,
      category:Number(f.category_id),
      name:f.name,
      price:Number(f.price||0),
      oldPrice:Number(f.old_price||0),
      image:f.image_url||'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
      description:f.description||'',
      daily:!!f.daily,
      stockStatus:f.stock_status||'available',
      rating:Number(f.rating||0)
    }));

    data.categories=cats;
    data.items=items;
    window.hhSupabaseMenuReady=true;
    renderAll();
  }catch(err){
    console.error('Supabase menu error:',err);
    const box=document.getElementById('menu');
    if(box) box.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:25px;color:#b42318;background:#fff;border-radius:16px">خطا در بارگذاری منوی آنلاین: '+escapeHTML(err.message||String(err))+'</div>';
  }
}

window.addEventListener('DOMContentLoaded',loadHaidariSupabaseMenu);
