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
    console.warn('Notifications are not supported in this browser');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'REGISTER_REMINDER',
        reminder: {
          ...reminder,
          reminder_time: new Date(reminder.reminder_time).toISOString()
        }
      });
    }
    
    console.log('Reminder registered with service worker:', reminder);
  } catch (error) {
    console.error('Failed to register reminder with service worker:', error);
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
    console.warn('Notifications are not supported');
    return;
  }

  try {
    // Request permission proactively
    await requestNotificationPermission();
    
    // Register service worker if not already registered
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    }
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
}
