/** UUID v4 生成（使用 crypto.randomUUID） */
export function generateId(): string {
  return crypto.randomUUID();
}
