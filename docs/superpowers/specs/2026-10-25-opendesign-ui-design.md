# 暗色国风 TCG 视觉升级设计说明

状态：方案 A 已锁定。本文件是后续实现的规格。本提交只新增本文件，不改页面、不放入技能文件。

线上站点：https://zcbnu.github.io/sanguo-duel/

技术栈保持静态 HTML / CSS / JS。不引入框架、构建步骤、新字体 CDN 或第二份样式表。

## 1. 目标

把大厅、选将、对战外壳改成「暗色国风 TCG」：宝可梦卡牌式的厚边框、立绘主视觉、手牌横排、牌堆 / 弃牌区，加上深墨与木案的底色，朱红与金作强调色。势力用稀有度色条区分。现有卡通像素立绘原样保留。

这一轮只改布局、颜色、字体和组件外观。对局规则、技能数据、PeerJS 消息不变。伤害数字上浮和受击横移这两段现有动效保留，不新增战斗特效。

## 2. 非目标

- 不改 `data/generals.js`、`data/cards.js`、`tools/`、`assets/portraits/`、`BALANCE.md`。
- 不改出牌、伤害、技能、AI、胜负、摸牌数、选将人数（仍是 8 选 1）和联机协议。
- 不把 `div` 卡牌改成 `<button>`，不加新手牌键盘操作。
- 不重绘立绘，不重跑 `tools/portraits.js`。
- 不引入 React、Vue 或任何打包器。
- 不新增攻击飞牌、粒子、光晕、模糊投影。
- 不放入 `frontend-design` 以外的 OpenDesign 技能。本提交连 `frontend-design` 也不放入，只规定以后要放的路径。

## 3. 本提交与后续实现

| 时机 | 内容 |
|---|---|
| 本提交 | 只有 `docs/superpowers/specs/2026-10-25-opendesign-ui-design.md` |
| 后续实现 | 根目录 `DESIGN.md`、`skills/open-design/frontend-design/` 下的技能副本、`index.html` 外壳、`style.css`，以及第 10 节列出的 `game.js` 展示模板 |

后续实现先写 `DESIGN.md`（内容与第 6、7、8 节一致），再按第 11 节原样复制技能，读完技能后再改 CSS。技能与本规格冲突时，以本规格和 `DESIGN.md` 为准。技能里「不要紫蓝渐变、不要玻璃拟态、不要无意义装饰」与本规格一致，必须遵守。

## 4. 现状锚点

页面入口是 `index.html`。样式全在 `style.css`。交互在 `game.js`。当前三个区域叠在同一文档里，没有路由。

`#select` 同时承担大厅和选将。`initLobby()` 在没有 `?room=` 时会立刻调用 `selectScreen()`，所以一打开就看到 8 张武将，和「人机 / 联机」按钮挤在一起。点武将卡会打开 `#detail` 模态，再点「选择出战」。

`#battle` 自上而下是 `#ai`、`#aihand`、`#table`（`#deckinfo` 用一句话同时写牌堆和弃牌数量，加上 `#log`）、`#me`、`#actions`、`#hand`。手牌会换行。技能按钮在手牌上方一整行，立绘在 `#me` 里。

势力色写在 `data/generals.js` 的 `FACTIONS` 里，并由 `seat()`、`selectScreen()` 写成行内 `--fc`：

- 魏 `#3b6fd8`
- 蜀 `#d8463b`（红）
- 吴 `#2fa35a`（绿）
- 群 `#8a8f9c`（灰）

立绘 SVG 在生成时把这组颜色画进了像素。本轮不改这份数据，也不改 SVG。

必须继续存在的 id：`select`、`battle`、`modes`、`pve`、`host`、`lobby`、`stats`、`rules`、`ruleBox`、`grid`、`detail`、`ai`、`aihand`、`table`、`deckinfo`、`log`、`me`、`actions`、`hand`、`prompt`、`over`。

必须继续存在的类：`hide`、`gcard`、`fac`、`gn`、`portrait`、`seat`、`hp`、`skills`、`equip`、`card`、`back`、`ok`、`sel`、`trick`、`weapon`、`armor`、`k-zhan`、`k-bi`、`k-yao`、`float`、`bad`、`good`、`shake`、`wait`、`suit`、`red`、`modal`、`minis`。

