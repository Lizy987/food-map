/**
 * 编辑页 — 预填已有数据，复用 FoodForm
 */
import { useParams, useNavigate } from 'react-router-dom';
import FoodForm from '../components/FoodForm';
import { usePost } from '../hooks/usePosts';

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { post, loading, error } = usePost(id);

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
