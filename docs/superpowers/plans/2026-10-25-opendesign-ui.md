# OpenDesign 暗色国风 TCG UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把大厅、选将和对战外壳改成规格里的暗色国风 TCG，规则、技能数据和 PeerJS 协议保持不动。

**Architecture:** 根目录 `DESIGN.md` 是视觉契约。`skills/open-design/frontend-design/` 放入未修改的 OpenDesign 技能，供改 CSS 前阅读；技能与规格冲突时以规格和 `DESIGN.md` 为准。`index.html` 只改外壳和类名。`style.css` 整文件按令牌重写。`game.js` 只改 `initLobby`、`selectScreen`、新增的 `fillSlot` / `confirmPick`、`seat` 和 `render` 里的展示语句。页面仍是静态文件，由 GitHub Pages 从仓库根目录发布。

**Tech Stack:** static HTML/CSS/JS, GitHub Pages, PeerJS unchanged

## Global Constraints

规格 `docs/superpowers/specs/2026-10-25-opendesign-ui-design.md` 的项目级要求，逐条照抄。每个任务都包含这些要求。

- 技术栈保持静态 HTML / CSS / JS。不引入框架、构建步骤、新字体 CDN 或第二份样式表。
- 这一轮只改布局、颜色、字体和组件外观。对局规则、技能数据、PeerJS 消息不变。
- 不改 `data/generals.js`、`data/cards.js`、`tools/`、`assets/portraits/`、`BALANCE.md`、`README.md`。
- 不改出牌、伤害、技能、AI、胜负、摸牌数、选将人数（仍是 8 选 1）和联机协议。
- 不把 `div` 卡牌改成 `<button>`，不加新手牌键盘操作。
- 不重绘立绘，不重跑 `tools/portraits.js`。不改 `FACTIONS`。
- 不新增攻击飞牌、粒子、光晕、模糊投影，不新增 `@keyframes`。只保留 `fl` 与 `sh`。
- 不放入 `frontend-design` 以外的 OpenDesign 技能。
- 脚本顺序保持不变：PeerJS `https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js`，然后 `data/generals.js`、`data/cards.js`、`game.js`。viewport 元信息保持 `width=device-width,initial-scale=1,maximum-scale=1`。
- `.hide` 必须仍是 `display: none !important`。
- 必须继续存在的 id：`select`、`battle`、`modes`、`pve`、`host`、`lobby`、`stats`、`rules`、`ruleBox`、`grid`、`detail`、`ai`、`aihand`、`table`、`deckinfo`、`log`、`me`、`actions`、`hand`、`prompt`、`over`。另外新增 `picked`、`picked-body`、`confirm`、`discardinfo`。
- 必须继续存在的类：`hide`、`gcard`、`fac`、`gn`、`portrait`、`seat`、`hp`、`skills`、`equip`、`card`、`back`、`ok`、`sel`、`trick`、`weapon`、`armor`、`k-zhan`、`k-bi`、`k-yao`、`float`、`bad`、`good`、`shake`、`wait`、`suit`、`red`、`modal`、`minis`。
- 色值只用规格第 6.1 节：`--ink #14110e`、`--ink-2 #1c1814`、`--wood #2a2118`、`--paper #f3e6c8`、`--paper-ink #1a120c`、`--text #f3ead7`、`--text-muted #b7aa96`、`--vermillion #c23a2e`、`--vermillion-deep #6e221c`、`--gold #e2c27a`、`--gold-line #d4a84b`、`--pip #e24b3c`、`--pip-empty #3a332c`、`--mat #24352c`、`--discard #1a1814`、`--wei #3d7ec8`、`--shu #3e8f5a`、`--wu #c44536`、`--qun-gold #c6a15b`、`--qun-purple #6b4c7a`、`--float-bad #ff6b6b`、`--float-good #7dcea0`、`--trick #f0d8c4`、`--equip #d7e2ea`、`--zhan #9d2b22`、`--bi #1e4f86`、`--yao #1d6b45`、`--disabled #4a302c`。主按钮字色 `#fff8ee`。落影色 `#0a0908`。红色花色 `#9d2b22`。
- 间距只用 `--s-1` 4px、`--s-2` 8px、`--s-3` 12px、`--s-4` 16px、`--s-5` 24px、`--s-6` 32px、`--s-7` 48px。边框宽度只用 2px、3px、4px。
- 断点只有一个：`min-width: 800px` 为桌面，`max-width: 799px` 为窄屏。
- 标题字体：`"Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", "PMingLiU", serif`。界面字体：`"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", system-ui, sans-serif`。
- 不要改 `showDetail`、`start`、`hostRoom`、`joinRoom`、`onMsg`、`tryStartNet` 的函数体。不要重排 `game.js` 的其余行。新增注释使用中文。
- 技能 blob：`SKILL.md` 为 `43fa4a5860b97b192fe05d67c6bd2d97bc643d3f`，`LICENSE.txt` 为 `f433b1a53f5b830a205fd2df78e2b34974656c7b`。

## 何时写实现代码

本计划文件只描述实现，不在写入本计划的提交里修改 `index.html`、`style.css`、`game.js`、`DESIGN.md` 或 `skills/`。

默认路径：等记载本计划的 PR #1 合并进 `main` 之后，从当时的 `main` 新建实现分支，按 Task 1 到 Task 9 的顺序提交。

合并前就要写实现时：提交留在 `cursor/opendesign-ui-spec-5b17`，让 PR #1 继续收录这些提交。不要把文档和实现对拆到两条互不包含的分支上。

任务按编号顺序做。Task 4 到 Task 6 的 CSS 是追加关系：Task 4 覆盖写入 `style.css`，Task 5 和 Task 6 只在文件末尾追加。

规格第 3 节要求先写 `DESIGN.md`，再复制技能，读完两者后再改 CSS。因此本计划把用户建议里的「先放入技能」改成 Task 2，把 `DESIGN.md` 放在 Task 1。Task 3 到 Task 9 与建议的拆分相同。

## 文件结构

| 文件 | 责任 | 任务 |
|---|---|---|
| `DESIGN.md` | 视觉契约。页面不加载它 | Task 1 创建 |
| `skills/open-design/frontend-design/SKILL.md` | 未修改的技能原文 | Task 2 创建 |
| `skills/open-design/frontend-design/LICENSE.txt` | 未修改的 Apache-2.0 全文 | Task 2 创建 |
| `skills/open-design/frontend-design/NOTICE` | 规格第 11 节的归属说明 | Task 2 创建 |
| `index.html` | 大厅 / 选将 / 对战外壳、必须保留的 id、四个脚本 | Task 3 修改 |
| `style.css` | 全部外观。令牌、大厅、选将、对战 | Task 4 重写，Task 5–6 追加 |
| `game.js` | 只改展示模板和选将确认前的槽 | Task 7 修改 |
| `README.md`、`data/`、`tools/`、`assets/`、`BALANCE.md` | 不改 | Task 8 用 diff 核对 |

`style.css` 继续是唯一的样式表。`game.js` 继续用现有的 `$`（`document.querySelector`）和现有的函数声明风格，不把文件拆开。

---

### Task 1: 从规格第 5–8 节写出根目录 DESIGN.md

**Files:**

- Create: `DESIGN.md`
- Read: `docs/superpowers/specs/2026-10-25-opendesign-ui-design.md`

**Interfaces:**

