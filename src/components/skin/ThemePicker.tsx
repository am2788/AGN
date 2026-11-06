import { useEffect, useRef, useState } from "react";
import { THEME_KEYS, THEME_LABELS, applyTheme, isThemeKey, readStoredTheme } from "@/lib/theme";

export function ThemePicker() {
  const [theme, setTheme] = useState("simple-gold");
  const [message, setMessage] = useState("");
  const revision = useRef(0);
  const queue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    setTheme(readStoredTheme());
    const onTheme = (event: Event) => {
      const value: unknown = (event as CustomEvent).detail;
      if (isThemeKey(value)) setTheme(value);
    };
    window.addEventListener("agn-theme-change", onTheme);
    return () => window.removeEventListener("agn-theme-change", onTheme);
  }, []);
  return (
    <div className="theme-picker">
      <label>
        Appearance{" "}
        <select
          aria-label="Site theme"
          value={theme}
          onChange={(event) => {
            const value = event.target.value;
            if (!isThemeKey(value)) return;
            const current = ++revision.current;
            applyTheme(value);
            setTheme(value);
            setMessage("Local appearance applied; saving…");
            queue.current = queue.current
              .catch(() => undefined)
              .then(async () => {
                try {
                  const response = await fetch("/me/theme", {
                    method: "PATCH",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ theme: value }),
                  });
                  if (revision.current === current)
                    setMessage(
                      response.ok
                        ? "Theme saved to your account"
                        : "Local only — account persistence requires configured Xano access",
                    );
                } catch {
                  if (revision.current === current)
                    setMessage("Local only — could not save to your account");
                }
              });
          }}
        >
          {THEME_KEYS.map((key) => (
            <option key={key} value={key}>
              {THEME_LABELS[key]}
            </option>
          ))}
        </select>
      </label>
      <span role="status">{message}</span>
    </div>
  );
}
