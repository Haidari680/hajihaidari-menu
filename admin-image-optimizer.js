// Automatic image optimization for admin uploads.
// Keeps aspect ratio, caps dimensions, converts raster images to WebP, and preserves transparency.
(() => {
  const originalUpload = window.upload;
  if (typeof originalUpload !== 'function') return;

  const optimizeImage = (file) => new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const maxSize = 1400;
        const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: true });
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return resolve(file);
          const base = file.name.replace(/\.[^.]+$/, '') || 'image';
          resolve(new File([blob], base + '.webp', { type: 'image/webp', lastModified: file.lastModified }));
        }, 'image/webp', 0.90);
      } catch (_) {
        URL.revokeObjectURL(url);
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });

  window.upload = async (file) => {
    const optimized = await optimizeImage(file);
    return originalUpload(optimized);
  };
})();
