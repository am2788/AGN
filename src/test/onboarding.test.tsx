import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  login: vi.fn(),
  navigate: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@/lib/xano.functions", () => ({ xanoSignup: mocks.register, xanoLogin: mocks.login }));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
  Link: ({ children }: { children: unknown }) => children,
}));
import { XanoOnboarding } from "@/components/xano-onboarding";
beforeEach(() => {
  vi.stubEnv("VITE_SKINS_CDN_BASE", "https://cdn.example/skins");
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  mocks.register.mockReset();
  mocks.navigate.mockClear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
function completeForm() {
  fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Player" } });
  fireEvent.click(screen.getByText("Next"));
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "player@example.test" } });
  fireEvent.click(screen.getByText("Next"));
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "fixture-password-only" },
  });
  fireEvent.click(screen.getByText("Next"));
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
}
describe("Xano onboarding media transition", () => {
  it("cuts loops only after confirmed registration, plays greeting and enters chat on ended", async () => {
    mocks.register.mockResolvedValue({ id: 1, name: "Player" });
    const { container } = render(<XanoOnboarding />);
    const audio = container.querySelector("audio")!;
    const loop = container.querySelector('video[aria-label="Sign-up atmosphere"]')!;
    const greeting = container.querySelector('video[aria-label="Welcome to AGN"]')!;
    completeForm();
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Welcome to AGN" })).toBeInTheDocument(),
    );
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect((HTMLMediaElement.prototype.pause as ReturnType<typeof vi.fn>).mock.contexts).toContain(
      audio,
    );
    expect((HTMLMediaElement.prototype.pause as ReturnType<typeof vi.fn>).mock.contexts).toContain(
      loop,
    );
    expect((HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>).mock.contexts).toContain(
      greeting,
    );
    expect(mocks.navigate).not.toHaveBeenCalled();
    fireEvent.ended(greeting);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/overchat" }));
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });
  it("does not play greeting or navigate on registration failure", async () => {
    mocks.register.mockRejectedValue(new Error("Unavailable"));
    render(<XanoOnboarding />);
    completeForm();
    await waitFor(() =>
      expect(screen.getByText(/Account request could not be completed/)).toBeInTheDocument(),
    );
    expect(screen.queryByRole("heading", { name: "Welcome to AGN" })).not.toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
