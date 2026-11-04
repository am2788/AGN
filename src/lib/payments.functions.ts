import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient, getStripeErrorMessage } from "./stripe.server";
import { availableUpgrade, canStartPayment, entryPriceId, INSTALLMENT_COUNT, payoffCents } from "./tournament-payments";

type Result = { clientSecret: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string | undefined; userId?: string | undefined },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  if (options.userId) {
    const found = await stripe.customers.search({ query: `metadata['userId']:'${options.userId}'`, limit: 1 });
    const hit = found.data[0]; if (hit) return hit.id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    const customer = existing.data[0];
    if (customer) {
      if (options.userId && customer.metadata?.['userId'] !== options.userId) {
        await stripe.customers.update(customer.id, { metadata: { ...customer.metadata, userId: options.userId } });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

export const createEntryCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    registrationId: z.string().uuid(),
    plan: z.enum(["full", "installment", "payoff"]),
    returnUrl: z.string().url().max(500),
    environment: z.enum(["sandbox", "live"]),
  }).parse(d))
  .handler(async ({ data, context }): Promise<Result> => {
    const { data: reg, error } = await context.supabase.from("tournament_registrations")
      .select("id,lane,pricing_option,payment_status,callsign").eq("id", data.registrationId).eq("user_id", context.userId).maybeSingle();
    if (error || !reg) return { error: "Registration not found." };
    const upgrade = availableUpgrade(reg.payment_status, reg.pricing_option);
    if (data.plan === "payoff") {
      if (upgrade !== "payoff") return { error: "There is no remaining balance to pay off." };
      return payoffSession(reg, data, context.userId, (context.claims as { email?: string }).email);
    }
    const upgrading = upgrade === "to_franchise";
    if (!upgrading && !canStartPayment(reg.payment_status)) return { error: "This entry is already paid or on an active plan." };
    let priceId: string;
    try { priceId = entryPriceId(reg.lane, upgrading ? "franchise" : reg.pricing_option, data.plan); } catch (e) { return { error: (e as Error).message }; }
    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [priceId], expand: ["data.product"] });
      const price = prices.data[0];
      if (!price) return { error: "Price not found." };
      const recurring = price.type === "recurring";
      const email = (context.claims as { email?: string }).email;
      const customer = await resolveOrCreateCustomer(stripe, { email, userId: context.userId });
      const productName = typeof price.product === "object" && price.product && "name" in price.product ? price.product.name : "Tournament entry";
      const metadata: Record<string, string> = { userId: context.userId, registrationId: reg.id, priceId, ...(upgrading ? { upgradeTo: "franchise" } : {}) };
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: price.id, quantity: 1 }],
        mode: recurring ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer,
        metadata,
        ...(recurring ? { subscription_data: { metadata } } : { payment_intent_data: { description: productName, metadata } }),
      });
      return { clientSecret: session.client_secret ?? "" };
    } catch (e) {
      return { error: getStripeErrorMessage(e) };
    }
  });

async function payoffSession(
  reg: { id: string; lane: number },
  data: { returnUrl: string; environment: "sandbox" | "live" },
  userId: string,
  email: string | undefined,
): Promise<Result> {
  try {
    const stripe = createStripeClient(data.environment);
    const subs = await stripe.subscriptions.search({ query: `metadata['registrationId']:'${reg.id}'`, limit: 5 });
    const sub = subs.data.find((s) => s.status === "active" || s.status === "past_due");
    if (!sub) return { error: "No active 8-week plan found for this entry." };
    const invoices = await stripe.invoices.list({ subscription: sub.id, status: "paid", limit: INSTALLMENT_COUNT });
    const amount = payoffCents(reg.lane, invoices.data.length);
    if (amount < 50) return { error: "Your plan is already fully paid." };
    const customer = await resolveOrCreateCustomer(stripe, { email, userId });
    const metadata = { userId, registrationId: reg.id, priceId: "installment_payoff", payoffSubscription: sub.id };
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price_data: { currency: "usd", product_data: { name: "Season pass – remaining balance" }, unit_amount: amount }, quantity: 1 }],
      mode: "payment", ui_mode: "embedded_page", return_url: data.returnUrl, customer, metadata,
      payment_intent_data: { description: "Season pass – remaining balance", metadata },
    });
    return { clientSecret: session.client_secret ?? "" };
  } catch (e) {
    return { error: getStripeErrorMessage(e) };
  }
}
