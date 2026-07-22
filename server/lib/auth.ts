/**
 * JWT 工具 + 认证中间件
 * 使用 Bun 内置 Web Crypto API，零外部依赖
 */
import type { Context, Next } from 'hono';

// JWT 密钥（生产环境应通过环境变量注入）
const JWT_SECRET = process.env.JWT_SECRET || 'food-map-secret-change-me';

// ── Base64 编解码 ──

function base64urlEncode(data: string): string {
  return btoa(data).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

// ── JWT 签名/验证 ──

/** 创建 JWT token */
export async function signToken(userId: string): Promise<string> {
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64urlEncode(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600, // 7天过期
    })
  );

  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );
  const sig = base64urlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${data}.${sig}`;
}

/** 验证 JWT token，返回 userId，失败返回 null */
export async function verifyToken(token: string): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    // 验证签名
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = Uint8Array.from(
      base64urlDecode(sigB64),
      (c) => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(data)
    );

    if (!valid) return null;

    // 解码 payload 检查过期
    const payload = JSON.parse(base64urlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // token 已过期
    }

    return payload.sub as string;
  } catch {
    return null;
  }
}

// ── Hono 中间件 ──

/** 强制登录中间件：未登录返回 401 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: { code: 401, message: '请先登录' } }, 401);
  }

  const userId = await verifyToken(authHeader.slice(7));
  if (!userId) {
    return c.json({ error: { code: 401, message: '登录已过期，请重新登录' } }, 401);
  }

  c.set('userId', userId);
  await next();
}
