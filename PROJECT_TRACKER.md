# Solitaire Tile Bingo - 项目文档与开发追踪

> 创建日期: 2026-03-11
> 最后更新: 2026-04-02
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

### 2026-04-02 - 策略2求解器多项改进

- **同权重 tiebreak 规则**: 解决贪心 playout 在同权重 move 中随机选择导致走入死路的问题
  - 权重14: 随机
  - 权重10: 源列暗牌少优先（优先翻暗牌少的列）
  - 权重8: 金牌优先 → 源列暗牌少优先
  - 权重6: 桌面金牌优先 → 桌面牌暗牌少优先 → 手牌操作最后
  - 权重4: 归类(to_slot)优先于放列(to_column)，避免能直接归类时绕道浪费步数
  - 权重2: 桌面金牌批量 > 桌面金牌单张 > 手牌金牌 > 其余随机
- **multi 优先于 single**: 当同一列已生成 `tableau_multi_to_slot` 时，跳过该列的 `tableau_to_slot`（单张），避免拆分成多步浪费操作
- **generator.html 策略2改为纯贪心**: 不使用回溯，直接跑一遍权重最高的选择，200步上限，无论成功失败都输出路径到 solution log
- **generator.html 补齐 tableau_multi_to_column**: solveLevel 的 getMoves 之前缺少多牌列间移动的枚举，现已补齐，与 Python 版一致
- **generator.html 加入 seeded PRNG**: 使用 mulberry32 替代 Math.random()，每轮回溯用不同 seed，确保多轮搜索探索不同路径
- **修正规则2/3的"类别完成"判定**: 金牌列→列、手牌金牌→列 的条件从"槽里收集完"改为"桌面某列上堆齐了该类别所有亮牌基础牌"（新增 `_is_cat_all_regulars_on_tableau` 函数）
- **列间移动权重=0**: 源列无暗牌+目标列为空时，权重设为0（解决无意义循环移动浪费步数问题）
- **修改文件**: `generate_levels.py`、`generator.html`

### 2026-04-01 - 修复 bug：最后0步完成时双弹窗 + undo 恢复已完成类别失败

- **双弹窗 bug**: `decrementStep()` 步数归零时直接触发 `onLose`，随后 `checkWinOrDead()` 又触发 `onWin`。修复：`decrementStep()` 不再直接触发失败，由 `checkWinOrDead()` 统一处理，胜利优先
- **undo 恢复失败 bug**: 部分 category key（如 Trees_word、Horror_word 等）不在 `categories.js` 中，undo 时 `CATEGORIES[catKey].name` 抛 TypeError 导致静默失败。修复：改为先检查 CATEGORIES 是否有该 key，无则从 moveHistory 中保存的牌数据取名称
- **修改文件**: `game.js`

### 2026-04-01 - 新增第二种求解策略（保守类别牌策略）

- **背景**: 需要模拟更保守的玩法，对类别牌（gold card）的使用施加更严格约束
- **策略2规则**（3条限制）:
  1. 手牌展示区的类别牌 → 收集槽：仅当桌面有亮着的同类别基础牌时才允许
  2. 类别牌 列→列：仅当桌面某列上堆齐了该类别所有亮牌基础牌后才允许
  3. 手牌展示区类别牌 → 列：剩余空槽=0时，仅当桌面某列上堆齐了该类别所有亮牌基础牌后才允许
- **求解参数**: generator.html 策略2使用纯贪心模式（200步上限），generate_levels.py 策略2步数上限 = 策略1上限 + 20
- **实现**: `solve_level()` 新增 `conservative` 参数，`get_moves()` 内 3 处条件分支
- **输出**: JSON 新增 `solver2Steps`(-1=无法通关)、`solver2StrategyType`、`solver2Stats`
- **修改文件**: `generate_levels.py`、`generator.html`（含 solution log 输出）、`solve_debug.py`（新增 `--conservative` 参数，默认输出两种策略对比）

### 2026-04-01 - 修正图片类别中英文翻译不匹配

