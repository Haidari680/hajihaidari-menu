(()=>{
  const MAX_SIDE=1600, QUALITY=.88, MAX_BYTES=350*1024;
  const IMAGE_INPUTS=new Set(['food_file','edit_file','ab_file','logo_file','bg_file','slide_file']);
  const fmt=n=>n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(0)} KB`:`${(n/1048576).toFixed(1)} MB`;
  function loadImage(file){return new Promise((resolve,reject)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);resolve(im)};im.onerror=()=>{URL.revokeObjectURL(u);reject(new Error('image'))};im.src=u})}
  async function optimize(file){
    if(!file || !file.type.startsWith('image/') || file.size<=MAX_BYTES) return file;
    try{
      const im=await loadImage(file), scale=Math.min(1,MAX_SIDE/Math.max(im.naturalWidth,im.naturalHeight));
      const w=Math.max(1,Math.round(im.naturalWidth*scale)), h=Math.max(1,Math.round(im.naturalHeight*scale));
      const c=document.createElement('canvas'); c.width=w; c.height=h;
      const x=c.getContext('2d',{alpha:true}); x.drawImage(im,0,0,w,h);
      const blob=await new Promise(r=>c.toBlob(r,'image/webp',QUALITY));
      if(!blob || blob.size>=file.size) return file;
      const out=new File([blob],file.name.replace(/\.[^.]+$/i,'.webp'),{type:'image/webp',lastModified:Date.now()});
      return out.size<file.size?out:file;
    }catch(e){return file}
  }
  async function handle(input){
    if(input.dataset.optimizing==='1') return;
    const files=[...input.files||[]]; if(!files.length) return;
    input.dataset.optimizing='1';
    const out=[];
    for(const f of files) out.push(await optimize(f));
    try{const dt=new DataTransfer();out.forEach(f=>dt.items.add(f));input.files=dt.files}catch(e){}
    input.dataset.optimizing='0';
    const before=files.reduce((a,f)=>a+f.size,0), after=out.reduce((a,f)=>a+f.size,0);
    if(after<before){
      let msg=input.parentElement?.querySelector('.image-opt-msg');
      if(!msg){msg=document.createElement('small');msg.className='image-opt-msg';msg.style.cssText='display:block;color:#197a4b;font-weight:700;margin-top:5px';input.parentElement?.appendChild(msg)}
      msg.textContent=`✓ عکس بهینه شد: ${fmt(before)} ← ${fmt(after)}`;
    }
  }
  document.addEventListener('change',e=>{const i=e.target;if(i?.type==='file'&&IMAGE_INPUTS.has(i.id))handle(i)});
})();
