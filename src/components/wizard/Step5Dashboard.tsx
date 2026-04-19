import { MarketSnapshot } from "@/data/mockMarket";
import { BusinessType } from "@/data/businessTypes";
import {
  scoreNeighbors,
  overallScore,
  verdictLabel,
  verdictTone,
  Verdict,
} from "@/data/conflictMatrix";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step5Props {
  type: BusinessType;
  subtypeId: string;
  snapshot: MarketSnapshot;
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
    <div className="mt-2 flex items-baseline gap-1">
      <span className="display-num text-4xl md:text-5xl text-ink">{value}</span>
      {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
    </div>
    {hint && <div className="text-xs text-muted-foreground mt-2">{hint}</div>}
  </motion.div>
);

const ScoreDial = ({ score, grade, verdict }: { score: number; grade: string; verdict: Verdict }) => {
  const pct = Math.max(0, Math.min(100, (score + 100) / 2));
  return (
    <div className="data-card relative overflow-hidden">
      <div className="data-tag">SPOTIFY SCORE</div>
      <div className="mt-3 flex items-end gap-4">
        <div className="display-num text-7xl text-ink leading-none">{grade}</div>
        <div className="pb-2">
          <div className="font-mono text-xs tabular-nums text-muted-foreground">
            {score > 0 ? "+" : ""}{score} / 100
          </div>
          <div className={cn("stamp mt-1", verdictTone(verdict))}>
            ◉ {verdictLabel(verdict)}
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
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-ink/40" />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>AVOID</span><span>NEUTRAL</span><span>GREAT</span>
      </div>
    </div>
  );
};

export const Step5Dashboard = ({
  type,
  subtypeId,
  snapshot,
  pin,
  cityLabel,
}: Step5Props) => {
  const subtype = type.subtypes.find((s) => s.id === subtypeId)!;
  const signals = scoreNeighbors(subtypeId, snapshot.neighborCounts);
  const overall = overallScore(signals);
  const transitCount = snapshot.neighborCounts.transit ?? 0;
  const transitProximity =
    transitCount >= 3 ? "Excellent" : transitCount === 2 ? "Strong" : transitCount === 1 ? "Moderate" : "Limited";
  const transitDistance =
    transitCount >= 3 ? "< 100m" : transitCount === 2 ? "~ 200m" : transitCount === 1 ? "~ 400m" : "> 600m";
  const transitUplift =
    transitCount >= 3 ? "+18–24%" : transitCount === 2 ? "+10–15%" : transitCount === 1 ? "+4–7%" : "—";

  return (
    <div className="space-y-8">
      {/* Header strip */}
      <div className="border border-border-strong bg-ink text-background p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-background/60">
            Intelligence Report
          </div>
          <div className="font-display text-2xl md:text-3xl font-semibold mt-1">
            {subtype.label} · {type.label}
          </div>
          <div className="font-mono text-xs text-background/70 mt-1 tabular-nums">
            {cityLabel} · {pin.lat.toFixed(4)}°, {pin.lng.toFixed(4)}°
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 bg-signal-green rounded-full animate-blink" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-background/80">
            Live mock data · v0.1
          </span>
        </div>
      </div>

      {/* Score + key metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScoreDial score={overall.score} grade={overall.grade} verdict={overall.verdict} />
        <div className="grid grid-cols-2 gap-4">
          <Metric
            label="Direct Competitors"
            value={String(snapshot.competitorCount)}
            unit="within 1km"
            delay={0.1}
          />
          <Metric
            label="Avg Rent"
            value={`$${snapshot.avgRentPerSqft}`}
            unit="/sqft/mo"
            delay={0.15}
          />
          <Metric
            label="2-Year Survival"
            value={`${snapshot.successRate2yr}%`}
            hint={`for ${type.label.toLowerCase()} in this area`}
            delay={0.2}
          />
          <Metric
            label="Foot Traffic"
            value={snapshot.footTraffic}
            delay={0.25}
          />
        </div>
      </div>

      {/* Expected Revenue — featured projection */}
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
              <span className="stamp text-ink">◉ MODEL v0.1</span>
            </div>
            <div className="mt-4 flex items-baseline gap-3 flex-wrap">
              <span className="display-num text-5xl md:text-6xl text-ink leading-none tabular-nums">
                ${(snapshot.expectedRevenueMin / 1000).toFixed(0)}K
              </span>
              <span className="font-display text-3xl text-muted-foreground leading-none">—</span>
              <span className="display-num text-5xl md:text-6xl text-ink leading-none tabular-nums">
                ${(snapshot.expectedRevenueMax / 1000).toFixed(0)}K
              </span>
              <span className="font-mono text-xs text-muted-foreground self-end pb-2">/mo</span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Modeled from category benchmarks, foot traffic, density, and competitive saturation in this catchment.
            </div>

            <div className="mt-6">
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                <span>Conservative</span>
                <span>Optimistic</span>
              </div>
              <div className="h-2 bg-paper-deep relative">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  style={{ originX: 0 }}
                  className="absolute inset-y-0 left-[15%] right-[15%] bg-ink"
                />
                <div className="absolute top-1/2 -translate-y-1/2 left-[15%] size-3 bg-ink border-2 border-paper" />
                <div className="absolute top-1/2 -translate-y-1/2 right-[15%] size-3 bg-ink border-2 border-paper" />
              </div>
            </div>
          </div>

          <div className="bg-paper p-6 md:p-8 grid grid-cols-2 md:grid-cols-1 gap-4 content-between">
            <div>
              <div className="data-tag">Annual Midpoint</div>
              <div className="display-num text-3xl text-ink mt-1 tabular-nums">
                ${(((snapshot.expectedRevenueMin + snapshot.expectedRevenueMax) / 2 * 12) / 1000).toFixed(0)}K
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">/yr · gross</div>
            </div>
            <div>
              <div className="data-tag">Confidence</div>
              <div className="font-display text-xl text-ink mt-1">
                {snapshot.competitorCount > 25 ? "Moderate" : snapshot.competitorCount > 10 ? "High" : "Directional"}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">
                {snapshot.competitorCount} comps sampled
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transit proximity callout */}
      {transitCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="border border-border-strong bg-card relative overflow-hidden"
        >
          <div className="absolute inset-y-0 left-0 w-1.5 bg-accent" />
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-px bg-border-strong">
            <div className="bg-card p-6 md:p-7 pl-7 md:pl-8">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="data-tag text-accent">Transit Advantage</div>
                <span className="stamp border-accent text-accent">◉ {transitProximity.toUpperCase()}</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-ink mt-2">
                {transitCount} transit {transitCount === 1 ? "stop" : "stops"} within walking distance
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {transitCount >= 3
                  ? `Multiple bus and transit lines converge near this pin. Commuter flow is consistent across morning, lunch, and evening windows — the kind of foot traffic that compounds for ${type.label.toLowerCase()} like ${subtype.label}.`
                  : transitCount === 2
                  ? `A pair of nearby stops gives you reliable commuter exposure. Expect a steady drip of walk-ins from passers-by who didn't plan the visit — pure incremental revenue.`
                  : `One stop nearby is enough to capture daily commuter habits. Riders are creatures of routine — once they notice you, they come back.`}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-ink">
                <li className="flex gap-2"><span className="text-accent font-mono">→</span>Lower customer acquisition cost — discovery is free.</li>
                <li className="flex gap-2"><span className="text-accent font-mono">→</span>Wider catchment without depending on parking or car traffic.</li>
                <li className="flex gap-2"><span className="text-accent font-mono">→</span>Stronger weekday lunch + after-work demand windows.</li>
              </ul>
            </div>
            <div className="bg-paper p-6 md:p-7 grid grid-cols-2 md:grid-cols-1 gap-4 content-between">
              <div>
                <div className="data-tag">Nearest Stop</div>
                <div className="display-num text-2xl text-ink mt-1 tabular-nums">{transitDistance}</div>
                <div className="font-mono text-[10px] text-muted-foreground mt-1">walking</div>
              </div>
              <div>
                <div className="data-tag">Revenue Uplift</div>
                <div className="display-num text-2xl text-accent mt-1 tabular-nums">{transitUplift}</div>
                <div className="font-mono text-[10px] text-muted-foreground mt-1">vs. car-only sites</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Demographic strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-strong border border-border-strong">
        {[
          { l: "MEDIAN INCOME", v: `$${snapshot.medianIncome.toLocaleString()}` },
          { l: "POP DENSITY", v: `${snapshot.populationDensity.toLocaleString()}/km²` },
          { l: "SAFETY INDEX", v: `${snapshot.safetyScore}/100` },
          { l: "SIGNALS DETECTED", v: `${signals.length}` },
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
            Scoring against {subtype.label} profile
          </div>
        </div>

        <div className="border border-border-strong">
          <div className="grid grid-cols-[1fr_60px_120px] gap-4 px-4 py-2 bg-ink text-background font-mono text-[10px] uppercase tracking-widest">
            <span>Nearby Signal</span>
            <span className="text-right">Count</span>
            <span className="text-right">Verdict</span>
          </div>
          {signals.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className="grid grid-cols-[1fr_60px_120px] gap-4 px-4 py-3 border-t border-border bg-card hover:bg-paper-deep/30 transition-colors"
            >
              <div>
                <div className="font-display font-semibold text-ink">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.reason}</div>
              </div>
              <div className="text-right font-mono tabular-nums text-ink self-center">
                {s.count}
              </div>
              <div className="text-right self-center">
                <span className={cn("stamp", verdictTone(s.verdict))}>
                  {verdictLabel(s.verdict)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