- **背景**: `level_config_v3_merged.xlsx` card 表中，部分图片类别的中文翻译与英文名称/图片内容不匹配
- **问题分类**:
  - **A. 完全错位**: Grandma 类别 zh="昆虫"，6 个卡牌词全是昆虫名（蚊子/瓢虫/蛾等）
  - **B. 个别卡牌词错位**: X-ray(zh被截断)、Picnic(Ants→Cutlery)、Wings(Firefly→Sparrow, Butterfly→Airplane)
  - **C. 英文卡牌词与图片不符**: 12 个类别的 EN 卡牌词与实际图片文件名完全不一致（如 Space 类别用了化学元素名、Halloween 用了奇幻词汇等），根据图片文件名确定正确英文再翻译中文
- **修正内容**:
  - A: Grandma 类别 zh 改为"奶奶"，6 个卡牌词改为正确中文翻译
  - B: 3 个类别共 7 处卡牌词 zh 修正
  - C: 12 个类别（Space/Egypt/Insects/Strings/Supplies/Survival/Utensils/Halloween/Arts/Medical/Purple/Eco）的 EN 卡牌词 + ZH 类别名 + ZH 卡牌词全部修正
  - Wind 类别 zh 从"樂器"改为"管乐器"（更精确）
  - Arts 文本版(Row 946) zh 从繁体"藝術"改为简体"艺术"
- **跳过**: Grandma/Violin/Match 3 个无图片文件的类别卡牌词未修改
- **修改文件**: `config/level_config_v3_merged.xlsx`(card 表 192 处变更)、`level_card_defs.js`(重新生成)
- **总计**: 修正 16 个类别、约 192 处 Excel 单元格

### 2026-03-26 - 软卡关检测（Soft Deadlock Detection）

- **背景**: 玩家可能遇到"软卡关"——牌柱无法拖动，手牌中也没有任何一张能放到收集槽或牌柱上，只能不断翻牌消耗步数
- **检测机制**: 用 `cardSeenSinceLastDrag` Set 追踪玩家自上次成功拖动以来翻看过的手牌
  - 翻牌时 add(card)，成功拖动时 clear()，recycle 时不清空（跨周期累积）
  - 当所有手牌都被翻看过后，调用 `isSoftDeadlock()` 客观判定：
    1. 牌柱无可拖动操作（底牌→槽、面朝上牌→其他列）
    2. 所有手牌（handPile + handDisplay）均无法放入收集槽或牌柱
  - 三个条件同时满足才触发
- **弹窗**: 新增 `#soft-deadlock-overlay` 弹窗，标题 "Stuck!"，描述 "No moves left to complete this level."
  - **Rescue 按钮**（绿色）：随机选一个已在收集槽中的类别，自动收集桌面牌柱（含暗牌）+手牌中该类别所有卡牌，完成类别并释放槽位。不消耗步数，可多次使用
  - **Retry 按钮**（橙色）：重开关卡
- **修改文件**: `game.js`（状态变量、isSoftDeadlock、onSoftDeadlock、rescue、翻牌/拖动追踪）、`index.html`（弹窗HTML）、`style.css`（弹窗样式）

### 2026-03-25 - resolve_image() 改为固定映射机制

- **背景**: `resolve_image()` 原有"名称匹配+随机分配"机制，149 个 word 依赖随机分配，结果不确定；C 类 8 个类别名和前缀不一致（如 Eco→ecoitems）导致匹配失败
- **方案**: 配置驱动 — 从 Excel 导出 JSON 配置，Python 读取配置实现固定映射
- **改动**:
  - 新增 `config/image_mapping.json`：包含 `prefixMap`（7 条 C 类名→前缀映射）和 `imageMap`（487 条 word→image 固定映射）
  - 从 `config/all_image_cards.xlsx`「所有图片牌」sheet 导出
  - `generate_levels.py`:
    - 新增 `IMAGE_PREFIX_MAP`（从 JSON 加载）、`IMAGE_MAPPING_CONFIG`、`_load_image_mapping()`
    - `get_image_prefix()` 支持 C 类名→前缀映射
    - `resolve_image()` 优先查固定映射，找不到再走原有 fallback 逻辑（兼容新增类别）
- **验证**: `--levels 1-5 --layouts 1 --seed 42` 全部通过
- **注意**: 固定映射基于 v3 merged 数据，当前生成仍读 v2 Excel，完全生效需切换数据源

### 2026-03-25 - C 类类别名称更新 + 不复用确认

