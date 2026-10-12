/* Composited fades for buttons; native scroll-snap and momentum for touch. */
(function(root){
 'use strict';
 root.TRIPPIN_PORTRAITS={mount(host,items){
  const photos=(items||[]).slice(0,4);if(!photos.length)return;
  host.replaceChildren();host.classList.add('portrait-gallery');host.setAttribute('role','region');host.setAttribute('aria-label','Ảnh chân dung TRIPPIN');host.dataset.count=String(photos.length);
  const track=document.createElement('div');track.className='portrait-track';track.tabIndex=0;track.setAttribute('aria-label','Bộ ảnh chân dung — dùng phím trái, phải để lướt ảnh');
  const images=photos.map((p,i)=>{const img=document.createElement('img');img.src=p.image;img.alt=p.alt||'TRIPPIN — ảnh chân dung '+(i+1);img.width=1024;img.height=1024;img.loading=i?'lazy':'eager';img.decoding='async';img.draggable=false;track.append(img);return img});host.append(track);
  const sheen=document.createElement('span');sheen.className='portrait-sheen';sheen.setAttribute('aria-hidden','true');host.append(sheen);
  const counter=document.createElement('span');counter.className='portrait-count';counter.setAttribute('role','status');counter.setAttribute('aria-live','polite');counter.setAttribute('aria-atomic','true');host.append(counter);
  let active=0,requested=0,version=0,animations=[],overlay=null,navigating=false,settleTimer=0,glowTimer=0,lastSettled=0;
  function count(){counter.textContent=String(active+1).padStart(2,'0')+' / '+String(photos.length).padStart(2,'0');counter.setAttribute('aria-label','Ảnh '+(active+1)+' trên '+photos.length)}
  function animate(node,frames,options){if(!node.animate)return null;const a=node.animate(frames,options);animations.push(a);a.finished?.catch(()=>{});return a}
  function clear(){version++;animations.forEach(a=>a.cancel());animations=[];overlay?.remove();overlay=null;navigating=false;requested=active;clearTimeout(settleTimer);clearTimeout(glowTimer);host.classList.remove('is-changing')}
  function light(){host.classList.add('is-changing');clearTimeout(glowTimer);glowTimer=setTimeout(()=>host.classList.remove('is-changing'),780);animate(sheen,[{transform:'translateX(-140%)',opacity:0},{transform:'translateX(-20%)',opacity:.14,offset:.45},{transform:'translateX(140%)',opacity:0}],{duration:780,easing:'ease-out'})}
  function settle(){if(navigating||active===lastSettled)return;lastSettled=active;requested=active;light();animate(images[active],[{transform:'scale(1.018)',opacity:.88},{transform:'scale(1)',opacity:1}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'})}
  function update(){const i=Math.max(0,Math.min(photos.length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));if(i!==active){active=i;count()}if(!navigating)requested=active;clearTimeout(settleTimer);if(!navigating)settleTimer=setTimeout(settle,140)}
  async function show(i,direction=1){const next=(i+photos.length)%photos.length;if(next===active&&!navigating)return;const from=active;clear();requested=next;navigating=true;const ticket=version;images[next].loading='eager';try{await images[next].decode?.()}catch{}if(ticket!==version)return;
   overlay=images[from].cloneNode();overlay.className='portrait-transition';overlay.alt='';overlay.setAttribute('aria-hidden','true');host.append(overlay);const outgoing=overlay;
   track.scrollTo({left:next*track.clientWidth,behavior:'instant'});active=next;lastSettled=next;count();light();
   animate(images[next],[{transform:`translateX(${direction*5}%) scale(1.035)`,opacity:.55},{transform:'translateX(0) scale(1)',opacity:1}],{duration:720,easing:'cubic-bezier(.22,1,.36,1)'});
   const a=animate(outgoing,[{transform:'translateX(0) scale(1)',opacity:1},{transform:`translateX(${-direction*7}%) scale(1.035)`,opacity:0}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
   if(a)a.finished.then(()=>{outgoing.remove();if(ticket===version){overlay=null;navigating=false}}).catch(()=>outgoing.remove());else{outgoing.remove();overlay=null;navigating=false}
  }
  for(const [label,step,icon] of [['Ảnh trước',-1,'‹'],['Ảnh tiếp theo',1,'›']]){const b=document.createElement('button');b.type='button';b.className='portrait-arrow '+(step<0?'previous':'next');b.textContent=icon;b.setAttribute('aria-label',label);b.hidden=photos.length<2;b.onclick=()=>show(requested+step,step);host.append(b)}
  host.addEventListener('pointerenter',()=>images.forEach(img=>img.loading='eager'),{passive:true});track.addEventListener('pointerdown',()=>{clear();images.forEach(img=>img.loading='eager')},{passive:true});track.addEventListener('scroll',update,{passive:true});track.addEventListener('scrollend',settle,{passive:true});host.addEventListener('keydown',e=>{if(photos.length<2)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const step=e.key==='ArrowLeft'?-1:1;show(requested+step,step)}else if(e.key==='Home'||e.key==='End'){e.preventDefault();show(e.key==='Home'?0:photos.length-1,e.key==='Home'?-1:1)}});count();
 }};
})(window);
