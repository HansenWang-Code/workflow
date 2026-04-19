import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Step4Props {
  initialCenter: { lat: number; lng: number };
  pin: { lat: number; lng: number } | null;
  onPin: (pos: { lat: number; lng: number }) => void;
}

// Custom DivIcon for pin — cartographic style
const pinIcon = L.divIcon({
  className: "site-intel-pin",
  html: `
    <div style="position:relative; width:32px; height:32px;">
      <div style="position:absolute; inset:0; border-radius:50%; background:hsl(12 78% 48% / 0.25); animation:pulse-ring 1.6s ease-out infinite;"></div>
      <div style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:18px; height:18px; background:hsl(12 78% 48%); border:2.5px solid hsl(38 30% 96%); border-radius:50%; box-shadow:0 4px 12px hsl(215 40% 10% / 0.3);"></div>
      <div style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:5px; height:5px; background:hsl(38 30% 96%); border-radius:50%;"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const FlyTo = ({ center }: { center: { lat: number; lng: number } }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 14, { duration: 1.2 });
  }, [center, map]);
  return null;
};

const ClickHandler = ({ onPin }: { onPin: (p: { lat: number; lng: number }) => void }) => {
  useMapEvents({
    click: (e) => onPin({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
};

export const Step4Map = ({ initialCenter, pin, onPin }: Step4Props) => {
  return (
    <div className="space-y-4">
      <div className="map-frame relative h-[520px] crosshair-cursor overflow-hidden">
        <MapContainer
          center={[initialCenter.lat, initialCenter.lng]}
          zoom={13}
          scrollWheelZoom
          className="absolute inset-0"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CartoDB'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <FlyTo center={initialCenter} />
          <ClickHandler onPin={onPin} />
          {pin && <Marker position={[pin.lat, pin.lng]} icon={pinIcon} />}
        </MapContainer>

        {/* Crosshair overlay HUD */}
        <div className="pointer-events-none absolute top-4 left-4 right-4 flex items-start justify-between z-[400]">
          <div className="bg-ink text-background px-3 py-2 font-mono text-[10px] uppercase tracking-widest shadow-ink">
            ◎ Click anywhere to drop pin
          </div>
          {pin && (
            <div className="bg-background border border-border-strong px-3 py-2 font-mono text-[10px] tabular-nums shadow-paper">
              <div className="text-muted-foreground">PINNED</div>
              <div className="text-ink font-semibold">
                {pin.lat.toFixed(5)}°, {pin.lng.toFixed(5)}°
              </div>
            </div>
          )}
        </div>

        {!pin && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-[400]">
            <div className="size-24 border border-ink/30 border-dashed rounded-full flex items-center justify-center">
              <div className="size-2 bg-ink rounded-full animate-blink" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-strong border border-border-strong">
        {[
          { l: "TILES", v: "CartoDB Light" },
          { l: "ZOOM", v: "13×" },
          { l: "PIN MODE", v: "Click-to-drop" },
          { l: "STATUS", v: pin ? "Locked" : "Awaiting input" },
        ].map((s) => (
          <div key={s.l} className="bg-paper px-3 py-2.5">
            <div className="data-tag">{s.l}</div>
            <div className="font-mono text-xs text-ink mt-0.5">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
