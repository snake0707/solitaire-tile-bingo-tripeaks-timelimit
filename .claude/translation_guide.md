# 卡牌翻译工作指南

> 本文档记录翻译过程中积累的经验和注意事项，供后续翻译工作参考。

---

## 一、项目结构

### 需要翻译的CSV文件

| 文件 | 说明 | 英文名列 | 主题列 | 语言列起始 |
|---|---|---|---|---|
| `config/sort_game_basic_card_config.csv` | 基础牌配置（~1014行） | 列4 `basic_card_name_en` | 列5 `theme` | 列6起 |
| `config/sort_game_category_card_config.csv` | 类别牌配置（~303行） | 列5 `category_name_en` | 列6 `theme` | 列7起 |

### CSV格式注意事项
- 编码：UTF-8 with BOM (`utf-8-sig`)
- 两个文件都有 **5行表头**（列名、类型、中文标签、作用域、额外信息），数据从第6行开始
- 类别牌的表头第3-4行包含多行文本（`is_text`字段的说明），读取时需注意
- 新增语言列时需同步更新5行表头的对应位置

### 参考翻译文件
- `config/categorytranslate/` — 各语言的类别牌参考翻译（格式：`id,name_en,translation`）
- `config/basictranslate/` — 各语言的基础牌参考翻译（同格式，含PIC_开头的图片牌条目需跳过）

---

## 二、翻译字典文件格式

翻译字典保存在 `/tmp/translations_*.py`，为纯Python字典字面量（无import、无变量赋值）。

### 普通条目
```python
"Dog": "狗",
```

### 多语言元组格式（FR/DE/ES/PT）
```python
"Dog": ("Chien", "Hund", "Perro", "Cão"),
```

### 上下文相关条目（关键！）
同一英文词在不同主题中含义不同，需用嵌套字典：
```python
# 单语言
"Lime": {
    "Citrus": "萊姆",
    "Mineral": "石灰",
},
# 多语言
"Ruby": {
    "Programming": ("Ruby", "Ruby", "Ruby", "Ruby"),
    "Precious Gems": ("Rubis", "Rubin", "Rubí", "Rubi"),
},
```
- key 是主题中的关键词片段，匹配方式为 `theme_key.lower() in theme.lower()`
- 查找时先尝试匹配主题，无匹配则取第一个值作为默认

### 字典文件分片
按字母范围拆分为4个文件以便并行生成：
- `A_D` (~250条), `E_K` (~200条), `L_R` (~280条), `S_Z` (~240条)

---

## 三、常见翻译陷阱

### 1. 上下文敏感词（必须用嵌套字典）

已知需要区分上下文的词：

| 英文 | 上下文1 | 翻译1 | 上下文2 | 翻译2 |
|---|---|---|---|---|
| Agent | AI | 智慧體 | 间谍 | 特工 |
| Lime | 柑橘 | 萊姆 | 矿物 | 石灰 |
| Ruby | 编程 | Ruby | 宝石 | 紅寶石 |
| Romance | 爱情 | 浪漫/愛情片 | 电影 | 愛情片 |
| Lens | 相机 | 鏡頭 | 光学 | 鏡片 |
| Harmony | 古典音乐 | 和聲 | 平衡 | 和諧 |
| Keyword | 编程/通用 | 關鍵字 | 密码学 | 密鑰 |
| Seal | 邮件 | 封蠟 | 其他 | 印章 |
| Cortex | 大脑 | 皮質 | — | — |

### 2. 需要后缀/前缀的类别

翻译时加上类别限定词，提高玩家辨识度：

| 类别 | 后缀 | 示例 |
|---|---|---|
| 电影类型 | 片 | Drama → 劇情片, Comedy → 喜劇片 |
| 猫品种 | 貓 | Bengal → 孟加拉貓, Sphynx → 斯芬克斯貓 |
| 河流 | 河 | Amazon → 亞馬遜河, Hudson → 哈德遜河 |
| 星名 | 星 | Alkaid → 搖光星 |
| 古代民族 | 人 | Aztecs → 阿茲特克人, Celts → 凱爾特人 |
| 鼓类型 | 鼓 | Tabla → 塔布拉鼓 |
| 胡须样式 | 鬍 | Balbo → 巴爾博鬍 |
| 声乐术语 | 者/團 | Soloist → 獨唱者, Choir → 合唱團 |
| 哲学流派 | 主義 | Stoicism → 斯多葛主義 |
| 家电 | 機 | Fax → 傳真機 |
| 健身 | 運動 | Cardio → 有氧運動 |
| 机器人 | 機器人 | Robovac → 掃地機器人 |
| AI概念 | 網路 | Neural → 神經網路 |
| 肌肉 | 肱 (前缀) | Biceps → 肱二頭肌 |
| 吉他零件 | 琴 (前缀) | Strings → 琴弦 |
| 婴儿用品 | 安撫 (前缀) | Pacifier → 安撫奶嘴 |
| 奶酪品种 | 起司 | Swiss → 瑞士起司 |

