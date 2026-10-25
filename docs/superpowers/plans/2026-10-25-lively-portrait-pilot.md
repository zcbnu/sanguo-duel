# 活泼半写实插画立绘试点 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按已批准规格，先只入库关羽半写实插画样张并停下来等书面批准，批准后再画其余 7 张，然后让这 8 个 id 优先显示 PNG、失败时回退同 id 的 SVG。

**Architecture:** 出图遵循规格第 6 节方案 B。Task 1 只用文字提示词生成关羽，规范化后提交 `assets/portraits/guanyu.png`，然后停止。Task 2 在用户书面批准之后，把这张已批准的 PNG 作为 GenerateImage 的 `reference_image_paths`，再生成其余 7 张。Task 3 在 `game.js` 加入 `LIVELY_IDS` 和 `portraitImg`，在 `style.css` 给 `portrait-illust` 设置 `image-rendering: auto`，并改 `DESIGN.md` 与 `README.md` 各一处文案。其余 88 人继续只请求 SVG。

**Tech Stack:** 静态 HTML / CSS / JS，Node 内置 `fs`、`zlib`、`http`、`crypto`，GenerateImage。不新增 npm 依赖，不引入图像库。Node 22，`zlib.crc32` 可用。

## Global Constraints

规格 `docs/superpowers/specs/2026-10-25-lively-portrait-pilot-design.md` 的项目级要求。每个任务都包含这些要求。

- 技术栈保持静态 HTML / CSS / JS。不引入图像库、构建步骤或图床。
- 方向名称：活泼半写实插画立绘试点。不是阴郁油画，不是动漫大眼，不是像素图。
- 试点 id，顺序固定：`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo`。
- 8 人的脸都必须一眼读作东亚人。金发、棕发、红发、蓝眼、绿眼、灰眼，或读作欧洲人、白种人、西方面孔的，整张作废并重画。关羽可以画传统红脸，骨相仍须是东亚。
- 每条提示词必须原文包含下面两句，不得翻译、不得删词。没有负面提示词栏时，第二句接在正文末尾。本计划的 GenerateImage 没有负面栏，所以第二句已经接在每条成品末尾。

```prompt
Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.
```

```prompt
western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters
```

- 常量名是 `LIVELY_IDS`。类名是 `portrait-illust`。不用 `OIL_IDS`，不用 `portrait-oil`。
- 不改 `data/generals.js`、`data/cards.js`、`tools/portraits.js`、`BALANCE.md`、`index.html`。
- 不重跑 `tools/portraits.js`，不覆盖、不删除任何 `assets/portraits/*.svg`。
- 不改武将技能、数值、AI、牌堆、胜负和 PeerJS 消息。
- 不改选将卡尺寸、座位立绘宽度、`object-fit` 或 `object-position`。
- 不把 `FACTIONS` 的颜色改成界面色条的颜色，也不把界面色条画进插画。
- 不新增图鉴页、批量出图脚本或 npm 依赖。
- PNG 是 512×512、位深 8、颜色类型 2，单文件不超过 1258291 字节。不提交 JPEG、WebP、带 alpha 的 PNG 或 SVG 插画。
- 实现任务可以改的路径只有：8 个 PNG、`game.js`、`style.css`、`DESIGN.md`、`README.md`。关羽样张那一次提交只有 `assets/portraits/guanyu.png`。规格和本计划不算实现任务里的新文件。
- 实现留在分支 `cursor/lively-portrait-pilot-design-0861`，继续进入 PR #3。不要另开分支。不要把这个 PR 合并到 `main`。
- `node tools/sim.js 1` 结束时输出里 `errors=0`。若该命令改写了 `tools/sim-result.json`，实现提交里还原它。

## 何时写实现代码

写入本计划的这次提交只新增本文件。不调用 GenerateImage，不写入 PNG，不改 `game.js`、`style.css`、`DESIGN.md`、`README.md`。

任务按编号顺序做。Task 1 提交关羽样张后必须停止。没有用户对这张样张的书面批准，Task 2 不得开始。Task 4 不合并 PR。

画面与规格第 5、7 节不一致时，重画该张，不改规格，也不改本计划里的提示词成品。

## 文件结构

| 文件 | 责任 | 任务 |
|---|---|---|
| `docs/superpowers/specs/2026-10-25-lively-portrait-pilot-design.md` | 已批准的画风、门禁、裁切和回退规则。只读 | 全程 |
| `assets/portraits/guanyu.png` | 关羽风格参照板。获批后不得在 Task 2 重画 | Task 1 创建 |
| `assets/portraits/{caocao,zhouyu,lvbu,zhugeliang,diaochan,dianwei,huatuo}.png` | 其余 7 张，以关羽 PNG 为风格参照 | Task 2 创建 |
| `game.js` | `LIVELY_IDS` 与 `portraitImg`。四处立绘模板改走这个函数 | Task 3 修改 |
| `style.css` | 只追加 `portrait-illust` 的 `image-rendering: auto` | Task 3 修改 |
| `DESIGN.md` | 像素缩放句子和曹操示例图 | Task 3 修改 |
| `README.md` | 第 2 行的立绘从句 | Task 3 修改 |
| `tools/portraits.js`、全部 `.svg`、`data/`、`index.html` | 不改 | Task 4 用 diff 核对 |

规范化 PNG 的 Node 脚本写在任务步骤里，从标准输入执行，不写入仓库。

---

### Task 1: 只生成并入库关羽样张

**Files:**

- Create: `assets/portraits/guanyu.png`
- Modify: 无
- Read: `docs/superpowers/specs/2026-10-25-lively-portrait-pilot-design.md`

**Interfaces:**

- Consumes: 下面 Step 1 写到 `/tmp/lively-prompts/guanyu.txt` 的三行成品。GenerateImage 的参数是 `description`、`filename`、`aspect_ratio`。本任务不传 `reference_image_paths`。
- Produces: `assets/portraits/guanyu.png`。IHDR 为宽 512、高 512、位深 8、颜色类型 2，文件不超过 1258291 字节。Task 2 把这个路径放进 `reference_image_paths`。Task 2 开始前，用户必须书面批准这一张。

