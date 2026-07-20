/**
 * 共享 Leaflet 地图初始化 Hook
 * 所有地图组件（MapView / MapPicker / MiniMap）共用同一套初始化逻辑
 */
import { useEffect, useRef, type RefObject } from 'react';
import L from 'leaflet';
import {
  TIANDITU_VEC,
  TIANDITU_CVA,
  OSM_URL,
  CARTODB_URL,
  TIANDITU_OPTIONS,
  OSM_OPTIONS,
  hasTiandituKey,
} from '../lib/tiles';

interface UseLeafletMapOptions {
  /** 初始中心点 */
  center: L.LatLngTuple;
  /** 初始缩放级别 */
  zoom: number;
  /** 是否显示缩放控件 */
  zoomControl?: boolean;
  /** 是否允许拖动 */
  dragging?: boolean;
  /** 是否允许滚轮缩放 */
  scrollWheelZoom?: boolean;
  /** 初始化后的回调（拿到 map 实例） */
  onReady?: (map: L.Map) => void;
  /** 是否延迟 invalidateSize（对滚动容器内的小地图设为 true） */
  deferredInvalidate?: boolean;
  /**
   * 重建 Key：当此值变化时，销毁旧地图并创建新地图
   * 用于 MiniMap 等 lat/lng 可能变化的场景
   */
  rebuildKey?: string;
}

export function useLeafletMap(
  containerRef: RefObject<HTMLDivElement | null>,
  options: UseLeafletMapOptions
) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 如果已存在实例，先销毁再重建
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const {
      center,
      zoom,
      zoomControl = true,
      dragging = true,
      scrollWheelZoom = true,
      onReady,
      deferredInvalidate = false,
    } = options;

    const map = L.map(container, {
      center,
      zoom,
      zoomControl,
      dragging,
      scrollWheelZoom,
      attributionControl: false,
    });

    // 瓦片底图（CartoDB + OSM 双源）
    L.tileLayer(CARTODB_URL, { maxZoom: 20, subdomains: 'abcd' }).addTo(map);
    L.tileLayer(OSM_URL, OSM_OPTIONS).addTo(map);
    if (hasTiandituKey) {
      L.tileLayer(TIANDITU_VEC, TIANDITU_OPTIONS).addTo(map);
      L.tileLayer(TIANDITU_CVA, TIANDITU_OPTIONS).addTo(map);
    }

    // 尺寸校准
    if (deferredInvalidate) {
      // 滚动容器内的小地图需要更长延迟
      setTimeout(() => map.invalidateSize(), 300);
      // 二次确保
      setTimeout(() => map.invalidateSize(), 600);
    } else {
      setTimeout(() => map.invalidateSize(), 150);
    }

    mapRef.current = map;
    onReady?.(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [options.rebuildKey]); // rebuildKey 变化时重建地图

  return mapRef;
}
