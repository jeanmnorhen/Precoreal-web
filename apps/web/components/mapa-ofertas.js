'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapaOfertas = MapaOfertas;
const react_1 = require("react");
const leaflet_1 = __importDefault(require("leaflet"));
require("leaflet/dist/leaflet.css");
function MapaOfertas({ ofertas, className = '' }) {
    const mapRef = (0, react_1.useRef)(null);
    const mapInstanceRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!mapRef.current || mapInstanceRef.current || ofertas.length === 0)
            return;
        const map = leaflet_1.default.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true,
        });
        leaflet_1.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap',
        }).addTo(map);
        const bounds = leaflet_1.default.latLngBounds([]);
        const icon = leaflet_1.default.divIcon({
            html: `<div style="background:#16a34a;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;">R$$</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            className: '',
        });
        for (const o of ofertas) {
            const marker = leaflet_1.default.marker([o.lojaLatitude, o.lojaLongitude], { icon })
                .addTo(map);
            marker.bindPopup(`<div style="font-family:system-ui;min-width:160px;">
          <strong style="font-size:14px;">${o.titulo}</strong><br/>
          <span style="font-size:12px;color:#666;">${o.lojaNome}</span><br/>
          <span style="font-size:13px;font-weight:700;color:#16a34a;">
            R$ ${(o.precoMedio / 100).toFixed(2)}
          </span>
          ${o.distancia < 999 ? `<br/><span style="font-size:11px;color:#999;">${o.distancia < 1 ? `${(o.distancia * 1000).toFixed(0)}m` : `${o.distancia.toFixed(1)}km`}</span>` : ''}
        </div>`);
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
    if (ofertas.length === 0)
        return null;
    return (<div ref={mapRef} className={`rounded-2xl overflow-hidden ${className}`} style={{ height: '320px', border: '1px solid var(--color-border)' }}/>);
}
