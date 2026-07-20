/**
 * 分类横向滚动筛选器
 */
import type { Category } from '../types';
import { CATEGORIES } from '../types';

interface Props {
  selected: string | null;
  onChange: (category: string | null) => void;
}

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-100">
      <div className="flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide">
        {/* "全部" 按钮 */}
        <button
          onClick={() => onChange(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
            selected === null
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 active:bg-gray-200'
          }`}
        >
          全部
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
              selected === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
