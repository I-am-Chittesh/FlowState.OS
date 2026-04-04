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
      await store.put(reminder);
      
      console.log('✅ Reminder stored successfully');
      
      // Schedule the notification
      scheduleReminder(reminder);
    } catch (error) {
      console.error('❌ Failed to register reminder:', error);
    }
  } else if (type === 'GET_REMINDERS') {
    console.log('🔍 Getting all reminders');
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const reminders = await store.getAll();
      
      console.log('✅ Found reminders:', reminders);
      event.ports[0].postMessage({ reminders });
    } catch (error) {
      console.error('❌ Failed to get reminders:', error);
      event.ports[0].postMessage({ reminders: [] });
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
  
  if (delay > 0) {
    console.log(`⏳ Reminder will fire in ${Math.round(delay / 1000)} seconds`);
    setTimeout(() => {
      console.log('🔔 Firing notification now');
      fireNotification(reminder);
    }, delay);
  } else if (delay > -60000) {
    // If reminder is less than 1 minute in the past, fire it immediately
    console.log('⚡ Firing reminder immediately (less than 1 minute past)');
    fireNotification(reminder);
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
    
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const reminders = await store.getAll();
    
    console.log(`📋 Found ${reminders.length} total reminders`);
    
    const now = new Date().getTime();
    let firedCount = 0;
    
    reminders.forEach((reminder) => {
      const reminderTime = new Date(reminder.reminder_time).getTime();
      const timeDiff = reminderTime - now;
      
      // Fire if within 1 minute window and not yet sent
      if (reminderTime <= now && reminderTime > now - 60000 && !reminder.is_sent) {
        console.log(`🔔 Firing overdue reminder: ${reminder.task_title}`);
        fireNotification(reminder);
        firedCount++;
        
        // Mark as sent
        reminder.is_sent = true;
        const updateTransaction = db.transaction(STORE_NAME, 'readwrite');
        updateTransaction.objectStore(STORE_NAME).put(reminder);
      }
    });
    
    if (firedCount > 0) {
      console.log(`✅ Fired ${firedCount} reminders`);
    }
  } catch (error) {
    console.error('❌ Error checking reminders:', error);
  }
}, 60000); // Check every minute

