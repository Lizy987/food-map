/**
 * API 请求封装
 * 统一错误处理，支持 JSON 和文件上传
 */
import type { ApiError, ApiResponse } from '../types';

/** 基础请求方法 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers:
      body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' },
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  };

  const res = await fetch(path, options);

  // CSV 导出：返回 blob
  if (path === '/api/posts/export/csv' && method === 'GET') {
    if (!res.ok) throw new Error('导出失败');
    return res.blob() as unknown as T;
  }

  const data = await res.json();

  if (!res.ok) {
    const err = data as ApiError;
    throw new Error(err.error?.message || `请求失败 (${res.status})`);
  }

  return data as T;
}

/** 类型化 API 方法 */
export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) =>
    request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