脚本顺序保持不变：PeerJS `https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js`，然后 `data/generals.js`、`data/cards.js`、`game.js`。viewport 元信息保持 `width=device-width,initial-scale=1,maximum-scale=1`。

`.hide` 必须仍是 `display: none !important`，否则新的 `display: flex` / `grid` 会把不该出现的屏幕露出来。

## 5. 视觉方向

方向名称：暗色国风 TCG。

- 桌面是深墨，带很淡的直纹木色，不是紫点阵，也不是紫蓝渐变。
- 标题是金色，下方用 2px 纯色朱红错位，没有模糊光晕。
- 武将卡是深色厚框：4px 墨边、内侧 2px 金线、6px 纯色落影。立绘占卡面上方，下面是势力色条、名字、体力和一行技能摘要。
- 对战手牌是暖纸色，字是墨色，方便在深桌上阅读。武将卡保持深色，手牌保持浅色。这是两种组件，不是同一张卡的两种状态。
- 势力色条是平涂，不是渐变：魏蓝、蜀绿、吴红。群是上下各 4px 的平涂金带和暗紫带，用 `box-shadow: inset 0 -4px 0` 做成色带，不用 `linear-gradient`。
- 全页禁止紫蓝渐变、玻璃拟态、模糊投影、装饰光斑。群势力那条 4px 暗紫只出现在群卡的色条上，不进入背景、按钮或标题。
- 像素立绘继续 `image-rendering: pixelated`，`object-fit: cover`，`object-position: center`。

### 已知并接受的差异

锁定的色条是魏蓝、蜀绿、吴红、群金紫。现有 `FACTIONS` 和立绘像素是魏蓝、蜀红、吴绿、群灰。本轮色条按锁定配色画，立绘像素保持原文件。因此一张蜀卡可以同时有绿色色条和立绘里原有的红色披风。不要为了抹平这个差异去改 `FACTIONS` 或重绘 SVG。

魏、蜀色条上不要放小号白字。`#fff8ee` 在 `#3d7ec8` 上对比约 3.97:1，在 `#3e8f5a` 上约 3.77:1，不够正文。势力汉字放在墨底芯片上，字色 `#f3ead7`（与 `#14110e` 对比 15.73:1）。色条本身不放字。

## 6. 设计令牌

后续 `DESIGN.md` 和 `style.css` 的 `:root` 使用下表，名称和色值一致。

### 6.1 颜色

| 令牌 | 色值 | 用途 |
|---|---|---|
| `--ink` | `#14110e` | 页面背景、势力字芯片 |
| `--ink-2` | `#1c1814` | 武将卡下半部、座位底 |
| `--wood` | `#2a2118` | 大厅面板、座位外框内的木色块 |
| `--paper` | `#f3e6c8` | 手牌、模态、输入框、规则面板 |
| `--paper-ink` | `#1a120c` | 纸面上的字、粗边框 |
| `--text` | `#f3ead7` | 墨底上的正文 |
| `--text-muted` | `#b7aa96` | 墨底上的次要说明 |
| `--vermillion` | `#c23a2e` | 主按钮、标题错位 |
| `--vermillion-deep` | `#6e221c` | 主按钮落影 |
| `--gold` | `#e2c27a` | 标题、焦点环、次按钮字、区域数字 |
| `--gold-line` | `#d4a84b` | 卡内金线、次按钮边 |
| `--pip` | `#e24b3c` | 剩余体力的实心格。格数等于 `maxHp`，点亮数等于 `hp`，与现有 `.hp i.on` 一致 |
| `--pip-empty` | `#3a332c` | 空体力格 |
| `--mat` | `#24352c` | 中央桌布、牌堆区 |
| `--discard` | `#1a1814` | 弃牌区 |
| `--wei` | `#3d7ec8` | 魏色条 |
| `--shu` | `#3e8f5a` | 蜀色条 |
| `--wu` | `#c44536` | 吴色条 |
| `--qun-gold` | `#c6a15b` | 群色条上半 |
| `--qun-purple` | `#6b4c7a` | 群色条下半 4px |
| `--float-bad` | `#ff6b6b` | 伤害数字 |
| `--float-good` | `#7dcea0` | 治疗数字 |
| `--trick` | `#f0d8c4` | 锦囊牌纸色，替换现在的紫色 `#e6d7ff` |
| `--equip` | `#d7e2ea` | 武器和防具纸色，平涂 |
| `--zhan` | `#9d2b22` | 「斩」牌名 |
| `--bi` | `#1e4f86` | 「避」牌名 |
| `--yao` | `#1d6b45` | 「药」牌名 |
| `--disabled` | `#4a302c` | 禁用主按钮底 |

