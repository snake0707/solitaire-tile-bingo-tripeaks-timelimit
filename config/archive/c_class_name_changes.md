# C 类前缀映射类别名称变更记录

> 日期：2026-03-25
> 背景：C 类映射的 20 个类别中，游戏显示的是 categoryName 而非前缀名。为使类别名与图片内容匹配，14 个类别改用前缀名作为新的 categoryName。

## 变更规则

- 保持原名的（6 个）：类别名本身已与内容匹配，无需更改
- 改用前缀名的（14 个）：原类别名与图片前缀主题不符，改为前缀名（首字母大写）
- 特殊处理：`ecoitems` 前缀用 `Eco` 作为类别名（更简短）

## 变更明细

| 原类别名 | 映射前缀 | 新类别名 | 出现关卡 | 操作 |
|---------|---------|---------|---------|------|
| Baby | babies | Baby | 70 | 不变 |
| Birds | bird | Birds | 10 | 不变 |
| Sea fish | seafish | Sea fish | 100 | 不变 |
| Deserts | desert | Deserts | 102 | 不变 |
| Decorate | decor | Decorate | 41 | 不变 |
| Gems | gemstone | Gems | 89 | 不变 |
| Fantasy | halloween | **Halloween** | 77 | 改名 |
| Emoji | icons | **Icons** | 5 | 改名 |
| Desktop | screen | **Screen** | 68 | 改名 |
| Elements | space | **Space** | 13 | 改名 |
| Ensemble | strings | **Strings** | 52 | 改名 |
| Mosaic | arts | **Arts** | 78 | 改名 |
| Has red | purple | **Purple** | 90 | 改名 |
| Sandwich | utensils | **Utensils** | 73 | 改名 |
| Plant | ecoitems | **Eco** | 98 | 改名（ecoitems→Eco） |
| Writing | supplies | **Supplies** | 58 | 改名 |
| Titles | egypt | **Egypt** | 28 | 改名 |
| Age | medical | **Medical** | 89 | 改名 |
| Backpack | survival | **Survival** | 65 | 改名 |
| No bones | insects | **Insects** | 31 | 改名 |

## 影响文件

- `config/level_config_v3_merged.xlsx` — card sheet 的 categoryName 列（14 行）
- `config/all_image_cards.xlsx` — 所有图片牌 + 现有图片清单（类别名列）
- `config/new_images_list.xlsx` — 备注列中的跨类别引用
