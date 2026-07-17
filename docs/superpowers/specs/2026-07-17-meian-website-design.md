# 梅庵薪火·数字回响 — 展示网站设计规范

## 概述

为"至善梅庵·AI薪传实践团"搭建梅庵团史AI影像修复成果展示网站。网站以修复前后对比为核心，辅以历史时间轴和人物关系图谱，通过 GitHub Pages 部署为静态站点。

**目标用户**：青年学生、校史研究者、社交媒体传播受众

---

## 技术架构

### 技术选型

| 层 | 选型 | 理由 |
|---|---|---|
| 静态站点生成 | 11ty (Eleventy) | JS 数据文件天然适配人物关系数据结构，模板灵活 |
| 模板引擎 | Nunjucks (.njk) | 11ty 原生支持，语法接近 Jinja2，易维护 |
| 可视化 | ECharts 5.x | 力导向图开箱即用，国内 CDN 快速，文档中文 |
| 样式方案 | 纯 CSS（CSS Variables + CSS Grid/Flexbox） | 无需构建步骤，零运行时开销 |
| 部署 | GitHub Actions → gh-pages 分支 | 自动构建部署，推送即上线 |
| 托管 | GitHub Pages | 免费、稳定、自定义域名可选 |

### 项目目录结构

```
meian-website/
├── .github/workflows/deploy.yml   # 构建部署 CI
├── src/
│   ├── _data/
│   │   ├── characters.js          # 人物数据：[{id, name, birth, death, summary, tags, importance}]
│   │   ├── timeline.js            # 事件数据：[{date, title, desc, period, relatedChars}]
│   │   └── relations.js           # 关系边：[{source, target, type}]
│   ├── _includes/
│   │   ├── base.njk               # 全局 HTML 骨架（<head>、导航、页脚）
│   │   ├── character-card.njk     # 人物卡片（列表复用）
│   │   ├── comparison-viewer.njk  # 并排对比组件
│   │   └── section-header.njk     # 章节标题组件
│   ├── css/
│   │   └── style.css              # 全局样式（CSS Variables 定义配色）
│   ├── js/
│   │   ├── timeline.js            # 时间轴交互（筛选 + 滚动动画）
│   │   └── relations-graph.js     # ECharts 力导向图初始化
│   ├── index.njk                  # 首页
│   ├── characters.njk             # 人物列表页（所有人物卡片）
│   ├── character.njk              # 人物详情页模板（11ty pagination）
│   ├── timeline.njk               # 时间轴页
│   ├── relations.njk              # 关系图谱页
│   └── about.njk                  # 关于项目
├── final/                         # 修复后图片（符号链接或复制）
├── inputs/inputsF/                # 原始图片（符号链接或复制）
├── .eleventy.js                   # 11ty 配置
└── package.json
```

---

## 配色方案（东南大学视觉识别系统）

```css
:root {
  --color-green:      #527158;   /* 松针绿 — 主色：导航、标题、按钮 */
  --color-gold:       #fbc707;   /* 金陵黄 — 强调色：hover、节点、标签 */
  --color-green-dark: #3d5543;   /* 深绿 — 文字 hover、页脚背景 */
  --color-bg:         #fafaf5;   /* 米白 — 页面背景 */
  --color-card:       #ffffff;   /* 卡片白 */
  --color-text:       #2c2c2c;   /* 正文 */
  --color-text-light: #666666;   /* 辅助文字 */
  --color-border:     #e8e8e0;   /* 分割线 */
}
```

### 配色应用规则

- 导航栏：松针绿背景 + 白色文字
- 按钮/链接：松针绿，hover 时加深至 `--color-green-dark`
- 关键标记（时间轴节点、关系图选中节点）：金陵黄
- 页面背景始终为米白 `--color-bg`
- 内容卡片白色背景，hover 时边框变为松针绿

---

## 页面设计

### 1. 首页 (`index.njk`)

**Hero 区**
- 全宽，高度 80vh（移动端 60vh）
- 背景：从 `inputs/` 中选取梅庵实拍照片，CSS `background-image` + 松针绿半透明遮罩（`rgba(82,113,88,0.75)`）
- 标题："梅庵薪火 · 数字回响"，白色大字，居中
- 副标题："基于AI影像修复的梅庵团史数字化活化实践"，白色小字
- 底部向下箭头（CSS 动画 bounce），点击滚动到下一区

**项目简介区**
- 三列网格（移动端堆叠为单列）
- 卡片：AI影像修复 / 历史色彩考证 / 数字云端传播
- 每卡片：图标（emoji 或 SVG）+ 标题 + 一句话描述

**精选对比区**
- 标题："修复前后对比"
- 3-4 组横向排列（移动端 2 列或轮播）
- 每组：左原图 / 右修复图，下方标注人物姓名
- 整张卡片可点击 → 人物详情页

**页脚**
- 团队名称、东南大学 logo、GitHub 仓库链接
- 深绿背景 `--color-green-dark` + 白色文字

### 2. 人物详情页 (`character.njk`)

11ty 通过 `pagination` 为 `characters.js` 中每个人物生成独立页面。

**布局**（两栏，移动端单栏）：
- **左栏（60%）**：修复前后并排对比图
- **右栏（40%）**：姓名（大标题）+ 生卒年 + 生平简介（Markdown 渲染）+ 关联人物标签（可点击跳转）

**对比组件**：左图标注"修复前"，右图标注"修复后"，图片 `object-fit: contain`，点击可全屏灯箱查看。

**底部**："返回人物列表" 链接。

### 3. 人物列表页 (`characters.njk`)

