/**
 * 确认对话框 — 删除确认等危险操作
 */
interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* 对话框 */}
      <div className="relative bg-white rounded-xl w-[85%] max-w-sm mx-auto shadow-xl animate-in">
        {/* 标题 */}
        <div className="px-5 pt-5 pb-2">
          <h3 className="text-base font-bold text-secondary">{title}</h3>
        </div>

        {/* 内容 */}
        <div className="px-5 pb-5">
          <p className="text-sm text-gray-500">{message}</p>
        </div>

        {/* 按钮 */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm text-gray-500 active:bg-gray-50 rounded-bl-xl transition-colors"
          >
            {cancelText}
          </button>
          <div className="w-px bg-gray-100" />
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm font-medium active:bg-red-50 rounded-br-xl transition-colors ${
              danger ? 'text-danger' : 'text-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