- **C 类类别名称更新**: 20 个 C 类映射中，14 个改用前缀名作为 categoryName（首字母大写），6 个保持原名（Baby, Birds, Sea fish, Deserts, Decorate, Gems）
  - 特殊：`ecoitems` 前缀用 `Eco` 代替（更简短）
  - 详见 `config/c_class_name_changes.md`
- **用户确认不复用**: 5 个 word 不使用已有同名图片，需新画
  - Bottle(Milk/Lv103)、Boots(Cowboy/Lv64)、Lion(Big cats/Lv51)、Lion(Chimera/Lv81)、Walrus(Arctic/Lv20)
- **最终数据**: E 类需新画 **456 张**
- **更新文件**: `level_config_v3_merged.xlsx`、`all_image_cards.xlsx`、`new_images_list.xlsx`、`new_images_proposal.md`、`c_class_name_changes.md`(新)

### 2026-03-25 - C 类前缀映射优化 + 复用标记修正

- **C 类映射优化**: `babies→Baby`(100%名称匹配) 替换 `babies→Cuties`(0%)；`desert→Deserts`(100%) 替换 `desert→Sand`(25%)
- **复用标记修正**: "复用A/C"仅限 word 在对应前缀下有精确名称匹配图片的情况，随机分配的不算复用。修正了 14 个错误标记（如 Beast、Sausage、Pen 等）
- **所有图片牌修正**: 新增「匹配方式」列，A/C 类通过模拟 `resolve_image()` 完整分配（名称匹配+随机分配），修复了如 Armrest→chair_armchair_5.png 等随机分配记录缺失的问题
- **现有图片清单**: A/C 使用次数拆分为 A类/C类/E类引用三列，新增「是否使用」列（A类+未使用=1，C类/E类待确认）
- **待办**: C 类映射的类别名可能需要部分调整（游戏显示原 categoryName 而非前缀名），待用户确认卡牌情况后修改
- **最终数据**: E 类 118 个类别，需新画 **451 张**
- **更新文件**: `new_images_list.xlsx`、`new_images_proposal.md`、`all_image_cards.xlsx`

### 2026-03-24 - v3 merged 补全 + 图片使用分析（全104关）

- **问题发现**: v3 原始文件 Level 58-104 的 categoryName 为 None、英文列全空（只有中文翻译）
- **修复**: 重新合并 `level_config_v3_merged.xlsx`
  - **数据源修正**: 从 v2 `card_old` 页签（竞品原始数据）补全，而非 `card` 页签（我们改过名的版本）
  - 精确名称匹配: 550 行（card_old 类别名与 v3 高度一致）
  - 编号匹配: 472 行（58-104关无 categoryName 的行）
  - 最终: 1022/1022 行全部有 categoryName + 英文 + 中文
- **内容差异处理**（17 行 v3 中文与 card_old 英文主题不同）:
  - 使用 card_old 英文: 6 行（60-6 Thriller, 70-1 Mascots, 81-12 Jupiter, 88-1 US State, 90-3 Names, 90-4 Hobbies）
  - 使用 v3 中文翻译为英文: 13 行（59-2 Comics, 59-3 Sports, 59-5 Ecology, 60-8 Wall, 62-5 Reporter, 65-8 Backpack, 66-2 Baby birds, 72-3 X-ray, 91-4 Debris, 91-13 Day, 91-14 X-word, 99-8 Engineer, 101-12 Costume）
  - 详见 `config/v2_v3_content_diff_decisions.md`
- **图片分析**（基于 card_old 类别名，198 个图片类别）:
  - A 类（直接复用前缀）: 60 个 → 0 新图
  - C 类（空闲前缀映射）: 20 个 → 0 新图（全部 20 个空闲前缀分配完毕，优先 8-word 大类别）
  - E 类（全新）: 118 个，599 个 word 槽位
    - 跨类别同名 word 共用: -81
    - 复用 A/C 已有图片: -70
    - 已有同名图片可复用: -16
    - **实际需新画: 432 张**
- **更新文件**:
  - `config/level_config_v3_merged.xlsx` — 完整 104 关数据（基于 card_old）
  - `config/new_images_proposal.md` — A/C/E 分类方案 + 新图需求
  - `config/new_images_list.xlsx` — 新增图片清单（`需新增` sheet 列出 432 张）
  - `config/v2_v3_content_diff_decisions.md` — 17 行内容差异及处理决策
  - `config/v2_v3_diff_report.md` — v2 vs v3 逐关差异对比
  - `config/category_reuse_report.md` — 图片类别复用统计

