# 电子衣橱 · 命名规范对照表

> 三人必须统一使用以下名称，避免冲突

---

## 一、文件路径命名

| 用途 | 路径 | 负责人 |
|------|------|--------|
| 首页 | `index.html` | 成员C |
| 衣柜页面 | `wardrobe.html` | 成员A |
| 换装页面 | `dress-up.html` | 成员A |
| 收藏页面 | `collection.html` | 成员A |
| 公共样式 | `css/style.css` | 成员A |
| 数据持久层 | `js/storage.js` | 成员C |
| 业务逻辑层 | `js/logic.js` | 成员C |
| 衣柜交互 | `js/wardrobe.js` | 成员B |
| 换装交互 | `js/dress-up.js` | 成员B |
| 收藏交互 | `js/collection.js` | 成员B |
| 卡通化逻辑 | `js/cartoonizer.js` | 成员C |
| 卡通衣物素材 | `assets/clothes/` | 成员C统筹 |
| 卡通模特素材 | `assets/model/` | 成员C统筹 |

---

## 二、CSS 类名

> 命名风格：`kebab-case`（小写字母 + 中划线）
> 成员A 负责定义，成员B 在 JS 中只使用不新增

### 2.1 布局类

| 类名 | 用途 | 所属页面 |
|------|------|----------|
| `.container` | 内容容器（最大宽度 1200px 居中） | 全部 |
| `.page-header` | 页面顶部标题区 | 全部 |
| `.section-card` | 白色卡片区块 | 全部 |
| `.form-section` | 表单区块 | wardrobe |
| `.wardrobe-section` | 衣柜展示区块 | wardrobe |
| `.dressup-section` | 换装主区块 | dress-up |
| `.collection-section` | 收藏区块 | collection |

### 2.2 导航类

| 类名 | 用途 |
|------|------|
| `.navbar` | 顶部导航栏容器 |
| `.navbar-brand` | 品牌标题（"🎀 电子衣橱"） |
| `.navbar-links` | 导航链接列表 |
| `.navbar-links a` | 单个导航链接 |
| `.navbar-links a.active` | 当前页面的导航链接高亮 |

### 2.3 表单类

| 类名 | 用途 |
|------|------|
| `.clothes-form` | 衣物表单容器 |
| `.form-group` | 单个表单项容器 |
| `.form-group label` | 表单标签 |
| `.form-group input` | 表单输入框 |
| `.form-group select` | 表单下拉框 |
| `.form-actions` | 表单按钮操作区 |
| `.preset-list` | 预设样衣列表 |
| `.preset-item` | 单个预设样衣卡片 |
| `.preset-item.active` | 选中的预设样衣 |

### 2.4 卡片类

| 类名 | 用途 | 所属页面 |
|------|------|----------|
| `.clothes-card` | 衣物卡片（衣柜/换装选择共用） | wardrobe / dress-up |
| `.clothes-card.selected` | 已穿着的衣物（高亮边框） | dress-up |
| `.clothes-img` | 衣物卡片中的图片 |
| `.clothes-name` | 衣物名称文字 |
| `.clothes-tags` | 衣物标签信息（类型·厚度·材质·颜色） |
| `.clothes-actions` | 衣物操作按钮区 |
| `.today-outfit-card` | 今日穿搭卡片 | collection |
| `.collection-card` | 收藏列表卡片 | collection |
| `.outfit-name` | 穿搭名称 |
| `.outfit-date` | 穿搭日期 |
| `.outfit-clothes` | 穿搭中的衣物图片区 |
| `.outfit-rating` | 星级评分 |
| `.outfit-actions` | 穿搭操作按钮区 |
| `.outfit-snapshot` | 穿搭快照信息 |

### 2.5 按钮类

| 类名 | 用途 |
|------|------|
| `.btn` | 基础按钮样式 |
| `.btn-primary` | 主要按钮（粉色） |
| `.btn-secondary` | 次要按钮（灰色） |
| `.btn-danger` | 危险按钮（删除-红色） |
| `.btn-small` | 小号按钮 |

### 2.6 换装模特类

| 类名 | 用途 |
|------|------|
| `.model-canvas` | 模特画布容器 |
| `.model-body` | 模特身体（人物形象） |
| `.model-layer-inner` | 内层衣物层（上衣、裤子） |
| `.model-layer-outer` | 外层衣物层（外套） |

### 2.7 温度分析类

| 类名 | 用途 |
|------|------|
| `.temp-section` | 温度分析区域 |
| `.temp-hint` | 提示文字 |
| `.temp-suit` | 厚度信息文字 |
| `.temp-range` | 温度区间文字 |
| `.temp-advice` | 穿搭建议文字 |
| `.temp-advice.thin` | 偏薄提示（蓝色） |
| `.temp-advice.fit` | 合适提示（绿色） |
| `.temp-advice.thick` | 偏厚提示（橙色） |

