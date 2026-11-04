# 武将平衡 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 对 96 武将全库重跑 AI 模拟，按胜率名单分轮改技能（必要时再动体力），使 ≥90% 武将胜率落在 40–60%，并更新 BALANCE.md 后开 PR 上线。

**Architecture:** 用现有 `tools/sim.js` 产出 `tools/sim-result.json`；只改名单内武将的 `data/generals.js` 文案与 `game.js` 中对应钩子（`ACTIVES` / `NEW_ACTIVES` / 被动钩子如 `afterDamaged`、`drawHooks`、`turnEnd` 等）。不改牌库与护体/兵疲/手牌上限。每轮改完重跑，直到验收通过。

**Tech Stack:** 静态页 `game.js` + `data/generals.js`；Node `tools/sim.js`（vm 加载游戏）；GitHub Pages。

## Global Constraints

- 目标区间：胜率 **40–60%**；验收：≥90% 武将在此区间；`errors=0`；一回合秒杀=0；中位回合大致每人 6–12（全局中位约 12–24）。
- 调整顺序：先改技能，再动体力 ±1；体力保持 **3–5**（已为 5 的可保持，不突破 5 除非验收卡死且用户另批）。
- 不改牌库、不改护体/兵疲（`FATIGUE_T`）/手牌上限=体力+1。
- 只借鉴机制模式，不照搬三国杀原名/原文。
- 每人至少保留一个有意义选择；不删核心身份感；不整技换人。
- 本地克隆提交（不用 Cursor Cloud Agent），与此前 FX/卡牌改动一致。
- Spec：`docs/superpowers/specs/2026-11-04-general-balance-design.md`（PR #21）。

## File map

| 文件 | 职责 |
|---|---|
| `tools/sim.js` | AI 对 AI 模拟；`node tools/sim.js 8` 写 `tools/sim-result.json` |
| `tools/sim-result.json` | 胜率表产物（每轮覆盖） |
| `data/generals.js` | 96 将 `hp` / `skills[].t` / `tier` |
| `game.js` | 技能实现：`ACTIVES`、`NEW_ACTIVES`、被动钩子、`aiWantSkill`/`aiWant2` |
| `BALANCE.md` | 梯队、改动记录、已知风险 |
| `data/modes.js` | 教程/残局；仅当被改技能破坏通关时修 |
| `tools/verify-modes.js` | 模式回归（若存在） |

---

### Task 1: 基线全库模拟

**Files:**
- Modify: `tools/sim-result.json`（覆盖写入）
- Create: `docs/balance/2026-11-04-baseline.md`（名单摘要）

**Interfaces:**
- Consumes: `tools/sim.js`（已有）
- Produces: `tools/sim-result.json` 含 `{turns:{avg,med},rows:[{id,name,hp,tier,wr,...}]}`；`docs/balance/2026-11-04-baseline.md` 列出 wr>0.60 与 wr<0.40 的 id/name/wr/hp/skills

- [ ] **Step 1: 确认在仓库根目录且依赖齐全**

```bash
cd /workspace/sanguo-duel
git status
test -f tools/sim.js && test -f data/generals.js && test -f game.js
```

Expected: 文件存在。

- [ ] **Step 2: 跑基线模拟 N=8**

```bash
node tools/sim.js 8 2>&1 | tee /tmp/sim-baseline.log | tail -30
```

Expected: 结束时 `oneshot=0`、`errors=0`；写出 `tools/sim-result.json`。耗时约 8–12 分钟（N=1≈65s ⇒ N=8≈9min）。

- [ ] **Step 3: 生成偏离名单**

```bash
node -e '
const r=require("./tools/sim-result.json");
const hi=r.rows.filter(x=>x.wr>0.60), lo=r.rows.filter(x=>x.wr<0.40);
const mid=r.rows.filter(x=>x.wr>=0.40&&x.wr<=0.60);
console.log("hi",hi.length,"mid",mid.length,"lo",lo.length);
console.log("HI:\n"+hi.map(x=>(x.wr*100).toFixed(1)+"% "+x.name+"("+x.id+") hp"+x.hp).join("\n"));
console.log("LO:\n"+lo.map(x=>(x.wr*100).toFixed(1)+"% "+x.name+"("+x.id+") hp"+x.hp).join("\n"));
'
```

- [ ] **Step 4: 写 baseline 摘要文档**

