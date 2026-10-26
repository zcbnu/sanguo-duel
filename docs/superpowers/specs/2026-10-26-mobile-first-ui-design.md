# 手机优先纵向界面设计说明

Mobile-first vertical UI spec

状态：方案 A「拇指对战壳」已锁定。本文件是后续实现的规格。本提交只改文档：新增本文件，并在 `DESIGN.md` 加上指向这里的短注。不改页面、样式、脚本、立绘、规则、AI 或联机。

线上站点仍是静态页。技术栈保持 HTML / CSS / JS。不引入框架、构建、新字体或第二份样式表。

## 1. 目标 / Goals

把整条漏斗收成一条竖的手机壳，让人用一只拇指打完一局：

大厅 → 选将 → 对战 → 结算。

对战是单列竖条，从上到下读完战场，手牌和按钮钉在底部。出牌是「点选手牌，上滑打出」，底部同时有确认 / 取消。375px 宽的竖屏可以打完一整局人机。牌面说明和技能全文不用悬停也能读到。误点比现在少：出牌不再点一下就打出，离开对局要再确认一次。

桌面用同一套竖向布局，壳宽不超过 430px，水平居中。不另做横屏，也不另做桌面分栏。

## 2. 非目标 / Non-goals

- 不改规则、技能数据、伤害、摸牌、弃牌、胜负、8 选 1、护体、兵疲。
- 不改 AI 的选牌和出招。
- 不改 PeerJS。房主权威的 `snap()` / `act` 消息字段、`type` 取值、`ask` 的 Promise 协议都不改。
- 不改 `ask()` 在 `p.ai` 与 `p.remote` 上的分支。只改本地人类看见的那一层，以及访客收到 `type:'ask'` 时画出的那一层。
- 不改 `data/generals.js`、`data/cards.js`、`tools/`、`BALANCE.md`、`assets/portraits/`。
- 不改立绘怎么选文件。`portraitImg()` 和 `LIVELY_IDS` 保持不动：曹操、关羽、周瑜、吕布、诸葛亮、貂蝉、典韦、华佗走 PNG，失败回退同名 SVG；其余走 SVG。仓库里是 8 张 PNG 和 96 张 SVG，不是 96 张 PNG。两类文件都不增删、不重绘。
- 不改 `DESIGN.md` 的色值、字体族、圆角、边框、纯色落影、势力色条、手牌纸色，以及「禁止紫蓝渐变、玻璃拟态、模糊投影、装饰光斑」。
- 不新增 `@keyframes`。已有的 `.float` / `.shake` 原样保留。
- 不把卡牌改成 `<button>`，不加键盘出牌。
- 不在本提交里改 `index.html`、`style.css`、`game.js`。

## 3. 本提交与后续实现

| 时机 | 内容 |
|---|---|
| 本提交 | 本文件，以及 `DESIGN.md` 里指向本文件的短注 |
| 后续实现 | 只改 `index.html`、`style.css`，以及 `game.js` 的展示部分（`render`、`ask` 的界面、上滑出牌、抽屉开关、房间复制按钮的外观） |

后续实现先按第 16 节改文件。和 `DESIGN.md` 冲突时按第 4 节的优先级。

## 4. 与 DESIGN.md 的关系

同时读两份文件时，按这个顺序：

1. 布局、断点、手势、抽屉、结算、触控尺寸：以本文件为准。
2. 颜色、字体族、圆角、边框、落影、势力色条、手牌纸色、禁止项、对比度配对：以 `DESIGN.md` 为准。
3. 立绘文件和 `image-rendering`：以 `docs/superpowers/specs/2026-10-25-lively-portrait-pilot-design.md` 为准。该文件里「不改选将卡尺寸、不改座位立绘宽度」只约束当时接入 PNG 的那一次。本次允许改显示框的宽高。`object-fit: cover`、`object-position: center`、八人 `portrait-illust` 为 `auto`、其余 `pixelated`，仍然有效。
4. `docs/superpowers/specs/2026-10-25-opendesign-ui-design.md` 的第 7 节已被 `DESIGN.md` 摘走。实现时不要再按那一节的 1120px 舞台做。

本文件改掉的布局结论：

| 旧结论 | 本文件 |
|---|---|
| 舞台最大 1120px，800px 上下两套布局 | 只有一套竖向壳，最大宽度 430px |
| 选将桌面左右栏，窄屏卡墙加底部出战槽里塞技能全文 | 永远两列紧凑卡，底栏只有预览和出战，全文进半屏 |
| 对战四行网格，桌面手牌和 200px 按钮横排，窄屏牌背换行 | 单列。手牌单独横滑。按钮在手牌下面 |
| 敌方一排 28×40 牌背 | 只显示张数 |
| 牌堆区最小 120×88，日志占满剩余高度 | 牌堆 / 弃牌和日志各压缩成一行 |
| `#prompt`、`#over` 为居中纸色窄模态 | 提问在底部选项条。结算是墨底全屏 |
| 悬停上移和 `title` 用来读技能 | 触屏不依赖悬停。技能点座位看全文 |
| 手牌桌面 96×136、窄屏 72×104 | 壳内 120×168。视口高度 ≤640px 时改为 108×152，仍是一行 |

字号相对 `DESIGN.md` 只改下面这几处，其余照旧：

