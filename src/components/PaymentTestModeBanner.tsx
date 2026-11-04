const clientToken = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'] as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return <div className="w-full border-b border-crimson/50 bg-crimson/15 px-4 py-2 text-center text-xs text-foreground">Checkout isn't live yet — real payments open once setup is finished.</div>;
  }
  if (clientToken.startsWith("pk_test_")) {
    return <div className="w-full border-b border-gold/50 bg-gold/15 px-4 py-2 text-center text-xs text-foreground">Test mode — payments in the preview are not real. <a href="https://docs.lovable.dev/features/payments#test-and-live-environments" target="_blank" rel="noopener noreferrer" className="underline">Read more</a></div>;
  }
  return null;
}
