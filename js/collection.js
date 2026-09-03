/**
 * collection.js - 穿搭收藏模块（交互层）
 * 
 * 后端交互层负责人：成员B
 * 职责：DOM 操作、事件绑定、UI 渲染、用户交互反馈
 * 
 * 依赖的逻辑层（成员C）：
 *   storage.js  - 数据 CRUD
 *   logic.js    - 星级评分字符串、映射工具
 * ============================================================
 * 依赖说明：
 * - getOutfits() / getTodayOutfit() / deleteOutfit() / getClothesByIds() 来自 storage.js
 * - getStarsString() 来自 logic.js
 */

// ==================== DOM 引用 ====================
const todayOutfitDisplay = document.getElementById('today-outfit-display');
const emptyToday = document.getElementById('empty-today');
const collectionList = document.getElementById('collection-list');
const emptyCollection = document.getElementById('empty-collection');

// ==================== 渲染今日穿搭 ====================
function renderTodayOutfit() {
  const today = getTodayOutfit();
  todayOutfitDisplay.innerHTML = '';

  if (!today) {
    emptyToday.style.display = 'block';
    return;
  }
  emptyToday.style.display = 'none';

  const clothes = getClothesByIds(today.clothesIds);
  const card = document.createElement('div');
  card.className = 'today-outfit-card';

  let clothesHtml = '';
  clothes.forEach(item => {
    clothesHtml += `<img src="${item.imgUrl}" alt="${item.name}" onerror="this.style.display='none'">`;
  });

  // 如果有快照数据，展示历史温度分析结果
  let snapshotHtml = '';
  if (today.snapshot) {
    snapshotHtml = `
      <div class="outfit-snapshot" style="margin-top:8px;font-size:0.8rem;color:#888">
        📊 ${today.snapshot.advice}
      </div>
    `;
  }

  card.innerHTML = `
    <div class="outfit-name">${today.name}</div>
    <div class="outfit-date">${today.date}</div>
    <div class="outfit-clothes">${clothesHtml}</div>
    <div class="outfit-rating" style="color:#ffc107">${getStarsString(today.rating)}</div>
    ${snapshotHtml}
  `;

  todayOutfitDisplay.appendChild(card);
}

// ==================== 渲染收藏列表 ====================
function renderCollection() {
  const outfits = getOutfits();
  collectionList.innerHTML = '';

  if (outfits.length === 0) {
    emptyCollection.style.display = 'block';
    return;
  }
  emptyCollection.style.display = 'none';

  outfits.reverse().forEach(outfit => {
    const clothes = getClothesByIds(outfit.clothesIds);

    let clothesHtml = '';
    clothes.forEach(item => {
      clothesHtml += `<img src="${item.imgUrl}" alt="${item.name}" onerror="this.style.display='none'">`;
    });

    // 展示快照信息
    let snapshotHtml = '';
    if (outfit.snapshot) {
      snapshotHtml = `
        <div class="outfit-snapshot" style="margin-top:4px;font-size:0.75rem;color:#999">
          ${outfit.snapshot.advice}
        </div>
      `;
    }

    const card = document.createElement('div');
    card.className = 'collection-card';
    card.innerHTML = `
      <div class="outfit-name">${outfit.name}</div>
      <div class="outfit-date">${outfit.date}</div>
      <div class="outfit-clothes">${clothesHtml}</div>
      <div class="outfit-rating" style="color:#ffc107">${getStarsString(outfit.rating)}</div>
      ${snapshotHtml}
      <div class="outfit-actions">
        <button class="btn btn-primary btn-small load-btn" data-id="${outfit.id}">📥 加载穿搭</button>
        <button class="btn btn-danger btn-small delete-btn" data-id="${outfit.id}">🗑️ 删除</button>
      </div>
    `;

    card.querySelector('.load-btn').addEventListener('click', () => loadOutfit(outfit.id));
    card.querySelector('.delete-btn').addEventListener('click', () => deleteOutfitItem(outfit.id));
    collectionList.appendChild(card);
  });
}

// ==================== 加载历史穿搭 ====================
function loadOutfit(id) {
  const outfits = getOutfits();
  const outfit = outfits.find(o => o.id === id);
  if (!outfit) return;
  const url = `dress-up.html?load=${outfit.id}`;
  if (confirm(`要加载穿搭「${outfit.name}」到换装页面吗？`)) {
    window.location.href = url;
  }
}

// ==================== 删除收藏 ====================
function deleteOutfitItem(id) {
  if (!confirm('确定要删除这套穿搭收藏吗？')) return;
  deleteOutfit(id);
  renderTodayOutfit();
  renderCollection();
}

// ==================== 初始化 ====================
renderTodayOutfit();
renderCollection();