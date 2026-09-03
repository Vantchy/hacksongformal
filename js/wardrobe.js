/**
 * wardrobe.js - 衣柜模块
 * 
 * 负责人：成员A
 * 开发任务：衣物新增、编辑、删除、卡片渲染、表单交互
 * 
 * 可用 API（来自 storage.js）：
 *   getClothes()       - 获取所有衣物
 *   saveClothes(arr)   - 保存所有衣物
 *   addClothes(obj)    - 新增衣物（自动生成id）
 *   getClothesById(id) - 根据ID获取
 *   updateClothes(id, data) - 更新衣物
 *   deleteClothes(id)  - 删除衣物
 *   generateId(prefix) - 生成唯一ID
 */

// ==================== 预设样衣素材 ====================
const PRESET_CLOTHES = [
  { name: '蓝色冲锋衣', type: 'outer', thickness: 3, color: '蓝色', imgUrl: 'assets/clothes/blue-coat.png' },
  { name: '白色T恤', type: 'top', thickness: 1, color: '白色', imgUrl: 'assets/clothes/white-tshirt.png' },
  { name: '黑色牛仔裤', type: 'bottom', thickness: 2, color: '黑色', imgUrl: 'assets/clothes/black-jeans.png' },
  { name: '粉色卫衣', type: 'top', thickness: 2, color: '粉色', imgUrl: 'assets/clothes/pink-hoodie.png' },
  { name: '灰色风衣', type: 'outer', thickness: 3, color: '灰色', imgUrl: 'assets/clothes/gray-coat.png' },
  { name: '卡其短裤', type: 'bottom', thickness: 1, color: '卡其', imgUrl: 'assets/clothes/khaki-shorts.png' }
];

// ==================== DOM 引用 ====================
const form = document.getElementById('clothes-form');
const formTitle = document.getElementById('form-title');
const editIdInput = document.getElementById('edit-id');
const nameInput = document.getElementById('clothes-name');
const typeSelect = document.getElementById('clothes-type');
const thicknessSelect = document.getElementById('clothes-thickness');
const colorInput = document.getElementById('clothes-color');
const imgInput = document.getElementById('clothes-img');
const presetList = document.getElementById('preset-clothes-list');
const wardrobeList = document.getElementById('wardrobe-list');
const emptyWardrobe = document.getElementById('empty-wardrobe');
const cancelEditBtn = document.getElementById('cancel-edit');

// ==================== 渲染预设样衣 ====================
function renderPresets() {
  presetList.innerHTML = '';
  PRESET_CLOTHES.forEach((item, index) => {
    // 检查素材图片是否存在，如果不存在用占位色块
    const div = document.createElement('div');
    div.className = 'preset-item';
    div.dataset.index = index;
    div.innerHTML = `<img src="${item.imgUrl}" alt="${item.name}" onerror="this.style.display='none';this.parentElement.style.background='#f8bbd0';this.parentElement.textContent='${item.name[0]}'">`;
    div.addEventListener('click', () => {
      document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('active'));
      div.classList.add('active');
      // 自动填充表单
      nameInput.value = item.name;
      typeSelect.value = item.type;
      thicknessSelect.value = String(item.thickness);
      colorInput.value = item.color;
      imgInput.value = item.imgUrl;
    });
    presetList.appendChild(div);
  });
}

// ==================== 渲染衣柜卡片 ====================
function renderWardrobe() {
  const clothes = getClothes();
  wardrobeList.innerHTML = '';
  if (clothes.length === 0) {
    emptyWardrobe.style.display = 'block';
    return;
  }
  emptyWardrobe.style.display = 'none';

  clothes.forEach(item => {
    const typeMap = { top: '上衣', outer: '外套', bottom: '裤子' };
    const thickMap = { 1: '薄', 2: '中等', 3: '厚' };

    const card = document.createElement('div');
    card.className = 'clothes-card';
    card.innerHTML = `
      <img class="clothes-img" src="${item.imgUrl}" alt="${item.name}"
        onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'padding:40px 0;font-size:2rem\\'>👕</div>'">
      <div class="clothes-name">${item.name}</div>
      <div class="clothes-tags">${typeMap[item.type] || item.type} · ${thickMap[item.thickness] || item.thickness} · ${item.color}</div>
      <div class="clothes-actions">
        <button class="btn btn-secondary btn-small" data-id="${item.id}">✏️ 编辑</button>
        <button class="btn btn-danger btn-small" data-id="${item.id}">🗑️ 删除</button>
      </div>
    `;

    card.querySelector('.btn-secondary').addEventListener('click', () => editClothes(item.id));
    card.querySelector('.btn-danger').addEventListener('click', () => deleteClothesItem(item.id));

    wardrobeList.appendChild(card);
  });
}

// ==================== 编辑衣物 ====================
function editClothes(id) {
  const item = getClothesById(id);
  if (!item) return;
  formTitle.textContent = '✏️ 编辑衣物';
  editIdInput.value = id;
  nameInput.value = item.name;
  typeSelect.value = item.type;
  thicknessSelect.value = String(item.thickness);
  colorInput.value = item.color;
  imgInput.value = item.imgUrl;
  cancelEditBtn.style.display = 'inline-block';
  // 高亮匹配的预设
  document.querySelectorAll('.preset-item').forEach(el => {
    const idx = parseInt(el.dataset.index);
    const preset = PRESET_CLOTHES[idx];
    if (preset && preset.imgUrl === item.imgUrl) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

// ==================== 删除衣物 ====================
function deleteClothesItem(id) {
  if (!confirm('确定要删除这件衣物吗？')) return;
  deleteClothes(id);
  renderWardrobe();
}

// ==================== 表单提交 ====================
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const type = typeSelect.value;
  const thickness = parseInt(thicknessSelect.value);
  const color = colorInput.value.trim();
  const imgUrl = imgInput.value.trim() || 'assets/clothes/placeholder.png';

  if (!name || !type || !thickness) {
    alert('请填写完整信息！');
    return;
  }

  const editId = editIdInput.value;

  if (editId) {
    // 编辑模式
    updateClothes(editId, { name, type, thickness, color, imgUrl });
    formTitle.textContent = '✏️ 新增衣物';
    editIdInput.value = '';
    cancelEditBtn.style.display = 'none';
  } else {
    // 新增模式
    addClothes({ name, type, thickness, color, imgUrl });
  }

  form.reset();
  imgInput.value = '';
  document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('active'));
  renderWardrobe();
});

// ==================== 取消编辑 ====================
cancelEditBtn.addEventListener('click', () => {
  formTitle.textContent = '✏️ 新增衣物';
  editIdInput.value = '';
  cancelEditBtn.style.display = 'none';
  form.reset();
  imgInput.value = '';
  document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('active'));
});

// ==================== 初始化 ====================
renderPresets();
renderWardrobe();