正文对比，实现时不得改这些配对：

| 前景 | 背景 | 对比 |
|---|---|---|
| `#f3ead7` | `#14110e` | 15.73:1 |
| `#b7aa96` | `#14110e` | 8.25:1 |
| `#e2c27a` | `#14110e` | 10.96:1 |
| `#fff8ee` | `#c23a2e` | 5.06:1 |
| `#f3ead7` | `#4a302c` | 10.03:1 |
| `#1a120c` | `#f3e6c8` | 14.94:1 |
| `#9d2b22` | `#f3e6c8` | 6.05:1 |
| `#1e4f86` | `#f3e6c8` | 6.74:1 |
| `#1d6b45` | `#f3e6c8` | 5.23:1 |
| `#f3ead7` | `#24352c` | 10.84:1 |
| `#e2c27a` | `#24352c` | 7.55:1 |
| `#ff6b6b` | `#1c1814` | 6.36:1 |
| `#7dcea0` | `#1c1814` | 9.42:1 |
| `#1a120c` | `#e2c27a` | 10.77:1 |

不可用牌不再使用 `opacity: 0.55`。未加上 `ok` 的手牌保持不透明度 1，用 `filter: grayscale(0.35)` 表示不能出。字色仍落在纸面上。

### 6.2 字体

不加载网络字体。

- 标题：`"Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", "PMingLiU", serif`
- 界面：`"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", system-ui, sans-serif`

| 角色 | 尺寸 | 行高 | 字重 |
|---|---|---|---|
| 大厅标题 | `clamp(32px, 6vw, 56px)` | 1.1 | 700 |
| 选将页标题 | 24px | 1.2 | 700 |
| 区块标题 | 20px | 1.3 | 700 |
| 武将名 | 16px | 1.2 | 700 |
| 正文、日志 | 14px | 1.45 | 400 |
| 技能摘要 | 12px | 1.35 | 400 |
| 牌堆 / 弃牌数字行 | 20px | 1.2 | 700 |
| 按钮 | 16px | 1.2 | 700 |

大厅标题字距 `0.14em`，允许换行。选将页标题字距 `0.08em`。

### 6.3 间距、圆角、边框

间距令牌按这个顺序固定：`--s-1` 4px、`--s-2` 8px、`--s-3` 12px、`--s-4` 16px、`--s-5` 24px、`--s-6` 32px、`--s-7` 48px。组件间距只用这些值。边框宽度另计，用第 6.3 节表格里的 2px、3px、4px。

| 组件 | 圆角 | 边框与落影 |
|---|---|---|
| 武将卡 | 10px | `4px solid #1a120c`，`inset 0 0 0 2px #d4a84b`，`0 6px 0 #0a0908` |
| 手牌 | 8px | `3px solid #1a120c`，`0 3px 0 #0a0908` |
| 主按钮 | 8px | `3px solid #1a120c`，`0 4px 0 #6e221c` |
| 次按钮 | 8px | `2px solid #d4a84b`，`0 3px 0 #1a120c` |
| 模态 | 12px | `4px solid #1a120c`，`0 6px 0 #1a120c` |
| 立绘内框 | 6px | `3px solid #1a120c` |

落影是纯色错位，模糊半径为 0。按下时 `transform: translateY(2px)`，落影高度减 2px，过渡 0.1s。这是控件反馈，不是新的战斗特效。

页面木纹只有这一条，叠在 `--ink` 上：