### 2.8 空状态类

| 类名 | 用途 |
|------|------|
| `.empty-state` | 空状态提示容器 |
| `.empty-state p` | 空状态提示文字 |

### 2.9 拍照上传类

| 类名 | 用途 |
|------|------|
| `.photo-upload-group` | 拍照上传表单组（跨列） |
| `.photo-upload-area` | 拍照上传区域容器 |
| `.photo-upload-buttons` | 拍照/上传按钮组 |
| `.photo-preview-area` | 卡通化预览区域（紫色背景） |
| `.photo-preview-container` | 预览内容容器 |
| `.photo-preview-container canvas` | 预览画布 |
| `.photo-preview-actions` | 确认/取消按钮组 |

---

## 三、HTML ID

> 命名风格：`kebab-case`
> 成员A 在 HTML 中定义，成员B 在 JS 中通过 `getElementById()` 引用

### 3.1 全局

| ID | 元素类型 | 用途 |
|----|----------|------|
| `nav-wardrobe` | `<a>` | 导航-衣柜链接 |
| `nav-dressup` | `<a>` | 导航-换装链接 |
| `nav-collection` | `<a>` | 导航-收藏链接 |

### 3.2 衣柜页面（wardrobe.html）

| ID | 元素类型 | 用途 |
|----|----------|------|
| `form-title` | `<h3>` | 表单标题（新增/编辑切换） |
| `clothes-form` | `<form>` | 衣物表单 |
| `edit-id` | `<input hidden>` | 编辑模式下的衣物ID |
| `clothes-name` | `<input>` | 衣物名称 |
| `clothes-type` | `<select>` | 衣物类型 |
| `clothes-thickness` | `<select>` | 厚度等级 |
| `clothes-material` | `<select>` | 材质 |
| `clothes-style` | `<select>` | 款式 |
| `clothes-sleeve` | `<select>` | 袖长 |
| `clothes-color` | `<input>` | 颜色名称 |
| `clothes-colorhex` | `<input color>` | 颜色色值 |
| `clothes-img` | `<input hidden>` | 素材路径 |
| `preset-clothes-list` | `<div>` | 预设样衣列表容器 |
| `cancel-edit` | `<button>` | 取消编辑按钮 |
| `wardrobe-list` | `<div>` | 衣柜卡片列表容器 |
| `empty-wardrobe` | `<div>` | 衣柜空状态提示 |
| `open-camera-btn` | `<button>` | 打开摄像头拍照按钮 |
| `upload-photo-btn` | `<button>` | 上传图片按钮 |
| `photo-file-input` | `<input file>` | 文件选择器（隐藏） |
| `camera-preview` | `<video>` | 摄像头实时预览（隐藏） |
| `photo-preview-area` | `<div>` | 卡通化预览区域 |
| `photo-preview-canvas` | `<canvas>` | 卡通化结果展示 |
| `confirm-cartoon-btn` | `<button>` | 确认使用卡通化图片 |
| `cancel-photo-btn` | `<button>` | 取消拍照/上传 |

### 3.3 换装页面（dress-up.html）

| ID | 元素类型 | 用途 |
|----|----------|------|
| `model-canvas` | `<div>` | 模特画布容器 |
| `model-body` | `<div>` | 模特身体图层 |
| `model-layer-inner` | `<div>` | 内层衣物图层 |
| `model-layer-outer` | `<div>` | 外层衣物图层 |
| `clothes-select-list` | `<div>` | 衣物选择列表容器 |
| `empty-clothes-hint` | `<div>` | 衣柜为空提示 |
| `clear-all-btn` | `<button>` | 一键清空按钮 |
| `outside-temp` | `<input>` | 室外温度输入框 |
| `analyze-temp-btn` | `<button>` | 分析穿搭按钮 |
| `temp-result` | `<div>` | 温度分析结果展示区 |
| `outfit-name` | `<input>` | 穿搭名称输入框 |
| `star-rating` | `<div>` | 星级评分容器 |
| `rating-value` | `<input hidden>` | 评分值 |
| `save-outfit-btn` | `<button>` | 保存穿搭按钮 |

### 3.4 收藏页面（collection.html）

| ID | 元素类型 | 用途 |
|----|----------|------|
| `today-outfit-display` | `<div>` | 今日穿搭展示区 |
| `empty-today` | `<div>` | 今日穿搭为空提示 |
| `collection-list` | `<div>` | 收藏列表容器 |
| `empty-collection` | `<div>` | 收藏为空提示 |