| 角色 | 本壳内的尺寸 |
|---|---|
| 大厅标题 | 32px，行高 1.1，字重 700，字距 `0.14em`，允许换行。不再用最大 56px |
| 选将标题 | 24px，行高 1.2，字重 700，字距 `0.08em` |
| 选将页的 `#pve` / `#host` | 14px，行高 1.2，字重 700，允许两行 |
| 牌堆 / 弃牌数字 | 16px，行高 1.2，字重 700，颜色仍是 `--gold` |
| 手牌说明 `.card small` | 14px，行高 1.35，最多 4 行，超出隐藏 |
| 其余正文、按钮、武将名 | 仍是 14px 与 16px，见 `DESIGN.md` |

间距仍只用 `--s-1` 到 `--s-7`。对战壳里各横条之间用 `--s-1`（4px），是为了在 667px 高里放下 120×168 的手牌。手牌与手牌之间用 `--s-3`（12px）。

已知并继续接受的差异：色条是魏蓝、蜀绿、吴红、群金紫；`FACTIONS` 和立绘像素仍是魏蓝、蜀红、吴绿、群灰。不改 `FACTIONS`，不重绘立绘。势力汉字仍在墨底芯片上，不压在色条上。

## 5. 信息架构 / IA

没有路由。三个屏幕用现有的类切换，结算层盖在对战上面。

```text
#app
├─ #select.screen-lobby     大厅
├─ #select.screen-select    选将（与 screen-lobby 互斥）
├─ #battle.hide             对战
├─ #over.hide               结算（全屏）
└─ 抽屉与遮罩               规则、战绩、详情、日志、技能、退出确认、提问
```

流程：

1. 打开页面是大厅。没有 `?room=` 时不调用 `selectScreen()`，看不见武将墙。
2. 「人机对战」进入选将。选中一名后点「出战」，进入对战。
3. 「创建联机房间」仍留在大厅，直到对手加入后 `selectScreen(ids)`。访客打开 `?room=` 仍走 `joinRoom()`。
4. 对局结束显示结算。人机「再来一局」刷新。联机「返回首页」去掉查询串。
5. 对战中「退出」先确认，再离开。这不是新的对局阶段。

同一时刻只开一个抽屉。打开新抽屉时先关掉已开的日志、技能、规则、战绩、详情。提问条打开时也先关掉这些抽屉。退出确认和提问条互相挡开：提问可见时「退出」不可点。

`.hide` 必须仍是 `display: none !important`。脚本顺序和 viewport 不改：`width=device-width, initial-scale=1, maximum-scale=1`。PeerJS、`data/generals.js`、`data/cards.js`、`game.js` 的顺序不改。

## 6. 外壳与桌面 / Shell

`body` 铺满视口，背景仍是 `--ink` 加 `DESIGN.md` 那一条木纹。新增 `#app` 包住第 5 节列出的屏幕和抽屉，包不住脚本。

```css
#app {
  width: min(100%, 430px);
  height: 100dvh;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background: transparent;
}
```

不支持 `dvh` 时用 `100vh`。壳内各屏 `height: 100%`，不让文档本身滚动。需要滚动的只有：选将的 `#grid`、手牌的横向 `#hand`、抽屉内部、提问选项过多时的选项区。

桌面（含 1280×800）不使用 `transform: scale`，也不使用 `zoom`。壳宽到 430px 为止，两侧是墨色案面。壳里的手牌和按钮用第 10、14 节的触控尺寸，已经大于现行窄屏的 72×104 手牌。这就是同一套竖向布局在桌面上的放大，不再做第二套网格。

抽屉、提问条、结算、遮罩都相对 `#app` 做 `position: absolute`，不用 `position: fixed`，这样它们不会在桌面上铺满整块显示器。

底部留白用 `env(safe-area-inset-bottom)`。对战底边距是 `max(8px, env(safe-area-inset-bottom))`，不把 8px 和安全区再加一遍。

## 7. 大厅 / Lobby

`#select.screen-lobby` 占满壳高，`overflow: auto`。`.select-layout` 在大厅仍是 `display: none`。

从上到下，左右内边距 `--s-4`：

1. 标题「三国对决」，32px 金色，2px 朱红错位，无模糊。
2. 副标题原文不变：`1v1 卡牌对战 · 人机 / 联机 · 选择你的武将`。颜色 `--text-muted`。
3. `#modes` 两个主按钮，纵向，间距 `--s-4`，宽度 100%，最小高度 48px。id 和文案不变：`#pve`「人机对战（换一批武将）」，`#host`「创建联机房间」。
4. `#lobby`。平时空。建房或加入时仍由 `hostRoom()` / `joinRoom()` 填。
5. 一行两个次按钮，各宽一半，间距 `--s-2`，最小高度 48px：`#rules`「规则」，`#statsOpen`「战绩」。

规则和战绩不再摊在大厅正文里。

### 7.1 房间链接一点复制

`hostRoom()` 写进 `#lobby` 的结构改为：

```html
<p>房间 <b id="roomCode">CODE</b></p>
<input id="rl" readonly>
<button id="cp" class="btn-primary" type="button">复制房间链接</button>
<span id="ls">等待对手加入…</span>
```

