# 8 将油画立绘试点 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按已批准规格，为 8 名试点武将放入 512×512 写实油画 PNG，并让游戏优先显示 PNG、失败时回退现有 SVG。

**Architecture:** 提示词只来自 `docs/superpowers/specs/2026-10-25-oil-portrait-pilot-design.md` 第 6.3 节，不另存一份。生成器用该英文原文画出正方形图，再由不入库的 Node 脚本裁成 512×512、颜色类型 2 的 PNG，写入 `assets/portraits/{id}.png`。`game.js` 用一个 `OIL_IDS` 集合和 `portraitImg` 决定地址。`style.css` 只给带 `portrait-oil` 的图关掉像素缩放。其余 88 人继续请求原来的 SVG。

**Tech Stack:** 静态 HTML / CSS / JS，Node 内置 `fs` 与 `zlib`，GenerateImage。不新增 npm 依赖，不引入图像库。

## Global Constraints

规格 `docs/superpowers/specs/2026-10-25-oil-portrait-pilot-design.md` 的项目级要求，逐条照抄。每个任务都包含这些要求。

- 技术栈保持静态 HTML / CSS / JS。不引入图像库、构建步骤或图床。
- 试点 id，顺序固定：`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo`。
- 不改 `data/generals.js`、`data/cards.js`、`tools/portraits.js`、`BALANCE.md`、`index.html`。
- 不重跑 `tools/portraits.js`，不覆盖、不删除任何 `assets/portraits/*.svg`。
- 不改武将技能、数值、AI、牌堆、胜负和 PeerJS 消息。
- 不改选将卡尺寸、座位立绘宽度、`object-fit` 或 `object-position`。
- 不把 `FACTIONS` 的颜色改成界面色条的颜色，也不把界面色条画进油画。
- 不新增图鉴页、批量出图脚本或 npm 依赖。
- 不把油画存成 JPEG、WebP 或 SVG。
- 图像二进制只能用规格第 6.3 节已经装好的英文成品生成。不得另写画风，不得翻译、缩写、增删这段英文。
- 实现任务可以改的路径只有：8 个 PNG、`game.js`、`style.css`、`DESIGN.md`、`README.md`。规格和本计划不算实现任务里的新文件。
- `node tools/sim.js 1` 结束时输出里 `errors=0`。若该命令改写了 `tools/sim-result.json`，实现提交里还原它。

## 何时写实现代码

写入本计划的这次提交只新增本文件。不调用 GenerateImage，不写入 PNG，不改 `game.js`、`style.css`、`DESIGN.md`、`README.md`。

实现留在当前分支 `cursor/oil-portrait-pilot-design-40e5`，继续进入 PR #2。不要另开分支，也不要把计划和实现拆成两条互不包含的分支。

任务按编号顺序做。Task 1 不产生提交。Task 2 到 Task 5 各自提交。Task 6 只在验收发现必须修改时再提交。

不把八条提示词再抄进 `scripts/` 或另一份 markdown。规格第 6.3 节是唯一成品，第 10 节也不允许实现提交增加脚本。Task 1 用哈希核对这份成品。

## 文件结构

| 文件 | 责任 | 任务 |
|---|---|---|
| `docs/superpowers/specs/2026-10-25-oil-portrait-pilot-design.md` | 已批准的提示词、裁切和回退规则。只读 | Task 1 核对 |
| `assets/portraits/{id}.png` | 8 张 512×512 油画。同名 SVG 保留 | Task 2 创建 |
| `game.js` | `OIL_IDS` 与 `portraitImg`。四处立绘模板改走这个函数 | Task 3 修改 |
| `style.css` | 只追加 `portrait-oil` 的 `image-rendering: auto` | Task 4 修改 |
| `DESIGN.md` | 像素缩放句子和曹操示例图 | Task 5 修改 |
| `README.md` | 第 2 行的立绘从句 | Task 5 修改 |
| `tools/portraits.js`、全部 `.svg`、`data/`、`index.html` | 不改 | Task 6 用 diff 核对 |

规范化 PNG 的 Node 脚本写在 Task 2 里，从标准输入执行，不写入仓库。

---

### Task 1: 核对规格第 6.3 节的八条成品

**Files:**

- Read: `docs/superpowers/specs/2026-10-25-oil-portrait-pilot-design.md`
- Create: 无
- Modify: 无

**Interfaces:**

- Consumes: 规格里 10 个 `text` 围栏。第 1 个是骨架，第 2 个是负面提示词，后 8 个按 `caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo` 排列。
- Produces: 终端里打印的 8 段英文。Task 2 把每一段原样放进 GenerateImage 的 `description`。不产生仓库文件。

- [ ] **Step 1: 计算八条成品的 sha256**

在仓库根目录执行：