- [ ] **Step 1: 把关羽成品写入临时文件并核对原文**

在仓库根目录执行。临时文件不提交。

```bash
mkdir -p /tmp/lively-prompts
cat > /tmp/lively-prompts/guanyu.txt << 'EOF'
Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.
关羽，蜀。风格参照板。东亚成年人，黑发，黑色或深褐色眼睛，长髯。传统红脸可以；若画红脸，骨相仍是东亚人，不是欧洲人晒红或涂红。不画红脸、用常色东亚肤色也可以。半身，头顶靠近画面上方，腰部以下被底边切断，不画全身，不画只有五官的大特写。青龙偃月刀只露一角，贴在画面边缘，不占满画面，不刺向观众，不沾血。背景同时有竹的暗示和旗角，两样都要有，都只是暗示，不铺成竹林或军阵。旗帜只画色块和布的边缘，没有可识读的汉字、拉丁字母、数字、印章或签名。表情生动，可以含笑、专注或傲然，不呆滞，不阴郁，不尖叫。双眼、鼻子和嘴完整落在画面中上部。
western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters
EOF
node << 'JS'
const fs = require('fs');
const crypto = require('crypto');
const pos = 'Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.';
const neg = 'western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters';
const text = fs.readFileSync('/tmp/lively-prompts/guanyu.txt', 'utf8').replace(/\n$/, '');
if (!text.startsWith(pos + '\n')) { console.error('missing positive'); process.exit(1); }
if (!text.endsWith('\n' + neg)) { console.error('missing negative'); process.exit(1); }
const hex = crypto.createHash('sha256').update(text).digest('hex');
if (hex !== '0dc0bad6db5ecd726384da1744d564b60ffe01663e8b1f6e981b48400d5942d9') {
  console.error(hex);
  process.exit(1);
}
console.log('guanyu prompt ok');
JS
```

Expected: `guanyu prompt ok`，退出码 0。哈希不一致就停止。不要改这三行成品。

- [ ] **Step 2: 确认还没有试点 PNG，也没有改 SVG**

```bash
git status --short
ls assets/portraits/guanyu.png 2>/dev/null || echo 'no guanyu png'
git diff --name-only -- tools/portraits.js assets/portraits/*.svg
```

Expected: `git status --short` 为空。打印 `no guanyu png`。`git diff` 无输出。若 `guanyu.png` 已经存在，先不要覆盖；停下来看它是不是上一轮被否决后留下的文件。用户没有要求重画时，不要生成第二张。

- [ ] **Step 3: 只生成关羽**

`description` 等于 `/tmp/lively-prompts/guanyu.txt` 去掉末尾一个换行后的全部字符。不要加词，不要翻译两句英文。

GenerateImage 参数只有：

- `description`：上述全文
- `filename`：`guanyu.png`
- `aspect_ratio`：`1:1`

