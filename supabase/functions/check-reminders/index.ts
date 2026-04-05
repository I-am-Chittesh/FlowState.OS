// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// @ts-ignore - Deno imports
import { create } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

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
    // Get Firebase credentials
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

    console.log("🔐 Firebase: Creating JWT...");

    // Process private key - unescape if needed
    let pemKey = privateKeyStr.trim();
    if (pemKey.includes("\\n")) {
      pemKey = pemKey.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
    }

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    console.log("🔑 Signing with djwt...");
    
    // Use djwt to sign - it handles PEM keys properly
    // @ts-ignore
    const jwt = await create(
      { alg: "RS256", typ: "JWT" },
      jwtPayload,
      pemKey
    );

    console.log("✅ JWT signed");
    console.log("📤 Getting Firebase token...");

    // Get access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      console.error("❌ Token error:", tokenData.error);
      return { success: false, error: tokenData.error || "No token" };
    }

    console.log("✅ Access token obtained");
    console.log("📤 Sending FCM message...");

    // Send notification
    const sendResponse = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
              fcmOptions: { link: "https://flowstate.vercel.app/tasks" },
            },
          },
        }),
      }
    );

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error(`❌ FCM error (${sendResponse.status}):`, errorText);
      return { success: false, error: errorText };
    }

    console.log("✅ Message sent successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error:", error);
    return { success: false, error: String(error) };
  }
}
