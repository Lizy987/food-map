/**
 * 登录/注册页
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../lib/toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // false = 登录模式，true = 注册模式
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      showToast('请填写用户名和密码', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(username.trim(), password);
        showToast('注册成功', 'success');
      } else {
        await login(username.trim(), password);
        showToast('登录成功', 'success');
      }
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '操作失败';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      {/* Logo */}
      <div className="text-5xl mb-4">🍜</div>
      <h1 className="text-xl font-bold text-secondary mb-8">美食地图</h1>

      {/* 切换标签 */}
      <div className="flex w-full max-w-xs mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setIsRegister(false)}
          className={`flex-1 py-2 text-sm rounded-md transition-colors ${
            !isRegister ? 'bg-white shadow text-primary font-medium' : 'text-gray-500'
          }`}
        >
          登录
        </button>
        <button
          onClick={() => setIsRegister(true)}
          className={`flex-1 py-2 text-sm rounded-md transition-colors ${
            isRegister ? 'bg-white shadow text-primary font-medium' : 'text-gray-500'
          }`}
        >
          注册
        </button>
      </div>

      {/* 表单 */}
      <div className="w-full max-w-xs space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="用户名"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium text-sm active:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isRegister ? '注册中...' : '登录中...'}
            </span>
          ) : isRegister ? (
            '注册'
          ) : (
            '登录'
          )}
        </button>
      </div>
    </div>
  );
}