```bash
node <<'JS'
const fs = require('fs');
const crypto = require('crypto');
const t = fs.readFileSync('docs/superpowers/specs/2026-10-25-oil-portrait-pilot-design.md', 'utf8');
const blocks = [...t.matchAll(/```text\n([\s\S]*?)\n```/g)].map(m => m[1]);
const ids = ['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo'];
const want = {
  caocao: 'ff36cf2543ecb107ee8b2456e4a66941b832624da73c92e01730e9cbc0b9d465',
  guanyu: '53c815f2c90af5beda16c4b68407a820ea439b1e6c27906d065db616298148ff',
  zhouyu: '25eed94b4f427201926911bfea0f2e93b9f78f83f270fffaf6ebaf3a86d7eb90',
  lvbu: '32b88bc7f056da9da78bc7c6625cd5457592fef6083f3f036f4c94361e6f301e',
  zhugeliang: '7eefb1fcf54ded1c6992e96577dad0e8b6a636a4a0d002d89b0355aeaf1b4f57',
  diaochan: '7ddd9406d27fcb8e8a23bb0eab2b54a4ec162c8d15e360410c1fabe4c46fcd30',
  dianwei: 'b16cf495345b85129ecd21a96ac4afe3a770fea0019afa52e835ef45e0934ccf',
  huatuo: '7709e2f436bd7614d0aacd7a07b5f3ab32e673662f04b3e4bdcf6ba3b185ed8e'
};
if (blocks.length !== 10) { console.error('围栏数量 ' + blocks.length); process.exit(1); }
ids.forEach((id, i) => {
  const got = crypto.createHash('sha256').update(blocks[i + 2]).digest('hex');
  if (got !== want[id]) { console.error(id + ' ' + got); process.exit(1); }
  console.log(id + ' ' + got);
});
console.log('prompts ok');
JS
```

Expected: 8 行 `id` 加哈希，最后一行 `prompts ok`，退出码 0。哈希不一致就停止，先改规格再出图。不要在本任务里改提示词。

- [ ] **Step 2: 确认工作区没有新文件**

Run: `git status --short`

Expected: 空输出。

- [ ] **Step 3: 不提交**

本任务不执行 `git add` 或 `git commit`。

### Task 2: 用成品提示词生成 8 张 PNG

**Files:**

- Create: `assets/portraits/caocao.png`
- Create: `assets/portraits/guanyu.png`
- Create: `assets/portraits/zhouyu.png`
- Create: `assets/portraits/lvbu.png`
- Create: `assets/portraits/zhugeliang.png`
- Create: `assets/portraits/diaochan.png`
- Create: `assets/portraits/dianwei.png`
- Create: `assets/portraits/huatuo.png`
- Read: `docs/superpowers/specs/2026-10-25-oil-portrait-pilot-design.md`

**Interfaces:**

- Consumes: Task 1 打印通过的 8 段英文。GenerateImage 的参数名是 `description`、`filename`、`aspect_ratio`。
- Produces: 上述 8 个 PNG。每个 IHDR 为宽 512、高 512、位深 8、颜色类型 2，文件不超过 1258291 字节。Task 3 起，`portraitImg` 会请求这些路径。

- [ ] **Step 1: 把八条成品写到临时文件再生成**

先再跑 Task 1 的哈希命令。Expected: `prompts ok`。接着把通过校验的 8 段写到临时目录，供 GenerateImage 原样读取：

```bash
node <<'JS'
const fs = require('fs');
const crypto = require('crypto');
const t = fs.readFileSync('docs/superpowers/specs/2026-10-25-oil-portrait-pilot-design.md', 'utf8');
const blocks = [...t.matchAll(/```text\n([\s\S]*?)\n```/g)].map(m => m[1]);
const ids = ['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo'];
const want = {
  caocao: 'ff36cf2543ecb107ee8b2456e4a66941b832624da73c92e01730e9cbc0b9d465',
  guanyu: '53c815f2c90af5beda16c4b68407a820ea439b1e6c27906d065db616298148ff',
  zhouyu: '25eed94b4f427201926911bfea0f2e93b9f78f83f270fffaf6ebaf3a86d7eb90',
  lvbu: '32b88bc7f056da9da78bc7c6625cd5457592fef6083f3f036f4c94361e6f301e',
  zhugeliang: '7eefb1fcf54ded1c6992e96577dad0e8b6a636a4a0d002d89b0355aeaf1b4f57',
  diaochan: '7ddd9406d27fcb8e8a23bb0eab2b54a4ec162c8d15e360410c1fabe4c46fcd30',
  dianwei: 'b16cf495345b85129ecd21a96ac4afe3a770fea0019afa52e835ef45e0934ccf',
  huatuo: '7709e2f436bd7614d0aacd7a07b5f3ab32e673662f04b3e4bdcf6ba3b185ed8e'
};
fs.mkdirSync('/tmp/oil-prompts', { recursive: true });
ids.forEach((id, i) => {
  const text = blocks[i + 2];
  const got = crypto.createHash('sha256').update(text).digest('hex');
  if (got !== want[id]) { console.error(id); process.exit(1); }
  fs.writeFileSync('/tmp/oil-prompts/' + id + '.txt', text);
  console.log(id, text.length);
});
JS
```

Expected: 8 行 `{id} {字符数}`，字符数依次是 1148、1080、1092、1112、1119、1111、1086、1123。`description` 等于 `/tmp/oil-prompts/{id}.txt` 的全部字节，不要加换行，不要改写。这些 txt 留在 `/tmp`，不提交。

GenerateImage 没有负面提示词参数。规格第 6.1 节的负面句已经在成品最后一句里。不要另附负面词，不要加参考图，不要把「油画」改成动漫、像素、赛博或照片。

每个 id 调用一次，参数只有：

- `description`：该 id 的成品全文
- `filename`：`{id}.png`（不要带目录）
- `aspect_ratio`：`1:1`

