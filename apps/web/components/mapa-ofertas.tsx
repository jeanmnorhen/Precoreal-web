'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Oferta {
  id: string;
  titulo: string;
  distancia: number;
  lojaNome: string;
  lojaLatitude: number;
  lojaLongitude: number;
  precoMedio: number;
}

interface MapaOfertasProps {
  ofertas: Oferta[];
  className?: string;
}

export function MapaOfertas({ ofertas, className = '' }: MapaOfertasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || ofertas.length === 0) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    const icon = L.divIcon({
      html: `<div style="background:var(--color-success);color:var(--color-success-foreground);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid var(--color-success-foreground);">R$$</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: '',
    });

    for (const o of ofertas) {
      const marker = L.marker([o.lojaLatitude, o.lojaLongitude], { icon })
        .addTo(map);

      marker.bindPopup(
        `<div style="font-family:system-ui;min-width:160px;background:var(--color-card);color:var(--color-foreground);">
          <strong style="font-size:14px;color:var(--color-foreground);">${o.titulo}</strong><br/>
          <span style="font-size:12px;color:var(--color-foreground-muted);">${o.lojaNome}</span><br/>
          <span style="font-size:13px;font-weight:700;color:var(--color-success);">
            R$ ${(o.precoMedio / 100).toFixed(2)}
          </span>
          ${o.distancia < 999 ? `<br/><span style="font-size:11px;color:var(--color-foreground-muted);">${o.distancia < 1 ? `${(o.distancia * 1000).toFixed(0)}m` : `${o.distancia.toFixed(1)}km`}</span>` : ''}
        </div>`,
      );

      bounds.extend([o.lojaLatitude, o.lojaLongitude]);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48] });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [ofertas]);

  if (ofertas.length === 0) return null;

  return (
    <div
      ref={mapRef}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ height: '320px', border: '1px solid var(--color-border)' }}
    />
  );
}
