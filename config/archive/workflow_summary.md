# 关卡配置与图片牌工作流程总结

> 更新日期：2026-03-25
> 项目：Solitaire Tile Bingo（SAJLike 接龙玩法）

---

## 一、工作流程概览

```
竞品原始数据(v3)  +  我们的已有资源(v2 card_old + 640张PNG)
        ↓                        ↓
   数据合并补全            图片前缀匹配分析
        ↓                        ↓
 level_config_v3_merged.xlsx     A/C/E 分类
        ↓                        ↓
   内容差异处理              前缀映射 + 类别改名
        ↓                        ↓
   翻译补充(中英文)          新增图片需求清单
        ↓                        ↓
      最终关卡配置          ←→    图片资源方案
```

---

## 二、数据合并流程

### 2.1 数据源

| 文件 | 说明 |
|------|------|
| `config/level_config_v3_260323.xlsx` | 竞品最新关卡数据（104关），Level 1-57 有英文+中文，Level 58-104 只有中文 |
| `config/level_config_v2.xlsx` / `card_old` 页签 | 竞品原始数据（108关），有完整英文+中文。**注意必须用 `card_old` 页签，`card` 页签是我们改过类别名的版本** |

### 2.2 合并策略

1. **Level 1-57**（v3 有英文和中文）：
   - 精确匹配 `level + categoryName`：550 行直接对应
   - v3 已有完整数据，从 `card_old` 补充缺失的类别中文翻译

2. **Level 58-104**（v3 只有中文，无英文和 categoryName）：
   - 通过 `(level, category编号)` 从 `card_old` 补全 categoryName、英文 word、图片标记
   - 472 行全部匹配成功

3. **内容差异处理**（17 行 v3 中文与 card_old 英文主题不同）：
   - **6 行使用 card_old 英文**：Thriller(60-6), Mascots(70-1), Jupiter(81-12), US State(88-1), Names(90-3), Hobbies(90-4)
   - **11 行使用 v3 中文翻译为英文**：Sports(59-3), Comics(59-2), Ecology(59-5), Wall(60-8), Reporter(62-5), Backpack→Survival(65-8), Baby birds(66-2), X-ray(72-3), Debris(91-4), Day(91-13), X-word(91-14), Engineer(99-8), Costume(101-12)
   - 详见 `config/v2_v3_content_diff_decisions.md`

### 2.3 最终结果

`level_config_v3_merged.xlsx`：1022 行全部有 categoryName + 英文 + 中文

---

## 三、图片牌分析与映射

### 3.1 已有图片资源

- `res/Item/` 目录下 **80 个前缀 × 8 张 = 640 张 PNG**
- 命名格式：`{prefix}_{itemname}_{number}.png`
- 图片映射机制（`resolve_image()`）：
  1. **固定映射优先**：查 `config/image_mapping.json` 中的 `imageMap`（487 条确定性映射）
  2. **名称匹配兜底**：word 名匹配 itemname（用于未配置的新增类别）
  3. **随机分配最后兜底**：从前缀中随机分配（仅对未映射的情况）
- C 类前缀映射：通过 `config/image_mapping.json` 中的 `prefixMap` 处理（如 Eco→ecoitems）
- 映射配置更新流程：修改 `all_image_cards.xlsx` → 重新导出 `image_mapping.json`

### 3.2 图片类别分类（A / C / E 三类）

从 v3 merged 中提取 **198 个图片类别**（`图片=1`），分为三类：

| 分类 | 数量 | 说明 | 需新图 |
|------|------|------|--------|
| **A. 直接复用** | 60 | categoryName 小写 = 已有前缀 | 0 |
| **C. 空闲前缀映射** | 20 | 20 个空闲前缀全部映射到 E 类中的类别 | 0 |
| **E. 全新** | 118 | 无可复用前缀 | **455** |

### 3.3 C 类映射详情

20 个空闲前缀映射规则（优先名称匹配度，兼顾卡牌数量）：

| 类别（游戏显示名） | 映射前缀 | 关卡 | 名称匹配度 | 是否改名 |
|-------------------|---------|------|-----------|---------|
| Baby | babies | 70 | 100% | 不变 |
| Birds | bird | 10 | 100% | 不变 |
| Sea fish | seafish | 100 | 100% | 不变 |
| Deserts | desert | 102 | 100% | 不变 |
| Decorate | decor | 41 | 0% | 不变 |
| Gems | gemstone | 89 | 75% | 不变 |
| Halloween | halloween | 77 | 0% | Fantasy→Halloween |
| Icons | icons | 5 | 12% | Emoji→Icons |
| Screen | screen | 68 | 0% | Desktop→Screen |
| Space | space | 13 | 0% | Elements→Space |
| Strings | strings | 52 | 0% | Ensemble→Strings |
| Arts | arts | 78 | 0% | Mosaic→Arts |
| Purple | purple | 90 | 0% | Has red→Purple |
| Utensils | utensils | 73 | 0% | Sandwich→Utensils |
| Eco | ecoitems | 98 | 0% | Plant→Eco |
| Supplies | supplies | 58 | 17% | Writing→Supplies |
| Egypt | egypt | 28 | 0% | Titles→Egypt |
| Medical | medical | 89 | 0% | Age→Medical |
| Survival | survival | 65 | 0% | Backpack→Survival |
| Insects | insects | 31 | 0% | No bones→Insects |

