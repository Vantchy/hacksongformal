/**
 * wardrobe.js - 衣柜模块（交互层）
 * 
 * 后端交互层负责人：成员B
 * 职责：DOM 操作、事件绑定、UI 渲染、用户交互反馈
 * 
 * 依赖的逻辑层（成员C）：
 *   storage.js  - 数据 CRUD
 *   logic.js    - 预设样衣数据、数据验证、映射工具
 *   cartoonizer.js - 拍照上传、Canvas 卡通化
 * ============================================================
 * 依赖说明：
 * - PRESET_CLOTHES           来自 logic.js
 * - getClothes() / addClothes() / ... 来自 storage.js
 * - validateClothesData() / getTypeLabel() / ... 来自 logic.js
 * - openCamera() / captureFromCamera() / loadImageToCanvas() / cartoonizeImage() 来自 cartoonizer.js
 */

// ==================== DOM 引用 ====================
const form = document.getElementById('clothes-form');
const formTitle = document.getElementById('form-title');
const editIdInput = document.getElementById('edit-id');
const nameInput = document.getElementById('clothes-name');
const typeSelect = document.getElementById('clothes-type');
const thicknessSelect = document.getElementById('clothes-thickness');
const materialSelect = document.getElementById('clothes-material');
const styleSelect = document.getElementById('clothes-style');
const sleeveSelect = document.getElementById('clothes-sleeve');
const colorInput = document.getElementById('clothes-color');
const colorHexInput = document.getElementById('clothes-colorhex');
const imgInput = document.getElementById('clothes-img');
const presetList = document.getElementById('preset-clothes-list');
const wardrobeList = document.getElementById('wardrobe-list');
const emptyWardrobe = document.getElementById('empty-wardrobe');
const cancelEditBtn = document.getElementById('cancel-edit');

// 拍照上传 DOM 引用
const openCameraBtn = document.getElementById('open-camera-btn');
const uploadPhotoBtn = document.getElementById('upload-photo-btn');
const photoFileInput = document.getElementById('photo-file-input');
const cameraPreview = document.getElementById('camera-preview');

// 第一步：暂存区（原始照片 → 裁剪/抠图）
const stagingArea = document.getElementById('photo-staging-area');
const stagingCanvas = document.getElementById('staging-canvas');
const autoBgRemoveBtn = document.getElementById('auto-bg-remove-btn');
const startCropBtn = document.getElementById('start-crop-btn');
const goCartoonBtn = document.getElementById('go-cartoon-btn');
const cancelStagingBtn = document.getElementById('cancel-staging-btn');

// 第二步：卡通化预览区
const cartoonArea = document.getElementById('photo-cartoon-area');
const cartoonPreviewCanvas = document.getElementById('photo-preview-canvas');
const confirmCartoonBtn = document.getElementById('confirm-cartoon-btn');
const cancelCartoonBtn = document.getElementById('cancel-cartoon-btn');

// ==================== 拍照上传状态 ====================
let cameraStream = null;
let rawCanvas = null;        // 原始照片 canvas
let processedCanvas = null;  // 裁剪/抠图后的 canvas
let isCropMode = false;      // 是否处于裁剪模式
let cropStart = null;        // 裁剪起点 {x, y}
let cropEnd = null;          // 裁剪终点 {x, y}
let hasCropSelection = false;// 是否已框选

