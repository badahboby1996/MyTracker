'use strict';
// При качване на нов комплект файлове увеличи BUILD. Данните са отделно в localStorage.
const BUILD='2026-09-08-studio-3';
const ROOT=self.registration.scope;
const PREFIX='hustle-sep2026:'+new URL(ROOT).pathname+':';
const CACHE=PREFIX+BUILD;
const ASSETS=['index.html','app.js','plan.js','studio-glass.webp','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(path=>new Request(new URL(path,ROOT),{cache:'reload'})))));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==new URL(ROOT).origin||!url.href.startsWith(ROOT))return;
 const localPath=url.pathname.slice(new URL(ROOT).pathname.length);
 if(request.mode!=='navigate'&&!ASSETS.includes(localPath))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(request);
   if(response.ok){await cache.put(request,response.clone());return response;}
   const saved=await cache.match(request,{ignoreSearch:true});
   return saved||response;
  }catch(error){
   const saved=await cache.match(request,{ignoreSearch:true});
   if(saved)return saved;
   if(request.mode==='navigate'){
    const index=await cache.match(new URL('index.html',ROOT));
    if(index)return index;
   }
   return new Response('Няма интернет. Отвори приложението веднъж с връзка.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
 })());
});
