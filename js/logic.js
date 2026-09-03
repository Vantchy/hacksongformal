/**
 * logic.js - 电子衣橱业务逻辑层
 * 
 * 后端逻辑层负责人：成员C（我）
 * 
 * 职责：所有纯业务逻辑、算法、数据模型
 *   - 衣物类型 / 厚度中文映射
 *   - 温度计算算法（厚度加权、适宜区间）
 *   - 穿搭适宜性分析
 *   - 数据验证
 *   - 预设样衣数据
 * 
 * 交互层（成员B）通过调用此文件的函数完成界面交互。
 * ============================================================
 */

// ==================== 常量 & 映射 ====================

/** 衣物类型中文映射 */
const TYPE_LABELS = {
  top: '上衣',
  outer: '外套',
  bottom: '裤子'
};

/** 厚度中文映射 */
const THICKNESS_LABELS = {
  1: '薄',
  2: '中等',
  3: '厚'
};

/** 温度计算参数 */
const TEMP_CONFIG = {
  baseTemp: 15,        // 基础舒适温度 °C
  baseThickness: 3,    // 基准厚度（3件衣物）
  factor: 3,           // 每差1厚度对应的温度偏移量
  threshold: 3         // 判定"偏薄/偏厚"的温差阈值
};

// ==================== 预设样衣数据 ====================

const PRESET_CLOTHES = [
  { name: '蓝色冲锋衣', type: 'outer', thickness: 3, color: '蓝色', imgUrl: 'assets/clothes/blue-coat.png' },
  { name: '白色T恤',    type: 'top',   thickness: 1, color: '白色', imgUrl: 'assets/clothes/white-tshirt.png' },
  { name: '黑色牛仔裤', type: 'bottom', thickness: 2, color: '黑色', imgUrl: 'assets/clothes/black-jeans.png' },
  { name: '粉色卫衣',   type: 'top',   thickness: 2, color: '粉色', imgUrl: 'assets/clothes/pink-hoodie.png' },
  { name: '灰色风衣',   type: 'outer', thickness: 3, color: '灰色', imgUrl: 'assets/clothes/gray-coat.png' },
  { name: '卡其短裤',   type: 'bottom', thickness: 1, color: '卡其', imgUrl: 'assets/clothes/khaki-shorts.png' }
];

// ==================== 温度计算算法 ====================

/**
 * 计算穿搭总厚度
 * @param {Array} clothesItems - 衣物对象数组
 * @returns {number} 总厚度值
 */
function calcTotalThickness(clothesItems) {
  return clothesItems.reduce((sum, item) => sum + item.thickness, 0);
}

/**
 * 计算适宜温度区间
 * @param {number} totalThickness - 穿搭总厚度
 * @returns {{ min: number, max: number }}
 */
function calcSuitableTempRange(totalThickness) {
  const { baseTemp, baseThickness, factor } = TEMP_CONFIG;
  const offset = (totalThickness - baseThickness) * factor;
  return {
    min: Math.round(baseTemp - offset),
    max: Math.round(baseTemp + offset)
  };
}

/**
 * 分析穿搭适宜性
 * @param {number} outsideTemp  - 室外温度
 * @param {number} totalThickness - 穿搭总厚度
 * @returns {{ advice: string, type: string, suitableMin: number, suitableMax: number }}
 *   type: 'thin' | 'fit' | 'thick'
 */
function analyzeOutfitSuitability(outsideTemp, totalThickness) {
  const { min, max } = calcSuitableTempRange(totalThickness);
  const { threshold } = TEMP_CONFIG;

  let advice, type;
  if (outsideTemp < min - threshold) {
    advice = '偏薄了！建议加厚衣物，小心着凉～';
    type = 'thin';
  } else if (outsideTemp > max + threshold) {
    advice = '偏厚了！建议减少衣物，避免闷热～';
    type = 'thick';
  } else {
    advice = '这套穿搭非常适合当前温度！';
    type = 'fit';
  }

  return { advice, type, suitableMin: min, suitableMax: max };
}

// ==================== 数据验证 ====================

/**
 * 验证衣物数据是否完整
 * @param {Object} data - 待验证的衣物数据
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateClothesData(data) {
  const errors = [];
  if (!data.name || !data.name.trim()) errors.push('衣物名称不能为空');
  if (!['top', 'outer', 'bottom'].includes(data.type)) errors.push('衣物类型无效');
  if (![1, 2, 3].includes(data.thickness)) errors.push('厚度值无效（应为1/2/3）');
  return { valid: errors.length === 0, errors };
}

/**
 * 验证穿搭数据是否可保存
 * @param {string[]} clothesIds - 衣物ID列表
 * @returns {Object} { valid: boolean, message: string }
 */
function validateOutfitSave(clothesIds) {
  if (!clothesIds || clothesIds.length === 0) {
    return { valid: false, message: '请先搭配一套穿搭再保存！' };
  }
  return { valid: true, message: '' };
}

// ==================== 工具函数 ====================

/**
 * 获取衣物类型的中文标签
 */
function getTypeLabel(type) {
  return TYPE_LABELS[type] || type;
}

/**
 * 获取厚度的中文标签
 */
function getThicknessLabel(thickness) {
  return THICKNESS_LABELS[thickness] || `厚度${thickness}`;
}

/**
 * 生成星级评分的字符串表示
 * @param {number} rating - 0-5 的评分
 * @returns {string} 如 "★★★★☆"
 */
function getStarsString(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}