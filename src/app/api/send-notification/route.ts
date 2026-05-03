import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Parse and fix private key format
function getPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;

  // Handle different formatting scenarios
  let processed = key
    .replace(/\\n/g, '\n')  // Replace escaped newlines
    .replace(/\\r/g, '\r')  // Replace escaped carriage returns
    .trim();                // Remove extra whitespace

  // Ensure it has proper PEM format
  if (!processed.startsWith('-----BEGIN')) {
    processed = `-----BEGIN PRIVATE KEY-----\n${processed}\n-----END PRIVATE KEY-----`;
  }

  return processed;
}

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: getPrivateKey(),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

// Initialize Firebase Admin only once
let initialized = false;
if (!admin.apps.length) {
  try {
    if (!serviceAccount.private_key) {
      throw new Error('FIREBASE_PRIVATE_KEY is not set in environment variables');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    initialized = true;
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    console.error('📋 Private key status:', serviceAccount.private_key ? 'present' : 'missing');
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!initialized || !admin.apps.length) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const requestBody = await request.json();
    const { deviceToken, title, body: notificationBody, data } = requestBody;

    if (!deviceToken || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceToken, title, body' },
        { status: 400 }
      );
    }

    console.log(`📤 Sending notification to ${deviceToken.substring(0, 50)}...`);

    const message = {
      notification: {
        title,
        body: notificationBody,
      },
      webpush: {
        fcmOptions: {
          link: 'https://flowstate.vercel.app/tasks',
        },
        notification: {
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
        },
      },
      data: data || {},
      token: deviceToken,
    };

    const response = await admin.messaging().send(message as admin.messaging.Message);

    console.log('✅ Notification sent:', response);

    return NextResponse.json(
      { success: true, messageId: response },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
