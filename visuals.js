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
 let paused=reduce.matches;
 try{const stored=localStorage.getItem('trippin-motion');if(stored==='off')paused=true}catch{}
 const stage=document.createElement('span');stage.className='trippin-stage';
 const word=title.textContent.trim();title.setAttribute('aria-label',word);
 function layer(cls,depth){const n=document.createElement('span');n.className=cls;n.setAttribute('aria-hidden','true');if(depth)n.style.setProperty('--depth',String(depth));Array.from(word).forEach((ch,i)=>{const letter=document.createElement('span');letter.className='trippin-letter';letter.style.setProperty('--i',String(i));letter.textContent=ch;n.append(letter)});stage.append(n)}
 for(let d=coarse.matches?4:8;d>0;d--)layer('trippin-depth',d);
 layer('trippin-front',0);title.replaceChildren(stage);
 const titleBack=document.createElement('canvas'),titleFront=document.createElement('canvas');
 titleBack.className='title-aura title-aura-back';titleFront.className='title-aura title-aura-front';
 for(const n of [titleBack,titleFront]){n.setAttribute('aria-hidden','true');title.append(n)}
 const backCtx=titleBack.getContext('2d'),frontCtx=titleFront.getContext('2d');let auraW=0,auraH=0;
 function sizeAura(){const ratio=Math.min(window.devicePixelRatio||1,coarse.matches?1.25:1.5);auraW=(title.clientWidth||window.innerWidth*.85)*1.12;auraH=(title.clientHeight||window.innerHeight*.2)*1.9;for(const [n,c] of [[titleBack,backCtx],[titleFront,frontCtx]]){n.width=Math.round(auraW*ratio);n.height=Math.round(auraH*ratio);c?.setTransform(ratio,0,0,ratio,0,0)}}
 function drawAura(time){
  if(!backCtx||!frontCtx||!auraW)return;
  for(const c of [backCtx,frontCtx])c.clearRect(0,0,auraW,auraH);
  if(paused)return;
  const t=time*.001,steps=coarse.matches?72:112;
  // An open calligraphic gesture, not a closed orbit. Four joined cubic strokes.
  const curves=[[[.10,.76],[.37,.91],[.89,.92],[.90,.64]],
   [[.90,.64],[.99,.31],[.79,.09],[.48,.15]],
   [[.48,.15],[.12,.13],[.02,.36],[.18,.58]],
   [[.18,.58],[.34,.79],[.63,.51],[.69,.20]]];
  function point(u){const index=Math.min(3,Math.floor(u*4)),v=u===1?1:u*4-index,iv=1-v,c=curves[index];
   let x=iv*iv*iv*c[0][0]+3*iv*iv*v*c[1][0]+3*iv*v*v*c[2][0]+v*v*v*c[3][0];
   let y=iv*iv*iv*c[0][1]+3*iv*iv*v*c[1][1]+3*iv*v*v*c[2][1]+v*v*v*c[3][1];
   const breath=Math.sin(t*.42+u*8),bend=Math.min(scroll/Math.max(h,1),1);
   x+=Math.sin(t*.31+u*10)*.009+pointer.x*.004;
   y+=breath*.025+Math.sin(u*Math.PI)*bend*.025;
   return {x:x*auraW,y:y*auraH,front:u<.23||u>.70,u};
  }
  const spine=Array.from({length:steps+1},(_,i)=>point(i/steps));
  spine.forEach((p,i)=>{const a=spine[Math.max(0,i-1)],b=spine[Math.min(steps,i+1)],len=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y));p.nx=-(b.y-a.y)/len;p.ny=(b.x-a.x)/len;
   p.width=auraH*.034*Math.pow(Math.sin(p.u*Math.PI*.87),.9)*(1+.15*Math.sin(p.u*19-t*.5));});
  for(const c of [backCtx,frontCtx]){
   const front=c===frontCtx,groups=[];let group=[];
   for(const p of spine){if(p.front===front){group.push(p)}else if(group.length){group.push(p);groups.push(group);group=[]}}
   if(group.length)groups.push(group);
   for(const g of groups){if(g.length<2)continue;
    // One continuous silhouette prevents the dotted trail of many blurred segments.
    for(const haze of [true,false]){c.beginPath();const spread=haze?2.1:1;
     g.forEach((p,i)=>{const x=p.x+p.nx*p.width*spread,y=p.y+p.ny*p.width*spread;i?c.lineTo(x,y):c.moveTo(x,y)});
     for(let i=g.length-1;i>=0;i--){const p=g[i];c.lineTo(p.x-p.nx*p.width*spread,p.y-p.ny*p.width*spread)}
     c.closePath();c.fillStyle=haze?'rgba(134,165,148,.10)':'rgba(134,165,148,.16)';
     c.shadowColor='rgba(134,165,148,.35)';c.shadowBlur=haze?(coarse.matches?10:24):0;c.fill();c.shadowBlur=0;
    }
    // Fine drifting fibres break the smooth body into smoke and brush grain.
    for(let j=0;j<(coarse.matches?4:7);j++){c.beginPath();g.forEach((p,i)=>{
     const offset=(j/6-.5)*p.width*2+Math.sin(p.u*31-t*.55+j*.7)*p.width*.3;
     const x=p.x+p.nx*offset,y=p.y+p.ny*offset;i?c.lineTo(x,y):c.moveTo(x,y)});
     c.strokeStyle=j===2?'rgba(208,172,112,.48)':`rgba(185,199,186,${.06+(j%3)*.045})`;c.lineWidth=j===2?.85:.55;c.stroke();
    }
   }
  }
  // A swept brow, two antler strokes and long whiskers give the mist a dragon's gesture.
  const p=spine[steps],q=spine[steps-1],c=frontCtx,s=auraH*.043;
  c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(p.y-q.y,p.x-q.x));c.lineCap='round';c.lineJoin='round';
  c.shadowColor='rgba(134,165,148,.7)';c.shadowBlur=coarse.matches?8:18;
  c.fillStyle='rgba(134,165,148,.22)';c.strokeStyle='rgba(208,172,112,.65)';c.lineWidth=.9;
  c.beginPath();c.moveTo(-s*2.4,0);c.bezierCurveTo(-s*1.6,-s*.5,-s*.8,-s*1.0,s*.2,-s*.75);
  c.quadraticCurveTo(s*.65,-s*.8,s*1.5,-s*.25);c.lineTo(s*1.9,-s*.08);
  c.quadraticCurveTo(s*1.35,s*.15,s*.55,s*.15);c.lineTo(s*.9,s*.48);
  c.bezierCurveTo(-s*.2,s*.8,-s*1.1,s*.35,-s*2.4,0);c.closePath();c.fill();c.stroke();c.shadowBlur=0;
  for(let j=0;j<2;j++){const offset=j*s*.45;c.strokeStyle=j?'rgba(185,199,186,.55)':'rgba(208,172,112,.7)';c.beginPath();c.moveTo(-s*.5-offset,-s*.55);
   c.bezierCurveTo(-s*1.25-offset,-s*1.1,-s*2.0-offset,-s*1.0,-s*2.7-offset,-s*2.0);c.stroke();
   c.beginPath();c.moveTo(-s*1.8-offset,-s*1.16);c.quadraticCurveTo(-s*2.1-offset,-s*1.4,-s*2.0-offset,-s*1.85);c.stroke();}
  for(const side of [-1,1]){c.strokeStyle='rgba(185,199,186,.42)';c.beginPath();c.moveTo(s*.9,side*s*.18);
   c.bezierCurveTo(s*2.6,side*s*1.3,s*.6,side*s*2.5,-s*3.7,side*s*1.6+Math.sin(t*.6)*s*.4);c.stroke();}
  c.restore();
 }

 const progress=document.querySelector('.scroll-progress');
 let w=0,h=0,raf=0,last=0,elapsed=0,scroll=window.scrollY||0,pointer={x:0,y:0},aim={x:0,y:0},heroVisible=true;
 let stars=[],ripples=[],scrollEnergy=0,impulse=0;const artNodes=new Set();
 function resize(){sizeAura();w=window.innerWidth;h=window.innerHeight;const dpr=Math.min(window.devicePixelRatio||1,coarse.matches?1.25:1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(fx){interactionCanvas.width=canvas.width;interactionCanvas.height=canvas.height;fx.setTransform(dpr,0,0,dpr,0,0)}let seed=2020;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};stars=Array.from({length:coarse.matches?95:210},()=>({x:random()*2-1,y:random()*2-1,z:random()*900,phase:random()*Math.PI*2,r:random()*.8+.4}));draw();if(paused)pose(0)}
 function pose(t){const rotationX=paused?0:-4+pointer.y*4+Math.sin(t*.55)*1.7;const rotationY=paused?-3:pointer.x*8+Math.sin(t*.4)*4+Math.min(scroll/h,1)*9;const rotationZ=paused?0:Math.sin(t*.25)*.6;stage.style.transform=`rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg) translateY(${paused?0:Math.sin(t*.7)*4}px)`}
 function draw(){ctx.clearRect(0,0,w,h);fx?.clearRect(0,0,w,h);if(heroVisible||paused)drawAura(elapsed);const t=elapsed*.001,phase=scroll/(Math.max(1,document.documentElement.scrollHeight-h));
  if(samurai){const orbit=phase*Math.PI*2,open=paused?0:Math.min(1,Math.pow(Math.sin(Math.PI*scroll/Math.max(1,h*2)),2)+impulse*.16);samurai.style.setProperty('--samurai-x',(paused?0:pointer.x*8)+'px');samurai.style.setProperty('--samurai-y',(paused?0:Math.sin(t*.4)*2)+'px');samurai.style.setProperty('--samurai-turn',(paused?-3:pointer.x*3)+'deg');samurai.style.setProperty('--samurai-tilt',(paused?0:pointer.y*-2)+'deg');samurai.style.setProperty('--samurai-roll',(paused?0:0)+'deg');samurai.style.setProperty('--samurai-scale',String(paused?1:1-Math.sin(phase*Math.PI)*.06));samurai.style.setProperty('--fragment-open',String(open));samurai.style.setProperty('--depth-pulse',String(paused?0:Math.min(1,scrollEnergy*.65+impulse*.5)));samurai.style.setProperty('--light-position',(paused?-40:Math.sin(orbit*1.5)*65+45+Math.sin(t*.35)*10)+'%');samurai.style.setProperty('--light-opacity',String(paused?0:(1-open)*(.12+scrollEnergy*.12+impulse*.12)));samurai.style.setProperty('--camera-z',(paused?0:Math.sin(phase*Math.PI)*95+impulse*12)+'px');
    pieces.forEach((piece,i)=>{const row=Math.floor(i/2),side=i%2===0?-1:1;
      // Each clipped region has its own trajectory, rotation, and stretch. Identity at assembly.
      const spread=open*(.8+row*.07),reach=coarse.matches?82:145;
      const x=side*spread*(reach+row*14),y=spread*(row-1.5)*(coarse.matches?36:58),z=spread*(30+row*20);
      const rotation=side*spread*(24+row*12),turn=side*spread*(22+row*12),stretch=1+spread*(i%3-1)*.3;
      piece.style.transform=`translate3d(${x}px,${y}px,${z}px) rotateY(${turn}deg) rotateZ(${rotation}deg) scale(${stretch},${1+spread*.15})`;
      piece.style.opacity=String(coarse.matches?.72:.86);
    })}
  const cx=w*.76+pointer.x*35,cy=h*.38-Math.sin(phase*6.28)*h*.2;
  const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.7);glow.addColorStop(0,'rgba(86,142,113,.19)');glow.addColorStop(.5,'rgba(162,103,45,.10)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  // Dim spectral contours follow the image's gesture, rather than drawing a new object.
  if(!paused){const lines=coarse.matches?3:5;ctx.save();ctx.translate(w*.77,h*.53);ctx.rotate(Math.sin(phase*Math.PI*2)*.22);for(let j=0;j<lines;j++){const drift=Math.sin(t*.35+j*.8+phase*8),span=Math.min(w*.28,350);ctx.strokeStyle=`rgba(208,172,112,${.025+scrollEnergy*.035})`;ctx.lineWidth=j===0?1.1:.55;ctx.beginPath();for(let k=0;k<=36;k++){const u=k/36,x=(u-.5)*span*2,y=Math.sin(u*7+phase*10+j*.65+t*.3)*(18+j*7)+drift*32+(j-2)*24;k?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}ctx.restore()}
  const angle=t*.055+phase*3.2,ca=Math.cos(angle),sa=Math.sin(angle);
  for(const s of stars){const x=s.x*w*.8,y=s.y*h*.95;const rx=x*ca+(s.z-450)*sa,z=700+s.z-x*sa*.25,scale=700/z;const sx=w*.5+rx*scale+pointer.x*12,sy=h*.5+(y-scroll*.05)*scale+Math.sin(t*.3+s.phase)*6;if(sx<0||sx>w||sy<0||sy>h)continue;const shimmer=.24+(Math.sin(t*.65+s.phase)+1)*.15;ctx.fillStyle=`rgba(228,175,103,${shimmer})`;ctx.beginPath();ctx.arc(sx,sy,s.r*scale,0,Math.PI*2);ctx.fill();if(scrollEnergy>.08&&!paused){ctx.strokeStyle=`rgba(228,175,103,${scrollEnergy*.16})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+Math.sin(angle)*scrollEnergy*16,sy+scrollEnergy*22);ctx.stroke()}if(s.r>.98&&Math.sin(t*.65+s.phase)>.97){ctx.strokeStyle='rgba(239,188,114,.25)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(sx-3,sy);ctx.lineTo(sx+3,sy);ctx.moveTo(sx,sy-3);ctx.lineTo(sx,sy+3);ctx.stroke()}}
  ripples=ripples.filter(r=>t-r.born<1.1);for(const r of ripples){const age=(t-r.born)/1.1,radius=12+age*(coarse.matches?100:180);clickCtx.strokeStyle=`rgba(224,194,164,${(1-age)*.65})`;clickCtx.lineWidth=1.2;clickCtx.beginPath();clickCtx.arc(r.x,r.y,radius,0,Math.PI*2);clickCtx.stroke();clickCtx.strokeStyle=`rgba(154,205,188,${(1-age)*.38})`;clickCtx.beginPath();clickCtx.arc(r.x,r.y,radius*.7,0,Math.PI*2);clickCtx.stroke()}
 }
 function updateProgress(){const range=document.documentElement.scrollHeight-h;if(progress)progress.style.transform=`scaleX(${range>0?Math.min(1,window.scrollY/range):0})`}
 function parallax(){artNodes.forEach(n=>{const rect=n.getBoundingClientRect(),offset=Math.max(-1,Math.min(1,(rect.top+rect.height/2-h/2)/h));n.style.setProperty('--art-y',(paused?0:offset*(coarse.matches?10:24))+'px');n.style.setProperty('--art-angle',(paused?0:offset*(coarse.matches?.6:1.8))+'deg')})}
 function frame(now){raf=0;if(paused||document.hidden)return;const delta=last?Math.min(now-last,80):0;if(delta<32&&last){raf=requestAnimationFrame(frame);return}last=now;elapsed+=delta;impulse*=Math.exp(-delta/550);scrollEnergy+=(Math.min(Math.abs(window.scrollY-scroll)/160,1)-scrollEnergy)*.12;scroll+=(window.scrollY-scroll)*.12;pointer.x+=(aim.x-pointer.x)*.08;pointer.y+=(aim.y-pointer.y)*.08;draw();parallax();if(heroVisible)pose(elapsed*.001);updateProgress();raf=requestAnimationFrame(frame)}
 function start(){if(!paused&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame)}}
 function state(){if(paused){impulse=0;scrollEnergy=0}document.documentElement.classList.toggle('motion-paused',paused);toggle.textContent=paused?'Bật chuyển động':'Tắt chuyển động';toggle.setAttribute('aria-pressed',String(!paused));cancelAnimationFrame(raf);raf=0;pose(elapsed*.001);parallax();draw();if(paused)document.querySelectorAll('.reveal-pending').forEach(n=>n.classList.remove('reveal-pending'));start()}
 toggle.onclick=()=>{paused=!paused;try{localStorage.setItem('trippin-motion',paused?'off':'on')}catch{}state()};
 reduce.addEventListener('change',()=>{paused=reduce.matches;state()});
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
