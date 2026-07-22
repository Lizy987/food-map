/**
 * 编辑页 — 预填已有数据（仅 owner 可访问）
 */
import { useParams, useNavigate } from 'react-router-dom';
import FoodForm from '../components/FoodForm';
import { usePost } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../lib/toast';

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { post, loading, error } = usePost(id);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">加载中...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
        <span>{error || '记录不存在'}</span>
        <button
          onClick={() => navigate('/')}
          className="text-primary text-sm underline"
        >
          返回首页
        </button>
      </div>
    );
  }

  // 未登录 → 跳转登录
  if (!user) {
    showToast('请先登录', 'error');
    navigate('/login', { replace: true });
    return null;
  }

  // 非 owner → 拒绝
  if (post.user_id && post.user_id !== user.id) {
    showToast('只能编辑自己上传的美食', 'error');
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* 页面标题 */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-secondary">编辑美食</h1>
      </div>

      {/* 预填表单 */}
      <FoodForm post={post} />
    </div>
  );
}
