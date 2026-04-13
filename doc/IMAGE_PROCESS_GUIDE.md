# 图片批量处理操作手册

本文档记录 `res/process/` 下图片资源的处理流程，包括批量缩放、从原始大图生成、从截图提取等操作。

---

## 一、文件夹结构

```
res/process/
├── v1/              # 640 张已有图片（大小合适，作为基准参考）
├── v2/              # 491 张新增图片（处理后的最终结果）
├── v2_backup/       # v2 处理前的备份
├── init/            # 1045 张原始大图（1024×1024 或 1024×1536）
├── v1_scale_report.csv   # v1 填充比报告
└── v2_scale_report.csv   # v2 缩放处理报告
```

---

## 二、基准数据（基于 v1 的 640 张图片，画布 200×240）

| 指标 | P10 | P25 | 中位 | P75 | P90 | 极值 |
|------|-----|-----|------|-----|-----|------|
| 内容宽度 | 105 | 119 | 137 | 153 | 164 | max=188 |
| 内容高度 | 108 | 126 | 142 | 157 | 169 | max=213 |
| 填充比 | 30% | 34% | 38% | 44% | 49% | max=59% |
| 最小水平边距 | — | — | — | — | — | min=6px |
| 最小垂直边距 | — | — | — | — | — | min=13px |
| 内容中心 X | 99.5 | — | 100.5 | — | 102.5 | — |
| 内容中心 Y | 119.0 | — | 120.0 | — | 123.0 | — |

---

## 三、操作类型

### 操作A：批量缩放 v2 图片

**场景**：v2 中图片元素偏小，需要统一放大到 v1 标准。

**规则**：
1. 目标填充比：**38%**（v1 中位数）
2. 已达标（≥ 34%，v1 P25）的图片跳过
3. 缩放因子 < 1.05 的跳过（变化太小）
4. 硬限制：内容宽度 ≤ 188px，内容高度 ≤ 213px
5. 等比缩放（保持宽高比）
6. 内容居中对齐画布中心 (100, 120)

**脚本**：

```python
from PIL import Image
import os, math

CANVAS_W, CANVAS_H = 200, 240
TARGET_RATIO = 0.38
SKIP_THRESHOLD = 0.34
MIN_SCALE = 1.05
MAX_CW, MAX_CH = 188, 213
CENTER_X, CENTER_Y = 100, 120

v2_path = 'res/process/v2/'

for f in sorted(os.listdir(v2_path)):
    if not f.endswith('.png'): continue
    fpath = os.path.join(v2_path, f)
    img = Image.open(fpath).convert('RGBA')
    bbox = img.getbbox()
    if not bbox: continue

    cw = bbox[2] - bbox[0]
    ch = bbox[3] - bbox[1]
    current_ratio = (cw * ch) / (CANVAS_W * CANVAS_H)
    if current_ratio >= SKIP_THRESHOLD: continue

    scale = math.sqrt((TARGET_RATIO * CANVAS_W * CANVAS_H) / (cw * ch))
    if int(cw * scale) > MAX_CW:
        scale = min(scale, MAX_CW / cw)
    if int(ch * scale) > MAX_CH:
        scale = min(scale, MAX_CH / ch)
    if scale < MIN_SCALE: continue

    new_cw = int(cw * scale)
    new_ch = int(ch * scale)

    content = img.crop(bbox)
    content_scaled = content.resize((new_cw, new_ch), Image.LANCZOS)
    result = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    paste_x = max(0, min(CENTER_X - new_cw // 2, CANVAS_W - new_cw))
    paste_y = max(0, min(CENTER_Y - new_ch // 2, CANVAS_H - new_ch))
    result.paste(content_scaled, (paste_x, paste_y))
    result.save(fpath)
```

---

### 操作B：从 init 大图生成 v2 图片

**场景**：v2 中某些图片放大后不够清晰，需要从 init 原始大图（1024×1024）重新缩放生成。

**注意事项**：
- init 图片可能有半透明光晕（alpha 1-10），需要用 `alpha > 10` 阈值过滤 bbox
- 裁切 bbox 时使用原图（保留柔和边缘），不使用 mask 后的图
- init 画布是正方形（1024×1024），v2 是长方形（200×240），必须等比缩放，不能拉伸

**脚本**：