调用顺序就是 Global Constraints 里的 id 顺序。工具返回的文件先复制到 `/tmp/oil-{id}-src.png`。若工具把副本写进仓库，删掉那份副本，只留 `/tmp` 里的源图。源图短边小于 512 就删掉并重调 GenerateImage，仍然用同一段 `description`。禁止放大。

当前进程如果没有 GenerateImage，停在本步骤。不要换一种画风，不要交占位图，不要改提示词。

- [ ] **Step 2: 用下面的脚本把源图规范成交付 PNG**

对每个 id 各跑一遍下面这一组命令。第一行和最后一行里的 `caocao` 换成该 id。脚本不写入仓库。正方形源图不要设置 `CROP_X` 或 `CROP_Y`。宽大于高时，只允许用 `CROP_X` 沿横边平移最大正方形，默认居中。高大于宽时，只允许用 `CROP_Y`。正方形边长始终是短边，不能再切小，否则会放大。`zlib.crc32` 需要 Node 20 或以上。当前环境是 Node 22。

8 个 id 都要跑：`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo`。

```bash
cp /tmp/oil-caocao-src.png /tmp/oil-caocao-work.png
node /dev/stdin /tmp/oil-caocao-work.png <<'JS'
const fs = require('fs');
const zlib = require('zlib');
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([t, data])) >>> 0);
  return Buffer.concat([len, t, data, crc]);
}
function parse(buf) {
  if (buf.length < 8 || !buf.subarray(0, 8).equals(sig)) throw new Error('不是 PNG');
  const parts = [];
  let o = 8;
  while (o + 12 <= buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString('ascii', o + 4, o + 8);
    const data = buf.subarray(o + 8, o + 8 + len);
    o += 12 + len;
    parts.push({ type, data });
    if (type === 'IEND') break;
  }
  const ih = parts.find(p => p.type === 'IHDR');
  if (!ih) throw new Error('没有 IHDR');
  const idat = Buffer.concat(parts.filter(p => p.type === 'IDAT').map(p => p.data));
  return {
    w: ih.data.readUInt32BE(0),
    h: ih.data.readUInt32BE(4),
    depth: ih.data[8],
    color: ih.data[9],
    comp: ih.data[10],
    filter: ih.data[11],
    interlace: ih.data[12],
    raw: zlib.inflateSync(idat)
  };
}
function unfilter(w, h, bpp, raw) {
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const row = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const v = raw[y * (stride + 1) + 1 + x];
      const left = x >= bpp ? row[x - bpp] : 0;
      const up = prev[x];
      const ul = x >= bpp ? prev[x - bpp] : 0;
      let n = v;
      if (f === 1) n = (v + left) & 255;
      else if (f === 2) n = (v + up) & 255;
      else if (f === 3) n = (v + ((left + up) >> 1)) & 255;
      else if (f === 4) {
        const p = left + up - ul;
        const pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - ul);
        const pr = pa <= pb && pa <= pc ? left : pb <= pc ? up : ul;
        n = (v + pr) & 255;
      } else if (f !== 0) throw new Error('未知过滤器 ' + f);
      row[x] = n;
    }
    row.copy(out, y * stride);
    prev = row;
  }
  return out;
}
function sample(src, sw, sh, bpp, x, y, c) {
  if (x < 0 || y < 0 || x >= sw || y >= sh) return 0;
  return src[(y * sw + x) * bpp + c];
}
function lanczos(x) {
  const a = 3;
  if (x === 0) return 1;
  if (x <= -a || x >= a) return 0;
  const p = Math.PI * x;
  return Math.sin(p) / p * Math.sin(p / a) / (p / a);
}
function scale(src, sw, bpp, side) {
  if (side === 512) {
    const out = Buffer.alloc(512 * 512 * 3);
    for (let i = 0; i < 512 * 512; i++) {
      out[i * 3] = src[i * bpp];
      out[i * 3 + 1] = src[i * bpp + 1];
      out[i * 3 + 2] = src[i * bpp + 2];
    }
    return out;
  }
  const out = Buffer.alloc(512 * 512 * 3);
  const map = (d) => (d + 0.5) * side / 512 - 0.5;
  for (let y = 0; y < 512; y++) {
    const sy = map(y);
    const y0 = Math.floor(sy) - 2;
    for (let x = 0; x < 512; x++) {
      const sx = map(x);
      const x0 = Math.floor(sx) - 2;
      let acc = [0, 0, 0], wsum = 0;
      for (let yy = 0; yy < 6; yy++) {
        const ly = lanczos(sy - (y0 + yy));
        if (ly === 0) continue;
        for (let xx = 0; xx < 6; xx++) {
          const w = ly * lanczos(sx - (x0 + xx));
          if (w === 0) continue;
          wsum += w;
          for (let c = 0; c < 3; c++) acc[c] += w * sample(src, side, side, bpp, x0 + xx, y0 + yy, c);
        }
      }
      for (let c = 0; c < 3; c++) {
        const n = wsum ? acc[c] / wsum : 0;
        out[(y * 512 + x) * 3 + c] = Math.max(0, Math.min(255, Math.round(n)));
      }
    }
  }
  return out;
}
function encode(rgb) {
  const stride = 512 * 3;
  let best = null;
  for (const f of [0, 1, 2, 3, 4]) {
    const raw = Buffer.alloc(512 * (stride + 1));
    let prev = Buffer.alloc(stride);
    for (let y = 0; y < 512; y++) {
      const row = rgb.subarray(y * stride, (y + 1) * stride);
      raw[y * (stride + 1)] = f;
      for (let x = 0; x < stride; x++) {
        const left = x >= 3 ? row[x - 3] : 0;
        const up = prev[x];
        const ul = x >= 3 ? prev[x - 3] : 0;
        let d = row[x];
        if (f === 1) d = (row[x] - left) & 255;
        else if (f === 2) d = (row[x] - up) & 255;
        else if (f === 3) d = (row[x] - ((left + up) >> 1)) & 255;
        else if (f === 4) {
          const p = left + up - ul;
          const pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - ul);
          const pr = pa <= pb && pa <= pc ? left : pb <= pc ? up : ul;
          d = (row[x] - pr) & 255;
        }
        raw[y * (stride + 1) + 1 + x] = d;
      }
      prev = row;
    }
    const z = zlib.deflateSync(raw, { level: 9 });
    if (!best || z.length < best.z.length) best = { z, f };
  }
  const ih = Buffer.alloc(13);
  ih.writeUInt32BE(512, 0);
  ih.writeUInt32BE(512, 4);
  ih[8] = 8; ih[9] = 2;
  const png = Buffer.concat([sig, chunk('IHDR', ih), chunk('IDAT', best.z), chunk('IEND', Buffer.alloc(0))]);
  return { png, filter: best.f };
}
function normalize(file) {
  const info = parse(fs.readFileSync(file));
  if (info.depth !== 8 || info.comp !== 0 || info.filter !== 0 || info.interlace !== 0) {
    throw new Error('只接受 8 位、无隔行的 PNG，当前 depth=' + info.depth + ' interlace=' + info.interlace);
  }
  if (info.color !== 2 && info.color !== 6) throw new Error('颜色类型必须是 2 或 6，当前 ' + info.color);
  const side = Math.min(info.w, info.h);
  if (side < 512) throw new Error('短边 ' + side + ' 小于 512，重新生成，禁止放大');
  const bpp = info.color === 2 ? 3 : 4;
  const pix = unfilter(info.w, info.h, bpp, info.raw);
  let ox = 0, oy = 0;
  if (info.w > info.h) {
    const max = info.w - side;
    ox = process.env.CROP_X == null ? Math.floor(max / 2) : Number(process.env.CROP_X);
    if (!Number.isInteger(ox) || ox < 0 || ox > max) throw new Error('CROP_X 必须是 0 到 ' + max + ' 的整数');
  } else if (info.h > info.w) {
    const max = info.h - side;
    oy = process.env.CROP_Y == null ? Math.floor(max / 2) : Number(process.env.CROP_Y);
    if (!Number.isInteger(oy) || oy < 0 || oy > max) throw new Error('CROP_Y 必须是 0 到 ' + max + ' 的整数');
  }
  const square = Buffer.alloc(side * side * bpp);
  for (let y = 0; y < side; y++) {
    pix.copy(square, y * side * bpp, ((y + oy) * info.w + ox) * bpp, ((y + oy) * info.w + ox + side) * bpp);
  }
  let rgb = square;
  if (bpp === 4) {
    rgb = Buffer.alloc(side * side * 3);
    for (let i = 0; i < side * side; i++) {
      const a = square[i * 4 + 3] / 255;
      for (let c = 0; c < 3; c++) rgb[i * 3 + c] = Math.round(square[i * 4 + c] * a + 11 * (1 - a));
    }
  }
  const scaled = scale(rgb, side, bpp === 4 ? 3 : bpp, side);
  const { png } = encode(scaled);
  if (png.length > 1258291) throw new Error('压缩后仍有 ' + png.length + ' 字节，超过 1258291');
  fs.writeFileSync(file, png);
  const back = parse(png);
  if (back.w !== 512 || back.h !== 512 || back.depth !== 8 || back.color !== 2) throw new Error('回读 IHDR 不符合');
  console.log(file + ' 512 512 8 2 bytes=' + png.length);
}
normalize(process.argv[2]);
JS
cp /tmp/oil-caocao-work.png assets/portraits/caocao.png
```