- Consumes: 规格第 5、6.1、6.2、6.3、6.4、7、8 节的原文。
- Produces: 根目录 `DESIGN.md`。章节顺序固定为：方向、颜色、字体、间距圆角边框木纹、断点、大厅选将对战布局、按钮到动效。后续 CSS 任务把这里的色值当作 `:root` 的唯一来源。

- [ ] **Step 1: 用规格原文生成 DESIGN.md**

在仓库根目录执行：

```bash
node <<'JS'
const fs = require('fs');
const spec = fs.readFileSync('docs/superpowers/specs/2026-10-25-opendesign-ui-design.md', 'utf8');
function slice(from, to) {
  const i = spec.indexOf(from);
  if (i < 0) throw new Error('找不到起点 ' + from);
  const j = spec.indexOf(to, i + from.length);
  if (j < 0) throw new Error('找不到终点 ' + to);
  return spec.slice(i, j).trim();
}
const parts = [
  ['# 方向', slice('## 5. 视觉方向', '## 6. 设计令牌')],
  ['# 颜色', slice('### 6.1 颜色', '### 6.2 字体')],
  ['# 字体', slice('### 6.2 字体', '### 6.3 间距、圆角、边框')],
  ['# 间距、圆角、边框、木纹', slice('### 6.3 间距、圆角、边框', '### 6.4 断点')],
  ['# 断点', slice('### 6.4 断点', '## 7. 屏幕布局')],
  ['# 大厅、选将、对战布局', slice('## 7. 屏幕布局', '## 8. 组件')],
  ['# 按钮、武将卡、出战槽、座位、手牌、牌堆、动效', slice('## 8. 组件', '## 9. 屏幕状态')],
];
const intro = `# 三国对决视觉契约

本文件由 \`docs/superpowers/specs/2026-10-25-opendesign-ui-design.md\` 第 5–8 节原样整理。页面不加载本文件。色值以规格为准；规格改了，本文件才跟着改。\`skills/open-design/frontend-design/SKILL.md\` 与本文件冲突时，以本文件和规格为准。

`;
fs.writeFileSync('DESIGN.md', intro + parts.map(([h, b]) => h + '\n\n' + b).join('\n\n') + '\n');
JS
```

- [ ] **Step 2: 核对色值和章节都在**

```bash
node <<'JS'
const fs = require('fs');
const t = fs.readFileSync('DESIGN.md', 'utf8');
const hex = ['#14110e','#1c1814','#2a2118','#f3e6c8','#1a120c','#f3ead7','#b7aa96','#c23a2e','#6e221c','#e2c27a','#d4a84b','#e24b3c','#3a332c','#24352c','#3d7ec8','#3e8f5a','#c44536','#c6a15b','#6b4c7a','#ff6b6b','#7dcea0','#f0d8c4','#d7e2ea','#9d2b22','#1e4f86','#1d6b45','#4a302c','#fff8ee','#0a0908'];
for (const h of hex) if (!t.includes(h)) throw new Error('缺少 ' + h);
for (const h of ['# 方向','# 颜色','# 字体','# 间距、圆角、边框、木纹','# 断点','# 大厅、选将、对战布局','# 按钮、武将卡、出战槽、座位、手牌、牌堆、动效']) if (!t.includes(h)) throw new Error('缺少 ' + h);
if (t.includes('## 11.') || t.includes('PeerJS')) throw new Error('DESIGN.md 混入了规格后半的实现说明');
console.log('DESIGN.md ok');
JS
```

Expected: `DESIGN.md ok`

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "Add the dark-ink TCG visual contract"
```

### Task 2: 放入 OpenDesign frontend-design 并核对 blob

**Files:**

- Create: `skills/open-design/frontend-design/SKILL.md`
- Create: `skills/open-design/frontend-design/LICENSE.txt`
- Create: `skills/open-design/frontend-design/NOTICE`

**Interfaces:**

- Consumes: 规格第 11 节的两个 blob 校验值和 `NOTICE` 全文。
- Produces: 上述三个文件。`SKILL.md` 与 `LICENSE.txt` 的 `git hash-object` 必须等于下面的校验值。CSS 任务开始前要阅读 `SKILL.md`。

- [ ] **Step 1: 按 blob 下载未修改副本**

blob SHA 不是提交 SHA。用 Git blobs API 取精确字节，不要用 `main` 的浮动地址。

```bash
mkdir -p skills/open-design/frontend-design
curl -fsSL -H "Accept: application/vnd.github.raw" -H "User-Agent: sanguo-duel-vendor" \
  -o skills/open-design/frontend-design/SKILL.md \
  https://api.github.com/repos/nexu-io/open-design/git/blobs/43fa4a5860b97b192fe05d67c6bd2d97bc643d3f
curl -fsSL -H "Accept: application/vnd.github.raw" -H "User-Agent: sanguo-duel-vendor" \
  -o skills/open-design/frontend-design/LICENSE.txt \
  https://api.github.com/repos/nexu-io/open-design/git/blobs/f433b1a53f5b830a205fd2df78e2b34974656c7b
```

不要用编辑器格式化这两个文件，不要补空行，不要改编码。

- [ ] **Step 2: 写入 NOTICE**

`skills/open-design/frontend-design/NOTICE` 的全文就是下面这 6 行，文件末尾保留一个换行：

```text
OpenDesign frontend-design

来源：https://github.com/nexu-io/open-design/tree/main/skills/frontend-design
上游：https://github.com/anthropics/skills/tree/main/skills/frontend-design
许可证：Apache License 2.0。全文见本目录 LICENSE.txt。
SKILL.md 与 LICENSE.txt 为未修改副本。本 NOTICE 是放入三国对决仓库时新增的归属说明。
```

- [ ] **Step 3: 核对校验值，失败就重新下载而不是手改**

```bash
git hash-object skills/open-design/frontend-design/SKILL.md
git hash-object skills/open-design/frontend-design/LICENSE.txt
```

Expected:

```text
43fa4a5860b97b192fe05d67c6bd2d97bc643d3f
f433b1a53f5b830a205fd2df78e2b34974656c7b
```

两个值有任何一个不同：删除该文件，重复 Step 1。不要为了凑校验值去编辑内容。

再确认没有多放技能：

```bash
find skills -type f | sort
```

Expected:

```text
skills/open-design/frontend-design/LICENSE.txt
skills/open-design/frontend-design/NOTICE
skills/open-design/frontend-design/SKILL.md
```

- [ ] **Step 4: Commit**

```bash
git add skills/open-design/frontend-design/SKILL.md skills/open-design/frontend-design/LICENSE.txt skills/open-design/frontend-design/NOTICE
git commit -m "Vendor OpenDesign frontend-design skill"
```

### Task 3: index.html 外壳

**Files:**

- Modify: `index.html`

**Interfaces:**

- Consumes: 现有四个脚本地址和必须保留的 id。
- Produces: `#select.screen-lobby` 外壳、`.select-layout`、`#picked`、`#discardinfo`、对战四段 `section`。`game.js` 仍用原来的 id 查找节点。`#confirm` 初始 `disabled`。`#pve` 与 `#host` 带 `btn-primary`。

- [ ] **Step 1: 用下面的文件覆盖 index.html**

