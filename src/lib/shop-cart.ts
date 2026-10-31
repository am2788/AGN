import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mutateShopCart, readShopCart, type ShopCart } from "./shopify";
type CartState = { cart: ShopCart | null; busy: boolean; error: string; sync: () => Promise<void>; add: (variantId: string) => Promise<void>; change: (line: string, quantity: number) => Promise<void> };
export const useShopCart = create<CartState>()(persist((set, get) => ({
  cart: null, busy: false, error: "",
  sync: async () => {
    const cart = get().cart; if (!cart || get().busy) return;
    set({ busy: true });
    try { const current = await readShopCart(cart.id); set({ cart: current?.totalQuantity ? current : null }); }
    catch (e) { set({ error: e instanceof Error ? e.message : "Could not refresh cart." }); }
    finally { set({ busy: false }); }
  },
  add: async (variantId) => {
    if (get().busy) return; set({ busy: true, error: "" });
    try { const cart = get().cart; const line = cart?.lines.nodes.find((l) => l.merchandise.id === variantId); set({ cart: await mutateShopCart(!cart ? "create" : line ? "update" : "add", cart?.id ?? null, line?.id ?? variantId, line ? line.quantity + 1 : 1) }); }
    catch (e) { const message = e instanceof Error ? e.message : "Could not add item."; set({ error: message, ...(/cart not found|does not exist/i.test(message) ? { cart: null } : {}) }); }
    finally { set({ busy: false }); }
  },
  change: async (line, quantity) => {
    const cart = get().cart; if (!cart || get().busy) return; set({ busy: true, error: "" });
    try { const result = await mutateShopCart(quantity <= 0 ? "remove" : "update", cart.id, line, quantity); set({ cart: result.totalQuantity ? result : null }); }
    catch (e) { const message = e instanceof Error ? e.message : "Could not update item."; set({ error: message, ...(/cart not found|does not exist/i.test(message) ? { cart: null } : {}) }); }
    finally { set({ busy: false }); }
  },
}), { name: "agn-merch-cart", storage: createJSONStorage(() => localStorage), skipHydration: true, partialize: (s) => ({ cart: s.cart }) }));