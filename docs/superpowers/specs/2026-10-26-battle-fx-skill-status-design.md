# 对战特效与技能状态设计说明

Battle FX and skill status spec

状态：方案 A 已锁定。本文件是后续实现的规格。本提交只新增本文件，不改页面、样式、脚本、立绘、规则、AI 或联机的出牌协议。

线上站点仍是静态页。技术栈保持 HTML / CSS / JS。不引入框架、构建、画布、WebGL、新字体、图片粒子或第二份样式表。

本游戏的牌名是斩、避、药，不是杀、闪、桃。五条轨迹按这个对应关系落地：斩轨对应杀，避轨对应闪，药轨对应桃，另加锦囊轨和装备轨。界面文案只用 `CARD_DEFS` 里的牌名。

## 1. 目标 / Goals

对战中区有一层独立的特效，座位重绘清不掉它。

- 打出或打出当作某牌时，中区亮出这张牌的结算牌面，并按轨迹播放约 0.6–1.2 秒的光点。时长取完整可读，不为了尽快结束而缩短。
- 日志里出现技能发动或觉醒时，中区闪一下 `【技能名】`。
- 伤害、失去体力和回复的飘字留在这一层上，紧跟其后的 `render()` 不再把数字抹掉。
- 座位用 `skillsOf` 画出固有技能和获得技能，并画出田、权、不能出斩、额外斩、觉醒等标记。
- 出牌阶段仍只有一颗主动技能按钮，文案带上次数，例如 `技能·制衡 0/1`；限定技用尽后这颗按钮的文案是 `限定已发动`。
- 技能半屏与座位读同一份技能和标记，打开期间状态变化会重写半屏正文。
- 房主把出牌、技能闪光和飘字同步给访客。访客能看到同一套特效，且蛊惑的扣置牌不会从特效消息里泄露花色。

## 2. 非目标 / Non-goals

- 不改伤害、回复、摸牌、弃牌、判定、拼点、胜负、护体、兵疲、次数消耗和 `markUsed` 的规则。
- 不改 AI 的选牌、出招和 `aiWant` / `aiSel`。
- 不改 `ask()` 的 Promise 协议，不改 `type:'ask'` 的字段，不改 `act` 的 `t` 取值（仍是 `card`、`skill`、`end`、`ans`、`discard`）。
- 不新增顶层消息 `type`。出牌和技能闪光沿用已有的 `type:'fx'`，只增加 `kind` 和对应字段。状态仍是 `type:'state'`。
- 不改 `data/generals.js`、`data/cards.js`、`tools/`、`BALANCE.md`、`assets/portraits/`、`portraitImg()`、`LIVELY_IDS`。
- 不改手机壳：`#app` 最大宽度、单列顺序、手牌尺寸、按钮高度、日志一行、提问条、结算全屏、抽屉层级都不改。
- 不改立绘取景、势力色条、色值令牌、字体族。不新加色值。
- 不把飘字改回座位内部。不给 `.seat` 增加 `overflow: hidden`。
- 受击横移 `.shake` 仍加在 `#ai` / `#me` 上，不进特效层。
- 不为没有「发动」或「觉醒」字样的锁定技补日志，也不补闪光。放权发动后现有日志没有「发动」，因此不闪光。
- 静默主动技（`silent: true` 的赤锋、龙胆、父魄）不发技能闪光。它们打出的牌走对应的牌面轨迹。
- 不做出牌音效、全屏震屏、拖尾模糊、渐变光晕、玻璃和装饰性常驻光斑。
- 不读 `prefers-reduced-motion`。
- 不增加第二颗主动技能按钮，不做技能选择器。
- 不修正 `p.gained = [...]` 覆盖旧数组的规则行为。界面只显示当前数组里剩下的技能。
- 本提交不改 `DESIGN.md`、`index.html`、`style.css`、`game.js`。

## 3. 本提交与后续实现

| 时机 | 内容 |
|---|---|
| 本提交 | 只有 `docs/superpowers/specs/2026-10-26-battle-fx-skill-status-design.md` |
| 后续实现 | 只改 `index.html`、`style.css`，以及 `game.js` 的展示部分（第 12 节列出的函数和插入点） |

