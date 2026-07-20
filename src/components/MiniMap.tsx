/**
 * 小地图 — 详情页只读地图展示
 */
import { useRef } from 'react';
import L from 'leaflet';
import { defaultIcon } from '../lib/mapIcons';
import { useLeafletMap } from '../hooks/useLeafletMap';

interface Props {
  lat: number;
  lng: number;
}

export default function MiniMap({ lat, lng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLeafletMap(containerRef, {
    center: [lat, lng],
    zoom: 15,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    rebuildKey: `${lat},${lng}`,
    onReady: (map) => {
      L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
    },
  });

  return (
    <div ref={containerRef} style={{ height: '12rem', width: '100%' }} />
  );
}
