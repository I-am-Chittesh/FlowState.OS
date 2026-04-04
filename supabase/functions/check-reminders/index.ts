// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// @ts-ignore - Deno imports
import { create, verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
// @ts-ignore - Deno imports
import { base64url } from "https://deno.land/x/base64url@v2.0.1/mod.ts";

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

          const sendResult = await sendWebPush(pushSubscription, payload);

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

async function sendWebPush(
  subscription: PushSubscription,
  payload: object
): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore
    const privateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";
    // @ts-ignore
    const email = Deno.env.get("VAPID_EMAIL") || "";

    if (!privateKey || !email) {
      console.error("VAPID keys missing");
      return { success: false, error: "Missing keys" };
    }

    // Create JWT header and payload for VAPID
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      aud: subscription.endpoint,
      exp: now + 3600,
      sub: email,
    };

    console.log("📤 Sending push...");

    const payloadString = JSON.stringify(payload);
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "TTL": "86400",
        "Urgency": "high",
        "Authorization": `vapid t=${privateKey}, k=${privateKey}, e="${email}"`,
      },
      body: payloadString,
    });

    if (response.ok || response.status === 201) {
      console.log("✅ Sent successfully");
      return { success: true };
    } else {
      const text = await response.text().catch(() => "error");
      console.error(`Failed (${response.status}): ${text}`);
      return { success: false, error: `${response.status}` };
    }
  } catch (error) {
    console.error("Push error:", error);
    return { success: false, error: String(error) };
  }
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
