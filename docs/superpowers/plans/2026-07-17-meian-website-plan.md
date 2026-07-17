# 梅庵AI影像修复展示网站 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为"至善梅庵·AI薪传实践团"搭建基于11ty的AI影像修复成果展示网站，部署到GitHub Pages，支持修复前后对比、时间轴、人物关系图谱。

**Architecture:** 11ty静态站点生成器，以项目根目录为输入源，Nunjucks模板渲染，数据通过_data目录下的JS文件驱动。ECharts用于关系图谱。构建产物输出到_site/，通过GitHub Actions部署到gh-pages分支。

**Tech Stack:** 11ty 3.x, Nunjucks, ECharts 5.x, 纯CSS (CSS Variables + Grid/Flexbox), GitHub Actions, GitHub Pages

## Global Constraints

- 配色必须使用SEU标准色：松针绿 `#527158`、金陵黄 `#fbc707`
- 所有图片必须提供`alt`属性
- 图片使用`loading="lazy"`延迟加载
- 必须适配移动端（Chrome/Safari/Firefox/Edge + 微信内置浏览器）
- 人物数据文件中的`id`必须与`final/`和`inputs/inputsF/`中的文件名一致
- 修复图扩展名不统一（.png/.jpg），模板层需自动探测
- ECharts通过CDN加载，需提供国内镜像回退

---

## 文件结构

```
社会实践活动/                      ← 项目根目录 = 11ty input
├── .eleventy.js                   ← 11ty配置（input: ".", output: "_site"）
├── package.json                   ← 依赖：@11ty/eleventy
├── .gitignore                     ← 忽略 _site, node_modules
├── _data/                         ← 11ty全局数据
│   ├── characters.js              ← 人物数组
│   ├── timeline.js                ← 时间轴事件
│   └── relations.js               ← 人物关系边
├── _includes/                     ← 可复用模板组件
│   ├── base.njk                   ← 全局HTML骨架（导航+页脚）
│   ├── character-card.njk         ← 人物卡片
│   ├── comparison-viewer.njk      ← 并排对比组件
│   └── section-header.njk         ← 章节标题
├── css/
│   └── style.css                  ← 全局样式
├── js/
│   ├── timeline.js                ← 时间轴筛选+滚动动画
│   └── relations-graph.js         ← ECharts力导向图
├── index.njk                      ← 首页
├── characters.njk                 ← 人物列表页
├── character.njk                  ← 人物详情页（pagination模板）
├── timeline.njk                   ← 时间轴页
├── relations.njk                  ← 关系图谱页
├── about.njk                      ← 关于项目页
├── final/                         ← （已有）修复后图片
├── inputs/inputsF/                ← （已有）原始历史照片
├── inputs/                        ← （已有）实拍照片
├── _site/                         ← 11ty构建输出（gitignore）
└── .github/workflows/deploy.yml   ← 自动部署CI
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `package.json`
- Create: `.eleventy.js`
- Create: `.gitignore`

**Description:** 初始化11ty项目，配置输入输出，确保基础构建可运行。

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "meian-website",
  "version": "1.0.0",
  "description": "梅庵薪火·数字回响 — AI影像修复展示网站",
  "scripts": {
    "build": "npx @11ty/eleventy",
    "serve": "npx @11ty/eleventy --serve"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
cd "C:/Users/Lenovo/Desktop/社会实践活动" && npm install
```

期望：`node_modules/` 目录出现，`package-lock.json` 生成。

- [ ] **Step 3: 创建 .eleventy.js**

```js
module.exports = function (eleventyConfig) {
  // 复制静态资源到 _site/
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("final");
  eleventyConfig.addPassthroughCopy("inputs");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // 忽略非站点文件
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
  };
};
```

- [ ] **Step 4: 创建 .gitignore**

```
_site/
node_modules/
```

- [ ] **Step 5: 验证构建**

```bash
cd "C:/Users/Lenovo/Desktop/社会实践活动" && npx @11ty/eleventy --dryrun
```

期望：11ty列出将处理的文件，无错误。

---

### Task 2: 全局样式（SEU配色）

**Files:**
- Create: `css/style.css`

**Description:** 定义CSS Variables配色体系、基础重置样式、导航栏、页脚、卡片、响应式网格等全局样式。

- [ ] **Step 1: 创建 css/style.css**

