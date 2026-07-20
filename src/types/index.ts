/** 美食记录 */
export interface Post {
  id: string;
  dish_name: string;
  store_name: string;
  category: string;
  address: string;
  image_url: string;
  latitude: number;
  longitude: number;
  note: string;
  created_at: string;
  updated_at: string;
}

/** 创建/更新请求体 */
export interface PostPayload {
  dish_name: string;
  store_name: string;
  category: string;
  address: string;
  image_url: string;
  latitude: number;
  longitude: number;
  note?: string;
}

/** 分类枚举 */
export const CATEGORIES = [
  '火锅',
  '川菜',
  '粤菜',
  '日料',
  '韩餐',
  '西餐',
  '烧烤',
  '小吃',
  '甜品',
  '咖啡',
  '其他',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** API 统一响应格式 */
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: number;
    message: string;
  };
}

/** 地图坐标 */
export interface LatLng {
  lat: number;
  lng: number;
}