后续实现先写计划，再按第 12 节改文件。和旧规格冲突时按第 4 节。

## 4. 与既有规格的关系

同时读多份文件时，按这个顺序：

1. 特效层、五条轨迹、飘字宿主、技能行、标记、技能按钮文案、技能半屏同步、`type:'fx'` 的新字段、`snap()` 新增的展示字段：以本文件为准。
2. 壳宽、单列、手牌、提问、结算、抽屉、触控尺寸：以 `docs/superpowers/specs/2026-10-26-mobile-first-ui-design.md` 为准。
3. 色值、字体族、圆角、边框、纯色落影、势力色条、手牌纸色、对比度配对：以 `DESIGN.md` 为准。
4. 立绘文件和 `image-rendering`：以 `docs/superpowers/specs/2026-10-25-lively-portrait-pilot-design.md` 为准。

本文件改掉的旧结论只有下面这些：

| 旧结论 | 本文件 |
|---|---|
| 不新增 `@keyframes`；`.float` / `.shake` 原样保留 | `.float` 的 `fl` 和 `.shake` 的 `sh` 原样保留。另外允许第 7、8 节列出的特效关键帧 |
| 伤害数字绝对定位在座位内 | 飘字是 `#fxLayer` 的子节点 |
| 后续实现不许改 `playCard`、`respond`、`snap`、`float`、`log`、`seat()` | 只允许第 12 节那种不改变分支和返回值的展示插入，以及 `snap()` 追加字段 |
| `docs/superpowers/specs/2026-10-25-opendesign-ui-design.md` 不新增飞牌和粒子 | 中区短时牌面和 8 个实心光点按本文件做 |
| `DESIGN.md` 禁止装饰光斑 | 光点只在出牌轨迹里存在，播完即从 DOM 移除。它们不是页面装饰 |

光点是 6×6 的实心圆，颜色只用已有令牌。不用 `filter`、不用 `blur`、不用渐变、不用带模糊半径的投影。文字投影只许沿用飘字已有的 `2px 2px 0 #14110e`（模糊半径为 0）。

## 5. 现状与原因

`float()` 把 `.float` 插进 `#ai` 或 `#me`。`damage()`、`loseHp()`、`heal()` 在插入之后立刻 `render()`，而 `render()` 对这两个座位写 `innerHTML`。数字在 900ms 动画结束前就被清掉，所以玩家看不到 `-N` / `+N`。藤盾的「藤盾」飘字也挂在座位上，下一次座位重绘同样会清掉。

`seat()` 只遍历 `p.g.skills`。`skillsOf` 已经是 `p.g.skills.concat(p.gained||[])`，获得的排异、奇径、攻心、占星、英发、鹰视和左慈的被动不会出现在座位上。田、权、营、不能出斩、额外斩、觉醒等字段已经写在角色身上，座位不显示。

`showSkill()` 同样只写 `p.g.skills`。半屏打开后，后续 `render()` 不刷新正文。

出牌阶段按钮文案是 `技能·${act.s.n}`。`used` 和 `limitUsed` 已经决定按钮是否禁用，但按钮上看不到 `0/1`，也看不到限定技已经发动。`activeOf` 取 `skillsOf` 里第一枚 `active` 技能。这个选择保持不变。

联机飘字已经是房主发送 `{type:'fx', w, txt, cls}`，访客用 `G.P[m.w]` 再调用 `float()`。`w` 的方向保持不变：被影响的人是访客时 `w` 为 0，是房主时 `w` 为 1。出牌和技能闪光还没有对应的 `fx` 消息。访客不跑规则，看不到房主这边本地画出来的牌面。

`snap()` 已经带有 `tian`、`quan`、`noZhan`、`extraZhan`、`gained`、`used`、`limitUsed`、`zhanUsed`。还没有 `woke` 以及第 10 节其余标记用到的字段，访客画不出这些芯片。`G.turnNo` 也不在状态消息里，访客无法判断智迟是否仍在本回合。