- `#roomCode` 用 `--gold`、20px、字重 700。
- `#rl` 仍是纸色底、墨色字、2px 墨边、宽度 100%、高度至少 48px，值为完整 URL。点击输入框只选中文字。
- `#cp` 宽度 100%，最小高度 48px。一点就复制 `#rl` 的值。成功后文案变为「已复制」。
- 复制顺序：若 `navigator.clipboard` 存在且 `window.isSecureContext`，用 `writeText`。失败或不可用时，聚焦并选中 `#rl`，再试 `document.execCommand('copy')`。仍失败则把 `#cp` 文案改为「复制失败，请长按链接」，并保持输入框选中。
- `#ls`、Peer 的 `error` / `connection` 文案保持现在的句子。不改 `new Peer`、房间码和 `offer`。

## 8. 选将 / Select

`selectScreen()` 仍去掉 `screen-lobby`、加上 `screen-select`，并 `fillSlot(null)`。

`#select.screen-select` 为纵向 flex，`overflow: hidden`，高度 100%。

顶栏不随卡墙滚动：

- `#back`「返回」，次按钮，最小 48×48。只在选将页显示。点击执行 `location.reload()`，不弹确认，不发网络消息。大厅不显示此按钮。
- `#selectTitle`「选择武将」，24px。大厅隐藏。
- 大厅的 `h1` 和 `.sub` 在选将页隐藏。
- `#modes` 横排，两钮各一半，间距 `--s-2`，最小高度 48px，高度可随两行文字增高。字号 14px。文案和 id 不变。外观改为次按钮，页上唯一的朱红主按钮是底栏的 `#confirm`。点 `#pve` 仍会再调 `selectScreen()` 换一批。
- `#lobby` 仍显示。访客和房主等待对手时的现有句子留在这里，不塞进底栏。

`.lobby-tools`（规则、战绩）在选将页隐藏。

`#grid` 占据顶栏和底栏之间的剩余高度，`overflow: auto`，`grid-template-columns: 1fr 1fr`，间距 `--s-3`，左右不再出现第三列。卡结构不变：立绘、`.faction-bar`、`.gn`（势力芯片、名字、`体力 N`）、`.skill-line`。立绘框高 88px，宽 100%，`object-fit: cover`，`object-position: center`。`.skill-line` 仍是单行省略，`title` 仍写全部技能，但触屏不靠 `title` 阅读。

点卡：未选中则选中（`is-picked`）并 `fillSlot(g)`。再点同一张则取消选中、`fillSlot(null)`，并关掉详情半屏。点另一张则替换。不在点卡时出战，也不在点卡时打开半屏。

悬停上移只在 `(hover: hover) and (pointer: fine)` 下保留。触屏不位移。选中仍是 3px `--gold` 外轮廓。

### 8.1 底栏

`#picked` 是壳底的一条，不随 `#grid` 滚走，背景 `--ink-2`，上边框 3px `--paper-ink`，内边距 `--s-2`，再加安全区。横向排列：`#picked-body` 占据剩余宽度，`#detailOpen` 与 `#confirm` 在右侧，间距 `--s-2`，两颗按钮最小高度 48px。「出战」最小宽度 88px。

```html
<aside id="picked">
  <button id="detailOpen" type="button" disabled>详情</button>
  <div id="picked-body" aria-live="polite"></div>
  <button id="confirm" class="btn-primary" type="button" disabled>出战</button>
</aside>
```

`#picked-body` 在未选时是「点选一名武将」，颜色 `--text-muted`。选中后只放 48×48 立绘、势力芯片、名字、`体力 N`。不把技能全文放进底栏。

`#detailOpen` 是次按钮，未选时禁用。有选中时，点它或点预览立绘调用 `showDetail(PICK)`。

`#confirm` 文案改为「出战」。`PICK` 为空时 `#confirm` 和 `#detailOpen` 都禁用。`fillSlot(null)` 把文案设回「出战」并禁用这两颗。`fillSlot(g)` 启用它们，文案仍是「出战」。点击仍只走现有 `confirmPick()`，条件与顺序不改：人机从全池随机对手；访客发送 `pick`；房主写入 `NET.myPick` 并 `tryStartNet()`。联机确认后只把 `#confirm` 禁用，文案改为「等待对手」。详情仍可打开。

### 8.2 详情半屏

`#detail` 改为半屏抽屉，不再是居中模态。`showDetail(g)` 只负责填内容并打开：

- 立绘宽 96px，高 96px，`object-fit: cover`。这条写在 `#detail img` 上，盖过 `.modal img { width: 120px }`。
- `势力·名字`、`体力 N`。
- 该武将 `skills` 的每一段 `【名】` 加 `t`。
- `#cl`「关闭」。

半屏里不放 `#go`，也不调用 `start()`。出战只有 `#confirm`。`max-height: 50dvh`，短内容不拉满，超出部分在半屏内滚动。纸色底，墨色字。关闭按钮用第 12 节的纸上按钮。`#detail` 可以继续带 `modal` 类，定位必须写在 `#detail` 上，盖过 `.modal` 的居中和 `min(92vw, 420px)`。

## 9. 对战布局 / Battle

`#battle` 显示时高度 100%，`overflow: hidden`，纵向 flex。子项都是 `flex: none`。左右内边距 `--s-4`，上内边距 `--s-2`，横条间距 `--s-1`。多出来的高度全部放在己方座位和手牌之间（`.hand-row` 使用 `margin-top: auto`），战场不拉成一块高桌布。页面背景保持 `--ink`。只有牌堆、弃牌和那一行日志使用 `--mat` / `--discard`。

