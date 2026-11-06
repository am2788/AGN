import { requireXanoUser } from "./xano-session.server";
import { xano } from "./xano.server";
import { isThemeKey, type ThemeKey } from "./theme";

export async function readXanoTheme() {
  const { token } = await requireXanoUser();
  if (process.env["XANO_THEME_ENDPOINT_ENABLED"] !== "true")
    throw new Error("Authoritative Xano theme endpoint is not provisioned");
  const result = await xano<{ theme_id: unknown }>("platform", "me/theme", { token });
  if (!isThemeKey(result.theme_id)) throw new Error("Unsupported saved theme");
  return { theme: result.theme_id };
}
export async function saveXanoTheme(theme: ThemeKey) {
  const { token } = await requireXanoUser();
  if (process.env["XANO_THEME_ENDPOINT_ENABLED"] !== "true")
    throw new Error("Authoritative Xano theme endpoint is not provisioned");
  const result = await xano<{ theme_id: unknown }>("platform", "me/theme", {
    token,
    method: "PATCH",
    body: { theme_id: theme },
  });
  if (result.theme_id !== theme) throw new Error("Theme persistence was not confirmed");
  return { theme };
}
