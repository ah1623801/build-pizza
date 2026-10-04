// src/lib/imageCompressor.js
/**
 * Modern Client-Side Image Compressor using Canvas and WebP.
 * Efficiently reduces large product photos down to lightweight, crisp WebP files (usually < 100KB)
 * without sacrificing visual quality.
 */

export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82,
    outputType = 'image/webp',
    fallbackType = 'image/jpeg',
  } = options;

  if (!file || !(file instanceof Blob)) {
    throw new Error('Invalid file provided for compression');
  }

  // If it's already a tiny file (e.g. SVG or tiny icon < 30KB), return as is
  if (file.type === 'image/svg+xml' || file.size < 30 * 1024) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      ratio: 0,
      savedPercent: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate new dimensions maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve({
              file,
              originalSize: file.size,
              compressedSize: file.size,
              savedPercent: 0,
            });
          }

          // Enable high-quality scaling algorithms
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          const isOriginalPng = file.type === 'image/png' || (file.name && file.name.toLowerCase().endsWith('.png'));

          // Fill white background for transparent images converted to JPEG if fallback needed
          if (outputType === 'image/jpeg' && !isOriginalPng) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Check if browser supports WebP canvas export
          const isWebpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
          const mime = isOriginalPng ? 'image/png' : (isWebpSupported ? outputType : fallbackType);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve({
                  file,
                  originalSize: file.size,
                  compressedSize: file.size,
                  savedPercent: 0,
                });
              }

              // Determine appropriate filename with new extension
              const ext = isOriginalPng ? 'png' : (mime === 'image/webp' ? 'webp' : 'jpg');
              const baseName = (file.name || 'product').replace(/\.[^/.]+$/, '');
              const newFileName = `${baseName}.${ext}`;

              const compressedFile = new File([blob], newFileName, {
                type: mime,
                lastModified: Date.now(),
              });

              // If compressed file is somehow larger than original, stick with original
              if (compressedFile.size >= file.size && file.type.startsWith('image/')) {
                return resolve({
                  file,
                  originalSize: file.size,
                  compressedSize: file.size,
                  savedPercent: 0,
                });
              }

              const savedBytes = file.size - compressedFile.size;
              const savedPercent = Math.round((savedBytes / file.size) * 100);

              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: compressedFile.size,
                savedPercent,
                width,
                height,
              });
            },
            mime,
            quality
          );
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
