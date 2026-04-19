import { useEffect, useState } from "react";
import type { AnalysisResponse } from "@/lib/api";
import { BusinessType } from "@/data/businessTypes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Step6Props {
  type: BusinessType;
  subtypeId: string;
  analysis: AnalysisResponse;
  cityLabel: string;
  onRestart: () => void;
}

function buildNarrative(
  type: BusinessType,
  subtypeId: string,
  analysis: AnalysisResponse,
  cityLabel: string
): string {
  const subtypeLabel =
    type.subtypes.find((s) => s.id === subtypeId)?.label ?? analysis.subtype;

  const quickStats = [
    `• Score: ${analysis.score}/100`,
    `• Grade: ${analysis.grade}`,
    `• Verdict: ${analysis.verdict}`,
    `• Direct competitors within 1km: ${analysis.direct_competitors_1km}`,
    `• Close competitors within 300m: ${analysis.close_competitors_300m}`,
    `• Nearby POIs: ${analysis.poi_count_500m} within 500m, ${analysis.poi_count_1km} within 1km`,
    `• Foot traffic proxy: ${analysis.foot_traffic_proxy}`,
    `• Signals detected: ${analysis.signals_detected}`,
    `• Projected monthly revenue: ${analysis.projected_revenue_monthly ?? "N/A"}`,
    `• Average rent: ${analysis.avg_rent !== null ? `$${analysis.avg_rent}` : "N/A"}`,
    `• Median income: ${analysis.median_income !== null ? `$${analysis.median_income.toLocaleString()}` : "N/A"}`,
    `• Safety index: ${analysis.safety_index !== null ? `${analysis.safety_index}/100` : "N/A"}`,
    `• 2-year survival rate: ${analysis.survival_rate_2y !== null ? `${analysis.survival_rate_2y}%` : "N/A"}`,
  ].join("\n");

  const competitorBlock =
    analysis.nearest_competitors.length > 0
      ? `\n\n— Closest competitors —\n${analysis.nearest_competitors
          .slice(0, 3)
          .map(
            (c) =>
              `• ${c.name} (${c.category_text}) — ${Math.round(c.distance_m)}m away in ${c.locality}`
          )
          .join("\n")}`
      : "";

  const matrixBlock =
    analysis.matrix.length > 0
      ? `\n\n— Local signals picked up by the model —\n${analysis.matrix
          .slice(0, 5)
          .map((m) => `• ${m.label}: ${m.count} nearby (${m.verdict})`)
          .join("\n")}`
      : "";

  return `Verdict: ${analysis.verdict} — Score ${analysis.score}/100, Grade ${analysis.grade}.

Opening a ${subtypeLabel.toLowerCase()} ${type.label.toLowerCase()} in ${cityLabel} has been evaluated using the live Sydney backend.

${analysis.plain_english_summary}

— Quick stats —
${quickStats}${competitorBlock}${matrixBlock}

— Bottom line —
Use this result as a first-pass decision tool, then validate it on-site at different times of day before committing to lease terms.`;
}

export const Step6AINarrative = ({
  type,
  subtypeId,
  analysis,
  cityLabel,
  onRestart,
}: Step6Props) => {
  const fullText = buildNarrative(type, subtypeId, analysis, cityLabel);
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown("");
    setDone(false);

    let i = 0;
    const id = setInterval(() => {
      i += 4;
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
                SPOTIGY · AI Recommendation
              </div>
              <div className="data-tag">Plain-English verdict for {cityLabel}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                done ? "bg-signal-green" : "bg-signal-amber animate-blink"
              }`}
            />
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