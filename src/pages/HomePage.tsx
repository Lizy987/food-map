/**
 * 首页 — 地图 + 分类筛选 + 列表 + CSV 导出
 * 地图始终渲染（不受 loading 影响），确保 Leaflet 初始化不受条件渲染干扰
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodMap from '../components/FoodMap';
import CategoryFilter from '../components/CategoryFilter';
import FoodList from '../components/FoodList';
import { usePosts } from '../hooks/usePosts';
import { api } from '../lib/api';
import { showToast } from '../lib/toast';
import type { Post } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // 从 API 获取数据
  const { posts, loading, error } = usePosts(selectedCategory);

  // 点击地图标记 → 跳转详情
  const handleMarkerClick = useCallback(
    (post: Post) => {
      navigate(`/food/${post.id}`);
    },
    [navigate]
  );

  // CSV 导出
  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await api.get<Blob>('/api/posts/export/csv');
      const url = URL.createObjectURL(blob as unknown as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `美食地图_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('CSV 导出成功', 'success');
    } catch {
      showToast('导出失败，请重试', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* 地图区域 ≈ 55% 屏幕高度 — 始终渲染 */}
      <div className="h-[55vh] w-full flex-shrink-0 relative">
        <FoodMap
          mode="browse"
          posts={posts}
          selectedId={selectedId}
          onMarkerClick={handleMarkerClick}
        />

        {/* loading 遮罩层（覆盖在地图上） */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-[500]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">加载中...</span>
            </div>
          </div>
        )}

        {/* 错误提示（覆盖在地图上） */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-[500] gap-2">
            <span className="text-sm text-gray-500">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="text-primary text-sm underline"
            >
              重试
            </button>
          </div>
        )}
      </div>

      {/* 分类筛选 */}
      <CategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />

      {/* 列表区域 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <FoodList posts={posts} />
        )}
      </div>

      {/* CSV 导出浮动按钮 */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="absolute bottom-4 right-4 z-10 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:bg-orange-600 transition-colors disabled:opacity-50"
        title="导出 CSV"
      >
        {exporting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