```html
<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>三国对决 · Sanguo Duel</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div id="select" class="screen-lobby">
  <header class="mast">
    <h1>三国对决</h1>
    <p class="sub">1v1 卡牌对战 · 人机 / 联机 · 选择你的武将</p>
    <div id="modes">
      <button id="pve" class="btn-primary" type="button">人机对战（换一批武将）</button>
      <button id="host" class="btn-primary" type="button">创建联机房间</button>
    </div>
    <div id="lobby"></div>
    <div id="stats"></div>
    <button id="rules" type="button">规则</button>
    <div id="ruleBox" class="hide"></div>
  </header>
  <div class="select-layout">
    <div id="grid"></div>
    <aside id="picked">
      <h2>出战</h2>
      <div id="picked-body" aria-live="polite"><p class="slot-empty">点击左侧武将</p></div>
      <button id="confirm" class="btn-primary" type="button" disabled>选择出战</button>
    </aside>
  </div>
</div>
<div id="detail" class="modal hide"></div>
<div id="battle" class="hide">
  <section class="enemy-bar">
    <div id="ai" class="seat"></div>
    <div id="aihand" class="minis"></div>
  </section>
  <section id="table">
    <div class="zones">
      <div id="deckinfo"></div>
      <div id="discardinfo"></div>
    </div>
    <div id="log"></div>
  </section>
  <section class="self-bar">
    <div id="me" class="seat"></div>
  </section>
  <section class="hand-row">
    <div id="hand"></div>
    <div id="actions"></div>
  </section>
</div>
<div id="prompt" class="modal hide"></div>
<div id="over" class="modal hide"></div>
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
<script src="data/generals.js"></script>
<script src="data/cards.js"></script>
<script src="game.js"></script>
</body>
</html>
```

`#rules` 从副标题段落里挪到独立按钮。副标题原文不变。不要加字体 `<link>`，不要加第二个样式表。

- [ ] **Step 2: 核对 id、类和脚本**

```bash
node <<'JS'
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const ids = ['select','battle','modes','pve','host','lobby','stats','rules','ruleBox','grid','detail','ai','aihand','table','deckinfo','discardinfo','log','me','actions','hand','prompt','over','picked','picked-body','confirm'];
for (const id of ids) if (!html.includes(`id="${id}"`)) throw new Error('缺少 id ' + id);
for (const s of ['screen-lobby','select-layout','btn-primary','enemy-bar','self-bar','hand-row','class="modal hide"','aria-live="polite"','disabled']) if (!html.includes(s)) throw new Error('缺少 ' + s);
if (!html.includes('content="width=device-width,initial-scale=1,maximum-scale=1"')) throw new Error('viewport 变了');
const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const want = ['https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js','data/generals.js','data/cards.js','game.js'];
if (srcs.join('|') !== want.join('|')) throw new Error('脚本顺序 ' + srcs.join(','));
if ((html.match(/rel="stylesheet"/g) || []).length !== 1) throw new Error('样式表不是一份');
if (html.includes('fonts.googleapis') || html.includes('fonts.gstatic')) throw new Error('加了网络字体');
console.log('index.html ok');
JS
```

Expected: `index.html ok`

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Restructure the lobby, select, and battle shell"
```

### Task 4: style.css 令牌、底色、字体、按钮

**Files:**

- Modify: `style.css`（整文件替换）
- Read: `DESIGN.md`
- Read: `skills/open-design/frontend-design/SKILL.md`

**Interfaces:**

- Consumes: `DESIGN.md` 的色值、字体、间距、木纹、按钮和模态规则。技能只用于检查紫蓝渐变、玻璃拟态和模糊投影；它不能改色值，也不能把页面改成 React。
- Produces: `:root` 令牌、`body` 墨底木纹、`.hide`、标题、按钮、模态、规则面板、大厅 420px 列，以及 `.screen-lobby .select-layout{display:none}`。

- [ ] **Step 1: 先读契约和技能，确认两者都在**

```bash
test -f DESIGN.md && test -f skills/open-design/frontend-design/SKILL.md && echo ready
```

Expected: `ready`

阅读 `DESIGN.md` 全文和 `skills/open-design/frontend-design/SKILL.md`。技能若建议 React、新字体或另一套配色，忽略那些建议。

- [ ] **Step 2: 用下面的内容覆盖 style.css**

```css
:root{
  --ink:#14110e; --ink-2:#1c1814; --wood:#2a2118;
  --paper:#f3e6c8; --paper-ink:#1a120c;
  --text:#f3ead7; --text-muted:#b7aa96;
  --vermillion:#c23a2e; --vermillion-deep:#6e221c;
  --gold:#e2c27a; --gold-line:#d4a84b;
  --pip:#e24b3c; --pip-empty:#3a332c;
  --mat:#24352c; --discard:#1a1814;
  --wei:#3d7ec8; --shu:#3e8f5a; --wu:#c44536;
  --qun-gold:#c6a15b; --qun-purple:#6b4c7a;
  --float-bad:#ff6b6b; --float-good:#7dcea0;
  --trick:#f0d8c4; --equip:#d7e2ea;
  --zhan:#9d2b22; --bi:#1e4f86; --yao:#1d6b45;
  --disabled:#4a302c;
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:24px; --s-6:32px; --s-7:48px;
  --display:"Songti SC","STSong","Noto Serif SC","Source Han Serif SC","PMingLiU",serif;
  --ui:"PingFang SC","Microsoft YaHei","Noto Sans SC","Source Han Sans SC",system-ui,sans-serif;
}
*{box-sizing:border-box}
body{
  margin:0; min-height:100vh; color:var(--text);
  font-family:var(--ui); font-size:14px; line-height:1.45;
  background-color:var(--ink);
  background-image:repeating-linear-gradient(90deg,rgba(243,234,215,0.035) 0 1px,transparent 1px 8px);
}
.hide{display:none!important}
h1{
  margin:0; font-family:var(--display); font-weight:700; line-height:1.1;
  font-size:clamp(32px,6vw,56px); letter-spacing:0.14em; color:var(--gold);
  text-shadow:0 2px 0 var(--vermillion);
}
h2{margin:0; font-size:20px; line-height:1.3; font-weight:700}
.sub,#stats{color:var(--text-muted); text-align:center; margin:0}
button{
  margin:0; font-family:inherit; font-size:16px; font-weight:700; line-height:1.2;
  min-height:48px; padding:0 var(--s-4); border-radius:8px; cursor:pointer;
  background:transparent; color:var(--gold); border:2px solid var(--gold-line);
  box-shadow:0 3px 0 var(--paper-ink); transition:transform .1s;
}
button.btn-primary{
  background:var(--vermillion); color:#fff8ee; border:3px solid var(--paper-ink);
  box-shadow:0 4px 0 var(--vermillion-deep);
}
button:active{transform:translateY(2px); box-shadow:0 1px 0 var(--paper-ink)}
button.btn-primary:active{box-shadow:0 2px 0 var(--vermillion-deep)}
button:disabled,
button.btn-primary:disabled{
  cursor:default; opacity:1; transform:none;
}
button.btn-primary:disabled{background:var(--disabled); color:var(--text)}
button:focus-visible{outline:2px solid var(--gold); outline-offset:2px}
.modal{
  position:fixed; inset:0; margin:auto; z-index:30; text-align:center;
  width:min(92vw,420px); height:fit-content; max-height:90vh; overflow:auto;
  background:var(--paper); color:var(--paper-ink);
  border:4px solid var(--paper-ink); border-radius:12px;
  box-shadow:0 6px 0 var(--paper-ink); padding:var(--s-4);
}
.modal p{text-align:left}
.modal img{width:120px; image-rendering:pixelated; border:3px solid var(--paper-ink); border-radius:6px}
#over h2{text-align:center}
#ruleBox{
  width:100%; background:var(--paper); color:var(--paper-ink);
  border-radius:10px; padding:var(--s-3); font-size:14px; line-height:1.45;
  max-height:40vh; overflow:auto; text-align:left;
}
#ruleBox p{margin:var(--s-1) 0}
#select.screen-lobby{min-height:100vh; overflow:auto; padding-bottom:env(safe-area-inset-bottom)}
.screen-lobby .mast{
  width:min(100%,420px); margin:0 auto; padding:var(--s-6) var(--s-4);
  display:flex; flex-direction:column; align-items:center; gap:var(--s-4); text-align:center;
}
.screen-lobby .select-layout{display:none}
#modes{display:flex; flex-direction:column; align-items:center; gap:var(--s-4); width:100%}
#modes button{width:min(100%,280px)}
#lobby{width:100%}
#lobby input{
  width:100%; min-height:44px; box-sizing:border-box;
  background:var(--paper); color:var(--paper-ink);
  border:2px solid var(--paper-ink); border-radius:8px;
  font:inherit; font-size:14px; padding:var(--s-2);
}
```

这一步故意还不写武将卡和对战桌。大厅在旧 `game.js` 下仍会调用 `selectScreen()`，但 `.select-layout` 在 `screen-lobby` 里隐藏，所以首屏看不到武将墙。

- [ ] **Step 3: 核对令牌和旧紫色已经消失**

```bash
node <<'JS'
const css = require('fs').readFileSync('style.css','utf8');
for (const h of ['#14110e','#c23a2e','#e2c27a','#fff8ee','#4a302c']) if (!css.includes(h)) throw new Error('缺少 '+h);
for (const old of ['#2a1f3d','#3a2b52','#e6d7ff','#ffd23d','#3d2e57']) if (css.includes(old)) throw new Error('留下旧色 '+old);
if (!css.includes('.hide{display:none!important}')) throw new Error('hide 失效');
const stripped = css.replace(/repeating-linear-gradient/g,'');
if (stripped.includes('linear-gradient')) throw new Error('出现了非木纹的 linear-gradient');
if (/rgba?\([^)]+,\s*0?\.\d+\)/.test(css.replace('rgba(243,234,215,0.035)',''))) throw new Error('多了透明色');
console.log('base css ok');
JS
```

Expected: `base css ok`

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "Replace the page base with ink, paper, and gold tokens"
```

