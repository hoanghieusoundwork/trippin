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
  const clock=time*.001,head=clock*.28+.3,segments=coarse.matches?56:84;
  const cx=auraW*.5,cy=auraH*.5,rx=auraW*.44,ry=auraH*.28;
  // A tapered, breathing ink-serpent: body alternates between planes around the word.
  function point(a){return {x:cx+Math.cos(a)*rx+Math.sin(a*3-clock*.4)*auraW*.018,
   y:cy+Math.sin(a)*ry+Math.sin(a*2+clock*.35)*auraH*.07+Math.cos(a)*auraH*.09,
   z:Math.sin(a+.65+Math.min(scroll/Math.max(h,1),1)*.6)}}
  for(let k=0;k<segments;k++){
   const u=k/segments,a=head-(1-u)*Math.PI*1.86,p=point(a),q=point(a+Math.PI*1.86/segments);
   const c=p.z>0?frontCtx:backCtx,body=Math.pow(Math.sin(u*Math.PI*.86),.8),width=Math.max(.5,body*auraH*.028);
   c.lineCap='round';
   // Diffuse atmosphere follows a precise spine; wide strokes stay translucent.
   c.shadowColor='rgba(134,165,148,.42)';c.shadowBlur=coarse.matches?7:18;
   c.strokeStyle=`rgba(134,165,148,${u*.13})`;c.lineWidth=width*3;
   c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();c.shadowBlur=0;
   c.strokeStyle=`rgba(134,165,148,${.05+u*.22})`;c.lineWidth=width;
   c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();
   c.strokeStyle=`rgba(208,172,112,${u*.48})`;c.lineWidth=Math.max(.5,width*.12);
   c.beginPath();c.moveTo(p.x,p.y-width*.2);c.lineTo(q.x,q.y-width*.2);c.stroke();
  }
  const p=point(head),q=point(head+.012),c=p.z>0?frontCtx:backCtx,scale=Math.max(3,auraH*.031);
  c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(q.y-p.y,q.x-p.x));
  c.shadowColor='rgba(134,165,148,.6)';c.shadowBlur=coarse.matches?6:16;
  c.fillStyle='rgba(134,165,148,.35)';c.strokeStyle='rgba(208,172,112,.72)';c.lineWidth=.9;
  c.beginPath();c.moveTo(-scale*2,0);c.quadraticCurveTo(-scale,-scale,scale*.4,-scale*.65);
  c.lineTo(scale*1.8,-scale*.2);c.lineTo(scale*1.15,scale*.25);c.lineTo(scale*.3,scale*.5);
  c.quadraticCurveTo(-scale,scale,-scale*2,0);c.closePath();c.fill();c.stroke();c.shadowBlur=0;
  // Brush-like crest and whiskers suggest a dragon without a literal illustration.
  for(const side of [-1,1]){c.strokeStyle='rgba(208,172,112,.5)';c.beginPath();c.moveTo(0,side*scale*.5);
   c.quadraticCurveTo(-scale*.9,side*scale*1.6,-scale*2.6,side*scale*1.1);c.stroke();
   c.strokeStyle='rgba(134,165,148,.4)';c.beginPath();c.moveTo(scale,side*scale*.15);
   c.quadraticCurveTo(scale*1.5,side*scale*1.8,-scale*1.8,side*scale*2.2);c.stroke()}
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
