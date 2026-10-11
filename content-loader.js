'use strict';
window.trippinReady=(async()=>{
 if(new URLSearchParams(location.search).get('preview')==='1'){
  const draft=await TRIPPIN_STORE.getDraft();if(draft){const assets=await TRIPPIN_STORE.assets();const urls=new Map(assets.map(a=>[a.path,URL.createObjectURL(a.blob)]));function replace(o){if(Array.isArray(o))return o.map(replace);if(o&&typeof o==='object')return Object.fromEntries(Object.entries(o).map(([k,v])=>[k,replace(v)]));return typeof o==='string'&&urls.has(o)?urls.get(o):o}const banner=document.createElement('div');banner.className='preview-note';banner.textContent='Xem trước bản nháp trên thiết bị · Chưa xuất bản';document.body.prepend(banner);return replace(draft)}
 }
 const r=await fetch('data/content.json',{cache:'no-store'});if(!r.ok)throw Error('Không tải được nội dung');return r.json();
})();