Expected: 每个 id 打印 `{路径} 512 512 8 2 bytes=` 加一个不大于 1258291 的整数，退出码 0。短边小于 512 时退出码非 0，并打印「重新生成，禁止放大」。这时删掉该 id 的 work 和 assets 文件，回到 Step 1 用同一段 `description` 再生成。

- [ ] **Step 3: 核对 IHDR**

```bash
node <<'JS'
const fs = require('fs');
const ids = ['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo'];
for (const id of ids) {
  const b = fs.readFileSync('assets/portraits/' + id + '.png');
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20), d = b[24], c = b[25];
  if (b.toString('ascii', 1, 4) !== 'PNG' || w !== 512 || h !== 512 || d !== 8 || c !== 2 || b.length > 1258291) {
    console.error(id, w, h, d, c, b.length);
    process.exit(1);
  }
  console.log(id, 'ok', b.length);
}
JS
```

Expected: 8 行 `{id} ok {字节数}`，退出码 0。

- [ ] **Step 4: 看 512 原图，不合格就用同一提示词重画**

打开每个 `assets/portraits/{id}.png`。在最终的 512 图上，两只眼睛都要落在 x 180–430、y 172–280，嘴落在 y 250–360。眼睛的 y 从 172 起，才能躲开 72px 座位左上角的势力芯片。做不到时：源图不是正方形，就换一个合法的 `CROP_X` 或 `CROP_Y`，从 `/tmp/oil-{id}-src.png` 重跑 Step 2。源图已经是正方形，或怎么平移都放不进这个矩形，就删除该 PNG，回到 Step 1，`description` 仍是原来那一段。