`#table` 去掉现在的绿底、内边距、边框和 `grid-template-rows`。它只是透明的纵向容器，`gap: 4px`，把牌堆行和日志行叠起来。这 4px 就是行高表里牌堆和日志之间的那一条，不要再加一份。

从上到下：

```text
敌方座位 #ai
牌堆 #deckinfo │ 弃牌 #discardinfo
一行日志 #log          退出 #exit
己方座位 #me
（弹性空白）
手牌 #hand
操作 #actions
```

```html
<div id="battle" class="hide">
  <section class="enemy-bar">
    <div id="ai" class="seat"></div>
    <div id="aihand" class="minis" hidden aria-hidden="true"></div>
  </section>
  <section id="table">
    <div class="zones">
      <div id="deckinfo"></div>
      <div id="discardinfo"></div>
    </div>
    <div class="status-row">
      <div id="logSheet">
        <div id="log" aria-hidden="true"></div>
        <button id="logOpen" type="button" aria-label="完整日志"></button>
      </div>
      <button id="exit" type="button">退出</button>
    </div>
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

`render()` 仍给 `#deckinfo`、`#discardinfo` 写入 `牌堆 N` 与 `弃牌 N`，不增加别的句子。两格横排，各占一半，最小高度 44px，3px 墨边，字号 16px。`#deckinfo` 底 `--mat`，`#discardinfo` 底 `--discard`。

`#aihand` 保留，`render()` 可以继续写入牌背。它带 `hidden` 和 `aria-hidden="true"`。另外写上 `#aihand { display: none !important; }`，避免 `.minis { display: flex }` 盖过浏览器对 `hidden` 的默认样式。敌方张数只用 `seat()` 里已有的 `手牌 N`。

### 9.1 座位

敌我同一个 `seat()`。立绘框 72×72，`object-fit: cover`，`object-position: center`。座位底 `--ink-2`，3px 墨边，圆角 12px。体力格仍由 `hpBar()` 按 `maxHp` 生成，实心数等于 `hp`，旁边仍是 `体力 ${p.hp}/${p.maxHp}`。格尺寸 14px，间距 4px，允许换到下一行。华雄 6 点和 2 点体力走同一套，不做条形血条。

名字、技能名、装备各限制一行，超出省略。技能全文不在座位上展开。`.cnt` 的 HTML 保留。敌方 `.cnt` 可见，16px，`--gold`。己方 `.cnt` 用 CSS 隐藏，张数由底下的明牌表达。

「行动中」标记保留。装备芯片保留，说明放进技能半屏，不依赖 `title`。

`#me` 和 `#ai` 可点，最小高度 48px。监听绑在这两个节点上，不绑在 `seat()` 重写掉的子节点上。点击打开第 12.4 节的技能半屏。伤害数字 `.float` 仍绝对定位在座位内。`.seat` 不设 `overflow: hidden`，避免裁掉飘字；只有 `.portrait` 裁切立绘。

### 9.2 一行日志

`log()` 的函数体不改：仍在有主机时发送 `{type:'log'}`，仍往 `#log` 前面插入一行。Harness 提前返回的路径不改。

折叠时 `#logSheet` 高 48px，底色 `--mat`，3px 墨边，圆角 8px。`#log` 只显示第一条（最新一条），单行省略，颜色 `--gold`。`#logOpen` 透明盖住日志区域，作为整行的点击目标，不盖住旁边的「退出」，`aria-label` 为「完整日志」。点它或按 Enter / 空格打开完整日志。

展开时 `#logSheet` 变为贴在壳底的纸色抽屉，`max-height: 70dvh`，内部滚动。全部日志行可见，字色 `--paper-ink`，最新一条改为字重 700，不再用金色（金色在纸上对比不够）。`#log` 去掉 `aria-hidden`。`#logOpen` 变为纸上按钮「关闭」，`aria-label` 同步为「关闭」，钉在抽屉顶部。再点或点遮罩收起，焦点回到 `#logOpen`，`aria-label` 回到「完整日志」。

### 9.3 高度

按 375×667、安全区为 0 计算，默认尺寸必须放下，文档不滚动：

| 块 | 高度 |
|---|---|
| 上内边距 + 底边距 | 16 |
| 敌方座位（体力换行后的上限） | 144 |
| 牌堆行 | 44 |
| 日志行 | 48 |
| 己方座位（隐藏张数、体力换行） | 126 |
| 手牌区（上内边距 20 + 牌高 168） | 188 |
| 操作行 | 48 |
| 五条 4px 间距 | 20 |
| 合计 | 634 |

667 减去 634，余 33px，进弹性空白。更高的屏幕只增加这块空白，手牌仍贴底。

视口高度小于等于 640px 时，手牌改为 108×152，`#hand` 上内边距改为 16px。列数、字号、按钮高度不变。这是同一条壳的高度压缩，不是横屏布局。

## 10. 手牌与出牌 / Hand and play

手牌是一行横滑，不是扇形，不是两行网格，不用旋转。同屏最多完整展示 8 张：张数 ≤8 时牌与牌不重叠，间距仍是 `--s-3`（12px）；超过 8 张时允许部分重叠，用负 `margin-left` 把整排压进约「8 张完整牌 + 7 个间距」的总宽，露出至少约 28px，`z-index` 随序号递增，选中牌最高。

