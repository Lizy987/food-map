/**
 * 空数据占位组件
 */
import { useNavigate } from 'react-router-dom';

export default function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* 图标 */}
      <div className="text-6xl mb-4">🍜</div>

      {/* 文案 */}
      <p className="text-gray-400 text-sm mb-4">还没有美食记录，去上传第一个吧！</p>

      {/* CTA 按钮 */}
      <button
        onClick={() => navigate('/upload')}
        className="px-6 py-2.5 bg-primary text-white rounded-full text-sm active:bg-orange-600 transition-colors"
      >
        上传美食
      </button>
    </div>
  );
}
