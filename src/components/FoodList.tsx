/**
 * 美食列表 — 时间倒序，可滚动
 */
import { useNavigate } from 'react-router-dom';
import type { Post } from '../types';
import FoodCard from './FoodCard';
import EmptyState from './EmptyState';

interface Props {
  posts: Post[];
}

export default function FoodList({ posts }: Props) {
  const navigate = useNavigate();

  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="divide-y divide-gray-50">
      {posts.map((post) => (
        <FoodCard
          key={post.id}
          post={post}
          onClick={() => navigate(`/food/${post.id}`)}
        />
      ))}
    </div>
  );
}
