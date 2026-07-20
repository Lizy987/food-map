/**
 * 上传页 — 新建美食记录
 */
import FoodForm from '../components/FoodForm';

export default function UploadPage() {
  return (
    <div className="flex flex-col h-full">
      {/* 页面标题 */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-secondary">上传美食</h1>
      </div>

      {/* 表单 */}
      <FoodForm />
    </div>
  );
}
