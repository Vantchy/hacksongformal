# 电子衣橱 · 接口文档

> 本文档定义项目中三层架构之间的所有公开接口。
> 交互层（成员B）调用逻辑层（成员C）的 API 完成功能。
> 遵循约定：**所有操作以 `clothing_id` 为唯一标准**。

---

## 一、数据模型定义

### 1.1 衣物数据模型

```javascript
{
  id: "clo_xxx",                        // string  - 唯一标识（自动生成）
  name: "蓝色冲锋衣",                   // string  - 衣物名称
  type: "top" | "outer" | "bottom",     // string  - 类型：上衣 / 外套 / 裤子
  thickness: 1 | 2 | 3,                // number  - 基础厚度等级（1薄 / 2中等 / 3厚）
  material: "cotton" | "wool" | "polyester" | "denim" | "fleece" | "nylon" | "silk" | "linen",
                                        // string  - 材质
  materialCoeff: 0.6~1.4,              // number  - 材质保暖系数
  color: "蓝色",                        // string  - 颜色名称（中文）
  colorHex: "#2196F3",                 // string  - 颜色色值（前端渲染用）
  style: "tshirt" | "hoodie" | "jacket" | "coat" | "jeans" | "shorts",
                                        // string  - 款式标签
  sleeve: "long" | "short" | "none",   // string  - 袖长
  tags: ["防风", "加绒"],               // string[] - 扩展标签数组（可自由扩展）
  imgUrl: "assets/clothes/xxx.png"     // string  - 素材路径
}
```

### 1.2 穿搭方案数据模型

```javascript
{
  id: "outfit_xxx",                     // string  - 唯一标识（自动生成）
  name: "我的穿搭",                      // string  - 穿搭名称
  clothesIds: ["clo_01", "clo_02"],    // string[] - 包含的衣物ID列表
  rating: 0~5,                          // number  - 星级评分
  date: "2026-09-03",                   // string  - 创建日期 YYYY-MM-DD
  snapshot: {                           // object  - ★ 保存时的静态快照
    totalThickness: 5,                  // number  - 保存时的加权有效厚度
    suitableMin: 18,                    // number  - 适宜温度下限
    suitableMax: 22,                    // number  - 适宜温度上限
    advice: "有效厚度 5，适宜 18°C~22°C", // string  - 温度分析建议文字
    clothesNames: ["蓝色冲锋衣","白色T恤"] // string[] - 衣物名称列表
  }
}
```

---

## 二、数据持久层 API（`storage.js`）

> 负责人：成员C
> 所有数据存储在浏览器 localStorage 中，无需后端服务器。

### 2.1 衣物 CRUD

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getClothes()` | 无 | `Array<Clothes>` | 获取所有衣物列表 |
| `getClothesById(id)` | `id: string` | `Clothes \| null` | 根据ID获取单件衣物 |
| `getClothesByIds(ids)` | `ids: string[]` | `Array<Clothes>` | 批量获取衣物 |
| `addClothes(data)` | `data: Clothes`（不含id） | `Clothes` | 新增衣物（自动生成id） |
| `updateClothes(id, data)` | `id: string, data: Partial<Clothes>` | `Clothes \| null` | 更新衣物 |
| `deleteClothes(id)` | `id: string` | `boolean` | 删除衣物 |

**`addClothes` 参数说明：**
- `name`（必填）— 衣物名称
- `type`（必填）— 衣物类型
- `thickness`（必填）— 厚度等级
- 其余字段可选，会自动补全默认值

**示例：**
```javascript
// 新增衣物
const newClothes = addClothes({
  name: '红色羽绒服',
  type: 'outer',
  thickness: 3,
  material: 'fleece',
  materialCoeff: 1.3,
  color: '红色',
  colorHex: '#E53935',
  style: 'coat',
  sleeve: 'long',
  tags: ['保暖', '加厚'],
  imgUrl: 'assets/clothes/red-down.png'
});

// 根据ID获取
const item = getClothesById('clo_abc123');

// 更新衣物
updateClothes('clo_abc123', { color: '深蓝', colorHex: '#1A237E' });

// 删除
deleteClothes('clo_abc123');
```

### 2.2 穿搭收藏 CRUD

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getOutfits()` | 无 | `Array<Outfit>` | 获取所有穿搭收藏 |
| `addOutfit(data)` | `data: { name, clothesIds, rating, snapshot }` | `Outfit` | 新增穿搭收藏（含快照） |
| `deleteOutfit(id)` | `id: string` | `boolean` | 删除穿搭收藏 |
| `getTodayOutfit()` | 无 | `Outfit \| null` | 获取今日穿搭（仅当天有效） |
| `saveTodayOutfit(outfit)` | `outfit: Outfit` | 无 | 保存今日穿搭 |

**`addOutfit` 参数说明：**
- `name`（可选）— 穿搭名称，默认"未命名穿搭"
- `clothesIds`（必填）— 衣物ID数组
- `rating`（可选）— 评分 0~5
- `snapshot`（可选）— 静态快照对象

