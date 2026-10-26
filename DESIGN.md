# 三国对决视觉契约

本文件由 `docs/superpowers/specs/2026-10-25-opendesign-ui-design.md` 第 5–8 节原样整理。页面不加载本文件。色值以规格为准；规格改了，本文件才跟着改。`skills/open-design/frontend-design/SKILL.md` 与本文件冲突时，以本文件和规格为准。

# 方向

## 5. 视觉方向

方向名称：暗色国风 TCG。

- 桌面是深墨，带很淡的直纹木色，不是紫点阵，也不是紫蓝渐变。
- 标题是金色，下方用 2px 纯色朱红错位，没有模糊光晕。
- 武将卡是深色厚框：4px 墨边、内侧 2px 金线、6px 纯色落影。立绘占卡面上方，下面是势力色条、名字、体力和一行技能摘要。
- 对战手牌是暖纸色，字是墨色，方便在深桌上阅读。武将卡保持深色，手牌保持浅色。这是两种组件，不是同一张卡的两种状态。
- 势力色条是平涂，不是渐变：魏蓝、蜀绿、吴红。群是上下各 4px 的平涂金带和暗紫带，用 `box-shadow: inset 0 -4px 0` 做成色带，不用 `linear-gradient`。
- 全页禁止紫蓝渐变、玻璃拟态、模糊投影、装饰光斑。群势力那条 4px 暗紫只出现在群卡的色条上，不进入背景、按钮或标题。
- 像素立绘继续 `image-rendering: pixelated`，`object-fit: cover`，`object-position: center`。`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo` 的 `img` 带 `portrait-illust`，`image-rendering` 为 `auto`。其余立绘仍是 `pixelated`。

### 已知并接受的差异

锁定的色条是魏蓝、蜀绿、吴红、群金紫。现有 `FACTIONS` 和立绘像素是魏蓝、蜀红、吴绿、群灰。本轮色条按锁定配色画，立绘像素保持原文件。因此一张蜀卡可以同时有绿色色条和立绘里原有的红色披风。不要为了抹平这个差异去改 `FACTIONS` 或重绘 SVG。

魏、蜀色条上不要放小号白字。`#fff8ee` 在 `#3d7ec8` 上对比约 3.97:1，在 `#3e8f5a` 上约 3.77:1，不够正文。势力汉字放在墨底芯片上，字色 `#f3ead7`（与 `#14110e` 对比 15.73:1）。色条本身不放字。

# 颜色

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

# 字体

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

# 间距、圆角、边框、木纹

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

# 断点

### 6.4 断点

只有一个断点。宽度大于等于 800px 为桌面，小于等于 799px 为窄屏。最小目标宽度 320px。验收宽度：1280×800、800×800、799×800、390×844、320×700。

# 大厅、选将、对战布局

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

# 按钮、武将卡、出战槽、座位、手牌、牌堆、动效

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
  <img alt="曹操" class="portrait-illust" src="assets/portraits/caocao.png">
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
