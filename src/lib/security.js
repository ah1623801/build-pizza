// src/lib/security.js
/**
 * FORNO Security Utility Module
 * Enterprise-grade validation, magic-byte inspection, sanitization, and prototype pollution defense.
 */

/**
 * Validates binary image signatures (Magic Bytes) to prevent file-type spoofing / polyglot attacks.
 * @param {Buffer|Uint8Array} buffer 
 * @param {string} mimeType 
 * @param {string} [ext] 
 * @returns {boolean}
 */
export function isValidImageBuffer(buffer, mimeType = '', ext = '') {
  if (!buffer || buffer.length < 12) return false;

  const cleanMime = mimeType.toLowerCase().trim();
  const cleanExt = ext.toLowerCase().trim();

  // 1. JPEG signature: FF D8 FF
  const isJpegMagic = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  if (isJpegMagic) {
    const isJpegMime = cleanMime === 'image/jpeg' || cleanMime === 'image/jpg';
    const isJpegExt = ['jpg', 'jpeg'].includes(cleanExt);
    return isJpegMime || isJpegExt;
  }

  // 2. PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const isPngMagic = (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
  );
  if (isPngMagic) {
    return cleanMime === 'image/png' || cleanExt === 'png';
  }

  // 3. WebP signature: 'RIFF' .... 'WEBP'
  const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  if (isRiff && isWebp) {
    return cleanMime === 'image/webp' || cleanExt === 'webp';
  }

  return false;
}

/**
 * Sanitizes user-supplied string by stripping script/HTML tags and null bytes.
 * @param {any} val 
 * @param {number} maxLen 
 * @returns {string}
 */
export function sanitizeString(val, maxLen = 255) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/\0/g, '') // strip null bytes
    .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '') // حذف حروف الـ Unicode الخفية وعكس النصوص المشبوهة
    .replace(/[<>]/g, '') // strip tag delimiters
    .trim()
    .slice(0, maxLen);
}

/**
 * Escapes HTML entities for safe inclusion into DOM strings or templates.
 * @param {any} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safe JSON parser with prototype pollution protection.
 * Drops dangerous keys: __proto__, constructor, prototype.
 * @param {string} raw 
 * @param {any} fallback 
 * @returns {any}
 */
export function safeJsonParse(raw, fallback = null) {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    return JSON.parse(raw, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });
  } catch {
    return fallback;
  }
}

/**
 * Validates Order Number format strictly (e.g. FN-123456 or FN-12345612)
 * @param {string} orderNo 
 * @returns {boolean}
 */
export function isSafeOrderNumber(orderNo) {
  if (!orderNo || typeof orderNo !== 'string') return false;
  return /^FN-\d{6,16}$/i.test(orderNo.trim());
}

/**
 * Validates ID strings to prevent path traversal or injection.
 * @param {string|number} id 
 * @returns {boolean}
 */
export function isSafeId(id) {
  if (id == null) return false;
  const str = String(id).trim();
  return /^[a-zA-Z0-9_-]{1,64}$/.test(str);
}