`#hand`：`display: flex`，`flex-wrap: nowrap`，默认 `gap: 12px`（≤8 张），`overflow-x: auto`，`overflow-y: hidden`，`padding-top: 20px`，`-webkit-overflow-scrolling: touch`，`touch-action: pan-x`。超过 8 张时加 `hand-overlap`，`gap: 0`，由 `layoutHand()` 按实际牌宽算重叠。视口高度 ≤640px 时，上内边距和牌尺寸改用第 9.3 节。

单张 120×168，`flex: none`。纸色、墨字、3px 墨边、8px 圆角、`0 3px 0 #0a0908`。锦囊 `--trick`，武器和防具 `--equip`。牌名 16px。斩 / 避 / 药只给牌名上色。花色红 `#9d2b22`，黑 `--paper-ink`。说明 14px，最多 4 行。不可出的牌不透明度仍是 1，用 `filter: grayscale(0.35)`，不加 `opacity`。

内部 HTML 不变：`<b>`、`<i class="suit">`、`<small>`。类名仍是 `card`、类型、`k-牌键`、`ok`、`sel`。

选中（`.sel`）上移 12px，轮廓 3px `--vermillion`。上移落在 20px 的上内边距里，不被裁掉。细指针悬停只让未选中的 `.ok` 上移 6px，0.1s。触屏没有这段位移。

### 10.1 选中、上滑、确认

只在 `G.phase === 'play'` 且 `G.cur` 是本地座位（`G.P[0]`）时启用。用模块级变量 `playSel` 记住选中的牌对象，用 `===` 比较。不写入 `G.sel`，避免和弃牌、技能选牌混用。`render()` 每次重建手牌后，按 `playSel` 重新加上 `.sel` 和监听。

阶段不是 `play`、牌已不在手里、或这张牌不再 `canPlay` 时，`render()` 清掉 `playSel`。

未选中的 `.ok`：只听 `click`。浏览器会在横向滑动后取消 `click`，所以滑动手牌不会选中。`click` 把 `playSel` 设为该牌并 `render()`。没有 `.ok` 的牌不选中，也不打出。

已选中的牌不另绑 `click`，只绑指针事件，避免和 `click` 打两次：

- `pointerdown` 记下起点。非主指针忽略。
- `pointermove`：横向绝对值先超过 10px 且大于纵向，记为滚动，不打出。
- `pointerup`：若已记为滚动，保持选中，不打出。若位移小于 10px，视为再点一次，清空 `playSel` 并 `render()`。若纵向向上至少 48px，横向绝对值不超过 24px，且纵向绝对值大于横向，视为上滑打出。其余手势保持选中，不打出。
- 不跟手拖拽牌面。松手判定即可。

打出时的调用与现在点牌相同：`resolveUser({t:'card', c})`。访客因此仍走 `guestAct()`，消息仍是 `{type:'act', t:'card', cid}`。不新增消息类型。

模块级 `playCommit` 防止打出两次。置位之后，确认和上滑都直接返回。调用 `resolveUser` 之前置位，并卸下这张牌的指针监听、禁用确认按钮。下一次 `render()` 发现阶段已变或选中已清空时，把 `playCommit` 放回 false。

弃牌阶段和技能选牌阶段不绑上滑。它们仍用现在的 `click`：点一下加入或移出 `G.sel`，再 `render()`。上滑不会弃牌，也不会确认技能。

### 10.2 底部确认 / 取消

`#actions` 在手牌下面，不盖住座位。按钮最小高度 48px，字号 16px，允许换行，左右内边距至少 16px。相邻按钮间距 `--s-2`。按下仍是 `translateY(2px)`，落影减 2px，0.1s。

出牌阶段且没有 `playSel` 时，与现在相同：有主动技能就放「技能·名」，再加上「结束出牌」。两颗并排，各占一半。一颗则通栏。技能按钮在不可用时禁用，样式仍是 `--disabled` 底、`--text` 字，不用整颗透明度。

出牌阶段且有 `playSel` 时，操作区只留两颗，各占一半：

- 「确认打出」，`btn-primary`，调用与上滑相同的打出。
- 「取消」，`btn-secondary`，清空 `playSel` 并 `render()`，不打出。

此时不显示技能和结束出牌。取消后它们回来。

弃牌阶段仍是一颗主按钮「弃牌 a/b」，张数不对就禁用。技能阶段仍是「确认 …」主按钮和「取消」次按钮，并排。取消的行为不改：清空选择，阶段回到 `play`，不发动技能。

没有轮到本地、或阶段为空时，操作区仍显示现在的等待文案（「AI 思考中…」或「对手思考中…」），容器最小高度 48px，避免手牌跳动。`G.over` 时操作区仍为空。

## 11. 提问条 / ask()

`ask()` 的协议不变：

- `p.ai` 返回 `null`。
- `p.remote` 发送 `{type:'ask', msg, opts}`，等待 `{t:'ans'}`，返回 `val`。
- 本地人类把选项画出来，经 `resolveUser(o.val)` 结束 `waitUser()`。
- `opts` 仍是 `{label, val}` 数组，顺序就是按钮顺序。没有默认项，没有超时。