不要传 `reference_image_paths`。不要生成 `caocao`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo`。

工具返回的文件复制到 `/tmp/lively-guanyu-src.png`。若工具把未规范化的 PNG 写进仓库，把那份挪到 `/tmp`，不要留在 `assets/portraits/`。源图短边小于 512 就删掉，用同一段 `description` 再调一次 GenerateImage。禁止放大。

当前进程如果没有 GenerateImage，停在本步骤。不要换画风，不要交占位图，不要改提示词，不要改用纯色块。

- [ ] **Step 4: 把源图规范成 512×512 的颜色类型 2**

颜色类型 6 时丢掉 alpha，保留 RGB，不与任何底色混合。脚本不写入仓库。正方形源图不要设置 `CROP_X` 或 `CROP_Y`。宽大于高时，只允许用 `CROP_X` 沿横边平移最大正方形，默认居中。高大于宽时，只允许用 `CROP_Y`。正方形边长始终是短边。

```bash
cp /tmp/lively-guanyu-src.png /tmp/lively-guanyu-work.png
node /dev/stdin /tmp/lively-guanyu-work.png << 'JS'
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
  return png;
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
  const rgb = Buffer.alloc(side * side * 3);
  if (bpp === 4) {
    for (let i = 0; i < side * side; i++) {
      rgb[i * 3] = square[i * 4];
      rgb[i * 3 + 1] = square[i * 4 + 1];
      rgb[i * 3 + 2] = square[i * 4 + 2];
    }
  } else {
    square.copy(rgb);
  }
  const scaled = scale(rgb, side, 3, side);
  const png = encode(scaled);
  if (png.length > 1258291) throw new Error('压缩后仍有 ' + png.length + ' 字节，超过 1258291');
  fs.writeFileSync(file, png);
  const back = parse(png);
  if (back.w !== 512 || back.h !== 512 || back.depth !== 8 || back.color !== 2) throw new Error('回读 IHDR 不符合');
  console.log(file + ' 512 512 8 2 bytes=' + png.length);
}
normalize(process.argv[2]);
JS
cp /tmp/lively-guanyu-work.png assets/portraits/guanyu.png
```

Expected: 打印 `/tmp/lively-guanyu-work.png 512 512 8 2 bytes=` 加一个不大于 1258291 的整数，退出码 0。短边小于 512 时退出码非 0，并打印「重新生成，禁止放大」。这时删掉 work 文件和 `assets/portraits/guanyu.png`，回到 Step 3，`description` 仍是原来那一段。

- [ ] **Step 5: 核对关羽 IHDR**

```bash
node << 'JS'
const fs = require('fs');
const b = fs.readFileSync('assets/portraits/guanyu.png');
const w = b.readUInt32BE(16), h = b.readUInt32BE(20), d = b[24], c = b[25];
if (b.toString('ascii', 1, 4) !== 'PNG' || w !== 512 || h !== 512 || d !== 8 || c !== 2 || b.length > 1258291) {
  console.error(w, h, d, c, b.length);
  process.exit(1);
}
console.log('guanyu ok', b.length);
JS
```

Expected: `guanyu ok` 加字节数，退出码 0。

- [ ] **Step 6: 看关羽原图，不合格就用同一提示词重画**

打开 `assets/portraits/guanyu.png`。下面任一失败，就删除这张 PNG 和 `/tmp/lively-guanyu-work.png`，回到 Step 3。源图不是正方形、只是脸偏了，可以先换一个合法的 `CROP_X` 或 `CROP_Y`，从 `/tmp/lively-guanyu-src.png` 重跑 Step 4。怎么裁都放不进安全矩形，就重画，不改提示词。

必须全部成立：

- 双眼、鼻、嘴的像素都在 x 160–430、y 184–400 内。眼睛不得进入 x 0–218、y 0–171。
- 半身。东亚成年人，黑发，黑色或深褐色眼睛，长髯。传统红脸可以，骨相仍读作东亚人。不画红脸也可以。
- 青龙偃月刀只在画面边缘露一角。竹和旗角都有，而且都只是暗示。旗帜没有可识读的字。
- 柔光，高饱和，半写实插画。不是阴郁油画，不是照片，不是三维渲染，不是动漫大眼，不是像素图。
- 没有血、喷血、伤口、水印、签名、画框，没有可识读的中文或英文。

- [ ] **Step 7: 只提交关羽这一张**

```bash
git add assets/portraits/guanyu.png
git diff --cached --name-only
git commit -m "feat: 加入关羽插画立绘样张"
```

Expected: `git diff --cached --name-only` 只有 `assets/portraits/guanyu.png`。没有另外 7 张 PNG，没有 `game.js`，没有 `style.css`，没有 `DESIGN.md`，没有 `README.md`，没有接触表，没有 SVG 改动。

- [ ] **Step 8: 停下来等用户批准样张**

把 `assets/portraits/guanyu.png` 交给用户看。用户只做整张批准或整张否决。

批准之前：

- 不得开始 Task 2。
- 不得生成曹操、周瑜、吕布、诸葛亮、貂蝉、典韦、华佗。
- 不得把这 7 个 id 的 PNG 写入仓库。
- 不得修改 `game.js`、`style.css`、`DESIGN.md`、`README.md`。

否决后只重做本任务：用 Step 1 的同一段成品替换 `assets/portraits/guanyu.png`，再次只提交这一张。不要平行再出另外 7 张。

本步骤没有第二条命令。执行者停在这里。

### Task 2: 批准后生成其余 7 张

**Files:**

- Create: `assets/portraits/caocao.png`
- Create: `assets/portraits/zhouyu.png`
- Create: `assets/portraits/lvbu.png`
- Create: `assets/portraits/zhugeliang.png`
- Create: `assets/portraits/diaochan.png`
- Create: `assets/portraits/dianwei.png`
- Create: `assets/portraits/huatuo.png`
- Read: `assets/portraits/guanyu.png`

**Interfaces:**

- Consumes: 用户对 `assets/portraits/guanyu.png` 的书面批准。GenerateImage 参数再加 `reference_image_paths: ["assets/portraits/guanyu.png"]`。7 条成品见 Step 2。
- Produces: 上面 7 个 PNG。每个 IHDR 为 512×512、位深 8、颜色类型 2，不超过 1258291 字节。不替换已批准的关羽文件。Task 3 的 `LIVELY_IDS` 会请求全部 8 个路径。

- [ ] **Step 1: 确认书面批准，否则停止**

本步骤不改仓库。只有用户在对话里明确写出批准关羽样张，才继续。认可的句子包括「批准关羽样张」「批准 guanyu.png」，以及明确指向 `assets/portraits/guanyu.png` 的同等批准。

没有这句书面批准：停止。不要调用 GenerateImage。不要创建另外 7 个 PNG。不要改 `game.js`、`style.css`、`DESIGN.md`、`README.md`。

用户否决样张：回到 Task 1，只替换 `assets/portraits/guanyu.png`。不要做 Step 2。

生成器如果不能接收 `reference_image_paths`，也停下来问用户。不要改成纯文字批量出图，不要改回油画试点的提示词。

- [ ] **Step 2: 写入 7 条成品并核对原文**

```bash
mkdir -p /tmp/lively-prompts
cat > /tmp/lively-prompts/caocao.txt << 'EOF'
Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.
曹操，魏。精悍，眼神算计。东亚成年人，黑发，黑色或深褐色眼睛。深色袍服，袍袖有转折。半身，头顶靠近画面上方，腰部以下被底边切断。背景只有一处火光：营火，或营帐边的火光，不要两堆火。不要空底，不要战场。光照的柔和程度、饱和度、东亚面部特征、插画语言与参照图一致。不要复制关羽的红脸、长髯或青龙偃月刀。没有可识读的汉字、拉丁字母、数字、水印或签名。表情生动，不阴郁，不尖叫。
western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters
EOF
cat > /tmp/lively-prompts/zhouyu.txt << 'EOF'
Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.
周瑜，吴。英俊，沉着，带火气。东亚成年人，黑发，黑色或深褐色眼睛。折扇露一角。衣服是袍或轻甲。半身，头顶靠近画面上方，腰部以下被底边切断。背景只取一样：旗角，或一小块江水反光。不要两样都画，也不要一样都没有。旗帜只画色块和布的边缘。光照的柔和程度、饱和度、东亚面部特征、插画语言与参照图一致。不要复制关羽的红脸、长髯或青龙偃月刀。没有可识读的汉字、拉丁字母、数字、水印或签名。表情生动，不阴郁，不尖叫。
western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters
EOF
cat > /tmp/lively-prompts/lvbu.txt << 'EOF'
Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.
吕布，群。凶悍，自负。东亚成年人，黑发，黑色或深褐色眼睛。方天画戟露一角，不占满画面，不刺向观众，不沾血。半身，头顶靠近画面上方，腰部以下被底边切断。背景只一处：戏剧性的天空，其中有一角旗。不另加第二种风景，不画军阵。旗帜只画色块和布的边缘。光照的柔和程度、饱和度、东亚面部特征、插画语言与参照图一致。不要复制关羽的红脸、长髯或青龙偃月刀。没有可识读的汉字、拉丁字母、数字、水印或签名。表情生动，不阴郁，不尖叫。
western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters
EOF
cat > /tmp/lively-prompts/zhugeliang.txt << 'EOF'
Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.
诸葛亮，蜀。平静，聪慧。东亚成年人，黑发，黑色或深褐色眼睛。羽扇露一角。半身，头顶靠近画面上方，腰部以下被底边切断。背景是竹，只要这一处。光照的柔和程度、饱和度、东亚面部特征、插画语言与参照图一致。不要复制关羽的红脸、长髯或青龙偃月刀。没有可识读的汉字、拉丁字母、数字、水印或签名。表情生动，不阴郁，不尖叫。
western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters
EOF
cat > /tmp/lively-prompts/diaochan.txt << 'EOF'
Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.
貂蝉，群。约二十岁的成年女子，端丽，有神。东亚成年人，黑发，黑色或深褐色眼睛。不画成童颜，不画成暴露或挑逗的构图。丝袖入画。半身，头顶靠近画面上方，腰部以下被底边切断。背景只取一样：一盏灯笼，或一轮月亮。不要两样都画，也不要一样都没有。光照的柔和程度、饱和度、东亚面部特征、插画语言与参照图一致。不要复制关羽的红脸、长髯或青龙偃月刀。没有可识读的汉字、拉丁字母、数字、水印或签名。表情生动，不阴郁，不尖叫。
western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters
EOF
cat > /tmp/lively-prompts/dianwei.txt << 'EOF'
Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.
典韦，魏。魁梧的护卫气势。东亚成年人，黑发，黑色或深褐色眼睛。双戟露一角，不占满画面，不刺向观众，不沾血。半身，头顶靠近画面上方，腰部以下被底边切断。背景是一支火把，只要这一处。光照的柔和程度、饱和度、东亚面部特征、插画语言与参照图一致。不要复制关羽的红脸、长髯或青龙偃月刀。没有可识读的汉字、拉丁字母、数字、水印或签名。表情生动，不阴郁，不尖叫。
western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters
EOF
cat > /tmp/lively-prompts/huatuo.txt << 'EOF'
Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.
华佗，群。医者，目光专注、和缓。东亚成年人，灰白发可以，黑色或深褐色眼睛。胸前一只药囊，能看见药草。不画手术，不画扎进皮肤的针，不画兵器。半身，头顶靠近画面上方，腰部以下被底边切断。背景是一盏柔和的灯，只要这一处。光照的柔和程度、饱和度、东亚面部特征、插画语言与参照图一致。不要复制关羽的红脸、长髯或青龙偃月刀。没有可识读的汉字、拉丁字母、数字、水印或签名。表情生动，不阴郁，不尖叫。
western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters
EOF
node << 'JS'
const fs = require('fs');
const crypto = require('crypto');
const pos = 'Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.';
const neg = 'western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters';
const want = {
  caocao: 'd11c7637eecd5b812fd851aceedc34f630b3060d15e5bc561c042e92266c109e',
  zhouyu: '69edfadf9a9d03279a3afed5b208c454989f5db2079261651b68adbfcd5d26d4',
  lvbu: '927857a283110324e6c41f70cdfcc72b7d845be71f674c2db94cbbccd34a7564',
  zhugeliang: '440e19ff4dee8211323f759ce99d82d9d47dbaa24cd067b8e076591e08e31989',
  diaochan: '6d62b5517b85d1e343121285b88f30972ba23dd05fcab4554acec78dbfbe36f6',
  dianwei: '90067ede9ea1ee62b382606004f6dee4bb8ab00481957690b94c5d5075f3f50b',
  huatuo: 'caa61913d4eb4f56fa420d97747e55035c876fb11014adb91181bcbd7da3e17c'
};
for (const [id, hex] of Object.entries(want)) {
  const text = fs.readFileSync('/tmp/lively-prompts/' + id + '.txt', 'utf8').replace(/\n$/, '');
  if (!text.startsWith(pos + '\n') || !text.endsWith('\n' + neg)) {
    console.error(id + ' english');
    process.exit(1);
  }
  const got = crypto.createHash('sha256').update(text).digest('hex');
  if (got !== hex) { console.error(id, got); process.exit(1); }
  console.log(id + ' prompt ok');
}
JS
```

Expected: 7 行 `{id} prompt ok`，退出码 0。这些 txt 留在 `/tmp`，不提交。

- [ ] **Step 3: 以关羽 PNG 为风格参照，逐张生成**

每个 id 调用一次 GenerateImage。`description` 等于 `/tmp/lively-prompts/{id}.txt` 去掉末尾一个换行后的全部字符。

7 次调用的参数：

- `caocao`：`filename` 为 `caocao.png`，`aspect_ratio` 为 `1:1`，`reference_image_paths` 为 `["assets/portraits/guanyu.png"]`
- `zhouyu`：`filename` 为 `zhouyu.png`，`aspect_ratio` 为 `1:1`，`reference_image_paths` 为 `["assets/portraits/guanyu.png"]`
- `lvbu`：`filename` 为 `lvbu.png`，`aspect_ratio` 为 `1:1`，`reference_image_paths` 为 `["assets/portraits/guanyu.png"]`
- `zhugeliang`：`filename` 为 `zhugeliang.png`，`aspect_ratio` 为 `1:1`，`reference_image_paths` 为 `["assets/portraits/guanyu.png"]`
- `diaochan`：`filename` 为 `diaochan.png`，`aspect_ratio` 为 `1:1`，`reference_image_paths` 为 `["assets/portraits/guanyu.png"]`
- `dianwei`：`filename` 为 `dianwei.png`，`aspect_ratio` 为 `1:1`，`reference_image_paths` 为 `["assets/portraits/guanyu.png"]`
- `huatuo`：`filename` 为 `huatuo.png`，`aspect_ratio` 为 `1:1`，`reference_image_paths` 为 `["assets/portraits/guanyu.png"]`

不要再生成关羽。不要改已批准的 `assets/portraits/guanyu.png`。

每张源图复制到 `/tmp/lively-{id}-src.png`。未规范化的文件不要留在 `assets/portraits/`。短边小于 512 就删掉，用同一段 `description` 和同一张参照图再生成。禁止放大。

- [ ] **Step 4: 把 7 张源图规范成交付 PNG**

对 `caocao`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo` 各跑一遍。颜色类型 6 时丢掉 alpha，保留 RGB，不与任何底色混合。默认居中最大正方形，只允许用 `CROP_X` 或 `CROP_Y` 平移，禁止把短边再切小。

