/* Supabase API-key compatibility fix for GitHub Pages admin. */
(function(){
  'use strict';
  const PROJECT='https://bjpascssizuskiujnzvf.supabase.co';
  const ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcGFzY3NzaXp1c2tpdWpuenZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzE3MDUsImV4cCI6MjEwMjY0NzcwNX0.bo8Q2OaYZsa9lm1j0wRY2CAfubbjyX3vcjq9vntuBds';
  function install(){
    if(!window.supabase || typeof window.supabase.createClient!=='function') return false;
    if(window.supabase.__HH_KEY_FIX__) return true;
    const original=window.supabase.createClient.bind(window.supabase);
    window.supabase.createClient=function(url,key,options){
      if(url===PROJECT) return original(url,ANON,options);
      return original(url,key,options);
    };
    window.supabase.__HH_KEY_FIX__=true;
    return true;
  }
  if(!install()){
    let n=0; const t=setInterval(function(){if(install()||++n>100)clearInterval(t)},50);
  }
})();
