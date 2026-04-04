// Utility functions for managing notifications and reminders with the service worker

export interface ReminderData {
  id: string;
  task_id: string;
  task_title: string;
  reminder_time: string;
  is_sent: boolean;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Check if service worker is available and notifications are supported
 */
export function isNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'MessageChannel' in window
  );
}

/**
 * Register a reminder with the service worker
 */
export async function registerReminder(reminder: ReminderData): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('⚠️ Notifications are not supported in this browser');
    return;
  }

  try {
    console.log('🔄 Waiting for service worker...');
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service worker ready');
    
    if (navigator.serviceWorker.controller) {
      console.log('📤 Posting REGISTER_REMINDER to service worker:', reminder);
      navigator.serviceWorker.controller.postMessage({
        type: 'REGISTER_REMINDER',
        reminder: {
          ...reminder,
          reminder_time: new Date(reminder.reminder_time).toISOString()
        }
      });
      console.log('✅ Message posted to service worker');
    } else {
      console.warn('⚠️ No service worker controller active');
    }
    
    console.log('✅ Reminder registered with service worker:', reminder);
  } catch (error) {
    console.error('❌ Failed to register reminder with service worker:', error);
    throw error;
  }
}

/**
 * Get all reminders from the service worker
 */
export async function getRemindersFromWorker(): Promise<ReminderData[]> {
  if (!isNotificationSupported()) {
    return [];
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(
          {
            type: 'GET_REMINDERS'
          },
          [channel.port2]
        );
      }
      
      channel.port1.onmessage = (event) => {
        resolve(event.data.reminders || []);
      };
    });
  } catch (error) {
    console.error('Failed to get reminders from service worker:', error);
    return [];
  }
}

/**
 * Show an inactivity notification
 */
export async function showInactivityNotification(daysSinceOpened: number): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported');
    return;
  }

  try {
    const permission = await requestNotificationPermission();
    if (!permission) {
      console.warn('Notification permission denied');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    
    registration.showNotification('FlowState: Get Back on Track', {
      body: `You've been away for ${daysSinceOpened} days. Open the app and complete one Pomodoro session to restart your momentum.`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'inactivity-notification',
      requireInteraction: false,
      data: {
        type: 'inactivity',
        daysSinceOpened
      }
    });
  } catch (error) {
    console.error('Failed to show inactivity notification:', error);
  }
}

/**
 * Initialize service worker for notifications (call on app startup)
 */
export async function initializeNotifications(): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('⚠️ Notifications are not supported');
    return;
  }

  try {
    console.log('🚀 Initializing notifications...');
    
    // Request permission proactively
    const hasPermission = await requestNotificationPermission();
    console.log('✅ Notification permission:', hasPermission ? 'GRANTED' : 'DENIED');
    
    // Register service worker if not already registered
    if ('serviceWorker' in navigator) {
      console.log('📝 Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration.scope);
      
      // Register periodic background sync for mobile
      // This ensures reminders fire even when app is closed
      if ('periodicSync' in registration) {
        try {
          await (registration as any).periodicSync.register('reminder-check', {
            minInterval: 1 * 60 * 1000 // Check every 1 minute (minimum for most browsers)
          });
          console.log('✅ Periodic background sync registered (mobile support)');
        } catch (error) {
          console.log('ℹ️ Periodic sync not available (may not be supported on this device)');
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize notifications:', error);
  }
}

/**
 * Debug function to test if reminders are saved in IndexedDB
 */
export async function debugVerifyReminders(): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('❌ Notifications not supported');
    return;
  }

  try {
    console.log('\n🧪 TESTING REMINDERS...');
    console.log('📡 Calling getRemindersFromWorker()');
    
    const reminders = await getRemindersFromWorker();
    
    console.log(`✅ getRemindersFromWorker returned ${reminders.length} reminders:`, reminders);
    
    if (reminders.length === 0) {
      console.warn('⚠️ No reminders found in service worker IndexedDB');
    } else {
      console.log('✅ Reminders are stored in service worker!');
      reminders.forEach((r, i) => {
        console.log(`  [${i}] Task: ${r.task_title}, Time: ${new Date(r.reminder_time).toLocaleString()}`);
      });
    }
  } catch (error) {
    console.error('❌ Error verifying reminders:', error);
  }
}

/**
 * Manual test - show a notification immediately
 */
export async function testNotification(): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('❌ Notifications not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    registration.showNotification('🧪 FlowState Test Notification', {
      body: 'If you see this, notifications are working!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification',
      requireInteraction: false
    });
    
    console.log('✅ Test notification sent!');
  } catch (error) {
    console.error('❌ Failed to send test notification:', error);
  }
}
