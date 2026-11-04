import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, createStripeClient, verifyWebhook } from "@/lib/stripe.server";
import { installmentCancelAt, statusForSubscription } from "@/lib/tournament-payments";

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

async function setStatus(registrationId: string | undefined, status: string) {
  if (!registrationId) return;
  const db = await admin();
  await db.from("tournament_registrations").update({ payment_status: status }).eq("id", registrationId);
}

async function handle(event: { type: string; data: { object: any } }, env: StripeEnv) {
  const obj = event.data.object;
  const db = await admin();
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const regId = obj.metadata?.registrationId;
      const userId = obj.metadata?.userId;
      if (!regId || !userId) return;
      const settled = obj.payment_status !== "unpaid";
      const status = !settled ? "pending" : obj.mode === "subscription" ? "installments_active" : "paid";
      await db.from("tournament_payments").upsert({
        registration_id: regId, user_id: userId, price_id: obj.metadata?.priceId ?? "",
        stripe_session_id: obj.id, stripe_subscription_id: obj.subscription ?? null,
        amount_cents: obj.amount_total ?? null, status, environment: env, updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_session_id" });
      if (settled && obj.metadata?.upgradeTo === "franchise") {
        await db.from("tournament_registrations").update({ pricing_option: "franchise" }).eq("id", regId);
      }
      if (settled && obj.metadata?.payoffSubscription) {
        // Balance paid off: end the weekly plan without marking it as a failure.
        const stripe = createStripeClient(env);
        await stripe.subscriptions.update(obj.metadata.payoffSubscription, { metadata: { payoff: "1" } });
        await stripe.subscriptions.cancel(obj.metadata.payoffSubscription);
      }
      await setStatus(regId, status);
      break;
    }
    case "checkout.session.async_payment_failed":
      await setStatus(obj.metadata?.registrationId, "failed");
      break;
    case "customer.subscription.created":
      // Limit installment plans to exactly 8 weekly charges.
      if (!obj.cancel_at) {
        await createStripeClient(env).subscriptions.update(obj.id, { cancel_at: installmentCancelAt(obj.start_date ?? obj.created) });
      }
      break;
    case "customer.subscription.updated":
    {
      if (obj.metadata?.payoff === "1") break;
      const next = statusForSubscription(obj.status);
      if (next) await setStatus(obj.metadata?.registrationId, next);
      break;
    }
    case "customer.subscription.deleted": {
      if (obj.metadata?.payoff === "1") break;
      const completed = obj.cancel_at && obj.ended_at && obj.ended_at >= obj.cancel_at - 3600;
      await setStatus(obj.metadata?.registrationId, completed ? "installments_complete" : "failed");
      break;
    }
    default:
      break;
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") return Response.json({ received: true, ignored: "invalid env" });
        try {
          const event = await verifyWebhook(request, rawEnv);
          await handle(event, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
