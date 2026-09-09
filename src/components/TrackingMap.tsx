import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackingMapProps {
  /** Trajet parcouru : le dernier point porte le marqueur livreur. */
  track: { lat: number; lng: number }[];
  /** Destination du colis. */
  destination?: { lat: number; lng: number };
}

/** Pastille colorée en guise de marqueur — évite les icônes PNG par défaut. */
function dot(color: string, ring = false): L.DivIcon {
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<span class="map-pin${ring ? ' map-pin-live' : ''}" style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function TrackingMap({ track, destination }: TrackingMapProps) {
  const holder = useRef<HTMLDivElement | null>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!holder.current || map.current) return;

    map.current = L.map(holder.current, { zoomControl: false, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map.current);
    L.control.zoom({ position: 'bottomright' }).addTo(map.current);

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance || track.length === 0) return;

    instance.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) instance.removeLayer(layer);
    });

    const points = track.map(p => [p.lat, p.lng] as [number, number]);
    const courier = points[points.length - 1];

    if (points.length > 1) {
      L.polyline(points, { color: '#3B698F', weight: 4, opacity: 0.85 }).addTo(instance);
    }

    L.marker(points[0], { icon: dot('#B5944A') }).addTo(instance);
    L.marker(courier, { icon: dot('#3B698F', true) }).addTo(instance);

    const bounds: [number, number][] = [...points];
    if (destination) {
      const drop: [number, number] = [destination.lat, destination.lng];
      L.marker(drop, { icon: dot('#2E7D45') }).addTo(instance);
      bounds.push(drop);
    }

    if (bounds.length > 1) instance.fitBounds(L.latLngBounds(bounds).pad(0.3));
    else instance.setView(courier, 15);
  }, [track, destination]);

  return <div className="map-canvas" ref={holder} />;
}