8 张都要同时满足，任何一条失败都重画该张，不改英文：

- 暗底、左上暖主光、右侧深影、厚涂笔触、半身、写实成年人。嘴闭上。
- 能看见画布上的厚涂，不是照片，不是三维渲染，不是平涂矢量。
- 没有风景、月亮、旗帜、人群、文字、水印、画框、刃、格斗、血、敞开的伤口。
- 没有动漫、漫画、Q 版、像素、赛璐璐、霓虹、赛博盔甲、发光眼睛。
- 势力色只在暗部边缘有一层淡光。曹操的衣服不是整片 `#3b6fd8`。关羽的衣服不是整片绿，也不是整片 `#d8463b`；深绿色只留在头巾。周瑜只有一窄条暗绯红发带，环境光仍是 `#2fa35a`。吕布是暗色札甲和两根暗色雉翎。诸葛亮是米白布冠和灰羽氅，扇子是合拢的羽扇，没有发光法球。貂蝉约二十岁，高领暗色衣袍。典韦没有橙色。华佗只有一只系着的药囊，没有手术场面。

8 张并排时像同一位画家。笔触在缩到 168×148 后仍然看得见。

- [ ] **Step 5: 只提交这 8 个 PNG**

```bash
git add assets/portraits/caocao.png assets/portraits/guanyu.png assets/portraits/zhouyu.png assets/portraits/lvbu.png assets/portraits/zhugeliang.png assets/portraits/diaochan.png assets/portraits/dianwei.png assets/portraits/huatuo.png
git diff --cached --name-only
git commit -m "feat: 加入 8 张油画立绘 PNG"
```

Expected: `git diff --cached --name-only` 只有这 8 个 PNG。没有接触表，没有 `/tmp` 文件，没有 SVG 改动。

### Task 3: game.js 优先 PNG，失败回退 SVG

**Files:**

- Modify: `game.js`（在 `// ---- 渲染 ----` 之前插入函数；改 `seat`、`fillSlot`、`selectScreen`、`showDetail` 的立绘标签）
- Test: 不入库。用下面的 Node 命令检查 `game.js` 文本

**Interfaces:**

- Consumes: Task 2 的 8 个 PNG 路径。
- Produces: `portraitImg(id, alt)` 返回字符串。`id` 属于 `OIL_IDS` 时，`src` 为 `assets/portraits/{id}.png`，带 `class="portrait-oil"` 和一次性 `onerror`。否则 `src` 为 `assets/portraits/{id}.svg`，没有 class，没有 `onerror`。

- [ ] **Step 1: 先跑检查，确认它失败**

```bash
node <<'JS'
const fs = require('fs');
const s = fs.readFileSync('game.js', 'utf8');
if (!s.includes('function portraitImg(id,alt)')) {
  console.error('missing portraitImg');
  process.exit(1);
}
console.log('present');
JS
```

Expected: 打印 `missing portraitImg`，退出码 1。

- [ ] **Step 2: 插入函数并替换四处标签**

在 `// ---- 渲染 ----` 正上方插入：

```javascript
const OIL_IDS=new Set(['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo']);
function portraitImg(id,alt){const oil=OIL_IDS.has(id);
 const src=oil?`assets/portraits/${id}.png`:`assets/portraits/${id}.svg`;
 const cls=oil?' class="portrait-oil"':'';
 const fb=oil?` onerror="this.onerror=null;this.classList.remove('portrait-oil');this.src='assets/portraits/${id}.svg'"`:'';
 return `<img${cls} alt="${alt}" src="${src}"${fb}>`;}
```

`seat()` 里把：

```javascript
<img src="assets/portraits/${p.g.id}.svg" alt="${p.g.name}">
```

换成：

```javascript
${portraitImg(p.g.id,p.g.name)}
```

`fillSlot()` 里把：

```javascript
<img alt="${g.name}" src="assets/portraits/${g.id}.svg">
```

换成：

```javascript
${portraitImg(g.id,g.name)}
```

`selectScreen()` 里同一段 `<img alt="${g.name}" src="assets/portraits/${g.id}.svg">` 也换成 `${portraitImg(g.id,g.name)}`。

`showDetail()` 里把：

```javascript
<img src="assets/portraits/${g.id}.svg">
```

换成：

```javascript
${portraitImg(g.id,g.name)}
```

不要改这四个函数的其余逻辑。不要给新函数加注释。`showDetail` 目前没有调用方，仍然要改。

- [ ] **Step 3: 再跑检查，确认字符串正确**

