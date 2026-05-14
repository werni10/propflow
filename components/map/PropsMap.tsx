'use client';

import { useEffect, useRef } from 'react';
import { Item } from '@/lib/types';

// City coordinates for Morocco
const CITY_COORDS: Record<string, [number, number]> = {
  'Casablanca': [33.5731, -7.5898],
  'Marrakech':  [31.6295, -7.9811],
  'Fes':        [34.0181, -5.0078],
  'Tangier':    [35.7595, -5.8340],
  'Rabat':      [33.9716, -6.8498],
};

interface Props {
  items: Item[];
}

export default function PropsMap({ items }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Leaflet must be imported dynamically — it reads window/document on import.
    let L: typeof import('leaflet');

    import('leaflet').then(mod => {
      L = mod.default ?? (mod as unknown as typeof import('leaflet'));

      // Prevent double-init if effect re-runs
      if (mapRef.current) {
        (mapRef.current as import('leaflet').Map).remove();
        mapRef.current = null;
      }

      // ── Init map ────────────────────────────────────────────────────────
      const map = L.map(containerRef.current!, {
        center: [31.7917, -7.0926],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      // ── Dark tile layer ─────────────────────────────────────────────────
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // ── Group items by city ─────────────────────────────────────────────
      const byCity: Record<string, Item[]> = {};
      for (const item of items) {
        const city = item.location;
        if (!byCity[city]) byCity[city] = [];
        byCity[city].push(item);
      }

      // ── Add markers ─────────────────────────────────────────────────────
      for (const [city, cityItems] of Object.entries(byCity)) {
        const coords = CITY_COORDS[city];
        if (!coords) continue;

        const count = cityItems.length;

        // Gold circle divIcon
        const icon = L.divIcon({
          className: '',
          iconSize: [count > 1 ? 36 : 28, count > 1 ? 36 : 28],
          iconAnchor: [count > 1 ? 18 : 14, count > 1 ? 18 : 14],
          html: `<div style="
            width: ${count > 1 ? 36 : 28}px;
            height: ${count > 1 ? 36 : 28}px;
            border-radius: 50%;
            background: rgba(212,168,50,0.85);
            border: 2px solid rgba(212,168,50,1);
            box-shadow: 0 0 12px rgba(212,168,50,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Barlow Condensed', sans-serif;
            font-size: ${count > 1 ? 12 : 10}px;
            font-weight: 700;
            color: #080708;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">${count > 1 ? count : ''}</div>`,
        });

        const marker = L.marker(coords, { icon }).addTo(map);

        // Build popup content for this city
        const popupHtml = cityItems
          .slice(0, 5) // cap at 5 items per city in popup
          .map(
            item => `
              <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding: 10px 0; first-child:padding-top:0">
                <div style="font-family:'Barlow Condensed',sans-serif; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:rgba(212,168,50,0.8); margin-bottom:3px">${item.category}</div>
                <div style="font-family:'Playfair Display',serif; font-size:14px; font-weight:600; color:#f5f0e8; margin-bottom:4px; line-height:1.3">${item.title}</div>
                <div style="display:flex; justify-content:space-between; align-items:center">
                  <span style="font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:700; color:rgba(212,168,50,1)">${item.price_per_day} DHS/day</span>
                  <a href="/items/${item.id}" style="font-family:'Barlow Condensed',sans-serif; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:rgba(212,168,50,0.8); text-decoration:none; border:1px solid rgba(212,168,50,0.4); padding:3px 9px; border-radius:2px">View →</a>
                </div>
              </div>
            `
          )
          .join('');

        const moreNote =
          cityItems.length > 5
            ? `<div style="font-family:'Barlow Condensed',sans-serif; font-size:10px; color:rgba(255,255,255,0.4); text-align:center; padding-top:8px">+${cityItems.length - 5} more in ${city}</div>`
            : '';

        marker.bindPopup(
          `<div style="min-width:220px; max-width:260px; background:#141214; border:1px solid rgba(212,168,50,0.2); border-radius:2px; padding:12px; font-family:Barlow,sans-serif">
            <div style="font-family:'Barlow Condensed',sans-serif; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-bottom:12px">${city} · ${count} prop${count !== 1 ? 's' : ''}</div>
            ${popupHtml}
            ${moreNote}
          </div>`,
          {
            maxWidth: 280,
            className: 'propflow-popup',
          }
        );
      }
    });

    return () => {
      if (mapRef.current) {
        (mapRef.current as import('leaflet').Map).remove();
        mapRef.current = null;
      }
    };
  }, [items]);

  return (
    <>
      {/* Inject Leaflet CSS + popup overrides inline to avoid SSR issues */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

        .propflow-popup .leaflet-popup-content-wrapper {
          background: transparent;
          border: none;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          padding: 0;
          border-radius: 2px;
        }
        .propflow-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.5;
        }
        .propflow-popup .leaflet-popup-tip {
          background: rgba(212,168,50,0.3);
        }
        .propflow-popup .leaflet-popup-close-button {
          color: rgba(255,255,255,0.4);
          font-size: 16px;
          top: 6px;
          right: 8px;
        }
        .propflow-popup .leaflet-popup-close-button:hover {
          color: rgba(212,168,50,0.9);
        }
      `}</style>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 500,
          borderRadius: 2,
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      />
    </>
  );
}