```css
/* === CSS Variables === */
:root {
  --color-green:      #527158;
  --color-gold:       #fbc707;
  --color-green-dark: #3d5543;
  --color-bg:         #fafaf5;
  --color-card:       #ffffff;
  --color-text:       #2c2c2c;
  --color-text-light: #666666;
  --color-border:     #e8e8e0;
  --color-white:      #ffffff;
  --max-width:        1200px;
  --nav-height:       64px;
}

/* === Reset === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.7;
  padding-top: var(--nav-height);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: var(--color-green);
  text-decoration: none;
}
a:hover {
  color: var(--color-green-dark);
}

/* === Navigation === */
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--nav-height);
  background: var(--color-green);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
}

.nav__brand {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-white);
}

.nav__links {
  display: flex;
  gap: 24px;
  list-style: none;
}

.nav__links a {
  color: rgba(255,255,255,0.85);
  font-size: 0.95rem;
  transition: color 0.2s;
}
.nav__links a:hover,
.nav__links a.active {
  color: var(--color-gold);
}

.nav__toggle {
  display: none;
  background: none;
  border: none;
  color: var(--color-white);
  font-size: 1.5rem;
  cursor: pointer;
}

/* === Container === */
.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
}

/* === Section Header === */
.section-header {
  text-align: center;
  padding: 60px 0 40px;
}

.section-header__title {
  font-size: 2rem;
  color: var(--color-green);
  margin-bottom: 8px;
}

.section-header__subtitle {
  font-size: 1rem;
  color: var(--color-text-light);
}

/* === Card === */
.card {
  background: var(--color-card);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: border-color 0.3s, transform 0.3s;
}
.card:hover {
  border-color: var(--color-green);
  transform: translateY(-2px);
}

.card__body {
  padding: 16px;
}

.card__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-green);
}

.card__text {
  font-size: 0.9rem;
  color: var(--color-text-light);
  margin-top: 4px;
}

/* === Character Card === */
.char-card {
  text-align: center;
}

.char-card__thumb {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  background: var(--color-border);
}

.char-card__name {
  margin-top: 8px;
  font-weight: 600;
}

.char-card__years {
  font-size: 0.85rem;
  color: var(--color-text-light);
}

/* === Comparison Viewer === */
.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.comparison__side {
  text-align: center;
}

.comparison__side img {
  width: 100%;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: #f0f0f0;
  cursor: pointer;
}

.comparison__label {
  display: inline-block;
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--color-text-light);
  background: var(--color-bg);
  padding: 2px 12px;
  border-radius: 12px;
}

/* === Grid layouts === */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

/* === Timeline === */
.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 0;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 0; bottom: 0;
  width: 2px;
  background: var(--color-border);
  transform: translateX(-50%);
}

.timeline__item {
  position: relative;
  width: 45%;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s, transform 0.5s;
}

.timeline__item.visible {
  opacity: 1;
  transform: translateY(0);
}

.timeline__item:nth-child(odd) {
  margin-left: auto;
}

.timeline__item::before {
  content: "";
  position: absolute;
  top: 20px;
  width: 14px; height: 14px;
  background: var(--color-gold);
  border-radius: 50%;
  border: 3px solid var(--color-green);
}

.timeline__item:nth-child(even)::before {
  right: -31px;
}

.timeline__item:nth-child(odd)::before {
  left: -31px;
}

.timeline__date {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-green);
}

.timeline__title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 4px 0;
}

.timeline__desc {
  font-size: 0.9rem;
  color: var(--color-text-light);
}

.timeline__chars {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.timeline__char {
  display: inline-block;
  width: 32px; height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--color-border);
}

.timeline__char img {
  width: 100%; height: 100%;
  object-fit: cover;
}

/* === Filter bar === */
.filter-bar {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 24px 0;
}

.filter-bar__btn {
  padding: 6px 20px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-card);
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-bar__btn:hover,
.filter-bar__btn.active {
  background: var(--color-green);
  color: var(--color-white);
  border-color: var(--color-green);
}

/* === Relations Graph === */
.relations-container {
  position: relative;
  width: 100%;
  height: calc(100vh - var(--nav-height) - 40px);
  min-height: 500px;
  background: var(--color-card);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.relations-legend {
  position: absolute;
  right: 16px;
  bottom: 16px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.8rem;
}

.relations-legend__item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

.relations-legend__line {
  width: 24px;
  height: 2px;
}

.relations-legend__line--solid { border-top: 2px solid #999; }
.relations-legend__line--dashed { border-top: 2px dashed #999; }
.relations-legend__line--dotted { border-top: 2px dotted #999; }

/* === Sidebar === */
.sidebar {
  position: fixed;
  top: 0; right: 0;
  width: 360px;
  max-width: 90vw;
  height: 100vh;
  background: var(--color-card);
  box-shadow: -2px 0 12px rgba(0,0,0,0.1);
  z-index: 1001;
  padding: 24px;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 0.3s;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar__close {
  position: absolute;
  top: 16px; right: 16px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-light);
}

.sidebar__name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-green);
  margin-bottom: 4px;
}

.sidebar__years {
  font-size: 0.9rem;
  color: var(--color-text-light);
  margin-bottom: 12px;
}

.sidebar__summary {
  font-size: 0.95rem;
  line-height: 1.7;
}

.sidebar__link {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 20px;
  background: var(--color-green);
  color: var(--color-white);
  border-radius: 4px;
  font-size: 0.9rem;
}

/* === Footer === */
.footer {
  background: var(--color-green-dark);
  color: rgba(255,255,255,0.85);
  text-align: center;
  padding: 40px 24px;
  margin-top: 60px;
}

.footer__brand {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-white);
  margin-bottom: 8px;
}

.footer__links {
  display: flex;
  justify-content: center;
  gap: 16px;
  list-style: none;
  margin-top: 8px;
}

.footer__links a {
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
}

/* === Hero === */
.hero {
  height: 80vh;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  background-size: cover;
  background-position: center;
  color: var(--color-white);
  text-align: center;
  margin-top: calc(-1 * var(--nav-height));
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(82, 113, 88, 0.75);
}

.hero__content {
  position: relative;
  z-index: 1;
  padding: 0 24px;
}

.hero__title {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.hero__subtitle {
  font-size: 1.15rem;
  opacity: 0.9;
}

.hero__arrow {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  animation: bounce 2s infinite;
  cursor: pointer;
  color: var(--color-white);
  z-index: 1;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
  40% { transform: translateX(-50%) translateY(-10px); }
  60% { transform: translateX(-50%) translateY(-5px); }
}

/* === Character Detail === */
.char-detail {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 40px;
  align-items: start;
}

.char-detail__name {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-green);
}

.char-detail__years {
  font-size: 1rem;
  color: var(--color-text-light);
  margin: 4px 0 16px;
}

.char-detail__bio {
  font-size: 1rem;
  line-height: 1.9;
  margin-bottom: 20px;
}

.char-detail__related {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.char-detail__related a {
  display: inline-block;
  padding: 4px 12px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.char-detail__related a:hover {
  background: var(--color-green);
  color: var(--color-white);
  border-color: var(--color-green);
}

.back-link {
  display: inline-block;
  margin-top: 40px;
  font-size: 0.9rem;
}

/* === About === */
.about-section {
  max-width: 700px;
  margin: 0 auto;
}

.about-section h2 {
  color: var(--color-green);
  margin: 32px 0 12px;
}

.about-section p {
  margin-bottom: 12px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.team-member {
  text-align: center;
  padding: 16px;
  background: var(--color-card);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

/* === Lightbox === */
.lightbox {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.9);
  z-index: 2000;
  cursor: pointer;
}

.lightbox.open {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}

/* === Search === */
.search-bar {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  max-width: 600px;
  margin: 0 auto;
}

.search-bar__input {
  flex: 1;
  min-width: 200px;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 0.95rem;
  background: var(--color-card);
  outline: none;
}

.search-bar__input:focus {
  border-color: var(--color-green);
}

/* === Mobile === */
@media (max-width: 768px) {
  :root { --nav-height: 56px; }

  .nav__links {
    display: none;
    position: fixed;
    top: var(--nav-height);
    left: 0; right: 0;
    background: var(--color-green);
    flex-direction: column;
    padding: 16px 24px;
    gap: 12px;
  }

  .nav__links.open { display: flex; }
  .nav__toggle { display: block; }

  .hero {
    height: 60vh;
    min-height: 360px;
  }

  .hero__title { font-size: 1.8rem; }

  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .char-detail {
    grid-template-columns: 1fr;
  }

  .comparison {
    grid-template-columns: 1fr;
  }

  .timeline::before { left: 16px; }
  .timeline__item {
    width: auto;
    margin-left: 40px !important;
  }
  .timeline__item::before {
    left: -30px !important;
  }

  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

### Task 3: 基础布局模板

**Files:**
- Create: `_includes/base.njk`
- Create: `_includes/section-header.njk`

**Description:** 创建全局HTML骨架（导航+页脚）和章节标题组件。

- [ ] **Step 1: 创建 _includes/section-header.njk**

```njk
<div class="section-header">
  <h2 class="section-header__title">{{ title }}</h2>
  {% if subtitle %}
    <p class="section-header__subtitle">{{ subtitle }}</p>
  {% endif %}
