/**
 * dress-up.js - 虚拟换装模块
 * 
 * 负责人：成员B
 * 开发任务：换装主页面布局、卡通模特画布渲染、叠穿交互、温度计算
 * 
 * 可用 API（来自 storage.js）：
 *   getClothes()          - 获取所有衣物
 *   getClothesById(id)    - 根据ID获取单件衣物
 *   getClothesByIds(ids)  - 根据ID数组批量获取
 *   addOutfit(obj)        - 保存穿搭收藏
 *   getTodayDate()         - 获取当天日期
 */

// ==================== 状态管理 ====================
const state = {
  currentOutfit: {
    top: null,    // 内层（上衣）
    outer: null,  // 外层（外套）
    bottom: null  // 裤子
  }
};

// ==================== DOM 引用 ====================
const modelLayerInner = document.getElementById('model-layer-inner');
const modelLayerOuter = document.getElementById('model-layer-outer');
const clothesSelectList = document.getElementById('clothes-select-list');
const emptyClothesHint = document.getElementById('empty-clothes-hint');
const clearAllBtn = document.getElementById('clear-all-btn');

// 温度分析
const outsideTempInput = document.getElementById('outside-temp');
const analyzeTempBtn = document.getElementById('analyze-temp-btn');
const tempResult = document.getElementById('temp-result');

// 收藏功能
const outfitNameInput = document.getElementById('outfit-name');
const starRating = document.getElementById('star-rating');
const ratingValue = document.getElementById('rating-value');
const saveOutfitBtn = document.getElementById('save-outfit-btn');

// ==================== 渲染衣物选择列表 ====================
function renderClothesSelect() {
  const clothes = getClothes();
  clothesSelectList.innerHTML = '';

  if (clothes.length === 0) {
    emptyClothesHint.style.display = 'block';
    return;
  }
  emptyClothesHint.style.display = 'none';

  const typeMap = { top: '上衣', outer: '外套', bottom: '裤子' };
  const thickMap = { 1: '薄', 2: '中等', 3: '厚' };

  clothes.forEach(item => {
    const card = document.createElement('div');
    card.className = 'clothes-card';
    card.dataset.id = item.id;

    // 检查是否已穿在身上
    const isWorn = 
      state.currentOutfit.top === item.id || 
      state.currentOutfit.outer === item.id || 
      state.currentOutfit.bottom === item.id;

    if (isWorn) {
      card.classList.add('selected');
    }

    card.innerHTML = `
      <img class="clothes-img" src="${item.imgUrl}" alt="${item.name}"
        onerror="this.style.display='none';this.parentElement.innerHTML+='<div style=\\'padding:30px 0;font-size:2rem\\'>👕</div>'">
      <div class="clothes-name">${item.name}</div>
      <div class="clothes-tags">${typeMap[item.type] || item.type} · ${thickMap[item.thickness] || item.thickness}</div>
    `;

    card.addEventListener('click', () => toggleClothes(item));
    clothesSelectList.appendChild(card);
  });
}

// ==================== 切换衣物 ====================
function toggleClothes(item) {
  const { id, type } = item;

  // 如果已穿着，则脱下
  if (state.currentOutfit[type] === id) {
    state.currentOutfit[type] = null;
  } else {
    // 穿着新衣物（同类型替换）
    state.currentOutfit[type] = id;
  }

  renderModel();
  renderClothesSelect();
}

// ==================== 渲染模特 ====================
function renderModel() {
  modelLayerInner.innerHTML = '';
  modelLayerOuter.innerHTML = '';

  // 裤子（放在内层底部）
  if (state.currentOutfit.bottom) {
    const item = getClothesById(state.currentOutfit.bottom);
    if (item) {
      const img = document.createElement('img');
      img.src = item.imgUrl;
      img.alt = item.name;
      modelLayerInner.appendChild(img);
    }
  }

  // 内层上衣
  if (state.currentOutfit.top) {
    const item = getClothesById(state.currentOutfit.top);
    if (item) {
      const img = document.createElement('img');
      img.src = item.imgUrl;
      img.alt = item.name;
      modelLayerInner.appendChild(img);
    }
  }

  // 外层外套
  if (state.currentOutfit.outer) {
    const item = getClothesById(state.currentOutfit.outer);
    if (item) {
      const img = document.createElement('img');
      img.src = item.imgUrl;
      img.alt = item.name;
      modelLayerOuter.appendChild(img);
    }
  }
}