```css
repeating-linear-gradient(
  90deg,
  rgba(243, 234, 215, 0.035) 0 1px,
  transparent 1px 8px
)
```

### 6.4 断点

只有一个断点。宽度大于等于 800px 为桌面，小于等于 799px 为窄屏。最小目标宽度 320px。验收宽度：1280×800、800×800、799×800、390×844、320×700。

## 7. 屏幕布局

舞台最大宽度 1120px，水平居中。去掉现在 `#select, #battle { max-width: 560px }` 的限制。

### 7.1 大厅

`#select` 带 `screen-lobby`，不带 `screen-select`。`min-height: 100vh`，`overflow: auto`，内容在一列里水平居中，列宽最大 420px。

从上到下：

1. 标题「三国对决」。
2. 现有副标题，原文保留：`1v1 卡牌对战 · 人机 / 联机 · 选择你的武将`。
3. `#modes` 里两个主按钮，都带 `btn-primary`，纵向排列，间距 16px，宽度 `min(100%, 280px)`，高度至少 48px。文案和 id 不变：`#pve` 为「人机对战（换一批武将）」，`#host` 为「创建联机房间」。
4. `#lobby`。平时为空。创建房间或加入房间时，沿用 `hostRoom()` / `joinRoom()` 现有文案。
5. `#stats`。
6. `#rules` 次按钮，文案仍是「规则」。
7. `#ruleBox`。展开时是纸色面板，墨色 14px 字，`max-height: 40vh`，内部滚动。

`screen-lobby` 下 `.select-layout` 为 `display: none`。首屏不调用 `selectScreen()`，所以 `#grid` 为空，用户看不到武将墙。

房间链接输入框 `#rl`：纸色底、墨色字、2px 墨边、高度至少 44px、宽度 100%。「复制」是次按钮。

### 7.2 选将

点「人机对战」或收到联机 `offer` 后，`selectScreen()` 去掉 `screen-lobby`、加上 `screen-select`。这两个类互斥，同一时刻只留一个。

`#select.screen-select` 为 `height: 100dvh`（不支持时用 `100vh`），`display: flex`，`flex-direction: column`，`overflow: hidden`。上方是压矮的标题区（标题 24px）。下方 `.select-layout` 占据剩余高度，`min-height: 0`。

桌面（≥800px）：`.select-layout` 为两列，`1fr` 与 `300px`，间距 24px，左右两侧各自 `overflow: auto`。

窄屏（≤799px）：`.select-layout` 为 `grid-template-rows: 1fr auto`。`#grid` 滚动。`#picked` 留在列底，不使用会挡住卡墙的 `position: fixed`。

左侧 `#grid`：`repeat(auto-fill, minmax(140px, 1fr))`，间距 12px。桌面卡面目标 168×248。320px 宽、页边 16px、间距 8px 时，两列每张约 140px，仍可点。

右侧只有一个出战槽。规则是 8 选 1，不能做第二个槽，也不能做对手预览。

```html
<aside id="picked">
  <h2>出战</h2>
  <div id="picked-body" aria-live="polite"></div>
  <button id="confirm" class="btn-primary" disabled>选择出战</button>
</aside>
```

空槽正文是「点击左侧武将」，`#confirm` 禁用。选中后 `#picked-body` 显示立绘、势力汉字、名字、`体力 N`、以及该武将全部技能的全文（沿用现在 `#detail` 里 `【技能名】` 加 `t` 的段落）。卡面上的摘要仍是一行；全文只出现在槽里。窄屏下技能全文区域 `max-height: 72px; overflow: auto`。`#confirm` 在 `#picked-body` 外面，不跟着技能文字滚走。

`#detail` 留在文档里，类名保持 `modal hide`。`showDetail()` 函数体保留，但不得再被调用。

### 7.3 对战

`#battle` 在显示时为 `height: 100dvh`，`overflow: auto`，内边距 12px，四行网格：`auto minmax(120px, 1fr) auto auto`。短屏幕整页可以滚动。牌堆行最小 120px。手牌行由牌面撑开（窄屏牌高 104px，再加上 20px 上内边距）。按钮在第四行，不叠到第三行的立绘上。

```html
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
```

