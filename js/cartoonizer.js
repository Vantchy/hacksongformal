/**
 * cartoonizer.js - 拍照上传 + Canvas 卡通化处理（逻辑层）
 * 
 * 后端逻辑层负责人：成员C（我）
 * 职责：拍照/上传 → Canvas 卡通化滤镜 → 输出可保存的图像数据
 * 
 * 交互层（成员B）通过调用此文件的函数完成上传交互。
 * 前端（成员A）负责 UI 样式，逻辑层不依赖 DOM。
 * ============================================================
 */

// ==================== 常量 ====================

/** 卡通化参数 */
const CARTOON_CONFIG = {
  maxWidth: 1024,           // 最大宽度（压缩）
  maxHeight: 1024,          // 最大高度（压缩）
  quantizeLevels: 6,        // 颜色量化等级（越小越卡通）
  blurRadius: 3,            // 模糊半径
  edgeThreshold: 30,         // 边缘检测阈值
  edgeStrength: 0.7          // 边缘叠加强度
};

// ==================== 核心 API ====================

/**
 * 打开摄像头拍照
 * @returns {Promise<HTMLVideoElement>} 视频流
 */
function openCamera() {
  return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
}

/**
 * 从摄像头拍照（截取当前帧）
 * @param {HTMLVideoElement} video - 视频元素
 * @param {number} maxWidth - 最大宽度
 * @returns {HTMLCanvasElement} 包含截图帧的 canvas
 */
function captureFromCamera(video, maxWidth = CARTOON_CONFIG.maxWidth) {
  const canvas = document.createElement('canvas');
  const scale = Math.min(maxWidth / video.videoWidth, 1);
  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * 从文件读取图片到 Canvas
 * @param {File} file - 用户选择的图片文件
 * @returns {Promise<HTMLCanvasElement>} 包含图片的 canvas
 */
function loadImageToCanvas(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(
          CARTOON_CONFIG.maxWidth / img.width,
          CARTOON_CONFIG.maxHeight / img.height,
          1
        );
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 卡通化处理（核心算法）
 * @param {HTMLCanvasElement} sourceCanvas - 原始图片 canvas
 * @returns {HTMLCanvasElement} 卡通化处理后的 canvas
 */
function cartoonizeImage(sourceCanvas) {
  const { quantizeLevels, blurRadius, edgeThreshold, edgeStrength } = CARTOON_CONFIG;

  // 1. 颜色量化版
  const quantizedCanvas = applyColorQuantize(sourceCanvas, quantizeLevels);
  // 2. 模糊处理（平滑细节）
  const blurredCanvas = applyMedianBlur(quantizedCanvas, blurRadius);
  // 3. 边缘检测
  const edgeCanvas = detectEdges(sourceCanvas, edgeThreshold);
  // 4. 边缘叠加到模糊后的量化图
  const resultCanvas = compositeEdges(blurredCanvas, edgeCanvas, edgeStrength);

  return resultCanvas;
}

/**
 * 完整流程：拍照/上传 → 卡通化 → 返回 dataURL
 * @param {File} [file] - 图片文件（选填，不传则打开摄像头）
 * @returns {Promise<string>} 卡通化后的图片 dataURL
 */
async function captureAndCartoonize(file) {
  let canvas;
  if (file) {
    canvas = await loadImageToCanvas(file);
  } else {
    const stream = await openCamera();
    // 需要交互层创建 video 元素，这里只返回逻辑
    throw new Error('摄像头模式请使用 openCamera() + captureFromCamera() 组合');
  }
  return cartoonizeImage(canvas).toDataURL('image/png');
}

// ==================== 滤镜算法（内部） ====================

/**
 * 颜色量化：减少颜色数量，产生卡通色块效果
 */
function applyColorQuantize(sourceCanvas, levels) {
  const w = sourceCanvas.width, h = sourceCanvas.height;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const step = 256 / levels;

  for (let i = 0; i < data.length; i += 4) {
    // 对 RGB 三个通道分别做量化
    data[i]     = Math.round(data[i]     / step) * step;   // R
    data[i + 1] = Math.round(data[i + 1] / step) * step;   // G
    data[i + 2] = Math.round(data[i + 2] / step) * step;   // B
    // Alpha 通道不变
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * 中值模糊：去噪同时保留边缘
 */
function applyMedianBlur(sourceCanvas, radius) {
  const w = sourceCanvas.width, h = sourceCanvas.height;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0);

  const srcData = ctx.getImageData(0, 0, w, h);
  const srcPixels = srcData.data;
  const dstData = ctx.createImageData(w, h);
  const dstPixels = dstData.data;

  const size = radius * 2 + 1;
  const half = radius;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const r = [], g = [], b = [];
      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const px = Math.min(w - 1, Math.max(0, x + kx));
          const py = Math.min(h - 1, Math.max(0, y + ky));
          const idx = (py * w + px) * 4;
          r.push(srcPixels[idx]);
          g.push(srcPixels[idx + 1]);
          b.push(srcPixels[idx + 2]);
        }
      }
      r.sort((a, b) => a - b);
      g.sort((a, b) => a - b);
      b.sort((a, b) => a - b);
      const mid = Math.floor(r.length / 2);
      const dstIdx = (y * w + x) * 4;
      dstPixels[dstIdx]     = r[mid];
      dstPixels[dstIdx + 1] = g[mid];
      dstPixels[dstIdx + 2] = b[mid];
      dstPixels[dstIdx + 3] = 255;
    }
  }

  ctx.putImageData(dstData, 0, 0);
  return canvas;
}

