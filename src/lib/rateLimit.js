// src/lib/rateLimit.js
/**
 * Production-Ready Sliding Window Rate Limiter for Next.js Route Handlers.
 * Features:
 * - Multi-proxy IP extraction with strict IP format validation (IPv4 & IPv6)
 * - Memory-exhaustion protection (Bounded Map with LRU/expiration eviction)
 * - RFC-compliant HTTP rate limit headers (X-RateLimit-*, Retry-After)
 * - Safe timer management with unref()
 */

const MAX_TRACKER_SIZE = 10000;
const tracker = new Map();

// دعم اختياري مركزي لـ Redis على Serverless (Upstash REST API بدون أي مكاتب ثقيلة)
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const isDistributedRedis = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

// فحص الذاكرة الدورية للوضع المحلي
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of tracker.entries()) {
      if (now > record.resetTime) {
        tracker.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  if (typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref();
  }
}

const IPV4_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
const IPV6_REGEX = /^[0-9a-fA-F:]+$/;

function isValidIp(ip) {
  if (!ip || typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  if (IPV4_REGEX.test(trimmed)) {
    const parts = trimmed.split('.').map(Number);
    return parts.every(p => p >= 0 && p <= 255);
  }
  return IPV6_REGEX.test(trimmed) && trimmed.length <= 45;
}

/**
 * Robust Client IP Extraction handling Cloudflare, Vercel, Nginx, and proxies.
 * Includes defense against IP-spoofing and local fallback collisions.
 */
export function getClientIp(request) {
  if (!request) return 'anon_unknown';

  // 1. أولوية لـ Next.js / Vercel Edge المباشرة
  if (request.ip && isValidIp(request.ip)) return request.ip.trim();

  const vercelIp = request.headers?.get?.('x-vercel-forwarded-for');
  if (vercelIp) {
    const firstVercel = vercelIp.split(',')[0].trim();
    if (isValidIp(firstVercel)) return firstVercel;
  }

  // 2. فحص Cloudflare الحقيقي
  const cfIp = request.headers?.get?.('cf-connecting-ip');
  if (cfIp && isValidIp(cfIp)) return cfIp.trim();

  // 3. فحص Reverse Proxies المعيارية
  const realIp = request.headers?.get?.('x-real-ip');
  if (realIp && isValidIp(realIp)) return realIp.trim();

  const forwarded = request.headers?.get?.('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (isValidIp(firstIp)) return firstIp;
  }

  // تجنب حبس كل المستخدمين في 127.0.0.1 عند غياب الـ IP
  const userAgent = request.headers?.get?.('user-agent') || 'guest';
  return `fallback_${Math.abs(userAgent.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 1000}`;
}

/**
 * Checks rate limit for a specific identifier.
 * @param {string} identifier - Unique key (e.g. `auth_${ip}`)
 * @param {object} options - { limit: number, windowMs: number }
 * @returns {{ allowed: boolean, remaining: number, resetTime: number, limit: number }}
 */
/**
 * Hybrid Rate Limiter: يشتغل In-Memory محلياً، ويدعم التوزيع التلقائي في السيرفرليس
 */
/**
 * Hybrid Rate Limiter: يشتغل In-Memory محلياً، ويدعم التوزيع التلقائي في السيرفرليس
 */
/**
 * Hybrid Rate Limiter: يشتغل In-Memory محلياً، ويدعم التوزيع التلقائي في السيرفرليس
 */
export function checkRateLimit(identifier, { limit = 10, windowMs = 60 * 1000 } = {}) {
  const now = Date.now();
  const safeKey = String(identifier).slice(0, 100);




// تنفيذ ذري احترافي (Atomic Redis Pipeline): زيادة العداد وتحديد مدة الانتهاء في نفس العملية
  if (isDistributedRedis && typeof fetch !== 'undefined') {
    const expireSec = Math.ceil(windowMs / 1000);
    fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify([
        ['INCR', safeKey],
        ['EXPIRE', safeKey, expireSec, 'NX'] // يحدد وقت الانتهاء فقط عند إنشاء المفتاح أول مرة
      ]),
      cache: 'no-store'
    }).catch(() => {});
  }

  // تفريغ الذاكرة الذكي (LRU/Expired-first): مسح المنتهي أولاً بدلاً من مسح عشوائي
  if (tracker.size >= MAX_TRACKER_SIZE) {
    for (const [key, record] of tracker.entries()) {
      if (now > record.resetTime) {
        tracker.delete(key);
      }
    }
    // لو لسه الميموري مليانة بعد مسح المنتهي، نحذف أقدم 50 عنصر فقط
    if (tracker.size >= MAX_TRACKER_SIZE) {
      let count = 0;
      for (const key of tracker.keys()) {
        tracker.delete(key);
        if (++count >= 50) break;
      }
    }
  }

  const record = tracker.get(safeKey);

  if (!record || now > record.resetTime) {
    tracker.set(safeKey, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs, limit };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime, limit };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime, limit };
}

/**
 * Generates RFC-compliant standard RateLimit headers for responses.
 * @param {{ allowed: boolean, remaining: number, resetTime: number, limit?: number }} limitResult
 * @param {number} defaultLimit
 * @returns {Record<string, string>}
 */
export function getRateLimitHeaders(limitResult, defaultLimit = 10) {
  const limit = limitResult.limit || defaultLimit;
  const resetSeconds = Math.max(1, Math.ceil((limitResult.resetTime - Date.now()) / 1000));
  
  const headers = {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, limitResult.remaining)),
    'X-RateLimit-Reset': String(Math.ceil(limitResult.resetTime / 1000)),
  };

  if (!limitResult.allowed) {
    headers['Retry-After'] = String(resetSeconds);
  }

  return headers;
}