## 6. 特效层 / #fxLayer

`#fxLayer` 是 `#table` 的最后一个子节点，空的，`aria-hidden="true"`。

```html
<section id="table">
  <div class="zones">…</div>
  <div class="status-row">…</div>
  <div id="fxLayer" aria-hidden="true"></div>
</section>
```

`#table` 增加 `position: relative`。这不改变它的文档流高度、间距和两行内容。`#fxLayer`：

```css
#fxLayer {
  position: absolute;
  inset: 0;
  z-index: 4;
  overflow: visible;
  pointer-events: none;
}
```

层盖住牌堆数字和那一行日志，点击会穿过，日志和「退出」仍能点。层不盖住手牌、操作按钮和两个座位的点击区域，因为那些节点不在 `#table` 里。打开的日志抽屉、提问条、技能半屏、遮罩和结算的 `z-index` 仍是 29 到 40，盖住特效。

`render()` 不读取、不写入、不清空 `#fxLayer`。清空只发生在两处：`endGame()` 写入 `#over` 之前，以及访客处理 `type:'over'` 时。两处都是移除全部子节点，不隐藏 `#battle`。致死一击的飘字已经在 `damage()` 现有的 `sleep(450)` 里显示过，随后 `dying()` 才进入 `endGame()`。清层不提前塞进 `render()`。

子节点超过 12 个时，追加新特效之前先去掉最旧的一个子节点。每个特效到点后，若自己仍挂在 `#fxLayer` 上，就移除自己，不靠 `render()`。层和它的子节点都保持 `pointer-events: none`，画出座位范围的飘字也不挡住座位点击。

`window.HARNESS` 为真时，`float`、`fxCard`、技能闪光立刻返回，不发送、不创建节点。`?auto` 的浏览器对局不是 HARNESS，特效照常创建；`sleep` 在 `?auto` 下已经是立即完成，特效定时器照常清理。规则流程不等待特效结束。

## 7. 出牌轨迹 / FX tracks

新增 `fxCard(p, card, key, faceDown)`。它不是 `async`，调用方不 `await`。`window.HARNESS` 时返回。没有 `#fxLayer` 时返回。

`key` 是结算牌键，不是实体牌键。牌面大字是 `CARD_DEFS[key].n`。有实体牌且 `faceDown` 不为真时，花色是 `cs(card)`，红色花色沿用 `.suit.red`。实体牌缺失时不写花色。`faceDown` 为真时画牌背，大字仍是结算牌名，不写花色。

轨迹由 `key` 决定，双方用同一个函数：

| 条件 | 轨迹类 | 光点颜色 | 时长 | 光点运动 |
|---|---|---|---|---|
| `zhan`、`huozhan` | `track-zhan` | `--float-bad` | 0.9s | 8 个光点从牌心飞向对手。出牌者 `p.i===0` 时整体 `translateY(-36px)`；`p.i===1` 时整体 `translateY(36px)`。第 `n` 个光点（`n` 从 0 到 7）再加横向 `(n-3.5)*8px` |
| `zhangu` | `track-zhan track-drum` | `--gold` | 0.8s | 与斩相同的方向。这是斩轨的金色变体，不另做第六种运动 |
| `bi` | `track-bi` | `--gold` | 0.7s | `n` 为 0 到 3 的光点 `translateX(-40px)`，`n` 为 4 到 7 的光点 `translateX(40px)` |
| `yao` | `track-yao` | `--float-good` | 1.0s | 向上 `translateY(-28px)` 后透明 |
| `type==='trick'` | `track-trick` | `--gold-line` | 1.2s | 第 `n` 个光点沿 `n*45°` 移动 32px |
| `type==='weapon'` 或 `armor` | `track-equip` | `--equip` | 0.8s | 向下 `translateY(24px)` |

牌面纸色沿用现有牌类：锦囊 `--trick`，武器和防具 `--equip`，其余 `--paper`。斩、火斩的牌名色 `--zhan`，避为 `--bi`，药为 `--yao`，其余牌名 `--paper-ink`。