### 3. 避免翻译重复（关键！两条规则）

#### 规则A：同类别下基础牌不能重复
同一类别（category）内不同英文基础牌不能翻译成相同的目标语言文字：
- ❌ Notch=鋸齒, Teeth=鋸齒（重复！）→ ✅ Notch=切口, Teeth=鋸齒
- ❌ Mist=Nebel, Haze=Nebel（重复！）→ ✅ Mist=Schleier, Haze=Dunst

#### 规则B：类别牌不能与其下基础牌同名
类别牌（category card）的翻译不能与该类别下任何一张基础牌的翻译相同：
- ❌ Category "House"=豪宅, Basic "Mansion"=豪宅 → ✅ Mansion=府邸
- ❌ Category "Fog"=Nebel, Basic "Mist"=Nebel → ✅ Mist=Schleier
- ❌ Category "Hello"=Hola, Basic "Hi"=Hola → ✅ Hi=¡Ey!

英文原文已做到这两点（类别名与基础牌名始终不同，同类别基础牌也各不相同）。但翻译时由于目标语言同义词较少，很容易产生碰撞。

#### 高频碰撞类别（翻译时需特别注意）
以下类别的英文词语义高度重叠，翻译时极易碰撞：
- **Fog/Mist/Haze** — 雾/薄雾/霾，多数语言只有1-2个词
- **Cozy/Comfy/Snug/Warm** — 舒适/温暖，近义词密集
- **Hello/Hi/Howdy/Hey** — 问候语，多数语言难以区分4种
- **Strength/Force/Power/Might** — 力量类，高度同义
- **Evaluate/Assess** — 评估类
- **Prisoner/Inmate/Detainee** — 囚犯类
- **Winning/Victory/Triumph** — 胜利类
- **Foodie/Gourmet/Epicure** — 美食家类

#### 检查方法
翻译脚本中须包含碰撞检测：
1. 通过基础牌ID中的 `_WORD_` 模式关联类别：`MANSION_WORD_HOUSE_40` → 类别 `WORD_HOUSE_40`
2. 检查每个类别下所有基础牌翻译是否唯一（规则A）
3. 检查类别牌翻译是否与其下任一基础牌翻译相同（规则B）
4. 修复策略：优先修改**基础牌**翻译（类别名作为分组标签应保持稳定），用同义词替换

**建议**：翻译完成后按类别分组检查是否有重复值，并交叉检查类别牌与基础牌。

### 4. 人名/地名音译

#### 常见错误
LLM生成繁体中文时可能产生编码异常字符，特别是 **乍**（U+4E4D, zhà）被错误地用于各种音译：
- ❌ 乍克斯 → ✅ 漢克斯 (Hanks)
- ❌ 乍特 → ✅ 彼特 (Pitt)
- ❌ 乍斯乍德 → ✅ 伊斯特伍德 (Eastwood)
- ❌ 乍洛 → ✅ 克勞 (Crowe)
- ❌ 乍卡普里奧 → ✅ 迪卡普里歐 (DiCaprio)
- ❌ 乍爾伯格 → ✅ 沃爾伯格 (Wahlberg)
- ❌ 乍麗葉 → ✅ 茱麗葉 (Juliet)

**检查方法**：翻译后搜索 `\u4E4D`（乍）是否出现在人名音译中，如出现大概率是错误。

#### 参考文件也可能有问题
`basictranslate/zh-TW.csv` 参考文件中也存在编码异常（乂、乕、乃、乆、乘 等），不可盲目照搬。

### 5. 词义辨析（繁体中文）

