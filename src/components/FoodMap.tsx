/**
 * 美食地图组件 — 首页浏览 & 上传选点 共用
 *
 * mode="browse" → 展示所有标记，点击跳详情
 * mode="pick"   → 点击/拖动放置单个标记，回调位置
 */
import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import type { Post, LatLng } from '../types';
import { defaultIcon, activeIcon } from '../lib/mapIcons';
import {
  CARTODB_URL,
  OSM_URL,
  OSM_OPTIONS,
  TIANDITU_VEC,
  TIANDITU_CVA,
  TIANDITU_OPTIONS,
  hasTiandituKey,
} from '../lib/tiles';

// ── 共享 Props ──────────────────────────────────

interface BaseProps {
  /** 容器高度（CSS 值），默认 "100%" */
  height?: string;
}

interface BrowseProps extends BaseProps {
  mode: 'browse';
  posts: Post[];
  selectedId?: string | null;
  onMarkerClick?: (post: Post) => void;
}

interface PickProps extends BaseProps {
  mode: 'pick';
  defaultPosition?: LatLng | null;
  onPositionChange: (pos: LatLng) => void;
  hasPicked?: boolean;
  onPickStatusChange?: (picked: boolean) => void;
}

type Props = BrowseProps | PickProps;

// ── 组件 ────────────────────────────────────────

export default function FoodMap(props: Props) {
  const { mode, height = '100%' } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const singleMarkerRef = useRef<L.Marker | null>(null);

  // 稳定回调（pick 模式）
  const onPosRef = useRef(
    mode === 'pick' ? props.onPositionChange : () => {}
  );
  if (mode === 'pick') onPosRef.current = props.onPositionChange;
  const onPickRef = useRef(
    mode === 'pick' ? props.onPickStatusChange : undefined
  );
  if (mode === 'pick') onPickRef.current = props.onPickStatusChange;

  const placeSingleMarker = useCallback(
    (map: L.Map, lat: number, lng: number) => {
      if (singleMarkerRef.current) {
        singleMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const m = L.marker([lat, lng], {
          icon: activeIcon,
          draggable: true,
        }).addTo(map);
        m.on('dragend', () => {
          const pos = m.getLatLng();
          onPosRef.current({ lat: pos.lat, lng: pos.lng });
        });
        singleMarkerRef.current = m;
      }
      onPosRef.current({ lat, lng });
      onPickRef.current?.(true);
    },
    []
  );

  // ── 初始化地图 ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // 确定初始中心
    let center: L.LatLngTuple = [39.9042, 116.4074];
    let zoom = 5;
    if (mode === 'pick' && props.defaultPosition) {
      center = [props.defaultPosition.lat, props.defaultPosition.lng];
      zoom = 15;
    }

    const map = L.map(container, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    });

    // 瓦片
    L.tileLayer(CARTODB_URL, { maxZoom: 20, subdomains: 'abcd' }).addTo(map);
    L.tileLayer(OSM_URL, OSM_OPTIONS).addTo(map);
    if (hasTiandituKey) {
      L.tileLayer(TIANDITU_VEC, TIANDITU_OPTIONS).addTo(map);
      L.tileLayer(TIANDITU_CVA, TIANDITU_OPTIONS).addTo(map);
    }

    // pick 模式：点击地图放置标记
    if (mode === 'pick') {
      map.on('click', (e: L.LeafletMouseEvent) => {
        placeSingleMarker(map, e.latlng.lat, e.latlng.lng);
      });

      // 编辑模式预放置
      if (props.defaultPosition) {
        placeSingleMarker(
          map,
          props.defaultPosition.lat,
          props.defaultPosition.lng
        );
      }
    }

    setTimeout(() => map.invalidateSize(), 150);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      singleMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── browse 模式：同步标记 ──
  useEffect(() => {
    if (mode !== 'browse') return;
    const map = mapRef.current;
    if (!map) return;

    const { posts, selectedId, onMarkerClick } = props as BrowseProps;
    const current = markersRef.current;
    const newIds = new Set(posts.map((p) => p.id));

    for (const [id, m] of current) {
      if (!newIds.has(id)) {
        m.remove();
        current.delete(id);
      }
    }

    for (const post of posts) {
      const icon = post.id === selectedId ? activeIcon : defaultIcon;
      if (current.has(post.id)) {
        current.get(post.id)!.setIcon(icon);
      } else {
        const m = L.marker([post.latitude, post.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="cursor:pointer"><b>${post.dish_name}</b><br/><small>${post.store_name}</small></div>`
          );
        m.on('click', () => onMarkerClick?.(post));
        m.on('popupclick', () => onMarkerClick?.(post));
        current.set(post.id, m);
      }
    }

    if (posts.length === 1) {
      map.setView([posts[0].latitude, posts[0].longitude], 15);
    } else if (posts.length > 1) {
      map.fitBounds(
        L.latLngBounds(
          posts.map((p) => [p.latitude, p.longitude] as L.LatLngTuple)
        ),
        { padding: [30, 30], maxZoom: 14 }
      );
    }
  }, [
    mode === 'browse' ? (props as BrowseProps).posts : [],
    mode === 'browse' ? (props as BrowseProps).selectedId : null,
    mode === 'browse' ? (props as BrowseProps).onMarkerClick : undefined,
  ]);

  // ── pick 模式：编辑页异步同步位置 ──
  useEffect(() => {
    if (mode !== 'pick') return;
    const { defaultPosition } = props as PickProps;
    if (!defaultPosition || !mapRef.current) return;

    mapRef.current.setView(
      [defaultPosition.lat, defaultPosition.lng],
      15
    );
    placeSingleMarker(
      mapRef.current,
      defaultPosition.lat,
      defaultPosition.lng
    );
  }, [
    mode === 'pick' ? (props as PickProps).defaultPosition?.lat : undefined,
    mode === 'pick' ? (props as PickProps).defaultPosition?.lng : undefined,
  ]);

  return (
    <div ref={containerRef} style={{ height, width: '100%' }} />
  );
}
