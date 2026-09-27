// tests/compressor.test.mjs
import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { formatBytes, compressImage } from '../src/lib/imageCompressor.js';

describe('Image Compressor & Formatter Suite', () => {
  it('should format bytes accurately across units', () => {
    assert.equal(formatBytes(0), '0 B');
    assert.equal(formatBytes(500), '500 B');
    assert.equal(formatBytes(1024), '1 KB');
    assert.equal(formatBytes(1024 * 1024), '1 MB');
    assert.equal(formatBytes(2.5 * 1024 * 1024), '2.5 MB');
  });

  it('should reject invalid or null files', async () => {
    await assert.rejects(
      async () => {
        await compressImage(null);
      },
      { message: 'Invalid file provided for compression' }
    );
  });

  it('should pass-through SVG files without canvas corruption', async () => {
    const fakeSvg = new Blob(['<svg></svg>'], { type: 'image/svg+xml' });
    const res = await compressImage(fakeSvg);
    assert.equal(res.file.type, 'image/svg+xml');
    assert.equal(res.savedPercent, 0);
  });
});
