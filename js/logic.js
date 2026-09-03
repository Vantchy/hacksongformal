/**
 * logic.js - 电子衣橱 业务逻辑层
 * 
 * 后端逻辑层负责人：成员C（我）
 * 
 * 职责：所有纯业务逻辑、算法、数据模型
 *   - 温度推荐引擎（分层加权 + 材质系数）
 *   - 穿搭适宜性分析
 *   - 基础穿搭校验（禁止奇葩组合）
 *   - 数据验证
 *   - 预设样衣数据（Mock 10件）
 *   - 映射工具函数
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

/** 材质中文映射 */
const MATERIAL_LABELS = {
  cotton: '棉质',
  wool: '羊毛',
  polyester: '聚酯纤维',
  denim: '牛仔',
  silk: '丝绸',
  linen: '亚麻',
  fleece: '抓绒',
  nylon: '尼龙'
};

/** 材质保暖系数（越大越保暖） */
const MATERIAL_COEFF = {
  cotton: 1.0,
  wool: 1.4,
  polyester: 0.9,
  denim: 1.1,
  silk: 0.7,
  linen: 0.6,
  fleece: 1.3,
  nylon: 0.8
};

/** 叠穿层权重（内层→外层逐步打折） */
const LAYER_WEIGHTS = {
  inner: 1.0,   // 内层（上衣）全效
  outer: 0.6,   // 外层（外套）打6折
  bottom: 0.8   // 裤子打8折
};

/** 温度计算参数 */
const TEMP_CONFIG = {
  baseTemp: 18,         // 基础舒适温度 °C
  baseEffective: 3.0,   // 基准有效厚度
  factor: 4,            // 每差1有效厚度对应的温度偏移量
  threshold: 3          // 判定"偏薄/偏厚"的温差阈值
};

// ==================== 预设样衣数据（10件 Mock） ====================

const PRESET_CLOTHES = [
  { name: '蓝色冲锋衣', type: 'outer', thickness: 3, material: 'polyester', materialCoeff: 0.9, color: '蓝色', colorHex: '#2196F3', style: 'jacket', sleeve: 'long', tags: ['防风', '防水'], imgUrl: 'assets/clothes/blue-coat.png' },
  { name: '白色T恤',    type: 'top',   thickness: 1, material: 'cotton',    materialCoeff: 1.0, color: '白色', colorHex: '#FFFFFF', style: 'tshirt', sleeve: 'short', tags: ['透气'], imgUrl: 'assets/clothes/white-tshirt.png' },
  { name: '黑色牛仔裤', type: 'bottom', thickness: 2, material: 'denim',     materialCoeff: 1.1, color: '黑色', colorHex: '#212121', style: 'jeans',  sleeve: 'long',  tags: ['耐磨'], imgUrl: 'assets/clothes/black-jeans.png' },
  { name: '粉色卫衣',   type: 'top',   thickness: 2, material: 'cotton',    materialCoeff: 1.0, color: '粉色', colorHex: '#F48FB1', style: 'hoodie', sleeve: 'long',  tags: ['加绒'], imgUrl: 'assets/clothes/pink-hoodie.png' },
  { name: '灰色风衣',   type: 'outer', thickness: 3, material: 'nylon',     materialCoeff: 0.8, color: '灰色', colorHex: '#9E9E9E', style: 'coat',   sleeve: 'long',  tags: ['防风', '轻便'], imgUrl: 'assets/clothes/gray-coat.png' },
  { name: '卡其短裤',   type: 'bottom', thickness: 1, material: 'cotton',   materialCoeff: 1.0, color: '卡其', colorHex: '#C8A96E', style: 'shorts', sleeve: 'none',  tags: ['夏季'], imgUrl: 'assets/clothes/khaki-shorts.png' },
  { name: '米色毛衣',   type: 'top',   thickness: 3, material: 'wool',      materialCoeff: 1.4, color: '米色', colorHex: '#F5E6CC', style: 'hoodie', sleeve: 'long',  tags: ['保暖', '羊毛'], imgUrl: 'assets/clothes/beige-sweater.png' },
  { name: '深蓝西装裤', type: 'bottom', thickness: 2, material: 'polyester', materialCoeff: 0.9, color: '深蓝', colorHex: '#1A237E', style: 'jeans',  sleeve: 'long',  tags: ['商务'], imgUrl: 'assets/clothes/navy-pants.png' },
  { name: '红色羽绒服', type: 'outer', thickness: 3, material: 'fleece',    materialCoeff: 1.3, color: '红色', colorHex: '#E53935', style: 'coat',   sleeve: 'long',  tags: ['保暖', '加厚'], imgUrl: 'assets/clothes/red-down.png' },
  { name: '条纹Polo衫', type: 'top',   thickness: 1, material: 'cotton',    materialCoeff: 1.0, color: '蓝白', colorHex: '#BBDEFB', style: 'tshirt', sleeve: 'short', tags: ['休闲'], imgUrl: 'assets/clothes/stripe-polo.png' }
];