本地人类和访客的 `m.type === 'ask'` 共用一个展示函数 `showPrompt(msg, opts, onChoose)`。本地的 `onChoose` 是 `resolveUser`。访客的 `onChoose` 是 `send({type:'act', t:'ans', val})`。两边的样子相同。

`#prompt` 不再居中。它可以保留 `modal` 类，但 `#prompt` 自己的规则必须盖过 `.modal` 的居中、`width: min(92vw, 420px)` 和固定定位。它相对 `#app` 贴在壳的底部，宽 100%，背景 `--ink-2`，上边框 3px 墨色，`z-index: 30`，`max-height: 70dvh`，选项区内部滚动。问题段落 14px、`--text`、左对齐，左右内边距 `--s-4`。

选项是次按钮（金边、金字），因为底是墨色，对比沿用 `DESIGN.md`。不要把第一项改成朱红。两个选项时并排，各一半；多于两个时每个通栏。最小高度 48px，文案换行，不省略。点中之后给 `#prompt` 加上 `hide`，再调用 `onChoose`。

提问可见时，遮罩挡住手牌和座位，但点遮罩不关闭、不调用 `resolveUser(null)`。没有「取消提问」。要回答就必须点一个选项。提问打开前先关掉日志、技能、规则、战绩和详情。「退出」在提问可见时 `disabled`。

## 12. 抽屉 / Drawers

共用一个遮罩 `#scrim`，是 `<button type="button" class="hide" aria-label="关闭">`。打开任一可关闭的抽屉时去掉 `hide`。遮罩绝对定位铺满 `#app`，背景 `rgba(20, 17, 14, 0.72)`。这是 `--ink` 的透明度，不是新色相。不用 `backdrop-filter`，不加模糊。`z-index: 29`。抽屉在 30。

纸色抽屉：背景 `--paper`，字色 `--paper-ink`，上圆角 12px，下边贴壳底，4px 墨边，落影 `0 -6px 0 #1a120c`，模糊半径 0。出现用 `transform` 的 0.1s 过渡，不新增关键帧。顶部一条 32×4 的 `--gold-line` 装饰，不能当成唯一的关闭办法。

纸上的关闭按钮类名 `btn-on-paper`：透明底，字色 `--paper-ink`，边框 `2px solid #1a120c`，落影 `0 3px 0 #1a120c`，最小高度 48px，字号 16px，字重 700。不用金色字，因为金色在纸上对比不够。按下同样下移 2px。

打开纸色抽屉时，焦点移到该抽屉的关闭按钮。关闭后焦点回到打开它的按钮。点遮罩等于点关闭。

### 12.1 规则

`#rules` 打开 `#ruleSheet`，不再只把说明摊在大厅里。

```html
<div id="ruleSheet" class="hide">
  <button id="ruleClose" class="btn-on-paper" type="button">关闭</button>
  <div id="ruleBox"></div>
</div>
```

`#ruleBox` 的 `innerHTML` 字符串不改，关闭按钮放在外面，避免被那段赋值清掉。抽屉 `max-height: 70dvh`，里面滚动。字号 14px，墨色。

### 12.2 战绩

```html
<div id="statsSheet" class="hide">
  <button id="statsClose" class="btn-on-paper" type="button">关闭</button>
  <div id="stats"></div>
</div>
```

`#stats` 的句子不改：`人机战绩 W 胜 L 负 · 武将池 N 位，每局随机 8 位`。`initLobby()` 和 `selectScreen()` 仍写 `textContent`。战绩只有这一句，抽屉高度随内容。

### 12.3 详情

见第 8.2 节。`#detail` 使用同一套纸色半屏，`max-height: 50dvh`。

### 12.4 技能

```html
<div id="skillSheet" class="hide">
  <button id="skillClose" class="btn-on-paper" type="button">关闭</button>
  <div id="skillBody"></div>
</div>
```

点 `#me` 读 `G.P[0]`，点 `#ai` 读 `G.P[1]`，和 `render()` 的 `me` / `ai` 一致。`G.P` 不存在时不打开。

内容：

- 标题「己方技能」或「对方技能」。
- `p.g.skills` 的每一段 `【名】` 加 `t`。不列出 `gained`，与现在 `seat()` 只画 `p.g.skills` 一致。
- 武器、防具：有则写牌名和 `CARD_DEFS[k].t`，无则写「无」。

`max-height: 50dvh`，内部滚动。只读，没有发动按钮。发动仍走底部的「技能·名」。

### 12.5 日志

见第 9.2 节。展开的 `#logSheet` 使用纸色抽屉的字色和关闭方式，遮罩与别的抽屉共用。

## 13. 退出与结算 / Exit and settle

### 13.1 对战中退出

`#exit` 在日志行右侧，次按钮，最小高度 48px，文案「退出」。提问条可见时禁用。

`#exitConfirm` 是墨色小抽屉（`--ink-2`，字色 `--text`），贴壳底，高度随内容，`z-index: 40`。文案：「离开这局？未结束的对局会直接断开。」

- 「继续」次按钮，或点遮罩：只关闭这层。
- 「离开」主按钮。人机执行 `location.reload()`。联机执行 `location.href = location.pathname`，去掉 `?room=`。不发送新的 PeerJS 消息。对端仍走现有的 `conn.on('close')`。

结算出现时关掉退出确认。结算层盖住「退出」。

### 13.2 结算