```python
from PIL import Image
import math

CANVAS_W, CANVAS_H = 200, 240
TARGET_RATIO = 0.38
MAX_CW, MAX_CH = 188, 213
CENTER_X, CENTER_Y = 100, 120
ALPHA_THRESHOLD = 10

def process_from_init(init_path, output_path):
    img = Image.open(init_path).convert('RGBA')

    # 用 alpha 阈值过滤半透明光晕
    alpha = img.split()[3]
    mask = alpha.point(lambda p: 255 if p > ALPHA_THRESHOLD else 0)
    masked = Image.new('RGBA', img.size, (0, 0, 0, 0))
    masked.paste(img, mask=mask)
    bbox = masked.getbbox()
    if not bbox: return

    # 从原图裁切（保留柔和边缘）
    content = img.crop(bbox)
    cw, ch = content.size

    # 等比缩放到目标填充比
    scale = math.sqrt((TARGET_RATIO * CANVAS_W * CANVAS_H) / (cw * ch))
    if int(cw * scale) > MAX_CW:
        scale = MAX_CW / cw
    if int(ch * scale) > MAX_CH:
        scale = MAX_CH / ch
    new_cw = int(cw * scale)
    new_ch = int(ch * scale)

    content_scaled = content.resize((new_cw, new_ch), Image.LANCZOS)
    result = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    result.paste(content_scaled, (CENTER_X - new_cw // 2, CENTER_Y - new_ch // 2))
    result.save(output_path)

# 示例：
# process_from_init('res/process/init/Animals_Monkey_5.png',
#                    'res/process/v2/Animals_Monkey_5.png')
```

---

### 操作C：按参考图尺寸缩放（同类型图片对齐）

**场景**：同类型的图片（如圆形风景图）需要保持一致大小，以某张 v1 图片为基准缩放。

**示例**：Park_Pathway_6 对齐 egypt_nileriver_6。

**脚本**：

```python
from PIL import Image

def scale_to_reference(src_path, ref_path, output_path):
    ref = Image.open(ref_path).convert('RGBA')
    img = Image.open(src_path).convert('RGBA')

    ref_bbox = ref.getbbox()
    ref_cw = ref_bbox[2] - ref_bbox[0]
    ref_ch = ref_bbox[3] - ref_bbox[1]

    img_bbox = img.getbbox()
    content = img.crop(img_bbox)
    cw, ch = content.size

    # 等比缩放到参考图大小
    scale = min(ref_cw / cw, ref_ch / ch)
    new_cw = int(cw * scale)
    new_ch = int(ch * scale)

    content_scaled = content.resize((new_cw, new_ch), Image.LANCZOS)
    result = Image.new('RGBA', (200, 240), (0, 0, 0, 0))
    # 对齐参考图的中心位置
    ref_cx = (ref_bbox[0] + ref_bbox[2]) // 2
    ref_cy = (ref_bbox[1] + ref_bbox[3]) // 2
    result.paste(content_scaled, (ref_cx - new_cw // 2, ref_cy - new_ch // 2))
    result.save(output_path)

# 示例：
# scale_to_reference('res/process/v2/Park_Pathway_6.png',
#                     'res/process/v1/egypt_nileriver_6.png',
#                     'res/process/v2/Park_Pathway_6.png')
```

---

### 操作D：从截图/大图中提取元素生成新图片

**场景**：收到一张包含游戏元素的截图或大图，需要去掉背景，提取元素，生成标准尺寸的卡牌图片。

**步骤**：

1. **去除白色/浅色背景**：从图片边缘 flood fill 透明化
2. **裁切内容区域**：用 alpha 阈值获取 bbox
3. **等比缩放到目标填充比**：与操作A相同的规则
4. **居中贴到 200×240 画布**

**脚本**：

