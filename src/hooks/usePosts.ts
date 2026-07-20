/**
 * 数据请求 Hooks
 */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { showToast } from '../lib/toast';
import type { Post, ApiResponse } from '../types';

/** 获取全部美食列表（支持分类筛选） */
export function usePosts(category?: string | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = category
        ? `/api/posts?category=${encodeURIComponent(category)}`
        : '/api/posts';
      const res = await api.get<ApiResponse<Post[]>>(url);
      setPosts(res.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载失败';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}

/** 获取单条美食记录 */
export function usePost(id: string | undefined) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<ApiResponse<Post>>(`/api/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '加载失败';
        setError(msg);
        showToast(msg, 'error');
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { post, loading, error };
}

/** 获取分类列表 */
export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<string[]>>('/api/categories')
      .then((res) => setCategories(res.data))
      .catch(() => showToast('加载分类失败', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
