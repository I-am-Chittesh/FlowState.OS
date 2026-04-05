// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    // @ts-ignore
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    console.log("🔍 Checking for due reminders...");

    const { data: dueReminders, error: reminderError } = await supabaseAdmin
      .from("reminders")
      .select("id, user_id, task_id, task_title, reminder_time, is_sent")
      .eq("is_sent", false)
      .lte("reminder_time", new Date().toISOString());

    if (reminderError) {
      throw reminderError;
    }

    console.log(`Found ${dueReminders?.length || 0} due reminders`);

    let sentCount = 0;

    if (dueReminders && dueReminders.length > 0) {
      for (const reminder of dueReminders) {
        try {
          const { data: subscription, error: subError } = await supabaseAdmin
            .from("push_subscriptions")
            .select("subscription")
            .eq("user_id", reminder.user_id)
            .single();

          if (subError || !subscription) {
            console.log(`⚠️ No subscription for user ${reminder.user_id}`);
            continue;
          }

          // Extract Firebase token from subscription
          const firebaseToken = subscription.subscription?.token;
          if (!firebaseToken) {
            console.log(`⚠️ No Firebase token for user ${reminder.user_id}`);
            continue;
          }

          const payload = {
            title: "FlowState: Time to lock in",
            body: reminder.task_title || "Task reminder",
            badge: "/icon-192.svg",
            icon: "/icon-192.svg",
            tag: `reminder-${reminder.id}`,
            data: {
              reminderId: reminder.id,
              taskId: reminder.task_id,
              taskTitle: reminder.task_title,
            },
          };

          const sendResult = await sendFirebaseMessage(firebaseToken, payload);

          if (sendResult.success) {
            const { error: updateError } = await supabaseAdmin
              .from("reminders")
              .update({
                is_sent: true,
                notification_sent_at: new Date().toISOString(),
              })
              .eq("id", reminder.id);

            if (!updateError) {
              console.log(`✅ Sent: ${reminder.task_title}`);
              sentCount++;
            }
          }
        } catch (error) {
          console.error(`Error with reminder ${reminder.id}:`, error);
        }
      }
    }

    console.log(`✅ Total sent: ${sentCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${sentCount} notifications`,
        count: sentCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});

async function sendFirebaseMessage(
  deviceToken: string,
  payload: {
    title: string;
    body: string;
    badge: string;
    icon: string;
    tag: string;
    data: object;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get Firebase credentials from environment
    // @ts-ignore
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID") || "";
    // @ts-ignore
    const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL") || "";
    // @ts-ignore
    const privateKeyStr = Deno.env.get("FIREBASE_PRIVATE_KEY") || "";

    if (!projectId || !clientEmail || !privateKeyStr) {
      console.error("❌ Firebase credentials missing");
      return { success: false, error: "Missing Firebase credentials" };
    }

    console.log("🔐 Firebase: Creating JWT for service account...");

    // Create JWT for service account
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600;

    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const jwtPayload = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + expiresIn,
      iat: now,
    };

    // Utility to base64url encode
    const base64urlEncode = (obj: object | string): string => {
      const str = typeof obj === "string" ? obj : JSON.stringify(obj);
      const bytes = new TextEncoder().encode(str);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    };

    const headerEncoded = base64urlEncode(header);
    const payloadEncoded = base64urlEncode(jwtPayload);
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    console.log("🔑 Signing JWT with private key...");

    // Parse private key - handle both raw and escaped formats
    let pemKey = privateKeyStr.trim();
    if (!pemKey.includes("-----BEGIN")) {
      // If it's escaped, unescape it
      pemKey = pemKey
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r");
    }

    // @ts-ignore - Deno crypto import
    const keyData = await crypto.subtle.importKey(
      "pkcs8",
      new TextEncoder().encode(pemKey),
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );

    // @ts-ignore - Deno crypto import
    const signedArray = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      keyData,
      new TextEncoder().encode(signatureInput)
    );

    const signedBytes = new Uint8Array(signedArray);
    let binary = "";
    for (let i = 0; i < signedBytes.byteLength; i++) {
      binary += String.fromCharCode(signedBytes[i]);
    }
    const signatureEncoded = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const jwt = `${signatureInput}.${signatureEncoded}`;

    console.log("📤 Getting Firebase access token...");

    // Get access token from Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };

    if (!tokenData.access_token) {
      console.error("❌ Failed to get Firebase access token:", tokenData.error);
      return { success: false, error: tokenData.error || "Failed to get access token" };
    }

    console.log("✅ Firebase access token obtained");

    // Build FCM message
    const message = {
      message: {
        token: deviceToken,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon,
          badge: payload.badge,
        },
        data: payload.data,
        webpush: {
          fcmOptions: {
            link: `https://flowstate.vercel.app/tasks`,
          },
        },
      },
    };

    console.log("📤 Sending message to Firebase Cloud Messaging...");

    // Send notification via Firebase
    const sendResponse = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error(`❌ Firebase API error (${sendResponse.status}):`, errorText);
      return { success: false, error: errorText };
    }

    const sendData = await sendResponse.json();
    console.log("✅ Firebase message sent successfully:", sendData);

    return { success: true };
  } catch (error) {
    console.error("❌ Firebase error:", error);
    return { success: false, error: String(error) };
  }
}