牌面节点是 `#fxLayer` 里的一个子节点，类名 `fx-card` 加上轨迹类。尺寸 72×96，水平垂直居中于层。入场 12% 时长内从透明度 0、缩放 0.92 到透明度 1、缩放 1，80% 时长时仍不透明，结束时透明。光点是这张牌里的 8 个 `span.fx-pip`，6×6，`border-radius: 50%`，绝对定位在牌心附近。关键帧只使用 `transform` 和 `opacity`。

关键帧名称固定为：`fx-card-in`、`fx-pip-zhan-up`、`fx-pip-zhan-down`、`fx-pip-bi-left`、`fx-pip-bi-right`、`fx-pip-yao`、`fx-pip-trick`、`fx-pip-equip`。斩轨在 `p.i===0` 时用 `fx-pip-zhan-up`，在 `p.i===1` 时用 `fx-pip-zhan-down`。方向用绘制当时那名角色的 `p.i`：房主用本地角色，访客用 `G.P[w]`。访客对象的 `i` 已按访客自己的座位重映射，光点仍然飞向出牌者的对手。

每个表中的调用点只调用一次 `fxCard`。调用写在对应语句之后，不改条件、不改返回、不改 `await`。

| 位置 | 调用 |
|---|---|
| `playCard`，使用日志之后 | `fxCard(p, c, k, false)`，`k` 是 `as\|\|c.k`。装备、锦囊、药、斩、火斩、战鼓、滔乱都走这里，分支里不再调用 |
| `respond`，打出日志之后 | `fxCard(p, c, k, false)` |
| `dying`，濒死使用日志之后 | `fxCard(p, c, 'yao', false)`。急救的红色牌当药，牌面大字是药 |
| `duanliang` 与 `qixi`，当破阵的日志之后 | `fxCard(p, cards[0], 'pozhen', false)` |
| `luanji`，当箭雨的日志之后 | `fxCard(p, cards[0], 'jianyu', false)`。两张牌只亮第一张 |
| `fupo`，当斩的日志之后 | `fxCard(p, cs[0], 'zhan', false)` |
| `yandou` 与 `lihun`，谦逊提前返回之后、`duel` 之前 | `fxCard(p, cards[0], 'dantiao', false)`。谦逊使单挑无效时不调用 |
| `guhuo`，扣置日志之后 | `fxCard(p, null, 'zhan', true)`。本地也不画实体牌花色 |
| `jixi`，发动日志之后、`doZhan` 之前 | `fxCard(p, null, 'zhan', false)` |
| `mouzhu`，视为使用斩的日志之后、`doZhan` 之前 | `fxCard(p, null, 'zhan', false)` |

疾袭的日志含「发动」，因此同一时刻还有一次技能闪光。谋诛的闪光发生在更早的 `发动【谋诛】` 日志，斩轨发生在后面的视为斩。这是两种特效各一次，不是同一条轨迹画两遍。判定亮出的牌、拼点亮出的牌、弃牌，都不调用 `fxCard`。

房主在 `fxCard` 里先画，再发送。访客只在收到消息时画，不在本地规则里再画一次。消息形状：

```js
{type:'fx', kind:'card', w, key, suit, red, faceDown}
```

`w` 与现有飘字相同。`suit` 是花色字符串，没有实体牌或 `faceDown` 为真时是空字符串。`red` 是布尔值。`faceDown` 为真时 `suit` 必须是空字符串，`red` 必须是 `false`，消息里没有牌的 `id`、点数和实体 `k`。牌名和轨迹只由 `CARD_DEFS[key]` 决定。消息不带牌名字段。

## 8. 技能闪光

`log()` 在 HARNESS 提前返回的路径上不闪光。房主和人机在把日志行插入 `#log` 之后检查正文：

- 含 `发动【名】` 时，`名` 取第一对括号里的文字。
- 否则含 `觉醒【名】` 时，同样取第一对括号。
- 两种都没有则不闪光。

一句日志只闪一次。`觉醒【自立】，获得【排异】` 只闪 `【自立】`。`发动【双刃戟】` 也闪，因为它用的是同一句式；不做技能白名单。提问文案不经过 `log()`，不闪光。

