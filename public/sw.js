const CACHE_NAME = 'flowstate-v1';

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker activating...');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // For now, just pass through all requests
  // This allows the app to work offline in the future
});

// Store reminders in IndexedDB for persistence
const DB_NAME = 'FlowStateDB';
const STORE_NAME = 'reminders';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// Helper function to get all reminders from IndexedDB
async function getAllReminders() {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    } catch (error) {
      reject(error);
    }
  });
}

// Listen for reminders from the client
self.addEventListener('message', async (event) => {
  const { type, reminder } = event.data;
  
  console.log('📨 Service worker received message:', type, reminder);
  
  if (type === 'REGISTER_REMINDER') {
    console.log('📌 Registering reminder:', reminder);
    
    try {
      const db = await openDB();
      console.log('📂 Database opened');
      
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      console.log('💾 Storing reminder in IndexedDB');
      
      // Wrap the put operation in a promise
      await new Promise((resolve, reject) => {
        const request = store.put(reminder);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
      
      console.log('✅ Reminder stored successfully');
      
      // Schedule the notification
      scheduleReminder(reminder);
    } catch (error) {
      console.error('❌ Failed to register reminder:', error);
    }
  } else if (type === 'GET_REMINDERS') {
    console.log('🔍 Getting all reminders');
    try {
      const reminders = await getAllReminders();
      
      console.log('✅ Found reminders:', reminders);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ reminders });
      }
    } catch (error) {
      console.error('❌ Failed to get reminders:', error);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ reminders: [] });
      }
    }
  }
});

function scheduleReminder(reminder) {
  const reminderTime = new Date(reminder.reminder_time).getTime();
  const now = new Date().getTime();
  const delay = reminderTime - now;
  
  console.log('⏰ Scheduling reminder:', {
    task: reminder.task_title,
    reminderTime: new Date(reminder.reminder_time).toLocaleString(),
    now: new Date(now).toLocaleString(),
    delayMs: delay,
    delayMin: Math.round(delay / 60000)
  });
  
  // On mobile: don't use setTimeout (dies when app closes)
  // Instead rely on periodic checks and background sync
  
  if (delay <= 0 && delay > -2000) {
    // Fire immediately if within 2 seconds of reminder time
    console.log('⚡ Firing reminder immediately (close to reminder time)');
    fireNotification(reminder);
  } else if (delay > 0) {
    // For future reminders on mobile: register for background sync
    console.log(`📲 Registering background sync for reminder (fires in ${Math.round(delay / 1000)} seconds)`);
    
    // Try to register periodic background sync (Android/iOS)
    if ('sync' in self.registration) {
      self.registration.sync.register(`reminder-${reminder.id}`).catch(err => {
        console.log('ℹ️ Background Sync not available, relying on periodic checks');
      });
    }
  } else {
    console.log('⏭️ Reminder skipped (more than 1 minute past)');
  }
}

function fireNotification(reminder) {
  console.log('📱 Firing notification for:', reminder.task_title);
  
  const taskTitle = reminder.task_title || 'Task Reminder';
  const notificationTitle = 'FlowState: Time to lock in.';
  const notificationOptions = {
    body: taskTitle,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `reminder-${reminder.id}`,
    requireInteraction: false,
    data: {
      reminderId: reminder.id,
      taskId: reminder.task_id,
      timestamp: new Date().toISOString()
    }
  };
  
  try {
    self.registration.showNotification(notificationTitle, notificationOptions);
    console.log('✅ Notification shown successfully');
  } catch (error) {
    console.error('❌ Failed to show notification:', error);
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url === '/' && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      // If not open, open it
      if (clients.openWindow) {
        return clients.openWindow('/tasks');
      }
    })
  );
});

// Periodically check for reminders that need to be fired
setInterval(async () => {
  try {
    console.log('🔄 Checking for pending reminders...');
    
    const reminders = await getAllReminders();
    
    console.log(`📋 Found ${reminders.length} total reminders`);
    
    const now = new Date().getTime();
    let firedCount = 0;
    
    reminders.forEach((reminder) => {
      const reminderTime = new Date(reminder.reminder_time).getTime();
      const timeDiff = reminderTime - now;
      
      // Fire if at the reminder time (within 2 seconds) and not yet sent
      if (reminderTime <= now && reminderTime > now - 2000 && !reminder.is_sent) {
        console.log(`🔔 Firing overdue reminder: ${reminder.task_title}`);
        fireNotification(reminder);
        firedCount++;
        
        // Mark as sent
        reminder.is_sent = true;
        
        openDB().then((db) => {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          store.put(reminder);
        }).catch(error => console.error('❌ Failed to mark reminder as sent:', error));
      }
    });
    
    if (firedCount > 0) {
      console.log(`✅ Fired ${firedCount} reminders`);
    }
  } catch (error) {
    console.error('❌ Error checking reminders:', error);
  }
}, 60000); // Check every minute

// Handle background sync for mobile - fires when browser wakes up service worker
self.addEventListener('sync', (event) => {
  console.log('🔔 Background sync event:', event.tag);
  
  if (event.tag && event.tag.startsWith('reminder-')) {
    event.waitUntil(
      (async () => {
        try {
          const reminders = await getAllReminders();
          const now = new Date().getTime();
          let firedAny = false;
          
          reminders.forEach((reminder) => {
            const reminderTime = new Date(reminder.reminder_time).getTime();
            
            // Fire if it's time and not already sent
            if (reminderTime <= now && !reminder.is_sent) {
              console.log(`🔔 Background sync firing: ${reminder.task_title}`);
              fireNotification(reminder);
              reminder.is_sent = true;
              firedAny = true;
              
              // Update in IndexedDB
              openDB().then((db) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.put(reminder);
              });
            }
          });
          
          if (!firedAny) {
            console.log('ℹ️ No reminders ready yet, retrying in next sync');
            // Retry sync to ensure it fires
            return self.registration.sync.register(event.tag);
          }
        } catch (error) {
          console.error('❌ Background sync error:', error);
          throw error;
        }
      })()
    );
  }
});

// Handle periodic background sync (runs periodically even when app is closed)
// This is the key for Android/iOS notification support
self.addEventListener('periodicsync', (event) => {
  console.log('⏱️ Periodic sync event:', event.tag);
  
  if (event.tag === 'reminder-check') {
    event.waitUntil(
      (async () => {
        try {
          console.log('🔍 Periodic sync checking for pending reminders...');
          const reminders = await getAllReminders();
          const now = new Date().getTime();
          let firedCount = 0;
          
          reminders.forEach((reminder) => {
            const reminderTime = new Date(reminder.reminder_time).getTime();
            
            // Fire if within 1 minute window and not already sent
            if (reminderTime <= now && reminderTime > now - 2000 && !reminder.is_sent) {
              console.log(`🔔 Periodic sync firing: ${reminder.task_title}`);
              fireNotification(reminder);
              firedCount++;
              reminder.is_sent = true;
              
              // Update in IndexedDB
              openDB().then((db) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.put(reminder);
              });
            }
          });
          
          if (firedCount > 0) {
            console.log(`✅ Periodic sync fired ${firedCount} reminders`);
          } else {
            console.log('ℹ️ No reminders due in this periodic check');
          }
        } catch (error) {
          console.error('❌ Periodic sync error:', error);
          throw error;
        }
      })()
    );
  }
});
