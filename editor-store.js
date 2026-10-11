'use strict';
window.TRIPPIN_STORE=(()=>{
 let opened;
 function db(){if(!opened)opened=new Promise((resolve,reject)=>{const r=indexedDB.open('trippin-editor',1);r.onupgradeneeded=()=>{r.result.createObjectStore('draft',{keyPath:'id'});r.result.createObjectStore('assets',{keyPath:'path'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(new Error('Thiết bị không cho phép lưu bản nháp.'))});return opened}
 async function transaction(store,mode,work){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(store,mode);let value;try{const req=work(tx.objectStore(store));if(req)req.onsuccess=()=>{value=req.result}}catch(e){reject(e);return}tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error||new Error('Không lưu được bản nháp.'));tx.onabort=()=>reject(tx.error||new Error('Thao tác lưu bị hủy.'))})}
 return {saveDraft:data=>transaction('draft','readwrite',s=>s.put({id:'current',data,updatedAt:new Date().toISOString()})),getDraft:()=>transaction('draft','readonly',s=>s.get('current')).then(v=>v?.data),putAsset:(path,blob)=>transaction('assets','readwrite',s=>s.put({path,blob})),assets:()=>transaction('assets','readonly',s=>s.getAll()),clear:async()=>{await transaction('draft','readwrite',s=>s.clear());await transaction('assets','readwrite',s=>s.clear())}};
})();
