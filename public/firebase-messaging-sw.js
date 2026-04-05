// Firebase Cloud Messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDzDH2XFaiZmbaHAowiY4aVMguMnWJnz7A",
  authDomain: "flowstate-notifications.firebaseapp.com",
  projectId: "flowstate-notifications",
  storageBucket: "flowstate-notifications.firebasestorage.app",
  messagingSenderId: "77441232552",
  appId: "1:77441232552:web:544d998ed2d6f59ed79c9d"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📬 Background message received:', payload);

  const notificationTitle = payload.notification.title || 'FlowState';
  const notificationOptions = {
    body: payload.notification.body || 'You have a notification',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    tag: 'flowstate-notification',
    data: payload.data || {},
    requireInteraction: true,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/tasks');
        }
      })
  );
});
