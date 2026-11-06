import type { ShopCart } from "./shopify";

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const token = process.env["SHOPIFY_STOREFRONT_TOKEN"];
  if (!token) throw new Error("SHOPIFY_STOREFRONT_TOKEN is not configured");
  const response = await fetch(
    "https://crimson-callsign-registry-r1i63-y6hex20k.myshopify.com/api/2026-10/graphql.json",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify({ query, variables }),
    },
  );
  if (!response.ok)
    throw new Error(`Shopify is unavailable (${response.status}). Please retry later.`);
  const result = await response.json();
  if (result.errors?.length)
    throw new Error(result.errors.map((e: { message: string }) => e.message).join("; "));
  return result.data;
}

const CART_FIELDS = `id checkoutUrl totalQuantity lines(first:100){nodes{id quantity merchandise{... on ProductVariant{id title price{amount currencyCode} product{title}}}}}`;
export async function readShopCart(id: string) {
  return (await storefrontApiRequest(`query($id:ID!){cart(id:$id){${CART_FIELDS}}}`, { id }))
    .cart as ShopCart | null;
}
export async function mutateShopCart(
  operation: "create" | "add" | "update" | "remove",
  cartId: string | null,
  variantOrLine: string,
  quantity = 1,
): Promise<ShopCart> {
  const definitions = {
    create: {
      name: "cartCreate",
      args: "$input:CartInput!",
      call: "input:$input",
      vars: { input: { lines: [{ merchandiseId: variantOrLine, quantity }] } },
    },
    add: {
      name: "cartLinesAdd",
      args: "$cartId:ID!,$lines:[CartLineInput!]!",
      call: "cartId:$cartId,lines:$lines",
      vars: { cartId, lines: [{ merchandiseId: variantOrLine, quantity }] },
    },
    update: {
      name: "cartLinesUpdate",
      args: "$cartId:ID!,$lines:[CartLineUpdateInput!]!",
      call: "cartId:$cartId,lines:$lines",
      vars: { cartId, lines: [{ id: variantOrLine, quantity }] },
    },
    remove: {
      name: "cartLinesRemove",
      args: "$cartId:ID!,$lineIds:[ID!]!",
      call: "cartId:$cartId,lineIds:$lineIds",
      vars: { cartId, lineIds: [variantOrLine] },
    },
  };
  const definition = definitions[operation];
  const data = await storefrontApiRequest(
    `mutation(${definition.args}){${definition.name}(${definition.call}){cart{${CART_FIELDS}} userErrors{message}}}`,
    definition.vars,
  );
  const result = data[definition.name];
  if (result.userErrors?.length)
    throw new Error(result.userErrors.map((e: { message: string }) => e.message).join("; "));
  if (!result.cart) throw new Error("Cart not found. Please add your items again.");
  const cart = result.cart as ShopCart;
  const url = new URL(cart.checkoutUrl);
  url.searchParams.set("channel", "online_store");
  cart.checkoutUrl = url.toString();
  return cart;
}
