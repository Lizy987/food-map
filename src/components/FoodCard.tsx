/**
 * 美食列表卡片
 * 左图右文布局：缩略图 + 菜名 + 店名·分类 + 地址
 */
import type { Post } from '../types';

interface Props {
  post: Post;
  onClick?: () => void;
}

export default function FoodCard({ post, onClick }: Props) {
  return (
    <div
      className="flex gap-3 p-3 bg-white active:bg-gray-50 cursor-pointer border-b border-gray-100"
      onClick={onClick}
    >
      {/* 缩略图 */}
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={post.image_url}
          alt={post.dish_name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // 图片加载失败显示占位符
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%23f0f0f0" width="80" height="80"/><text x="40" y="45" font-size="24" text-anchor="middle" fill="%23ccc">🍜</text></svg>';
          }}
        />
      </div>

      {/* 信息区 */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* 菜名 */}
        <h3 className="text-base font-bold text-secondary truncate">
          {post.dish_name}
        </h3>

        {/* 店名 · 分类 */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500 truncate">
            {post.store_name}
          </span>
          <span className="flex-shrink-0 px-1.5 py-0.5 text-xs bg-orange-50 text-primary rounded">
            {post.category}
          </span>
        </div>

        {/* 地址 */}
        <p className="text-xs text-gray-400 truncate mt-1">
          📍 {post.address}
        </p>
      </div>
    </div>
  );
}
