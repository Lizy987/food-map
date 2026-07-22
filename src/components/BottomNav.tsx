import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/** 底部导航栏：首页 | 上传 | 我的 */
export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex flex-col items-center justify-center px-4 py-2 text-xs transition-colors ${
      isActive(path) ? 'text-primary' : 'text-gray-400'
    }`;

  return (
    <nav className="flex items-center justify-around h-14 bg-white border-t border-gray-200 safe-bottom">
      {/* 首页 */}
      <NavLink to="/" className={linkClass('/')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 mb-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <span>首页</span>
      </NavLink>

      {/* 上传 */}
      <NavLink to="/upload" className={linkClass('/upload')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 mb-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>上传</span>
      </NavLink>

      {/* 我的 / 登录 */}
      {user ? (
        <NavLink to="/profile" className={linkClass('/profile')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mb-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="truncate max-w-[4rem]">{user.username}</span>
        </NavLink>
      ) : (
        <NavLink to="/login" className={linkClass('/login')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mb-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>登录</span>
        </NavLink>
      )}
    </nav>
  );
}