```bash
cp /tmp/lively-caocao-src.png /tmp/lively-caocao-work.png
node /dev/stdin /tmp/lively-caocao-work.png << 'JS'
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
  return png;
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
  const rgb = Buffer.alloc(side * side * 3);
  if (bpp === 4) {
    for (let i = 0; i < side * side; i++) {
      rgb[i * 3] = square[i * 4];
      rgb[i * 3 + 1] = square[i * 4 + 1];
      rgb[i * 3 + 2] = square[i * 4 + 2];
    }
  } else {
    square.copy(rgb);
  }
  const scaled = scale(rgb, side, 3, side);
  const png = encode(scaled);
  if (png.length > 1258291) throw new Error('压缩后仍有 ' + png.length + ' 字节，超过 1258291');
  fs.writeFileSync(file, png);
  const back = parse(png);
  if (back.w !== 512 || back.h !== 512 || back.depth !== 8 || back.color !== 2) throw new Error('回读 IHDR 不符合');
  console.log(file + ' 512 512 8 2 bytes=' + png.length);
}
normalize(process.argv[2]);
JS
cp /tmp/lively-caocao-work.png assets/portraits/caocao.png
```

另外 6 个 id 各自使用下面这一段完整脚本，不要删行：

```bash
cp /tmp/lively-zhouyu-src.png /tmp/lively-zhouyu-work.png
node /dev/stdin /tmp/lively-zhouyu-work.png << 'JS'
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
  return png;
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
  const rgb = Buffer.alloc(side * side * 3);
  if (bpp === 4) {
    for (let i = 0; i < side * side; i++) {
      rgb[i * 3] = square[i * 4];
      rgb[i * 3 + 1] = square[i * 4 + 1];
      rgb[i * 3 + 2] = square[i * 4 + 2];
    }
  } else {
    square.copy(rgb);
  }
  const scaled = scale(rgb, side, 3, side);
  const png = encode(scaled);
  if (png.length > 1258291) throw new Error('压缩后仍有 ' + png.length + ' 字节，超过 1258291');
  fs.writeFileSync(file, png);
  const back = parse(png);
  if (back.w !== 512 || back.h !== 512 || back.depth !== 8 || back.color !== 2) throw new Error('回读 IHDR 不符合');
  console.log(file + ' 512 512 8 2 bytes=' + png.length);
}
normalize(process.argv[2]);
JS
cp /tmp/lively-zhouyu-work.png assets/portraits/zhouyu.png
cp /tmp/lively-lvbu-src.png /tmp/lively-lvbu-work.png
node /dev/stdin /tmp/lively-lvbu-work.png << 'JS'
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
  return png;
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
  const rgb = Buffer.alloc(side * side * 3);
  if (bpp === 4) {
    for (let i = 0; i < side * side; i++) {
      rgb[i * 3] = square[i * 4];
      rgb[i * 3 + 1] = square[i * 4 + 1];
      rgb[i * 3 + 2] = square[i * 4 + 2];
    }
  } else {
    square.copy(rgb);
  }
  const scaled = scale(rgb, side, 3, side);
  const png = encode(scaled);
  if (png.length > 1258291) throw new Error('压缩后仍有 ' + png.length + ' 字节，超过 1258291');
  fs.writeFileSync(file, png);
  const back = parse(png);
  if (back.w !== 512 || back.h !== 512 || back.depth !== 8 || back.color !== 2) throw new Error('回读 IHDR 不符合');
  console.log(file + ' 512 512 8 2 bytes=' + png.length);
}
normalize(process.argv[2]);
JS
cp /tmp/lively-lvbu-work.png assets/portraits/lvbu.png
cp /tmp/lively-zhugeliang-src.png /tmp/lively-zhugeliang-work.png
node /dev/stdin /tmp/lively-zhugeliang-work.png << 'JS'
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
  return png;
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
  const rgb = Buffer.alloc(side * side * 3);
  if (bpp === 4) {
    for (let i = 0; i < side * side; i++) {
      rgb[i * 3] = square[i * 4];
      rgb[i * 3 + 1] = square[i * 4 + 1];
      rgb[i * 3 + 2] = square[i * 4 + 2];
    }
  } else {
    square.copy(rgb);
  }
  const scaled = scale(rgb, side, 3, side);
  const png = encode(scaled);
  if (png.length > 1258291) throw new Error('压缩后仍有 ' + png.length + ' 字节，超过 1258291');
  fs.writeFileSync(file, png);
  const back = parse(png);
  if (back.w !== 512 || back.h !== 512 || back.depth !== 8 || back.color !== 2) throw new Error('回读 IHDR 不符合');
  console.log(file + ' 512 512 8 2 bytes=' + png.length);
}
normalize(process.argv[2]);
JS
cp /tmp/lively-zhugeliang-work.png assets/portraits/zhugeliang.png
cp /tmp/lively-diaochan-src.png /tmp/lively-diaochan-work.png
node /dev/stdin /tmp/lively-diaochan-work.png << 'JS'
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
  return png;
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
  const rgb = Buffer.alloc(side * side * 3);
  if (bpp === 4) {
    for (let i = 0; i < side * side; i++) {
      rgb[i * 3] = square[i * 4];
      rgb[i * 3 + 1] = square[i * 4 + 1];
      rgb[i * 3 + 2] = square[i * 4 + 2];
    }
  } else {
    square.copy(rgb);
  }
  const scaled = scale(rgb, side, 3, side);
  const png = encode(scaled);
  if (png.length > 1258291) throw new Error('压缩后仍有 ' + png.length + ' 字节，超过 1258291');
  fs.writeFileSync(file, png);
  const back = parse(png);
  if (back.w !== 512 || back.h !== 512 || back.depth !== 8 || back.color !== 2) throw new Error('回读 IHDR 不符合');
  console.log(file + ' 512 512 8 2 bytes=' + png.length);
}
normalize(process.argv[2]);
JS
cp /tmp/lively-diaochan-work.png assets/portraits/diaochan.png
cp /tmp/lively-dianwei-src.png /tmp/lively-dianwei-work.png
node /dev/stdin /tmp/lively-dianwei-work.png << 'JS'
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
  return png;
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
  const rgb = Buffer.alloc(side * side * 3);
  if (bpp === 4) {
    for (let i = 0; i < side * side; i++) {
      rgb[i * 3] = square[i * 4];
      rgb[i * 3 + 1] = square[i * 4 + 1];
      rgb[i * 3 + 2] = square[i * 4 + 2];
    }
  } else {
    square.copy(rgb);
  }
  const scaled = scale(rgb, side, 3, side);
  const png = encode(scaled);
  if (png.length > 1258291) throw new Error('压缩后仍有 ' + png.length + ' 字节，超过 1258291');
  fs.writeFileSync(file, png);
  const back = parse(png);
  if (back.w !== 512 || back.h !== 512 || back.depth !== 8 || back.color !== 2) throw new Error('回读 IHDR 不符合');
  console.log(file + ' 512 512 8 2 bytes=' + png.length);
}
normalize(process.argv[2]);
JS
cp /tmp/lively-dianwei-work.png assets/portraits/dianwei.png
cp /tmp/lively-huatuo-src.png /tmp/lively-huatuo-work.png
node /dev/stdin /tmp/lively-huatuo-work.png << 'JS'
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
  return png;
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
  const rgb = Buffer.alloc(side * side * 3);
  if (bpp === 4) {
    for (let i = 0; i < side * side; i++) {
      rgb[i * 3] = square[i * 4];
      rgb[i * 3 + 1] = square[i * 4 + 1];
      rgb[i * 3 + 2] = square[i * 4 + 2];
    }
  } else {
    square.copy(rgb);
  }
  const scaled = scale(rgb, side, 3, side);
  const png = encode(scaled);
  if (png.length > 1258291) throw new Error('压缩后仍有 ' + png.length + ' 字节，超过 1258291');
  fs.writeFileSync(file, png);
  const back = parse(png);
  if (back.w !== 512 || back.h !== 512 || back.depth !== 8 || back.color !== 2) throw new Error('回读 IHDR 不符合');
  console.log(file + ' 512 512 8 2 bytes=' + png.length);
}
normalize(process.argv[2]);
JS
cp /tmp/lively-huatuo-work.png assets/portraits/huatuo.png
```

