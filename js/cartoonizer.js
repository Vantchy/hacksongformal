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

// ==================== 背景移除（方案二：自动抠图） ====================

/** 背景识别与抠图默认参数 */
const BG_REMOVE_CONFIG = {
  cornerSampleSize: 5,       // 每个角采样5x5像素
  tolerance: 40,              // 颜色容差（0~255，越大越激进）
  edgeBlendRadius: 2         // 边缘羽化半径
};

/**
 * 从图片四个角采样，识别背景主色
 * @param {HTMLCanvasElement} canvas
 * @returns {{ r: number, g: number, b: number }} 背景主色
 */
function getDominantCornerColor(canvas) {
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, w, h).data;
  const s = BG_REMOVE_CONFIG.cornerSampleSize;
  let totalR = 0, totalG = 0, totalB = 0, count = 0;

  // 采样四个角（左上、右上、左下、右下）
  const corners = [
    [0, 0], [w - s, 0],
    [0, h - s], [w - s, h - s]
  ];

  for (const [cx, cy] of corners) {
    for (let y = cy; y < cy + s && y < h; y++) {
      for (let x = cx; x < cx + s && x < w; x++) {
        const idx = (y * w + x) * 4;
        totalR += data[idx];
        totalG += data[idx + 1];
        totalB += data[idx + 2];
        count++;
      }
    }
  }

  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count)
  };
}

/**
 * 移除纯色背景（基于颜色容差，纯色背景效果最佳）
 * @param {HTMLCanvasElement} sourceCanvas - 原始图片 canvas
 * @param {object} [options] - 可选参数
 * @param {number} [options.tolerance] - 颜色容差（默认40）
 * @param {{r,g,b}} [options.bgColor] - 指定背景色（不传则自动从四个角采样）
 * @returns {HTMLCanvasElement} 背景透明后的 canvas
 */
function removeBackground(sourceCanvas, options = {}) {
  const w = sourceCanvas.width, h = sourceCanvas.height;
  const tolerance = options.tolerance ?? BG_REMOVE_CONFIG.tolerance;
  const bgColor = options.bgColor || getDominantCornerColor(sourceCanvas);

  // 创建输出 canvas
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - bgColor.r;
    const dg = data[i + 1] - bgColor.g;
    const db = data[i + 2] - bgColor.b;
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);

    if (distance < tolerance) {
      // 完全透明（背景）
      data[i + 3] = 0;
    } else if (distance < tolerance + BG_REMOVE_CONFIG.edgeBlendRadius * 10) {
      // 边缘羽化（半透明过渡）
      const alpha = (distance - tolerance) / (BG_REMOVE_CONFIG.edgeBlendRadius * 10);
      data[i + 3] = Math.round(255 * Math.min(1, alpha));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * 一键背景移除：自动识别背景色 + 抠图
 * @param {HTMLCanvasElement} sourceCanvas
 * @returns {HTMLCanvasElement}
 */
function autoRemoveBackground(sourceCanvas) {
  return removeBackground(sourceCanvas);
}

// ==================== 裁剪（方案一：手动框选） ====================

/**
 * 裁剪 Canvas 指定区域
 * @param {HTMLCanvasElement} sourceCanvas - 原始 canvas
 * @param {number} x - 裁剪区域左上角 x
 * @param {number} y - 裁剪区域左上角 y
 * @param {number} w - 裁剪宽度
 * @param {number} h - 裁剪高度
 * @returns {HTMLCanvasElement} 裁剪后的 canvas
 */
function cropCanvasRegion(sourceCanvas, x, y, w, h) {
  // 边界检查
  x = Math.max(0, Math.min(x, sourceCanvas.width - 1));
  y = Math.max(0, Math.min(y, sourceCanvas.height - 1));
  w = Math.min(w, sourceCanvas.width - x);
  h = Math.min(h, sourceCanvas.height - y);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w);
  canvas.height = Math.round(h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceCanvas, x, y, w, h, 0, 0, w, h);
  return canvas;
}

// ==================== 画笔描边提取（新方案：用户描边） ====================

/**
 * 根据用户描画的闭合轮廓，提取轮廓内的衣物区域（背景透明）
 * @param {HTMLCanvasElement} sourceCanvas - 原始图片 canvas
 * @param {Array<{x: number, y: number}>} points - 描边点数组（用户手绘轨迹）
 * @param {number} [margin] - 裁剪边距（像素，默认10）
 * @returns {HTMLCanvasElement} 提取后的衣物 canvas（已裁剪到最小包围盒）
 */
function extractByOutline(sourceCanvas, points, margin = 10) {
  if (!points || points.length < 3) {
    throw new Error('描边点太少，请画一个完整的闭合轮廓');
  }

  const w = sourceCanvas.width, h = sourceCanvas.height;

  // 1. 创建全尺寸蒙版 canvas
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const maskCtx = maskCanvas.getContext('2d');

  // 黑色背景
  maskCtx.fillStyle = '#000';
  maskCtx.fillRect(0, 0, w, h);

  // 绘制闭合路径（白色填充）
  maskCtx.beginPath();
  maskCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    maskCtx.lineTo(points[i].x, points[i].y);
  }
  maskCtx.closePath();
  maskCtx.fillStyle = '#fff';
  maskCtx.fill();

  // 2. 将蒙版应用到原始图片
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = w;
  resultCanvas.height = h;
  const resultCtx = resultCanvas.getContext('2d');

  // 先绘制原始图片
  resultCtx.drawImage(sourceCanvas, 0, 0);

  // 获取像素数据
  const imageData = resultCtx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const maskData = maskCtx.getImageData(0, 0, w, h).data;

  // 蒙版区域外的像素设为透明
  for (let i = 0; i < data.length; i += 4) {
    if (maskData[i] === 0) {
      // 蒙版黑色 → 透明
      data[i + 3] = 0;
    }
  }

  resultCtx.putImageData(imageData, 0, 0);

  // 3. 计算轨迹包围盒，裁剪到最小范围
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  // 加边距，边界检查
  const cropX = Math.max(0, minX - margin);
  const cropY = Math.max(0, minY - margin);
  const cropW = Math.min(w - cropX, maxX - minX + margin * 2);
  const cropH = Math.min(h - cropY, maxY - minY + margin * 2);

  return cropCanvasRegion(resultCanvas, cropX, cropY, cropW, cropH);
}