| 英文 | 易错翻译 | 正确翻译 | 说明 |
|---|---|---|---|
| Trolling | 網路釣魚 (phishing) | 釣魚 (trolling) | 网络钓鱼≠恶搞钓鱼 |
| Dharma | 達摩 (人名) | 法 (概念) | 禅修语境是法/达摩法 |
| Beaver | 海狸 | 河狸 | 河狸是规范译名 |
| Android | 機器人 (robot) | 仿生人 (android) | 仿生人更精确 |
| Bastion | 堡壘 (fortress) | 稜堡 (bastion) | 城堡建筑术语 |
| Turret | 砲塔 (gun turret) | 角樓 (corner turret) | 城堡语境 |
| Cauldron | 大鍋 (big pot) | 坩堝 (crucible) | 炼金术语境 |
| Colosseum | 競技場 (arena) | 鬥獸場 | 专指罗马斗兽场 |

---

## 四、翻译流程（最佳实践）

### Step 1: 提取待翻译词汇
```python
# 从CSV中提取所有唯一英文名，按字母范围分组
# 注意同时提取 theme 信息，用于识别上下文相关词
```

### Step 2: 并行生成翻译字典
- 拆分为4组（A-D, E-K, L-R, S-Z）并行让agent生成
- Prompt中须包含：目标语言、上下文相关词列表、期望格式
- 生成后检查覆盖率（是否有遗漏）

### Step 3: 应用翻译到CSV
- 使用 `translate_cards.py` 或类似脚本
- `get_translation(name, theme, translations)` 处理上下文匹配
- 同时处理基础牌和类别牌

### Step 4: 质量检查
1. **覆盖率**：确认0条缺失
2. **基础牌重复检查**：同类别内无重复翻译（规则A）
3. **类别-基础牌碰撞检查**：类别牌翻译不等于其下任一基础牌翻译（规则B）
4. **编码检查**：搜索可疑字符（如 `乍` 用于音译）
5. **参考对比**：与 `categorytranslate/` 和 `basictranslate/` 对照
6. **上下文验证**：确认上下文相关词在不同主题中翻译不同

### Step 5: 对照参考文件修正
比较时需注意：
- 参考文件可能使用旧的英文名（ID保留旧名，`name_en`已更新），这些不是错误
- 参考文件自身可能有编码问题，不可盲目采用
- 分类对比：明确错误 > 上下文问题 > 缺少后缀 > 长度差异 > 风格差异
- 风格差异（如汽水vs蘇打水）通常两种都可以，不必强改

---

## 五、已完成的语言

| 语言 | 基础牌列 | 类别牌列 | 完成日期 |
|---|---|---|---|
| French (法语) | 6 | 7 | 2026-03 |
| German (德语) | 7 | 8 | 2026-03 |
| Spanish (西班牙语) | 8 | 9 | 2026-03 |
| Portuguese (葡萄牙语) | 9 | 10 | 2026-03 |
| Thai (泰语) | 10 | 11 | 2026-03 |
| Indonesian (印尼语) | 11 | 12 | 2026-03 |
| Dutch (荷兰语) | 12 | 13 | 2026-03 |
| Japanese (日语) | 13 | 14 | 2026-03 |
| Italian (意大利语) | 14 | 15 | 2026-03 |
| Polish (波兰语) | 15 | 16 | 2026-03 |
| Turkish (土耳其语) | 16 | 17 | 2026-03 |
| Russian (俄语) | 17 | 18 | 2026-03 |
| Romanian (罗马尼亚语) | 18 | 19 | 2026-03 |
| Traditional Chinese (繁体中文) | 19 | 20 | 2026-03 |
| Danish (丹麦语) | 20 | 21 | 2026-03 |
| Ukrainian (乌克兰语) | 21 | 22 | 2026-03 |
| Simplified Chinese (简体中文) | 22 | 23 | 2026-03 |

---

## 六、工具脚本

### translate_cards.py
主翻译脚本，从 `/tmp/` 读取字典文件并应用到CSV。核心函数：
```python
def get_translation(name, theme, translations):
    entry = translations.get(name)
    if isinstance(entry, tuple): return entry      # 多语言元组
    if isinstance(entry, dict):                     # 上下文相关
        for theme_key, trans in entry.items():
            if theme_key.lower() in theme.lower():
                return trans
        return list(entry.values())[0]              # 默认取第一个
    return entry                                     # 单语言字符串
```

### 修正脚本模式
批量修正时建议使用 `(english_name, theme_fragment, old_value, new_value)` 元组列表，按行匹配并替换。注意 **Unicode编码要准确**，可先用 `ord()` 验证字符码位。