`#over` 改为铺满 `#app` 的墨底层。它可以保留 `modal` 类，定位、背景和字色写在 `#over` 上：背景 `--ink`，字色 `--text`，盖过 `.modal` 的居中窄纸卡。`z-index: 35`，内边距 `--s-5`，底部含安全区。标题居中，金色，32px，字重 700，2px 朱红错位。正文 14px，`--text`，居中。主按钮宽度 100%，最小高度 56px。

人机 `endGame()` 的句子不改：

```html
<h2>胜利！或败北…</h2>
<p>武将名 获胜</p>
<p>战绩：W 胜 L 负</p>
<button class="btn-primary" type="button">再来一局</button>
```

「再来一局」仍是 `location.reload()`。胜负统计仍由现有的 `localStorage.sgStats` 逻辑写入，不改加减条件。

访客收到 `type:'over'` 的句子不改：

```html
<h2>胜利！或败北…</h2>
<p>武将名 获胜</p>
<p>想再战请让房主新建房间</p>
<button class="btn-primary" type="button">返回首页</button>
```

「返回首页」仍是 `location.href = location.pathname`。不在这层补战绩。

`endGame()` 仍给 `#prompt` 加 `hide`。同时关掉其它抽屉。

## 14. 触控与可读性 / Touch

- 可点控件最小 48×48px：大厅按钮、规则、战绩、返回、换一批、详情、出战、手牌（牌本身大于此）、日志行、退出、操作按钮、提问选项、抽屉关闭、结算按钮。
- 相邻控件间距至少 `--s-2`，手牌间距 `--s-3`。
- `:focus-visible` 仍是 `2px solid var(--gold)`，`outline-offset: 2px`。纸上按钮的焦点环改用 `2px solid var(--paper-ink)`，避免金环落在纸上。
- 牌面说明印在牌上，最多 4 行。技能全文在半屏里，14px，行高 1.45。
- 不使用悬停作为唯一的说明。`title` 可以留着，但不算完成阅读。
- 对比度沿用 `DESIGN.md` 的配对。本文件新用到的表面只有两种：墨底上的原有按钮，纸底上的 `--paper-ink` 字和纸上按钮。遮罩是 `--ink` 的 72% 透明度。

## 15. 桌面缩放 / Desktop

宽度大于 430px 时：

- `#app` 仍是 `min(100%, 430px)`，`margin: 0 auto`，高度 `100dvh`。
- `body` 的墨色和木纹露在两侧。
- 选将仍是两列，不是 168px 固定列加 300px 出战栏。
- 对战仍是第 9 节的单列。手牌不和按钮横排。日志不拉高去填满桌面。
- 不写 `@media (min-width: 800px)` 的第二套对战或选将网格。细指针悬停可以单独写在 `(hover: hover) and (pointer: fine)` 里。

最小宽度 320px。320px 时选将两列约 138px 宽，仍然整卡可点。手牌在 `#hand` 里横滑，不把页面撑出横向滚动条。

## 16. 允许改动的文件 / Files

后续实现可以改：

| 文件 | 改什么 |
|---|---|
| `index.html` | 增加 `#app`、`#back`、`#selectTitle`、`#statsOpen`、`#statsSheet`、`#ruleSheet`、`#scrim`、`#detailOpen`、`#logSheet`、`#logOpen`、`#exit`、`#exitConfirm`、`#skillSheet`。把现有屏幕和抽屉放进 `#app`。不删除第 17 节的 id |
| `style.css` | 430px 壳、单列对战、手牌尺寸、`#aihand { display: none !important }`、底部提问条、全屏结算、抽屉、纸上按钮。删掉 800px 的分栏规则。`#prompt`、`#over`、`#detail` 的新定位要盖过原来的 `.modal` |
| `game.js` | 见下面的函数 |

`game.js` 允许动的只有展示：

| 函数或位置 | 允许的改动 |
|---|---|
| `render()` | 按 `playSel` 画选中；出牌阶段改绑点击和上滑；`#actions` 在选中时换成确认 / 取消；给 `#aihand` 的赋值可以保留 |
| `ask()` 的本地人类分支 | 改为调用 `showPrompt`。`p.ai` 与 `p.remote` 分支不动 |
| 访客 `m.type === 'ask'` | 改为调用同一个 `showPrompt` |
| `endGame()` 和访客 `over` | 只改 `#over` 的外壳类名和按钮类名，句子和跳转不改 |
| `hostRoom()` 里写 `#lobby` 的那一段 | 换成第 7.1 节的结构和复制顺序 |
| `fillSlot()` | 底栏短预览。空态文案改为「点选一名武将」，并禁用 `#confirm` 与 `#detailOpen`，把 `#confirm` 文案设回「出战」。有武将时启用这两颗 |
| `confirmPick()` | 按钮文案在禁用等待时改为「等待对手」。分支顺序不改 |
| `selectScreen()` 的点卡 | 仍只选中或取消。不调用 `showDetail` |
| `showDetail()` | 只填半屏并打开。去掉 `#go` 和其中的 `start()` / `send('pick')` 副本 |
| `initLobby()` | 绑定 `#back`、`#statsOpen`、`#detailOpen`、`#exit`、座位点击、日志开关。`#pve`、`#host`、`#confirm` 的原有行为保留 |
| `#rules` 的点击 | 打开 `#ruleSheet`，不再把说明展开在大厅流里 |
| 新函数 | `showPrompt`、`openSheet`、`closeSheets`、上滑判定。注释用中文 |

