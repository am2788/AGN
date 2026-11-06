import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
export type ShopProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  images: { nodes: { url: string; altText: string | null }[] };
  variants: {
    nodes: {
      id: string;
      title: string;
      availableForSale: boolean;
      price: { amount: string; currencyCode: string };
    }[];
  };
};
const PRODUCT_FIELDS = `id handle title description images(first:5){nodes{url altText}} variants(first:50){nodes{id title availableForSale price{amount currencyCode}}}`;
export const getShopProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { storefrontApiRequest } = await import("./shopify.server");
  const data = await storefrontApiRequest(`query{products(first:100){nodes{${PRODUCT_FIELDS}}}}`);
  return data.products.nodes as ShopProduct[];
});
export const getShopProduct = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ handle: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { storefrontApiRequest } = await import("./shopify.server");
    const result = await storefrontApiRequest(
      `query($handle:String!){product(handle:$handle){${PRODUCT_FIELDS}}}`,
      data,
    );
    return result.product as ShopProduct | null;
  });
export type ShopCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        product: { title: string };
      };
    }[];
  };
};

const readCart = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1).max(2048) }).parse(input))
  .handler(async ({ data }) => {
    const { readShopCart } = await import("./shopify.server");
    return readShopCart(data.id);
  });

const mutateCart = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        operation: z.enum(["create", "add", "update", "remove"]),
        cartId: z.string().min(1).max(2048).nullable(),
        variantOrLine: z.string().min(1).max(2048),
        quantity: z.number().int().min(0).max(250),
      })
      .refine((data) => data.operation === "create" || data.cartId !== null, "Cart ID required")
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { mutateShopCart } = await import("./shopify.server");
    return mutateShopCart(data.operation, data.cartId, data.variantOrLine, data.quantity);
  });

export function readShopCart(id: string): Promise<ShopCart | null> {
  return readCart({ data: { id } });
}

export function mutateShopCart(
  operation: "create" | "add" | "update" | "remove",
  cartId: string | null,
  variantOrLine: string,
  quantity = 1,
): Promise<ShopCart> {
  return mutateCart({ data: { operation, cartId, variantOrLine, quantity } });
}