---

## 四、JavaScript 全局函数名

> 命名风格：`camelCase`
> 成员C 定义在 `storage.js` 和 `logic.js` 中
> 成员B 调用这些函数，成员A 不碰 JS

### 4.1 storage.js（成员C）

| 函数名 | 调用方 | 说明 |
|--------|--------|------|
| `getClothes()` | 成员B | 获取所有衣物 |
| `addClothes(data)` | 成员B | 新增衣物 |
| `getClothesById(id)` | 成员B | 按ID获取衣物 |
| `getClothesByIds(ids)` | 成员B | 批量获取衣物 |
| `updateClothes(id, data)` | 成员B | 更新衣物 |
| `deleteClothes(id)` | 成员B | 删除衣物 |
| `getOutfits()` | 成员B | 获取所有穿搭收藏 |
| `addOutfit(data)` | 成员B | 新增穿搭收藏 |
| `deleteOutfit(id)` | 成员B | 删除穿搭收藏 |
| `getTodayOutfit()` | 成员B | 获取今日穿搭 |
| `saveTodayOutfit(outfit)` | 成员B | 保存今日穿搭 |
| `generateId(prefix)` | 内部 | 生成唯一ID |
| `getTodayDate()` | 内部 | 获取当天日期 |

### 4.2 logic.js（成员C）

| 函数名/常量 | 调用方 | 说明 |
|-------------|--------|------|
| `PRESET_CLOTHES` | 成员B | 10件预设样衣数据 |
| `calcEffectiveThickness(item)` | 成员B | 单件有效厚度 |
| `calcWeightedThickness(outfitState)` | 成员B | 加权总厚度 |
| `calcSuitableTempRange(effThickness)` | 成员B | 适宜温度区间 |
| `analyzeOutfitSuitability(temp, eff)` | 成员B | 穿搭适宜性分析 |
| `validateOutfitCombo(outfitState)` | 成员B | 穿搭合法性校验 |
| `validateOutfitSave(clothesIds)` | 成员B | 保存条件校验 |
| `validateClothesData(data)` | 成员B | 衣物数据验证 |
| `getTypeLabel(type)` | 成员B | 类型中文映射 |
| `getThicknessLabel(thickness)` | 成员B | 厚度中文映射 |
| `getMaterialLabel(material)` | 成员B | 材质中文映射 |
| `getStarsString(rating)` | 成员B | 评分转星星 |

### 4.3 cartoonizer.js（成员C）

| 函数名 | 调用方 | 说明 |
|--------|--------|------|
| `openCamera()` | 成员B | 打开摄像头，返回视频流 |
| `captureFromCamera(video)` | 成员B | 从摄像头截取当前帧为 Canvas |
| `loadImageToCanvas(file)` | 成员B | 从文件读取图片到 Canvas |
| `cartoonizeImage(sourceCanvas)` | 成员B | 核心卡通化算法（颜色量化+中值模糊+边缘检测+叠加） |
| `captureAndCartoonize(file)` | 成员B | 拍照/上传 → 卡通化 → 返回 dataURL（完整流程） |
| `canvasToDataURL(canvas)` | 成员B | Canvas 转 dataURL |
| `createImageFromDataURL(dataURL)` | 成员B | dataURL 转图片元素 |

### 4.4 交互层（成员B）— 仅内部使用

> 以下函数名成员B使用，成员A/C 不引用

| 文件 | 函数名 | 说明 |
|------|--------|------|
| wardrobe.js | `renderPresets()` | 渲染预设样衣 |
| wardrobe.js | `renderWardrobe()` | 渲染衣柜卡片 |
| wardrobe.js | `editClothes(id)` | 编辑衣物 |
| wardrobe.js | `deleteClothesItem(id)` | 删除衣物（含确认） |
| dress-up.js | `renderClothesSelect()` | 渲染衣物选择列表 |
| dress-up.js | `toggleClothes(item)` | 切换衣物穿着/脱下 |
| dress-up.js | `renderModel()` | 渲染模特 |
| dress-up.js | `clearTempResult()` | 清空温度分析结果 |
| collection.js | `renderTodayOutfit()` | 渲染今日穿搭 |
| collection.js | `renderCollection()` | 渲染收藏列表 |
| collection.js | `loadOutfit(id)` | 加载历史穿搭 |
| collection.js | `deleteOutfitItem(id)` | 删除收藏（含确认） |

---

## 五、localStorage Key

> 命名风格：`wardrobe_xxx`（统一前缀，避免与其他项目冲突）
> 成员C 定义在 `storage.js` 的 `STORAGE_KEYS` 常量中