- 第一行是敌方座位加敌方手牌背。桌面横排，窄屏改为上下。敌方立绘桌面 96px、窄屏 72px。背牌 `nowrap`，横向滚动，不再换行把桌子顶下去。背牌尺寸 28×40。
- 第二行是桌布。`.zones` 始终两列：牌堆在 `--mat` 上，弃牌在 `--discard` 上。每区最小 120×88，3px 墨边。`#log` 在两区下面，占满剩余高度，内部滚动。最新一条日志用 `--gold`。
- 第三行是己方座位，立绘在左，资料在右。
- 第四行 `.hand-row`。桌面为 `1fr 200px`：手牌在左，`#actions` 在右。窄屏改为一列，按钮排在手牌下面。按钮区不得覆盖第三行的立绘。

己方手牌 `flex-wrap: nowrap`，横向滚动，`-webkit-overflow-scrolling: touch`。桌面单张 96×136，窄屏 72×104。容器 `padding-top: 20px`，选中上移 12px 时仍留在滚动区内。不要依赖 `overflow-y: visible` 和 `overflow-x: auto` 同时生效，浏览器会把纵向也变成自动滚动并裁切上移。

底部内边距加上 `env(safe-area-inset-bottom)`。

### 7.4 模态

`#prompt`、`#over`、`#detail` 使用纸色模态：宽 `min(92vw, 420px)`，墨字，4px 墨边。问题段落左对齐。游戏结束标题居中。层级 `z-index: 30`。

## 8. 组件

### 8.1 按钮

默认 `<button>` 是次按钮：透明底，字色 `--gold`，金边。`.btn-primary` 是朱红底、字色 `#fff8ee`。

- 大厅的 `#pve`、`#host` 在 `screen-lobby` 下是主按钮。
- 进入 `screen-select` 后，`#modes` 里的按钮改为次按钮外观，页面上唯一的朱红主按钮是 `#confirm`。
- 对局里，技能、结束出牌、弃牌、确认技能是主按钮。取消是次按钮。
- 禁用主按钮：底 `--disabled`，字 `--text`，不使用整颗按钮的透明度。`cursor: default`。
- `:focus-visible` 为 `2px solid var(--gold)`，`outline-offset: 2px`。
- 最小高度 48px，左右内边距至少 16px。技能名可以换行，不截断。

### 8.2 武将卡

`selectScreen()` 生成的结构：

```html
<div class="gcard f-wei">
  <img alt="曹操" src="assets/portraits/caocao.svg">
  <div class="faction-bar"></div>
  <div class="gn"><span class="fac">魏</span>曹操<small>体力 4</small></div>
  <div class="skill-line">第一张技能的 t 全文</div>
</div>
```

- 类名 `f-wei`、`f-shu`、`f-wu`、`f-qun` 来自现有 `g.f`。不写行内 `style`，不设置 `--fc`。
- 色条高 8px，全宽。魏蜀吴为对应纯色。群为上 4px `--qun-gold`、下 4px `--qun-purple`。
- `.fac` 是墨底芯片，字是 `--text`，不压在色条上。
- `.skill-line` 只显示 `skills[0].t`，CSS 单行省略。元素的 `title` 为全部技能，格式 `【名】文案`，技能之间用换行连接。不在 JS 里截断字符串。
- 体力数字是 `g.hp`。选将时武将满体力，卡面不画体力格。
- 选中的卡加 `is-picked`：3px `--gold` 外轮廓。再次点同一张则取消选中。点另一张则替换。
- 悬停：`translateY(-6px)`，0.1s。现有行为，保留。

### 8.3 出战槽与确认

模块级 `PICK` 初始为 `null`。`selectScreen()` 一开始就把 `PICK` 清空并刷新空槽，避免「换一批」后槽里还留着已经不在墙上的武将。

填槽函数名为 `fillSlot(g)`。`g` 为空时清空 `#picked-body` 为「点击左侧武将」，并禁用 `#confirm`。`g` 有值时写入槽内容并启用按钮。`#confirm` 在 `PICK` 非空时可点。点击后读取 `PICK` 作为下面的 `g`，执行现在 `showDetail()` 里 `#go` 的同一段分支，条件与顺序不改：

