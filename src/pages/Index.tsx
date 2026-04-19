import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { StepHeader } from "@/components/StepHeader";
import { StepShell } from "@/components/StepShell";
import { Step1Category } from "@/components/wizard/Step1Category";
import { Step2Subtype } from "@/components/wizard/Step2Subtype";
import { Step3City, PRESET_CITIES } from "@/components/wizard/Step3City";
import { Step4Map } from "@/components/wizard/Step4Map";
import { Step5Dashboard } from "@/components/wizard/Step5Dashboard";
import { Step6AINarrative } from "@/components/wizard/Step6AINarrative";
import { BusinessCategory, getType } from "@/data/businessTypes";
import { getMarketSnapshot } from "@/data/mockMarket";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: 1, label: "Category" },
  { id: 2, label: "Subtype" },
  { id: 3, label: "City" },
  { id: 4, label: "Pin" },
  { id: 5, label: "Dashboard" },
  { id: 6, label: "Verdict" },
];

const Hero = ({ onStart }: { onStart: () => void }) => (
  <section className="relative overflow-hidden border-b border-border-strong">
    <div className="absolute inset-0 contour-bg pointer-events-none" />
    <div className="container relative py-20 md:py-28">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="stamp text-ink">◎ LOCWISE · V0.1</span>
          <span className="data-tag">Location decision engine</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-ink leading-[0.95]">
          Should you open <em className="text-primary not-italic">here</em> —
          and will you <em className="text-primary not-italic">survive</em>?
        </h1>
        <p className="mt-8 md:text-xl text-ink-soft max-w-2xl leading-relaxed my-[35px] text-xl">
          The data-driven location analysis that used to cost thousands — now available to any entrepreneur in minutes.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onStart}
            className="h-14 px-8 rounded-none font-mono text-xs uppercase tracking-widest bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_8px_24px_hsl(var(--accent)/0.35)]"
          >
            Begin Analysis →
          </Button>
          <a
            href="#how"
            className="h-14 px-8 inline-flex items-center font-mono text-xs uppercase tracking-widest border border-border-strong text-ink hover:bg-paper-deep transition-colors"
          >
            How it works
          </a>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-border-strong border border-border-strong max-w-3xl">
          {[
            { l: "BUSINESS TYPES", v: "6 categories" },
            { l: "SUBTYPES", v: "30+" },
            { l: "MARKETS", v: "Worldwide" },
            { l: "VERDICT TIME", v: "< 30 sec" },
          ].map((s) => (
            <div key={s.l} className="bg-paper px-4 py-4">
              <div className="data-tag">{s.l}</div>
              <div className="font-display font-semibold text-ink mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* How it works */}
    <div id="how" className="container relative pb-20 md:pb-28">
      <div className="border-t border-border-strong pt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-border-strong border border-border-strong">
        {[
          {
            n: "01",
            t: "Specificity, not generic.",
            d: "Your business type determines everything. \nWe need to know exactly what you're opening.\n",
          },
          {
            n: "02",
            t: "The conflict matrix.",
            d: "Who's around you matters as much as where you are.\n",
          },
          {
            n: "03",
            t: "AI that explains.",
            d: "Numbers come from data. Wisdom comes from AI. Together they give a specific, readable, actionable verdict not a generic report.",
          },
        ].map((c) => (
          <div key={c.n} className="bg-paper p-8">
            <div className="font-mono text-xs text-muted-foreground tabular-nums mb-4">{c.n}</div>
            <h3 className="font-display text-2xl font-semibold text-ink leading-tight">{c.t}</h3>
            <p className="mt-3 text-sm text-ink-soft leading-relaxed">{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Index = () => {
  const [showHero, setShowHero] = useState(true);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<BusinessCategory | null>(null);
  const [subtype, setSubtype] = useState<string | null>(null);
  const [cityLabel, setCityLabel] = useState("");
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 40.7580, lng: -73.9855 });
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);

  const type = category ? getType(category) : null;

  const snapshot = useMemo(
    () => (pin && category && subtype ? getMarketSnapshot(pin.lat, pin.lng, category, subtype) : null),
    [pin, category, subtype]
  );

  const handleCityConfirm = (label: string, lat: number, lng: number) => {
  setCityLabel(label);
  setCenter({ lat, lng }); // lat / lang can be use form geocode
  setStep(4);
};

  const handleRestart = () => {
    setStep(1);
    setCategory(null);
    setSubtype(null);
    setCityLabel("");
    setPin(null);
    setShowHero(true);
  };

  // take on-block
  const navFooter = (canNext: boolean, onNext: () => void, onBack?: () => void) => (
    <>
      <button
        onClick={onBack ?? (() => setStep((s) => s - 1))}
        className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-ink transition-colors"
      >
        ← Back
      </button>
      <Button
        onClick={onNext}
        disabled={!canNext}
        className="rounded-none font-mono text-xs uppercase tracking-widest bg-accent hover:bg-accent/90 text-accent-foreground px-6 h-11 shadow-[0_6px_18px_hsl(var(--accent)/0.30)] disabled:shadow-none"
      >
        Continue →
      </Button>
    </>
  );

  if (showHero) {
    return (
      <main className="min-h-screen bg-background">
        <StepHeader steps={STEPS} current={0} />
        <Hero onStart={() => setShowHero(false)} />
        <footer className="container py-10 flex items-center justify-between border-t border-border">
          <div className="data-tag">© LOCWISE</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Mock dataset · v0.1
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <StepHeader steps={STEPS} current={step} />
      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepShell
            key="s1"
            stepNumber={1}
            totalSteps={6}
            eyebrow="Choose your category"
            title="What kind of business are you opening?"
            description="Pick the broad category. We'll ask for the specifics next — the more precise you are, the sharper the verdict."
            footer={navFooter(!!category, () => setStep(2), () => setShowHero(true))}
          >
            <Step1Category selected={category} onSelect={setCategory} />
          </StepShell>
        )}

        {step === 2 && type && (
          <StepShell
            key="s2"
            stepNumber={2}
            totalSteps={6}
            eyebrow="Get specific"
            title={`What kind of ${type.label.toLowerCase()}, exactly?`}
            description="The more specific you are, the sharper your verdict.\n"
            footer={navFooter(!!subtype, () => setStep(3))}
          >
            <Step2Subtype type={type} selected={subtype} onSelect={setSubtype} />
          </StepShell>
        )}

                // เพิ่ม footer เข้าไป
        {step === 3 && (
          <StepShell
            key="s3"
            stepNumber={3}
            totalSteps={6}
            eyebrow="Pick a market"
            title="Which spot are you searching?"
            description="Search for any city or address worldwide. You'll drop a precise pin on the map next."
            footer={navFooter(false, () => {}, () => setStep(2))}
          >
            <Step3City defaultCity={cityLabel} onConfirm={handleCityConfirm} />
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            key="s4"
            stepNumber={4}
            totalSteps={6}
            eyebrow="Drop your pin"
            title="Pin the exact location."
            description={`Click anywhere on the map to drop a pin. Be specific — different blocks, different verdicts.`}
            footer={navFooter(!!pin, () => setStep(5))}
          >
            <Step4Map initialCenter={center} pin={pin} onPin={setPin} />
          </StepShell>
        )}

        {step === 5 && type && subtype && pin && snapshot && (
          <StepShell
            key="s5"
            stepNumber={5}
            totalSteps={6}
            eyebrow="LOCWISE"
            title="The numbers, the signals, the matrix."
            description="Live market data, demographic profile, and the conflict matrix scored against your specific concept."
            footer={navFooter(true, () => setStep(6))}
          >
            <Step5Dashboard
              type={type}
              subtypeId={subtype}
              snapshot={snapshot}
              pin={pin}
              cityLabel={cityLabel || "Selected location"}
            />
          </StepShell>
        )}

        {step === 6 && type && subtype && snapshot && (
          <StepShell
            key="s6"
            stepNumber={6}
            totalSteps={6}
            eyebrow="The verdict"
            title="Should you open here?"
            description="A plain-English recommendation built from your numbers and the conflict matrix. Read it like advice from a trusted analyst."
          >
            <Step6AINarrative
              type={type}
              subtypeId={subtype}
              snapshot={snapshot}
              cityLabel={cityLabel || "this location"}
              onRestart={handleRestart}
            />
          </StepShell>
        )}
      </AnimatePresence>

      <footer className="container py-10 flex items-center justify-between border-t border-border mt-8">
        <div className="data-tag">© LOCWISE · FIELD EDITION</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Mock dataset · v0.1
        </div>
      </footer>
    </main>
  );
};

export default Index;
