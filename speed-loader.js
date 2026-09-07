(()=>{
  const fix=u=>{
    try{
      if(!u||!u.includes('/storage/v1/object/public/')) return u;
      const x=new URL(u);
      x.pathname=x.pathname.replace('/storage/v1/object/public/','/storage/v1/render/image/public/');
      x.searchParams.set('width',innerWidth<=650?'520':'900');
      x.searchParams.set('quality','70');
      x.searchParams.set('resize','contain');
      return x.href;
    }catch{return u}
  };
  const prepare=im=>{
    if(!im||im.tagName!=='IMG') return;
    const raw=im.getAttribute('src');
    if(!raw||raw.startsWith('data:')||raw.startsWith('blob:')) return;
    const optimized=fix(raw);
    if(optimized&&optimized!==raw){
      im.dataset.originalSrc=raw;
      if(!im.dataset.fallback){
        im.dataset.fallback='1';
        im.addEventListener('error',()=>{
          const original=im.dataset.originalSrc;
          if(original&&im.getAttribute('src')!==original){
            im.dataset.fallback='2';
            im.src=original;
          }
        });
      }
      if(im.getAttribute('src')!==optimized) im.setAttribute('src',optimized);
    }
    im.decoding='async';
  };
  const setPriority=()=>document.querySelectorAll('img').forEach((im,i)=>{
    prepare(im);
    const near=im.dataset.preloaded==='1';
    im.loading=(i<4||near)?'eager':'lazy';
    im.fetchPriority=(i<4||near)?'high':'low';
  });
  const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  if(desc&&desc.set){
    Object.defineProperty(Element.prototype,'innerHTML',{
      configurable:desc.configurable,
      enumerable:desc.enumerable,
      get:desc.get,
      set(v){
        if(typeof v==='string'&&v.includes('<img')){
          v=v.replace(/(<img\b[^>]*\bsrc\s*=\s*["'])([^"']+)(["'])/gi,(m,a,u,c)=>a+fix(u)+c);
        }
        return desc.set.call(this,v);
      }
    });
  }
  setPriority();
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      e.target.dataset.preloaded='1';
      e.target.loading='eager';
      e.target.fetchPriority='high';
      prepare(e.target);
      io.unobserve(e.target);
    }
  }),{rootMargin:'1600px 0px'});
  const observe=()=>document.querySelectorAll('img').forEach(im=>{prepare(im);if(im.dataset.preloaded!=='1')io.observe(im)});
  observe();
  new MutationObserver(()=>requestAnimationFrame(()=>{setPriority();observe()})).observe(document.documentElement,{childList:true,subtree:true});
})();
