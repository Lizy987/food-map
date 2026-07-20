/**
 * 地图选点组件 — 点击/拖动标记选择经纬度
 */
import { useRef, useCallback, useEffect } from 'react';
import L from 'leaflet';
import type { LatLng } from '../types';
import { activeIcon } from '../lib/mapIcons';
import { useLeafletMap } from '../hooks/useLeafletMap';

interface Props {
  defaultPosition?: LatLng | null;
  onPositionChange: (pos: LatLng) => void;
  hasPicked?: boolean;
  onPickStatusChange?: (picked: boolean) => void;
}

export default function MapPicker({
  defaultPosition,
  onPositionChange,
  hasPicked,
  onPickStatusChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // 稳定回调引用
  const onPosRef = useRef(onPositionChange);
  onPosRef.current = onPositionChange;
  const onPickRef = useRef(onPickStatusChange);
  onPickRef.current = onPickStatusChange;

  const placeMarker = useCallback((lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    onPosRef.current({ lat, lng });
    onPickRef.current?.(true);
  }, []);

  // 使用共享 Hook 初始化地图
  useLeafletMap(containerRef, {
    center: defaultPosition
      ? [defaultPosition.lat, defaultPosition.lng]
      : [39.9042, 116.4074],
    zoom: defaultPosition ? 15 : 5,
    deferredInvalidate: true,
    onReady: (map) => {
      // 点击放置标记
      map.on('click', (e: L.LeafletMouseEvent) => {
        placeMarker(e.latlng.lat, e.latlng.lng);
      });

      // 编辑模式：预放置标记
      if (defaultPosition) {
        const m = L.marker([defaultPosition.lat, defaultPosition.lng], {
          icon: activeIcon,
          draggable: true,
        }).addTo(map);

        m.on('dragend', () => {
          const pos = m.getLatLng();
          placeMarker(pos.lat, pos.lng);
        });

        markerRef.current = m;
      }
    },
  });

  // 编辑页：异步加载完成后同步位置
  useEffect(() => {
    const mapEl = containerRef.current;
    if (!defaultPosition || !mapEl) return;

    // 通过 DOM 找到已存在的 Leaflet 实例
    const map = (mapEl as any)._leaflet_map as L.Map | undefined;
    if (!map) return;

    map.setView([defaultPosition.lat, defaultPosition.lng], 15);

    if (markerRef.current) {
      markerRef.current.setLatLng([defaultPosition.lat, defaultPosition.lng]);
    }
  }, [defaultPosition?.lat, defaultPosition?.lng]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        style={{ height: '14rem', width: '100%' }}
      />
      {/* 状态提示 */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-black/50 text-white text-xs px-2 py-1 rounded-b-lg pointer-events-none">
        {hasPicked && defaultPosition
          ? `已选：${defaultPosition.lat.toFixed(4)}, ${defaultPosition.lng.toFixed(4)}`
          : '点击地图选择位置'}
      </div>
    </div>
  );
}