- 网格布局，4 列（移动端 2 列）
- 每卡片：人物头像缩略图（修复后版本）+ 姓名 + 生卒年
- 顶部搜索/筛选栏：按姓名搜索 + 按时期标签筛选

### 4. 时间轴页 (`timeline.njk`)

**顶部筛选条**：横向标签按钮——全部 / 建团初期 / 团二大 / 抗战时期 / 建国后（点击切换 JS 过滤）

**时间轴主体**：
- 垂直居中的竖线（CSS `::before` 伪元素）
- 偶数事件卡片在左，奇数在右（移动端全部在右）
- 每卡片：日期 + 事件标题 + 简述 + 相关人物圆形头像（链接）
- 节点圆形用金陵黄，hover 放大

**滚动动画**：Intersection Observer 监听卡片进入视口时添加 `fade-in` class。

### 5. 人物关系图谱页 (`relations.njk`)

**全屏画布**（ECharts 力导向图）：
- 节点：圆形，颜色 = 松针绿，半径 ∝ 人物 importance 值
- 边：灰色细线，不同 `type` 用不同线型（实线/虚线/点线）
- 默认一屏展示全部节点，可拖拽、滚轮缩放

**交互**：
- Hover 节点 → 标签浮出（姓名 + 关系简述）
- 点击节点 → 侧边栏滑出，显示人物简介卡片 + "查看详情"按钮（跳转对应 `character` 页）
- 右下角图例：师生（实线）、同志（虚线）、同届（点线）

**移动端**：侧边栏改为底部 sheet 弹出。

### 6. 关于项目页 (`about.njk`)

- 项目背景介绍（摘自立项书）
- 团队成员列表
- 指导教师
- 鸣谢（校史馆、档案馆等）
- 图片来源声明

---

## 数据模型

### characters.js

```js
module.exports = [
  {
    id: "dzx",
    name: "邓中夏",
    birth: "1894",
    death: "1933",
    summary: "中国社会主义青年团早期领导人...",
    biography: "详细生平（支持 Markdown）...",
    period: "建团初期",       // 筛选标签
    importance: 5,            // 1-5，影响关系图节点大小
    tags: ["团二大代表", "工运领袖"],
  },
  // ... 约20条
];
```

**约定**：`id` 必须与 `inputs/inputsF/` 和 `final/` 中的文件名前缀一致（不含扩展名）。11ty 模板据此自动匹配图片路径。

### timeline.js

```js
module.exports = [
  {
    date: "1923-08-20",
    title: "团二大在梅庵召开",
    description: "中国社会主义青年团第二次全国代表大会...",
    period: "团二大",
    relatedChars: ["mzd", "dzx"],  // characters.id
  },
  // ...
];
```

### relations.js

```js
module.exports = [
  { source: "mzd", target: "dzx", type: "同志" },
  { source: "dzx", target: "zqb", type: "师生" },
  // ...
];
```

---

## 图片路径约定

| 类型 | 路径模式 | 说明 |
|------|----------|------|
| 原图 | `/inputs/inputsF/{id}.jpg` | 原始黑白老照片（均为 .jpg） |
| 修复图 | `/final/{id}.{ext}` | AI修复后图片（.png 或 .jpg），取第一个存在的 |
| 实拍图 | `/inputs/{filename}.jpg` | 梅庵实地拍摄照片（Hero 背景等） |

11ty 数据文件和模板中按以上约定拼接路径。修复图扩展名不统一的问题在模板层处理：优先找 `.png`，不存在则用 `.jpg`，都不存在则显示占位提示。

---

## 部署流程

```
开发者推送代码到 main 分支
  ↓
GitHub Actions 触发
  ├── checkout 仓库
  ├── npm ci
  ├── npx @11ty/eleventy  (输出到 _site/)
  └── 部署 _site/ 到 gh-pages 分支 (peaceiris/actions-gh-pages)
       ↓
GitHub Pages 自动从 gh-pages 分支提供服务
```

**域名**：默认 `{username}.github.io/meian-website/`，后续可绑定自定义域名。

---

## 非功能性需求

### 性能
- 图片使用 `<img loading="lazy">` 延迟加载
- 所有图片使用 `<img loading="lazy" sizes="(max-width: 800px) 100vw, 800px">`，浏览器按需加载
- 人物列表缩略图使用修复后图片 + CSS `object-fit: cover` 裁切为固定尺寸，无需额外生成
- ECharts 通过 CDN 异步加载（`<script defer>`）
- 目标：首页 Lighthouse 性能评分 ≥ 85

### 可访问性
- 所有图片提供 `alt` 文本
- 对比图区域使用语义化 `<figure>` + `<figcaption>`
- 键盘导航：链接焦点可见，图谱页提供表格视图回退

### 浏览器支持
- Chrome、Firefox、Safari、Edge 最近两个主版本
- 微信内置浏览器（关键兼容性验证项）

### 内容维护
- 新增人物：在 `characters.js` 中添加一条记录 + 放入原图和修复图 → 自动生成页面
- 修改配色：编辑 CSS Variables 顶部变量块，全局生效

---

## 风险与对策

| 风险 | 对策 |
|------|------|
| ECharts CDN 国内加载慢 | 提供 bootcdn / staticfile 国内镜像回退 |
| 修复图格式不统一 (.png/.jpg) | 模板层自动探测扩展名，构建时脚本统一处理 |
| 人物数据未整理完毕 | 网站先上线框架 + 部分已确认人物，后续持续补充 |
| GitHub Pages 构建超时 | 11ty 构建 < 30s，不构成风险 |

---

## 后续迭代

- V2：电子云画册嵌入（PDF / H5 翻页）
- V2：修复过程渐变短视频嵌入首页
- V2：深色模式
- V3：i18n（英文版）
