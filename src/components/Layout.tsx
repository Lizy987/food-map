import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

/** 全局布局：页面内容 + 底部导航栏 */
export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-bg">
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