访客角色调用 `log()` 时是在重放房主的日志，只插入文字，不检查、不发送。闪光由访客收到的 `fx` 消息画出，因此不会闪两次。

闪光节点类名 `fx-skill`，文本正好是 `【名】`，20px，字重 700，颜色 `--gold`，投影 `2px 2px 0 #14110e`。放在 `#fxLayer` 正中。时长 0.8s：升起 12px 并在结束时透明。没有光点。关键帧名 `fx-skill`。

房主发送 `{type:'fx', kind:'skill', name}`。没有 `w`。访客收到后画出同一个节点。`name` 为空则不画。

## 9. 飘字 / Floats

`float(p, txt, cls)` 仍是伤害、失体、回复和藤盾的唯一入口。文案和 `cls` 不变：`'-'+n` 配 `bad`，`'+'+n` 配 `good`，藤盾配 `good`。

HARNESS 时立刻返回。否则：

1. 房主发送 `{type:'fx', kind:'float', w, txt, cls}`。`w` 的算法不变。
2. 在 `#fxLayer` 里追加节点，类名仍是 `float bad` 或 `float good`，再加 `to-me`（`p.i===0`）或 `to-ai`（`p.i===1`）。
3. 900ms 后移除该节点。动画仍是现有的 `fl`：向上 30px，结束时透明。

`#fxLayer .float.to-ai` 贴在层的上沿（`top: 0`）。`#fxLayer .float.to-me` 贴在层的下沿（`top: auto; bottom: 0`）。同一层里已经存在的 `.float` 每多一个，新飘字的 `right` 增加 36px，起点是 12px。敌方数字向上进入敌方座位下沿，己方数字从中区下沿向上，读在己方座位上方。`#battle` 的 `overflow: hidden` 把画出的部分留在壳内。

访客的 `type:'fx'` 且 `kind` 缺失或为 `float` 时，用 `G.P[m.w]` 调用只画不发送的绘制。绘制函数不再次 `send`。`kind==='card'` 和 `kind==='skill'` 不进入飘字。

## 10. 技能状态界面

### 10.1 座位

`seat()` 的技能行改为两段，仍是原来的一个 `.skills` 节点，仍是一行，`white-space: nowrap`，超出省略。不增加第二行。手机优先规格第 9.3 节的 375×667 高度表继续有效。

顺序固定：

1. `skillsOf(p)` 的每一枚技能一个 `span`。固有技能不加额外类。`p.gained` 里的技能加类 `gained`。`title` 仍是该技能的 `t`。
2. 第 10.2 节的标记芯片，每个一个 `span.mark`。

获得技能的芯片：底 `--vermillion`，字 `#fff8ee`。标记芯片：底 `--ink`，字 `--gold`，`1px solid var(--gold-line)`，字号 12px，行高不超过原来的 14px 技能行。技能名芯片的颜色保持现状。

`.name`、`.hp`、`.equip`、`.cnt`、「行动中」都不改。己方 `.cnt` 继续由 CSS 隐藏。

### 10.2 标记

芯片只来自下表，按表的顺序。条件不成立就不输出节点。没有「无」占位。数字用字段的当前整数，不加正号。

| 顺序 | 条件 | 文案 |
|---|---|---|
| 1 | `(p.tian\|\|0) > 0` | `田 N` |
| 2 | `(p.quan\|\|0) > 0` | `权 N` |
| 3 | `p.ying` 为真 | `营` |
| 4 | `p.noZhan` 为真 | `不能出斩` |
| 5 | `(p.extraZhan\|\|0) > 0` | `斩+N` |
| 6 | `p.woke` 为真 | `已觉醒` |
| 7 | `p.zhanguOn` 为真 | `战鼓` |
| 8 | `p.tianyiBonus` 为真 | `天义` |
| 9 | `p.hardNext` 为真 | `不可避` |
| 10 | `p.xianzhenOn` 为真 | `陷阵` |
| 11 | `p.luozhanOn` 为真 | `裸战` |
| 12 | `p.yangweiOn` 为真 | `扬威` |
| 13 | `p.xiongluanOn` 为真 | `雄乱` |
| 14 | `p.skipPlay` 为真 | `跳过出牌` |
| 15 | `p.guose` 为真 | `国色` |
| 16 | `(p.drawMinus\|\|0) > 0` | `少摸 N` |
| 17 | `(p.wzMinus\|\|0) > 0` | `上限-N` |
| 18 | `(p.zhichiT\|\|0) === G.turnNo` 且 `G.cur` 存在且 `G.cur !== p` | `智迟` |

