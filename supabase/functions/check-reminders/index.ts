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
    console.log("📤 Calling API to send Firebase notification...");

    const apiUrl = "https://flowstate.vercel.app/api/send-notification";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceToken,
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        data: payload.data,
      }),
    });

    const responseData = await response.json() as { success?: boolean; error?: string; messageId?: string };
    
    if (!response.ok) {
      console.error(`❌ API error (${response.status}):`, responseData.error);
      return { success: false, error: responseData.error || "API request failed" };
    }

    if (responseData.success) {
      console.log("✅ Message sent successfully via API");
      return { success: true };
    } else {
      console.error("❌ API returned error:", responseData.error);
      return { success: false, error: responseData.error };
    }
  } catch (error) {
    console.error("❌ Error calling API:", error);
    return { success: false, error: String(error) };
  }
}
