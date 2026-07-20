/**
 * 美食表单 — 上传/编辑页复用
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodMap from './FoodMap';
import { compressImage, blobToFile } from '../utils/compress';
import { api } from '../lib/api';
import { showToast } from '../lib/toast';
import { CATEGORIES } from '../types';
import type { Post, PostPayload, LatLng, ApiResponse } from '../types';

interface Props {
  /** 编辑模式：传入已有记录以预填 */
  post?: Post | null;
}

export default function FoodForm({ post }: Props) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!post;

  // ── 表单状态 ──
  const [dishName, setDishName] = useState(post?.dish_name || '');
  const [storeName, setStoreName] = useState(post?.store_name || '');
  const [category, setCategory] = useState(post?.category || '');
  const [address, setAddress] = useState(post?.address || '');
  const [note, setNote] = useState(post?.note || '');
  const [position, setPosition] = useState<LatLng | null>(
    post ? { lat: post.latitude, lng: post.longitude } : null
  );
  const [hasPicked, setHasPicked] = useState(!!post);

  // 图片相关
  const [imageUrl, setImageUrl] = useState(post?.image_url || '');
  const [imagePreview, setImagePreview] = useState(post?.image_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── 图片选择 + 压缩 + 上传 ──
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 本地预览
    setImagePreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      showToast('正在压缩图片...', 'info');

      // 压缩
      const compressedBlob = await compressImage(file);
      const compressedFile = blobToFile(compressedBlob, file.name);

      // 上传
      const formData = new FormData();
      formData.append('file', compressedFile);

      const res = await api.post<ApiResponse<{ url: string }>>(
        '/api/upload',
        formData
      );
      setImageUrl(res.data.url);
      setSelectedFile(compressedFile);
      showToast('图片上传成功', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '上传失败';
      showToast(msg, 'error');
      setImagePreview(post?.image_url || '');
    } finally {
      setUploading(false);
    }
  };

  // ── 表单校验 ──
  const validate = (): string | null => {
    if (!dishName.trim()) return '请输入菜名';
    if (!storeName.trim()) return '请输入店名';
    if (!category) return '请选择分类';
    if (!address.trim()) return '请输入地址';
    if (!imageUrl) return '请选择图片';
    if (!position || !hasPicked) return '请在地图上选择位置';
    return null;
  };

  // ── 提交 ──
  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      showToast(error, 'error');
      return;
    }

    const payload: PostPayload = {
      dish_name: dishName.trim(),
      store_name: storeName.trim(),
      category,
      address: address.trim(),
      image_url: imageUrl,
      latitude: position!.lat,
      longitude: position!.lng,
      note: note.trim(),
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/api/posts/${post!.id}`, payload);
        showToast('更新成功', 'success');
        navigate(`/food/${post!.id}`);
      } else {
        const res = await api.post<ApiResponse<Post>>('/api/posts', payload);
        showToast('发布成功！', 'success');
        navigate(`/food/${res.data.id}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '提交失败';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 可滚动表单区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* 图片选择 */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer active:bg-gray-100"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="预览"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <svg
                className="w-10 h-10 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm">点击选择美食照片</span>
              <span className="text-xs mt-1">支持 JPG/PNG/WebP，自动压缩至 ≤1MB</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* 菜名 */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            菜名 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder="如：红油抄手"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* 店名 */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            店名 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="如：巷子里的店"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* 分类 */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            分类 <span className="text-danger">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
          >
            <option value="" disabled>
              请选择分类
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 地址 */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            地址 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="如：北京市东城区xx路xx号"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* 地图选点 */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            地图选点 <span className="text-danger">*</span>
          </label>
          <FoodMap
            mode="pick"
            height="14rem"
            defaultPosition={position}
            onPositionChange={setPosition}
            hasPicked={hasPicked}
            onPickStatusChange={setHasPicked}
          />
        </div>

        {/* 备注 */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            备注
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="口味、价格、推荐理由..."
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
          />
        </div>
      </div>

      {/* 提交按钮（固定底部） */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-100 safe-bottom">
        <button
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium text-sm active:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              提交中...
            </span>
          ) : isEdit ? (
            '保存修改'
          ) : (
            '发布美食'
          )}
        </button>
      </div>
    </div>
  );
}
