# Solitaire Tile Bingo - 项目文档与开发追踪

> 创建日期: 2026-03-11
> 最后更新: 2026-03-16
> 当前分支: `feature/SAJLike`

---

## 一、项目概述

**Solitaire Tile Bingo** 是一款基于浏览器的卡牌匹配益智游戏，采用传统纸牌接龙（Solitaire）风格。

**核心玩法（SAJLike v7.0）：**
- 桌面区若干列叠牌，每列底牌翻开、其余扣着
- 拖动卡牌到收集卡槽匹配类别，或在列间移动
- 同类别基础牌互叠，金卡封顶列
- 步数限制：翻牌=1步，拖动=1步，回收=1步
- 所有类别收集完毕即为过关，共 108 关

---

## 二、技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端页面 | HTML5 + CSS3 + 原生 JavaScript | 无框架依赖 |
| 游戏逻辑 | game.js (~1,900 行) | DOM 操作 + 事件处理 |
| 数据生成 | Python 3 + openpyxl | 从 Excel 生成游戏数据 |
| 数据格式 | Excel → JSON / JS | Excel 为单一数据源 |
| 资源文件 | PNG 图片 (~200+) | 卡牌图像与 UI 元素 |

---

## 三、目录结构

```
solitaire-tile-bingo/
├── .claude/                    # Claude Code 配置
│   ├── settings.local.json    # 项目权限设置
│   └── translation_guide.md   # 翻译工作流文档
├── config/                     # 游戏配置文件（数据源）
│   ├── level_config_v2.xlsx   # 关卡参数 + 卡牌定义 (108 关，2 sheets)
│   ├── sort_game_basic_card_config.csv   # 基础卡牌定义参考
│   ├── sort_game_category_card_config.csv # 类别定义参考
│   └── basictranslate/ & categorytranslate/  # 翻译参考资料
├── level/                      # 生成的关卡 JSON 文件
│   └── level_1.json ~ level_108.json
├── res/                        # 游戏资源
│   ├── Item/                   # 卡牌图片 (~200+ PNG, 80 前缀)
│   └── Panel/                  # UI 面板图片
├── bug/                        # Bug 截图记录
│
├── index.html                  # 游戏入口页面
├── game.js                     # 主游戏逻辑 (~1,900 行)
├── level_settings.js           # 关卡配置参数 (108 关，自动生成)
├── level_card_defs.js          # 关卡卡牌定义 (108 关，自动生成)
├── style.css                   # 游戏样式 (~1,000 行)
│
├── converter.html              # 关卡配置转换工具
├── generator.html              # 关卡生成工具 (浏览器端 DFS 求解)
│
├── generate_levels.py          # 关卡生成主脚本 (读 v2 Excel → JSON/JS)
└── translate_cards.py          # 多语言翻译脚本
```

---

## 四、核心文件说明

### 4.1 游戏前端

| 文件 | 功能 |
|------|------|
| `index.html` | 游戏主页面，包含桌面列区、手牌区、收集卡槽、步数条等 UI 组件 |
| `game.js` | 核心游戏逻辑：拖拽操作、列间移动、类别匹配、步数控制、关卡加载、撤销、提示 |
| `level_settings.js` | 108 关参数（maxSlots, numColumns, columnSizes, maxSteps），自动生成 |
| `level_card_defs.js` | 108 关卡牌定义（类别名、单词、图片路径、中文翻译），自动生成 |
| `style.css` | 游戏样式，包含桌面列、卡牌堆叠、拖拽动画、弹窗样式 |

### 4.2 数据生成脚本