### 2026-03-24 - 求解器新增 tableau_multi_to_column 多张列→列操作

- **背景**: 求解器只有单张 `tableau_to_column`，但游戏中同类别连续明牌可一次拖到另一列。导致求解器把 1 步拆成多步，步数计算和策略判断不准确
- **改动**:
  - `generate_levels.py`: 两套求解器（backtracking + MCTS）的 `get_moves()`/`apply_move()`/`undo_move()` 新增 `tableau_multi_to_column` 操作
    - 检测连续同类别明牌 ≥2 张，用底部卡牌检查目标列可叠放性
    - 权重与单张 `tableau_to_column` 相同逻辑（揭暗牌=4，不揭=2）
    - `empty_move_stats()` 新增 `colMultiToCol` 统计项
    - `classify_move()` 新增映射
    - `format_stats()` 标签更新：`列→列` → `列→列(单)` + `列→列(多)`
  - `generator.html`: MCTS + Backtracking 两套求解器同步修改
  - `solve_debug.py`: 同步新增多张列→列操作生成、权重、执行和描述输出
- **moveStats 新增字段**: `colMultiToCol`（原 `colToCol` 改名为单张专用）
- **验证**: `--levels 1-5 --layouts 1 --seed 42` 全部通过，`列→列(多)` 操作在实际求解中被使用

### 2026-03-23 - v3 关卡配置合并（补充中文翻译）

- **背景**: 收到竞品最新关卡数据 `level_config_v3_260323.xlsx`（104关），card 页签中文列（类别中文 + 中文-1~8）基本为空，需从 v2 补充
- **匹配策略**:
  - 精确匹配: `level + categoryName` → 487 行
  - 模糊匹配: 同 level 不同 categoryName 但 word 列表高度重叠（≥2 词）→ 62 行（v3 改了类别名，如 Animals↔Whiskers, Emoji↔Icons, Seats↔Chair）
  - 无匹配: 2 行（Level 4 Grandma, Level 20 90s 原始已有中文）
- **结果**: 550/551 行已填充中文，1 行留空（Grandma），英文列 v3 本身完整无需补填
- **输出文件**: `config/level_config_v3_merged.xlsx`

### 2026-03-23 - 求解器与游戏操作差异分析（待修复）

- **背景**: 对比 `solve_debug.py` 输出的求解步骤与实际游戏操作，发现求解器存在两个与游戏不一致的问题
- **问题 1: `tableau_multi_to_slot` 权重不区分完成度**
  - 多张牌从列拖入槽位时，"直接完成类别（释放槽位）"和"部分填充（占着槽位）"的权重都是 `HIGH_PRIORITY × PLACE_TO_HOME_MUL = 12`
  - 随机 tiebreak 可能选出次优操作（如选了 4/8 的 Books 而非 5/5 的 Bed）
  - **应修复**: 给"完成类别"的操作更高权重
- **问题 2: 缺少 `tableau_multi_to_column` 操作**
  - 求解器只实现了单张的 `tableau_to_column`（列→列），但游戏中同类别连续明牌可以一起拖到另一列
  - 导致求解器把本应 1 步的多张列间拖动拆成多步，影响步数计算和策略判断
  - 例: 列 2 有 [↑Sheet, ↑Pillow]（同属 Bed_word），游戏中可一次拖到列 1 并揭开暗牌，但求解器需要 2 步
  - `generate_levels.py` 和 `generator.html` 两端都缺少此操作
  - **应修复**: 新增 `tableau_multi_to_column` 操作类型，与 `tableau_multi_to_slot` 类似逻辑
- **状态**: 已记录，暂不修复

### 2026-03-20 - 求解器重构：贪心+MCTS → 优先策略+均等策略（仿竞品）

