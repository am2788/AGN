import { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, CreditCard, LockKeyhole, ShieldCheck, UserRound, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { checkoutPreviewQuote, INSTALLMENT_WEEKLY_CENTS, type CheckoutFormat, type CheckoutPlan } from "@/lib/checkout-preview";
import { formatUsd } from "@/lib/arena";

const FIELDS = [
  { id: "card-number", label: "Card Number", sample: "•••• •••• •••• 4242", placeholder: "Card Number", wide: true },
  { id: "expiry", label: "Expiration", sample: "12 / 28", placeholder: "MM / YY" },
  { id: "cvc", label: "CVC", sample: "•••", placeholder: "CVC" },
  { id: "holder", label: "Cardholder Name", sample: "Sample Player", placeholder: "Full Name on Card", wide: true },
  { id: "billing", label: "Billing Address", sample: "Sample Billing Address", placeholder: "Billing Address", wide: true },
  { id: "city", label: "City / Region", sample: "Sample City", placeholder: "City / Region" },
  { id: "zip", label: "ZIP / Postal Code", sample: "00000", placeholder: "ZIP / Postal Code" },
];

export function CheckoutPreview({ onBack }: { onBack: () => void }) {
  const [plan, setPlan] = useState<CheckoutPlan>("full");
  const [format, setFormat] = useState<CheckoutFormat>("solo");
  const [state, setState] = useState("default");
  const quote = checkoutPreviewQuote(format, plan);
  const accepted = state === "accepted";
  const declined = state === "declined";
  const StatusIcon = declined ? AlertTriangle : ShieldCheck;
  return <section className="checkout-preview" data-state={state} aria-label="Checkout visual preview">
    <div className="checkout-preview-notice"><LockKeyhole /><p><strong>Visual preview only</strong> · No security check, registration or payment has occurred. Card and billing fields are disabled.</p></div>
    <Tabs value={state} onValueChange={setState} className="checkout-state-tabs"><TabsList aria-label="Checkout example state"><TabsTrigger value="default">Default</TabsTrigger><TabsTrigger value="accepted">Accepted example</TabsTrigger><TabsTrigger value="declined">Declined example</TabsTrigger></TabsList></Tabs>
    <div className="checkout-status" role="status" aria-live="polite"><StatusIcon /><div><strong>{accepted ? "REGISTRATION ACCEPTED // PAYMENT PLAN ACTIVATED" : declined ? "REGISTRATION NOT ACCEPTED" : "SECURITY CHECK: PASSED"}</strong><p>{declined ? "PLEASE REVIEW THE INFORMATION BELOW AND TRY AGAIN" : accepted ? "Example confirmation appearance" : "Example verified-security appearance"}</p><small>Example state — not an actual verification or payment result</small></div>{accepted && <CheckCircle2 />}</div>
    <div className="checkout-columns">
      <section className="checkout-plans" aria-label="Entry plan"><h2>1. Choose your entry plan</h2>
        <Tabs value={plan} onValueChange={(value) => { if (value === "full" || value === "installment") setPlan(value); }} className="checkout-plan-tabs"><TabsList aria-label="Payment plan"><TabsTrigger value="full">Full Payment</TabsTrigger><TabsTrigger value="installment">Installment Plan</TabsTrigger></TabsList></Tabs>
        <RadioGroup value={format} onValueChange={(value) => { if (value === "solo" || value === "team") setFormat(value); }} aria-label="Tournament entry format" className="checkout-format-options">
          {(["solo", "team"] as const).map((value) => { const option = checkoutPreviewQuote(value, plan); const Icon = value === "solo" ? UserRound : Users; return <label key={value} className={`checkout-format ${format === value ? "is-selected" : ""}`}><RadioGroupItem value={value} aria-label={value === "solo" ? "Solo Players" : "Teams"} /><Icon aria-hidden="true" /><div><span>{value === "solo" ? "Solo Players" : "Teams"}</span><strong>{formatUsd(option.dueTodayCents)}</strong><small>{plan === "full" ? "One-time payment" : "Weekly × 8 weeks"}</small></div><CheckCircle2 className="checkout-check" aria-hidden="true" /></label>; })}
        </RadioGroup>
        <div className="checkout-installment-info"><h3>8-week installment plan</h3><p>Solo Players: $50 Weekly × 8 Weeks = $400 Total</p><p>Teams: $275 Weekly × 8 Weeks = $2,200 Total</p><small>8 payments over the 8-week tournament. Separate from Flexible Weekly / Split entry.</small></div>
        <p className="checkout-note">Tournament entry is open to all ages. Wagering verification is separate. No wager tier, Shield or multiplier is added to these prices.</p>
      </section>
      <section className="checkout-details" aria-label="Payment details"><h2>2. Payment details</h2><div className="checkout-card-label"><CreditCard />Card information<LockKeyhole /></div>
        <div className="checkout-fields">{FIELDS.map((field) => <div key={field.id} className={field.wide ? "checkout-field-wide" : ""}><label htmlFor={`preview-${field.id}`}>{field.label}</label><div className="checkout-input-wrap"><Input id={`preview-${field.id}`} placeholder={field.placeholder} value={accepted ? field.sample : ""} disabled autoComplete="off" />{accepted && <CheckCircle2 aria-hidden="true" />}</div></div>)}</div>
        <dl className="checkout-summary" aria-live="polite" aria-atomic="true"><h3>Order summary</h3><div><dt>Tournament Entry</dt><dd>{format === "solo" ? "Solo Players" : "Teams"}</dd></div><div><dt>Selected Plan</dt><dd>{plan === "full" ? "Full Payment" : "8-week Installments"}</dd></div>{plan === "installment" && <div><dt>Payment Schedule</dt><dd>{formatUsd(INSTALLMENT_WEEKLY_CENTS[format])} weekly × 8</dd></div>}<div><dt>Plan Total</dt><dd>{formatUsd(quote.totalCents)}</dd></div><div className="checkout-due"><dt>Total Due Today · Preview</dt><dd>{formatUsd(quote.dueTodayCents)}</dd></div></dl>
      </section>
    </div>
    <Button className="gateway-proceed checkout-confirm" disabled={!quote.paymentEnabled}><LockKeyhole />{declined ? "Registration not accepted — please review and try again" : "Confirm payment & secure my entry"}{accepted && <CheckCircle2 />}</Button>
    <p className="checkout-note checkout-bottom-note">Payments are not connected. No card information is collected and no payment plan is activated.</p>
    {declined && <Button variant="outline" className="checkout-reset" onClick={() => setState("default")}>Reset example</Button>}
    <Button variant="ghost" onClick={onBack}><ArrowLeft />Back to gateway selection</Button>
  </section>;
}