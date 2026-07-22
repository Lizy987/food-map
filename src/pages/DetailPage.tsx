/**
 * 详情页 — 大图 + 信息 + 小地图 + 编辑/删除操作（仅 owner 可见）
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MiniMap from '../components/MiniMap';
import ConfirmDialog from '../components/ConfirmDialog';
import { usePost } from '../hooks/usePosts';
import { api } from '../lib/api';
import { showToast } from '../lib/toast';
import { useAuth } from '../hooks/useAuth';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { post, loading, error } = usePost(id);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await api.del(`/api/posts/${id}`);
      showToast('已删除', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '删除失败';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  // ── 加载中 ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">加载中...</span>
        </div>
      </div>
    );
  }

  // ── 错误/不存在 ──
  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
        <span className="text-lg">😕</span>
        <span>{error || '记录不存在'}</span>
        <button
          onClick={() => navigate('/')}
          className="text-primary text-sm underline mt-2"
        >
          返回首页
        </button>
      </div>
    );
  }

  // 是否是这条帖子的发布者
  const isOwner = user && post.user_id && post.user_id === user.id;

  return (
    <div className="flex flex-col h-full">
      {/* 可滚动内容 */}
      <div className="flex-1 overflow-y-auto">
        {/* 大图 */}
        <div className="w-full aspect-[4/3] bg-gray-100">
          <img
            src={post.image_url}
            alt={post.dish_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f0f0f0" width="400" height="300"/><text x="200" y="160" font-size="48" text-anchor="middle" fill="%23ccc">🍜</text></svg>';
            }}
          />
        </div>

        {/* 信息区 */}
        <div className="px-4 py-4 space-y-3">
          {/* 菜名 + 分类 */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-secondary">
              {post.dish_name}
            </h1>
            <span className="px-2 py-1 text-xs bg-orange-50 text-primary rounded-full">
              {post.category}
            </span>
          </div>

          {/* 店名 */}
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-sm">🏪 {post.store_name}</span>
          </div>

          {/* 发布者 */}
          <div className="text-xs text-gray-400">
            👤 由 {post.user_id ? '用户' : '匿名用户'}发布
          </div>

          {/* 地址 */}
          <div className="flex items-start gap-2 text-gray-500">
            <span className="text-sm mt-0.5">📍</span>
            <span className="text-sm">{post.address}</span>
          </div>

          {/* 备注 */}
          {post.note && (
            <div className="flex items-start gap-2 text-gray-500">
              <span className="text-sm mt-0.5">📝</span>
              <span className="text-sm">{post.note}</span>
            </div>
          )}

          {/* 时间 */}
          <div className="text-xs text-gray-400">
            创建于 {post.created_at}
          </div>

          {/* 小地图 */}
          <div>
            <p className="text-sm font-medium text-secondary mb-2">📍 位置</p>
            <MiniMap lat={post.latitude} lng={post.longitude} />
          </div>
        </div>
      </div>

      {/* 底部操作栏 — 仅 owner 可见 */}
      {isOwner && (
        <div className="flex-shrink-0 flex gap-3 px-4 py-3 bg-white border-t border-gray-100 safe-bottom">
          <button
            onClick={() => navigate(`/food/${post.id}/edit`)}
            className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium active:bg-orange-600 transition-colors"
          >
            ✏️ 编辑
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex-1 py-2.5 border border-gray-200 text-danger rounded-lg text-sm font-medium active:bg-red-50 transition-colors"
          >
            🗑️ 删除
          </button>
        </div>
      )}

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={showDelete}
        title="删除确认"
        message="确定删除这条美食记录吗？删除后无法恢复。"
        confirmText={deleting ? '删除中...' : '确认删除'}
        cancelText="取消"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