</div>
```

- [ ] **Step 2: 创建 _includes/base.njk**

```njk
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% if title %}{{ title }} — {% endif %}梅庵薪火 · 数字回响</title>
  <meta name="description" content="基于AI影像修复的梅庵团史数字化活化实践">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav class="nav">
    <a href="/" class="nav__brand">梅庵薪火 · 数字回响</a>
    <button class="nav__toggle" id="navToggle" aria-label="菜单">☰</button>
    <ul class="nav__links" id="navLinks">
      {% set navItems = [
        { href: "/", label: "首页" },
        { href: "/characters/", label: "历史人物" },
        { href: "/timeline/", label: "时间轴" },
        { href: "/relations/", label: "人物关系" },
        { href: "/about/", label: "关于项目" }
      ] %}
      {% for item in navItems %}
        <li>
          <a href="{{ item.href }}"
             {% if page.url == item.href %}class="active"{% endif %}>
            {{ item.label }}
          </a>
        </li>
      {% endfor %}
    </ul>
  </nav>

  <main>
    {{ content | safe }}
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer__brand">至善梅庵·AI薪传实践团</div>
      <p>东南大学 2026 暑期社会实践</p>
      <ul class="footer__links">
        <li><a href="https://github.com" target="_blank" rel="noopener">GitHub</a></li>
        <li><a href="https://www.seu.edu.cn/" target="_blank" rel="noopener">东南大学</a></li>
      </ul>
    </div>
  </footer>

  <script>
    document.getElementById('navToggle').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('open');
    });
  </script>
</body>
</html>
```

---

### Task 4: 数据文件

**Files:**
- Create: `_data/characters.js`
- Create: `_data/timeline.js`
- Create: `_data/relations.js`

**Description:** 创建包含所有20位历史人物的数据文件。当前使用文件名缩写作为临时显示名，待团队补充正式姓名和生平。

- [ ] **Step 1: 创建 _data/characters.js**

```js
// 人物数据文件
// TODO: 请团队成员将每个条目中的 name、birth、death、summary、biography 替换为真实历史资料
// id 必须与 final/ 和 inputs/inputsF/ 中的文件名前缀一致