- **背景**: 竞品使用「PriorityStrategy（贪心+回溯决策树）」+「EqualityStrategy（无偏好DFS+回溯）」两轮策略验证关卡可解性。我们之前使用「纯贪心（无回溯）」+「MCTS」
- **改动**:
  - `generate_levels.py`:
    - 删除 `greedy_solve()` 函数
    - 新增决策树常量: `MAX_TREE_DEPTH=4`, `MAX_POSSIBLE_MOVES=50`, `MAX_SOLVER_STEPS=500`
    - 新增权重系统: `LOW/NORMAL/HIGH_PRIORITY × PLACE_TO_HOME/PLAY_STACK/STOCK_MUL`
    - 新增 `solve_level()` 函数: 闭包模式，内含 `get_moves()`/`apply_move()`/`undo_move()` + `solve_with_backtracking(use_priority)` + 两轮策略编排
    - 核心算法: 栈式决策树，深度 < MAX_TREE_DEPTH 时枚举候选+回溯，深度 = MAX_TREE_DEPTH 时贪心播放
    - Priority 策略: 按权重排序候选操作; Equality 策略: 保持原序（DFS）
    - 生成主循环改为调用 `solve_level()`, 难度过滤改为 easy=priority通过, hard=equality通过
    - 洗牌改为 10 轮
    - `verify_solvable()` (MCTS) 保留但不调用，加注释说明
  - `generator.html`: 镜像 Python 端所有改动
    - 新增常量和 `getPriorityWeight()`/`solveLevel()`
    - 删除 `greedySolve()`，保留 `verifySolvable()`
    - 移除 MCTS Iterations UI 输入框
    - 更新日志输出格式
- **JSON 输出格式变更**:
  ```json
  "config": {
    "maxSlots": 4,
    "maxSteps": 120,
    "strategyType": "priority",
    "solverSteps": 117,
    "moveStats": { ... }
  }
  ```
  旧字段 `greedySolvable`/`greedySteps`/`mctsSteps`/`greedyMoveStats`/`mctsMoveStats` 已移除
- **验证**: `--levels 1-5 --layouts 1 --seed 42`, 4/5 关通过 (Level 3 在 200 次尝试内未找到符合步数范围的解)

### 2026-03-19 - 图片牌复用分析 + 图片映射逻辑梳理

- **背景**: 分析关卡配置中图片类别和具体图片的复用情况
- **图片映射逻辑** (`resolve_image()` in `generate_levels.py`):
  - 每个图片类别在 `res/Item/` 下有 8 张 PNG，命名 `{prefix}_{itemname}_{number}.png`
  - Excel 同一类别在不同关卡可配不同 word 名（远超 8 个，如 Toolbox 30 个 word / 8 张图）
  - 映射步骤: ① 非 random 类别按 `word.lower().replace(' ','')` 匹配图片 itemname ② 匹配不到则从未用图片中随机分配 ③ random 类别（baking, toys, xmas, deck）跳过名称匹配直接分配
  - 映射确定性: `--export-defs` 用固定 seed=42，每关卡重置 `used_images`
  - `level_card_defs.js` 中图片类别 cardWords 已预解析好 `image` 字段
- **复用统计结果**（基于 `level_card_defs.js` 中实际 PNG 路径）:
  - 80 个图片类别，79 个出现在 ≥2 个关卡（复用最多: Toolbox 6次, Hats 5次）
  - 去重 597 张 PNG 被使用，其中 374 张（63%）跨关卡复用
  - 复用最多: toolbox_chisel_6.png / hats_panamahat_8.png（各 5 个关卡）
- **输出报告**: `config/category_reuse_report.md`、`config/image_file_reuse_report.md`

### 2026-03-19 - 竞品前101关图片需求分析 + 新增图片方案

- **背景**: 竞品（card_old sheet）前101关的图片类别完全不重复（186个槽位=186个不同类别），分析如何用最少的新图片实现相同效果
- **分析过程**:
  1. 将竞品186个图片类别与我们已有的80个前缀（640张PNG）交叉匹配
  2. 按复用程度分为 A/B/C/D/E 五类
  3. 统计竞品中跨类别重复的卡牌名（同一word出现在不同类别），确认竞品本身也大量复用同一图片
  4. 利用「跨类别同名word共用图片」+「D/E类word复用A/B/C已有图片」两个策略进一步压缩需求
