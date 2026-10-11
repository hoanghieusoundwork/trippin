'use strict';
window.trippinReady.then(data=>{
const copy=data.copy||{};document.querySelectorAll('[data-copy]').forEach(n=>{if(typeof copy[n.dataset.copy]==='string')n.textContent=/Heading(?:Lead|Tail)$/.test(n.dataset.copy)?copy[n.dataset.copy].replace(/\.+$/,''):copy[n.dataset.copy]});
const $=s=>document.querySelector(s);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
function safeUrl(value){if(!value)return null;try{const u=new URL(value,location.href);return (['https:','http:'].includes(u.protocol)||(u.protocol==='blob:'&&new URLSearchParams(location.search).get('preview')==='1'))?u.href:null}catch{return null}}
function renderProjects(){
 const items=(data.projects||[]).slice(0,5),grid=$('#projects');grid.replaceChildren();$('#workCount').textContent=String(items.length).padStart(2,'0')+' / 05';$('#archiveEmpty').hidden=items.length>0;
 for(let i=0;i<5;i++){
  const p=items[i],kind=p?.workType||(i===0?'mixtape':'track'),card=el('article','project-card'+(kind==='mixtape'?' mixtape-card':'')),body=el('div','project-body');
  if(!p){card.classList.add('project-placeholder');const art=el('div','project-art');art.append(el('span','slot-number',String(i+1).padStart(2,'0')));body.append(el('span','label',kind==='mixtape'?'Mixtape':'Bài nhạc'),el('p','label','Chưa thêm sản phẩm'));card.append(art,body);grid.append(card);continue}
  const youtubeId=TRIPPIN_YOUTUBE.videoId(p.youtube),playlistId=TRIPPIN_YOUTUBE.playlistId(p.youtube),image=safeUrl(p.artwork)||(youtubeId?'https://i.ytimg.com/vi/'+youtubeId+'/hqdefault.jpg':null);
  if(image){const img=el('img');img.src=image;img.alt=p.title+' — artwork';img.loading='lazy';img.onerror=()=>img.replaceWith(el('div','project-art','TRIPPIN'));card.append(img)}else{const art=el('div','project-art artwork-pending');art.append(el('span','artwork-title',p.title),el('span','label','Chờ artwork'));card.append(art)};
  body.append(el('span','label',kind==='mixtape'?'Mixtape':'Bài nhạc'),el('h3','',p.title));if(p.role)body.append(el('p','project-credit',p.role));
  if(p.description||p.credits||p.year||p.genre||p.trackCount){const detail=el('details','project-detail');detail.append(el('summary','','Thông tin sản phẩm'));for(const text of [p.genre?'Thể loại: '+p.genre:'',p.year?'Release: '+p.year:'',p.trackCount?'Mixtape gồm '+p.trackCount+' bài':'',p.description,p.credits])if(text)detail.append(el('p','',text));body.append(detail)}
  if(youtubeId||playlistId)TRIPPIN_YOUTUBE.mount(body,p);const audio=safeUrl(p.audio);if(audio&&!youtubeId&&!playlistId){const audioEl=el('audio');audioEl.controls=true;audioEl.preload='none';audioEl.src=audio;audioEl.setAttribute('aria-label','Nghe '+p.title);body.append(audioEl)}card.append(body);grid.append(card)
 }
}
renderProjects();
$('#notes').hidden=!data.notes.length;data.notes.forEach(n=>{const a=el('article','note-entry');const body=el('div');body.append(el('h3','',n.title),el('p','',n.body));a.append(el('span','label',n.date),body);$('#notesList').append(a)});
const profile=data.profile||{};if($('#heroImage')&&safeUrl(profile.heroImage)){$('#heroImage').src=safeUrl(profile.heroImage);$('#heroImage').alt=profile.heroAlt||'Trippin — hình ảnh tác phẩm';$('#heroImageCaption').textContent=profile.heroCaption||'Trippin'}if(safeUrl(profile.portrait)){$('#portraitImage').src=safeUrl(profile.portrait);$('#portraitImage').hidden=false;$('#portraitPlaceholder').hidden=true}
function contactIcon(kind){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','contact-icon');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');const paths={email:'M3 19V5l9 7 9-7v14M3 5l9 7 9-7',facebook:'M14 21v-8h3l.5-4H14V7c0-1.2.5-2 2-2h2V2.5c-.7-.2-1.7-.3-3-.3-3 0-5 1.8-5 5V9H7v4h3v8',instagram:'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z'};const path=document.createElementNS(ns,'path');path.setAttribute('d',paths[kind]);if(kind==='facebook'){path.setAttribute('fill','currentColor');path.setAttribute('stroke','none')}svg.append(path);if(kind==='instagram'){for(const [cx,cy,r] of [[12,12,4],[17.5,6.5,.75]]){const c=document.createElementNS(ns,'circle');c.setAttribute('cx',cx);c.setAttribute('cy',cy);c.setAttribute('r',r);if(r<1)c.setAttribute('fill','currentColor');svg.append(c)}}return svg}
const contact=data.contact||{};for(const [key,label] of [['email','Email'],['facebook','Facebook'],['instagram','Instagram']]){const url=key==='email'?(contact.email?'mailto:'+encodeURIComponent(contact.email):null):safeUrl(contact[key]);if(!url)continue;const a=el('a','contact-link');a.href=url;a.append(contactIcon(key),el('span','',label),el('span','contact-arrow','↗'));if(key==='email'){a.setAttribute('aria-label','Email — '+contact.email)}else{a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',label+' — mở trong tab mới')}$('#contactLinks').append(a)}$('#contactPending').hidden=Boolean(contact.email||safeUrl(contact.facebook)||safeUrl(contact.instagram));

function videoMedia(card,d){
 const url=safeUrl(d.video);if(url){const v=el('video');v.controls=true;v.preload='none';v.playsInline=true;v.src=url;const poster=safeUrl(d.poster);if(poster)v.poster=poster;v.setAttribute('aria-label',d.title);card.append(v);return}
 const youtube=d.youtube||(TRIPPIN_YOUTUBE.videoId(d.link)?d.link:'');if(TRIPPIN_YOUTUBE.videoId(youtube))TRIPPIN_YOUTUBE.mountVideo(card,{...d,youtube});
}
const aboutVideos=(data.aboutVideos||[]).slice(0,2);for(let i=0;i<2;i++){const d=aboutVideos[i],card=el('article','about-video');if(d){videoMedia(card,d);card.append(el('h3','',d.title));if(d.description)card.append(el('p','',d.description))}else{const placeholder=el('div','video-empty');placeholder.append(el('span','label','Video '+String(i+1).padStart(2,'0')+' · Sẽ được bổ sung'));card.append(placeholder)}$('#aboutVideos').append(card)}
const demos=data.gameDemos||[];$('#gameEmpty').hidden=demos.length>0;
demos.forEach(d=>{const card=el('article','game-demo');videoMedia(card,d);card.append(el('h3','',d.title));if(d.role)card.append(el('p','',d.role));const link=safeUrl(d.link);if(link&&!TRIPPIN_YOUTUBE.videoId(link)){const a=el('a','quiet-link','Mở demo ↗');a.href=link;a.target='_blank';a.rel='noopener noreferrer';card.append(a)}if(d.description||d.credits){const more=el('details','project-detail');more.append(el('summary','','Chi tiết demo'));if(d.description)more.append(el('p','',d.description));if(d.credits)more.append(el('p','',d.credits));card.append(more)}$('#gameDemos').append(card)});

document.querySelectorAll('[data-link]').forEach(a=>{const u=safeUrl(data.links?.[a.dataset.link]);if(u)a.href=u;else a.hidden=true});
if(location.hostname.endsWith('.github.io')&&!new URLSearchParams(location.search).has('preview')){document.querySelectorAll('.preview-note,.admin-entry').forEach(n=>{n.hidden=true})}


// Keep old local drafts aligned with the updated branding and heading marks.
const brandText=t=>t.replace(/\$ick/gi,m=>m.slice(1)===m.slice(1).toUpperCase()?'SICK':'Sick');
const bodyText=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let textNode;
while((textNode=bodyText.nextNode()))textNode.nodeValue=brandText(textNode.nodeValue);
document.querySelectorAll('[alt],[aria-label],[title]').forEach(n=>{for(const key of ['alt','aria-label','title'])if(n.hasAttribute(key))n.setAttribute(key,brandText(n.getAttribute(key)))});
document.querySelectorAll('h1,h2,h3,summary,.section-head>.label,.game-intro>.label,.subsection-head>.label').forEach(heading=>{
 const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);let last=null,next;
 while((next=walker.nextNode()))if(next.nodeValue.trim())last=next;
 if(!last||!/[.。]\s*$/.test(last.nodeValue))return;
 last.nodeValue=last.nodeValue.replace(/[.。]+\s*$/,'');
 if(!heading.querySelector('.heading-icon'))last.parentNode.append(document.querySelector('#work .heading-icon').cloneNode(true));
});

}).catch(()=>{const n=document.createElement('p');n.textContent='Không tải được nội dung. Hãy tải lại trang.';n.setAttribute('role','alert');document.body.prepend(n)});
