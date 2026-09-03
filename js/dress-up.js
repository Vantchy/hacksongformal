/**
 * dress-up.js - 虚拟换装模块（交互层）
 * 
 * 后端交互层负责人：成员B
 * 职责：DOM 操作、事件绑定、UI 渲染、用户交互反馈
 * 
 * 依赖的逻辑层（成员C）：
 *   storage.js  - 数据 CRUD
 *   logic.js    - 温度引擎、穿搭分析、穿搭校验、映射工具
 * ============================================================
 * 依赖说明：
 * - getClothes() / getClothesById() / getClothesByIds() / addOutfit()  来自 storage.js
 * - calcWeightedThickness() / analyzeOutfitSuitability() / validateOutfitCombo() / validateOutfitSave() / getTypeLabel() / getThicknessLabel() 来自 logic.js
 */

// ==================== 状态管理 ====================
const state = {
  currentOutfit: {
    top: null,    // 内层（上衣）→ 存完整 item 对象
    outer: null,  // 外层（外套）→ 存完整 item 对象
    bottom: null  // 裤子 → 存完整 item 对象
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
const starRatingEl = document.getElementById('star-rating');
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

  clothes.forEach(item => {
    const card = document.createElement('div');
    card.className = 'clothes-card';
    card.dataset.id = item.id;

    // 检查是否已穿在身上
    const isWorn =
      (state.currentOutfit.top && state.currentOutfit.top.id === item.id) ||
      (state.currentOutfit.outer && state.currentOutfit.outer.id === item.id) ||
      (state.currentOutfit.bottom && state.currentOutfit.bottom.id === item.id);

    if (isWorn) card.classList.add('selected');

    card.innerHTML = `
      <img class="clothes-img" src="${item.imgUrl}" alt="${item.name}"
        onerror="this.style.display='none';this.parentElement.innerHTML+='<div style=\\'padding:30px 0;font-size:2rem\\'>👕</div>'">
      <div class="clothes-name">${item.name}</div>
      <div class="clothes-tags">${getTypeLabel(item.type)} · ${getThicknessLabel(item.thickness)}</div>
    `;

    card.addEventListener('click', () => toggleClothes(item));
    clothesSelectList.appendChild(card);
  });
}

// ==================== 切换衣物 ====================
function toggleClothes(item) {
  const { type } = item;

  // 如果已穿着，则脱下；否则穿上（同类型替换）
  if (state.currentOutfit[type] && state.currentOutfit[type].id === item.id) {
    state.currentOutfit[type] = null;
  } else {
    state.currentOutfit[type] = item;
  }

  renderModel();
  renderClothesSelect();
  clearTempResult();
}

// ==================== 渲染模特 ====================
function renderModel() {
  modelLayerInner.innerHTML = '';
  modelLayerOuter.innerHTML = '';

  if (state.currentOutfit.bottom) {
    const img = document.createElement('img');
    img.src = state.currentOutfit.bottom.imgUrl;
    img.alt = state.currentOutfit.bottom.name;
    modelLayerInner.appendChild(img);
  }

  if (state.currentOutfit.top) {
    const img = document.createElement('img');
    img.src = state.currentOutfit.top.imgUrl;
    img.alt = state.currentOutfit.top.name;
    modelLayerInner.appendChild(img);
  }

  if (state.currentOutfit.outer) {
    const img = document.createElement('img');
    img.src = state.currentOutfit.outer.imgUrl;
    img.alt = state.currentOutfit.outer.name;
    modelLayerOuter.appendChild(img);
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

  // 先校验穿搭是否合法
  const comboCheck = validateOutfitCombo(state.currentOutfit);
  if (!comboCheck.valid) {
    tempResult.innerHTML = `<p style="text-align:center;color:#e65100">${comboCheck.message}</p>`;
    return;
  }

  // 调用逻辑层（成员C）的温度推荐引擎：分层加权计算
  const effectiveThickness = calcWeightedThickness(state.currentOutfit);
  const result = analyzeOutfitSuitability(outsideTemp, effectiveThickness);

  const adviceClassMap = { thin: 'thin', fit: 'fit', thick: 'thick' };

  tempResult.innerHTML = `
    <p class="temp-suit">有效厚度：${effectiveThickness}</p>
    <p class="temp-range">适宜温度区间：${result.suitableMin}°C ~ ${result.suitableMax}°C</p>
    <p class="temp-advice ${adviceClassMap[result.type]}">${result.advice}</p>
  `;
});

// ==================== 星级评分 ====================
starRatingEl.addEventListener('click', (e) => {
  const star = e.target.closest('.star');
  if (!star) return;
  const value = parseInt(star.dataset.value);
  ratingValue.value = value;
  document.querySelectorAll('.star').forEach((s, i) => {
    s.classList.toggle('active', i < value);
    s.textContent = i < value ? '★' : '☆';
  });
});

// ==================== 保存穿搭（含静态快照） ====================
saveOutfitBtn.addEventListener('click', () => {
  const wornIds = Object.values(state.currentOutfit)
    .filter(Boolean)
    .map(item => item.id);

  // 调用逻辑层验证
  const validation = validateOutfitSave(wornIds);
  if (!validation.valid) {
    alert(validation.message);
    return;
  }

  // 计算快照数据（静态保存，历史不随系统改变）
  const effectiveThickness = calcWeightedThickness(state.currentOutfit);
  const range = calcSuitableTempRange(effectiveThickness);
  const clothesNames = Object.values(state.currentOutfit)
    .filter(Boolean)
    .map(item => item.name);

  const snapshot = {
    totalThickness: effectiveThickness,
    suitableMin: range.min,
    suitableMax: range.max,
    advice: `有效厚度 ${effectiveThickness}，适宜 ${range.min}°C~${range.max}°C`,
    clothesNames: clothesNames
  };

  const name = outfitNameInput.value.trim() || '我的穿搭';
  const rating = parseInt(ratingValue.value) || 0;

  const outfit = addOutfit({
    name,
    clothesIds: wornIds,
    rating,
    snapshot
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