Expected: 每个 id 打印 `512 512 8 2 bytes=` 加一个不大于 1258291 的整数，退出码 0。失败的那一张回到 Step 3，只重画该 id。

- [ ] **Step 5: 核对 7 张 IHDR，并确认关羽文件没被换掉**

```bash
node << 'JS'
const fs = require('fs');
const ids = ['caocao','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo'];
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
git diff --name-only -- assets/portraits/guanyu.png tools/portraits.js assets/portraits/*.svg
```

Expected: 7 行 `{id} ok {字节数}`。`git diff` 无输出。关羽 PNG 相对任务 1 的提交没有新的未暂存改动。

- [ ] **Step 6: 逐张看画面，不合格只重画该张**

打开这 7 张 `assets/portraits/{id}.png`。每张都要：双眼、鼻、嘴落在 x 160–430、y 184–400；眼睛不进入 x 0–218、y 0–171；柔光、高饱和、半写实插画、半身、东亚成年人；黑发（华佗可以是灰白发）；黑色或深褐色眼睛；没有阴郁油画、动漫大眼、像素、照片、三维渲染、血、喷血、水印和可识读文字。光照、饱和度、面部特征和插画语言跟上关羽样张。不要把关羽的红脸、长髯或青龙偃月刀复制到别人脸上。

