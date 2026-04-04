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
  
  console.log('📨 Service worker received message:', type);
  console.log('   Full reminder object:', reminder);
  
  if (type === 'REGISTER_REMINDER') {
    console.log('📌 REGISTER_REMINDER - Full Debug:');
    console.log('   reminder.reminder_time (string):', reminder.reminder_time);
    const parsedDate = new Date(reminder.reminder_time);
    const now = new Date();
    const delayMs = parsedDate.getTime() - now.getTime();
    console.log('   Parsed date:', parsedDate.toString());
    console.log('   Current server time:', now.toString());
    console.log('   Delay:', Math.round(delayMs / 1000), 'seconds');
    console.log('   Will fire:', delayMs <= 0 ? 'YES (IMMEDIATELY!)' : 'NO (future)');
    
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
  
  console.log('⏰ scheduleReminder - CRITICAL CHECK:');
  console.log('   Reminder time:', new Date(reminderTime).toString());
  console.log('   Current time:', new Date(now).toString());
  console.log('   Delay (ms):', delay);
  console.log('   Delay (seconds):', Math.round(delay / 1000));
  console.log('   Reminder is in the FUTURE:', delay > 0 ? 'YES' : 'NO');
  console.log('   Will fire now:', delay < 0 ? 'YES' : 'NO');
  
  // ABSOLUTELY DO NOT fire future reminders
  if (delay > 0) {
    console.log(`📲 FUTURE REMINDER: Will NOT fire. Waiting ${Math.round(delay / 1000)} seconds`);
    // Future reminder - only periodic checks will fire it
    return;
  }
  
  if (delay < 0 && delay > -60000) {
    // Very recent past - could be a clock skew situation
    console.log(`⚠️ RECENT PAST: Reminder is ${Math.round(Math.abs(delay) / 1000)} seconds ago`);
    console.log('   NOT firing on registration to avoid duplicates');
    return;
  }
  
  console.log('⏭️ Reminder is way too old, skipping');
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
// On Android, this runs every 60 seconds (or when system wakes service worker)
setInterval(async () => {
  try {
    const now = new Date().getTime();
    console.log('🔄 PERIODIC CHECK (60s interval) - ' + new Date(now).toLocaleString());
    
    const reminders = await getAllReminders();
    console.log(`📋 Found ${reminders.length} total reminders`);
    
    let firedCount = 0;
    
    reminders.forEach((reminder, index) => {
      const reminderTime = new Date(reminder.reminder_time).getTime();
      const timeDiff = reminderTime - now;
      
      console.log(`\n   [${index}] "${reminder.task_title}"`);
      console.log(`       Scheduled: ${new Date(reminderTime).toLocaleString()}`);
      console.log(`       Time until: ${Math.round(timeDiff / 1000)}s (${Math.round(timeDiff / 60000)}m)`);
      console.log(`       Is sent: ${reminder.is_sent}`);
      
      // Only fire if reminder time has PASSED and not yet sent
      // Grace window: 0 to 30 seconds AFTER the scheduled time
      const timeHasPassed = timeDiff <= 0;
      const withinGraceWindow = timeDiff > -30000;
      const shouldFire = timeHasPassed && withinGraceWindow && !reminder.is_sent;
      
      console.log(`       Should fire: ${shouldFire ? '✅ YES' : '❌ NO'}`);
      
      if (shouldFire) {
        console.log(`       🔔 FIRING NOTIFICATION NOW`);
        fireNotification(reminder);
        firedCount++;
        
        // Mark as sent
        reminder.is_sent = true;
        
        openDB().then((db) => {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          store.put(reminder);
        }).catch(error => console.error('❌ Failed to update sent status:', error));
      }
    });
    
    if (firedCount > 0) {
      console.log(`\n✅ Fired ${firedCount} reminders this check`);
    } else {
      console.log(`\n✅ No reminders ready to fire`);
    }
  } catch (error) {
    console.error('❌ Error checking reminders:', error);
  }
}, 60000); // Check every 60 seconds

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
            // Only fire if PAST the reminder time (now > reminderTime)
            // Use > instead of >= to be extra safe
            if (reminderTime < now && !reminder.is_sent) {
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
            
            // Only fire if reminder time has PASSED (now >= reminderTime)
            // Use < instead of <= to be extra safe
            if (reminderTime < now && !reminder.is_sent) {
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