// ==================== 温度推荐引擎 ====================

/**
 * 计算单件衣物的有效厚度（基础厚度 × 材质系数）
 * @param {Object} item - 衣物对象
 * @returns {number} 有效厚度
 */
function calcEffectiveThickness(item) {
  const coeff = item.materialCoeff || MATERIAL_COEFF[item.material] || 1.0;
  return item.thickness * coeff;
}

/**
 * 计算穿搭的有效总厚度（分层加权）
 * 内层全效 *1.0，裤子 *0.8，外层打6折 *0.6
 * @param {Object} outfitState - { top: item|null, outer: item|null, bottom: item|null }
 * @returns {number} 加权有效厚度
 */
function calcWeightedThickness(outfitState) {
  let total = 0;
  if (outfitState.bottom) {
    total += calcEffectiveThickness(outfitState.bottom) * LAYER_WEIGHTS.bottom;
  }
  if (outfitState.top) {
    total += calcEffectiveThickness(outfitState.top) * LAYER_WEIGHTS.inner;
  }
  if (outfitState.outer) {
    total += calcEffectiveThickness(outfitState.outer) * LAYER_WEIGHTS.outer;
  }
  return Math.round(total * 10) / 10; // 保留一位小数
}

/**
 * 计算适宜温度区间
 * @param {number} effectiveThickness - 加权有效厚度
 * @returns {{ min: number, max: number }}
 */
function calcSuitableTempRange(effectiveThickness) {
  const { baseTemp, baseEffective, factor } = TEMP_CONFIG;
  const offset = (effectiveThickness - baseEffective) * factor;
  return {
    min: Math.round(baseTemp - offset),
    max: Math.round(baseTemp + offset)
  };
}

/**
 * 分析穿搭适宜性
 * @param {number} outsideTemp  - 室外温度
 * @param {number} effectiveThickness - 加权有效厚度
 * @returns {{ advice: string, type: string, suitableMin: number, suitableMax: number }}
 *   type: 'thin' | 'fit' | 'thick' | 'empty'
 */
function analyzeOutfitSuitability(outsideTemp, effectiveThickness) {
  const { min, max } = calcSuitableTempRange(effectiveThickness);
  const { threshold } = TEMP_CONFIG;

  let advice, type;
  if (outsideTemp < min - threshold) {
    advice = '偏薄了！建议加厚衣物或加件外套 🥶';
    type = 'thin';
  } else if (outsideTemp > max + threshold) {
    advice = '偏厚了！建议减少衣物 🥵';
    type = 'thick';
  } else {
    advice = '这套穿搭非常适合当前温度 ✅';
    type = 'fit';
  }

  return { advice, type, suitableMin: min, suitableMax: max };
}

// ==================== 基础穿搭校验 ====================

/**
 * 校验穿搭是否合法
 * 规则：禁止「只有上衣没有裤子」或「只有裤子没有上衣」的奇葩组合
 * @param {Object} outfitState - { top: item|null, outer: item|null, bottom: item|null }
 * @returns {Object} { valid: boolean, message: string }
 */
function validateOutfitCombo(outfitState) {
  const hasTop = !!(outfitState.top || outfitState.outer);
  const hasBottom = !!outfitState.bottom;

  if (!hasTop && !hasBottom) {
    return { valid: false, message: '请至少穿一件上衣和一件下装' };
  }
  if (hasTop && !hasBottom) {
    return { valid: false, message: '只穿上衣不穿裤子？不太合适哦 😅' };
  }
  if (!hasTop && hasBottom) {
    return { valid: false, message: '只穿裤子不穿上衣？不太合适哦 😅' };
  }
  return { valid: true, message: '' };
}

// ==================== 数据验证 ====================

/**
 * 验证衣物数据是否完整
 */
function validateClothesData(data) {
  const errors = [];
  if (!data.name || !data.name.trim()) errors.push('衣物名称不能为空');
  if (!['top', 'outer', 'bottom'].includes(data.type)) errors.push('衣物类型无效（应为 top/outer/bottom）');
  if (![1, 2, 3].includes(Number(data.thickness))) errors.push('厚度值无效（应为 1/2/3）');
  return { valid: errors.length === 0, errors };
}

/**
 * 验证穿搭数据是否可保存
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
 * 获取材质的中文标签
 */
function getMaterialLabel(material) {
  return MATERIAL_LABELS[material] || material;
}

/**
 * 生成星级评分的字符串表示
 */
function getStarsString(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}