// ==================== 一键清空 ====================
clearAllBtn.addEventListener('click', () => {
  state.currentOutfit = { top: null, outer: null, bottom: null };
  renderModel();
  renderClothesSelect();
  clearTempResult();
});

// ==================== 温度分析 ====================
function clearTempResult() {
  tempResult.innerHTML = '<p class="temp-hint">输入温度后点击「分析穿搭」查看结果</p>';
}

analyzeTempBtn.addEventListener('click', () => {
  const outsideTemp = parseFloat(outsideTempInput.value);

  if (isNaN(outsideTemp)) {
    alert('请输入有效的温度值！');
    return;
  }

  // 计算当前穿搭的总厚度
  const wornIds = Object.values(state.currentOutfit).filter(Boolean);
  if (wornIds.length === 0) {
    tempResult.innerHTML = '<p style="text-align:center;color:#999">还没有穿任何衣物，先搭配一套吧～</p>';
    return;
  }

  const clothes = getClothesByIds(wornIds);
  const totalThickness = clothes.reduce((sum, item) => sum + item.thickness, 0);

  // 根据厚度计算适宜温度区间
  // 基础公式：每1厚度约对应 5°C，基础温度 15°C
  const baseTemp = 15;
  const baseThickness = 3; // 3件平均厚度作为基准
  const suitableMin = Math.round(baseTemp - (totalThickness - baseThickness) * 3);
  const suitableMax = Math.round(baseTemp + (totalThickness - baseThickness) * 3);

  // 判断穿搭建议
  let advice = '';
  let adviceClass = '';
  if (outsideTemp < suitableMin - 3) {
    advice = '🥶 偏薄了！建议加厚衣物，小心着凉～';
    adviceClass = 'thin';
  } else if (outsideTemp > suitableMax + 3) {
    advice = '🥵 偏厚了！建议减少衣物，避免闷热～';
    adviceClass = 'thick';
  } else {
    advice = '✅ 这套穿搭非常适合当前温度！';
    adviceClass = 'fit';
  }

  tempResult.innerHTML = `
    <p class="temp-suit">当前穿搭厚度：${totalThickness}</p>
    <p class="temp-range">适宜温度区间：${suitableMin}°C ~ ${suitableMax}°C</p>
    <p class="temp-advice ${adviceClass}">${advice}</p>
  `;
});

// ==================== 星级评分 ====================
starRating.addEventListener('click', (e) => {
  const star = e.target.closest('.star');
  if (!star) return;

  const value = parseInt(star.dataset.value);
  ratingValue.value = value;

  document.querySelectorAll('.star').forEach((s, i) => {
    s.classList.toggle('active', i < value);
    s.textContent = i < value ? '★' : '☆';
  });
});

// ==================== 保存穿搭 ====================
saveOutfitBtn.addEventListener('click', () => {
  const wornIds = Object.values(state.currentOutfit).filter(Boolean);
  if (wornIds.length === 0) {
    alert('请先搭配一套穿搭再保存！');
    return;
  }

  const name = outfitNameInput.value.trim() || '我的穿搭';
  const rating = parseInt(ratingValue.value) || 0;

  const outfit = addOutfit({
    name: name,
    clothesIds: wornIds,
    rating: rating
  });

  alert(`✅ 穿搭「${outfit.name}」已保存！`);
  outfitNameInput.value = '';
  ratingValue.value = 0;
  document.querySelectorAll('.star').forEach(s => {
    s.classList.remove('active');
    s.textContent = '☆';
  });
});

// ==================== 初始化 ====================
renderClothesSelect();
renderModel();