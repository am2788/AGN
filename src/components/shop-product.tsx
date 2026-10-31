import { useState } from "react";
import { Button } from "./ui/button";
import { useShopCart } from "@/lib/shop-cart";
import type { ShopProduct } from "@/lib/shopify";
export function ProductPurchase({ product }: { product: ShopProduct }) {
  const [id, setId] = useState(product.variants.nodes[0]?.id ?? ""); const { add, busy, error } = useShopCart();
  const variant = product.variants.nodes.find((v) => v.id === id);
  return <div className="space-y-3"><select aria-label="Product variant" value={id} onChange={(e) => setId(e.target.value)} className="h-10 w-full border border-input bg-vault-panel px-3 text-sm">{product.variants.nodes.map((v) => <option key={v.id} value={v.id}>{v.title} · {v.price.currencyCode} {v.price.amount}</option>)}</select><Button disabled={busy || !variant?.availableForSale} onClick={() => void add(id)} className="w-full bg-crimson text-foreground hover:bg-crimson/80">{busy ? "Adding…" : !variant?.availableForSale ? "Unavailable" : "Add to cart"}</Button>{error && <p role="alert" className="text-xs text-amber-alert">{error}</p>}</div>;
}