```python
from PIL import Image
import math

CANVAS_W, CANVAS_H = 200, 240
TARGET_RATIO = 0.38
MAX_CW, MAX_CH = 188, 213
CENTER_X, CENTER_Y = 100, 120

def extract_from_screenshot(src_path, output_path, bg_tolerance=20):
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size
    pixels = img.load()

    # 获取背景色（四角平均）
    corners = [pixels[2,2], pixels[w-3,2], pixels[2,h-3], pixels[w-3,h-3]]
    bg_r = sum(c[0] for c in corners) // 4
    bg_g = sum(c[1] for c in corners) // 4
    bg_b = sum(c[2] for c in corners) // 4
    bg_color = (bg_r, bg_g, bg_b)

    # 如果图片有卡片边框，先裁掉外边距（约 5-7% 的边缘区域）
    margin = int(min(w, h) * 0.07)
    inner = img.crop((margin, margin, w - margin, h - margin))
    iw, ih = inner.size
    inner_pixels = inner.load()

    # Flood fill 从边缘开始
    visited = set()
    queue = []
    for x in range(iw):
        queue.append((x, 0))
        queue.append((x, ih - 1))
    for y in range(ih):
        queue.append((0, y))
        queue.append((iw - 1, y))

    result = inner.copy()
    result_pixels = result.load()

    def color_dist(c1, c2):
        return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])))

    while queue:
        x, y = queue.pop(0)
        if (x, y) in visited: continue
        if x < 0 or x >= iw or y < 0 or y >= ih: continue
        visited.add((x, y))

        r, g, b, a = inner_pixels[x, y]
        if color_dist((r, g, b), bg_color) <= bg_tolerance:
            result_pixels[x, y] = (0, 0, 0, 0)
            for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < iw and 0 <= ny < ih and (nx, ny) not in visited:
                    queue.append((nx, ny))

    # 获取内容 bbox（alpha > 10 过滤碎片）
    alpha = result.split()[3]
    mask = alpha.point(lambda p: 255 if p > 10 else 0)
    masked = Image.new('RGBA', result.size, (0, 0, 0, 0))
    masked.paste(result, mask=mask)
    bbox = masked.getbbox()
    if not bbox: return

    content = result.crop(bbox)
    cw, ch = content.size

    # 等比缩放到目标填充比
    scale = math.sqrt((TARGET_RATIO * CANVAS_W * CANVAS_H) / (cw * ch))
    if int(cw * scale) > MAX_CW:
        scale = MAX_CW / cw
    if int(ch * scale) > MAX_CH:
        scale = MAX_CH / ch
    new_cw = int(cw * scale)
    new_ch = int(ch * scale)

    content_scaled = content.resize((new_cw, new_ch), Image.LANCZOS)
    canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas.paste(content_scaled, (CENTER_X - new_cw // 2, CENTER_Y - new_ch // 2))
    canvas.save(output_path)

# 示例：
# extract_from_screenshot('res/process/20260410-175709.png',
#                          'res/process/v2/Animals_Sheep_9.png')
```

---

## 四、处理结果统计（2026-04-10）

### 批量缩放（操作A）

| 统计项 | 数值 |
|--------|------|
| 总处理 | 485 张 |
| 跳过（已达标）| 6 张 |
| 碰到宽度上限 | 5 张 |
| 碰到高度上限 | 3 张 |
| 处理后平均填充比 | 37.62% |
| 平均缩放倍率 | x1.31 |
| 最大缩放倍率 | x1.82 |

### 跳过的图片（已达标）

| 文件名 | 填充比 |
|--------|--------|
| Cuties_Lamb_3.png | 37.69% |
| Cuties_Calf_4.png | 37.28% |
| Cuties_Foal_6.png | 36.23% |
| Bouquet_Filler_5.png | 35.95% |
| Hoof_Moose_6.png | 35.48% |
| Cuties_Cygnet_8.png | 34.42% |

### 受限图片（无法达到38%）

| 文件名 | 原填充比 | 调整后 | 受限 |
|--------|----------|--------|------|
| Straight_Pole_5.png | 6.58% | 21.74% | 高度 |
| Glasses_Sunglasses_1.png | 12.30% | 28.59% | 宽度 |
| Awards_Oscar_1.png | 11.82% | 31.95% | 高度 |
| Grandma_Grandmaglasses_3.png | 12.81% | 33.29% | 宽度 |
| Passion_Score_3.png | 15.75% | 34.86% | 宽度 |
| Singer_Musicnotes_4.png | 16.66% | 35.25% | 宽度 |
| Reporter_Audiorecorder_1.png | 11.50% | 35.94% | 高度 |
| Glasses_Safety_4.png | 15.00% | 36.82% | 宽度 |

---

## 五、注意事项

1. **处理前务必备份**：`cp -r res/process/v2 res/process/v2_backup`
2. **init 大图有半透明光晕**：`getbbox()` 会包含 alpha=1~10 的不可见像素，必须用 `alpha > 10` 阈值过滤
3. **init 是正方形（1024×1024），v2 是长方形（200×240）**：缩放时必须等比缩放，不能直接 resize 到目标 bbox，否则会变形
4. **截图可能有卡片边框**：裁掉外边距 7% 后再 flood fill 去背景
5. **同类型图片对齐**：圆形风景图等同类型图片，建议用操作C按参考图对齐，而非统一 38% 目标
6. **详细报告**：`v1_scale_report.csv` 和 `v2_scale_report.csv` 记录了每张图片的填充比数据

---

*文档生成日期：2026-04-10*