**示例：**
```javascript
// 保存穿搭（含快照）
addOutfit({
  name: '冬日温暖搭配',
  clothesIds: ['clo_01', 'clo_02', 'clo_03'],
  rating: 4,
  snapshot: {
    totalThickness: 5.5,
    suitableMin: 10,
    suitableMax: 16,
    advice: '有效厚度 5.5，适宜 10°C~16°C',
    clothesNames: ['红色羽绒服', '米色毛衣', '黑色牛仔裤']
  }
});
```

### 2.3 工具函数

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `generateId(prefix)` | `prefix: string` | `string` | 生成唯一ID，如 `clo_a1b2c3d4` |
| `getTodayDate()` | 无 | `string` | 获取当天日期 `YYYY-MM-DD` |

---

## 三、业务逻辑层 API（`logic.js`）

> 负责人：成员C
> 所有纯业务逻辑、算法，不依赖 DOM，可独立测试。

### 3.1 温度推荐引擎

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `calcEffectiveThickness(item)` | `item: Clothes` | `number` | 计算单件衣物有效厚度 = thickness × materialCoeff |
| `calcWeightedThickness(outfitState)` | `outfitState: OutfitState` | `number` | 计算穿搭加权有效厚度（分层打折） |
| `calcSuitableTempRange(effectiveThickness)` | `effectiveThickness: number` | `{ min, max }` | 计算适宜温度区间 |
| `analyzeOutfitSuitability(outsideTemp, effectiveThickness)` | `outsideTemp: number, effectiveThickness: number` | `Result` | 分析穿搭适宜性 |

**`outfitState` 格式：**
```javascript
{
  top: Clothes | null,     // 当前穿着的上衣（完整对象）
  outer: Clothes | null,   // 当前穿着的的外套（完整对象）
  bottom: Clothes | null   // 当前穿着的的裤子（完整对象）
}
```

**温度计算规则：**
```
有效厚度 = 基础厚度 × 材质系数
加权有效厚度 = bottom有效厚度 × 0.8 + top有效厚度 × 1.0 + outer有效厚度 × 0.6
适宜温度区间 = 基础温度 ± (加权有效厚度 - 基准有效厚度) × 偏移因子
```

**材质系数表：**
| 材质 | 系数 | 说明 |
|------|------|------|
| `linen` 亚麻 | 0.6 | 最薄 |
| `silk` 丝绸 | 0.7 | 轻薄 |
| `nylon` 尼龙 | 0.8 | 防风但不保暖 |
| `polyester` 聚酯纤维 | 0.9 | 普通化纤 |
| `cotton` 棉质 | 1.0 | 基准材质 |
| `denim` 牛仔 | 1.1 | 较厚实 |
| `fleece` 抓绒 | 1.3 | 保暖性好 |
| `wool` 羊毛 | 1.4 | 最保暖 |

**`analyzeOutfitSuitability` 返回值：**
```javascript
{
  advice: "偏薄了！建议加厚衣物或加件外套 🥶",  // string - 建议文字
  type: "thin" | "fit" | "thick",              // string - 类型
  suitableMin: 10,                              // number - 适宜温度下限
  suitableMax: 16                               // number - 适宜温度上限
}
```

**示例：**
```javascript
// 输入：室外温度 20°C
const state = {
  top: { thickness: 1, materialCoeff: 1.0 },  // 白色T恤
  outer: { thickness: 3, materialCoeff: 0.9 }, // 蓝色冲锋衣
  bottom: { thickness: 2, materialCoeff: 1.1 } // 黑色牛仔裤
};

// 计算加权有效厚度
const eff = calcWeightedThickness(state);
// → 1×1.0×1.0 + 3×0.9×0.6 + 2×1.1×0.8 = 1.0 + 1.62 + 1.76 = 4.38

// 分析适宜性
const result = analyzeOutfitSuitability(20, eff);
// → { advice: "这套穿搭非常适合当前温度 ✅", type: "fit", suitableMin: 12, suitableMax: 24 }
```

### 3.2 穿搭校验

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `validateOutfitCombo(outfitState)` | `outfitState: OutfitState` | `{ valid, message }` | 校验穿搭是否合法 |
| `validateOutfitSave(clothesIds)` | `clothesIds: string[]` | `{ valid, message }` | 校验是否可以保存 |

**校验规则：**
- `validateOutfitCombo`：禁止"只有上衣没有裤子"或"只有裤子没有上衣"
- `validateOutfitSave`：禁止保存空穿搭（至少1件衣物）

### 3.3 数据验证

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `validateClothesData(data)` | `data: Partial<Clothes>` | `{ valid, errors }` | 验证衣物数据完整性 |

### 3.4 预设数据 & 映射工具

| 函数/常量 | 类型 | 说明 |
|-----------|------|------|
| `PRESET_CLOTHES` | `Clothes[]` | 10件预设样衣 Mock 数据 |
| `getTypeLabel(type)` | `string` | 类型中文映射：top→上衣、outer→外套、bottom→裤子 |
| `getThicknessLabel(thickness)` | `string` | 厚度中文映射：1→薄、2→中等、3→厚 |
| `getMaterialLabel(material)` | `string` | 材质中文映射 |
| `getStarsString(rating)` | `string` | 0~5 评分转 ★ 字符串 |

