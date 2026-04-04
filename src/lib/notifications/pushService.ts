import { supabase } from '../supabase';

/**
 * Check if Web Push API is supported
 */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Subscribe user to push notifications
 */
export async function subscribeToNotifications(): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('⚠️ Push notifications not supported on this device');
    return false;
  }

  try {
    console.log('🔔 Requesting notification permission...');

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return false;
    }

    console.log('✅ Permission granted');

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service worker ready');

    // Subscribe to push
    console.log('📤 Subscribing to push notifications...');
    
    // Get VAPID public key from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('❌ VAPID public key not found');
      return false;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    console.log('✅ Subscription created:', subscription.endpoint);

    // Save subscription to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No user authenticated');
      return false;
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        subscription: subscription.toJSON(),
      });

    if (error) {
      console.error('❌ Failed to save subscription to Supabase:', error);
      return false;
    }

    console.log('✅ Subscription saved to Supabase');
    return true;
  } catch (error) {
    console.error('❌ Failed to subscribe to push notifications:', error);
    return false;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromNotifications(): Promise<boolean> {
  try {
    console.log('❌ Unsubscribing from push notifications...');

    // Get registration
    const registration = await navigator.serviceWorker.ready;

    // Get subscription
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      console.warn('⚠️ No subscription found');
      return true;
    }

    // Unsubscribe
    const success = await subscription.unsubscribe();
    if (!success) {
      console.error('❌ Failed to unsubscribe');
      return false;
    }

    console.log('✅ Unsubscribed from push manager');

    // Remove from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      console.log('✅ Removed subscription from Supabase');
    }

    return true;
  } catch (error) {
    console.error('❌ Error unsubscribing:', error);
    return false;
  }
}

/**
 * Check if user is already subscribed
 */
export async function isSubscribed(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('❌ Error checking subscription:', error);
    return false;
  }
}

/**
 * Initialize push notifications on app startup
 */
export async function initPushNotifications(): Promise<void> {
  if (!isPushSupported()) {
    console.warn('⚠️ Push notifications not supported');
    return;
  }

  try {
    console.log('🚀 Initializing push notifications...');

    // Check if already subscribed
    const alreadySubscribed = await isSubscribed();
    if (alreadySubscribed) {
      console.log('✅ Already subscribed to push notifications');
      return;
    }

    // Subscribe
    const success = await subscribeToNotifications();
    if (success) {
      console.log('✅ Push notifications initialized successfully');
    } else {
      console.warn('⚠️ Failed to initialize push notifications');
    }
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
  }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
