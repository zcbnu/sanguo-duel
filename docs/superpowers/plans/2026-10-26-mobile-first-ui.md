# 手机优先纵向界面 Implementation Plan

> **For agentic workers:** 规格已锁定，本计划按 `docs/superpowers/specs/2026-10-26-mobile-first-ui-design.md` 第 16 节直接实现。用户已要求实现并发布到 `main`。

**Goal:** 把大厅、选将、对战、结算收成一条最大 430px 的竖向手机壳，出牌改为点选后上滑或底部确认。

**Architecture:** 不引入框架。`index.html` 用 `#app` 包住屏幕和抽屉。`style.css` 只保留一套竖向布局。`game.js` 只改展示：`render`、`showPrompt`、抽屉和复制链接。规则、AI、PeerJS 消息和立绘选择不动。

**Tech Stack:** 静态 HTML / CSS / JS。GitHub Pages 从 `main` 根目录发布。

## Global Constraints

- 只改 `index.html`、`style.css`、`game.js` 的展示，以及本计划。
- 不改规则数字、AI、`snap()` / `act` 字段、`data/`、`tools/`、`assets/portraits/`。
- 色值、字体族、圆角、纯色落影、势力色条、手牌纸色以 `DESIGN.md` 为准。
- `.hide` 仍是 `display: none !important`。不新增 `@keyframes`，不用 `position: fixed`、模糊、紫蓝渐变。
- 壳宽 `min(100%, 430px)`，高度 `100dvh`（回退 `100vh`）。抽屉相对 `#app` 绝对定位。
- 可点控件最小 48px。手牌默认 120×168，视口高度 ≤640px 时 108×152。
- `node tools/sim.js 1` 须 `games>0` 且 `errors=0`。

---

### Task 1: 外壳

**Files:** `index.html`、`style.css`

- [x] `#app` 包住大厅、对战、结算、遮罩和抽屉，不包脚本。
- [x] 大厅全宽主按钮；规则、战绩进抽屉。
- [x] 选将两列加底栏「详情 / 预览 / 出战」。
- [x] 对战单列：敌方张数、一行牌堆和日志、己方、贴底手牌和操作。
- [x] 删掉 800px 分栏。

### Task 2: 展示脚本

**Files:** `game.js`

- [x] `playSel` 点选，上滑或「确认打出」才 `resolveUser({t:'card',c})`。弃牌和技能仍点一下改 `G.sel`。
- [x] `showPrompt` 给本地人类和访客提问共用，贴底，点遮罩不关闭。
- [x] `openSheet` / `closeSheets` 管规则、战绩、详情、技能、日志。
- [x] 退出确认：人机刷新，联机去掉 `?room=`。
- [x] 房间链接按剪贴板、`execCommand`、失败文案的顺序复制。

### Task 3: 验收与发布

- [x] `node --check game.js` 与 `node tools/sim.js 1`。
- [x] 375px 宽检查大厅、选将、出牌手势和抽屉。
- [ ] 合并进 `main` 后确认 GitHub Pages。