---

## 四、交互层 → 逻辑层 调用关系

### 4.1 衣柜页面（`wardrobe.js` → 成员B）

| 交互操作 | 调用的逻辑层 API | 说明 |
|----------|-----------------|------|
| 页面加载渲染预设样衣 | `PRESET_CLOTHES`（来自 logic.js） | 展示10件 Mock 样衣供选择 |
| 点击预设样衣填充表单 | `PRESET_CLOTHES[index]` | 自动填写所有字段 |
| 提交表单保存衣物 | `validateClothesData()` → `addClothes()` / `updateClothes()` | 先验证再保存 |
| 渲染衣柜列表 | `getClothes()` → `getTypeLabel()` / `getThicknessLabel()` / `getMaterialLabel()` | 读取数据并渲染 |

### 4.2 换装页面（`dress-up.js` → 成员B）

| 交互操作 | 调用的逻辑层 API | 说明 |
|----------|-----------------|------|
| 加载衣物列表 | `getClothes()` | 读取衣柜所有衣物 |
| 点击衣物切换穿着 | `state.currentOutfit` 状态管理 | 更新本地状态 |
| 点击"分析穿搭" | `validateOutfitCombo()` → `calcWeightedThickness()` → `analyzeOutfitSuitability()` | 三步完成温度分析 |
| 点击"保存穿搭" | `validateOutfitSave()` → `calcWeightedThickness()` → `calcSuitableTempRange()` → `addOutfit()` | 含静态快照保存 |

### 4.3 收藏页面（`collection.js` → 成员B）

| 交互操作 | 调用的逻辑层 API | 说明 |
|----------|-----------------|------|
| 渲染今日穿搭 | `getTodayOutfit()` → `getClothesByIds()` → `getStarsString()` | 展示快照信息 |
| 渲染收藏列表 | `getOutfits()` → `getClothesByIds()` → `getStarsString()` | 展示快照信息 |
| 删除收藏 | `deleteOutfit()` | 删除后重新渲染 |

---

## 五、常见接口调用示例

### 5.1 完整温度分析流程

```javascript
// 1. 用户输入室外温度 25°C
const outsideTemp = 25;

// 2. 获取当前穿搭状态
const outfitState = {
  top: { id: 'clo_02', name: '白色T恤', thickness: 1, materialCoeff: 1.0, ... },
  outer: null,
  bottom: { id: 'clo_03', name: '卡其短裤', thickness: 1, materialCoeff: 1.0, ... }
};

// 3. 校验穿搭合法性
const comboValid = validateOutfitCombo(outfitState);
if (!comboValid.valid) {
  // 显示错误提示
  return;
}

// 4. 计算加权有效厚度
const eff = calcWeightedThickness(outfitState);
// bottom: 1×1.0×0.8 = 0.8
// top:    1×1.0×1.0 = 1.0
// outer:  0
// total:  1.8

// 5. 分析适宜性
const result = analyzeOutfitSuitability(outsideTemp, eff);
// { advice: "偏薄了！建议加厚衣物或加件外套 🥶", type: "thin", suitableMin: 29, suitableMax: 41 }
```

### 5.2 完整保存穿搭流程

```javascript
// 1. 获取当前穿搭的衣物ID列表
const wornIds = ['clo_02', 'clo_03'];

// 2. 校验
const saveValid = validateOutfitSave(wornIds);
if (!saveValid.valid) return;

// 3. 计算快照
const eff = calcWeightedThickness(state.currentOutfit);
const range = calcSuitableTempRange(eff);

// 4. 保存（含快照）
const outfit = addOutfit({
  name: '夏日清爽搭配',
  clothesIds: wornIds,
  rating: 5,
  snapshot: {
    totalThickness: eff,
    suitableMin: range.min,
    suitableMax: range.max,
    advice: `有效厚度 ${eff}，适宜 ${range.min}°C~${range.max}°C`,
    clothesNames: ['白色T恤', '卡其短裤']
  }
});
```

---

## 六、注意事项

### 6.1 状态同步原则
- 所有操作（增删改穿脱）以 `clothing_id` 为唯一标准
- 穿搭状态改变时，传递完整穿搭快照，而非仅传递变更项

### 6.2 历史数据原则
- 收藏保存时**必须**附带 `snapshot` 快照（静态副本）
- 历史收藏的温度数据不随系统算法更新而改变

### 6.3 数据扩展原则
- 衣物数据中的 `tags` 数组预留扩展空间
- 如需增加新属性（如"防风级别"、"透气性"），直接添加到 `tags` 中即可，无需修改数据模型

### 6.4 加载顺序
```
storage.js → logic.js → (交互层 JS)
数据层       逻辑层       交互层
```

---

## 七、版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-09-03 | 初始版本，定义三层架构接口 |