创建 `docs/balance/2026-11-04-baseline.md`：粘贴 HI/LO 表，注明 `turns.med`、`oneshot`、`errors`，并说明本轮改动只针对 HI/LO。

- [ ] **Step 5: Commit**

```bash
git checkout -b balance/general-40-60-2026-11-04
git add tools/sim-result.json docs/balance/2026-11-04-baseline.md
git commit -m "chore: 武将平衡基线模拟 (N=8)"
```

---

### Task 2: 第一轮技能调整（优先极端）

**Files:**
- Modify: `data/generals.js`（名单内将的 `skills[].t`，必要时 `hp`/`tier`）
- Modify: `game.js`（与 skill key 对应的实现与 AI 意愿）
- Create: `docs/balance/2026-11-04-round1.md`（每将改动对照）

**Interfaces:**
- Consumes: Task 1 的 HI/LO 名单
- Produces: 改后的技能文案与实现；round1 文档列出「将 / 原效果 / 新效果 / 理由」

**改动模板（按技能类型选用）：**

| 方向 | 模式 | 示例手法 |
|---|---|---|
| 削 HI | 加条件 | 触发改为「手牌少于体力」「每回合首次」 |
| 削 HI | 降收益 | 摸牌 −1；拼点赢只拿对方那张 |
| 削 HI | 限次数 / 交权 | `times` 降；或选择权交给对手 |
| 补 LO | 补摸牌/转化 | 命中后摸 1；黑色牌可当某牌 |
| 补 LO | 放宽触发 | 去掉苛刻花色；判定黑/红即可 |
| 仍偏 | 体力 ±1 | 仅在技能改一轮后仍在区间外时用 |

- [ ] **Step 1: 锁定本轮目标**

从 baseline 取胜率最高的至多 8 名 HI 与最低的至多 8 名 LO（不足则全取）。写入 `docs/balance/2026-11-04-round1.md` 顶部「本轮名单」。

- [ ] **Step 2: 对每个目标读现有文案与实现**

```bash
rg -n "id:'<id>'" data/generals.js
rg -n "<skillKey>" game.js
```

主动技在 `ACTIVES`/`NEW_ACTIVES`；被动在 `afterDamaged`/`drawHooks`/`turnEnd`/`turnStart`/`zhanHit` 等。

- [ ] **Step 3: 应用模板改文案 + 实现**

对每个目标：
1. 改 `data/generals.js` 中对应 `skills[].t`（文案必须与实现一致）。
2. 改 `game.js` 同一 `k` 的逻辑。
3. 若改了主动技次数/条件，同步 `ACTIVES.*.times`/`can` 与 `aiWantSkill`/`aiWant2`。
4. 在 round1 文档追加一行对照。

**示例格式（名单以 Task 1 为准）——削弱摸牌过多：**

把固定 `drawCards(p,2)` 改为：

```javascript
drawCards(p, p.hand.length < p.hp ? 2 : 1);
```

**示例——加强触发过窄：**

实现把 `c.s==='diamond'` 改为 `!isRed(c)`（或项目内等价判断），并同步文案。

- [ ] **Step 4: 冒烟：单将快速模拟**

```bash
node tools/sim.js 2 <id> 2>&1 | tail -20
```

Expected: `errors=0`；该将出现在输出行中。

- [ ] **Step 5: Commit**

```bash
git add data/generals.js game.js docs/balance/2026-11-04-round1.md
git commit -m "balance: round1 技能调整（极端 HI/LO）"
```

---

### Task 3: 第一轮复测

**Files:**
- Modify: `tools/sim-result.json`
- Create: `docs/balance/2026-11-04-round1-result.md`

**Interfaces:**
- Consumes: Task 2 改动
- Produces: 新胜率表；是否仍 ≥10% 偏离（决定是否进入 Task 4）

- [ ] **Step 1: 全库重跑 N=8**

```bash
node tools/sim.js 8 2>&1 | tee /tmp/sim-r1.log | tail -20
```

Expected: `errors=0`，`oneshot=0`。

- [ ] **Step 2: 统计区间占比**

```bash
node -e '
const r=require("./tools/sim-result.json");
const ok=r.rows.filter(x=>x.wr>=0.40&&x.wr<=0.60).length;
console.log("in-band",ok,"/",r.rows.length,(100*ok/r.rows.length).toFixed(1)+"%");
console.log("hi",r.rows.filter(x=>x.wr>0.60).map(x=>x.name+":"+(x.wr*100).toFixed(1)).join(", "));
console.log("lo",r.rows.filter(x=>x.wr<0.40).map(x=>x.name+":"+(x.wr*100).toFixed(1)).join(", "));
'
```