```bash
node <<'JS'
const fs = require('fs');
const s = fs.readFileSync('game.js', 'utf8');
const OIL_IDS = new Set(['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo']);
function portraitImg(id, alt) {
  const oil = OIL_IDS.has(id);
  const src = oil ? `assets/portraits/${id}.png` : `assets/portraits/${id}.svg`;
  const cls = oil ? ' class="portrait-oil"' : '';
  const fb = oil ? ` onerror="this.onerror=null;this.classList.remove('portrait-oil');this.src='assets/portraits/${id}.svg'"` : '';
  return `<img${cls} alt="${alt}" src="${src}"${fb}>`;
}
const wantCao = portraitImg('caocao', '曹操');
const wantZhang = portraitImg('zhangliao', '张辽');
if (!s.includes(wantCao)) { console.error('caocao markup missing'); process.exit(1); }
if (!s.includes(wantZhang)) { console.error('svg markup missing'); process.exit(1); }
if ((s.match(/function portraitImg\(id,alt\)/g) || []).length !== 1) { console.error('def count'); process.exit(1); }
if ((s.match(/portraitImg\(/g) || []).length !== 5) { console.error('call count'); process.exit(1); }
if ((s.match(/assets\/portraits\//g) || []).length !== 3) { console.error('path count'); process.exit(1); }
console.log(wantCao);
console.log(wantZhang);
console.log('game.js ok');
JS
```

Expected: 打印曹操的 PNG 标签、张辽的 SVG 标签，以及 `game.js ok`。曹操标签含 `portrait-oil`、`caocao.png` 和 `caocao.svg`。张辽标签是 `<img alt="张辽" src="assets/portraits/zhangliao.svg">`，没有 `onerror`。

- [ ] **Step 4: 提交 game.js**

```bash
git add game.js
git diff --cached --name-only
git commit -m "feat: 试点武将立绘优先使用 PNG"
```

Expected: 暂存名单只有 `game.js`。

### Task 4: 油画 PNG 不用像素缩放

**Files:**

- Modify: `style.css`（文件末尾追加 4 个选择器）
- Test: 不入库。用 Node 检查 `style.css` 文本

**Interfaces:**

- Consumes: Task 3 写到 `img` 上的 class 名 `portrait-oil`。
- Produces: `.gcard img.portrait-oil`、`#picked img.portrait-oil`、`.portrait img.portrait-oil`、`.modal img.portrait-oil` 的 `image-rendering` 为 `auto`。没有这个 class 的立绘仍是 `pixelated`。

- [ ] **Step 1: 先确认规则还不在**

```bash
node <<'JS'
const fs = require('fs');
const s = fs.readFileSync('style.css', 'utf8');
const rule = '.gcard img.portrait-oil,\n#picked img.portrait-oil,\n.portrait img.portrait-oil,\n.modal img.portrait-oil{image-rendering:auto}';
if (s.includes(rule)) { console.error('rule already present'); process.exit(1); }
console.log('absent');
JS
```

Expected: `absent`，退出码 0。

- [ ] **Step 2: 追加到文件末尾**

`style.css` 最后一条仍是窄屏里的 `.card.back{width:28px; height:40px}`。在文件末尾另起一行追加，不要改已有规则：

```css
.gcard img.portrait-oil,
#picked img.portrait-oil,
.portrait img.portrait-oil,
.modal img.portrait-oil{image-rendering:auto}
```

保留 `.gcard img` 和 `.portrait img` 上的 `object-fit: cover`、`object-position: center` 和 `image-rendering: pixelated`。保留 `.portrait{width:96px` 和窄屏里的 `.portrait{width:72px`。保留 `#picked img` 的 `width:120px` 和 `.modal img` 的 `width:120px`。

- [ ] **Step 3: 确认只有这条新增，几何没变**

```bash
node <<'JS'
const fs = require('fs');
const s = fs.readFileSync('style.css', 'utf8');
const rule = '.gcard img.portrait-oil,\n#picked img.portrait-oil,\n.portrait img.portrait-oil,\n.modal img.portrait-oil{image-rendering:auto}';
if (!s.endsWith(rule + '\n') && !s.endsWith(rule)) { console.error('rule not at end'); process.exit(1); }
for (const bit of ['object-fit: cover', 'object-position: center', 'image-rendering: pixelated', '.portrait{\n  width:96px', '.portrait{width:72px}']) {
  if (!s.includes(bit)) { console.error('missing ' + bit); process.exit(1); }
}
console.log('css ok');
JS
git diff -U0 -- style.css
```

Expected: 打印 `css ok`。`git diff` 只显示文件末尾新增的 4 行选择器，没有删除 `object-fit` 或宽度。

- [ ] **Step 4: 提交 style.css**

```bash
git add style.css
git diff --cached --name-only
git commit -m "feat: 油画立绘关闭像素缩放"
```

Expected: 暂存名单只有 `style.css`。

### Task 5: 改 DESIGN.md 和 README.md 的立绘句子

**Files:**

- Modify: `DESIGN.md:17`
- Modify: `DESIGN.md:247`
- Modify: `README.md:2`

**Interfaces:**

- Consumes: Task 3 的 class 名和 PNG 路径。
- Produces: 两份文档里的示例与仓库行为一致。人数从句保持 `16 位武将`，不在本任务改正。

- [ ] **Step 1: 改 DESIGN.md 的两处**

在这一条后面追加一句，不要改这一条本身：

```markdown
- 像素立绘继续 `image-rendering: pixelated`，`object-fit: cover`，`object-position: center`。
```