| 脚本 | 输入 | 输出 | 功能 |
|------|------|------|------|
| `generate_levels.py` | level_config_v2.xlsx, res/Item/*.png | `level/*.json`, `level_settings.js`, `level_card_defs.js` | 主生成脚本：关卡 JSON + 配置 JS + 卡牌定义 JS |
| `translate_cards.py` | 翻译字典 | 更新 CSV 文件 | 为 18 种语言生成卡牌名称翻译 |

### 4.3 配置文件

| 文件 | 格式 | 内容 |
|------|------|------|
| `level_config_v2.xlsx` (level sheet) | xlsx | 关卡参数：收集槽数、桌面列尺寸、类别数、步数 |
| `level_config_v2.xlsx` (card sheet) | xlsx | 每关卡牌定义：类别名、图片/文字类型、单词列表、中文翻译 |

---

## 五、游戏机制详解（SAJLike v7.0）

### 5.1 卡牌类型
- **Regular (常规卡)**: 属于某类别的基础牌，拖到对应卡槽收集
- **Gold (金卡/类别卡)**: 拖到空卡槽开启新的类别收集目标，封顶列（不可再叠）

### 5.2 桌面区
- 若干列叠牌（3-5 列），每列底牌翻开、其余扣着
- 移走底牌后自动翻开下一张
- 同类别牌可互叠，空列可放任意牌
- 拖动时自动扩展：连续同类别翻开牌一起拖走

### 5.3 手牌区
- 手牌堆（face-down）每次翻 1 张到展示区
- 展示区顶牌可拖到卡槽或桌面列
- 翻完可回收（最多 3 次），回收消耗 1 步

### 5.4 收集卡槽
- 金卡拖到空槽 → 开启该类别收集
- 基础牌拖到对应类别槽 → 收集计数 +1
- 类别全部收集完 → 卡槽释放
- 所有类别完成 → 过关

### 5.5 步数系统
- 翻牌 = 1 步，拖动（成功）= 1 步，回收 = 1 步，失败拖动 = 0 步
- `maxSteps` 由 Excel 配置（level_config_v2.xlsx Column 8）

### 5.6 关卡难度递进（108 关）
| 参数 | 简单关 | 中等关 | 高难度关 |
|------|--------|--------|---------|
| 卡槽数 | 3 | 4 | 5 |
| 列数 | 3 | 4 | 5 |
| 类别数 | 4-6 | 10 | 12-15 |
| 列尺寸 | 2-5 | 4-7 | 5-9 |

---

## 六、多语言支持

**已支持 18 种语言：**

| 语言 | 代码 | 语言 | 代码 |
|------|------|------|------|
| 法语 | FR | 意大利语 | IT |
| 德语 | DE | 波兰语 | PL |
| 西班牙语 | ES | 土耳其语 | TR |
| 葡萄牙语 | PT | 俄语 | RU |
| 泰语 | TH | 罗马尼亚语 | RO |
| 印尼语 | ID | 繁体中文 | ZH-TW |
| 荷兰语 | NL | 丹麦语 | DA |
| 日语 | JA | 乌克兰语 | UK |
|  |  | 简体中文 | ZH-CN |

**翻译注意事项：**
- 支持上下文感知翻译（如 "Lime" 在 "Citrus" 和 "Mineral" 中含义不同）
- 防碰撞规则：同类别内不能有重复翻译，类别卡与其子卡不能重名

---

## 七、关卡 JSON 结构

```json
[
  {
    "config": {
      "maxSlots": 4,
      "maxSteps": 128
    },
    "tableau": [
      [
        { "card": { "type": "regular", "category": "Seafood", "name": "Squid", "image": "res/Item/seafood_squid_7.png", "isText": false }, "faceUp": false },
        { "card": { "type": "gold", "category": "Seafood", "name": "Seafood", "isText": false }, "faceUp": true }
      ]
    ],
    "categoryTargets": { "Seafood": 5, "Garments_word": 4 },
    "handPile": [{ "type": "regular", "category": "Garments_word", "name": "Jacket", "isText": true }],
    "handDisplay": []
  }
]
```

**说明：**
- 每个 JSON 文件包含多个布局（数组），游戏随机选一个
- `tableau`: 二维数组，外层=列，内层=牌（底部到顶部），每牌有 `faceUp` 标记
- `categoryTargets`: 类别 key → 需收集数量（图片类别用 `categoryName`，文字类别用 `categoryName_word`）
- `handPile`: 手牌堆（初始 face-down）
- `config.maxSteps`: 从 Excel 配置读取的步数上限

---

## 八、开发工具

| 工具 | 入口 | 用途 |
|------|------|------|
| 关卡转换器 | `converter.html` | 将 Excel 配置转换为可测试的关卡数据 |
| 关卡生成器 | `generator.html` | Web 端关卡生成与预览 |

---

## 九、开发日志

### 2026-03-16 - MCTS 求解器替换 DFS 求解器

- **需求**: DFS 求解器按固定优先级找第一条可行路径就停止，`stepsUsed` 远大于最优解。用 MCTS（蒙特卡洛树搜索）替换，得到更接近最优的步数
- **改动文件**:
  - `generate_levels.py`: `verify_solvable()` 内部 `solve()` 替换为 MCTS 主循环（MCTSNode 类 + UCB1 选择 + 带权重随机 rollout + 回传），新增 `--mcts-iterations` 参数（默认 5000）
  - `generator.html`: `verifySolvable()` 同步改为 MCTS（JS 版），UI 新增 "MCTS Iterations" 输入框
- **算法要点**:
  - SELECT: UCB1 (C=√2) 选最优子节点
  - EXPAND: 延迟初始化 + 随机化展开顺序
  - SIMULATE: 加权随机 rollout（收集→10, 翻暗牌列间移→5, 手牌到列/翻手牌→2, 其他→1）
  - BACKPROPAGATE: 胜率 + 步数累计
  - 状态管理: apply/undo 复用现有机制，单份 state 无深拷贝
- **不变部分**: 函数签名、返回值格式 `{solvable, nodesExplored, stepsUsed}`、调用方代码、UI 布局
- **节点上限**: 200 万（MAX_NODES），防极端情况

### 2026-03-16 - 步数配置读取 + DFS 求解器步数范围验证

- **需求**: `maxSteps` 改为从 Excel 配置读取（不再用 `totalCards × 3` 公式），DFS 求解器增加步数范围验证
- **改动**:

#### generate_levels.py
- `read_level_sheet()`: 新增读取 Column 8 `maxSteps` 字段
- `generate_settings_js()`: `maxSteps` 改为 `cfg['maxSteps']`（从 Excel 读取）
- `verify_solvable()`: 返回值新增 `stepsUsed`（实际使用步数）
- 主循环: 增加步数范围校验（`--step-min-ratio` / `--step-max-ratio`），不在范围内的布局 `continue`
- 新增命令行参数: `--step-min-ratio`（默认 0.0）、`--step-max-ratio`（默认 1.0）

#### generator.html
- UI: 新增 Step Min Ratio / Step Max Ratio 输入框
- `verifySolvable()`: 返回 `stepsUsed`
- `generateSolvableLayout()`: `maxSteps` 改为 `config.maxSteps`（来自 level_settings.js），增加步数范围校验
- 日志: 显示 `stepsUsed/maxSteps` 步数信息

#### level_settings.js（重新生成）
- `maxSteps` 值来自 Excel Column 8（如 L1=999, L2=65, L3=128），不再是 totalCards×3

---

### 2026-03-16 - 同类别多牌默认一起拖动

- **需求**: 同一类别多张牌叠在一起时，拖动默认将所有同类别牌一起拖动
- **之前**: 点击某张牌，拖动该牌及其上方所有牌
- **之后**: 点击某张牌时，自动向下扩展查找连续的同类别翻开牌，全部纳入拖拽范围
- **示例**: 一列中有 `[暗牌, catA, catA, catA]`，点击最上面的 catA → 自动拖起全部 3 张 catA

#### game.js
- `onDragStart()`: 确定 `posIdx` 后，向下遍历查找连续同 `category` 且 `faceUp` 的牌，将 `posIdx` 扩展到最深同类别位置
- `sourceEl` 同步更新为扩展后位置的 DOM 元素
- `dragCount` / 多牌 clone / drop 处理无需修改（自动适配扩展后的 posIdx）

---

### 2026-03-16 - 提示逻辑优化

- **改动1**: 桌面列间移动提示（Priority 5）
  - 之前：只提示能翻开暗牌的列间移动
  - 之后：任何可行的列间移动都会提示
- **改动2**: 手牌到桌面提示（Priority 4）优先级细化
  - 之前：不区分有牌列和空列，找到第一个可放置的列就提示
  - 之后：优先寻找有牌的列，找不到再提示空列

#### game.js
- `showHint()` Priority 4: 分两轮查找（non-empty → empty）
- `showHint()` Priority 5: 移除 `startPos > 0 && !col[startPos - 1].faceUp` 条件

---

### 2026-03-16 - 图片类别中文名适配

- **问题**: 204个图片类别映射到80个图片前缀，部分类别中文名与实际显示的图片内容不匹配
- **方案**: 修改中文类别名以匹配实际图片内容（如 Arctic→"太空"、Police→"牛仔"、Pig→"小狗"等）
- **修改**: 49处类别中文名 + 2处碰撞修复（L6 Movement "运动"→"移动"、L23 Cuties "小狗"→"狗狗"）+ L9 Compass "指南针"→"符号" + L3 Museum/Picture "图画"→"画作"

#### level_config_v2.xlsx
- 52处中文类别名/翻译修改

#### level_card_defs.js（重新生成）
- 108关类别名更新

---

### 2026-03-16 - generator.html 修复 [object Object] 问题

- **问题**: `level_card_defs.js` 中文字类别 cardWords 格式从纯字符串改为 `{name, zh}` 对象后，generator.html 生成关卡 JSON 时直接将对象写入 `card.name`，导致游戏显示 `[object Object]`
- **修复**: generator.html 第185行，文字类别卡牌用 `typeof word === 'string' ? word : word.name` 兼容两种格式

#### generator.html
- `generateCards()` 文字类别正则提取 `.name` 字段

---

### 2026-03-16 - 翻译语义校对（第二轮）

- **问题**: 部分中文翻译与所属类别语义不匹配（英文原数据归类宽泛，中文直译后更明显）
- **修改**: 13 处，含 5 处语义修正 + 6 处漏翻补充 + 2 处漏翻补充
  - L9 Snow: `Iceberg 冰山→雪堆`（冰山不属于雪）
  - L37 Light: `Garland 花环→灯串`（Light类别应指灯光）
  - L38 Big: 6个词漏翻（Gigantic→巨大的、Massive→庞大的、Colossal→宏伟的、Vast→辽阔的、Immense→无穷的、Sizable→相当大的）
  - L53 Dislike: `Fear 害怕→畏惧`、`Anger 愤怒→不满`、`Dismiss/Spurn 漏翻→漠视/唾弃`
  - L76 Frost: `Bite 咬伤→冻伤`（frostbite 应译为冻伤）
- **碰撞检查**: 无 Rule A / Rule B 冲突

#### level_config_v2.xlsx
- 13 处翻译直接在 Excel 中修改

#### level_card_defs.js（重新生成）
- 108 关翻译更新

---

### 2026-03-16 - 图片类别映射修正

- **问题**: 图片类别（204个）映射到 `res/Item/` 图片前缀（80个）时，大量使用随机分配，导致显示的图片与类别内容不对应（如"Wardrobe"显示餐具图片、"Transport"显示糖果图片）
- **解决**: 在 `generate_levels.py` 中为全部 204 个图片类别手动指定最佳匹配前缀

#### generate_levels.py
- `IMAGE_CATEGORY_MAP` 从 19 条 → 208 条（覆盖全部图片类别）
- `IMAGE_MATCH_MODE` 同步扩展
- 68 个直接匹配（类别名与前缀名一致或高度匹配）
- 136 个近似匹配（选择最相关的前缀，如 Cowboy→western、Japan→chef、Monsters→halloween）
- 4 个遗漏类别补充：Park→lawn、Pig→dogs、Tools→tools、Gift→birthday
- 消除所有 "Auto-mapped" 和 "Warning" 输出

#### level_card_defs.js（重新生成）
- 108 关全部图片路径更新为正确映射的前缀

---

### 2026-03-16 - 中文翻译校对与数据源重构

- **需求**: 用户在 `level_config_v2.xlsx` card sheet 中补充了全部 108 关的中文翻译（类别中文 + 单词中文），需校对质量并接入生成管线
- **校对结果**:
  - 检查1（同类别内重复，规则A）：发现 47 处 → 全部修复
  - 检查2（类别牌与基础牌碰撞，规则B）：发现 39 处 → 全部修复
  - 级联冲突：修复过程中产生 10 处新冲突 → 全部修复
  - 共计修复 96 处翻译问题
  - 可疑字符检查：1 处（乍得=Chad，正确地名）
  - 繁简混用检查：无问题
  - 未翻译项：15 处，均为合理保留原文（DJ、Python、Java、SOS 等）
- **修复示例**:
  - Triumph/Victory→凯旋/胜利、Puma/Cougar→美洲狮/山狮、Wrench/Spanner→扳手/活动扳手
  - 类别"旅行"下 Trip→旅途、类别"密码"下 Password→口令、类别"囚犯"下 Inmate→在押犯

#### generate_levels.py
- `read_zh_translations()` 重写：从 CSV 文件读取 → 直接从 `level_config_v2.xlsx` card sheet 读取
  - Excel 为中文翻译的唯一数据源（不再依赖 basictranslate/categorytranslate CSV 和 zh_supplement CSV）
  - 新增 `image_zh_map` 按位置索引图片牌翻译（解决图片牌 name="0" 导致的 key 冲突）
  - 返回值从 3 元组 → 4 元组 `(basic_map, basic_fallback, category_map, image_zh_map)`

#### level_card_defs.js（重新生成）
- 108 关、5718 个单词全部有中文翻译，0 个空值
- 图片牌（如 90s 类别）也正确映射到各自中文名

#### level_config_v2.xlsx
- card sheet 新增列：类别中文（col 15）、中文-1~8（col 16-23）
- 96 处翻译质量问题已直接在 Excel 中修复

---

### 2026-03-16 - 游戏页面增加中文模式切换

- **需求**: 在游戏界面增加中文/英文切换按钮，切换后所有卡牌和类别名显示中文
- **翻译数据源**: `level_config_v2.xlsx` card sheet 中文列（后改为从 Excel 直接读取，见"中文翻译校对与数据源重构"条目）
- **改动文件**:

#### generate_levels.py
- 新增 `read_zh_translations(base_dir)` 函数：读取 zh-CN CSV，构建 `(en_name, category)→zh` 和 `categoryName→zh` 映射
- `generate_card_defs_js()` 增加 `zh_translations` 参数，输出 `zhCategoryName` 和 `zh` 字段

#### level_card_defs.js（重新生成）
- 所有条目增加 `zhCategoryName` 和 `zh` 字段（有翻译则填中文，无则空字符串）
- cardWords 统一为对象格式 `{ name, zh, image? }`

#### game.js
- 新增 `this.zhMode` 属性、`getDisplayName(card)` / `toggleZhMode()` / `injectZhNames(level)` 方法
- `injectZhNames()` 在 `startLevel()` 加载布局后执行，为所有卡牌注入 `card.zhName`
- 所有渲染点（`renderTableau` / `renderHandArea` / `_buildSlotWrapper`）使用 `getDisplayName()`
- slot 创建/undo 恢复时同步写入 `slot.zhName`

#### index.html
- 引入 `level_card_defs.js` 脚本
- header 区域添加 `#btn-zh` 按钮

#### style.css
- 新增 `#btn-zh` 基础样式 + `.active` 高亮态

---

### 2026-03-16 - 基于 level_config_v2.xlsx 重建关卡生成系统

- **操作**: 新增 `config/level_config_v2.xlsx`（108关完整定义），重写关卡生成管线
- **改动内容**:

#### generate_levels.py（完全重写）
- 读取 v2 Excel 两个 sheet：`level`（布局参数）、`card`（每关类别及卡牌）
- 图片映射系统：208 个图片类别 → res/Item 前缀映射（全覆盖手动指定）
- 图片类别全覆盖映射，无随机分配
- 牌数由配置完全决定：总牌数 = 金牌数 + 各类别单词数之和
- DFS 求解器（从 generator.html 移植）：MAX_NODES=500000, MAX_RECYCLES=3
- 主流程：每关最多 200 次随机洗牌 + DFS 验证可解性
- 新增 `--settings` 模式生成 level_settings.js
- 新增 `--levels` 参数指定生成范围，`--seed` 设置随机种子
- 新增 `--step-min-ratio` / `--step-max-ratio` 步数范围验证参数

#### level_settings.js（重新生成，108关）
- 移除 `cardsPerCategory` 字段（v2 中每个类别卡牌数不同）
- `maxSteps` 从 Excel Column 8 读取（后改为手动配置，见 2026-03-16 步数配置读取条目）
- `getLevelSettings()` 接口保持不变

#### 关卡 JSON（前 10 关验证通过）
- 10 关全部生成成功，DFS 验证可解
- 图片路径全部有效
- 类别 key 规则：图片类别 → `categoryName`，文字类别 → `categoryName_word`

---

### 2026-03-16 - generator.html 支持 v2 配置生成关卡

- **操作**: 让 generator.html 使用 v2 Excel 中的类别和卡牌定义，替代旧的 categories.js 随机选择方式

#### generate_levels.py（新增 --export-defs 模式）
- 新增 `--export-defs` 命令行参数
- 读取 v2 Excel，输出 `level_card_defs.js`（108关卡牌定义数据）
- 图片类别的卡牌在导出时即解析好 image 路径，浏览器端无需图片映射逻辑
- 文字类别 cardWords 为纯字符串数组，图片类别 cardWords 为 `{name, image}` 对象数组

#### level_card_defs.js（新建）
- 由 `python3 generate_levels.py --export-defs` 自动生成
- 包含 108 关的完整类别和卡牌定义
- generator.html 通过 `<script>` 引用

#### generator.html（重写生成逻辑）
- 移除对 `categories.js` 和 `color_settings.js` 的依赖
- 新增引用 `level_card_defs.js`
- `generateCards(level)` 从 LEVEL_CARD_DEFS 读取指定关卡的类别和卡牌
- `generateSolvableLayout()` 中 maxSteps 改为 config.maxSteps（来自 level_settings.js 配置值）
- UI: Start Level / Number of Levels 的 max 改为 108
- 日志输出类别名称列表，便于调试
- DFS 求解器保持不变

---

### 2026-03-13 - SAJLike 玩法改造（feature/SAJLike 分支）

- **操作**: 从 `feature/gameplay-overhaul` 分支出 `feature/SAJLike`，将游戏从 Mahjong金字塔+Bingo 改造为传统 Solitaire 风格
- **改动内容**:

#### 核心规则变更
- **桌面区**: 金字塔多层叠放 → 若干列叠牌（每列底牌翻开，其余扣着）
- **手牌堆**: 保留翻牌机制，回收从0步改为1步
- **收集卡槽**: 保留，先放类别牌再放基础牌
- **叠放规则**: 同类别基础牌互叠；类别牌可叠在对应基础牌上方（封顶，不可再叠）
- **空列**: 任意牌可放
- **多牌拖拽**: 可拖动列中任意翻开的牌，连带其上方所有牌一起移动；多牌可放到桌面列，也可放入收集卡槽（全部基础牌→已有对应卡槽；基础牌+顶部类别牌→空卡槽）
- **移除**: Bingo机制、Filler牌、金字塔覆盖关系

#### Phase 1: level_settings.js
- 移除 `bingosNeeded`, `numFillers`, `layout`（层mask）
- 新增 `numColumns`, `columnSizes`
- `getLevelSettings()` 返回 `totalColumnCards` 替代 `totalPositions`

#### Phase 2: index.html
- `#bingo-grid` → `#tableau`
- `#goals-bar` → `#steps-bar`（简化，移除 BINGO 元素）
- 布局顺序: header → steps → hand-area → collectors → tableau → bottom-bar

#### Phase 3: style.css
- 移除: `.pyramid-card`, `.cleared-mark-pyramid`, bingo动画/flash样式
- 新增: `#tableau`, `.tableau-column`, `.tableau-card`, `.empty-column`, `.sealed`
- face-down 卡片显示20px卡背

#### Phase 4: game.js (v7.0)
- 数据模型: `this.cards[]`/`this.cardMap{}` → `this.tableau[][]` (Array<Array<TableauCard>>)
- 移除: 覆盖关系、Bingo逻辑、金字塔渲染、filler处理
- 新增: `renderTableau()`, `canStackOnColumn()`, `autoFlipColumn()`, `_handleDropToColumn()`
- 拖拽目标: 收集卡槽 + 桌面列（含空列）
- **多牌拖拽**: 可从任意翻开位置拖起一叠牌；多牌可放到桌面列或收集卡槽（多张基础牌→已有对应卡槽批量收集；基础牌+顶部类别牌→空卡槽建槽+同时收集）
- 胜负: `completedCount >= numCategories`（所有类别收集完）
- 撤销: 新action类型 `move_tableau_to_slot/column`, `move_multi_tableau_to_slot/column`, `move_display_to_slot/column`
- 提示: 增加桌面列间多牌移动优先级

#### Phase 5: generate_levels.py
- 适配列格式: `tableau` 数组替代 `cards` + `layer/row/col`
- 移除 `bingosNeeded`, `numFillers` 相关

#### Phase 6: generator.html
- DFS求解器重写适配 solitaire 规则
- 牌分配改为列模式
- 移除 bingo 胜负条件

#### 额外: converter.html
- 同步适配 SAJLike 格式，输出 `tableau` 替代 `cards`

- **关卡JSON格式变更**:
  - 旧: `{ cards: [{layer,row,col,card}], config: {bingosNeeded, maxSlots, maxSteps} }`
  - 新: `{ tableau: [[{card,faceUp},...]], config: {maxSlots, maxSteps} }`

---

### 2026-03-12 - generator.html 关卡生成逻辑重构

- **操作**: 重写 `generator.html` 中的 `generateCards` 函数，优化卡牌布局生成策略
- **改动内容**:

#### 改动1: 策略性卡牌排序（替换纯随机混洗）
- **之前**: 所有卡牌全部混洗后随机分配到网格和手牌
- **之后**: 按策略排序后动态放置
  - 填充卡排在最前（先放置 → 沉入底层，且只放网格不进手牌）
  - 类别组按 maxSlots 分批，每批内随机选类别出牌
  - 每个类别内部：普通卡在前，金卡在最后
- **设计意图**: 填充卡不碍事，金卡散布在各层，普通卡交错分布

#### 改动2: 随机交错 + 连续出牌限制
- **之前**: round-robin 严格轮转，布局缺少随机性
- **之后**: 每批 maxSlots 个类别内随机选类别出牌，同类别最多连续 2 张
- **可调参数**: MAX_CONSECUTIVE=2（后续可调整为1或3）

#### 改动3: 动态网格放置（替换逐层顺序填充）
- **之前**: 按层从底到顶顺序填充
- **之后**: 初始可用位置=底层所有格子，随机选可用位置放入，当上层4张支撑卡就位后该位置加入候选

#### 改动4: 网格/手牌概率分配
- **之前**: 先填满网格，溢出进手牌（手牌与网格无关联）
- **之后**: 非填充卡按剩余容量比例概率分配到网格或手牌
  - 概率 = gridRemaining / (gridRemaining + handRemaining)
  - 手牌按分配先后顺序堆叠，不额外打乱
- **可调参数**: 概率分配方式（当前按剩余容量比例，备选固定比例如70/30）；手牌顺序（当前不打乱，备选最后再打乱）
- **设计意图**: 完成任何类别都需要网格和手牌配合

- **文档**: 详细流程记录在 `memory/level_generation.md`

---

### 2026-03-11 - 玩法大改方案确定（feature/gameplay-overhaul 分支）

- **操作**: 从 main 分支拉出 `feature/gameplay-overhaul` 分支，确定5项核心玩法改动
- **改动内容**:

#### 改动1: 混合卡牌类型
- **之前**: 5x5网格仅放基础牌(regular/filler)，手牌堆仅放类别金卡(gold)
- **之后**: 网格和手牌堆都可以放任何类型的牌

#### 改动2: 麻将式1盖4堆叠
- **之前**: 同位置1盖1（同一格子上下叠放）
- **之后**: 上层牌盖住下层相邻4张牌，(L,R,C)盖住(L-1,R,C)、(L-1,R,C+1)、(L-1,R+1,C)、(L-1,R+1,C+1)
- 层尺寸递减: Layer0=5x5, Layer1=4x4, Layer2=3x3, Layer3=2x2, Layer4=1x1

#### 改动3: 拖动操作替换点击
- **之前**: 点击卡牌自动匹配
- **之后**: 拖动卡牌到收集槽进行匹配，使用 Pointer Events API 统一鼠标和触摸
- 手牌堆翻牌保持点击操作

#### 改动4: 步数限制替换时间限制
- **之前**: 时间倒计时 + 错误扣时
- **之后**: 步数限制，翻牌=1步，成功拖动=1步，失败拖动=0步
- 关卡配置: `maxSteps` 替代 `timeLimit` + `penaltyTime`

#### 改动5: 统一匹配逻辑
- 金卡: 拖到空槽位创建新类别收集目标（来源不限网格/手牌）
- 基础牌: 拖到匹配类别的槽位（来源不限网格/手牌）
- Filler卡: 不可拖动放置

#### 实施阶段
| 阶段 | 内容 | 涉及文件 |
|------|------|----------|
| 1 | 步数限制替换时间 | game.js, level_settings.js, index.html, style.css |
| 2 | 混合卡牌类型 | game.js, generate_levels.py, generator.html |
| 3 | 麻将式1盖4堆叠 | game.js, level_settings.js, generator.html, converter.html |
| 4 | 拖动操作 | game.js, style.css |
| 5 | 统一匹配逻辑 | game.js |
| 6 | 集成测试+关卡重新生成 | 所有关卡JSON, generate_levels.py |

- **关卡JSON格式变更**:
  - 旧: `{ "bingosNeeded": 1, "maxSlots": 2, "timeLimit": 105, "penaltyTime": 2 }`
  - 新: `{ "bingosNeeded": 1, "maxSlots": 2, "maxSteps": 40 }`
- **状态**: 已实施完成，后续在 feature/SAJLike 分支上继续迭代

---

### 2026-03-11 - 项目文档初始化
- **操作**: 创建项目文档 `PROJECT_TRACKER.md`
- **内容**: 完整记录项目结构、技术栈、游戏机制、配置说明
- **当前状态**: 项目包含 40 个关卡，支持 18 种语言

### 2026-03-17 - 图片类别名批量重命名 & ±10关去重
- **问题**: Excel 中图片类别名（如 "Breads"）与实际图片前缀（如 "baking"）不一致，导致图片匹配依赖复杂的 `IMAGE_CATEGORY_MAP` 映射表（200+ 行）
- **方案**: 将 Excel 中 169 行图片类别名统一改为首字母大写的前缀名（如 Baking, Bird, Vegetable 等），中文名同步更新
- **代码改动**:
  - `generate_levels.py`: 删除 `IMAGE_CATEGORY_MAP`（280 行）和 `IMAGE_MATCH_MODE`，替换为 `get_image_prefix()` 函数（1 行）和 `IMAGE_RANDOM_PREFIXES` 集合
  - `resolve_image()` 函数大幅简化：不再需要 auto-assign、partial match 等复杂逻辑
- **±10关前缀去重**: 同一图片前缀不在相邻 ±10 关内重复出现
  - 检测到 52 处冲突，自动替换了 39 处（贪心算法，优先选择使用频率最低的替换前缀）
  - 替换后冲突归零
- **翻译修复**: Boggle "博格尔" → "拼字棋盘"（Level 12）
- **验证**: `--export-defs` 无 warning 生成 108 关

### 2026-03-17 - MCTS 求解器替换 DFS
- **问题**: DFS 求解器找到第一条可行路径即停止，`stepsUsed` 远大于实际最优解
- **改动**: `generate_levels.py` 和 `generator.html` 中的 `verify_solvable()` 内部 DFS 替换为 MCTS
  - UCB1 选择 + 贪心 rollout + 回传
  - 新增 `--mcts-iterations` CLI 参数（默认 5000）
  - `generator.html` 新增 MCTS Iterations UI 输入框
- **效果**: 求解步数更接近实际人工通关步数

### 2026-03-17 - 游戏功能调整
- **取消智能吸附**: 移除 `game.js` 中 collector 区域的 smart snap 逻辑
- **+10 Steps 续关**: game over 弹窗新增 "+10 Steps" 按钮（蓝色渐变），点击后增加 10 步继续游戏
- **翻译修复**: Bedtime→睡眠, Vehicles→交通工具, Hockey→冰球, Notch→缺口, Wardrobe→服装

### 2026-03-17 - 关卡初期体验优化（布局质量检查）
- **问题**: 部分关卡开局需要连续多次翻手牌才能操作，体验差
- **方案**: 在洗牌后、MCTS 求解前加入 3 项布局质量检查，不合格则重新洗牌
- **3 项检查条件**:
  1. **开局可操作**: 面朝上列牌间有同类别可叠放/金牌可入槽，或手牌前 2 张满足条件
  2. **前期流畅性**: 贪心模拟前 ~20 步，拖满 5 次前连续翻牌不超过 3 次
  3. **金牌可及性**: 至少 1 张金牌在面朝上位置或手牌前 5 张内
- **代码改动**:
  - `generate_levels.py`: 新增 `validate_layout()` + `try_greedy_drag()` 辅助函数，生成循环中 MCTS 前调用
  - `generator.html`: 新增 `validateLayout()` + `tryGreedyDrag()` JS 版，`generateSolvableLayout()` 中调用
- **性能影响**: 单次检查 <1ms，过滤不合格布局减少昂贵的 MCTS 调用，整体生成速度可能更快

### 2026-03-09 - 配置修改与回滚
- **操作**: 提交配置修改后进行了回滚 (git revert)
- **相关提交**: `f254810` → `734b1d5` (revert) → `28ffd1c` (再次提交)

### 2026-03-09 之前 - 第35关修改与配置同步
- **操作**: 上传第35关修改 (`a1229ae`)，同步配置 (`57d0f98`)

---

## 十、待办与已知问题

- `bug/` 文件夹中有 Bug 截图记录，需持续跟踪修复
- 翻译碰撞规则需持续验证（详见 `.claude/translation_guide.md`）

---

> **注意**: 此文档将随项目开发持续更新。每次重要修改（关卡调整、配置变更、Bug 修复、新功能等）都会在"开发日志"章节中记录。
