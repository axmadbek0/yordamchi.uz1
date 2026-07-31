/**
 * SchoolMap — Leaflet/OpenStreetMap wrapper with branded markers
 * react-leaflet must be installed: npm install react-leaflet leaflet @types/leaflet
 */

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SchoolWithLocation } from '../../types';
import type { UserLocation } from './useNearbySchools';

// Fix default icon paths that Vite/webpack strip
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Brand-colored SVG marker factory
function makePinIcon(fill: string, stroke: string, scale = 1): L.DivIcon {
  const size = Math.round(32 * scale);
  const anchor = Math.round(size / 2);
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(40 * scale)}" viewBox="0 0 32 40" fill="none">
      <path d="M16 0C8.268 0 2 6.268 2 14c0 10.5 14 26 14 26s14-15.5 14-26C30 6.268 23.732 0 16 0z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="16" cy="14" r="6" fill="white" opacity="0.9"/>
    </svg>`,
    iconSize: [size, Math.round(40 * scale)],
    iconAnchor: [anchor, Math.round(40 * scale)],
    popupAnchor: [0, -Math.round(38 * scale)],
    className: '',
  });
}

// User location pulsing dot
function makeUserIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:18px;height:18px;position:relative;">
      <div style="position:absolute;inset:0;border-radius:50%;background:#E8734A;opacity:0.3;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:absolute;inset:3px;border-radius:50%;background:#E8734A;border:2px solid white;box-shadow:0 0 6px rgba(232,115,74,0.5);"></div>
    </div>
    <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0;}}</style>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: '',
  });
}

const DEFAULT_ICON = makePinIcon('#1B6FA8', '#123C5C');
const ACTIVE_ICON = makePinIcon('#E8734A', '#C05A30', 1.15);
const USER_ICON = makeUserIcon();

// Flyto helper when highlighted school changes
function MapFlyTo({ schools, highlightedId }: { schools: SchoolWithLocation[]; highlightedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!highlightedId) return;
    const s = schools.find((x) => x.id === highlightedId);
    if (s?.lat && s?.lng) {
      map.flyTo([s.lat, s.lng], Math.max(map.getZoom(), 11), { animate: true, duration: 0.6 });
    }
  }, [highlightedId, schools, map]);
  return null;
}

interface Props {
  schools: SchoolWithLocation[];
  userLocation: UserLocation | null;
  highlightedId: string | null;
  onMarkerClick: (id: string) => void;
}

export function SchoolMap({ schools, userLocation, highlightedId, onMarkerClick }: Props) {
  const schoolsWithCoords = schools.filter((s) => s.lat && s.lng);

  // Default center: Uzbekistan center
  const defaultCenter: [number, number] =
    userLocation
      ? [userLocation.lat, userLocation.lng]
      : [41.299496, 69.240073];

  const defaultZoom = userLocation ? 10 : 6;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-primary/10 shadow-md">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyTo schools={schools} highlightedId={highlightedId} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={USER_ICON}
          >
            <Popup>
              <span className="text-xs font-semibold text-coral">Sizning joylashuvingiz</span>
            </Popup>
          </Marker>
        )}

        {/* School markers */}
        {schoolsWithCoords.map((school) => (
          <Marker
            key={school.id}
            position={[school.lat!, school.lng!]}
            icon={highlightedId === school.id ? ACTIVE_ICON : DEFAULT_ICON}
            eventHandlers={{
              click: () => onMarkerClick(school.id),
            }}
          >
            <Popup maxWidth={240}>
              <div className="p-1">
                <p className="font-bold text-deep text-sm leading-snug mb-1">{school.name}</p>
                <p className="text-xs text-muted mb-2">{school.address}</p>
                <button
                  onClick={() => onMarkerClick(school.id)}
                  className="text-xs font-semibold text-primary underline cursor-pointer"
                >
                  Ro'yxatda ko'rish →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