追加的句子是：

```markdown
- `caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo` 的 `img` 带 `portrait-oil`，`image-rendering` 为 `auto`。其余立绘仍是 `pixelated`。
```

第 8.2 节示例里的图标签从：

```html
  <img alt="曹操" src="assets/portraits/caocao.svg">
```

改为：

```html
  <img alt="曹操" class="portrait-oil" src="assets/portraits/caocao.png">
```

- [ ] **Step 2: 替换 README.md 第 2 行整行**

替换成：

```markdown
原创三国主题 1v1 人机卡牌对战（浏览器）。16 位武将、原创技能与卡牌。caocao、guanyu、zhouyu、lvbu、zhugeliang、diaochan、dianwei、huatuo 使用写实油画 PNG，其余武将仍用 `tools/portraits.js` 生成的卡通像素 SVG。
```

不要改 README 后面关于 48 位武将的历史段落。

- [ ] **Step 3: 核对这两处文本**

```bash
node <<'JS'
const fs = require('fs');
const d = fs.readFileSync('DESIGN.md', 'utf8');
const r = fs.readFileSync('README.md', 'utf8');
if (!d.includes('像素立绘继续 `image-rendering: pixelated`')) { console.error('old bullet missing'); process.exit(1); }
if (!d.includes('`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo` 的 `img` 带 `portrait-oil`')) { console.error('oil bullet missing'); process.exit(1); }
if (!d.includes('<img alt="曹操" class="portrait-oil" src="assets/portraits/caocao.png">')) { console.error('example missing'); process.exit(1); }
if (d.includes('src="assets/portraits/caocao.svg"')) { console.error('old example remains'); process.exit(1); }
const line2 = r.split('\n')[1];
const want = '原创三国主题 1v1 人机卡牌对战（浏览器）。16 位武将、原创技能与卡牌。caocao、guanyu、zhouyu、lvbu、zhugeliang、diaochan、dianwei、huatuo 使用写实油画 PNG，其余武将仍用 `tools/portraits.js` 生成的卡通像素 SVG。';
if (line2 !== want) { console.error(line2); process.exit(1); }
console.log('docs ok');
JS
```

Expected: `docs ok`，退出码 0。

- [ ] **Step 4: 提交这两份文档**

```bash
git add DESIGN.md README.md
git diff --cached --name-only
git commit -m "docs: 写明 8 张油画立绘的显示约定"
```

Expected: 暂存名单只有 `DESIGN.md` 和 `README.md`。

### Task 6: 验收页面、回退和可合并范围

**Files:**

- Test: 已有的 `game.js`、`style.css`、8 个 PNG、`DESIGN.md`、`README.md`
- Modify: 只有某项验收失败时，才改回对应文件。不新增文件

**Interfaces:**

- Consumes: Task 2 到 Task 5 的文件。
- Produces: 相对 `main` 的 diff 只含本计划允许的路径，PR #2 可以合并。

- [ ] **Step 1: 再跑文件检查**

```bash
node <<'JS'
const fs = require('fs');
const ids = ['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo'];
for (const id of ids) {
  const b = fs.readFileSync('assets/portraits/' + id + '.png');
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20), d = b[24], c = b[25];
  if (b.toString('ascii', 1, 4) !== 'PNG' || w !== 512 || h !== 512 || d !== 8 || c !== 2 || b.length > 1258291) {
    console.error(id, w, h, d, c, b.length); process.exit(1);
  }
}
const game = fs.readFileSync('game.js', 'utf8');
if ((game.match(/function portraitImg\(id,alt\)/g) || []).length !== 1) process.exit(1);
if ((game.match(/portraitImg\(/g) || []).length !== 5) process.exit(1);
if ((game.match(/assets\/portraits\//g) || []).length !== 3) process.exit(1);
if (!game.includes('assets/portraits/zhangliao.svg') && !game.includes('assets/portraits/${id}.svg')) process.exit(1);
const css = fs.readFileSync('style.css', 'utf8');
const rule = '.gcard img.portrait-oil,\n#picked img.portrait-oil,\n.portrait img.portrait-oil,\n.modal img.portrait-oil{image-rendering:auto}';
if (!css.includes(rule)) process.exit(1);
for (const bit of ['object-fit: cover', 'object-position: center', 'image-rendering: pixelated', 'width:96px', '.portrait{width:72px}']) {
  if (!css.includes(bit)) { console.error(bit); process.exit(1); }
}
const design = fs.readFileSync('DESIGN.md', 'utf8');
if (!design.includes('<img alt="曹操" class="portrait-oil" src="assets/portraits/caocao.png">')) process.exit(1);
const line2 = fs.readFileSync('README.md', 'utf8').split('\n')[1];
if (!line2.includes('16 位武将') || !line2.includes('写实油画 PNG')) process.exit(1);
console.log('files ok');
JS
```

Expected: `files ok`，退出码 0。

- [ ] **Step 2: 确认没有改到 SVG 和生成器**

```bash
git diff main --name-only -- tools/portraits.js 'assets/portraits/*.svg' data index.html BALANCE.md
git diff main --name-only
```

Expected: 第一条命令没有输出。第二条先排序再对比，`git diff main --name-only | sort` 只出现这些路径：

