import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Camera, Check, ChevronRight, Crown, Hourglass, LockKeyhole, ScanLine, Shield, ShieldCheck, Trophy, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECURITY_TIERS, canOpenIdScanner, idPreviewSchema, securityPreviewAccess } from "@/lib/gateway-security";
import { gatewaySelection, type GatewayTierId } from "@/lib/gateway";

export function GatewaySecurity({ tier, onBack }: { tier: GatewayTierId; onBack: () => void }) {
  const [view, setView] = useState("compliance");
  const [securityTier, setSecurityTier] = useState<string>("Rookie");
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [shield, setShield] = useState(false);
  const [errorExample, setErrorExample] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraBusy, setCameraBusy] = useState(false);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeStream = useRef<MediaStream | null>(null);
  const cameraRequest = useRef(0);
  const previewRequest = useRef(0);
  const selected = gatewaySelection(tier);
  const allowed = canOpenIdScanner(adult, terms);
  const access = securityPreviewAccess();

  function stopCamera() {
    cameraRequest.current += 1;
    previewRequest.current += 1;
    activeStream.current?.getTracks().forEach((track) => track.stop());
    activeStream.current = null;
    setStream(null); setCameraBusy(false);
  }
  useEffect(() => () => {
    cameraRequest.current += 1;
    previewRequest.current += 1;
    activeStream.current?.getTracks().forEach((track) => track.stop());
  }, []);
  useEffect(() => { return () => { if (image) URL.revokeObjectURL(image); }; }, [image]);
  useEffect(() => {
    const video = cameraRef.current;
    if (video) { video.srcObject = stream; if (stream) void video.play().catch(() => { if (activeStream.current === stream) setMediaError("Camera playback could not start. Stop the camera and try again."); }); }
    return () => { if (video) video.srcObject = null; };
  }, [stream]);
  function changeView(value: string) {
    if (value === "scanner" && !allowed) return;
    stopCamera(); setImage(null); setMediaError(""); setErrorExample(false); setView(value);
  }
  async function startCamera() {
    stopCamera(); setImage(null); setMediaError(""); setCameraBusy(true);
    const request = cameraRequest.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera unavailable");
      const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      if (request !== cameraRequest.current) { next.getTracks().forEach((track) => track.stop()); return; }
      activeStream.current = next; setStream(next);
    } catch { if (request === cameraRequest.current) setMediaError("Camera unavailable or permission denied. You can choose a sample image instead."); }
    finally { if (request === cameraRequest.current) setCameraBusy(false); }
  }
  async function previewFile(file: File | undefined) {
    if (!file) return;
    stopCamera(); setImage(null); setMediaError(""); setErrorExample(false);
    const parsed = idPreviewSchema.safeParse({ type: file.type, size: file.size });
    if (!parsed.success) { setMediaError(parsed.error.issues[0]?.message ?? "Choose a valid image."); return; }
    const url = URL.createObjectURL(file);
    const request = previewRequest.current;
    const probe = new Image(); probe.src = url;
    try { await probe.decode(); if (request === previewRequest.current) setImage(url); else URL.revokeObjectURL(url); }
    catch { URL.revokeObjectURL(url); if (request === previewRequest.current) setMediaError("This image could not be opened. Choose a valid JPG, PNG or WebP."); }
  }
  function resetPreview() { stopCamera(); setImage(null); setMediaError(""); setErrorExample(false); if (inputRef.current) inputRef.current.value = ""; }

  return <section className="security-step" aria-label="Wager security check">
    <Tabs value={view} onValueChange={changeView} className="security-tabs">
      <TabsList aria-label="Security subviews"><TabsTrigger value="compliance">Age & Tier Compliance</TabsTrigger><TabsTrigger value="scanner" disabled={!allowed}>ID Scanner</TabsTrigger></TabsList>
      <TabsContent value="compliance">
        <div className="security-compliance-grid">
          <section className="security-tier-section" aria-label="Security tier selection">
            <span className="gateway-eyebrow">Step 02 · Security tier</span><h2>Select wager tier</h2>
            <RadioGroup value={securityTier} onValueChange={(value) => { if (SECURITY_TIERS.some((item) => item === value)) setSecurityTier(value); }} aria-label="Security tier" className="security-tier-grid">
              {SECURITY_TIERS.map((name) => <label key={name} className={`security-tier ${securityTier === name ? "is-selected" : ""}`}><RadioGroupItem value={name} aria-label={`${name} Tier`} /><Shield aria-hidden="true" /><span>{name}<br />Tier</span>{securityTier === name && <Check className="security-selection-check" aria-hidden="true" />}</label>)}
            </RadioGroup>
            <div className="security-selected" aria-live="polite"><span>Selected security tier</span><strong>{securityTier} Tier</strong><small>Initial gateway: ${selected.feeCents / 100} {selected.label} · unchanged</small></div>
          </section>
          <section className="security-age-section" aria-label="18+ Age Gate & Compliance">
            <span className="gateway-eyebrow">Age Gate & Compliance</span><h2>18+ Wagering Access</h2>
            <div className="security-age-emblem" aria-hidden="true"><Shield /><strong>18+</strong></div>
            <label className="security-check-label"><Checkbox checked={adult} onCheckedChange={(value) => setAdult(value === true)} />I am 18 years of age or older.</label>
            <label className="security-check-label"><Checkbox checked={terms} onCheckedChange={(value) => setTerms(value === true)} />I agree to the Terms of Service and Privacy Policy.</label>
            <div className="security-pending" role="status"><Hourglass /><span>Verification pending<small>Not submitted · ID verification service not connected</small></span></div>
            <Button className="gateway-proceed" disabled={!allowed} onClick={() => changeView("scanner")}><LockKeyhole />Enter the Vault<ChevronRight /></Button>
            <p className="security-note">Opens the ID scanner preview only. Acknowledgements do not establish your age, legal eligibility or identity. Official terms and privacy documents are awaiting organizer publication.</p>
          </section>
        </div>
      </TabsContent>
      <TabsContent value="scanner">
        <ol className="security-progress" aria-label="ID verification progress"><li><Check /><span>Gateway Selection<small>Completed</small></span></li><li aria-current="step"><ScanLine /><span>ID Verification<small>In progress · local preview</small></span></li><li><LockKeyhole /><span>Checkout<small>Next step · locked</small></span></li></ol>
        <div className="security-error-toggle"><label className="security-check-label"><Checkbox checked={errorExample} onCheckedChange={(value) => setErrorExample(value === true)} />Show rejection example</label></div>
        {errorExample && <div role="alert" className="security-rejection"><AlertTriangle /><div><strong>ID VERIFICATION NOT ACCEPTED</strong><p>Check ID position and lighting, then try again.</p><small>Example error state · No identity check was performed</small></div><Button variant="ghost" size="icon" aria-label="Dismiss rejection example" onClick={() => setErrorExample(false)}><X /></Button></div>}
        <div className="security-scanner-grid">
          <section aria-label="Local ID scanner preview" className="security-scanner-main">
            <div className="security-id-frame">
              {stream ? <video ref={cameraRef} autoPlay muted playsInline aria-label="Local camera preview" /> : image ? <img src={image} alt="Local sample document preview" /> : <div className="security-id-placeholder"><ScanLine /><strong>Place ID Inside the Frame</strong><span>Front of ID · Sample preview</span></div>}
              <span className="security-frame-corner top-left" /><span className="security-frame-corner top-right" /><span className="security-frame-corner bottom-left" /><span className="security-frame-corner bottom-right" />
            </div>
            <div className="security-media-controls"><Button variant="outline" disabled={cameraBusy} onClick={() => stream ? stopCamera() : void startCamera()}><Camera />{stream ? "Stop camera" : cameraBusy ? "Starting camera…" : "Start camera"}</Button><Button variant="outline" onClick={() => inputRef.current?.click()}><Upload />Upload sample ID</Button><Button variant="ghost" size="icon" aria-label="Clear local preview" title="Clear local preview" onClick={resetPreview}><X /></Button></div>
            <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Sample ID image" onChange={(event) => { void previewFile(event.target.files?.[0]); event.target.value = ""; }} />
            {mediaError && <p role="alert" className="security-file-error">{mediaError}</p>}
            <p className="security-note"><LockKeyhole />Use a sample image, not a real identity document. Camera and image previews remain on this device; nothing is uploaded, analyzed or saved.</p>
            <Button className="gateway-proceed" disabled={!access.identityVerified || !access.checkoutEnabled}><LockKeyhole />Complete ID verification to proceed to checkout</Button>
          </section>
          <aside className="security-scanner-summary" aria-label="Security check tier selection"><h2>Security Check Tier Selection</h2><p className="security-selected-name">{securityTier} Tier</p><div className="security-category"><Trophy />Daily Match Winnings</div><div className="security-category"><ShieldCheck />Finals Qualifier Winner</div><div className="security-category"><Crown />Overall Tournament Jackpot</div>
            <div className="gateway-multiplier"><strong>2X</strong><p><b>Prize Multiplier Preview</b><br />Eligible winnings: daily, qualifier and jackpot.<small>Proposed only · settlement rules not connected</small></p></div>
            <label className="security-check-label security-shield"><Checkbox checked={shield} onCheckedChange={(value) => setShield(value === true)} /><span>Optional 2X Shield<small>Preview choice only · price and protection rules not supplied</small></span></label>
            <div className="security-initial" aria-live="polite"><span>Selected gateway wager</span><strong>${selected.feeCents / 100}</strong><b>{selected.label} Gateway</b><small>Initial wager payment unchanged. Security tiers and Shield do not authorize charges.</small></div>
            {errorExample && <Button className="gateway-proceed" onClick={resetPreview}><ScanLine />Try again</Button>}
          </aside>
        </div>
      </TabsContent>
    </Tabs>
    <Button variant="ghost" onClick={() => { resetPreview(); onBack(); }}><ArrowLeft />Back to gateway selection</Button>
  </section>;
}