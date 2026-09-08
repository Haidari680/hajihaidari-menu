(()=>{
  const fix=(u,kind)=>{
    try{
      if(!u||!u.includes('/storage/v1/object/public/')) return u;
      const x=new URL(u);
      x.pathname=x.pathname.replace('/storage/v1/object/public/','/storage/v1/render/image/public/');
      const w=kind==='hero'?1200:kind==='logo'?420:(innerWidth<=650?520:700);
      x.searchParams.set('width',w);
      x.searchParams.set('quality',kind==='logo'?'65':'68');
      x.searchParams.set('resize','contain');
      return x.href;
    }catch{return u}
  };
  const kindOf=im=>im.closest('.hero,.slide')?'hero':im.closest('.logo')?'logo':im.closest('.card')?'card':'other';
  const prepare=im=>{
    if(!im||im.tagName!=='IMG') return;
    const raw=im.getAttribute('src');
    if(!raw||raw.startsWith('data:')||raw.startsWith('blob:')) return;
    const kind=kindOf(im);
    const optimized=fix(raw,kind);
    if(optimized&&optimized!==raw){
      im.dataset.originalSrc=im.dataset.originalSrc||raw;
      if(!im.dataset.fallback){
        im.dataset.fallback='1';
        im.addEventListener('error',()=>{
          const original=im.dataset.originalSrc;
          if(original&&im.getAttribute('src')!==original){im.dataset.fallback='2';im.src=original;}
        },{once:false});
      }
      if(im.getAttribute('src')!==optimized) im.setAttribute('src',optimized);
    }
    im.decoding='async';
  };
  const setLoading=im=>{
    const kind=kindOf(im);
    if(kind==='logo'){im.loading='eager';im.fetchPriority='high';return;}
    if(kind==='hero'){
      const first=im.closest('.slide')?.classList.contains('on') || !document.querySelector('.hero .slide.on');
      im.loading=first?'eager':'lazy';im.fetchPriority=first?'high':'low';return;
    }
    if(kind==='card'){
      const cards=[...document.querySelectorAll('.card .photo img')];
      const i=cards.indexOf(im);
      const eager=i>=0&&i<2;
      im.loading=(eager||im.dataset.preloaded==='1')?'eager':'lazy';
      im.fetchPriority=(eager||im.dataset.preloaded==='1')?'high':'low';
      return;
    }
    im.loading='lazy';im.fetchPriority='low';
  };
  const prepareAndLoad=im=>{prepare(im);setLoading(im)};

  const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  if(desc&&desc.set){
    Object.defineProperty(Element.prototype,'innerHTML',{
      configurable:desc.configurable,enumerable:desc.enumerable,get:desc.get,
      set(v){
        if(typeof v==='string'&&v.includes('<img')){
          v=v.replace(/(<img\b[^>]*\bsrc\s*=\s*["'])([^"']+)(["'])/gi,(m,a,u,c)=>{
            const kind=/class\s*=\s*["'][^"']*slide/i.test(m)?'hero':/heroLogoImg/i.test(m)?'logo':'card';
            return a+fix(u,kind)+c;
          });
        }
        return desc.set.call(this,v);
      }
    });
  }

  document.querySelectorAll('.hero .slide img,.card .photo img,.logo img').forEach(prepareAndLoad);

  const io=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(!e.isIntersecting)return;
    const im=e.target;im.dataset.preloaded='1';prepare(im);setLoading(im);io.unobserve(im);
  }),{rootMargin:'700px 0px'});
  const watch=im=>{if(!im||im.tagName!=='IMG')return;prepareAndLoad(im);if(kindOf(im)!=='logo'&&im.dataset.preloaded!=='1')io.observe(im)};
  document.querySelectorAll('.hero .slide img,.card .photo img,.logo img').forEach(watch);

  new MutationObserver(records=>{
    for(const r of records){
      for(const n of r.addedNodes){
        if(n.nodeType!==1)continue;
        if(n.tagName==='IMG')watch(n);
        n.querySelectorAll?.('.hero .slide img,.card .photo img,.logo img,img').forEach(watch);
      }
    }
  }).observe(document.body,{childList:true,subtree:true});
})();