module.exports = [
  {
    id: "dzx",
    name: "邓中夏",
    birth: "1894",
    death: "1933",
    summary: "中国社会主义青年团早期领导人，团二大代表。",
    biography: "（待补充：邓中夏同志生平简介。请根据校史馆资料和历史文献填写。）",
    period: "建团初期",
    importance: 5,
    tags: ["团二大代表", "工运领袖"],
  },
  {
    id: "mzd",
    name: "毛泽东",
    birth: "1893",
    death: "1976",
    summary: "1923年以中共中央代表身份出席团二大并作报告，这是毛泽东同志唯一一次全程参与的团的全国代表大会。",
    biography: "（待补充：毛泽东同志与梅庵、团二大的历史关联。）",
    period: "团二大",
    importance: 5,
    tags: ["中共中央代表", "团二大"],
  },
  {
    id: "zqb",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "lyn",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "hrk",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "sct",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "zxn",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "lrj",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "lyy",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "yxj",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "xyd",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "hy",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "wxy",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "snzg",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "snsj",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "dnzp",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "njshkx",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "mgsx",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "dxsw",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
  {
    id: "dy",
    name: "（待确认）",
    birth: "",
    death: "",
    summary: "（待补充）",
    biography: "（待补充）",
    period: "建团初期",
    importance: 3,
    tags: [],
  },
];
```

- [ ] **Step 2: 创建 _data/timeline.js**

```js
// 梅庵团史时间轴
// TODO: 请团队成员根据校史资料补充更多事件和时间节点

module.exports = [
  {
    date: "1921-05",
    title: "南京社会主义青年团成立",
    description: "中国社会主义青年团南京地方委员会在东南大学（时称南京高等师范学校）成立，梅庵成为早期青年运动的重要据点。",
    period: "建团初期",
    relatedChars: [],
  },
  {
    date: "1923-08-20",
    title: "团二大在梅庵召开",
    description: "1923年8月20日至25日，中国社会主义青年团第二次全国代表大会在梅庵召开。毛泽东同志以中共中央代表身份全程参会并作报告，这是共青团史和中国青年运动史上的重大事件。",
    period: "团二大",
    relatedChars: ["mzd", "dzx"],
  },
  {
    date: "1923-08-25",
    title: "团二大闭幕",
    description: "大会选举产生新的团中央执行委员会，通过了多项重要决议案，推动了中国青年运动的发展。",
    period: "团二大",
    relatedChars: ["mzd", "dzx"],
  },
];
```

- [ ] **Step 3: 创建 _data/relations.js**

```js
// 人物关系边
// source 和 target 对应 characters.js 中的 id
// type: "师生" | "同志" | "同届"
// TODO: 请团队成员根据校史资料补充完整的人物关系

module.exports = [
  { source: "mzd", target: "dzx", type: "同志" },
];
```

- [ ] **Step 4: 创建 _data/site.js**

```js
// 站点全局配置
module.exports = {
  title: "梅庵薪火 · 数字回响",
  description: "基于AI影像修复的梅庵团史数字化活化实践",
  team: "至善梅庵·AI薪传实践团",
  school: "东南大学",
  year: "2026",
};
```

---

### Task 5: 组件模板

**Files:**
- Create: `_includes/character-card.njk`
- Create: `_includes/comparison-viewer.njk`

**Description:** 创建可复用的人物卡片和修复前后对比组件。

- [ ] **Step 1: 创建 _includes/character-card.njk**

```njk
{# 人物卡片组件
   @param {object} character - 人物数据对象
   @param {string} baseUrl - 链接基础路径（默认 "/characters/"）
#}
{% set restoredExt = "" %}
{% set hasPng = false %}
{# 11ty中无法直接检查文件系统，扩展名探测在构建时通过fallback处理 #}

<a href="/characters/{{ character.id }}/" class="card char-card">
  <img
    class="char-card__thumb"
    src="/final/{{ character.id }}.png"
    alt="{{ character.name }}修复后照片"
    loading="lazy"
    onerror="this.onerror=null; this.src='/final/{{ character.id }}.jpg';"
  >
  <div class="card__body">
    <div class="char-card__name">{{ character.name }}</div>
    {% if character.birth and character.death %}
      <div class="char-card__years">{{ character.birth }} – {{ character.death }}</div>
    {% endif %}
  </div>
</a>
```

**说明**：`onerror` 回退处理修复图 .png/.jpg 格式不统一的问题。如果 `.png` 不存在，浏览器自动尝试 `.jpg`。若两者都不存在，显示空白。

- [ ] **Step 2: 创建 _includes/comparison-viewer.njk**

```njk
{# 修复前后并排对比组件
   @param {string} charId - 人物ID
   @param {string} charName - 人物姓名
#}
<div class="comparison">
  <figure class="comparison__side">
    <img
      src="/inputs/inputsF/{{ charId }}.jpg"
      alt="{{ charName }}原始历史照片"
      loading="lazy"
      onclick="openLightbox(this.src)"
    >
    <figcaption class="comparison__label">修复前</figcaption>
  </figure>
  <figure class="comparison__side">
    <img
      src="/final/{{ charId }}.png"
      alt="{{ charName }}AI修复后照片"
      loading="lazy"
      onclick="openLightbox(this.src)"
      onerror="this.onerror=null; this.src='/final/{{ charId }}.jpg';"
    >
    <figcaption class="comparison__label">修复后</figcaption>
  </figure>
</div>

{# 全局灯箱（由base.njk包含的脚本控制） #}
<div class="lightbox" id="lightbox" onclick="closeLightbox()">
  <img id="lightboxImg" src="" alt="">
</div>

<script>
  function openLightbox(src) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightbox').classList.add('open');
  }
  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLightbox();
  });
</script>
```

---

### Task 6: 首页

**Files:**
- Create: `index.njk`

**Description:** 首页包含Hero大图区、项目简介三卡片、精选修复对比、页脚。

- [ ] **Step 1: 创建 index.njk**

```njk
---
layout: base.njk
title: 首页
---

{# Hero #}
<section class="hero" style="background-image: url('/inputs/IMG_20260704_151528.jpg');">
  <div class="hero__content">
    <h1 class="hero__title">梅庵薪火 · 数字回响</h1>
    <p class="hero__subtitle">基于AI影像修复的梅庵团史数字化活化实践</p>
  </div>
  <div class="hero__arrow" onclick="document.querySelector('.container').scrollIntoView({behavior:'smooth'})">↓</div>
</section>

<div class="container">

  {# 项目简介 #}
  {% include "section-header.njk" with { title: "项目简介", subtitle: "以AI技术活化红色记忆，用数字方式传承梅庵精神" } %}
  <div class="grid-3">
    <div class="card">
      <div class="card__body" style="text-align:center; padding:32px 16px;">
        <div style="font-size:2.5rem; margin-bottom:12px;">🖼️</div>
        <h3 class="card__title">AI影像修复</h3>
        <p class="card__text">利用深度学习模型对梅庵早期团史照片进行去噪、高清重建与色彩还原</p>
      </div>
    </div>
    <div class="card">
      <div class="card__body" style="text-align:center; padding:32px 16px;">
        <div style="font-size:2.5rem; margin-bottom:12px;">📜</div>
        <h3 class="card__title">历史色彩考证</h3>
        <p class="card__text">结合历史文献记载，对服饰、徽章、建筑环境色进行精准考证还原</p>
      </div>
    </div>
    <div class="card">
      <div class="card__body" style="text-align:center; padding:32px 16px;">
        <div style="font-size:2.5rem; margin-bottom:12px;">🌐</div>
        <h3 class="card__title">数字云端传播</h3>
        <p class="card__text">将修复成果转化为线上展示网站，让红色故事在网络空间广泛传播</p>
      </div>
    </div>
  </div>

  {# 精选对比 #}
  {% include "section-header.njk" with { title: "修复前后对比", subtitle: "AI技术让模糊的历史影像重获新生" } %}

  {% set featuredIds = ["mzd", "dzx", "zqb", "lyn"] %}
  <div class="grid-4">
    {% for fid in featuredIds %}
      {% set char = characters | findById(fid) %}
      {% if char %}
        <a href="/characters/{{ fid }}/" class="card" style="padding:8px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
            <img src="/inputs/inputsF/{{ fid }}.jpg" alt="{{ char.name }}原图" loading="lazy" style="aspect-ratio:3/4; object-fit:cover; background:#e0e0e0;">
            <img src="/final/{{ fid }}.png" alt="{{ char.name }}修复" loading="lazy" style="aspect-ratio:3/4; object-fit:cover; background:#e0e0e0;" onerror="this.onerror=null; this.src='/final/{{ fid }}.jpg';">
          </div>
          <div style="text-align:center; padding:8px 0 4px; font-size:0.9rem; font-weight:600;">{{ char.name }}</div>
        </a>
      {% endif %}
    {% endfor %}
  </div>

</div>
```

**说明**：模板中使用了自定义 filter `findById`——需要在 `.eleventy.js` 中注册。如果 11ty 版本不支持 Nunjucks 异步 filter，改用 `{% for c in characters %}{% if c.id == fid %}...` 的方式。参见 Task 12 中的 .eleventy.js 更新。

---

### Task 7: 人物列表页 + 详情页

**Files:**
- Create: `characters.njk`
- Create: `character.njk`

**Description:** 人物列表页展示所有人物的卡片网格（可搜索/筛选）。人物详情页展示修复前后大图对比+生平简介。

- [ ] **Step 1: 创建 characters.njk**

```njk
---
layout: base.njk
title: 历史人物
---

<div class="container">
  {% include "section-header.njk" with { title: "历史人物", subtitle: "点击人物查看AI修复对比与生平简介" } %}

  {# 搜索和筛选 #}
  <div class="search-bar" style="margin-bottom:32px;">
    <input type="text" class="search-bar__input" id="searchInput" placeholder="搜索人物姓名...">
    <select class="search-bar__input" id="periodFilter" style="max-width:160px;">
      <option value="">全部时期</option>
      <option value="建团初期">建团初期</option>
      <option value="团二大">团二大</option>
      <option value="抗战时期">抗战时期</option>
      <option value="建国后">建国后</option>
    </select>
  </div>

  <div class="grid-4" id="charGrid">
    {% for char in characters %}
      <div class="char-item" data-name="{{ char.name }}" data-period="{{ char.period }}">
        {% include "character-card.njk" with { character: char } %}
      </div>
    {% endfor %}
  </div>
</div>

<script>
  (function() {
    var search = document.getElementById('searchInput');
    var period = document.getElementById('periodFilter');
    var items = document.querySelectorAll('.char-item');

    function filter() {
      var q = (search.value || '').toLowerCase();
      var p = period.value || '';
      items.forEach(function(item) {
        var name = (item.dataset.name || '').toLowerCase();
        var per = item.dataset.period || '';
        var matchName = name.includes(q);
        var matchPeriod = !p || per === p;
        item.style.display = (matchName && matchPeriod) ? '' : 'none';
      });
    }

    search.addEventListener('input', filter);
    period.addEventListener('change', filter);
  })();
</script>
```

- [ ] **Step 2: 创建 character.njk**

```njk
---
layout: base.njk
pagination:
  data: characters
  size: 1
  alias: char
permalink: /characters/{{ char.id }}/
---

<div class="container">
  <div class="char-detail">
    {# 左：修复前后对比 #}
    <div>
      {% include "comparison-viewer.njk" with { charId: char.id, charName: char.name } %}
    </div>

    {# 右：人物信息 #}
    <div>
      <h1 class="char-detail__name">{{ char.name }}</h1>
      {% if char.birth and char.death %}
        <p class="char-detail__years">{{ char.birth }} – {{ char.death }}</p>
      {% endif %}

      <div class="char-detail__bio">
        {{ char.biography | safe }}
      </div>

      {% if char.tags and char.tags.length %}
        <div class="char-detail__related">
          {% for tag in char.tags %}
            <span style="display:inline-block;padding:4px 12px;background:var(--color-bg);border-radius:16px;font-size:0.85rem;margin-right:8px;">#{{ tag }}</span>
          {% endfor %}
        </div>
      {% endif %}

      {# 关联人物 #}
      {% set relatedIds = [] %}
      {% for rel in relations %}
        {% if rel.source == char.id %}{% set relatedIds = (relatedIds.push(rel.target), relatedIds) %}{% endif %}
        {% if rel.target == char.id %}{% set relatedIds = (relatedIds.push(rel.source), relatedIds) %}{% endif %}
      {% endfor %}

      {% if relatedIds | length %}
        <h3 style="margin-top:24px; color:var(--color-green);">关联人物</h3>
        <div class="char-detail__related">
          {% for rid in relatedIds %}
            {% for c in characters %}
              {% if c.id == rid %}
                <a href="/characters/{{ c.id }}/">{{ c.name }}</a>
              {% endif %}
            {% endfor %}
          {% endfor %}
        </div>
      {% endif %}
    </div>
  </div>

  <a href="/characters/" class="back-link">← 返回人物列表</a>
</div>
```

---

### Task 8: 时间轴页

**Files:**
- Create: `timeline.njk`
- Create: `js/timeline.js`

**Description:** 纵向时间轴 + 时期筛选 + Intersection Observer滚动动画。

- [ ] **Step 1: 创建 timeline.njk**

```njk
---
layout: base.njk
title: 历史时间轴
---

<div class="container">
  {% include "section-header.njk" with { title: "梅庵团史时间轴", subtitle: "追溯梅庵在中国青年运动史上的重要时刻" } %}

  {# 筛选条 #}
  <div class="filter-bar" id="timelineFilter">
    <button class="filter-bar__btn active" data-period="">全部</button>
    <button class="filter-bar__btn" data-period="建团初期">建团初期</button>
    <button class="filter-bar__btn" data-period="团二大">团二大</button>
    <button class="filter-bar__btn" data-period="抗战时期">抗战时期</button>
    <button class="filter-bar__btn" data-period="建国后">建国后</button>
  </div>

  {# 时间轴 #}
  <div class="timeline" id="timeline">
    {% for event in timeline %}
      <div class="timeline__item" data-period="{{ event.period }}">
        <div class="card" style="padding:20px;">
          <div class="timeline__date">{{ event.date }}</div>
          <div class="timeline__title">{{ event.title }}</div>
          <div class="timeline__desc">{{ event.description }}</div>
          {% if event.relatedChars | length %}
            <div class="timeline__chars">
              {% for rid in event.relatedChars %}
                {% for c in characters %}
                  {% if c.id == rid %}
                    <a href="/characters/{{ c.id }}/" title="{{ c.name }}" class="timeline__char">
                      <img src="/final/{{ c.id }}.png"
                           alt="{{ c.name }}"
                           loading="lazy"
                           onerror="this.onerror=null; this.src='/final/{{ c.id }}.jpg';">
                    </a>
                  {% endif %}
                {% endfor %}
              {% endfor %}
            </div>
          {% endif %}
        </div>
      </div>
    {% endfor %}
  </div>
</div>

<script defer src="/js/timeline.js"></script>
```

- [ ] **Step 2: 创建 js/timeline.js**

```js
(function () {
  // === 时期筛选 ===
  var filterBar = document.getElementById('timelineFilter');
  var items = document.querySelectorAll('.timeline__item');

  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-bar__btn');
      if (!btn) return;

      // 切换 active
      filterBar.querySelectorAll('.filter-bar__btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      var period = btn.dataset.period || '';
      items.forEach(function (item) {
        item.style.display = (!period || item.dataset.period === period) ? '' : 'none';
      });

      // 重新触发滚动动画
      setTimeout(updateVisibility, 100);
    });
  }

  // === Intersection Observer 滚动动画 ===
  function updateVisibility() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach(function (item) {
      if (item.style.display !== 'none') {
        observer.observe(item);
      }
    });
  }

  updateVisibility();
})();
```

---

### Task 9: 人物关系图谱页

**Files:**
- Create: `relations.njk`
- Create: `js/relations-graph.js`

**Description:** ECharts力导向图展示人物关系，点击节点弹出侧边栏。

- [ ] **Step 1: 创建 relations.njk**

```njk
---
layout: base.njk
title: 人物关系
---

<div class="container" style="padding-top:20px; padding-bottom:20px;">
  {% include "section-header.njk" with { title: "人物关系图谱", subtitle: "拖动节点探索梅庵历史人物之间的关联" } %}

  <div class="relations-container" id="relationsChart"></div>

  <div class="relations-legend">
    <div class="relations-legend__item">
      <span class="relations-legend__line relations-legend__line--solid"></span> 师生
    </div>
    <div class="relations-legend__item">
      <span class="relations-legend__line relations-legend__line--dashed"></span> 同志
    </div>
    <div class="relations-legend__item">
      <span class="relations-legend__line relations-legend__line--dotted"></span> 同届
    </div>
  </div>
</div>

{# 侧边栏 #}
<div class="sidebar" id="charSidebar">
  <button class="sidebar__close" id="sidebarClose">✕</button>
  <div id="sidebarContent"></div>
</div>

{# 注入图谱数据供 relations-graph.js 使用 #}
<script>
  var GRAPH_DATA = {
    characters: {{ characters | dump | safe }},
    relations: {{ relations | dump | safe }}
  };
</script>

{# ECharts CDN (国内镜像回退) #}
<script>
  (function() {
    var s = document.createElement('script');
    s.src = 'https://cdn.bootcdn.net/ajax/libs/echarts/5.5.0/echarts.min.js';
    s.onerror = function() {
      var fallback = document.createElement('script');
      fallback.src = 'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js';
      document.head.appendChild(fallback);
    };
    document.head.appendChild(s);
  })();
</script>
<script defer src="/js/relations-graph.js"></script>
```

- [ ] **Step 2: 创建 js/relations-graph.js**

```js
(function () {
  // 等待 ECharts 加载完成
  function init() {
    if (typeof echarts === 'undefined') {
      setTimeout(init, 200);
      return;
    }

    var container = document.getElementById('relationsChart');
    if (!container) return;

    // 从页面内嵌的全局数据构建图谱
    // 11ty 在 relations.njk 中通过 <script> 标签注入数据
    var chart = echarts.init(container);

    // 数据由模板注入为全局变量（见下方说明）
    if (typeof GRAPH_DATA === 'undefined') {
      container.innerHTML = '<p style="text-align:center;padding:60px;">关系图谱数据加载中...</p>';
      return;
    }

    // 构建节点
    var nodes = GRAPH_DATA.characters.map(function (c) {
      return {
        id: c.id,
        name: c.name,
        symbolSize: 20 + c.importance * 8,
        itemStyle: { color: '#527158' },
        emphasis: {
          itemStyle: { color: '#fbc707' },
        },
        // 携带额外数据供侧边栏使用
        birth: c.birth,
        death: c.death,
        summary: c.summary,
      };
    });

    // 构建边
    var lineStyleMap = {
      '师生': { type: 'solid' },
      '同志': { type: 'dashed' },
      '同届': { type: 'dotted' },
    };

    var links = GRAPH_DATA.relations.map(function (r) {
      return {
        source: r.source,
        target: r.target,
        lineStyle: Object.assign({ color: '#999', width: 1.5 }, lineStyleMap[r.type] || {}),
        label: {
          show: true,
          formatter: r.type,
          fontSize: 11,
          color: '#999',
        },
      };
    });

    var option = {
      tooltip: {
        formatter: function (params) {
          if (params.dataType === 'node') {
            return '<b>' + params.name + '</b><br/>' + (params.data.summary || '');
          }
          return params.data.label.formatter;
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          data: nodes,
          links: links,
          force: {
            repulsion: 300,
            edgeLength: [120, 250],
            gravity: 0.1,
          },
          emphasis: {
            focus: 'adjacency',
          },
          lineStyle: {
            color: '#999',
            curveness: 0.1,
          },
        },
      ],
    };

    chart.setOption(option);

    // === 点击节点 → 侧边栏 ===
    var sidebar = document.getElementById('charSidebar');
    var sidebarContent = document.getElementById('sidebarContent');
    var sidebarClose = document.getElementById('sidebarClose');

    chart.on('click', function (params) {
      if (params.dataType === 'node') {
        var d = params.data;
        sidebarContent.innerHTML =
          '<div class="sidebar__name">' + d.name + '</div>' +
          (d.birth && d.death
            ? '<div class="sidebar__years">' + d.birth + ' – ' + d.death + '</div>'
            : '') +
          '<div class="sidebar__summary">' + (d.summary || '暂无简介') + '</div>' +
          '<a href="/characters/' + d.id + '/" class="sidebar__link">查看详情 →</a>';
        sidebar.classList.add('open');
      }
    });

    sidebarClose.addEventListener('click', function () {
      sidebar.classList.remove('open');
    });

    // 响应窗口大小
    window.addEventListener('resize', function () {
      chart.resize();
    });
  }

  init();
})();
```

**数据注入方式**：在 `relations.njk` 末尾加入：

```njk
<script>
  var GRAPH_DATA = {
    characters: {{ characters | dump | safe }},
    relations: {{ relations | dump | safe }}
  };
</script>
```

**注意**：Nunjucks 的 `dump` filter 在 11ty 中默认不内置。替代方案是在 `.eleventy.js` 中注册：

```js
eleventyConfig.addFilter("dump", function(obj) {
  return JSON.stringify(obj);
});
```

---

### Task 10: 关于项目页

**Files:**
- Create: `about.njk`

**Description:** 项目背景、团队成员、指导教师、鸣谢、图片来源声明。

- [ ] **Step 1: 创建 about.njk**

```njk
---
layout: base.njk
title: 关于项目
---

<div class="container">
  {% include "section-header.njk" with { title: "关于项目" } %}

  <div class="about-section">
    <h2>项目背景</h2>
    <p>位于东南大学四牌楼校区的梅庵，是南京社会主义青年团的发祥地。1923年8月20日至25日，中国社会主义青年团第二次全国代表大会（"团二大"）在梅庵召开。</p>
    <p>据南京市委党史工办与东南大学的最新联合研究成果，"团二大"是毛泽东同志唯一一次全程参与的团的全国代表大会，在共青团史和中国青年运动史上具有极高分量。</p>
    <p>但在史料流传过程中，早期历史影像因年代久远存在破损、模糊和单色问题，阻碍了历史细节的直观呈现。本项目利用AI算法对梅庵早期团史照片进行去噪、高清重建与色彩还原，并通过数字化云展陈打破物理空间限制，让红色故事在网络空间广泛传播。</p>

    <h2>团队成员</h2>
    <div class="team-grid">
      <div class="team-member">
        <div style="font-weight:700;">梁铭宇</div>
        <div style="font-size:0.85rem;color:var(--color-text-light);">队长</div>
        <div style="font-size:0.8rem;color:var(--color-text-light);">213240840</div>
      </div>
      <div class="team-member">
        <div style="font-weight:700;">樊昊东</div>
        <div style="font-size:0.85rem;color:var(--color-text-light);">队员</div>
        <div style="font-size:0.8rem;color:var(--color-text-light);">213242159</div>
      </div>
      <div class="team-member">
        <div style="font-weight:700;">龚智腾</div>
        <div style="font-size:0.85rem;color:var(--color-text-light);">队员</div>
        <div style="font-size:0.8rem;color:var(--color-text-light);">213243494</div>
      </div>
      <div class="team-member">
        <div style="font-weight:700;">郜万里</div>
        <div style="font-size:0.85rem;color:var(--color-text-light);">队员</div>
        <div style="font-size:0.8rem;color:var(--color-text-light);">213243071</div>
      </div>
      <div class="team-member">
        <div style="font-weight:700;">孙溢欣</div>
        <div style="font-size:0.85rem;color:var(--color-text-light);">队员</div>
        <div style="font-size:0.8rem;color:var(--color-text-light);">213240774</div>
      </div>
    </div>

    <h2>指导教师</h2>
    <p>陈怡霏</p>

    <h2>鸣谢</h2>
    <p>东南大学校史馆、档案馆为本项目提供了宝贵的历史影像资料和学术指导。</p>

    <h2>图片来源声明</h2>
    <p>本网站展示的原始历史照片来源于东南大学校史馆和档案馆已公开或授权使用的馆藏资料。AI修复后的图片为技术处理成果，仅供学术交流和红色文化传播之用。如有版权疑问，请联系项目团队。</p>
  </div>
</div>
```

---

### Task 11: GitHub Actions 部署配置

**Files:**
- Create: `.github/workflows/deploy.yml`

**Description:** 配置自动构建部署CI：检出代码 → 安装依赖 → 运行11ty构建 → 部署到gh-pages。

- [ ] **Step 1: 创建 .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build with 11ty
        run: npx @11ty/eleventy

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "_site"

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

### Task 12: 11ty 配置完善与最终集成

**Files:**
- Modify: `.eleventy.js`

**Description:** 更新 .eleventy.js 注册 Nunjucks filter，确保所有模板可正常构建。验证全站构建成功。

- [ ] **Step 1: 更新 .eleventy.js**

```js
module.exports = function (eleventyConfig) {
  // 复制静态资源
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("final");
  eleventyConfig.addPassthroughCopy("inputs");

  // JSON dump filter（图谱数据注入用）
  eleventyConfig.addFilter("dump", function (obj) {
    return JSON.stringify(obj);
  });

  // 按ID查找人物 filter
  eleventyConfig.addFilter("findById", function (arr, id) {
    if (!arr) return null;
    return arr.find(function (item) { return item.id === id; });
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
  };
};
```

- [ ] **Step 2: 本地构建验证**

```bash
cd "C:/Users/Lenovo/Desktop/社会实践活动" && npx @11ty/eleventy
```

期望：无错误，`_site/` 目录生成，包含 `index.html`、`characters/` 子目录（每人一个）、`timeline/index.html`、`relations/index.html`、`about/index.html`，以及 `css/`、`js/`、`final/`、`inputs/` 目录的复制。

- [ ] **Step 3: 本地预览**

```bash
cd "C:/Users/Lenovo/Desktop/社会实践活动" && npx @11ty/eleventy --serve
```

期望：浏览器打开 `http://localhost:8080`，逐页验证：
- 首页 Hero + 三卡片 + 精选对比正常显示
- 人物列表页所有20张卡片渲染，搜索/筛选功能正常
- 人物详情页并排对比图正常，图片路径回退生效
- 时间轴页筛选、滚动动画正常
- 关系图谱页 ECharts 加载、节点点击侧边栏正常
- 移动端（浏览器DevTools模拟）布局正常

- [ ] **Step 4: 初始化 Git 仓库并推送**

```bash
cd "C:/Users/Lenovo/Desktop/社会实践活动"
git init
git checkout -b main
git add .
git commit -m "feat: 梅庵AI影像修复展示网站 — 11ty + GitHub Pages"
```

---

## 验证清单（所有Task完成后执行）

- [ ] 首页 Hero 背景图正常加载
- [ ] 人物列表页搜索框输入"毛"能筛选出毛泽东
- [ ] 人物详情页修复前后对比图都能正常显示（含 .png → .jpg 回退）
- [ ] 时间轴筛选按钮正确过滤事件
- [ ] 关系图谱节点可拖拽、点击弹出侧边栏
- [ ] 侧边栏"查看详情"跳转到正确的人物页
- [ ] 灯箱点击图片可放大查看、ESC 关闭
- [ ] 移动端（375px 宽度）：导航折叠菜单可用、对比图单列排列、时间轴居中
- [ ] 微信内置浏览器打开无明显样式问题
- [ ] GitHub Actions 构建日志无错误、gh-pages 部署成功
