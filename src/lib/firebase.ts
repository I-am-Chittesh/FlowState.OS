import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDzDH2XFaiZmbaHAowiY4aVMguMnWJnz7A",
  authDomain: "flowstate-notifications.firebaseapp.com",
  projectId: "flowstate-notifications",
  storageBucket: "flowstate-notifications.firebasestorage.app",
  messagingSenderId: "77441232552",
  appId: "1:77441232552:web:544d998ed2d6f59ed79c9d",
  measurementId: "G-D7K3DHYL79"
};

const app = initializeApp(firebaseConfig);

let messaging: any = null;

export const getFirebaseMessaging = async () => {
  if (messaging) {
    return messaging;
  }

  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase messaging not supported on this device');
    return null;
  }

  messaging = getMessaging(app);
  return messaging;
};

export default app;
