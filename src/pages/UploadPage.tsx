/**
 * 上传页 — 新建美食记录（需登录）
 */
import { Navigate } from 'react-router-dom';
import FoodForm from '../components/FoodForm';
import { useAuth } from '../hooks/useAuth';

export default function UploadPage() {
  const { user, loading } = useAuth();

  // 加载中避免闪烁
  if (loading) return null;

  // 未登录重定向
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col h-full">
      {/* 页面标题 */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-lg font-bold text-secondary">上传美食</h1>
        <span className="text-xs text-gray-400">👤 {user.username}</span>
      </div>

      {/* 表单 */}
      <FoodForm />
    </div>
  );
}