座位一行放不下时，省略号截掉行尾。被截掉的标记仍然完整出现在技能半屏。

### 10.3 技能半屏

`showSkill(which)` 仍在点击 `#me` / `#ai` 时打开，`which` 仍是 0 或 1。模块级 `skillWho` 记下当前半屏的座位；`closeSheets()` 把它设为 `null`。

正文用 `skillsOf(p)`：

- 标题仍是「己方技能」或「对方技能」。
- 固有技能一段：`<b>【名】</b>` 接 `t`。
- 获得技能一段：`<b>【名】</b>获得。` 接 `t`。没有获得技能就不写这种段。
- 有标记时一段：`<b>状态</b> ` 接第 10.2 节的文案，中间用 `、`。没有标记就整段省略。
- 武器、防具两段保持 `equipText` 的现有句子。

半屏仍然只读，没有发动按钮。`render()` 发现 `#skillSheet` 没有 `hide` 且 `skillWho` 不是 `null` 时，重写 `#skillBody`，不调用 `openSheet`，不移动焦点，不关掉别的层。

左慈的座位和半屏包含幻身、新生以及已经获得的被动。这些被动都不是 `active`，操作区不出现技能按钮。钟会觉醒前没有主动按钮；觉醒后 `gained` 里的排异是第一枚主动技能，按钮按第 10.4 节显示，座位上有「已觉醒」，权数大于 0 时还有「权 N」。

### 10.4 唯一的主动按钮

`activeOf` 继续返回 `skillsOf` 里第一枚 `active` 技能。操作区在出牌阶段、未选中手牌时，仍是这颗按钮加上「结束出牌」。没有主动技能时只有「结束出牌」。不增加第二颗。

禁用条件不变：`usedUp(p, act) || !act.a.can(p)`。次数还没用尽但 `can` 为假时，按钮仍用下面的未用尽文案，只是禁用。例如满体力的青囊是 `技能·青囊 0/1` 且禁用。

`used` 取 `(p.used||{})[act.s.k]||0`。`times` 取 `act.a.times||1`。文案按下表从上到下，用第一条匹配到的规则：

| 条件 | 按钮文案 |
|---|---|
| `act.a.limited` 且尚未用尽 | `技能·名 限定` |
| `act.a.limited` 且已经用尽 | `限定已发动` |
| `times >= 99` | `技能·名` |
| 其余 | `技能·名 used/times` |

对应例子：

| 技能 | 未用尽 | 用尽 |
|---|---|---|
| 制衡，默认 1 次 | `技能·制衡 0/1` | `技能·制衡 1/1`，禁用 |
| 苦肉、断粮、乱击、奇径，`times` 为 2 | `技能·苦肉 0/2` | `技能·苦肉 2/2`，禁用 |
| 奇谋、雄烈、雄乱、焚城，限定 | `技能·奇谋 限定` | `限定已发动`，禁用 |
| 赤锋、龙胆、奇袭、父魄，`times` 为 99 | `技能·赤锋` | 正常对局到不了 99 次，文案保持不带分数 |

按钮文字不换行，超出省略。最小高度仍是 48px。弃牌按钮、技能选牌的「确认 / 取消」、选中手牌后的「确认打出 / 取消」文案都不改。

访客不在本地调用 `markUsed`。次数跟随下一次 `state`。`guestAct` 把阶段设为 `busy` 之后，操作区仍换成现在的等待文案。

## 11. 同步 / Sync

### 11.1 特效消息