**类别名变更说明**：游戏中 slot 显示的是 categoryName，C 类映射中 14 个类别改用前缀名以匹配图片内容，6 个保持原名。详见 `config/c_class_name_changes.md`。

### 3.4 E 类新增图片计算

| 指标 | 数量 |
|------|------|
| E 类卡牌总槽位 | 603 |
| 跨类别同名 word 共用（只画一次） | -80 |
| 复用 A/C 已有图片（精确名称匹配） | -54 |
| 已有同名图片可复用 | -14 |
| **实际需新画** | **455** |

**注意事项**：
- 「复用A/C」仅限 word 在对应前缀下有**精确名称匹配**图片的情况，随机分配不算复用
- 用户确认不复用已有图片的 word：Bottle(Milk), Boots(Cowboy), Lion(Big cats/Chimera), Walrus(Arctic)
- Big cats/Lion 和 Chimera/Lion 共用一张新画图片

### 3.5 现有 640 张图片使用情况

| 状态 | 数量 |
|------|------|
| A 类使用 | 358 |
| C 类使用 | 129 |
| E 类引用（同名 word） | 65 |
| 未使用 | 145 |
| **总计** | **640** |

用户在「现有图片清单」的「是否使用」列中逐个确认 C 类和 E 类图片的使用情况。

---

## 四、输出文件清单

### 4.1 关卡配置

| 文件 | 说明 |
|------|------|
| `config/level_config_v3_merged.xlsx` | **主配置文件**。v3 + card_old 合并后的完整 104 关数据，包含所有 categoryName、英文 word、中文翻译、图片标记。C 类类别名已更新。 |
| `config/level_config_v3_260323.xlsx` | 竞品最新原始数据（不要修改） |
| `config/level_config_v2.xlsx` | v2 数据（card_old 页签为竞品原始数据，card 页签为我们改名后的版本） |

### 4.2 图片分析

| 文件 | 说明 |
|------|------|
| `config/new_images_proposal.md` | **图片方案总览**。A/C/E 分类、新图需求数量、优化策略 |
| `config/new_images_list.xlsx` | **新增图片清单**。`new_images` sheet 列出 E 类全部 603 行（含复用标记），`需新增` sheet 列出 455 张需新画的图片 |
| `config/image_mapping.json` | **图片映射配置**。从 `all_image_cards.xlsx` 导出的固定映射（prefixMap + imageMap 487 条），`generate_levels.py` 读取使用 |
| `config/all_image_cards.xlsx` | **图片牌总表**。`所有图片牌` sheet 列出 1090 行所有图片牌及分配信息，`现有图片清单` sheet 列出 640 张已有图片及使用状态 |

### 4.3 差异与变更记录

| 文件 | 说明 |
|------|------|
| `config/v2_v3_diff_report.md` | v2 vs v3 逐关差异对比（54 个有差异的关卡） |
| `config/v2_v3_content_diff_decisions.md` | Level 58-104 中 17 行内容差异的处理决策（用 v2 英文 vs 用 v3 中文翻译） |
| `config/c_class_name_changes.md` | C 类 20 个映射的类别名变更记录（14 个改名 + 6 个保持） |
| `config/category_reuse_report.md` | 图片类别跨关卡复用统计 |

### 4.4 项目文档

| 文件 | 说明 |
|------|------|
| `PROJECT_TRACKER.md` | 项目开发日志（第九节记录了所有变更） |

---

## 五、关键注意事项

1. **数据源选择**：补全英文数据时必须用 v2 的 `card_old` 页签，不能用 `card` 页签（后者的 categoryName 被我们改过，如 Wings→Mail, Ruminant→Rodents）

2. **resolve_image() 机制**：
   - **优先查固定映射**：从 `config/image_mapping.json` 读取确定性映射（487 条）
   - 找不到时走 fallback：按 categoryName 小写匹配前缀 → 名称匹配 → 随机分配
   - 每个关卡独立分配（同前缀不同关卡可用不同图片）
   - **更新映射**：修改 `all_image_cards.xlsx` → 重新导出 `image_mapping.json`

3. **C 类映射的类别名显示**：游戏中 slot 显示 categoryName，不是前缀名。需要在代码中增加映射逻辑或直接修改配置中的 categoryName

4. **跨类别共用**：同一个 word 出现在多个 E 类类别中时，只需画一张新图。但如果用户确认不复用已有图片（如 Lion），则这些 E 类之间仍然共用新画的图

5. **翻译一致性**：修改翻译时需同步更新三个文件：`level_config_v3_merged.xlsx`、`all_image_cards.xlsx`、`new_images_list.xlsx`
