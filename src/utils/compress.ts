/**
 * 前端图片压缩工具
 * 使用 Canvas API 将图片压缩至 ≤ 1MB
 */

/** 压缩图片，目标 ≤ 1MB，返回 Blob */
export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // 如果已经 ≤ 1MB，直接返回
    if (file.size <= 1 * 1024 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = calculateSize(img.width, img.height);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // 绘制缩放后的图片
      ctx.drawImage(img, 0, 0, width, height);

      // 迭代降低质量直到 ≤ 1MB
      compressToTarget(canvas, 0.8, 0.1, resolve, reject);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}

/** 计算等比缩放后的尺寸（最大宽高 1920px） */
function calculateSize(
  w: number,
  h: number
): { width: number; height: number } {
  const MAX = 1920;
  if (w <= MAX && h <= MAX) return { width: w, height: h };

  if (w > h) {
    return { width: MAX, height: Math.round((h / w) * MAX) };
  } else {
    return { width: Math.round((w / h) * MAX), height: MAX };
  }
}

/** 递归降低质量直到 ≤ 1MB */
function compressToTarget(
  canvas: HTMLCanvasElement,
  quality: number,
  minQuality: number,
  resolve: (blob: Blob) => void,
  reject: (err: Error) => void
) {
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        reject(new Error('压缩失败'));
        return;
      }

      // 成功压缩到目标大小，或质量已达下限
      if (blob.size <= 1 * 1024 * 1024 || quality <= minQuality) {
        resolve(blob);
        return;
      }

      // 继续降低质量
      compressToTarget(canvas, quality - 0.1, minQuality, resolve, reject);
    },
    'image/jpeg',
    quality
  );
}

/** 将 Blob 包装为 File 对象 */
export function blobToFile(blob: Blob, originalName: string): File {
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const name = originalName.replace(/\.[^.]+$/, `.${ext}`);
  return new File([blob], name, { type: blob.type });
}
