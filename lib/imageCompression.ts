/**
 * 圖片壓縮工具
 * 將圖片壓縮到指定大小（預設200KB）
 */

interface CompressionResult {
  originalBase64: string;
  compressedBase64: string;
  originalSize: number;
  compressedSize: number;
  originalFile: File;
  compressedFile: File;
}

/**
 * 將檔案轉換為base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 從base64計算檔案大小（bytes）
 */
function getBase64Size(base64: string): number {
  // 去除data:image/...;base64,前綴
  const base64Data = base64.split(',')[1] || base64;
  // Base64每4個字符代表3個bytes，但需要考慮padding
  return Math.floor((base64Data.length * 3) / 4);
}

/**
 * 將base64轉換為File對象
 */
function base64ToFile(base64: string, fileName: string, mimeType: string): File {
  const arr = base64.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], fileName, { type: mimeType });
}

/**
 * 載入圖片到Image對象
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 計算壓縮後的尺寸，保持長寬比
 */
function calculateCompressedSize(originalWidth: number, originalHeight: number, targetSize: number): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  if (originalWidth > originalHeight) {
    return {
      width: Math.min(targetSize, originalWidth),
      height: Math.min(targetSize, originalWidth) / aspectRatio
    };
  } else {
    return {
      width: Math.min(targetSize, originalHeight) * aspectRatio,
      height: Math.min(targetSize, originalHeight)
    };
  }
}

/**
 * 將圖片繪製到Canvas並輸出為base64
 */
function canvasToBase64(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number = 0.8,
  format: string = 'image/jpeg'
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('無法創建Canvas context');
  }
  
  canvas.width = width;
  canvas.height = height;
  
  // 繪製圖片
  ctx.drawImage(img, 0, 0, width, height);
  
  // 輸出為base64
  return canvas.toDataURL(format, quality);
}

/**
 * 壓縮圖片到指定大小
 */
export async function compressImage(
  file: File,
  maxSize: number = 200 * 1024, // 預設200KB
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<CompressionResult> {
  try {
    // 獲取原始base64
    const originalBase64 = await fileToBase64(file);
    const originalSize = getBase64Size(originalBase64);
    
    // 如果原始檔案已經小於目標大小，直接返回
    if (originalSize <= maxSize) {
      return {
        originalBase64,
        compressedBase64: originalBase64,
        originalSize,
        compressedSize: originalSize,
        originalFile: file,
        compressedFile: file
      };
    }
    
    // 載入圖片
    const img = await loadImage(originalBase64);
    
    // 計算初始壓縮尺寸
    let { width, height } = calculateCompressedSize(img.width, img.height, Math.max(maxWidth, maxHeight));
    
    // 嘗試不同的壓縮參數
    let compressedBase64 = '';
    let compressedSize = maxSize + 1; // 初始值大於目標大小
    
    // 首先嘗試調整質量
    for (let q = 0.8; q >= 0.1; q -= 0.1) {
      compressedBase64 = canvasToBase64(img, width, height, q);
      compressedSize = getBase64Size(compressedBase64);
      
      if (compressedSize <= maxSize) {
        break;
      }
    }
    
    // 如果調整質量還不夠，開始縮小尺寸
    if (compressedSize > maxSize) {
      const sizeReductionFactor = 0.8;
      
      while (compressedSize > maxSize && (width > 100 || height > 100)) {
        width *= sizeReductionFactor;
        height *= sizeReductionFactor;
        
        // 重新嘗試不同質量
        for (let q = 0.8; q >= 0.1; q -= 0.1) {
          compressedBase64 = canvasToBase64(img, Math.floor(width), Math.floor(height), q);
          compressedSize = getBase64Size(compressedBase64);
          
          if (compressedSize <= maxSize) {
            break;
          }
        }
        
        if (compressedSize <= maxSize) {
          break;
        }
      }
    }
    
    // 創建壓縮後的File對象
    const compressedFileName = file.name.replace(/\.[^.]+$/, '_compressed$&');
    const compressedFile = base64ToFile(compressedBase64, compressedFileName, file.type);
    
    return {
      originalBase64,
      compressedBase64,
      originalSize,
      compressedSize,
      originalFile: file,
      compressedFile
    };
    
  } catch (error) {
    console.error('圖片壓縮失敗:', error);
    throw new Error('圖片壓縮失敗');
  }
}

/**
 * 格式化檔案大小顯示
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}