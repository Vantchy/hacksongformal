/**
 * collection.js - 穿搭收藏模块（后端交互逻辑）
 * 
 * 后端交互逻辑负责人：成员B
 * 开发任务：收藏列表展示、今日穿搭卡片、历史穿搭加载、删除收藏
 * 
 * 前端 HTML/CSS 负责人：成员A（页面结构 + UI 样式）
 * 仓库主管 / 素材统筹：成员C
 * 
 * 可用 API（来自 storage.js）：
 *   getOutfits()          - 获取所有穿搭收藏
 *   getTodayOutfit()      - 获取今日穿搭
 *   deleteOutfit(id)      - 删除穿搭收藏
 *   getClothesByIds(ids)  - 根据ID数组批量获取衣物
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
    clothesHtml += `<img src="${item.imgUrl}" alt="${item.name}" 
      onerror="this.style.display='none'">`;
  });

  const stars = '★'.repeat(today.rating) + '☆'.repeat(5 - today.rating);

  card.innerHTML = `
    <div class="outfit-name">${today.name}</div>
    <div class="outfit-date">${today.date}</div>
    <div class="outfit-clothes">${clothesHtml}</div>
    <div class="outfit-rating" style="color:#ffc107">${stars}</div>
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

  // 倒序展示（最新的在前）
  outfits.reverse().forEach(outfit => {
    const clothes = getClothesByIds(outfit.clothesIds);
    const stars = '★'.repeat(outfit.rating) + '☆'.repeat(5 - outfit.rating);

    let clothesHtml = '';
    clothes.forEach(item => {
      clothesHtml += `<img src="${item.imgUrl}" alt="${item.name}"
        onerror="this.style.display='none'">`;
    });

    const card = document.createElement('div');
    card.className = 'collection-card';
    card.innerHTML = `
      <div class="outfit-name">${outfit.name}</div>
      <div class="outfit-date">${outfit.date}</div>
      <div class="outfit-clothes">${clothesHtml}</div>
      <div class="outfit-rating" style="color:#ffc107">${stars}</div>
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

  // 跳转到换装页面，并把穿搭ID带过去
  // 换装页面可以通过 URL 参数读取
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