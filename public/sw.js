// Service Worker - Disabled
// This file exists to prevent 404 errors from browser PWA detection
// No actual service worker functionality is implemented

self.addEventListener('install', (event) => {
  // Skip waiting, don't activate service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Skip activation
  event.waitUntil(clients.claim());
});