| Key | 存储内容 | 数据类型 |
|-----|----------|----------|
| `wardrobe_clothes` | 所有衣物数据 | `Clothes[]` |
| `wardrobe_outfits` | 所有穿搭收藏 | `Outfit[]` |
| `wardrobe_today` | 今日穿搭 | `Outfit \| null` |

**⚠️ 禁止任何人直接使用字符串 `'wardrobe_clothes'` 等，必须通过 `STORAGE_KEYS` 常量引用：**
```javascript
// ✅ 正确
localStorage.getItem(STORAGE_KEYS.CLOTHES);

// ❌ 错误
localStorage.getItem('wardrobe_clothes');
```

---

## 六、数据模型字段名

> 衣物和穿搭方案的数据模型由成员C定义，任何人不得擅自修改字段名

### 6.1 衣物字段

| 字段名 | 类型 | 说明 | 谁使用 |
|--------|------|------|--------|
| `id` | `string` | 唯一标识（自动生成） | 全部 |
| `name` | `string` | 衣物名称 | 全部 |
| `type` | `string` | 类型：`top`/`outer`/`bottom` | 全部 |
| `thickness` | `number` | 厚度等级：`1`/`2`/`3` | 全部 |
| `material` | `string` | 材质标识 | 成员B/C |
| `materialCoeff` | `number` | 材质保暖系数 | 成员C |
| `color` | `string` | 颜色名称（中文） | 成员A/B |
| `colorHex` | `string` | 颜色色值（如 `#2196F3`） | 成员A |
| `style` | `string` | 款式标签 | 成员A |
| `sleeve` | `string` | 袖长：`long`/`short`/`none` | 成员A |
| `tags` | `string[]` | 扩展标签数组 | 成员C |
| `imgUrl` | `string` | 素材路径 | 全部 |

### 6.2 穿搭方案字段

| 字段名 | 类型 | 说明 | 谁使用 |
|--------|------|------|--------|
| `id` | `string` | 唯一标识（自动生成） | 全部 |
| `name` | `string` | 穿搭名称 | 全部 |
| `clothesIds` | `string[]` | 衣物ID数组 | 全部 |
| `rating` | `number` | 评分 0~5 | 全部 |
| `date` | `string` | 日期 `YYYY-MM-DD` | 全部 |
| `snapshot` | `object` | 静态快照（温度计算结果） | 成员B/C |

---

## 七、常量命名

> 定义在 `logic.js` 中，成员C维护

| 常量名 | 值类型 | 说明 |
|--------|--------|------|
| `TYPE_LABELS` | `{ top, outer, bottom }` | 类型中文映射 |
| `THICKNESS_LABELS` | `{ 1, 2, 3 }` | 厚度中文映射 |
| `MATERIAL_LABELS` | `{ cotton, wool, ... }` | 材质中文映射 |
| `MATERIAL_COEFF` | `{ cotton: 1.0, ... }` | 材质保暖系数 |
| `LAYER_WEIGHTS` | `{ inner: 1.0, outer: 0.6, bottom: 0.8 }` | 叠穿层权重 |
| `TEMP_CONFIG` | `{ baseTemp, baseEffective, factor, threshold }` | 温度计算参数 |
| `STORAGE_KEYS` | `{ CLOTHES, OUTFITS, TODAY_OUTFIT }` | localStorage Key |
| `VALID_TYPES` | `['top', 'outer', 'bottom']` | 允许的衣物类型 |
| `VALID_THICKNESS` | `[1, 2, 3]` | 允许的厚度值 |

---

## 八、分支命名

| 分支名 | 用途 | 谁使用 |
|--------|------|--------|
| `main` | 最终交付版本（禁止直接提交） | 成员C管理 |
| `dev` | 开发联调分支 | 全部 |
| `feature-wardrobe` | 衣柜模块开发 | 成员A |
| `feature-dressup` | 换装模块开发 | 成员B |
| `feature-collection` | 收藏模块开发 | 成员C |

---

## 九、避坑清单

1. **CSS 类名**：成员A 新增类名时，先在本文档登记，避免三人重复命名
2. **HTML ID**：ID 必须全局唯一，不同页面也不能重复
3. **JS 函数名**：成员B 新增函数时，用 `文件名_功能` 风格（如 `wardrobe_renderPresets`），避免与成员C 的函数重名
4. **localStorage Key**：永远通过 `STORAGE_KEYS` 常量引用，绝不用字符串字面量
5. **数据字段**：任何人不得修改 `storage.js` 中定义的字段名，如需新增字段，找成员C 确认
6. **素材路径**：所有素材放到 `assets/` 下，图片名用 `kebab-case`（如 `blue-coat.png`）