`type` 仍是 `fx`。`kind` 三取值：

| kind | 字段 | 谁发送 | 谁绘制 |
|---|---|---|---|
| `float` | `w`、`txt`、`cls` | 房主的 `float()` | 房主本地画；访客按 `w` 画，不再 `send` |
| `card` | `w`、`key`、`suit`、`red`、`faceDown` | 房主的 `fxCard()` | 同上。`faceDown` 时忽略任何花色 |
| `skill` | `name` | 房主的 `log()` 在检查通过后 | 房主本地画；访客画在层正中 |

没有 `kind` 但带有 `txt` 的旧式 `fx` 按飘字处理。人机没有 `NET`，只在本地画，不发送。

访客不根据日志正文推断特效。房主不把特效交给 `sleep` 或规则返回值。

### 11.2 状态快照

`snap()` 每个角色的对象保留现有字段，并追加这些只读展示字段：`woke`、`ying`、`zhanguOn`、`tianyiBonus`、`hardNext`、`xianzhenOn`、`luozhanOn`、`yangweiOn`、`xiongluanOn`、`skipPlay`、`zhichiT`、`guose`、`drawMinus`、`wzMinus`。值就是角色身上的当前值，不换算、不省略 `0` 和 `false`。

状态消息根上追加 `turnNo: G.turnNo`。其余根字段不变：`type`、`P`、`cur`、`phase`、`need`、`deck`、`disc`、`over`。

访客处理 `state` 时，在现有展开之外把 `G.turnNo` 设为 `m.turnNo||0`。角色对象继续用展开，所以上面的字段会留在 `G.P` 上。手牌隐藏规则不变：对手的 `hand` 仍是张数，不是牌面数组。

这些字段不参与访客的规则计算。访客没有规则计算。

## 12. 允许改动的文件 / Files

后续实现可以改：

| 文件 | 改什么 |
|---|---|
| `index.html` | 在 `#table` 末尾增加空的 `#fxLayer`。不增删其他节点 |
| `style.css` | `#table` 的 `position`、`#fxLayer`、轨迹、光点、技能闪光、飘字在层内的位置、`.gained`、`.mark`。不改壳、手牌、座位尺寸、断点和已有 `fl` / `sh` |
| `game.js` | 下表 |

`game.js` 允许的展示改动：

| 位置 | 允许的改动 |
|---|---|
| 新函数 | `fxCard`、轨迹函数、技能闪光绘制、飘字绘制、标记文案、技能半屏 HTML、技能按钮文案。注释用中文 |
| `float` | 宿主改为 `#fxLayer`，消息增加 `kind:'float'`。文案、`cls`、`w` 的算法不变 |
| `log` | 插入日志行之后按第 8 节检查。HARNESS 提前返回不变。不改日志句子 |
| `seat` | 技能行改为 `skillsOf` 加标记 |
| `render` | 按钮文案；半屏已打开时重写正文；不碰 `#fxLayer` |
| `showSkill`、`closeSheets` | 记录和清除 `skillWho`；正文含获得技能和状态 |
| `playCard`、`respond`、`dying`，以及第 7 节点名的 `duanliang`、`qixi`、`luanji`、`fupo`、`yandou`、`lihun`、`guhuo`、`jixi`、`mouzhu` | 各插入一次 `fxCard`。不改牌的结算 |
| `snap` | 只追加第 11.2 节的字段 |
| `onMsg` 的 `fx` | 按 `kind` 分发。`state` 增加 `G.turnNo`。`ask` / `over` 的现有行为保留，`over` 时清空特效层 |
| `endGame` | 画结算前清空特效层 |

不许改：`damage` 和 `heal` 的数值与调用 `float` 的参数，`turn` 的重置列表，`judge`，AI 各函数，`guestAct` 的消息形状，`buildDeck`，`CARD_DEFS`，`GENERALS`，`ask` 的 `p.ai` 与 `p.remote` 分支。

`tools/sim.js` 不改。HARNESS 早退让模拟器不会走进特效 DOM。

## 13. 验收 / Acceptance

