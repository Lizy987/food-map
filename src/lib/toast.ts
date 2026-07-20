/**
 * 轻量 Toast 通知工具
 * 无依赖，纯 DOM 操作
 */

type ToastType = 'success' | 'error' | 'info';

/** 显示 Toast 提示（自动 2.5s 消失） */
export function showToast(message: string, type: ToastType = 'info') {
  const colors: Record<ToastType, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-gray-700',
  };

  const toast = document.createElement('div');
  toast.className = `fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-lg text-white text-sm shadow-lg transition-all duration-300 ${colors[type]}`;
  toast.style.maxWidth = '90vw';
  toast.textContent = message;

  document.body.appendChild(toast);

  // 动画入场
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
  });

  // 自动移除
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -10px)';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2500);
}