另外，每张自己的道具和背景必须成立，否则只重画该张，提示词和参照图都不变：

- `caocao`：深色袍服，袍袖有转折。背景只有一处火光。
- `zhouyu`：折扇露一角。背景只有旗角或一小块江水反光，两样同时出现算失败，一样都没有也算失败。衣服是袍还是轻甲，不单独判失败。
- `lvbu`：方天画戟露一角。背景只有一处戏剧性的天空，其中有一角旗。不画军阵。
- `zhugeliang`：羽扇露一角。背景是竹。
- `diaochan`：约二十岁的成年女子，丝袖入画。不画成童颜，不画成暴露或挑逗的构图。背景只有灯笼或月亮，两样同时出现算失败。
- `dianwei`：双戟露一角。背景是一支火把。
- `huatuo`：胸前一只药囊，能看见药草。背景是一盏柔和的灯。没有手术、针和兵器。

做不到安全矩形时，先用合法的 `CROP_X` 或 `CROP_Y` 从该 id 的 `/tmp/lively-{id}-src.png` 重跑 Step 4。仍然做不到就回到 Step 3 重画该 id。

- [ ] **Step 7: 只提交这 7 张 PNG**

```bash
git add assets/portraits/caocao.png assets/portraits/zhouyu.png assets/portraits/lvbu.png assets/portraits/zhugeliang.png assets/portraits/diaochan.png assets/portraits/dianwei.png assets/portraits/huatuo.png
git diff --cached --name-only
git commit -m "feat: 加入其余 7 张活泼半写实插画立绘"
```

Expected: `git diff --cached --name-only` 只有这 7 个 PNG。没有关羽 PNG，没有代码，没有 SVG，没有接触表。

### Task 3: 接入 LIVELY_IDS、portrait-illust 和两处文案

**Files:**

- Modify: `game.js`（在 `// ---- 渲染 ----` 之前插入函数；改 `seat`、`fillSlot`、`selectScreen`、`showDetail` 的立绘标签）
- Modify: `style.css`（在 `.portrait img` 规则之后追加四条选择器）
- Modify: `DESIGN.md`（方向一节的像素句子；第 8.2 节曹操示例）
- Modify: `README.md`（第 2 行）

**Interfaces:**

