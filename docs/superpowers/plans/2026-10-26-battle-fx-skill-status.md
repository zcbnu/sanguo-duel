# 对战特效与技能状态 Implementation Plan

> 规格已锁定：`docs/superpowers/specs/2026-10-26-battle-fx-skill-status-design.md`。本计划只覆盖那份规格的后续实现。

**Goal:** 中区独立特效层播放斩、避、药、锦囊、装备轨迹，飘字和技能闪光不被座位重绘清掉；座位、半屏和唯一主动按钮读同一份技能与标记；房主用已有 `type:'fx'` 同步给访客。

**Architecture:** 不引入框架。`#fxLayer` 是 `#table` 的最后一个子节点。`game.js` 只在日志和出牌之后插入展示调用，并给 `snap()` 追加只读字段。规则、AI、`ask`、`act` 的 `t` 不动。

**Tech Stack:** 静态 HTML / CSS / JS。GitHub Pages 从 `main` 根目录发布。

## Global Constraints

- 只改 `index.html`、`style.css`、`game.js` 的展示，以及本计划。规格文件已在分支上，一并进入 `main`。
- 牌名用斩、避、药。五条轨迹对应杀、闪、桃、锦囊、装备，时长 0.6–1.2 秒。
- 出牌阶段仍只有一颗主动按钮。限定用尽的文案是 `限定已发动`。
- 不改 `data/`、`tools/`、立绘、壳宽、手牌尺寸、提问条、结算句子和抽屉层级。
- `window.HARNESS` 时不创建特效节点、不发送特效消息。

## Tasks

- [x] `#table` 末尾加空的 `#fxLayer`，层绝对定位盖住中区，点击穿透。展开的日志改挂到 `#app`，抽屉仍贴壳底。
- [x] `fxCard` 按结算牌键播放五条轨迹，8 个实心光点，到点自己移除。
- [x] `log()` 在房主和人机侧识别 `发动【名】` / `觉醒【名】` 并闪光。访客重放日志不闪光。
- [x] `float()` 改挂到 `#fxLayer`，消息带 `kind:'float'`。
- [x] 座位技能行改为 `skillsOf` 加标记芯片。半屏打开时 `render()` 重写正文。
- [x] 主动按钮文案带次数；`snap()` 追加展示字段和 `turnNo`。
- [x] 访客按 `kind` 分发。结算前清空特效层。