// ==================== 渲染预设样衣 ====================
function renderPresets() {
  presetList.innerHTML = '';
  PRESET_CLOTHES.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'preset-item';
    div.dataset.index = index;
    div.innerHTML = `<img src="${item.imgUrl}" alt="${item.name}" onerror="this.style.display='none';this.parentElement.style.background='${item.colorHex}';this.parentElement.textContent='${item.name[0]}'">`;
    div.addEventListener('click', () => {
      document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('active'));
      div.classList.add('active');
      nameInput.value = item.name;
      typeSelect.value = item.type;
      thicknessSelect.value = String(item.thickness);
      materialSelect.value = item.material;
      styleSelect.value = item.style;
      sleeveSelect.value = item.sleeve;
      colorInput.value = item.color;
      colorHexInput.value = item.colorHex;
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
    const card = document.createElement('div');
    card.className = 'clothes-card';
    card.innerHTML = `
      <img class="clothes-img" src="${item.imgUrl}" alt="${item.name}"
        onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'padding:40px 0;font-size:2rem\\'>👕</div>'">
      <div class="clothes-name">${item.name}</div>
      <div class="clothes-tags">
        ${getTypeLabel(item.type)} · ${getThicknessLabel(item.thickness)} · ${getMaterialLabel(item.material)} · ${item.color}
      </div>
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
  materialSelect.value = item.material || 'cotton';
  styleSelect.value = item.style || 'tshirt';
  sleeveSelect.value = item.sleeve || 'short';
  colorInput.value = item.color || '';
  colorHexInput.value = item.colorHex || '#CCCCCC';
  imgInput.value = item.imgUrl || '';
  cancelEditBtn.style.display = 'inline-block';
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

  const data = {
    name: nameInput.value.trim(),
    type: typeSelect.value,
    thickness: parseInt(thicknessSelect.value),
    material: materialSelect.value,
    style: styleSelect.value,
    sleeve: sleeveSelect.value,
    color: colorInput.value.trim(),
    colorHex: colorHexInput.value,
    imgUrl: imgInput.value.trim() || 'assets/clothes/placeholder.png'
  };

  // 调用逻辑层验证
  const validation = validateClothesData(data);
  if (!validation.valid) {
    alert(validation.errors.join('\n'));
    return;
  }

  const editId = editIdInput.value;
  if (editId) {
    updateClothes(editId, data);
    formTitle.textContent = '✏️ 新增衣物';
    editIdInput.value = '';
    cancelEditBtn.style.display = 'none';
  } else {
    addClothes(data);
  }

  form.reset();
  colorHexInput.value = '#CCCCCC';
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
  colorHexInput.value = '#CCCCCC';
  imgInput.value = '';
  document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('active'));
  closeCamera();
  hideAllPhotoPreviews();
});

// ==================== 拍照上传交互 ====================

/**
 * 关闭摄像头
 */
function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  cameraPreview.style.display = 'none';
}

/** 隐藏所有拍照预览区域 */
function hideAllPhotoPreviews() {
  stagingArea.style.display = 'none';
  cartoonArea.style.display = 'none';
  isCropMode = false;
  cropStart = null;
  cropEnd = null;
  hasCropSelection = false;
}

/** 显示暂存区（原始照片） */
function showStagingArea(canvas) {
  rawCanvas = canvas;
  processedCanvas = null;
  isCropMode = false;
  cropStart = null;
  cropEnd = null;
  hasCropSelection = false;
  goCartoonBtn.style.display = 'none';
  startCropBtn.textContent = '✂️ 裁剪';

  // 绘制原始照片到暂存 canvas
  const ctx = stagingCanvas.getContext('2d');
  stagingCanvas.width = canvas.width;
  stagingCanvas.height = canvas.height;
  ctx.drawImage(canvas, 0, 0);
  stagingArea.style.display = 'block';
}

/** 更新暂存区 canvas 显示 */
function redrawStagingCanvas() {
  const ctx = stagingCanvas.getContext('2d');
  ctx.clearRect(0, 0, stagingCanvas.width, stagingCanvas.height);
  ctx.drawImage(processedCanvas || rawCanvas, 0, 0);

  // 如果在裁剪模式且有选区，绘制选区框
  if (isCropMode && cropStart && cropEnd) {
    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const w = Math.abs(cropEnd.x - cropStart.x);
    const h = Math.abs(cropEnd.y - cropStart.y);

    // 半透明遮罩（选区外变暗）
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, stagingCanvas.width, y);
    ctx.fillRect(0, y, x, h);
    ctx.fillRect(x + w, y, stagingCanvas.width - x - w, h);
    ctx.fillRect(0, y + h, stagingCanvas.width, stagingCanvas.height - y - h);

    // 选区边框（白色虚线）
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }
}

/** 显示卡通化预览区 */
function showCartoonArea(canvas) {
  const ctx = cartoonPreviewCanvas.getContext('2d');
  cartoonPreviewCanvas.width = canvas.width;
  cartoonPreviewCanvas.height = canvas.height;
  ctx.drawImage(canvas, 0, 0);
  stagingArea.style.display = 'none';
  cartoonArea.style.display = 'block';
}

// ==================== 拍照上传：打开摄像头 ====================
openCameraBtn.addEventListener('click', async () => {
  try {
    closeCamera();
    const stream = await openCamera();
    cameraStream = stream;
    cameraPreview.srcObject = stream;
    cameraPreview.style.display = 'block';
    cameraPreview.play();

    // 2秒后自动拍照
    setTimeout(() => {
      if (!cameraStream) return;
      const canvas = captureFromCamera(cameraPreview);
      closeCamera();
      showStagingArea(canvas);
    }, 2000);
  } catch (err) {
    alert('无法打开摄像头：' + err.message + '\n请使用上传图片功能');
  }
});

// ==================== 拍照上传：上传图片 ====================
uploadPhotoBtn.addEventListener('click', () => {
  photoFileInput.click();
});

photoFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const canvas = await loadImageToCanvas(file);
    showStagingArea(canvas);
  } catch (err) {
    alert('图片处理失败：' + err.message);
  }

  photoFileInput.value = '';
});

// ==================== 裁剪交互 ====================

/** 进入/退出裁剪模式 */
startCropBtn.addEventListener('click', () => {
  if (!rawCanvas) return;

  if (isCropMode) {
    // 退出裁剪模式
    isCropMode = false;
    cropStart = null;
    cropEnd = null;
    hasCropSelection = false;
    startCropBtn.textContent = '✂️ 裁剪';
    processedCanvas = null;
    goCartoonBtn.style.display = 'none';
    redrawStagingCanvas();
    return;
  }

  // 进入裁剪模式
  isCropMode = true;
  cropStart = null;
  cropEnd = null;
  hasCropSelection = false;
  processedCanvas = null;
  goCartoonBtn.style.display = 'none';
  startCropBtn.textContent = '❌ 取消裁剪';
  redrawStagingCanvas();
});

/** 在暂存 canvas 上拖拽选择区域 */
stagingCanvas.addEventListener('mousedown', (e) => {
  if (!isCropMode) return;
  const rect = stagingCanvas.getBoundingClientRect();
  const scaleX = stagingCanvas.width / rect.width;
  const scaleY = stagingCanvas.height / rect.height;
  cropStart = {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
  cropEnd = { ...cropStart };
  hasCropSelection = false;
});

stagingCanvas.addEventListener('mousemove', (e) => {
  if (!isCropMode || !cropStart) return;
  const rect = stagingCanvas.getBoundingClientRect();
  const scaleX = stagingCanvas.width / rect.width;
  const scaleY = stagingCanvas.height / rect.height;
  cropEnd = {
    x: Math.max(0, Math.min(stagingCanvas.width, (e.clientX - rect.left) * scaleX)),
    y: Math.max(0, Math.min(stagingCanvas.height, (e.clientY - rect.top) * scaleY))
  };
  redrawStagingCanvas();
});

stagingCanvas.addEventListener('mouseup', () => {
  if (!isCropMode || !cropStart || !cropEnd) return;

  const w = Math.abs(cropEnd.x - cropStart.x);
  const h = Math.abs(cropEnd.y - cropStart.y);

  if (w < 10 || h < 10) {
    // 选得太小，忽略
    cropStart = null;
    cropEnd = null;
    redrawStagingCanvas();
    return;
  }

  hasCropSelection = true;
  // 自动应用裁剪
  const x = Math.min(cropStart.x, cropEnd.x);
  const y = Math.min(cropStart.y, cropEnd.y);
  processedCanvas = cropCanvasRegion(rawCanvas, x, y, w, h);
  redrawStagingCanvas();
  goCartoonBtn.style.display = 'inline-block';
});

// ==================== 自动抠图 ====================
autoBgRemoveBtn.addEventListener('click', () => {
  if (!rawCanvas) return;
  isCropMode = false;
  cropStart = null;
  cropEnd = null;
  startCropBtn.textContent = '✂️ 裁剪';
  processedCanvas = autoRemoveBackground(rawCanvas);
  redrawStagingCanvas();
  goCartoonBtn.style.display = 'inline-block';
});

// ==================== 下一步 → 卡通化 ====================
goCartoonBtn.addEventListener('click', () => {
  const source = processedCanvas || rawCanvas;
  const cartoonCanvas = cartoonizeImage(source);
  showCartoonArea(cartoonCanvas);
});

// ==================== 确认使用卡通化图片 ====================
confirmCartoonBtn.addEventListener('click', () => {
  const dataURL = cartoonPreviewCanvas.toDataURL('image/png');
  imgInput.value = dataURL;
  nameInput.value = nameInput.value.trim() || '我的衣服';
  hideAllPhotoPreviews();
  closeCamera();

  document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('active'));
  alert('✅ 卡通化完成！请填写其他信息后保存');
});

// ==================== 取消暂存区 ====================
cancelStagingBtn.addEventListener('click', () => {
  hideAllPhotoPreviews();
  closeCamera();
});

// ==================== 取消卡通化预览 ====================
cancelCartoonBtn.addEventListener('click', () => {
  hideAllPhotoPreviews();
  closeCamera();
});

// ==================== 初始化 ====================
renderPresets();
renderWardrobe();