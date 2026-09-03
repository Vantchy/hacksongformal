/**
 * storage.js - 电子衣橱 数据持久层
 * 
 * 后端逻辑层负责人：成员C（我）
 * 职责：localStorage 数据 CRUD、数据模型、唯一ID生成
 * 
 * 交互层（成员B）通过调用此文件的函数存取数据。
 * ============================================================
 * 
 * 所有数据保存在浏览器 localStorage 中。
 * 
 * ⚠️ 数据格式约定（三人必须统一）：
 * 
 * 衣物对象：
 * {
 *   id: "clo_xxx",                    // 唯一标识（自动生成）
 *   name: "蓝色冲锋衣",               // 衣物名称
 *   type: "top"|"outer"|"bottom",     // 类型：上衣/外套/裤子
 *   thickness: 1|2|3,                 // 基础厚度等级：1薄/2中等/3厚
 *   material: "cotton"|"wool"|"polyester"|"denim"|"其它",  // 材质
 *   materialCoeff: 0.8~1.2,           // 材质保暖系数（影响温度计算）
 *   color: "蓝色",                     // 颜色名称
 *   colorHex: "#2196F3",              // 颜色色值（前端渲染用）
 *   style: "hoodie"|"jacket"|"tshirt"|"jeans"|"shorts"|"coat",  // 款式标签
 *   sleeve: "long"|"short"|"none",    // 袖长
 *   tags: ["防风", "加绒"],            // 扩展标签数组
 *   imgUrl: "assets/clothes/xxx.png"  // 素材路径
 * }
 * 
 * 穿搭方案对象：
 * {
 *   id: "outfit_xxx",                 // 唯一标识
 *   name: "我的穿搭",                  // 穿搭名称
 *   clothesIds: ["clo_01", "clo_02"], // 包含的衣物ID列表
 *   rating: 0-5,                      // 星级评分
 *   date: "2026-09-03",               // 创建日期
 *   snapshot: {                       // ★ 保存时的静态快照（历史不随系统改变）
 *     totalThickness: 5,              //   计算时的总厚度
 *     suitableMin: 18,                //   适宜温度下限
 *     suitableMax: 22,                //   适宜温度上限
 *     advice: "微凉，建议加件外套",     //   穿搭建议文字
 *     clothesNames: ["蓝色冲锋衣","白色T恤"]  //   衣物名称列表
 *   }
 * }
 */

// ==================== 常量 ====================
const STORAGE_KEYS = {
  CLOTHES: 'wardrobe_clothes',       // 所有衣物数据
  OUTFITS: 'wardrobe_outfits',       // 所有穿搭收藏
  TODAY_OUTFIT: 'wardrobe_today'     // 今日穿搭
};

// 允许的衣物类型
const VALID_TYPES = ['top', 'outer', 'bottom'];
// 允许的厚度值
const VALID_THICKNESS = [1, 2, 3];

// ==================== 工具函数 ====================

/**
 * 生成唯一ID
 */
function generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return prefix + '_' + timestamp + random;
}

/**
 * 获取当天日期字符串 YYYY-MM-DD
 */
function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==================== 衣物数据操作 ====================

/**
 * 获取所有衣物
 */
function getClothes() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLOTHES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('读取衣物数据失败:', e);
    return [];
  }
}

/**
 * 保存所有衣物
 */
function saveClothes(clothes) {
  try {
    localStorage.setItem(STORAGE_KEYS.CLOTHES, JSON.stringify(clothes));
  } catch (e) {
    console.error('保存衣物数据失败:', e);
  }
}

/**
 * 新增衣物（自动补全默认字段）
 */
function addClothes(clothesItem) {
  const clothes = getClothes();
  const item = {
    id: generateId('clo'),
    name: clothesItem.name || '未命名',
    type: clothesItem.type || 'top',
    thickness: clothesItem.thickness || 1,
    material: clothesItem.material || 'cotton',
    materialCoeff: clothesItem.materialCoeff || 1.0,
    color: clothesItem.color || '',
    colorHex: clothesItem.colorHex || '#CCCCCC',
    style: clothesItem.style || 'tshirt',
    sleeve: clothesItem.sleeve || 'short',
    tags: clothesItem.tags || [],
    imgUrl: clothesItem.imgUrl || 'assets/clothes/placeholder.png'
  };
  clothes.push(item);
  saveClothes(clothes);
  return item;
}

/**
 * 根据ID获取单件衣物
 */
function getClothesById(id) {
  const clothes = getClothes();
  return clothes.find(item => item.id === id) || null;
}

/**
 * 批量获取衣物（根据ID数组）
 */
function getClothesByIds(ids) {
  const clothes = getClothes();
  return ids.map(id => clothes.find(item => item.id === id)).filter(Boolean);
}

/**
 * 更新衣物
 */
function updateClothes(id, updatedData) {
  const clothes = getClothes();
  const index = clothes.findIndex(item => item.id === id);
  if (index === -1) return null;
  clothes[index] = { ...clothes[index], ...updatedData, id: id };
  saveClothes(clothes);
  return clothes[index];
}

/**
 * 删除衣物
 */
function deleteClothes(id) {
  const clothes = getClothes();
  const filtered = clothes.filter(item => item.id !== id);
  if (filtered.length === clothes.length) return false;
  saveClothes(filtered);
  return true;
}

// ==================== 穿搭收藏操作 ====================

/**
 * 获取所有穿搭收藏
 */
function getOutfits() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.OUTFITS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('读取穿搭收藏失败:', e);
    return [];
  }
}

/**
 * 保存所有穿搭收藏
 */
function saveOutfits(outfits) {
  try {
    localStorage.setItem(STORAGE_KEYS.OUTFITS, JSON.stringify(outfits));
  } catch (e) {
    console.error('保存穿搭收藏失败:', e);
  }
}

/**
 * 新增穿搭收藏（含静态快照）
 * @param {Object} outfitData - { name, clothesIds, rating, snapshot }
 *   snapshot: { totalThickness, suitableMin, suitableMax, advice, clothesNames }
 */
function addOutfit(outfitData) {
  const outfits = getOutfits();
  const outfit = {
    id: generateId('outfit'),
    name: outfitData.name || '未命名穿搭',
    clothesIds: outfitData.clothesIds || [],
    rating: outfitData.rating || 0,
    date: getTodayDate(),
    snapshot: outfitData.snapshot || null
  };
  outfits.push(outfit);
  saveOutfits(outfits);

  // 同时保存为今日穿搭
  saveTodayOutfit(outfit);

  return outfit;
}

/**
 * 删除穿搭收藏
 */
function deleteOutfit(id) {
  const outfits = getOutfits();
  const filtered = outfits.filter(item => item.id !== id);
  if (filtered.length === outfits.length) return false;
  saveOutfits(filtered);
  return true;
}

/**
 * 获取今日穿搭
 */
function getTodayOutfit() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TODAY_OUTFIT);
    if (!data) return null;
    const outfit = JSON.parse(data);
    if (outfit.date === getTodayDate()) {
      return outfit;
    }
    return null;
  } catch (e) {
    console.error('读取今日穿搭失败:', e);
    return null;
  }
}

/**
 * 保存今日穿搭
 */
function saveTodayOutfit(outfit) {
  try {
    localStorage.setItem(STORAGE_KEYS.TODAY_OUTFIT, JSON.stringify({
      id: outfit.id,
      name: outfit.name,
      clothesIds: outfit.clothesIds,
      rating: outfit.rating,
      date: getTodayDate(),
      snapshot: outfit.snapshot || null
    }));
  } catch (e) {
    console.error('保存今日穿搭失败:', e);
  }
}