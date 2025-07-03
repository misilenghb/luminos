
'use client';

/**
 * Compresses an image represented by a data URI by resizing and converting to JPEG.
 * This is useful for ensuring generated images are under Firestore's 1MB document field limit.
 * @param dataUrl The original image data URI (e.g., from a canvas or file reader).
 * @param quality The quality of the compressed JPEG image (0.0 to 1.0).
 * @param maxWidth The maximum width of the output image.
 * @returns A promise that resolves with the compressed image data URI.
 */
export function compressImage(
  imageUrl: string,
  quality = 0.8,
  maxWidth = 800
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // 如果是跨域图片URL，先通过fetch获取并转换为blob
      if (imageUrl.startsWith('http') && !imageUrl.startsWith(window.location.origin)) {
        const response = await fetch(imageUrl, { mode: 'cors' });
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          processImage(dataUrl, quality, maxWidth, resolve, reject);
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read image blob'));
        };
        
        reader.readAsDataURL(blob);
      } else {
        // 如果是data URL或同域图片，直接处理
        processImage(imageUrl, quality, maxWidth, resolve, reject);
      }
    } catch (error) {
      console.error('Error in compressImage:', error);
      // 如果压缩失败，返回原始URL
      resolve(imageUrl);
    }
  });
}

function processImage(
  dataUrl: string,
  quality: number,
  maxWidth: number,
  resolve: (value: string) => void,
  reject: (reason?: any) => void
) {
  const image = new Image();
  
  // 设置crossOrigin以处理跨域图片
  image.crossOrigin = 'anonymous';
  
  image.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context for image compression.');
      }
      
      const scaleFactor = image.width > maxWidth ? maxWidth / image.width : 1;
      const newWidth = image.width * scaleFactor;
      const newHeight = image.height * scaleFactor;

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.drawImage(image, 0, 0, newWidth, newHeight);

      // Convert to JPEG for significant size reduction
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      resolve(compressedDataUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      // 如果处理失败，返回原始URL
      resolve(dataUrl);
    }
  };
  
  image.onerror = (error) => {
    console.error('Error loading image:', error);
    // 如果加载失败，返回原始URL
    resolve(dataUrl);
  };
  
  image.src = dataUrl;
}
