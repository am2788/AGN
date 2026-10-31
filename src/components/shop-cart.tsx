import { useEffect, useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useShopCart } from "@/lib/shop-cart";
export function ShopCartSync() {
  useEffect(() => {
    void useShopCart.persist.rehydrate();
    const sync = () => { if (document.visibilityState === "visible") void useShopCart.getState().sync(); };
    sync(); document.addEventListener("visibilitychange", sync); return () => document.removeEventListener("visibilitychange", sync);
  }, []); return null;
}
export function MerchandiseCart() {
  const { cart, busy, error, sync, change } = useShopCart(); const [open, setOpen] = useState(false);
  useEffect(() => { if (open) void sync(); }, [open, sync]);
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="outline"><ShoppingCart /> Cart {cart?.totalQuantity ?? 0}</Button></SheetTrigger>
    <SheetContent className="dark flex w-full flex-col border-wager-line bg-vault-panel font-body text-foreground sm:max-w-lg"><SheetHeader><SheetTitle>Event merchandise cart</SheetTitle><SheetDescription>{cart?.totalQuantity ? `${cart.totalQuantity} items` : "Your cart is empty"}</SheetDescription></SheetHeader>
      <div className="mt-6 flex-1 overflow-y-auto">{cart?.lines.nodes.map((line) => <div key={line.id} className="border-b border-wager-line/30 py-4"><h3 className="font-bold text-gold">{line.merchandise.product.title}</h3><p className="text-sm">{line.merchandise.title} · {line.merchandise.price.currencyCode} {line.merchandise.price.amount}</p><div className="mt-3 flex items-center gap-3"><Button size="icon" variant="outline" aria-label={`Decrease ${line.merchandise.product.title}`} disabled={busy} onClick={() => void change(line.id, line.quantity - 1)}><Minus /></Button><span>{line.quantity}</span><Button size="icon" variant="outline" aria-label={`Increase ${line.merchandise.product.title}`} disabled={busy} onClick={() => void change(line.id, line.quantity + 1)}><Plus /></Button><Button size="icon" variant="ghost" aria-label={`Remove ${line.merchandise.product.title}`} disabled={busy} onClick={() => void change(line.id, 0)}><Trash2 /></Button></div></div>)}</div>
      {error && <p role="alert" className="text-sm text-amber-alert">{error}</p>}
      {cart && <p className="text-gold">Subtotal: {cart.lines.nodes[0]?.merchandise.price.currencyCode} {cart.lines.nodes.reduce((sum, l) => sum + Number(l.merchandise.price.amount) * l.quantity, 0).toFixed(2)}</p>}
      <Button disabled={!cart || busy} onClick={() => { if (cart?.checkoutUrl) { const url = new URL(cart.checkoutUrl); url.searchParams.set("channel", "online_store"); window.open(url.toString(), "_blank", "noopener,noreferrer"); setOpen(false); } }}>Checkout with Shopify</Button>
    </SheetContent></Sheet>;
}