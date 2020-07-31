/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/scripts/install.js',
  '/scripts/luxon-1.11.4.js',
  '/styles/inline.css',
  '/images/add.svg',
  '/images/clear-day.svg',
  '/images/clear-night.svg',
  '/images/cloudy.svg',
  '/images/fog.svg',
  '/images/hail.svg',
  '/images/install.svg',
  '/images/partly-cloudy-day.svg',
  '/images/partly-cloudy-night.svg',
  '/images/rain.svg',
  '/images/refresh.svg',
  '/images/sleet.svg',
  '/images/snow.svg',
  '/images/thunderstorm.svg',
  '/images/tornado.svg',
  '/images/wind.svg',
];

async function precache() {
  console.log('[ServiceWorker] Pre-caching offline page');
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(FILES_TO_CACHE);
}

self.addEventListener('install', async (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(precache());
  self.skipWaiting();
});

function deleteOlderCache(key) {
  const cacheList = [ CACHE_NAME, DATA_CACHE_NAME ];
  if (!cacheList.includes(key)) {
    console.log('[ServiceWorker] Removing old cache', key);
    return caches.delete(key);
  }
}

async function cleanup() {
  const keyList = await caches.keys();
  return Promise.all(keyList.map(deleteOlderCache))
}

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(cleanup());
  self.clients.claim();
});

async function fetchFromNetworkFirst(request) {
  const cache = await caches.open(DATA_CACHE_NAME);
  try {
    const response = await fetch(request);
    response.status === 200 && cache.put(request.url, response.clone());
    return response;
  } catch (_) {
    return cache.match(request);
  }
}

self.addEventListener('fetch', async (event) => {
  if (event.request.url.includes('/forecast/')) {
    event.respondWith(fetchFromNetworkFirst(event.request));
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.match(event.request)
          .then((response) => {
            return response || fetch(event.request);
          })
      })
      .catch(error => console.log('OMG!', error), null)
  );
});
