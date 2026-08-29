/* 🔐 Admin session guard: keep RLS enabled and ensure a valid authenticated session before writes. */
(function(){
  'use strict';
  const names=['addFood','saveEditFood','addSlide','saveSite','addAccessItem','addCat','deleteFood','deleteSlide','deleteAccessItem','deleteCat'];
  let ready=null;
  function client(){return window.sb||null;}
  async function ensure(){
    const db=client();
    if(!db)return false;
    try{
      let r=await db.auth.getSession();
      if(r.data?.session)return true;
      try{await db.auth.refreshSession();}catch(e){}
      r=await db.auth.getSession();
      return !!r.data?.session;
    }catch(e){return false;}
  }
  async function guard(fn){
    if(!(await ensure())){
      const msg=document.getElementById('msg');
      if(msg){msg.textContent='❌ نشست مدیر معتبر نیست؛ دوباره وارد شوید.';msg.style.color='#b52b2b';}
      return;
    }
    return fn();
  }
  function install(){
    if(!client())return setTimeout(install,200);
    names.forEach(name=>{
      const fn=window[name];
      if(typeof fn!=='function'||fn.__hhGuarded)return;
      const wrapped=function(){const args=arguments;return guard(()=>fn.apply(this,args));};
      wrapped.__hhGuarded=true;window[name]=wrapped;
    });
    window.HH_ADMIN_AUTH_GUARD=true;
  }
  install();
  setInterval(install,1000);
})();