后续实现用这些检查。主路径是 375×667。另看 390×844 和 1280×800，确认特效不出 `#app`、桌面仍是一条不超过 430px 的竖壳。

1. 人机打出一张斩。`render()` 重写 `#me` 和 `#ai` 的 `innerHTML` 之后，`#fxLayer` 里仍有牌面「斩」和 8 个光点，约 0.9s 后节点消失。手牌、确认和上滑出牌的行为与现在相同。
2. 打出避、药、一张锦囊、一张装备、一张战鼓，牌面大字分别是避、药、该锦囊名、该装备名、战鼓。时长落在 0.7s、1.0s、1.2s、0.8s、0.8s。光点没有模糊和渐变。
3. 赤锋把红色牌当斩打出时，只出现一次斩轨，牌面大字是斩，不另闪「赤锋」。
4. 蛊惑打出时，特效是斩的牌背，牌面上没有花色。房主发出的 `kind:'card'` 消息里 `suit` 为 `''`，`red` 为 `false`，没有实体牌 `id`。
5. 受到 2 点伤害时，座位重绘后层上仍有红色 `-2`，约 0.9s。回复 1 点时有绿色 `+1`。藤盾飘字「藤盾」也不再被下一次座位重绘立刻清掉。
6. 孙权的出牌按钮是 `技能·制衡 0/1`。发动一次后是 `技能·制衡 1/1` 且禁用。旁边仍是「结束出牌」，没有第二颗技能按钮。
7. 黄盖的按钮带 `0/2`。魏延发动奇谋之后，按钮文案是 `限定已发动` 且禁用。关羽的按钮是 `技能·赤锋`，没有斜杠分数。
8. 钟会有权时座位能看到「权 N」。觉醒后能看到「已觉醒」和排异，排异带 `gained`。按钮是 `技能·排异 0/1`。点座位，半屏里有排异的「获得。」和状态段。
9. 邓艾打出避之后，座位出现「田 1」。田数变化时，若技能半屏开着，状态段更新，焦点留在关闭按钮上。
10. 左慈获得被动后，座位和半屏都能看到该被动的名字和全文，操作区没有技能按钮。
11. 满体力时青囊按钮是 `技能·青囊 0/1` 且禁用。技能选牌的确认和取消文案不变，取消后技能未发动。
12. 联机时访客能看到房主打出的牌面、技能闪光和飘字。访客自己受伤时飘字在己方一侧。状态里的田、权、觉醒、不能出斩在访客座位上与房主一致。
13. `act` 的 `t` 没有新取值。`ask` 的字段不变。没有新的顶层 `type`。
14. 375×667 下对战壳不出现页面级滚动，手牌仍是 120×168，操作按钮仍至少 48px。特效不挡住「退出」和日志的点击。
15. `?auto&g=0` 仍能结束，`document.title` 以 `OVER` 开头，控制台没有展示层抛错。
16. `node tools/sim.js 1` 的前若干对局不因特效抛错。不要求在本规格的提交里跑完全部武将。

## 14. 自检

- 没有待定、占位和可选方案。轨迹、时长、文案、消息字段和芯片表都是单一写法。
- 特效层不在座位里，因此和「`render()` 不清空层」一致。飘字、牌面、闪光都是层的子节点。
- 蛊惑本地调用传入 `card === null` 且 `faceDown === true`，线上消息也不带花色，两边一致。
- 技能闪光只从房主的 `log()` 发出，访客重放日志时不发，避免闪两次。
- 座位标记和半屏状态使用同一张表。快照补上了这张表里访客原来拿不到的字段，以及智迟需要的 `turnNo`。
- 技能按钮仍由 `activeOf` 决定，只有一颗。限定用尽的整句按钮文案是 `限定已发动`，有限次数用尽时保留 `技能·名 used/times`。
- 手机壳高度表不增加行。标记与技能名共用原来的一行。
- 规则函数只在日志之后插入一次展示调用。伤害数字、AI、`ask` 和 `act` 的取值都不改。
- 范围停在这一份规格。后续实现才改 `index.html`、`style.css`、`game.js`。