- Consumes: Task 2 留下的 8 个 PNG 路径。`portraitImg(id, alt)` 的 `id` 和 `alt` 都是字符串。
- Produces: `id` 属于 `LIVELY_IDS` 时，返回的 `<img>` 的 `src` 为 `assets/portraits/{id}.png`，带 `class="portrait-illust"` 和一次性 `onerror`。否则 `src` 为 `assets/portraits/{id}.svg`，没有 class，没有 `onerror`。`style.css` 里 `.portrait-illust` 的 `image-rendering` 为 `auto`。

- [ ] **Step 1: 先跑检查，确认 portraitImg 还不存在**

```bash
node << 'JS'
const fs = require('fs');
const s = fs.readFileSync('game.js', 'utf8');
if (s.includes('function portraitImg(id,alt)') || s.includes('LIVELY_IDS')) {
  console.error('already present');
  process.exit(1);
}
console.log('missing portraitImg');
process.exit(1);
JS
```

Expected: 打印 `missing portraitImg`，退出码 1。若打印 `already present`，停止，不要再插入第二份函数。

- [ ] **Step 2: 插入函数并替换四处标签**

在 `// ---- 渲染 ----` 正上方插入：

```javascript
const LIVELY_IDS=new Set(['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo']);
function portraitImg(id,alt){const lively=LIVELY_IDS.has(id);
 const src=lively?`assets/portraits/${id}.png`:`assets/portraits/${id}.svg`;
 const cls=lively?' class="portrait-illust"':'';
 const fb=lively?` onerror="this.onerror=null;this.classList.remove('portrait-illust');this.src='assets/portraits/${id}.svg'"`:'';
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

`selectScreen()` 里把同一段：

```javascript
<img alt="${g.name}" src="assets/portraits/${g.id}.svg">
```

换成：

```javascript
${portraitImg(g.id,g.name)}
```

`showDetail()` 里把：

```javascript
<img src="assets/portraits/${g.id}.svg">
```

换成：

```javascript
${portraitImg(g.id,g.name)}
```

不要改这四个函数的其余逻辑。不要给新函数加注释。`showDetail` 目前没有调用方，仍然要改。不要写成 `OIL_IDS` 或 `portrait-oil`。

- [ ] **Step 3: 再跑检查，确认字符串正确**

```bash
node << 'JS'
const fs = require('fs');
const s = fs.readFileSync('game.js', 'utf8');
const ids = ['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo'];
if (!s.includes('const LIVELY_IDS=new Set([' + ids.map(id => "'" + id + "'").join(',') + ']);')) {
  console.error('set');
  process.exit(1);
}
if (!s.includes('function portraitImg(id,alt)')) { console.error('fn'); process.exit(1); }
if (s.includes('OIL_IDS') || s.includes('portrait-oil')) { console.error('oil name'); process.exit(1); }
if (s.includes('assets/portraits/${p.g.id}.svg') || s.includes('assets/portraits/${g.id}.svg')) {
  console.error('raw svg template');
  process.exit(1);
}
const calls = s.split('${portraitImg(').length - 1;
if (calls !== 4) { console.error('calls ' + calls); process.exit(1); }
console.log('portraitImg ok');
JS
```

Expected: `portraitImg ok`，退出码 0。

- [ ] **Step 4: 提交 game.js**

```bash
git add game.js
git diff --cached --name-only
git commit -m "feat: 试点武将立绘优先使用 PNG"
```

Expected: 暂存名单只有 `game.js`。

- [ ] **Step 5: 先确认样式里还没有 portrait-illust**

```bash
node << 'JS'
const fs = require('fs');
const s = fs.readFileSync('style.css', 'utf8');
if (s.includes('portrait-illust')) { console.error('already present'); process.exit(1); }
console.log('missing portrait-illust');
process.exit(1);
JS
```

Expected: `missing portrait-illust`，退出码 1。

- [ ] **Step 6: 追加四条非像素化规则**

在 `.portrait img{width:100%; display:block; object-fit:cover; object-position:center; image-rendering:pixelated}` 这一行之后插入：

```css
.gcard img.portrait-illust,
#picked img.portrait-illust,
.portrait img.portrait-illust,
.modal img.portrait-illust{image-rendering:auto}
```

不改已有的 `pixelated`、`object-fit` 和 `object-position`。不改卡宽、148px 图高、96px 与 72px 肖像宽。

- [ ] **Step 7: 确认四条选择器都在**

```bash
node << 'JS'
const fs = require('fs');
const s = fs.readFileSync('style.css', 'utf8');
const block = `.gcard img.portrait-illust,
#picked img.portrait-illust,
.portrait img.portrait-illust,
.modal img.portrait-illust{image-rendering:auto}`;
if (!s.includes(block)) { console.error('css block'); process.exit(1); }
if (!s.includes('image-rendering:pixelated')) { console.error('lost pixelated'); process.exit(1); }
console.log('css ok');
JS
```

Expected: `css ok`，退出码 0。

- [ ] **Step 8: 提交 style.css**

```bash
git add style.css
git diff --cached --name-only
git commit -m "feat: 插画立绘关闭像素缩放"
```

Expected: 暂存名单只有 `style.css`。

- [ ] **Step 9: 先确认两处文案还是旧句子**

```bash
node << 'JS'
const fs = require('fs');
const design = fs.readFileSync('DESIGN.md', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');
const oldDesign = '像素立绘继续 `image-rendering: pixelated`，`object-fit: cover`，`object-position: center`。';
const oldImg = '<img alt="曹操" src="assets/portraits/caocao.svg">';
const oldReadme = '原创三国主题 1v1 人机卡牌对战（浏览器）。16 位武将、原创技能与卡牌、卡通像素立绘（`tools/portraits.js` 生成）。';
if (!design.includes(oldDesign) || !design.includes(oldImg) || !readme.includes(oldReadme)) {
  console.error('docs already changed');
  process.exit(1);
}
console.log('docs still old');
process.exit(1);
JS
```

Expected: `docs still old`，退出码 1。

- [ ] **Step 10: 改 DESIGN.md 两处和 README.md 一行**

`DESIGN.md` 里把：

```markdown
- 像素立绘继续 `image-rendering: pixelated`，`object-fit: cover`，`object-position: center`。
```

换成：

```markdown
- 像素立绘继续 `image-rendering: pixelated`，`object-fit: cover`，`object-position: center`。`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo` 的 `img` 带 `portrait-illust`，`image-rendering` 为 `auto`。其余立绘仍是 `pixelated`。
```

同一文件里把：

```html
  <img alt="曹操" src="assets/portraits/caocao.svg">
```

换成：

```html
  <img alt="曹操" class="portrait-illust" src="assets/portraits/caocao.png">
```

`README.md` 第 2 行整行换成：

```markdown
原创三国主题 1v1 人机卡牌对战（浏览器）。16 位武将、原创技能与卡牌。caocao、guanyu、zhouyu、lvbu、zhugeliang、diaochan、dianwei、huatuo 使用活泼半写实插画 PNG，其余武将仍用 `tools/portraits.js` 生成的卡通像素 SVG。
```

保留「16 位武将」这句，不要改成 96。不要改 `README.md` 的其余行。

- [ ] **Step 11: 确认文案已经换成新句子**

```bash
node << 'JS'
const fs = require('fs');
const design = fs.readFileSync('DESIGN.md', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');
const sentence = '`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo` 的 `img` 带 `portrait-illust`，`image-rendering` 为 `auto`。其余立绘仍是 `pixelated`。';
const img = '<img alt="曹操" class="portrait-illust" src="assets/portraits/caocao.png">';
const line = '原创三国主题 1v1 人机卡牌对战（浏览器）。16 位武将、原创技能与卡牌。caocao、guanyu、zhouyu、lvbu、zhugeliang、diaochan、dianwei、huatuo 使用活泼半写实插画 PNG，其余武将仍用 `tools/portraits.js` 生成的卡通像素 SVG。';
if (!design.includes(sentence) || !design.includes(img)) { console.error('design'); process.exit(1); }
if (!readme.split('\n').includes(line)) { console.error('readme'); process.exit(1); }
if (design.includes('assets/portraits/caocao.svg')) { console.error('old example'); process.exit(1); }
console.log('docs ok');
JS
```

Expected: `docs ok`，退出码 0。

- [ ] **Step 12: 提交两份说明**

```bash
git add DESIGN.md README.md
git diff --cached --name-only
git commit -m "docs: 写明 8 张插画立绘的显示约定"
```

Expected: 暂存名单只有 `DESIGN.md` 和 `README.md`。

### Task 4: 验收

**Files:**

- Read: `assets/portraits/caocao.png`
- Read: `assets/portraits/guanyu.png`
- Read: `assets/portraits/zhouyu.png`
- Read: `assets/portraits/lvbu.png`
- Read: `assets/portraits/zhugeliang.png`
- Read: `assets/portraits/diaochan.png`
- Read: `assets/portraits/dianwei.png`
- Read: `assets/portraits/huatuo.png`
- Read: `game.js`
- Read: `style.css`
- Test: `node tools/sim.js 1`，以及本机静态页。不新增测试文件。

**Interfaces:**

- Consumes: Task 1 到 Task 3 的 PNG、`portraitImg` 和 `portrait-illust`。
- Produces: 验收记录。本任务默认不产生提交。发现必须修改时，只改出错的那一个实现文件并另提交，仍然不合并到 `main`。

- [ ] **Step 1: 核对 8 个 PNG 的 IHDR 和体积**

```bash
node << 'JS'
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

- [ ] **Step 2: 确认没有改 SVG、生成脚本和规则数据**

```bash
git diff --name-only origin/main -- tools/portraits.js 'assets/portraits/*.svg' data/generals.js data/cards.js index.html BALANCE.md
```

Expected: 无输出。若有输出，停止。不要把这些文件收进实现提交。

- [ ] **Step 3: 跑一局模拟并还原结果文件**

```bash
node tools/sim.js 1
git diff --name-only -- tools/sim-result.json
```

Expected: 模拟输出的最后一行里有 `errors=0`。若 `tools/sim-result.json` 出现在 diff 里，执行 `git checkout -- tools/sim-result.json`，然后再跑一次 `git diff --name-only -- tools/sim-result.json`，预期无输出。不要提交这个 JSON。

- [ ] **Step 4: 用静态页核对 PNG 优先和 SVG 回退**

在仓库根目录启动一次性静态服务，不把这段脚本写入仓库：

```bash
node << 'JS'
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = process.cwd();
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
  const file = path.resolve(root, rel);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200); res.end(data);
  });
}).listen(8765, '127.0.0.1');
JS
```

浏览器打开 `http://127.0.0.1:8765/`。在控制台依次执行，并看网络面板：

```javascript
selectScreen(['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo'])
```

Expected: 8 张卡的 `src` 都以 `.png` 结尾，没有这 8 个 PNG 的 404。

```javascript
selectScreen(['zhangliao','liubei','sunquan','zhangfei','simayi','xiahoudun','ganning','yuanshao'])
```

Expected: 8 张卡的 `src` 都以 `.svg` 结尾，且没有发出 `.png` 请求。

```javascript
start(GENERALS.find(g=>g.id==='caocao'), GENERALS.find(g=>g.id==='lvbu'), false)
```

Expected: `#ai` 和 `#me` 里的立绘 `src` 都以 `.png` 结尾，并且带 `portrait-illust`。

在开发者工具里把曹操座位图的 `src` 改成 `assets/portraits/caocao.png.bak`。Expected: 它换成 `assets/portraits/caocao.svg`，并失去 `portrait-illust`。刷新后恢复 PNG。不要把改坏的地址提交进仓库。

把浏览器宽度设为 1280 和 360 各看一次。360 宽时 `.portrait` 为 72px。每张试点选将卡上都能分开两眼、鼻子和嘴。势力芯片不盖住任何一只眼睛。

看完后结束占用 8765 端口的 node 进程。

- [ ] **Step 5: 保持 PR 打开，不合并**

不要执行合并。不要把 `cursor/lively-portrait-pilot-design-0861` 合并进 `main`。PR #3 保持打开，留给用户合并。

本步骤不产生提交，除非 Step 1 到 Step 4 发现必须修改的实现错误。那种提交仍然只碰出错的 PNG、`game.js`、`style.css`、`DESIGN.md` 或 `README.md`，然后回到失败的那一步重跑。修完也不合并。
