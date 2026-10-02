// Supabase Edge Function: create-razorpay-order
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

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
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, amount } = await req.json();

    if (!orderId || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing orderId or amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify order in database to ensure price integrity
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total_amount, order_number")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found in database" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Amount in paisa (INR subunit)
    const amountInPaisa = Math.round(Number(order.total_amount) * 100);

    // Call Razorpay Orders API
    const authHeader = "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaisa,
        currency: "INR",
        receipt: order.order_number,
        notes: {
          order_id: order.id,
        },
      }),
    });

    const rzpOrder = await rzpResponse.json();

    if (!rzpResponse.ok) {
      return new Response(
        JSON.stringify({ error: rzpOrder.error || "Failed to create Razorpay order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record initial payment entry
    await supabase.from("payments").insert({
      order_id: order.id,
      provider: "razorpay",
      transaction_id: rzpOrder.id,
      amount: order.total_amount,
      currency: "INR",
      status: "initiated",
      raw_response: rzpOrder,
    });

    return new Response(
      JSON.stringify({
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        orderId: order.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
