import { useEffect, useState } from "react";
import { MarketSnapshot } from "@/data/mockMarket";
import { BusinessType } from "@/data/businessTypes";
import { overallScore, scoreNeighbors, verdictLabel } from "@/data/conflictMatrix";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Step6Props {
  type: BusinessType;
  subtypeId: string;
  snapshot: MarketSnapshot;
  cityLabel: string;
  onRestart: () => void;
}

function buildNarrative(
  type: BusinessType,
  subtypeId: string,
  snapshot: MarketSnapshot,
  cityLabel: string
): string {
  const subtype = type.subtypes.find((s) => s.id === subtypeId)!;
  const signals = scoreNeighbors(subtypeId, snapshot.neighborCounts);
  const overall = overallScore(signals);
  const positives = signals.filter((s) => s.verdict > 0).slice(0, 3);
  const negatives = signals.filter((s) => s.verdict < 0).slice(0, 2);

  const verdictWord = overall.verdict >= 1 ? "viable" : overall.verdict === 0 ? "marginal" : "risky";

  const intro = `Verdict: ${verdictLabel(overall.verdict)} — Score ${overall.score > 0 ? "+" : ""}${overall.score}/100, Grade ${overall.grade}.\n\nOpening a ${subtype.label.toLowerCase()} ${type.label.toLowerCase()} in ${cityLabel} looks ${verdictWord} based on the surrounding business signals and demographic profile.`;

  const revLowK = Math.round(snapshot.expectedRevenueMin / 1000);
  const revHighK = Math.round(snapshot.expectedRevenueMax / 1000);
  const revAnnualK = Math.round(((snapshot.expectedRevenueMin + snapshot.expectedRevenueMax) / 2 * 12) / 1000);

  const market = `\n\n— Market context —\nThis catchment has ${snapshot.competitorCount} direct competitors within roughly 1km, average commercial rent of $${snapshot.avgRentPerSqft}/sqft/mo, and a 2-year survival rate of ${snapshot.successRate2yr}% for businesses in your category. Median household income is $${snapshot.medianIncome.toLocaleString()}, population density is ${snapshot.populationDensity.toLocaleString()}/km², and the area scores ${snapshot.safetyScore}/100 on safety.\n\n— Revenue projection —\nOur model projects gross monthly revenue between $${revLowK}K and $${revHighK}K (roughly $${revAnnualK}K/year at the midpoint). This range is calibrated against ${type.label.toLowerCase()} benchmarks, the area's foot traffic profile, and the current competitive density. Treat the low end as your conservative break-even planning number and the high end as upside if execution is strong.`;

  const synergyText = positives.length
    ? `\n\n— Why this could work —\n${positives
        .map((p) => `• ${p.label} (${p.count} nearby): ${p.reason}`)
        .join("\n")}`
    : "";

  const conflictText = negatives.length
    ? `\n\n— What to watch out for —\n${negatives
        .map((n) => `• ${n.label} (${n.count} nearby): ${n.reason}`)
        .join("\n")}`
    : "";

  const recommendations =
    overall.verdict >= 1
      ? `\n\n— What to do first —\n1. Visit the location at three different times: weekday lunch, weekday evening, and weekend afternoon. Confirm the foot traffic profile matches the data.\n2. Negotiate rent below the $${snapshot.avgRentPerSqft}/sqft/mo benchmark — your survival math improves dramatically below market rate.\n3. Differentiate on what the ${positives[0]?.label.toLowerCase() ?? "local"} crowd actually wants — don't just clone the nearest competitor.\n4. Plan for a 6-month ramp. The 2-year survival rate of ${snapshot.successRate2yr}% reflects operators who survived that critical first window.`
      : `\n\n— Recommendation —\nWe'd advise looking at adjacent neighborhoods before committing. ${negatives[0]?.label ?? "The competitive density"} is working against your concept, and the math gets brutal when you're paying $${snapshot.avgRentPerSqft}/sqft/mo against only a ${snapshot.successRate2yr}% 2-year survival rate. If you love this exact location, consider adapting your concept toward what the area's signals actually support.`;

  return intro + market + synergyText + conflictText + recommendations;
}

export const Step6AINarrative = ({
  type,
  subtypeId,
  snapshot,
  cityLabel,
  onRestart,
}: Step6Props) => {
  const fullText = buildNarrative(type, subtypeId, snapshot, cityLabel);
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 4; // chars per tick
      setShown(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 16);
    return () => clearInterval(id);
  }, [fullText]);

  return (
    <div className="space-y-6">
      <div className="border border-border-strong bg-card">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-strong bg-paper-deep/40">
          <div className="flex items-center gap-3">
            <div className="size-7 bg-ink text-background flex items-center justify-center font-display font-bold">
              ◉
            </div>
            <div>
              <div className="font-display font-semibold text-sm text-ink">
                LOCWISE · AI Recommendation
              </div>
              <div className="data-tag">Plain-English verdict for {cityLabel}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${done ? "bg-signal-green" : "bg-signal-amber animate-blink"}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {done ? "Complete" : "Generating"}
            </span>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <pre className="font-sans text-[15px] leading-relaxed text-ink whitespace-pre-wrap">
            {shown}
            {!done && <span className="inline-block w-2 h-4 bg-ink ml-0.5 animate-blink" />}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { t: "Generate Business Plan", d: "Full plan tailored to this location and concept.", icon: "◰" },
          { t: "Estimate Startup Costs", d: "Build-out, equipment, working capital, runway.", icon: "◇" },
          { t: "Competitor Deep-Dive", d: "Detailed breakdown of every nearby player.", icon: "◈" },
        ].map((a) => (
          <motion.button
            key={a.t}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: done ? 1 : 0.5, y: 0 }}
            transition={{ delay: 0.1 }}
            disabled={!done}
            className="group text-left p-5 border border-border bg-card hover:border-ink hover:shadow-elevated transition-all disabled:cursor-not-allowed"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="font-display text-2xl text-ink">{a.icon}</span>
              <span className="data-tag">FOLLOW-UP</span>
            </div>
            <div className="font-display font-semibold text-ink">{a.t}</div>
            <div className="text-xs text-muted-foreground mt-1">{a.d}</div>
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border-strong pt-6">
        <button
          onClick={onRestart}
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-ink"
        >
          ← Run another analysis
        </button>
        <Button className="rounded-none font-mono text-xs uppercase tracking-widest bg-ink hover:bg-ink/90">
          Export Report (PDF)
        </Button>
      </div>
    </div>
  );
};
