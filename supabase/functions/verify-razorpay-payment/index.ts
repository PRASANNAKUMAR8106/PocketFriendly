// Supabase Edge Function: verify-razorpay-payment
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing required verification fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify HMAC SHA256 Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = hmac("sha256", razorpayKeySecret, body, "utf-8", "hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Record payment failure
      await supabase.from("payments").update({
        status: "failed",
        raw_response: { error: "Signature verification failed", received: razorpay_signature }
      }).eq("transaction_id", razorpay_order_id);

      return new Response(
        JSON.stringify({ verified: false, error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark payment as success
    await supabase.from("payments").update({
      status: "success",
      transaction_id: razorpay_payment_id,
      raw_response: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        verified_at: new Date().toISOString(),
      },
    }).eq("order_id", orderId);

    // Update order status to confirmed and payment_status to paid
    await supabase.from("orders").update({
      order_status: "confirmed",
      payment_status: "paid",
      payment_id: razorpay_payment_id,
      payment_signature: razorpay_signature,
    }).eq("id", orderId);

    return new Response(
      JSON.stringify({ verified: true, orderId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