不许改：`playCard`、`damage`、`turn`、`judge`、`respond`、AI 各函数、`snap`、`guestAct`、`onMsg` 里除 `ask` / `over` 画层以外的分支、`buildDeck`、`CARD_DEFS`、`GENERALS`。

`log()` 不改。`seat()` 的字段不增不删。若技能半屏需要装备说明，从 `G.P` 读，不改 `seat()` 的 HTML 结构。

## 17. DOM 契约 / IDs

这些 id 必须还在，脚本继续用 `querySelector` 找到它们：

`select`、`modes`、`pve`、`host`、`lobby`、`stats`、`rules`、`ruleBox`、`grid`、`picked`、`picked-body`、`confirm`、`detail`、`battle`、`ai`、`aihand`、`table`、`deckinfo`、`discardinfo`、`log`、`me`、`hand`、`actions`、`prompt`、`over`、`rl`、`cp`、`ls`。

类名必须还在：`hide`、`screen-lobby`、`screen-select`、`gcard`、`is-picked`、`f-wei`、`f-shu`、`f-wu`、`f-qun`、`fac`、`gn`、`portrait`、`portrait-illust`、`faction-bar`、`skill-line`、`seat`、`hp`、`skills`、`equip`、`card`、`back`、`ok`、`sel`、`trick`、`weapon`、`armor`、`k-zhan`、`k-bi`、`k-yao`、`float`、`bad`、`good`、`shake`、`wait`、`suit`、`red`、`modal`、`minis`、`btn-primary`、`btn-secondary`。

新增 id：`app`、`back`、`selectTitle`、`statsOpen`、`statsSheet`、`statsClose`、`ruleSheet`、`ruleClose`、`scrim`、`detailOpen`、`logSheet`、`logOpen`、`exit`、`exitConfirm`、`skillSheet`、`skillBody`、`skillClose`、`roomCode`。

`#cl` 只在详情半屏打开时存在，由 `showDetail()` 写进 `#detail`。不再生成 `#go`。

## 18. 验收 / Acceptance

后续实现用这些检查，不靠悬停。主路径是 375×667 竖屏。另外看 390×844、320×700、1280×800。

1. 375px 宽打开是大厅，没有八张武将。人机和联机两个按钮都是壳的全宽，高度至少 48px。
2. 点人机进入选将。八张卡正好两列，可以滚动。点一张，底栏出现预览，「出战」变为可点。再点同一张，预览清空，按钮禁用。
3. 点「详情」或预览立绘，半屏里能读完该武将全部技能。关闭后仍停留在选将，没有开战。半屏里没有第二颗出战按钮。
4. 点「出战」进入对战。敌方有立绘、名字、体力、装备或空装备、手牌张数，没有一排牌背。牌堆和弃牌在同一行。日志只有最新一行。
5. 手牌是一行横滑。牌上能读到牌名和最多四行说明。不可出的牌是灰度，不是半透明。
6. 点一张可出的牌，它上移并出现朱红轮廓，日志不增加，牌还在手里。再点它，选中取消。点「确认打出」才打出，日志出现使用记录。
7. 再点一张可出的牌，向上滑动至少 48px、横向不超过 24px，牌被打出。横向滑动只滚动手牌，不打出，也不误选。
8. 选中后点「取消」，牌不打出，技能和「结束出牌」回到操作区。
9. 不可出的牌，点按和上滑都不打出。
10. 弃牌阶段点牌只改变选中张数。张数未满时确认按钮禁用。上滑不弃牌。
11. 需要选牌的技能：确认和取消在底部。取消后技能未发动，回到出牌。
12. AI 或对手提问时，选项贴在底部，每颗至少 48px。不是屏幕中间的一列窄按钮。点遮罩不会把提问关掉，也不会替玩家选「否」。
13. 点己方座位能读到技能全文和装备说明。点敌方座位同样能读。不需要长按或悬停。
14. 点日志行能滚完历史。关闭后回到一行日志。
15. 点「退出」，「继续」留在局里。人机下「离开」回到大厅。联机下「离开」回到没有 `?room=` 的首页，且不出现新的消息 `type`。
16. 人机打到一方体力为 0，墨底全屏显示胜负、武将名和战绩，一颗至少 56px 高的「再来一局」。点它回到大厅。
17. 大厅「规则」抽屉里的段落仍包含回合、花色、护体、兵疲和全部牌的说明，可滚动，遮罩和「关闭」都能收起。「战绩」抽屉只有那一句统计。
18. 创建房间后，点一次「复制房间链接」变为「已复制」。输入框里仍是完整 URL。
19. 1280×800 上，对战仍是中间一条不超过 430px 的竖条，两侧是墨底。没有 1120px 宽的桌，没有手牌旁边的 200px 按钮列，选将没有右侧 300px 栏。
20. 320px 宽没有页面级横向滚动。两列选将卡和 48px 按钮都能点到。
21. `?auto&g=0` 仍能在无人点击时结束，`document.title` 以 `OVER` 开头。展示层的监听不得在 AI 对局抛错。
22. 色值、立绘文件、`snap()` 的字段、`act` 的 `t` 取值与本提交之前一致。没有新的 `@keyframes`，没有模糊和紫蓝渐变。
