const CACHE_NAME = 'easy-paint-pad-v9';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// install: 캐시 저장, skipWaiting 하지 않음 (waiting 상태 유지 → 배너 표시)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // skipWaiting() 제거: 기존 탭이 닫힌 뒤 또는 사용자가 업데이트 클릭 시 활성화
});

// activate: 구버전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch: 네트워크 우선 → 오프라인 시 캐시 폴백
// index.html / manifest.json은 항상 네트워크에서 최신 버전 시도
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  const isManifest = url.pathname.endsWith('manifest.json');

  if(isHTML || isManifest){
    // 네트워크 우선: 최신 파일 받기
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // 그 외: 캐시 우선 (이미지, 아이콘 등)
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});

// 업데이트 메시지 수신: 사용자가 "지금 업데이트" 클릭 시
self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
});
