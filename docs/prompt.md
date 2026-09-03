# 电子衣橱 · 项目开发 Prompt

## 项目概述

纯静态网页版电子衣橱，无后端、无登录、无服务器数据库。所有数据使用浏览器 `localStorage` 本地存储。三人团队协作开发，共用一个 GitHub 主仓库。

## 技术栈

- HTML5 + CSS3（纯静态页面）
- JavaScript（ES6+）
- localStorage（数据持久化）
- Git + GitHub（版本控制）

## 团队分工

| 角色 | 成员 | 职责 |
|------|------|------|
| **前端** | 成员A | 所有 HTML 页面结构 + CSS 样式设计 |
| **后端-交互层** | 成员B | JS DOM 操作、事件绑定、UI 渲染、用户交互反馈 |
| **后端-逻辑层 + 仓库主管** | 成员C | 数据层（localStorage CRUD）、业务算法（温度计算）、首页开发、素材统筹、仓库管理 |

### 各成员负责文件

**成员A（前端）**
- `index.html` — 首页导航（页面结构部分）
- `wardrobe.html` — 衣柜页面
- `dress-up.html` — 换装页面
- `collection.html` — 收藏页面
- `css/style.css` — 全部样式

**成员B（后端-交互层）**
- `js/wardrobe.js` — 衣柜交互（DOM、事件、渲染）
- `js/dress-up.js` — 换装交互（DOM、事件、渲染）
- `js/collection.js` — 收藏交互（DOM、事件、渲染）

**成员C（后端-逻辑层 + 仓库主管）**
- `index.html` — 首页开发
- `js/storage.js` — 数据持久层（localStorage CRUD）
- `js/logic.js` — 业务逻辑层（温度算法、数据验证、映射工具）
- `assets/` — 素材制作与统筹
- 仓库管理（Git 分支、PR 审核、合并）

### 脚本加载顺序（每个页面通用）

```html
<script src="js/storage.js"></script>   <!-- 成员C：数据层 -->
<script src="js/logic.js"></script>     <!-- 成员C：逻辑层 -->
<script src="js/xxx.js"></script>       <!-- 成员B：交互层 -->
```

## 数据格式约定（三人必须统一）

### 衣物对象

```javascript
{
  id: "clo_xxx",                    // 唯一标识（自动生成）
  name: "蓝色冲锋衣",               // 衣物名称
  type: "top" | "outer" | "bottom", // 类型：上衣 / 外套 / 裤子
  thickness: 1 | 2 | 3,             // 厚度：1薄 / 2中等 / 3厚
  color: "蓝色",                     // 颜色
  imgUrl: "assets/clothes/xxx.png"  // 素材路径
}
```

### 穿搭方案对象

```javascript
{
  id: "outfit_xxx",                  // 唯一标识（自动生成）
  name: "我的穿搭",                   // 穿搭名称
  clothesIds: ["clo_01", "clo_02"], // 包含的衣物ID列表
  rating: 0-5,                       // 星级评分
  date: "2026-09-03"                 // 创建日期
}
```

## 项目目录结构

```
电子衣橱项目/
├── index.html              # 首页导航 → 成员C
├── wardrobe.html           # 衣柜页面 → 成员A
├── dress-up.html           # 换装页面 → 成员A
├── collection.html         # 收藏页面 → 成员A
├── docs/
│   └── prompt.md           # 项目开发文档
├── css/
│   └── style.css           # 公共样式 → 成员A
├── js/
│   ├── storage.js          # 数据持久层 → 成员C
│   ├── logic.js            # 业务逻辑层 → 成员C
│   ├── wardrobe.js         # 衣柜交互层 → 成员B
│   ├── dress-up.js         # 换装交互层 → 成员B
│   └── collection.js       # 收藏交互层 → 成员B
└── assets/
    ├── clothes/            # 卡通衣物素材 → 成员C统筹
    └── model/              # 卡通模特素材 → 成员C统筹
```

## Git 协作流程

### 分支规划

| 分支 | 用途 |
|------|------|
| `main` | 最终交付版本，禁止直接提交 |
| `dev` | 开发总分支，联调合并 |
| `feature-wardrobe` | 成员A：衣柜模块开发分支 |
| `feature-dressup` | 成员B：换装模块开发分支 |
| `feature-collection` | 成员C：收藏模块开发分支 |

### 协作流程

1. 成员C（Owner）创建 GitHub 主仓库，邀请 A、B 为协作者
2. 各自在独立功能分支开发（`feature-*`），互不干扰
3. 开发完成后发起 Pull Request → 成员C审核 → 合并到 `dev`
4. `dev` 整体调试无误后合并至 `main`

### 冲突规避

- 公共文件（导航栏、公共CSS）修改前三人提前沟通
- 尽量由成员C统一维护公共文件
- 数据格式变更必须通知所有人

## 功能清单

### MVP 必做

- [x] 项目骨架搭建
- [ ] 衣物信息录入（类型、厚度、材质、颜色）
- [ ] 衣柜卡片展示、新增、删除、编辑
- [ ] 衣柜数据 localStorage 持久化
- [ ] 卡通模特画布渲染
- [ ] 衣物上身、叠穿、单件脱衣、一键清空
- [ ] 叠穿图层管理（内层 → 外套）
- [ ] 穿搭温度计算（厚度加权）
- [ ] 穿搭适宜性分析
- [ ] 穿搭星级评分
- [ ] 穿搭方案保存到 localStorage
- [ ] 收藏列表展示
- [ ] 今日穿搭卡片
- [ ] 预设卡通样衣素材
- [ ] 页面间导航跳转

### 进阶选做

- [ ] 真实衣物图片上传
- [ ] 穿搭卡片导出为图片（html2canvas）
- [ ] 衣柜衣物筛选（按厚度、类别）
- [ ] 卡通人物形象自定义

## 开发避坑提醒

1. **「上传真实照片转卡通」难度很高**，纯静态网页很难实时卡通化。Demo 方案：使用提前制作的卡通样衣素材，直接选择样衣完成换装
2. **数据格式必须提前统一**，否则衣柜的数据换装页面读取失败
3. **公共文件修改前沟通**，避免多人同时修改同一文件导致冲突
4. **禁止直接向 main 分支提交代码**，必须通过 PR 合并
5. **时间紧张时优先裁剪**：照片上传、图片导出、衣物编辑、星级评分可砍掉