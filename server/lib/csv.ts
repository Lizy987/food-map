/**
 * CSV 生成工具
 * 将 food_posts 数据导出为 CSV 字符串（含 BOM，兼容 Excel 中文）
 */

/** 需要导出的字段 */
const CSV_HEADERS = [
  '菜名',
  '店名',
  '分类',
  '地址',
  '纬度',
  '经度',
  '备注',
  '图片路径',
  '创建时间',
  '更新时间',
];

/** 转义 CSV 字段（处理逗号、引号、换行） */
function escapeField(value: unknown): string {
  const str = String(value ?? '');
  // 如果包含逗号、双引号或换行，需要用双引号包裹
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** 将记录数组转为 CSV 字符串 */
export function toCsv(rows: Record<string, unknown>[]): string {
  const headerLine = CSV_HEADERS.join(',');

  const dataLines = rows.map((row) =>
    [
      row.dish_name,
      row.store_name,
      row.category,
      row.address,
      row.latitude,
      row.longitude,
      row.note,
      row.image_url,
      row.created_at,
      row.updated_at,
    ]
      .map(escapeField)
      .join(',')
  );

  return [headerLine, ...dataLines].join('\n');
}
