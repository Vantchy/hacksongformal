/**
 * storage.js - 电子衣橱 localStorage 公共工具脚本
 * 
 * 统一管理衣物数据、穿搭收藏数据的存取。
 * 所有数据保存在浏览器 localStorage 中。
 * 
 * ⚠️ 数据格式约定（三人必须统一）：
 * 
 * 衣物对象：
 * {
 *   id: "clo_xxx",           // 唯一标识
 *   name: "蓝色冲锋衣",       // 衣物名称
 *   type: "top"|"outer"|"bottom",  // 类型：上衣/外套/裤子
 *   thickness: 1|2|3,        // 厚度：1薄/2中等/3厚
 *   color: "蓝色",            // 颜色
 *   imgUrl: "assets/clothes/xxx.png"  // 素材路径
 * }
 * 
 * 穿搭方案对象：
 * {
 *   id: "outfit_xxx",        // 唯一标识
 *   name: "我的穿搭",         // 穿搭名称
 *   clothesIds: ["clo_01", "clo_02"],  // 包含的衣物ID列表
 *   rating: 0-5,             // 星级评分
 *   date: "2026-09-03"       // 创建日期
 * }
 */

// ==================== 常量 ====================
const STORAGE_KEYS = {
  CLOTHES: 'wardrobe_clothes',       // 所有衣物数据
  OUTFITS: 'wardrobe_outfits',       // 所有穿搭收藏
  TODAY_OUTFIT: 'wardrobe_today'     // 今日穿搭
};

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
 * 新增衣物
 */
function addClothes(clothesItem) {
  const clothes = getClothes();
  clothesItem.id = generateId('clo');
  clothes.push(clothesItem);
  saveClothes(clothes);
  return clothesItem;
}

/**
 * 根据ID获取衣物
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
 * 新增穿搭收藏
 */
function addOutfit(outfitData) {
  const outfits = getOutfits();
  const outfit = {
    id: generateId('outfit'),
    name: outfitData.name || '未命名穿搭',
    clothesIds: outfitData.clothesIds || [],
    rating: outfitData.rating || 0,
    date: getTodayDate()
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
    // 检查是否为今天
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
      date: getTodayDate()
    }));
  } catch (e) {
    console.error('保存今日穿搭失败:', e);
  }
}