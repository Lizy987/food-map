/**
 * 个人中心 — 显示用户信息 + 退出登录
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-secondary">个人中心</h1>
      </div>

      {/* 用户信息 */}
      <div className="flex-1 px-4 py-8">
        <div className="flex flex-col items-center">
          {/* 头像 */}
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">👤</span>
          </div>

          {/* 用户名 */}
          <h2 className="text-lg font-bold text-secondary mb-2">
            {user?.username}
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            欢迎使用美食地图
          </p>

          {/* 统计（占位，后续可扩展） */}
          <div className="w-full max-w-xs bg-gray-50 rounded-lg p-4 mb-8">
            <p className="text-center text-sm text-gray-500">
              📸 分享美食，记录美味时刻
            </p>
          </div>

          {/* 退出按钮 */}
          <button
            onClick={handleLogout}
            className="w-full max-w-xs py-3 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium active:bg-gray-50 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