- **五类分类方案**:
  - **A. 直接复用已有前缀**（61个）: 竞品类别名=我们的图片前缀，resolve_image 自动分配，0新图
  - **B. 跨前缀映射**（3个）: Birds→bird, Baby→babies, Gems→gemstone，0新图
  - **C. 未使用前缀覆盖**（15个）: 16个空闲前缀中15个映射到主题相近的类别（ecoitems无对应），0新图
    - 高匹配: icons→Emoji, screen→Desktop, supplies→Schools, desert→Sand, strings→Violin
    - 中匹配: halloween→Monsters, egypt→Titles, mall→Pay, arts→Canvas, purple→Lipstick, decor→Decorate, medical→Age, survival→Compass
    - 低匹配: space→Elements, utensils→Sandwich
  - **D. 前缀冲突**（3个）: Seats/Violin/Bugs 可映射前缀已被A类占用
  - **E. 全新类别**（104个）: 无可复用前缀
- **D+E类图片优化**:
  - 原始需求: 565张（每类别每张独立画）
  - 跨类别同名word去重: -50张（112个word跨类别重复，如Zebra出现在4个类别只需画1次）
  - 复用A/B/C已有图片: -59张（D/E中的word在A/B/C类别已有对应图片）
  - **最终需新画: 456张**
- **竞品跨类别重复统计**: 112个卡牌名出现在不同图片类别中
  - 4类别: Zebra（Hoof/Horse/Equidae/Hoofed）
  - 3类别: Boots, Duck, Flute, Goat, Hat, Horse, Jacket, Olive, Pliers, Sausage, Skirt, Wrench, Yacht 等14个
  - 2类别: 97个
- **类别名称相似组合**: 18组（如 Hoof/Hoofed, Hair/Hairs, Vehicle/Vehicles, Toolbox/Tools 等）
- **输出文档**:
  - `config/new_images_proposal.md` — 新增图片方案（A/B/C/D/E分类，每个类别的去重/复用详情）
  - `config/cross_category_duplicates.md` — 跨类别重复分析（名称相似、内容重叠、重复word清单）
  - `config/unused_images_inventory.md` — 空闲图片资源清单（186张未使用图片）
  - `config/category_reuse_report.md` — 当前关卡的类别复用报告
  - `config/image_file_reuse_report.md` — 当前关卡的图片文件复用报告

### 2026-03-19 - 求解器新增多张拖动操作 + 7种操作类型统计

- **需求**: 在生成关卡时，统计贪心/MCTS求解器中7种基本操作类型的数量
- **7种操作类型**:
  1. `colSingleToSlot` — 列顶牌→收集槽（单张）
  2. `colMultiToSlot` — 列→收集槽（多张拖动）【新增】
  3. `colToCol` — 列牌→另一列（叠放）
  4. `handToSlot` — 手牌展示区顶牌→收集槽
  5. `handToCol` — 手牌展示区顶牌→列
  6. `flip` — 翻手牌
  7. `recycle` — 回收手牌
- **改动文件**:
  - `generate_levels.py`:
    - 新增 `empty_move_stats()` / `classify_move()` 辅助函数
    - `greedy_solve()`: `gs_get_moves` 新增 `tableau_multi_to_slot` 操作（连续同类别明牌多张拖动），权重150（高于单张100）；主循环中计数操作类型；返回值新增 `moveStats`
    - `verify_solvable()`: MCTS 的 `get_moves` / `apply_move` / `undo_move` 同步新增多张拖动；rollout 和 iterate 追踪最优解路径的操作序列；返回值新增 `moveStats`
    - 终端输出每个 layout 的 greedy/mcts 操作统计
    - JSON 输出 config 中新增 `greedyMoveStats` / `mctsMoveStats`
  - `generator.html`:
    - 新增 `emptyMoveStats()` / `classifyMove()` 全局函数
    - `greedySolve()` / `verifySolvable()`: 同步 Python 端所有改动
    - 日志输出新增操作统计行
    - 关卡 JSON config 新增 `greedyMoveStats` / `mctsMoveStats`
- **多张拖动逻辑**: 从列底部连续同类别明牌一次性拖到收集槽
  - Case A: 金牌在顶 + 下方普通牌 → 开槽 + 收集，1步
  - Case B: 全部普通牌 → 匹配已开槽，1步

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

