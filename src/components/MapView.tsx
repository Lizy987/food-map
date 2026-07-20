/**
 * 地图浏览组件 — 展示所有美食标记
 */
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Post } from '../types';
import { defaultIcon, activeIcon } from '../lib/mapIcons';
import { useLeafletMap } from '../hooks/useLeafletMap';

interface Props {
  posts: Post[];
  selectedId?: string | null;
  onMarkerClick?: (post: Post) => void;
}

export default function MapView({ posts, selectedId, onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const mapRef = useLeafletMap(containerRef, {
    center: [39.9042, 116.4074],
    zoom: 5,
  });

  // 同步标记到地图
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentMarkers = markersRef.current;
    const newIds = new Set(posts.map((p) => p.id));

    // 移除旧标记
    for (const [id, marker] of currentMarkers) {
      if (!newIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    }

    // 添加/更新标记
    for (const post of posts) {
      const icon = post.id === selectedId ? activeIcon : defaultIcon;

      if (currentMarkers.has(post.id)) {
        currentMarkers.get(post.id)!.setIcon(icon);
      } else {
        const m = L.marker([post.latitude, post.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="cursor:pointer"><b>${post.dish_name}</b><br/><small>${post.store_name}</small></div>`
          );
        m.on('click', () => onMarkerClick?.(post));
        m.on('popupclick', () => onMarkerClick?.(post));
        currentMarkers.set(post.id, m);
      }
    }

    // 视野调整
    if (posts.length === 1) {
      map.setView([posts[0].latitude, posts[0].longitude], 15);
    } else if (posts.length > 1) {
      const bounds = L.latLngBounds(
        posts.map((p) => [p.latitude, p.longitude] as L.LatLngTuple)
      );
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }, [posts, selectedId, onMarkerClick, mapRef]);

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
  );
}