```javascript
if(!NET){const pool=GENERALS.filter(x=>x!==g);start(g,pool[Math.random()*pool.length|0],false);return;}
if(NET.role==='guest'){send({type:'pick',id:g.id});$('#grid').innerHTML='';$('#lobby').innerHTML=`你选择了${g.name}，等待房主选将…`;return;}
if(!NET.conn)return;NET.myPick=g;$('#grid').innerHTML='';tryStartNet();
```

人机对手仍从除自己以外的全部武将里随机，不从当场 8 人里随机。联机确认后仍清空 `#grid`，槽里保留已选武将，并禁用 `#confirm`。

### 8.4 座位与体力

`seat()` 的立绘容器改为 `` `class="portrait f-${p.g.f}"` ``，去掉行内 `--fc`。`img` 的 `alt` 为武将名。技能列表、装备、手牌张数、「行动中」标记仍按现在的字段渲染，不新增技能来源。

体力格继续由 `hpBar()` 按 `maxHp` 生成，一格一点，实心表示尚未损失的体力。格尺寸桌面 16px、窄屏 14px，间距 4px，可换行。旁边增加文字 `体力 ${p.hp}/${p.maxHp}`，字色 `--text`。华雄 6 点、费祎和步练师 2 点都走同一套，不单独做条形血条。

座位底色 `--ink-2`，外框 3px 墨边，圆角 12px。己方和敌方用同一组件。

### 8.5 手牌

手牌内部 HTML 不变：`<b>` 牌名、`<i class="suit">` 花色、`<small>` 说明。类名仍是 `card`、类型、`k-牌键`、`ok`、`sel`。

- 基本牌纸色 `--paper`。
- 锦囊 `--trick`。
- 武器和防具 `--equip`。
- 「斩」「避」「药」只给牌名上色，分别为 `--zhan`、`--bi`、`--yao`。
- 红色花色 `#9d2b22`，黑色花色 `--paper-ink`。
- `.ok` 可悬停上移 6px。`.sel` 上移 12px，轮廓 3px `--vermillion`。

### 8.6 牌堆与弃牌

`render()` 把现在的一行拆成两处赋值：

- `#deckinfo` 的文本为 `` `牌堆 ${G.deck.length}` ``
- `#discardinfo` 的文本为 `` `弃牌 ${G.discard.length}` ``

不增加别的句子。两行都用 `--gold`、20px。房主和访客都走 `render()`，这一处赋值同时覆盖两边。`index.html` 里的 `#discardinfo` 必须和这行 JS 同一批落地，否则真实页面会在空节点上写 `textContent`。

### 8.7 动效边界

保留并沿用现在的关键帧，不新增 `@keyframes`：

- `.float`：0.9s，`fl`，上移 30px 后透明。`.bad` 用 `--float-bad`，`.good` 用 `--float-good`。字号 28px、字重 700，硬投影 `2px 2px 0 #14110e`。
- `.shake`：0.3s，`sh`，左右 6px。

卡牌和按钮的 0.1s `transform` 只用于悬停、选中和按下。

## 9. 屏幕状态

| 状态 | `#select` | `#battle` | `#modes` | 武将墙 |
|---|---|---|---|---|
| 大厅 | `screen-lobby` | `hide` | 显示 | 布局隐藏，网格为空 |
| 人机选将 | `screen-select` | `hide` | 显示，按钮呈次按钮 | 8 张 |
| 联机等待房间 | `screen-lobby` | `hide` | `hide` | 隐藏 |
| 联机选将 | `screen-select` | `hide` | `hide` | 协议发来的 8 张 |
| 已选等待对手 | `screen-select` | `hide` | `hide` | 被现有逻辑清空 |
| 对战 | `hide` | 显示 | 无关 | 无关 |

`start()` 继续负责隐藏 `#select` 和显示 `#battle`。不要改 `start()`。回到首页仍靠现有的 `location.reload()` 或 `location.pathname`，不新增「返回大厅」状态机。