### Task 5: 选将墙、武将卡和出战槽

**Files:**

- Modify: `style.css`（只在末尾追加）

**Interfaces:**

- Consumes: Task 4 的 `:root` 和 `.screen-lobby .select-layout{display:none}`。
- Produces: `#select.screen-select` 的两列 / 上下布局、`.gcard`、`.faction-bar`、`.skill-line`、`#picked`。窄屏网格间距是 `--s-2`（8px），这样 320px 宽、左右页边 16px 时 `140+8+140` 正好等于 288px 内容宽，两列成立。桌面网格间距仍是 `--s-3`（12px），卡面 168×248。列间距是 `--s-5`（24px）。

- [ ] **Step 1: 确认 Task 4 的令牌还在**

```bash
node -e "const c=require('fs').readFileSync('style.css','utf8'); if(!c.includes('--ink:#14110e')||!c.includes('.screen-lobby .select-layout{display:none}')) process.exit(1)"
```

Expected: 退出码 0。

- [ ] **Step 2: 把下面的 CSS 追加到 style.css 末尾**

```css
#select.screen-select{
  width:min(1120px,100%); margin:0 auto;
  height:100vh; height:100dvh;
  display:flex; flex-direction:column; overflow:hidden;
}
#select.screen-select h1{font-size:24px; line-height:1.2; letter-spacing:0.08em}
#select.screen-select .mast{flex:none; padding:var(--s-2) var(--s-4) 0; text-align:center}
.screen-select #modes .btn-primary{
  background:transparent; color:var(--gold); border:2px solid var(--gold-line);
  box-shadow:0 3px 0 var(--paper-ink);
}
.select-layout{flex:1; min-height:0; padding:var(--s-4)}
#grid{align-content:start}
.gcard{
  width:168px; height:248px; display:flex; flex-direction:column;
  background:var(--ink-2); color:var(--text); cursor:pointer; overflow:hidden;
  border:4px solid var(--paper-ink); border-radius:10px;
  box-shadow:inset 0 0 0 2px var(--gold-line),0 6px 0 #0a0908;
  transition:transform .1s;
}
.gcard img{
  width:100%; height:148px; display:block; object-fit:cover; object-position:center;
  image-rendering:pixelated;
}
.faction-bar{height:8px; width:100%; flex:none}
.gcard.f-wei .faction-bar{background:var(--wei)}
.gcard.f-shu .faction-bar{background:var(--shu)}
.gcard.f-wu .faction-bar{background:var(--wu)}
.gcard.f-qun .faction-bar{background:var(--qun-gold); box-shadow:inset 0 -4px 0 var(--qun-purple)}
.gn{
  display:flex; align-items:center; gap:var(--s-1);
  padding:var(--s-2) var(--s-2) 0; font-size:16px; font-weight:700; line-height:1.2;
}
.gn small{margin-left:auto; color:var(--gold); font-size:12px; font-weight:700}
.fac{
  display:inline-block; background:var(--ink); color:var(--text);
  border-radius:4px; padding:0 6px; font-size:12px; font-weight:700;
}
.skill-line{
  margin-top:auto; padding:0 var(--s-2) var(--s-2);
  color:var(--text-muted); font-size:12px; line-height:1.35;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.gcard:hover{transform:translateY(-6px)}
.gcard.is-picked{outline:3px solid var(--gold); outline-offset:2px}
#picked{
  background:var(--wood); border:3px solid var(--paper-ink); border-radius:12px;
  padding:var(--s-4); display:flex; flex-direction:column; gap:var(--s-3); min-height:0;
}
#picked-body{min-height:0}
#picked img{width:120px; image-rendering:pixelated; border:3px solid var(--paper-ink); border-radius:6px}
.slot-name{margin:0; font-size:16px; font-weight:700}
.slot-hp{margin:0; color:var(--gold)}
.slot-skills p{margin:var(--s-2) 0; font-size:14px; line-height:1.45}
.slot-empty{margin:0; color:var(--text-muted)}
#confirm{width:100%}
@media (min-width:800px){
  .select-layout{display:grid; grid-template-columns:1fr 300px; gap:var(--s-5)}
  #grid,#picked{overflow:auto; min-height:0}
  #grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(168px,168px)); gap:var(--s-3); justify-content:start}
}
@media (max-width:799px){
  .select-layout{display:grid; grid-template-rows:1fr auto; gap:var(--s-3)}
  #grid{overflow:auto; min-height:0; display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:var(--s-2)}
  .gcard{width:auto}
  .slot-skills{max-height:72px; overflow:auto}
}
```

`.screen-lobby .select-layout{display:none}` 带类选择器，优先级高于这里的 `.select-layout{display:grid}`，大厅仍隐藏武将墙。群色条只用 `background` 加 `inset` 色带，不要写成 `linear-gradient`。势力汉字留在 `.fac` 墨底芯片上，不要放进 8px 色条。

- [ ] **Step 3: 核对选择器和窄屏两列公式**

