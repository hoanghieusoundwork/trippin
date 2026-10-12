/* Native scrolling keeps the square portrait gallery light on mobile. */
(function(root){
 'use strict';
 root.TRIPPIN_PORTRAITS={mount(host,items){
  const photos=(items||[]).slice(0,4);if(!photos.length)return;
  host.replaceChildren();host.classList.add('portrait-gallery');host.setAttribute('role','region');host.setAttribute('aria-label','Ảnh chân dung TRIPPIN');host.dataset.count=String(photos.length);
  const track=document.createElement('div');track.className='portrait-track';track.tabIndex=0;track.setAttribute('aria-label','Bộ ảnh chân dung — dùng phím trái, phải để lướt ảnh');
  for(const [i,p] of photos.entries()){const img=document.createElement('img');img.src=p.image;img.alt=p.alt||'TRIPPIN — ảnh chân dung '+(i+1);img.width=1024;img.height=1024;img.loading=i?'lazy':'eager';img.decoding='async';img.draggable=false;track.append(img)}host.append(track);
  const counter=document.createElement('span');counter.className='portrait-count';counter.setAttribute('role','status');counter.setAttribute('aria-live','polite');counter.setAttribute('aria-atomic','true');host.append(counter);
  let active=0;function update(){active=Math.max(0,Math.min(photos.length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));counter.textContent=String(active+1).padStart(2,'0')+' / '+String(photos.length).padStart(2,'0');counter.setAttribute('aria-label','Ảnh '+(active+1)+' trên '+photos.length)}
  function show(i){const next=(i+photos.length)%photos.length;track.scrollTo({left:next*track.clientWidth,behavior:'smooth'})}
  for(const [label,step,icon] of [['Ảnh trước',-1,'‹'],['Ảnh tiếp theo',1,'›']]){const b=document.createElement('button');b.type='button';b.className='portrait-arrow '+(step<0?'previous':'next');b.textContent=icon;b.setAttribute('aria-label',label);b.hidden=photos.length<2;b.onclick=()=>show(active+step);host.append(b)}
  track.addEventListener('scroll',update,{passive:true});host.addEventListener('keydown',e=>{if(photos.length<2)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(active+(e.key==='ArrowLeft'?-1:1))}else if(e.key==='Home'||e.key==='End'){e.preventDefault();show(e.key==='Home'?0:photos.length-1)}});update();
 }};
})(window);