`initLobby()` 在任何路径下都先写战绩句，句子与 `selectScreen()` 现在的最后一行相同：`` `人机战绩 ${st.w} 胜 ${st.l} 负 · 武将池 ${GENERALS.length} 位，每局随机 8 位` ``。没有 `?room=` 时不再调用 `selectScreen()`。有 `?room=` 时仍调用 `joinRoom(room.toUpperCase())`。

联机房主在对手连上之前停在大厅。这和现在「等待时墙上还留着上一批 8 人」不同，是为了让大厅真正只有两个主按钮。对手连上后仍由现有 `selectScreen(NET.offers[0])` 进入选将。`if(!NET.conn)return` 保留。

`?auto` 与 `window.HARNESS` 的尾部逻辑不改。`tools/sim.js` 的 DOM 代理会接住新增的查询，不需要改模拟器。

## 10. 允许改动的文件

后续实现可以改这些文件，且只能按这里写明的方式改 `game.js`。

| 文件 | 动作 |
|---|---|
| `DESIGN.md` | 新建。第 6、7、8 节的令牌、尺寸和组件规则原样写入 |
| `skills/open-design/frontend-design/SKILL.md` | 新建。第 11 节的原件副本 |
| `skills/open-design/frontend-design/LICENSE.txt` | 新建。原件副本 |
| `skills/open-design/frontend-design/NOTICE` | 新建。第 11 节的归属说明 |
| `index.html` | 改外壳和类名。保留 head、四个脚本、已有 id |
| `style.css` | 按令牌重写外观。保留第 4 节的类和 `.hide` |
| `game.js` | 只改下面点名的函数 |

`game.js` 允许的编辑：

1. `initLobby`：去掉无房间时的 `selectScreen()` 调用；写入战绩句；`#pve` 仍调用 `selectScreen()`；`#host` 仍隐藏 `#modes` 并调用 `hostRoom()`。
2. `selectScreen`：切换 `screen-select`；清空 `PICK`；卡面使用第 8.2 节的 HTML；点击只填槽。
3. 在选将函数旁新增 `PICK` 与 `fillSlot(g)`。`#confirm` 使用第 8.3 节的分支。
4. `seat`：势力类、`alt`、体力文字、去掉行内 `--fc`。`hpBar()` 的格点逻辑不改。
5. `render`：拆开牌堆和弃牌两句文本；`btn` 增加主 / 次类名。出现哪些按钮、禁用条件、回调不改。

不要改 `showDetail`、`start`、`hostRoom`、`joinRoom`、`onMsg`、`tryStartNet` 的函数体。不要重排 `game.js` 的其余行。新增注释使用中文。

不要改：`data/`、`tools/`、`assets/`、`BALANCE.md`、`README.md`。

## 11. OpenDesign 技能接入

本提交不创建 `skills/` 目录。

后续实现把 OpenDesign 仓库里的 `frontend-design` 原样放到：

`skills/open-design/frontend-design/`

来源（2026-10-25 读取的 `main` 文件，以 blob 校验值为准）：

- 技能说明：https://github.com/nexu-io/open-design/blob/main/skills/frontend-design/SKILL.md
- 许可证：https://github.com/nexu-io/open-design/blob/main/skills/frontend-design/LICENSE.txt
- 仓库许可证为 Apache-2.0：https://github.com/nexu-io/open-design/blob/main/LICENSE
- 该技能说明写明它改编自 https://github.com/anthropics/skills/tree/main/skills/frontend-design

复制后不得改 `SKILL.md` 和 `LICENSE.txt`。用下面的命令核对，输出必须一致：

```text
git hash-object skills/open-design/frontend-design/SKILL.md
43fa4a5860b97b192fe05d67c6bd2d97bc643d3f

git hash-object skills/open-design/frontend-design/LICENSE.txt
f433b1a53f5b830a205fd2df78e2b34974656c7b
```

`NOTICE` 的全文如下：

```text
OpenDesign frontend-design

来源：https://github.com/nexu-io/open-design/tree/main/skills/frontend-design
上游：https://github.com/anthropics/skills/tree/main/skills/frontend-design
许可证：Apache License 2.0。全文见本目录 LICENSE.txt。
SKILL.md 与 LICENSE.txt 为未修改副本。本 NOTICE 是放入三国对决仓库时新增的归属说明。
```

