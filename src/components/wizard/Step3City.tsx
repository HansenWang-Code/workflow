import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Step3Props {
  onConfirm: (city: string) => void;
  defaultCity?: string;
}

const PRESETS = [
  { label: "Jakarta, ID", lat: -6.2088, lng: 106.8456 },
  { label: "Kuala Lumpur, MY", lat: 3.1390, lng: 101.6869 },
  { label: "London, UK", lat: 51.5074, lng: -0.1278 },
  { label: "Bangkok, TH", lat: 13.7563, lng: 100.5018 },
  { label: "Sydney, AU", lat: -33.8688, lng: 151.2093 },
  { label: "Melbourne, AU", lat: -37.8136, lng: 144.9631 },
];

export const Step3City = ({ onConfirm, defaultCity }: Step3Props) => {
  const [value, setValue] = useState(defaultCity ?? "");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label className="data-tag block mb-2">Search for a city or address</label>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Williamsburg, Brooklyn or 123 Main St"
            className="h-14 text-lg font-display border-border-strong focus-visible:ring-ink rounded-none"
          />
        </div>
        <Button
          onClick={() => value && onConfirm(value)}
          disabled={!value}
          className="h-14 px-8 rounded-none font-mono text-xs uppercase tracking-widest bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_6px_18px_hsl(var(--accent)/0.30)] disabled:shadow-none"
        >
          Open Map →
        </Button>
      </div>

      <div>
        <div className="data-tag mb-3">Or pick a preset market</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onConfirm(p.label)}
              className="group p-4 border-2 border-border bg-card text-left hover:border-accent hover:bg-accent/5 hover:shadow-paper transition-all"
            >
              <div className="font-display font-semibold text-ink">{p.label}</div>
              <div className="font-mono text-[10px] tabular-nums text-muted-foreground mt-1">
                {p.lat.toFixed(4)}°, {p.lng.toFixed(4)}°
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PRESET_CITIES = PRESETS;
