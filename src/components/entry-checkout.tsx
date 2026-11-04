import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createEntryCheckout } from "@/lib/payments.functions";
import { availableUpgrade, canStartPayment } from "@/lib/tournament-payments";
import { PaymentTestModeBanner } from "./PaymentTestModeBanner";

type Plan = "full" | "installment" | "payoff";

/** Shows the right pay/upgrade buttons for an entry, then the inline checkout. Never offers cancel or downgrade. */
export function EntryCheckout({ registrationId, pricingOption, paymentStatus }: { registrationId: string; pricingOption: string; paymentStatus: string }) {
  const start = useServerFn(createEntryCheckout);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const fetchClientSecret = useCallback(async () => {
    const result = await start({ data: {
      registrationId, plan: plan ?? "full", environment: getStripeEnvironment(),
      returnUrl: `${window.location.origin}/account?checkout=complete&entry=${registrationId}`,
    } });
    if ("error" in result) { setError(result.error); throw new Error(result.error); }
    return result.clientSecret;
  }, [plan, registrationId, start]);

  const upgrade = availableUpgrade(paymentStatus, pricingOption);
  const primary = "w-full bg-crimson text-foreground hover:bg-crimson/80";
  let choices: React.ReactNode = null;
  if (upgrade === "to_franchise") {
    choices = <>
      <p className="text-xs text-muted-foreground">Upgrade to the Season Franchise Pass:</p>
      <Button className={primary} onClick={() => setPlan("full")}>Upgrade · pay in full</Button>
      <Button variant="outline" className="w-full" onClick={() => setPlan("installment")}>Upgrade · 8 weekly payments</Button>
    </>;
  } else if (upgrade === "payoff") {
    choices = <Button variant="outline" className="w-full" onClick={() => setPlan("payoff")}>Pay off remaining balance</Button>;
  } else if (canStartPayment(paymentStatus)) {
    choices = pricingOption === "franchise" ? <>
      <Button className={primary} onClick={() => setPlan("full")}>Pay in full</Button>
      <Button variant="outline" className="w-full" onClick={() => setPlan("installment")}>Pay in 8 weekly installments</Button>
      <p className="text-[11px] text-muted-foreground">The 8-week plan is a full commitment, win or lose, and can't be cancelled.</p>
    </> : <Button className={primary} onClick={() => setPlan("full")}>Pay this week's entry</Button>;
  }
  if (!choices) return null;

  if (!plan) return <div className="space-y-2"><PaymentTestModeBanner />{choices}</div>;
  return <div className="space-y-2">
    <PaymentTestModeBanner />
    {error && <p role="alert" className="text-xs text-amber-alert">{error}</p>}
    <EmbeddedCheckoutProvider key={plan} stripe={getStripe()} options={{ fetchClientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
    <Button variant="ghost" size="sm" onClick={() => { setPlan(null); setError(""); }}>Back</Button>
  </div>;
}