不复制 `skills/design-md`，也不复制 OpenDesign 的其他技能。`DESIGN.md` 按本规格手写，不依赖外部技能脚本。

实现 CSS 之前先读已放入的 `SKILL.md` 和根目录 `DESIGN.md`。页面仍是静态 HTML / CSS / JS。技能示例里的 React 或独立原型页不要用到这个项目上。

## 12. 根目录 DESIGN.md

`DESIGN.md` 是实现时的视觉契约，给人和后续读取技能的代理用。它不由页面加载。章节固定为：

1. 方向（第 5 节，含立绘与色条的已知差异）
2. 颜色（第 6.1 节全表）
3. 字体（第 6.2 节）
4. 间距、圆角、边框、木纹（第 6.3 节）
5. 断点（第 6.4 节）
6. 大厅、选将、对战布局（第 7 节的尺寸和区域）
7. 按钮、武将卡、出战槽、座位、手牌、牌堆、动效（第 8 节）

不要在 `DESIGN.md` 里另起一套色值。本规格改了，`DESIGN.md` 才跟着改。

## 13. 验收

桌面 1280×800 与手机 390×844 都要走完下面的路径。800 与 799 各看一次列数是否切换。320×700 下，确认按钮和手牌仍可到达，且没有盖住立绘。

大厅：

- 背景是 `#14110e` 加第 6.3 节的直纹，看不到现在的紫色点阵。
- 标题为金色。两个主按钮居中，文案不变。
- 武将墙不可见。

选将：

- 人机进入后墙上有 8 张卡。每张有厚框、像素立绘、8px 势力色条、体力数字、一行技能摘要。
- 魏条 `#3d7ec8`，蜀条 `#3e8f5a`，吴条 `#c44536`，群条上金下紫且不是渐变。
- 点卡只填右侧或底部的一个出战槽，不开始对局。空槽时「选择出战」禁用。
- 确认后进入人机对战。对手仍是全池随机。
- 再点「人机对战（换一批武将）」会换 8 人并清空槽。
- 窄屏下确认按钮在卡墙之外的底部区域，高度至少 48px。

对战：

- 自上而下是敌方条、中央牌堆和弃牌、己方条、手牌横排。桌面宽度下技能按钮在手牌右侧；799px 以下在手牌下方。
- 按钮不盖住 `#me` 或 `#ai` 的立绘。
- 手牌不换行，超出后横向滚动。选中的牌完整可见。
- 造成伤害时仍有红色上浮数字和座位横移，没有新的飞牌或粒子。

可读性：

- 第 6.1 节列出的前景 / 背景配对保持原色值。
- 规则面板、询问框、胜负框是纸色底、墨色字。
- 按钮可用键盘聚焦，焦点环为金色。

联机与规则回归：

- PeerJS 脚本地址仍是 `https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js`。
- 房主仍能创建房间、复制链接。访客用 `?room=` 加入。双方都能选将并确认。对局状态仍由现有 `state` 消息刷新。
- `git diff` 不涉及 `data/`、`tools/`、`assets/`、`BALANCE.md`。
- `node tools/sim.js 1` 结束时输出里 `errors=0`。不要把这次模拟结果写回 `tools/sim-result.json` 作为功能的一部分；若命令改写了该文件，实现提交里还原它。

技能文件：

- `git hash-object` 的两个校验值与第 11 节一致。
- `NOTICE` 全文与第 11 节一致。

## 14. 范围外

- 战斗新特效、音效、出牌动画。
- 规则、技能文案、数值、AI、`FACTIONS` 对象、牌堆构成。
- 立绘重绘，以及为了让披风颜色跟上新色条而改 `tools/portraits.js`。
- 账号、图鉴、全部 96 名武将的浏览墙。选将墙始终是当场 8 人。
- 多语言、英文界面。现有中文文案保持。
- 把卡牌或武将卡改成键盘可操作控件。
- 除 `frontend-design` 以外的任何 OpenDesign 技能。
- 本提交中的 `DESIGN.md`、`style.css`、`index.html`、`game.js` 和 `skills/`。它们属于后续实现。