### 2026-03-17 - 关卡难度分级：贪心求解 + 难度过滤
- **目的**: 当前关卡用贪心策略总能通关，缺乏策略深度。新增贪心求解器与 MCTS 对比，实现难度分级
- **难度判定**: 贪心能赢 = easy，贪心输 + MCTS 赢 = hard
- **代码改动**:
  - `generate_levels.py`:
    - 新增 `greedy_solve()` 函数：独立贪心模拟器，复用 MCTS 的 get_moves/apply_move 逻辑（无 undo），单次前向模拟
    - 新增 `--difficulty` CLI 参数（`any`/`easy`/`hard`），在 MCTS 前快速过滤
    - 生成循环：先跑 greedy，再按 difficulty 过滤，最后跑 MCTS
    - JSON 输出新增元数据：`greedySolvable`、`greedySteps`、`mctsSteps`
    - 日志增强：显示 greedy 结果和过滤统计
  - `generator.html`:
    - 新增 `greedySolve()` JS 版（与 Python 一致）
    - UI 新增 Difficulty 下拉框（Any/Easy/Hard）
    - `generateSolvableLayout()` 中同样先 greedy 后 MCTS 过滤
    - 日志输出增加 greedy 信息
- **性能影响**: greedy_solve 单次 <5ms，难度过滤在 MCTS 前执行，整体不变慢

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

### 2026-03-31 - generator.html 解法路径记录与日志导出

- **背景**: 用户通过 generator.html 生成关卡，希望在生成时直接记录精确解法路径并导出日志文件。之前 solve_debug.py 重新求解时 Python/JS 求解器路径不一致，步数和解法不同
- **改动**:
  - `generator.html`:
    - `solveWithBacktracking()` 新增 `movePath` 数组，与 `moveSequence` 并行记录完整 move 对象
    - `greedyPlayout()` 返回值新增 `mdicts`
    - 成功时返回 `movePath`（回溯树路径 + 贪心播放路径）
    - `generateSolvableLayout()` 返回值新增 `movePath` 字段，JSON config 新增 `solverMaxSteps`
    - 新增 `formatSolutionLog()` 函数：重放 movePath，输出逐步解法（牌面/槽位状态）
    - 新增 `downloadTextFile()` 函数
    - 生成完成后自动下载 `level_{N}_solutions.txt` 解法日志文件
  - `generate_levels.py`:
    - `solve_with_backtracking()` 新增 `move_path` 记录（与 generator.html 一致）
    - 调用 `solve_level` 前从 `rng` 派生 `solver_seed` 并 seed 全局 `random`
    - JSON config 新增 `solverSeed` 和 `solverMaxSteps` 字段
  - `solve_debug.py`:
    - 从 Excel 读取 `solveStepMax` 作为步数上限（优先 JSON → Excel → fallback）
    - 自动搜索可用 seed（20 seeds × 3 种步数限制）
    - 求解成功后回写 `solverSeed`/`solverMaxSteps`/`solverSteps` 到 level JSON
    - 修复 `tableau_multi_to_slot` 的 gold 判断 bug（`removed[0]` → `removed[-1]`）

### 2026-03-31 - solve_debug.py 精确解法路径输出

- **背景**: solve_debug.py 之前通过 exec 调用 generate_levels.py 的 solve_level 求解，但 solve_level 只返回统计信息不返回 move path。贪心重放走不同路径，复杂关卡会死局无法输出完整解法
- **改动**:
  - `generate_levels.py`:
    - `solve_with_backtracking()` 新增 `move_path` 列表，与 `move_sequence` 并行记录完整 move dict
    - `greedy_playout()` 返回值新增 `mdicts`（move dict 列表）
    - 成功时返回值新增 `movePath` 字段（回溯树路径 + 贪心播放路径）
    - 对现有调用方（`--levels` 生成模式、generator.html）无影响，只是多一个不使用的字段
  - `solve_debug.py`:
    - 使用 `result['movePath']` 进行精确重放，替代旧的贪心重放
    - 修复 `tableau_multi_to_slot` 的 gold 判断 bug：`removed[0]`（底部）→ `removed[-1]`（顶部），与 generate_levels.py 一致
    - 步数上限从 `solverSteps + 10` 改为 `solverSteps * 2`，避免限制过紧导致求解失败
- **验证**: level 1-10、31、41 全部求解完成，精确路径重放正确
- **用法**: `python3 solve_debug.py 6` 输出 level 6 的逐步解法路径

