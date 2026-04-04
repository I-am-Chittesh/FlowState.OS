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
    // Create Supabase admin client (uses service role key)
    // @ts-ignore - Deno runtime API
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    // @ts-ignore - Deno runtime API
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    console.log("🔍 Checking for due reminders...");

    // Get all reminders that are due but not sent
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

    // For each due reminder, send notification
    if (dueReminders && dueReminders.length > 0) {
      for (const reminder of dueReminders) {
        try {
          // Get user's push subscription
          const { data: subscription, error: subError } = await supabaseAdmin
            .from("push_subscriptions")
            .select("subscription")
            .eq("user_id", reminder.user_id)
            .single();

          if (subError || !subscription) {
            console.log(`⚠️ No push subscription for user ${reminder.user_id}`);
            continue;
          }

          // Send push notification
          const pushSubscription = subscription.subscription;
          const payload = {
            title: "FlowState: Time to lock in",
            body: reminder.task_title || "Task reminder",
            badge: "/icon-192.svg",
            icon: "/icon-192.svg",
            tag: `reminder-${reminder.id}`,
            data: {
              reminderId: reminder.id,
              taskId: reminder.task_id,
            },
          };

          // Send to each subscription
          const sendResult = await sendWebPush(pushSubscription, payload);

          if (sendResult.success) {
            // Mark reminder as sent
            const { error: updateError } = await supabaseAdmin
              .from("reminders")
              .update({
                is_sent: true,
                notification_sent_at: new Date().toISOString(),
              })
              .eq("id", reminder.id);

            if (!updateError) {
              console.log(`✅ Sent notification for: ${reminder.task_title}`);
              sentCount++;
            } else {
              console.error(`❌ Failed to mark reminder as sent: ${updateError}`);
            }
          } else {
            console.error(
              `❌ Failed to send push notification: ${sendResult.error}`
            );
          }
        } catch (error) {
          console.error(`❌ Error processing reminder ${reminder.id}:`, error);
        }
      }
    }

    console.log(`🎉 Total notifications sent: ${sentCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked reminders. Sent ${sentCount} notifications.`,
        count: sentCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/**
 * Send Web Push notification
 */
async function sendWebPush(
  subscription: PushSubscription,
  payload: object
): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore - Deno runtime API
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
    // @ts-ignore - Deno runtime API
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";
    // @ts-ignore - Deno runtime API
    const vapidEmail = Deno.env.get("VAPID_EMAIL") || "";

    if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
      console.error("❌ VAPID keys not configured in Edge Function");
      return {
        success: false,
        error: "VAPID keys not configured",
      };
    }

    const payloadString = JSON.stringify(payload);

    // Note: For production deployment, you'll need to use a proper Web Push library.
    // This implementation provides a basic structure. Options include:
    // 1. Using npm:web-push from esm.sh (may have compatibility issues with Deno)
    // 2. Importing a Deno-native web-push library
    // 3. Making raw HTTP POST to subscription endpoint with VAPID headers

    // For now, we'll construct the request with VAPID authorization
    const headers = new Headers();
    headers.append("Content-Type", "application/octet-stream");
    headers.append("Content-Encoding", "aes128gcm");

    // Create a basic Authorization header with VAPID key
    // In production, this should be a proper JWT signed with the VAPID private key
    headers.append(
      "Authorization",
      `vapid t=${vapidPublicKey}, k=${vapidPublicKey}`
    );

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: headers,
      body: payloadString,
    });

    if (response.ok || response.status === 201) {
      console.log("✅ Push notification sent successfully");
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error(
        `❌ Failed to send push (${response.status}): ${errorText}`
      );
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