```bash
node <<'JS'
const css = require('fs').readFileSync('style.css','utf8');
for (const s of ['.gcard.f-shu .faction-bar{background:var(--shu)}','.gcard.f-wu .faction-bar{background:var(--wu)}','inset 0 -4px 0 var(--qun-purple)','minmax(140px,1fr)','minmax(168px,168px)','.screen-select #modes .btn-primary']) if (!css.includes(s)) throw new Error('缺少 '+s);
const narrow = css.slice(css.indexOf('@media (max-width:799px)'));
if (!narrow.includes('gap:var(--s-2)')) throw new Error('窄屏网格不是 8px');
if (css.includes('linear-gradient(') && css.replace(/repeating-linear-gradient/g,'').includes('linear-gradient')) throw new Error('色条用了渐变');
console.log('select css ok');
JS
```

Expected: `select css ok`

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "Style the general wall and the single battle slot"
```

### Task 6: 对战桌、座位、手牌和现有动效

**Files:**

- Modify: `style.css`（只在末尾追加）

**Interfaces:**

- Consumes: Task 4 的令牌，以及 `index.html` 里的 `.enemy-bar`、`.zones`、`.self-bar`、`.hand-row`。
- Produces: 四行对战网格、96×136 / 窄屏 72×104 的手牌、28×40 的牌背、体力格、`.float` / `.shake` 的原关键帧。不可用的手牌用 `grayscale(0.35)`，不透明度保持 1。

- [ ] **Step 1: 确认令牌还在**

```bash
node -e "if(!require('fs').readFileSync('style.css','utf8').includes('--mat:#24352c')) process.exit(1)"
```

Expected: 退出码 0。

- [ ] **Step 2: 把下面的 CSS 追加到 style.css 末尾**

```css
#battle{
  width:min(1120px,100%); margin:0 auto; box-sizing:border-box;
  height:100vh; height:100dvh; overflow:auto;
  display:grid; grid-template-rows:auto minmax(120px,1fr) auto auto;
  gap:var(--s-3); padding:var(--s-3);
  padding-bottom:calc(var(--s-3) + env(safe-area-inset-bottom));
}
.enemy-bar{display:flex; gap:var(--s-3); align-items:center}
.enemy-bar .seat{flex:1; min-width:0}
#aihand{flex:1; min-width:0}
.seat{
  display:flex; gap:var(--s-3); position:relative;
  background:var(--ink-2); border:3px solid var(--paper-ink); border-radius:12px; padding:var(--s-2);
}
.portrait{
  width:96px; flex:none; position:relative; overflow:hidden;
  border:3px solid var(--paper-ink); border-radius:6px; background:var(--wood);
}
.portrait.f-wei{background:var(--wei)}
.portrait.f-shu{background:var(--shu)}
.portrait.f-wu{background:var(--wu)}
.portrait.f-qun{background:var(--qun-gold)}
.portrait img{width:100%; display:block; object-fit:cover; object-position:center; image-rendering:pixelated}
.portrait .fac{position:absolute; top:4px; left:4px}
.info{flex:1; min-width:0; font-size:14px}
.name{font-size:16px; font-weight:700; line-height:1.2}
.name em{font-size:12px; font-style:normal; background:var(--gold); color:var(--paper-ink); padding:0 4px; border-radius:4px}
.hp{display:flex; flex-wrap:wrap; align-items:center; gap:var(--s-1)}
.hp i{
  width:16px; height:16px; display:inline-block; box-sizing:border-box;
  background:var(--pip-empty); border:2px solid var(--paper-ink); border-radius:3px;
}
.hp i.on{background:var(--pip)}
.hpnum{color:var(--text); font-size:14px}
.skills span,.equip span{
  display:inline-block; background:var(--gold); color:var(--paper-ink);
  border-radius:4px; padding:0 5px; margin:2px var(--s-1) 0 0; cursor:help;
}
.equip span{background:var(--equip)}
.minis{display:flex; flex-wrap:nowrap; gap:2px; overflow-x:auto; min-height:40px}
#table{
  background:var(--mat); border:3px solid var(--paper-ink); border-radius:12px;
  padding:var(--s-3); display:grid; grid-template-rows:auto 1fr; gap:var(--s-3); min-height:0;
}
.zones{display:grid; grid-template-columns:1fr 1fr; gap:var(--s-3)}
#deckinfo,#discardinfo{
  min-width:120px; min-height:88px; box-sizing:border-box;
  border:3px solid var(--paper-ink); border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  color:var(--gold); font-size:20px; font-weight:700; line-height:1.2;
}
#deckinfo{background:var(--mat)}
#discardinfo{background:var(--discard)}
#log{overflow:auto; min-height:0; color:var(--text); font-size:14px; line-height:1.45}
#log div:first-child{color:var(--gold)}
.hand-row{display:grid; grid-template-columns:1fr 200px; gap:var(--s-3); align-items:end}
#hand{
  display:flex; flex-wrap:nowrap; gap:var(--s-2); min-width:0;
  overflow-x:auto; overflow-y:auto; padding-top:20px; -webkit-overflow-scrolling:touch;
}
#actions{display:flex; flex-direction:column; gap:var(--s-2)}
#actions button{width:100%; white-space:normal}
.card{
  width:96px; height:136px; flex:none; box-sizing:border-box;
  background:var(--paper); color:var(--paper-ink);
  border:3px solid var(--paper-ink); border-radius:8px; box-shadow:0 3px 0 #0a0908;
  padding:4px; display:flex; flex-direction:column; opacity:1;
  transition:transform .1s;
}
.card:not(.ok):not(.back){filter:grayscale(0.35)}
.card.ok{filter:none; cursor:pointer}
.card.ok:hover{transform:translateY(-6px)}
.card.sel{transform:translateY(-12px); outline:3px solid var(--vermillion)}
.card b{font-size:16px; line-height:1.2}
.card small{font-size:12px; line-height:1.35; overflow:hidden}
.card.trick{background:var(--trick)}
.card.weapon,.card.armor{background:var(--equip)}
.k-zhan b{color:var(--zhan)}
.k-bi b{color:var(--bi)}
.k-yao b{color:var(--yao)}
.card .suit{font-style:normal; font-size:12px; color:var(--paper-ink)}
.card .suit.red{color:#9d2b22}
.card.back{
  width:28px; height:40px; padding:0;
  background:repeating-linear-gradient(45deg,var(--vermillion) 0 4px,#8e2a22 4px 8px);
  border:2px solid var(--paper-ink); border-radius:4px; box-shadow:none;
}
.wait{color:var(--text-muted)}
.float{
  position:absolute; right:20px; top:10px; font-size:28px; font-weight:700;
  animation:fl .9s forwards; text-shadow:2px 2px 0 #14110e;
}
.float.bad{color:var(--float-bad)}
.float.good{color:var(--float-good)}
@keyframes fl{to{transform:translateY(-30px);opacity:0}}
.shake{animation:sh .3s}
@keyframes sh{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@media (max-width:799px){
  .enemy-bar{flex-direction:column; align-items:stretch}
  .portrait{width:72px}
  .hp i{width:14px; height:14px}
  .hand-row{grid-template-columns:1fr}
  #actions{flex-direction:row; flex-wrap:wrap}
  .card{width:72px; height:104px}
  .card.back{width:28px; height:40px}
}
```

牌背的斜纹是原来的背牌纹理，改成朱红，不是页面渐变。群武将的座位底只用 `--qun-gold`。4px 暗紫只留在 Task 5 的 `.gcard.f-qun .faction-bar`。不要再增加 `@keyframes`。

- [ ] **Step 3: 核对关键帧、旧透明度和手牌不换行**

```bash
node <<'JS'
const css = require('fs').readFileSync('style.css','utf8');
const names = [...css.matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)].map(m => m[1]).sort();
if (names.join(',') !== 'fl,sh') throw new Error('关键帧 '+names.join(','));
if (css.includes('opacity:.55') || css.includes('opacity:0.55')) throw new Error('不可用牌仍在降透明度');
if (!css.includes('filter:grayscale(0.35)')) throw new Error('缺少灰度');
if (!css.includes('flex-wrap:nowrap')) throw new Error('手牌仍会换行');
if (!css.includes('grid-template-columns:1fr 200px')) throw new Error('技能按钮不在手牌旁');
for (const old of ['#2a1f3d','#e6d7ff','#1f5a3a','max-width:560px']) if (css.includes(old)) throw new Error('旧规则还在 '+old);
console.log('battle css ok');
JS
```

Expected: `battle css ok`

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "Lay out the battle table, seats, and horizontal hand"
```

### Task 7: game.js 只改展示和选将槽

**Files:**

- Modify: `game.js`（只改下面点名的函数）

**Interfaces:**

- Consumes: `#select`、`#grid`、`#picked-body`、`#confirm`、`#stats`、`#deckinfo`、`#discardinfo`、`#actions`。`FACTIONS[g.f].n` 仍提供汉字。`g.f` 只用来拼类名 `f-wei` / `f-shu` / `f-wu` / `f-qun`。
- Produces:
  - `let PICK`
  - `fillSlot(g)`：写入槽并设置 `PICK`；`g` 为空时正文是「点击左侧武将」且 `#confirm.disabled === true`
  - `confirmPick()`：读取 `PICK`，分支与现在的 `#go` 相同
  - `selectScreen(ids)`：切换到 `screen-select`，画 8 张卡，点击只调用 `fillSlot`
  - `seat(p)` 的 HTML 字符串
  - `render()` 里的两句牌堆文本，以及 `btn(t, fn, dis, primary=true)`

- [ ] **Step 1: 先跑失败断言，确认现在一打开就会铺 8 张卡**

把下面的脚本存到临时文件并执行。脚本不写入仓库。

```bash
cat > /tmp/ui-select-check.js <<'JS'
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = process.cwd();
const elements = {};
function make() {
  const node = {
    id:'', textContent:'', className:'', disabled:false, title:'', value:'', _html:'',
    style:{setProperty(){ node.inline = (node.inline||0) + 1; }},
    classList:{
      bag:new Set(),
      add(c){ this.bag.add(c); },
      remove(c){ this.bag.delete(c); },
      toggle(c){ this.bag.has(c) ? this.bag.delete(c) : this.bag.add(c); },
      contains(c){ return this.bag.has(c); }
    },
    children:[],
    appendChild(ch){ this.children.push(ch); return ch; },
    prepend(){},
    onclick:null
  };
  Object.defineProperty(node, 'innerHTML', {
    get(){ return this._html; },
    set(v){ this._html = String(v); if (v === '') this.children.length = 0; }
  });
  return node;
}
const document = {
  querySelector(sel){ return sel.startsWith('#') ? (elements[sel.slice(1)] || null) : null; },
  createElement(){ return make(); },
  querySelectorAll(){ return []; }
};
for (const id of ['pve','host','rules','ruleBox','grid','stats','select','confirm','picked-body','lobby','deckinfo','discardinfo','log','hand','actions','ai','me','aihand','prompt','over','detail','battle','modes']) {
  const n = make(); n.id = id; elements[id] = n;
}
elements.select.classList.add('screen-lobby');
const ctx = {
  URLSearchParams, console, Math, JSON, Promise, setTimeout, Array, Object, Set, String, Number,
  document, localStorage:{}, navigator:{},
  location:{search:'', origin:'http://local', pathname:'/sanguo-duel/'}
};
ctx.window = ctx; ctx.HARNESS = true;
vm.createContext(ctx);
for (const f of ['data/generals.js','data/cards.js','game.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, {filename:f});
}
const boot = elements.grid.children.length;
if (boot !== 0) { console.log('boot cards ' + boot); process.exit(1); }
ctx.selectScreen(['caocao','liubei','sunquan','lvbu','feiyi','bulianshi','huaxiong','zhugeliang']);
const cards = elements.grid.children;
if (cards.length !== 8) throw new Error('offer ' + cards.length);
const first = cards[0];
if (!first.className.includes('gcard f-wei')) throw new Error('class ' + first.className);
if (!first.innerHTML.includes('faction-bar') || !first.innerHTML.includes('体力 4') || !first.innerHTML.includes('class="skill-line"')) throw new Error(first.innerHTML);
if (first.innerHTML.includes('--fc') || first.inline) throw new Error('仍写了 --fc');
if (!first.innerHTML.includes('【挟令】')) throw new Error('title 没有第二技能');
first.onclick();
if (elements.confirm.disabled || !elements['picked-body'].innerHTML.includes('曹操') || !elements['picked-body'].innerHTML.includes('【纳锋】')) throw new Error('槽没有填上');
first.onclick();
if (!elements.confirm.disabled || !elements['picked-body'].innerHTML.includes('点击左侧武将')) throw new Error('再次点击没有清空');
const shu = cards[4];
if (!shu.className.includes('f-shu') || !shu.innerHTML.includes('体力 2')) throw new Error('费祎卡 ' + shu.className);
const qun = cards[6];
if (!qun.className.includes('f-qun') || !qun.innerHTML.includes('体力 6')) throw new Error('华雄卡 ' + qun.className);
ctx.selectScreen(['guanyu','zhangfei','zhaoyun','machao','huangzhong','weiyan','pangtong','jiangwei']);
if (elements.confirm.disabled !== true || elements['picked-body'].innerHTML.includes('曹操')) throw new Error('换一批没有清空槽');
if (elements.grid.children.length !== 8) throw new Error('换一批后张数不对');
const src = fs.readFileSync(path.join(root,'game.js'),'utf8');
const body = src.slice(src.indexOf('function selectScreen'), src.indexOf('function showDetail'));
if (body.includes('showDetail')) throw new Error('selectScreen 仍调用 showDetail');
if (!src.includes("function showDetail(g){const d=$('#detail');const fc=FACTIONS[g.f];")) throw new Error('showDetail 被改了');
if (!src.includes("async function start(g,ag,net){\n $('#select').classList.add('hide');$('#battle').classList.remove('hide');")) throw new Error('start 被改了');
if (!src.includes('房间 <b>${code}</b> 已创建')) throw new Error('hostRoom 文案被改了');
if (!src.includes("send({type:'pick',id:g.id})") || !src.includes('NET.myPick=g') || !src.includes('if(!NET.conn)return')) throw new Error('确认分支不完整');
const again = elements.grid.children[0];
again.onclick();
let started = null;
ctx.start = function(g, ag){ started = [g.id, ag.id]; };
ctx.confirmPick();
if (!started || started[0] !== 'guanyu' || started[1] === 'guanyu') throw new Error('确认分支 ' + started);
console.log('select check ok');
JS
node /tmp/ui-select-check.js
```

Expected: 退出码 1，输出 `boot cards 8`。这是当前 `initLobby()` 立刻调用 `selectScreen()` 的结果。

- [ ] **Step 2: 替换选将相关函数**

把 `let OFFER=[];` 到 `selectScreen` 整函数换成下面的代码。不要改紧随其后的 `showDetail`。

```javascript
let OFFER=[],PICK=null;
function fillSlot(g){PICK=g;const body=$('#picked-body'),btn=$('#confirm');
 if(!g){body.innerHTML='<p class="slot-empty">点击左侧武将</p>';btn.disabled=true;return;}
 const fc=FACTIONS[g.f];
 body.innerHTML=`<img alt="${g.name}" src="assets/portraits/${g.id}.svg"><p class="slot-name"><span class="fac">${fc.n}</span>${g.name}</p><p class="slot-hp">体力 ${g.hp}</p><div class="slot-skills">${g.skills.map(s=>`<p><b>【${s.n}】</b>${s.t}</p>`).join('')}</div>`;
 btn.disabled=false;}
function confirmPick(){const g=PICK;if(!g)return;
 if(!NET){const pool=GENERALS.filter(x=>x!==g);start(g,pool[Math.random()*pool.length|0],false);return;}
 if(NET.role==='guest'){send({type:'pick',id:g.id});$('#grid').innerHTML='';$('#lobby').innerHTML=`你选择了${g.name}，等待房主选将…`;$('#confirm').disabled=true;return;}
 if(!NET.conn)return;NET.myPick=g;$('#grid').innerHTML='';$('#confirm').disabled=true;tryStartNet();}
function selectScreen(ids){const root=$('#select');root.classList.remove('screen-lobby');root.classList.add('screen-select');fillSlot(null);
 const grid=$('#grid');grid.innerHTML='';OFFER=ids||shuffle(GENERALS.map(g=>g.id)).slice(0,8);
 for(const id of OFFER){const g=GENERALS.find(x=>x.id===id);const fc=FACTIONS[g.f];const el=document.createElement('div');el.className=`gcard f-${g.f}`;
  const title=g.skills.map(s=>`【${s.n}】${s.t}`).join('\n');
  el.innerHTML=`<img alt="${g.name}" src="assets/portraits/${g.id}.svg"><div class="faction-bar"></div><div class="gn"><span class="fac">${fc.n}</span>${g.name}<small>体力 ${g.hp}</small></div><div class="skill-line" title="${title}">${g.skills[0].t}</div>`;
  el.onclick=()=>{for(const n of grid.children)n.classList.remove('is-picked');if(PICK===g){fillSlot(null);return;}el.classList.add('is-picked');fillSlot(g);};
  grid.appendChild(el);}
 const st=JSON.parse(localStorage.sgStats||'{"w":0,"l":0}');$('#stats').textContent=`人机战绩 ${st.w} 胜 ${st.l} 负 · 武将池 ${GENERALS.length} 位，每局随机 8 位`;}
```

`confirmPick` 比规格代码块多了两处 `$('#confirm').disabled=true`，分别在访客发送 `pick` 之后和房主写入 `NET.myPick` 之后。`if(!NET.conn)return` 仍在禁用之前，未连上的房主点确认不会把按钮关掉。人机分支仍调用原来的 `start`。

- [ ] **Step 3: 替换 initLobby**

把现在的：

```javascript
function initLobby(){const room=new URLSearchParams(location.search).get('room');
 $('#pve').onclick=()=>{selectScreen();};$('#host').onclick=()=>{$('#modes').classList.add('hide');hostRoom();};
 if(room)joinRoom(room.toUpperCase());else selectScreen();}
```

换成：

```javascript
function initLobby(){const room=new URLSearchParams(location.search).get('room');
 $('#pve').onclick=()=>{selectScreen();};$('#host').onclick=()=>{$('#modes').classList.add('hide');hostRoom();};
 const st=JSON.parse(localStorage.sgStats||'{"w":0,"l":0}');$('#stats').textContent=`人机战绩 ${st.w} 胜 ${st.l} 负 · 武将池 ${GENERALS.length} 位，每局随机 8 位`;
 $('#confirm').onclick=confirmPick;
 if(room)joinRoom(room.toUpperCase());}
```

文件底部的 `$('#rules')`、`$('#ruleBox').innerHTML=...`、`initLobby();` 和 `AUTO` 段保持原样。

- [ ] **Step 4: 替换 seat**

把 `seat` 换成：

```javascript
function seat(p){const fc=FACTIONS[p.g.f];
 return `<div class="portrait f-${p.g.f}"><img src="assets/portraits/${p.g.id}.svg" alt="${p.g.name}"><span class="fac">${fc.n}</span></div>
 <div class="info"><div class="name">${p.g.name}${G.cur===p&&!G.over?' <em>行动中</em>':''}</div><div class="hp">${hpBar(p)}<span class="hpnum">体力 ${p.hp}/${p.maxHp}</span></div>
 <div class="skills">${p.g.skills.map(s=>`<span title="${s.t}">${s.n}</span>`).join('')}</div>
 <div class="equip">${['weapon','armor'].map(s=>p[s]?`<span title="${CARD_DEFS[p[s].k].t}">${s==='weapon'?'⚔':'🛡'}${cn(p[s].k)}</span>`:'').join('')}</div>
 <div class="cnt">手牌 ${p.hand.length}</div></div>`;}
```

`hpBar` 函数体不改。

- [ ] **Step 5: 只改 render 里的三处展示**

牌堆那一行换成：

```javascript
 $('#deckinfo').textContent=`牌堆 ${G.deck.length}`;$('#discardinfo').textContent=`弃牌 ${G.discard.length}`;
```

`btn` 换成：

```javascript
 const btn=(t,fn,dis,primary=true)=>{const b=document.createElement('button');b.textContent=t;b.disabled=!!dis;b.className=primary?'btn-primary':'btn-secondary';b.onclick=fn;bar.appendChild(b);};
```

取消按钮的调用换成：

```javascript
btn('取消',()=>{G.sel=[];G.selFilter=null;G.phase='play';render();},false,false);
```

手牌 `innerHTML`、`className`、出牌和弃牌的 `onclick` 不改。技能、结束出牌、弃牌、确认技能继续走 `btn` 的默认 `primary=true`。

- [ ] **Step 6: 再跑同一脚本，这次必须通过**

```bash
node /tmp/ui-select-check.js
```

Expected: `select check ok`，退出码 0。

- [ ] **Step 7: Commit**

```bash
git add game.js
git commit -m "Fill a general slot before battle and split the pile labels"
```

### Task 8: 模拟回归和规格第 13 节验收

**Files:**

- Read: `docs/superpowers/specs/2026-10-25-opendesign-ui-design.md` 第 13 节
- 不修改 `README.md`。若 `node tools/sim.js 1` 改写了 `tools/sim-result.json`，把该文件还原，不要把它算进提交。

**Interfaces:**

- Consumes: Task 1 到 Task 7 的全部文件。
- Produces: 一条通过的验收记录。没有新的源文件。

- [ ] **Step 1: 跑全池各 1 局**

`node tools/sim.js 1` 会跑 96×95 局。等到进程自己退出，不要把局数改小。

```bash
node tools/sim.js 1 | tee /tmp/sim-ui.txt
```

Expected: 标准输出含 `errors=0`。

```bash
grep -q 'errors=0' /tmp/sim-ui.txt
```

Expected: 退出码 0。

- [ ] **Step 2: 还原模拟结果，并确认 diff 没有碰到禁改路径**

```bash
git checkout -- tools/sim-result.json
git diff --name-only HEAD
```

Expected: `git diff --name-only HEAD` 为空，或者只剩下你还没提交、且不属于下面清单的文件。下面任一路径出现在实现提交的 diff 里都要撤掉：

```text
README.md
BALANCE.md
data/
tools/
assets/
```

用合并基线再看一遍实现引入的文件：

```bash
git diff --name-only main...HEAD
```

Expected: 只有 `DESIGN.md`、`skills/open-design/frontend-design/` 下那三个文件、`index.html`、`style.css`、`game.js`，以及本计划所在分支上已经存在的规格和计划文档。没有 `README.md`。

- [ ] **Step 3: 用浏览器按规格第 13 节走完路径**

本地直接打开 `index.html` 即可，不需要构建。逐项勾选：

- [ ] 1280×800：背景是 `#14110e` 加直纹木纹，没有紫色点阵。标题为金色。两个主按钮居中，文案是「人机对战（换一批武将）」和「创建联机房间」。武将墙不可见。
- [ ] 点人机后有 8 张卡。厚框、像素立绘、8px 色条、体力数字、一行技能摘要。魏 `#3d7ec8`、蜀 `#3e8f5a`、吴 `#c44536`、群上 `#c6a15b` 下 `#6b4c7a`，群色条不是渐变。
- [ ] 点卡只填右侧一个出战槽。空槽时「选择出战」禁用。确认后进入人机。再点「人机对战（换一批武将）」换 8 人并清空槽。
- [ ] 对战自上而下是敌方条、牌堆和弃牌、己方条、横向手牌。技能按钮在手牌右侧，不盖住立绘。手牌超出后横向滚动，选中上移的牌仍完整可见。
- [ ] 800×800 仍是桌面两列和手牌右侧按钮。799×800 选将改为上下，按钮改到手牌下方。
- [ ] 390×844 与 320×700：确认按钮在卡墙之外的底部区域，高度至少 48px。手牌可横向滚动。立绘不被按钮盖住。
- [ ] 规则面板、询问框、胜负框是纸色底、墨色字。按钮焦点环为金色。
- [ ] 伤害仍有上浮数字，受击仍有横向抖动。没有飞牌或粒子。
- [ ] 房主能创建房间并复制链接。访客打开 `?room=` 能加入。双方选将并确认后，对局仍由现有 `state` 消息刷新。PeerJS 地址仍是 `https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js`。

某一项做不到：回到对应的 Task 4、5、6 或 7 修改，再从 Step 1 重跑。不要为了过验收去改 `data/` 或立绘。

- [ ] **Step 4: Commit**

这一任务没有新的源文件。Step 2 之后工作区是干净的，就不要创建空提交。若验收时发现必须改 `style.css`、`index.html` 或 `game.js`，修正后单独提交：

```bash
git add index.html style.css game.js
git commit -m "Fix the dark-ink shell against the acceptance checklist"
```

只添加实际改过的文件。不要添加 `tools/sim-result.json` 或 `README.md`。

### Task 9: 合并后仍由 Pages 从仓库根目录发布

**Files:**

- Read: `index.html`
- 不新增工作流、不新增 `.nojekyll`、不移动 `index.html`。

**Interfaces:**

- Consumes: 仓库根目录的 `index.html`、相对路径的 `style.css`、`game.js`、`data/*.js`、`assets/portraits/*.svg`。
- Produces: 一份路径核对结果。站点继续是 `https://zcbnu.github.io/sanguo-duel/`。房间链接继续用现有的 `location.origin + location.pathname`，所以项目站点的 `/sanguo-duel/` 前缀不用写死。

- [ ] **Step 1: 核对页面引用都是相对路径，外链只有 PeerJS**

```bash
node <<'JS'
const html = require('fs').readFileSync('index.html','utf8');
const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]);
const peer = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
for (const u of urls) {
  if (u.startsWith('/')) throw new Error('根绝对路径 ' + u);
  if (u.startsWith('http') && u !== peer) throw new Error('新的外链 ' + u);
}
const want = ['style.css', peer, 'data/generals.js', 'data/cards.js', 'game.js'];
if (urls.join('|') !== want.join('|')) throw new Error(urls.join(','));
if (require('fs').existsSync('package.json')) throw new Error('出现了构建清单');
console.log('pages paths ok');
JS
```

Expected: `pages paths ok`

- [ ] **Step 2: 确认没有需要提交的发布配置**

```bash
git status --short
```

Expected: 空输出。不要添加 GitHub Actions，不要把入口挪进 `docs/`。当前站点已经从 `main` 的仓库根目录提供 `index.html`。实现分支合并进 `main` 之后，同一个 URL 就是新外观。

- [ ] **Step 3: Commit**

没有文件变化，不创建提交。

## 规格覆盖自检

| 规格章节 | 落实任务 |
|---|---|
| 第 1 节目标 | 文首 Goal；Task 4–7 的外观和选将槽 |
| 第 2 节非目标 | Global Constraints；Task 8 的禁改路径 |
| 第 3 节先契约、再技能、再 CSS | Task 1、Task 2、Task 4 Step 1 |
| 第 4 节 id、类、脚本、`.hide` | Task 3 Step 2；Task 4 的 `.hide`；Task 7 不改 `start` |
| 第 5 节方向和立绘色差 | Task 1 的「方向」；Task 5 色条；Task 7 不写 `--fc`、不改 SVG |
| 第 6.1 节颜色和对比配对 | Task 1；Task 4 `:root`；Task 6 的灰度规则 |
| 第 6.2 节字体 | Task 4 的 `--display`、`--ui` 和 `h1` |
| 第 6.3 节间距、圆角、木纹 | Task 4 与 Task 5–6 的边框和落影 |
| 第 6.4 节 800 / 799 | Task 5 与 Task 6 的两个 `@media`；Task 8 的宽度清单 |
| 第 7.1 节大厅 | Task 3 的 `.mast`；Task 4 的 420px 列和主按钮 |
| 第 7.2 节一个出战槽 | Task 3 的 `#picked`；Task 5；Task 7 的 `fillSlot` |
| 第 7.3 节对战四行和手牌横排 | Task 3 的四个 `section`；Task 6 |
| 第 7.4 节模态 | Task 4 的 `.modal`，宽 `min(92vw,420px)`，`z-index:30` |
| 第 8.1 节按钮 | Task 4；Task 5 的 `.screen-select #modes .btn-primary`；Task 7 的 `btn` 第四参 |
| 第 8.2 节武将卡 | Task 7 的 `selectScreen` HTML；Task 5 的卡面尺寸 |
| 第 8.3 节确认分支 | Task 7 的 `confirmPick` |
| 第 8.4 节座位和体力 | Task 7 的 `seat`；Task 6 的 `.hp i` 16px / 窄屏 14px |
| 第 8.5 节手牌 | Task 6；Task 7 不改手牌 innerHTML |
| 第 8.6 节牌堆与弃牌 | Task 3 的 `#discardinfo`；Task 7 的两句文本 |
| 第 8.7 节动效边界 | Task 6 只保留 `fl` 和 `sh` |
| 第 9 节屏幕状态 | Task 7 的 `initLobby` 与 `selectScreen` 类名；`start` 不改 |
| 第 10 节允许改的文件 | 文首文件结构；Task 8 的 diff 清单 |
| 第 11 节技能校验值 | Task 2 Step 3 的两个 hash |
| 第 12 节 DESIGN.md 七个章节 | Task 1 |
| 第 13 节验收 | Task 7 的脚本、Task 8 的模拟和浏览器清单 |
| 第 14 节范围外 | Global Constraints；Task 9 不新增发布文件 |

自检时另外核对过这几件容易写拧的事：窄屏 320px 用 8px 网格间距才能和规格里的两列算式同时成立，桌面仍是 12px；`confirmPick` 只在联机清空武将墙之后禁用按钮；`#discardinfo` 在 Task 3 就放进 DOM，Task 7 才写入文本，真实页面不会在空节点上赋值；群的暗紫只在武将卡色条上，座位底用金。