- `DESIGN.md`
- `README.md`
- `assets/portraits/caocao.png`
- `assets/portraits/dianwei.png`
- `assets/portraits/diaochan.png`
- `assets/portraits/guanyu.png`
- `assets/portraits/huatuo.png`
- `assets/portraits/lvbu.png`
- `assets/portraits/zhouyu.png`
- `assets/portraits/zhugeliang.png`
- `docs/superpowers/plans/2026-10-25-oil-portrait-pilot.md`
- `docs/superpowers/specs/2026-10-25-oil-portrait-pilot-design.md`
- `game.js`
- `style.css`

`git diff main --name-only` 按字典序输出。上面的名单就是允许的全部。多出来的路径要撤出提交。

- [ ] **Step 3: 跑规则模拟**

```bash
node tools/sim.js 1
git diff --name-only -- tools/sim-result.json
```

Expected: 模拟输出里有 `errors=0`。若第二条命令打印了 `tools/sim-result.json`，执行 `git checkout -- tools/sim-result.json`。不要把这次模拟结果写进提交。

- [ ] **Step 4: 在页面上核对选将、座位和回退**

在仓库根目录启动静态服务：

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8765/`。窗口先设为 1280×800，再设为 360×740，两档都做下面的控制台检查。

试点 8 人：

```javascript
selectScreen(['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo'])
```

Expected: `#grid img` 有 8 个，每个 `src` 以 `{id}.png` 结尾，每个都有 class `portrait-oil`。网络面板没有这 8 个 PNG 的 404。1280 宽时卡图区域为 168×148；360 宽时列宽不小于 140，图高仍是 148。每一张都能分开两眼、鼻子和嘴。

出战槽：

```javascript
fillSlot(GENERALS.find(g => g.id === 'zhouyu'))
```

Expected: `#picked-body img` 的 `src` 以 `zhouyu.png` 结尾，class 含 `portrait-oil`，显示宽度 120。

非试点 8 人：

```javascript
selectScreen(['zhangliao','liubei','sunquan','zhangfei','simayi','xiahoudun','ganning','yuanshao'])
```

Expected: 8 个 `src` 都以 `.svg` 结尾，没有 `portrait-oil`，网络面板没有发出 `.png` 请求。

`showDetail`：

```javascript
showDetail(GENERALS.find(g => g.id === 'caocao'))
showDetail(GENERALS.find(g => g.id === 'zhangliao'))
```

Expected: 第一次 `#detail img` 指向 `caocao.png` 且带 `portrait-oil`。第二次指向 `zhangliao.svg` 且没有这个 class。看完执行 `document.querySelector('#detail').classList.add('hide')`。

对战座位：

```javascript
start(GENERALS.find(g => g.id === 'caocao'), GENERALS.find(g => g.id === 'lvbu'), false)
```

`start` 在第一次 `render()` 之后才遇到 await，所以调用返回后就可以读 DOM。Expected: `#me img` 与 `#ai img` 分别指向这两人的 `.png`，都带 `portrait-oil`。360 宽时 `.portrait` 的宽度是 72，势力芯片不盖住眼睛。看完执行 `G.over = true`，让循环在下一个检查点停下。

回退：在开发者工具里把一张曹操图的 `src` 改成 `assets/portraits/caocao.png.bak`。Expected: 它换成 `caocao.svg`，并失去 `portrait-oil`。然后刷新页面。不要把 `.bak` 写进仓库，也不要删除真正的 PNG。

- [ ] **Step 5: 推送并确认 PR #2 只含允许的路径**

验收若改了允许名单里的文件，先提交该文件，消息写明修的是哪一项验收。然后：

```bash
git status --short
git push -u origin cursor/oil-portrait-pilot-design-40e5
```

Expected: `git status --short` 为空。PR #2 的文件列表与 Step 2 的允许名单一致。不新开 PR。

## 规格覆盖自检

| 规格 | 本计划 |
|---|---|
| 第 1 节目标：8 人同风格，窄屏认脸，88 人仍是 SVG | Task 2 Step 4，Task 3，Task 6 Step 4 |
| 第 2 节非目标 | Global Constraints，Task 6 Step 2 |
| 第 3 节本提交与后续实现 | 「何时写实现代码」 |
| 第 4 节四处模板、像素缩放、72px 芯片、`FACTIONS` 色值 | Task 3 Step 2，Task 4，Task 2 Step 4 |
| 第 5 节风格圣经和像素饰色对照 | Task 2 Step 4 的否决清单。提示词不另写 |
| 第 6 节骨架、负面栏、八条成品 | Task 1 哈希。GenerateImage 没有负面参数，成品末句已包含禁止项 |
| 第 7 节关键词表 | 不在实现时重装。哈希对不上就停，先改规格第 6.3 节 |
| 第 8 节路径、512、颜色类型 2、1258291 字节、安全矩形、禁止放大 | Task 2 Step 2 和 Step 3 |
| 第 9 节 `portraitImg`、四处调用、CSS 四条、`DESIGN.md`、`README.md` | Task 3、Task 4、Task 5 |
| 第 10 节文件、画面、`selectScreen`、`start`、`.bak` 回退、`sim.js` | Task 6 |
| 第 11 节范围外：其余 88 人、删除 SVG、图鉴、改人数、接触表 | Global Constraints，Task 2 不提交接触表，Task 5 保留 `16 位武将` |
