import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { supabase } from '../supabase';
import app, { getFirebaseMessaging } from '../firebase';

/**
 * Check if Firebase messaging is supported
 */
export async function isFirebaseSupported(): Promise<boolean> {
  try {
    const messaging = await getFirebaseMessaging();
    return messaging !== null;
  } catch {
    return false;
  }
}

/**
 * Subscribe user to Firebase notifications
 */
export async function subscribeToFirebaseNotifications(): Promise<boolean> {
  try {
    console.log('🔔 Firebase: Requesting notification permission...');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return false;
    }

    console.log('✅ Permission granted');

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.error('❌ Firebase messaging not supported');
      return false;
    }

    console.log('📤 Getting FCM token...');

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    if (!token) {
      console.error('❌ Failed to get FCM token');
      return false;
    }

    console.log('✅ FCM token obtained:', token.substring(0, 50) + '...');

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No user authenticated');
      return false;
    }

    console.log('👤 User authenticated:', user.id);

    // Save token to Supabase
    console.log('💾 Saving FCM token to Supabase...');

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          subscription: {
            token: token,
            type: 'firebase',
          },
        },
        {
          onConflict: 'user_id',
        }
      );

    if (error) {
      console.error('❌ Failed to save token:', error);
      return false;
    }

    console.log('✅ FCM token saved to Supabase');

    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      console.log('📬 Foreground message received:', payload);

      if (payload.notification) {
        new Notification(payload.notification.title || 'FlowState', {
          body: payload.notification.body,
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
        });
      }
    });

    return true;
  } catch (error) {
    console.error('❌ Firebase subscription error:', error);
    return false;
  }
}

/**
 * Initialize Firebase notifications on app startup
 */
export async function initFirebaseNotifications(): Promise<void> {
  const supported = await isFirebaseSupported();
  if (!supported) {
    console.warn('⚠️ Firebase messaging not supported');
    return;
  }

  try {
    console.log('🚀 Initializing Firebase notifications...');

    const success = await subscribeToFirebaseNotifications();
    if (success) {
      console.log('✅ Firebase notifications initialized');
    } else {
      console.warn('⚠️ Firebase initialization incomplete');
    }
  } catch (error) {
    console.error('❌ Firebase init error:', error);
  }
}

/**
 * Unsubscribe from Firebase notifications
 */
export async function unsubscribeFromFirebaseNotifications(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      console.log('✅ Unsubscribed from notifications');
    }
  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
  }
}
