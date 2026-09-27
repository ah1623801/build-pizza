// tests/security.test.mjs
import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  isValidImageBuffer,
  sanitizeString,
  isSafeId,
  isSafeOrderNumber,
  safeJsonParse
} from '../src/lib/security.js';

describe('Security & Input Sanitization Suite', () => {
  it('should strip malicious tags and invisible unicode from strings', () => {
    const dirty = '<script>alert("xss")</script>Hello World';
    const clean = sanitizeString(dirty, 100);
    assert.ok(!clean.includes('<script>'));
    assert.ok(!clean.includes('</script>'));
    assert.equal(clean, 'scriptalert("xss")/scriptHello World');
  });

  it('should enforce maximum length on sanitized strings', () => {
    const long = 'A'.repeat(500);
    const trimmed = sanitizeString(long, 50);
    assert.equal(trimmed.length, 50);
  });

  it('should validate safe alphanumeric and UUID IDs', () => {
    assert.equal(isSafeId('item-12345'), true);
    assert.equal(isSafeId('123e4567-e89b-12d3-a456-426614174000'), true);
    assert.equal(isSafeId('../../../etc/passwd'), false);
    assert.equal(isSafeId("1; DROP TABLE users; --"), false);
  });

  it('should validate order numbers format', () => {
    assert.equal(isSafeOrderNumber('FN-123456'), true);
    assert.equal(isSafeOrderNumber('FN-987654321'), true);
    assert.equal(isSafeOrderNumber('ORD-12345'), true);
    assert.equal(isSafeOrderNumber('FORNO-999'), true);
    assert.equal(isSafeOrderNumber('ORD-<script>'), false);
    assert.equal(isSafeOrderNumber('FN-abc'), false);
  });

  it('should safely parse JSON with fallback', () => {
    const valid = safeJsonParse('{"valid": true}', {});
    assert.deepEqual(valid, { valid: true });

    const fallback = safeJsonParse('INVALID JSON {{', ['fallback']);
    assert.deepEqual(fallback, ['fallback']);
  });

  it('should detect valid and spoofed image magic bytes', () => {
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
    assert.equal(isValidImageBuffer(pngBuffer, 'image/png', 'png'), true);

    // JPEG signature: FF D8 FF
    const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
    assert.equal(isValidImageBuffer(jpegBuffer, 'image/jpeg', 'jpg'), true);

    // Fake extension with text content should be rejected
    const fakeBuffer = Buffer.from('THIS IS JUST A TEXT FILE AND NOT AN IMAGE');
    assert.equal(isValidImageBuffer(fakeBuffer, 'image/jpeg', 'jpg'), false);
  });
});