### 2026-03-31 - 求解器权重重构 & Hint 树搜索实现

- **设计文档**: `doc/HINT_AND_SOLVER_DESIGN.md`
- **操作**: 基于竞品逆向分析，重构求解器权重系统，实现 Hint 4层树搜索

#### 求解器权重重构（generate_levels.py, generator.html, solve_debug.py）
- 去掉旧的 `BASE × MULTIPLIER` 公式（LOW/NORMAL/HIGH × HOME/PLAY/STOCK）
- 新权重系统引入 **收集槽空位因子** 和 **完成类别加成**：
  - 14 = 完成类别（释放槽位）
  - 10 = 列间移动（翻暗牌）
  -  8 = 归类+翻暗牌（空位>1）
  -  6 = 安全归类/腾空列（空位>1）
  -  4 = 紧张归类/手牌→列
  -  2 = gold开新类（空位≤1）/ 翻手牌 / 回收
- gold 牌（消耗空位）在空位≤1时降到最低，regular 牌归类不受惩罚
- 验证：level 1/10/41 全部 priority 策略解出

#### Hint 4层树搜索（game.js）
- 替换旧的 7级固定优先级为 **4层深度权重树搜索**
- 新增模块：
  - `_cloneState()` — 游戏状态深拷贝
  - `_enumerateMoves(st)` — 合法移动枚举（含批量移动）
  - `_applyMoveOnClone(st, move)` / `_undoMoveOnClone(st, undo)` — 模拟执行/撤销
  - `_getHintWeight(st, move)` — Hint 权重（范围 1-5，归类优先）
  - `_hintTreeSearch(st, depth)` — 递归树搜索
- Hint 权重（与求解器不同，偏向归类）：
  - 5 = 归类+翻牌（空位>1）
  - 4 = 安全归类 / 手牌→收集区（空位>1）
  - 3 = 列间翻暗牌 / 紧张归类+翻牌
  - 2 = 紧张归类 / 腾空列 / 手牌→列
  - 1 = 翻手牌 / 回收
- 平局处理：优先翻暗牌，然后按列位置左→右

---

### 2026-03-30~31 - v3 配置迁移 & 数据管线工具

- **操作**: 将关卡数据从 level_config_v2.xlsx 迁移到 level_config_v3_merged.xlsx

#### generate_levels.py
- 配置文件路径从 v2 改为 v3
- `read_level_sheet()` 新增公式字段计算（真实步数、求解步数上下限、delta）
- 所有注释/文档引用同步更新

#### CSV 数据管线（新增 update_csvs_from_v3.py）
- 从 v3 card sheet 生成 `sort_game_basic_card_config.csv`（5502条）和 `sort_game_category_card_config.csv`（1022条）
- ID 规则：WORD/PIC 独立编号，WORD 在前 PIC 在后
- 保留已有翻译（按 header 动态定位列）
- PIC 类别填入图片资源名（从 image_mapping.json + res/Item 匹配，去掉 .png 后缀）

#### Tag Config 管线（新增 update_tag_config.py）
- 将 level JSON 转换写入 `sort_game_v2_tag_config.xlsx`
- 支持 `--levels 1,3,5` / `--levels 1-10` / `--levels all`
- 卡牌 ID 映射含 plural/singular 容错（Bird↔Birds）
- 已写入 level 1/3/5/6/10/41

#### CSV 格式调整
- `sort_game_basic_card_config.csv` 删除 `basic_card_name` 列
- `sort_game_category_card_config.csv` 删除 `category_name` 列
- `translate_cards.py` 列索引同步更新

#### config 目录重组
- 非核心文件移至 `config/archive/`
- 代码引用的 7 个文件保留在 `config/` 根目录

#### 文档
- 新增 `memory/config_output_workflow.md`（完整数据管线文档）
- 新增 `doc/HINT_AND_SOLVER_DESIGN.md`（Hint & 求解器设计方案）

---

## 十、待办与已知问题

- `bug/` 文件夹中有 Bug 截图记录，需持续跟踪修复
- 翻译碰撞规则需持续验证（详见 `.claude/translation_guide.md`）

---

> **注意**: 此文档将随项目开发持续更新。每次重要修改（关卡调整、配置变更、Bug 修复、新功能等）都会在"开发日志"章节中记录。