- [ ] **Step 3: 写 round1-result**

记录 in-band 比例、仍偏离名单、中位回合。若 in-band ≥90%，跳到 Task 5；否则继续 Task 4。

- [ ] **Step 4: Commit**

```bash
git add tools/sim-result.json docs/balance/2026-11-04-round1-result.md
git commit -m "chore: round1 复测结果"
```

---

### Task 4: 第二轮（及必要时第三轮）

**Files:**
- Modify: `data/generals.js`, `game.js`
- Create: `docs/balance/2026-11-04-round2.md`（及可选 `round3.md`）
- Modify: `tools/sim-result.json`

**Interfaces:**
- Consumes: 上一轮仍偏离名单
- Produces: 进一步改动；最终 in-band ≥90% 或文档标明 AI 低估边缘将

- [ ] **Step 1: 选本轮名单**

仍 >60% / <40% 者；优先上次改过但仍偏的；可对顽固将动体力 ±1（不低于 3、不高于 5）。

- [ ] **Step 2: 改技能或体力**

同 Task 2 模板；体力改时同步 `data/generals.js` 的 `hp`。

- [ ] **Step 3: 单将冒烟 + 全库 N=8**

```bash
node tools/sim.js 2 <id> 2>&1 | tail -5
node tools/sim.js 8 2>&1 | tee /tmp/sim-r2.log | tail -20
```

- [ ] **Step 4: 若仍 <90% in-band，再开一轮（最多到 round3）**

第三轮后若仍有少数读牌/时机将卡在边缘，在 BALANCE.md 注明「AI 低估」，不再硬改。

- [ ] **Step 5: Commit 每轮**

```bash
git add data/generals.js game.js tools/sim-result.json docs/balance/2026-11-04-round2.md
git commit -m "balance: round2 技能/体力调整"
```

---

### Task 5: 更新 BALANCE.md 与模式回归

**Files:**
- Modify: `BALANCE.md`
- Modify: `data/modes.js`（仅必要时）
- Test: `tools/verify-modes.js`（若存在）

**Interfaces:**
- Consumes: 最终 `sim-result.json` 与各轮改动文档
- Produces: 与现网一致的平衡说明；教程/残局可通

- [ ] **Step 1: 重写 BALANCE.md 梯队**

按最终 `wr` 分档；更新「主要改动」；更新实测表；保留 AI 偏差说明。

- [ ] **Step 2: 模式回归**

```bash
test -f tools/verify-modes.js && node tools/verify-modes.js
```

失败则修 `data/modes.js` 后重跑。

- [ ] **Step 3: 同步 tier 字段（推荐）**

按最终梯队更新 `data/generals.js` 中各将 `tier`（1/2/3）。

- [ ] **Step 4: Commit**

```bash
git add BALANCE.md data/generals.js data/modes.js
git commit -m "docs: 更新 BALANCE 梯队与模式回归"
```

---

### Task 6: PR、合并、Pages

- [ ] **Step 1: Push 并开 PR**

```bash
git push -u origin HEAD
gh pr create --title "balance: 武将胜率压进 40–60%" --body "## Summary
- 全库 N=8 重跑，分轮改技能（必要时体力），目标 ≥90% 胜率在 40–60%。
- 更新 BALANCE.md 与 sim-result；必要时修 modes。

## Test plan
- [ ] node tools/sim.js 8 → errors=0, oneshot=0, in-band≥90%
- [ ] 抽查改动将：文案与实战一致
- [ ] 教程 + 残局可通关"
```

- [ ] **Step 2: 合并并确认 Pages**

```bash
gh pr merge --squash
```

打开 https://zcbnu.github.io/sanguo-duel/ 冒烟。

---

## Spec coverage (self-review)

| Spec 要求 | Task |
|---|---|
| 全库重跑 sim | 1, 3, 4 |
| 名单 >60 / <40 | 1, 2 |
| 先技能后体力 | 2, 4 |
| 不改牌库/全局规则 | Global Constraints |
| ≥90% 进 40–60 | 3–4 门禁 |
| 更新 BALANCE + PR Pages | 5, 6 |
| 教程/残局同步 | 5 |
| AI 边缘注明 | 4, 5 |

## Placeholder scan

无 TBD/TODO；具体技能改动以 Task 1 名单为准，用 Task 2 模板落地。