/**
 * Sobel 边缘检测：提取轮廓线
 */
function detectEdges(sourceCanvas, threshold) {
  const w = sourceCanvas.width, h = sourceCanvas.height;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0);

  const srcData = ctx.getImageData(0, 0, w, h);
  const srcPixels = srcData.data;
  const dstData = ctx.createImageData(w, h);
  const dstPixels = dstData.data;

  // 先转灰度
  const gray = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * srcPixels[idx] + 0.587 * srcPixels[idx + 1] + 0.114 * srcPixels[idx + 2];
  }

  // Sobel 算子
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0, gy = 0;
      let idx = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const g = gray[(y + ky) * w + (x + kx)];
          gx += g * sobelX[idx];
          gy += g * sobelY[idx];
          idx++;
        }
      }
      const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      const edge = magnitude > threshold ? 0 : 255; // 黑色边缘，白色背景
      const dstIdx = (y * w + x) * 4;
      dstPixels[dstIdx]     = edge;
      dstPixels[dstIdx + 1] = edge;
      dstPixels[dstIdx + 2] = edge;
      dstPixels[dstIdx + 3] = 255;
    }
  }

  ctx.putImageData(dstData, 0, 0);
  return canvas;
}

/**
 * 边缘叠加：在卡通色块上叠加黑色轮廓线
 */
function compositeEdges(colorCanvas, edgeCanvas, strength) {
  const w = colorCanvas.width, h = colorCanvas.height;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  // 先绘制颜色图
  ctx.drawImage(colorCanvas, 0, 0);

  // 叠加边缘（黑色半透明）
  ctx.globalAlpha = strength;
  ctx.drawImage(edgeCanvas, 0, 0);
  ctx.globalAlpha = 1.0;

  return canvas;
}

// ==================== 导出工具 ====================

/**
 * 将 Canvas 转换为 dataURL（用于保存到 localStorage 或显示）
 */
function canvasToDataURL(canvas) {
  return canvas.toDataURL('image/png');
}

/**
 * 从 dataURL 创建可展示的图片元素
 */
function createImageFromDataURL(dataURL) {
  const img = new Image();
  img.src = dataURL;
  return img;
}