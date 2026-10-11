/* Ambient visual art. YouTube audio is not sampled or analysed. */
(()=>{
 'use strict';
 const canvas=document.getElementById('ambientCanvas'),title=document.querySelector('.name-row h1'),toggle=document.getElementById('motionToggle');
 if(!canvas||!title||!toggle)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx){toggle.hidden=true;return}
 const interactionCanvas=document.getElementById('interactionCanvas'),fx=interactionCanvas?.getContext('2d',{alpha:true}),clickCtx=fx||ctx;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
 const samurai=document.getElementById('samuraiScene');
 const pieces=Array.from(document.querySelectorAll('.samurai-fragment'));
 const left=[0,26,60,77,100],right=[0,32,55,80,100],middle=left.map((v,i)=>(v+right[i])/2);
 pieces.forEach((piece,i)=>{const row=Math.floor(i/2),isLeft=i%2===0,a=isLeft?left:middle,b=isLeft?middle:right,x=isLeft?0:50,end=isLeft?50:100;piece.style.clipPath=`polygon(${x}% ${a[row]}%,${end}% ${b[row]}%,${end}% ${b[row+1]}%,${x}% ${a[row+1]}%)`;piece.style.transformOrigin=`${isLeft?25:75}% ${(a[row]+b[row+1])/2}%`});
 if(pieces.length===8)samurai?.classList.add('fragments-ready');
 let motionPreference=null,paused=reduce.matches;
 try{motionPreference=localStorage.getItem('trippin-motion');if(motionPreference==='off')paused=true;else if(motionPreference==='on')paused=false}catch{}
 const stage=document.createElement('span');stage.className='trippin-stage';
 const word=title.textContent.trim();title.setAttribute('aria-label',word);
 function layer(cls,depth){const n=document.createElement('span');n.className=cls;n.setAttribute('aria-hidden','true');if(depth)n.style.setProperty('--depth',String(depth));Array.from(word).forEach((ch,i)=>{const letter=document.createElement('span');letter.className='trippin-letter';letter.style.setProperty('--i',String(i));letter.textContent=ch;n.append(letter)});stage.append(n)}
 for(let d=coarse.matches?4:8;d>0;d--)layer('trippin-depth',d);
 layer('trippin-front',0);title.replaceChildren(stage);
 const titleBack=document.createElement('canvas'),titleFront=document.createElement('canvas');
 titleBack.className='title-aura title-aura-back';titleFront.className='title-aura title-aura-front';
 for(const n of [titleBack,titleFront]){n.setAttribute('aria-hidden','true');title.append(n)}
 const backCtx=titleBack.getContext('2d'),frontCtx=titleFront.getContext('2d');let auraW=0,auraH=0,dragonWordWidth=0;
 const dragonArt=document.createElement('img');dragonArt.decoding='async';dragonArt.onload=()=>draw();dragonArt.src='assets/visuals/dragon-weave-v1.webp';
 function sizeAura(){const letters=Array.from(title.querySelectorAll?.('.trippin-front .trippin-letter')||[]),end=letters[letters.length-1];dragonWordWidth=end?(end.offsetLeft+end.offsetWidth):(title.clientWidth||window.innerWidth*.85)*.75;const ratio=Math.min(window.devicePixelRatio||1,coarse.matches?1.25:1.5);auraW=(title.clientWidth||window.innerWidth*.85)*1.12;auraH=(title.clientHeight||window.innerHeight*.2)*1.9;for(const [n,c] of [[titleBack,backCtx],[titleFront,frontCtx]]){n.width=Math.round(auraW*ratio);n.height=Math.round(auraH*ratio);c?.setTransform(ratio,0,0,ratio,0,0)}}
 function drawAura(time){
  if(!backCtx||!frontCtx||!auraW)return;
  for(const c of [backCtx,frontCtx])c.clearRect(0,0,auraW,auraH);
  if(!dragonArt.complete||!dragonArt.naturalWidth)return;
  const t=paused?0:time*.00035+dragonSweep,sw=dragonArt.naturalWidth,sh=dragonArt.naturalHeight;
  const dw=Math.min(auraW*.91,dragonWordWidth*.98),dh=dw*sh/sw;
  const x=auraW*.055+dragonWordWidth*.10,y=(auraH-dh)*.45-auraH*.015,parts=coarse.matches?44:72;
  const dx=Math.sin(t*.8)*dw*.013,dy=Math.cos(t*.65)*auraH*.025,angle=Math.sin(t*.6)*.022;
  // Most of the dragon sits behind the type; only its outer muzzle passes in front.
  // Every strip, including horns and head, follows the same animated skeleton.
  for(const c of [backCtx,frontCtx]){
   c.save();c.translate(x+dw*.5+dx,y+dh*.5+dy);c.rotate(angle);c.translate(-dw*.5,-dh*.5);
   c.globalAlpha=c===frontCtx?.8:.58;
   for(let i=0;i<parts;i++){
    const u=(i+.5)/parts,front=u>.96;
    if(front!==(c===frontCtx))continue;
    c.globalAlpha=c===frontCtx?.8:(.46+.28*u*u);
    const wave=Math.sin(u*11-t*.9)*auraH*.014+Math.sin(u*6+t*.55)*auraH*.008;
    c.drawImage(dragonArt,i/parts*sw,0,sw/parts+.8,sh,i/parts*dw,wave,dw/parts+.4,dh);
   }
   if(c===frontCtx&&dragonEyeGlow>.01){
    // Eye follows the exact animated image strip; it emits only during downward scrolling.
    const eyeU=.932,stripU=(Math.floor(eyeU*parts)+.5)/parts;
    const ey=dh*.232+Math.sin(stripU*11-t*.9)*auraH*.014+Math.sin(stripU*6+t*.55)*auraH*.008,ex=dw*eyeU;
    const core=Math.max(.85,dw*.0028),halo=c.createRadialGradient(ex,ey,0,ex,ey,core*5);
    halo.addColorStop(0,'rgba(238,228,208,.9)');halo.addColorStop(.25,'rgba(208,172,112,.7)');halo.addColorStop(1,'rgba(134,165,148,0)');
    c.globalAlpha=dragonEyeGlow;c.fillStyle=halo;c.beginPath();c.arc(ex,ey,core*5,0,Math.PI*2);c.fill();
    c.fillStyle='#eee4d0';c.shadowColor='#d0ac70';c.shadowBlur=core*3;
    c.beginPath();c.ellipse(ex,ey,core*1.2,core*.48,-.12,0,Math.PI*2);c.fill();c.shadowBlur=0;
   }
   c.restore();
  }
 }

 const progress=document.querySelector('.scroll-progress');
 let w=0,h=0,raf=0,last=0,elapsed=0,scroll=window.scrollY||0,pointer={x:0,y:0},aim={x:0,y:0},heroVisible=true;
 let dragonEyeGlow=0,dragonBurst=0,dragonSweep=0,dragonScroll=window.scrollY||0,dragonQuiet=0;
 let stars=[],ripples=[],scrollEnergy=0,impulse=0;const artNodes=new Set();
 function resize(){sizeAura();w=window.innerWidth;h=window.innerHeight;const dpr=Math.min(window.devicePixelRatio||1,coarse.matches?1.25:1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(fx){interactionCanvas.width=canvas.width;interactionCanvas.height=canvas.height;fx.setTransform(dpr,0,0,dpr,0,0)}let seed=2020;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};stars=Array.from({length:coarse.matches?95:210},()=>({x:random()*2-1,y:random()*2-1,z:random()*900,phase:random()*Math.PI*2,r:random()*.8+.4}));draw();if(paused)pose(0)}
 function pose(t){const rotationX=paused?0:-4+pointer.y*4+Math.sin(t*.55)*1.7;const rotationY=paused?-3:pointer.x*8+Math.sin(t*.4)*4+Math.min(scroll/h,1)*9;const rotationZ=paused?0:Math.sin(t*.25)*.6;stage.style.transform=`rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg) translateY(${paused?0:Math.sin(t*.7)*4}px)`}
 function draw(){ctx.clearRect(0,0,w,h);fx?.clearRect(0,0,w,h);if(heroVisible||paused)drawAura(elapsed);const t=elapsed*.001,phase=scroll/(Math.max(1,document.documentElement.scrollHeight-h));
  const sceneScroll=scroll/Math.max(1,h),ease=(a,b,v)=>{const u=Math.max(0,Math.min(1,(v-a)/(b-a)));return u*u*u*(10+u*(-15+6*u))};
  const open=paused?0:ease(.12,1.05,sceneScroll),dissolve=paused?0:ease(1.20,2.45,sceneScroll),sonic=paused?0:ease(1.80,2.85,sceneScroll);
  if(samurai){const orbit=phase*Math.PI*2;
    samurai.style.setProperty('--samurai-x',(paused?0:pointer.x*8)+'px');samurai.style.setProperty('--samurai-y',(paused?0:Math.sin(t*.4)*2)+'px');
    samurai.style.setProperty('--samurai-turn',(paused?-3:pointer.x*3)+'deg');samurai.style.setProperty('--samurai-tilt',(paused?0:pointer.y*-2)+'deg');
    samurai.style.setProperty('--samurai-scale',String(paused?1:1-open*.045));samurai.style.setProperty('--fragment-open',String(open));
    samurai.style.setProperty('--samurai-dissolve',String(dissolve));samurai.style.setProperty('--samurai-fog',String(Math.sin(dissolve*Math.PI)));
    samurai.style.setProperty('--sonic-reveal',String(sonic));samurai.classList.toggle('samurai-gone',dissolve>=.999&&!paused);
    samurai.style.setProperty('--depth-pulse',String(paused?0:Math.min(1,scrollEnergy*.65+impulse*.5)));
    samurai.style.setProperty('--light-position',(paused?-40:Math.sin(orbit*1.5)*65+45+Math.sin(t*.35)*10)+'%');
    samurai.style.setProperty('--light-opacity',String(paused?0:(1-open)*(1-dissolve)*(.12+scrollEnergy*.12+impulse*.12)));
    samurai.style.setProperty('--camera-z',(paused?0:open*65+impulse*12)+'px');
    pieces.forEach((piece,i)=>{const row=Math.floor(i/2),side=i%2===0?-1:1;
      // Separation reaches a fixed endpoint. Staggered erosion then lifts the ink into mist.
      const fade=paused?0:ease(1.17+row*.06+(i%2)*.025,2.25+row*.07,sceneScroll);
      const spread=open*(.8+row*.07),reach=coarse.matches?82:145;
      const x=side*spread*(reach+row*14)+side*fade*12,y=spread*(row-1.5)*(coarse.matches?36:58)-fade*(18+row*6),z=spread*(30+row*20);
      const rotation=side*spread*(24+row*12),turn=side*spread*(22+row*12),stretch=1+spread*(i%3-1)*.3;
      piece.style.transform=`translate3d(${x}px,${y}px,${z}px) rotateY(${turn}deg) rotateZ(${rotation}deg) scale(${stretch},${1+spread*.15})`;
      piece.style.opacity=String((coarse.matches?.72:.86)*Math.pow(1-fade,1.25));
      piece.style.filter=fade>0&&fade<1?`blur(${(fade*fade*(coarse.matches?4:9)).toFixed(2)}px)`:'none';
      piece.style.setProperty('--erode',(-18+fade*136)+'%');
    })
  }
  const cx=w*.76+pointer.x*35,cy=h*.38-Math.sin(phase*6.28)*h*.2;
  const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.7);glow.addColorStop(0,'rgba(86,142,113,.19)');glow.addColorStop(.5,'rgba(162,103,45,.10)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  // A veil of drifting jade vapor bridges the image erosion and the new sonic scene.
  const fog=Math.sin(dissolve*Math.PI)*(1-sonic*.5);
  if(fog>.001&&!paused){const count=coarse.matches?7:13;
   for(let i=0;i<count;i++){const seed=i*2.399,px=w*.77+Math.sin(seed)*w*.20+Math.sin(t*.18+seed)*20,
    py=h*.50+Math.cos(seed*1.3)*h*.38-dissolve*h*.12,radius=(coarse.matches?65:100)+Math.sin(seed)*25;
    const mist=ctx.createRadialGradient(px,py,0,px,py,radius);mist.addColorStop(0,`rgba(134,165,148,${fog*.10})`);mist.addColorStop(.5,`rgba(134,165,148,${fog*.035})`);mist.addColorStop(1,'rgba(134,165,148,0)');
    ctx.fillStyle=mist;ctx.fillRect(px-radius,py-radius,radius*2,radius*2);
   }
  }
  // Open, blade-like sound ribbons replace the figure, breathing behind the content.
  if(sonic>.001&&!paused){const ribbons=coarse.matches?3:5,steps=coarse.matches?48:72;
   for(let j=0;j<ribbons;j++){const points=[];
    for(let k=0;k<=steps;k++){const u=k/steps,x=w*(.24+u*.87),y=h*(.65-u*.26)+Math.sin(u*5.6+t*.14+j*.47)*h*(.18+j*.012)+Math.sin(u*16-t*.22+j)*h*.024+(j-2)*h*.035;
     points.push({x:x+pointer.x*6,y:y-scrollEnergy*10*Math.sin(u*Math.PI),width:Math.sin(u*Math.PI)**1.5*(coarse.matches?5:10)*(1+j*.14)})}
    ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y-p.width):ctx.moveTo(p.x,p.y-p.width));
    for(let i=points.length-1;i>=0;i--)ctx.lineTo(points[i].x,points[i].y+points[i].width);ctx.closePath();
    ctx.fillStyle=j%2?`rgba(208,172,112,${sonic*.085})`:`rgba(134,165,148,${sonic*.11})`;ctx.fill();
    for(let edge=0;edge<2;edge++){ctx.beginPath();points.forEach((p,i)=>{const y=p.y+(edge?1:-1)*p.width;i?ctx.lineTo(p.x,y):ctx.moveTo(p.x,y)});
     ctx.strokeStyle=edge?`rgba(134,165,148,${sonic*.16})`:`rgba(208,172,112,${sonic*(j===2?.48:.26)})`;ctx.lineWidth=j===2?1.1:.65;ctx.stroke()}
   }
  }
  const angle=t*.055+phase*3.2,ca=Math.cos(angle),sa=Math.sin(angle);
  for(const s of stars){const x=s.x*w*.8,y=s.y*h*.95;const rx=x*ca+(s.z-450)*sa,z=700+s.z-x*sa*.25,scale=700/z;const sx=w*.5+rx*scale+pointer.x*12,sy=h*.5+(y-scroll*.05)*scale+Math.sin(t*.3+s.phase)*6;if(sx<0||sx>w||sy<0||sy>h)continue;const shimmer=.24+(Math.sin(t*.65+s.phase)+1)*.15;ctx.fillStyle=`rgba(228,175,103,${shimmer})`;ctx.beginPath();ctx.arc(sx,sy,s.r*scale,0,Math.PI*2);ctx.fill();if(scrollEnergy>.08&&!paused){ctx.strokeStyle=`rgba(228,175,103,${scrollEnergy*.16})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+Math.sin(angle)*scrollEnergy*16,sy+scrollEnergy*22);ctx.stroke()}if(s.r>.98&&Math.sin(t*.65+s.phase)>.97){ctx.strokeStyle='rgba(239,188,114,.25)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(sx-3,sy);ctx.lineTo(sx+3,sy);ctx.moveTo(sx,sy-3);ctx.lineTo(sx,sy+3);ctx.stroke()}}
  ripples=ripples.filter(r=>t-r.born<1.1);for(const r of ripples){const age=(t-r.born)/1.1,radius=12+age*(coarse.matches?100:180);clickCtx.strokeStyle=`rgba(224,194,164,${(1-age)*.65})`;clickCtx.lineWidth=1.2;clickCtx.beginPath();clickCtx.arc(r.x,r.y,radius,0,Math.PI*2);clickCtx.stroke();clickCtx.strokeStyle=`rgba(154,205,188,${(1-age)*.38})`;clickCtx.beginPath();clickCtx.arc(r.x,r.y,radius*.7,0,Math.PI*2);clickCtx.stroke()}
 }
 function updateProgress(){const range=document.documentElement.scrollHeight-h;if(progress)progress.style.transform=`scaleX(${range>0?Math.min(1,window.scrollY/range):0})`}
 function parallax(){artNodes.forEach(n=>{const rect=n.getBoundingClientRect(),offset=Math.max(-1,Math.min(1,(rect.top+rect.height/2-h/2)/h));n.style.setProperty('--art-y',(paused?0:offset*(coarse.matches?10:24))+'px');n.style.setProperty('--art-angle',(paused?0:offset*(coarse.matches?.6:1.8))+'deg')})}
 function frame(now){raf=0;if(paused||document.hidden)return;const delta=last?Math.min(now-last,80):0;if(delta<32&&last){raf=requestAnimationFrame(frame);return}last=now;elapsed+=delta;
  const travel=window.scrollY-dragonScroll;dragonScroll=window.scrollY;
  if(travel>1)dragonEyeGlow=1;else dragonEyeGlow*=Math.exp(-delta/170);
  if(travel>2){if(dragonQuiet<=0)dragonBurst=1;dragonQuiet=180}else dragonQuiet=Math.max(0,dragonQuiet-delta);
  dragonBurst*=Math.exp(-delta/440);dragonSweep+=delta*.001*(.035+dragonBurst*1.8);
  impulse*=Math.exp(-delta/550);scrollEnergy+=(Math.min(Math.abs(window.scrollY-scroll)/160,1)-scrollEnergy)*.12;scroll+=(window.scrollY-scroll)*.12;pointer.x+=(aim.x-pointer.x)*.08;pointer.y+=(aim.y-pointer.y)*.08;draw();parallax();if(heroVisible)pose(elapsed*.001);updateProgress();raf=requestAnimationFrame(frame)}
 function start(){if(!paused&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame)}}
 function state(){if(paused){impulse=0;scrollEnergy=0;dragonBurst=0;dragonQuiet=0;dragonEyeGlow=0}dragonScroll=window.scrollY;document.documentElement.classList.toggle('motion-paused',paused);document.documentElement.classList.toggle('motion-enabled',!paused);toggle.textContent=paused?'Bật chuyển động':'Tắt chuyển động';toggle.setAttribute('aria-pressed',String(!paused));cancelAnimationFrame(raf);raf=0;pose(elapsed*.001);parallax();draw();if(paused)document.querySelectorAll('.reveal-pending').forEach(n=>n.classList.remove('reveal-pending'));start()}
 toggle.onclick=()=>{paused=!paused;motionPreference=paused?'off':'on';try{localStorage.setItem('trippin-motion',motionPreference)}catch{}state()};
 reduce.addEventListener('change',()=>{if(motionPreference==='on'||motionPreference==='off')return;paused=reduce.matches;state()});
 window.addEventListener('pointermove',e=>{if(coarse.matches||paused)return;aim.x=(e.clientX/w-.5)*2;aim.y=(e.clientY/h-.5)*2},{passive:true});
 window.addEventListener('scroll',()=>{if(paused){scroll=window.scrollY;updateProgress()}},{passive:true});
 document.addEventListener('click',e=>{if(paused)return;const target=e.target.closest?.('a,button,summary,[role="slider"],h2,h3');if(!target||target.id==='motionToggle')return;const rect=target.getBoundingClientRect();ripples.push({x:e.detail?e.clientX:rect.left+rect.width/2,y:e.detail?e.clientY:rect.top+rect.height/2,born:elapsed*.001});ripples=ripples.slice(-5);impulse=1;scrollEnergy=Math.max(scrollEnergy,.8);target.animate?.([{filter:'brightness(1)'},{filter:'brightness(1.3)'},{filter:'brightness(1)'}],{duration:550,easing:'ease-out'});const href=target.getAttribute('href');if(href?.startsWith('#')&&href.length>1){const destination=document.getElementById(href.slice(1));destination?.querySelector('h2')?.animate?.([{opacity:.6,translate:'0 18px'},{opacity:1,translate:'0 0'}],{duration:850,easing:'cubic-bezier(.22,1,.36,1)',delay:180})}});
 window.addEventListener('resize',resize,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0}else start()});
 window.addEventListener('pagehide',e=>{cancelAnimationFrame(raf);raf=0;if(!e.persisted)ripples=[]});window.addEventListener('pageshow',()=>start());
 function reveal(){if(!('IntersectionObserver'in window)||paused)return;const artObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)artNodes.add(e.target);else artNodes.delete(e.target)})},{rootMargin:'80px'});document.querySelectorAll('.hero-image,.portrait,.project-card>img,.about-video .video-empty').forEach(n=>{n.classList.add('scroll-art');artObserver.observe(n)});const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('reveal-pending');observer.unobserve(e.target)}})},{threshold:.08});document.querySelectorAll('.section,.project-card,.about-video,.game-demo').forEach(n=>{if(n.getBoundingClientRect().top>h*.95){n.classList.add('reveal-pending');observer.observe(n)}})}
 if('IntersectionObserver'in window){new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting},{rootMargin:'60px'}).observe(title)}
 if(window.trippinReady)window.trippinReady.then(data=>{if(!data.profile?.heroImage){document.querySelector('.hero-image')?.classList.add('visual-study');const caption=document.getElementById('heroImageCaption');if(caption)caption.textContent='Visual study / Sonic fragments'}requestAnimationFrame(reveal)}).catch(()=>{});
 document.fonts?.ready.then(()=>resize());resize();state();updateProgress();
})();
