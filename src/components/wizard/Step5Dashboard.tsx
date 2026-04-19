import type { AnalysisResponse } from "@/lib/api";
import { BusinessType } from "@/data/businessTypes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step5Props {
  type: BusinessType;
  subtypeId: string;
  analysis: AnalysisResponse;
  pin: { lat: number; lng: number };
  cityLabel: string;
}

const Metric = ({
  label,
  value,
  unit,
  hint,
  delay = 0,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="data-card"
  >
    <div className="data-tag">{label}</div>
    <div className="mt-2 flex items-baseline gap-1 flex-wrap">
      <span className="display-num text-4xl md:text-5xl text-ink">{value}</span>
      {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
    </div>
    {hint && <div className="text-xs text-muted-foreground mt-2">{hint}</div>}
  </motion.div>
);

function verdictToneClass(verdict: string) {
  const v = verdict.toLowerCase();

  if (
    v.includes("strong") ||
    v.includes("great") ||
    v.includes("good") ||
    v.includes("yes") ||
    v.includes("favorable") ||
    v.includes("viable")
  ) {
    return "border-signal-green text-signal-green";
  }

  if (
    v.includes("neutral") ||
    v.includes("consider") ||
    v.includes("mixed") ||
    v.includes("watch") ||
    v.includes("marginal")
  ) {
    return "border-signal-amber text-signal-amber";
  }

  return "border-signal-red text-signal-red";
}

const ScoreDial = ({
  score,
  grade,
  verdict,
}: {
  score: number;
  grade: string;
  verdict: string;
}) => {
  const pct = Math.max(0, Math.min(100, score));

  return (
    <div className="data-card relative overflow-hidden">
      <div className="data-tag">SPOTIGY SCORE</div>
      <div className="mt-3 flex items-end gap-4">
        <div className="display-num text-7xl text-ink leading-none">{grade}</div>
        <div className="pb-2">
          <div className="font-mono text-xs tabular-nums text-muted-foreground">
            {score}/100
          </div>
          <div className={cn("stamp mt-1", verdictToneClass(verdict))}>
            ◉ {verdict}
          </div>
        </div>
      </div>

      <div className="mt-5 h-1.5 bg-paper-deep relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full bg-gradient-signal"
        />
      </div>

      <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>LOW</span>
        <span>MEDIUM</span>
        <span>HIGH</span>
      </div>
    </div>
  );
};

function formatCurrency(value: number | null) {
  if (value === null) return "N/A";
  return `$${value.toLocaleString()}`;
}

function formatNumber(value: number | null) {
  if (value === null) return "N/A";
  return value.toLocaleString();
}

export const Step5Dashboard = ({
  type,
  subtypeId,
  analysis,
  pin,
  cityLabel,
}: Step5Props) => {
  const subtypeLabel =
    type.subtypes.find((s) => s.id === subtypeId)?.label ?? analysis.subtype;

  const topCompetitors = analysis.nearest_competitors.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header strip */}
      <div className="border border-border-strong bg-ink text-background p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-background/60">
            Intelligence Report
          </div>
          <div className="font-display text-2xl md:text-3xl font-semibold mt-1">
            {subtypeLabel} · {type.label}
          </div>
          <div className="font-mono text-xs text-background/70 mt-1 tabular-nums">
            {cityLabel} · {pin.lat.toFixed(4)}°, {pin.lng.toFixed(4)}°
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 bg-signal-green rounded-full animate-blink" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-background/80">
            Live backend · Sydney
          </span>
        </div>
      </div>

      {/* Score + key metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScoreDial
          score={analysis.score}
          grade={analysis.grade}
          verdict={analysis.verdict}
        />

        <div className="grid grid-cols-2 gap-4">
          <Metric
            label="Direct Competitors"
            value={String(analysis.direct_competitors_1km)}
            unit="within 1km"
            delay={0.1}
          />
          <Metric
            label="Close Competitors"
            value={String(analysis.close_competitors_300m)}
            unit="within 300m"
            delay={0.15}
          />
          <Metric
            label="2-Year Survival"
            value={
              analysis.survival_rate_2y !== null
                ? `${analysis.survival_rate_2y}%`
                : "N/A"
            }
            hint={`for ${type.label.toLowerCase()} in this area`}
            delay={0.2}
          />
          <Metric
            label="Foot Traffic"
            value={analysis.foot_traffic_proxy}
            delay={0.25}
          />
        </div>
      </div>

      {/* Revenue / output section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border border-border-strong bg-card relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-signal opacity-[0.04] pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-px bg-border-strong">
          <div className="bg-card p-6 md:p-8 relative">
            <div className="flex items-center justify-between">
              <div className="data-tag">Projected Monthly Revenue</div>
              <span className="stamp text-ink">◉ MODEL v1.0</span>
            </div>

            <div className="mt-4">
              <span className="display-num text-5xl md:text-6xl text-ink leading-none tabular-nums break-words">
                {analysis.projected_revenue_monthly ?? "N/A"}
              </span>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Based on nearby POI density, competitor saturation, local signals, and the backend scoring model.
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="border border-border-strong p-4">
                <div className="data-tag">Signals Detected</div>
                <div className="display-num text-3xl text-ink mt-1">
                  {analysis.signals_detected}
                </div>
              </div>
              <div className="border border-border-strong p-4">
                <div className="data-tag">POIs Nearby</div>
                <div className="display-num text-3xl text-ink mt-1">
                  {analysis.poi_count_500m}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-1">
                  within 500m
                </div>
              </div>
            </div>
          </div>

          <div className="bg-paper p-6 md:p-8 grid grid-cols-2 md:grid-cols-1 gap-4 content-between">
            <div>
              <div className="data-tag">1km POI Count</div>
              <div className="display-num text-3xl text-ink mt-1 tabular-nums">
                {analysis.poi_count_1km.toLocaleString()}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">
                total nearby POIs
              </div>
            </div>
            <div>
              <div className="data-tag">Confidence</div>
              <div className="font-display text-xl text-ink mt-1">
                {analysis.signals_detected >= 8
                  ? "High"
                  : analysis.signals_detected >= 4
                  ? "Moderate"
                  : "Directional"}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">
                backend analysis
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Demographic / area strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-strong border border-border-strong">
        {[
          { l: "MEDIAN INCOME", v: formatCurrency(analysis.median_income) },
          {
            l: "AVG RENT",
            v: analysis.avg_rent !== null ? `$${analysis.avg_rent}` : "N/A",
          },
          {
            l: "SAFETY INDEX",
            v: analysis.safety_index !== null ? `${analysis.safety_index}/100` : "N/A",
          },
          { l: "SIGNALS DETECTED", v: `${analysis.signals_detected}` },
        ].map((s) => (
          <div key={s.l} className="bg-paper px-4 py-3">
            <div className="data-tag">{s.l}</div>
            <div className="font-display font-semibold text-ink mt-0.5">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Conflict matrix */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="data-tag">Section 03</div>
            <h2 className="font-display text-2xl font-semibold text-ink mt-1">
              Conflict & Synergy Matrix
            </h2>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Backend-scored signals
          </div>
        </div>

        <div className="border border-border-strong">
          <div className="grid grid-cols-[1fr_60px_120px] gap-4 px-4 py-2 bg-ink text-background font-mono text-[10px] uppercase tracking-widest">
            <span>Nearby Signal</span>
            <span className="text-right">Count</span>
            <span className="text-right">Verdict</span>
          </div>

          {analysis.matrix.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground bg-card border-t border-border">
              No matrix signals returned for this location.
            </div>
          ) : (
            analysis.matrix.map((row, i) => (
              <motion.div
                key={`${row.label}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="grid grid-cols-[1fr_60px_120px] gap-4 px-4 py-3 border-t border-border bg-card hover:bg-paper-deep/30 transition-colors"
              >
                <div>
                  <div className="font-display font-semibold text-ink">{row.label}</div>
                </div>
                <div className="text-right font-mono tabular-nums text-ink self-center">
                  {row.count}
                </div>
                <div className="text-right self-center">
                  <span className={cn("stamp", verdictToneClass(row.verdict))}>
                    {row.verdict}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Nearest competitors */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="data-tag">Section 04</div>
            <h2 className="font-display text-2xl font-semibold text-ink mt-1">
              Nearest Competitors
            </h2>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            closest businesses from backend
          </div>
        </div>

        <div className="border border-border-strong">
          <div className="grid grid-cols-[1.2fr_1fr_120px] gap-4 px-4 py-2 bg-ink text-background font-mono text-[10px] uppercase tracking-widest">
            <span>Name</span>
            <span>Area</span>
            <span className="text-right">Distance</span>
          </div>

          {topCompetitors.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground bg-card border-t border-border">
              No nearby competitors returned.
            </div>
          ) : (
            topCompetitors.map((c, i) => (
              <motion.div
                key={`${c.name}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                className="grid grid-cols-[1.2fr_1fr_120px] gap-4 px-4 py-3 border-t border-border bg-card hover:bg-paper-deep/30 transition-colors"
              >
                <div>
                  <div className="font-display font-semibold text-ink">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {c.category_text}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {c.address}
                  </div>
                </div>
                <div className="self-center text-sm text-ink">{c.locality}</div>
                <div className="self-center text-right font-mono tabular-nums text-ink">
                  {Math.round(c.distance_m)}m
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};