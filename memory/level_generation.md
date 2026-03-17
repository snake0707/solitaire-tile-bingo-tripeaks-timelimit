# 关卡生成流程

## 流程一：generator.html（浏览器端随机生成）

### 文件：`generator.html`
### 用途：随机生成可解关卡布局，用于快速原型/测试

### 流程：
1. **输入参数**：起始关卡号、关卡数量、每关布局数
2. **读取配置**：从 `level_settings.js` 获取关卡参数（层数、格子数、类别数、maxSteps等）
3. **策略性卡牌排序** (`generateCards`)：
   - 随机选 `numCategories` 个类别，每类随机选物品卡
   - 每个活跃类别生成1张金卡
   - 从非活跃类别生成 `numFillers` 张填充卡
   - 不足时从活跃类别随机补充普通卡
   - 手牌堆大小 ≈ max(numCategories, totalPositions × 40%)
   - **排序策略**（列表顺序 = 先放置 = 沉入底层）：
     1. 填充卡（最先放置 → 沉入底层，只放网格不进手牌）
     2. 类别组按 maxSlots 分批，每批内随机选类别出牌（非 round-robin）
        - 同类别最多连续出 2 张（MAX_CONSECUTIVE=2，可调）
        - 每个类别内部：普通卡在前，金卡在最后
        - 金卡随各自类别排序自然散布在各层
   - **网格/手牌分配**：
     - 填充卡只放网格
     - 其他卡按剩余容量比例概率分配（gridRemaining / (gridRemaining + handRemaining)）
     - 手牌按分配先后顺序堆叠，不额外打乱
   - **设计意图**：填充卡沉底不碍事，各类别卡交错分布，网格和手牌都有各类别的卡需要配合使用
   - **可调参数与备选方案**：
     - MAX_CONSECUTIVE=2：连续出牌限制，后续可调整
     - 概率分配方式：当前按剩余容量比例，备选方案为固定比例（如70%网格/30%手牌）
     - 手牌顺序：当前按分配先后不打乱，备选方案为最后再打乱
   - **动态网格放置**：
     - 初始可用位置 = 底层(layer 0)所有格子
     - 依次取卡，随机选一个可用位置放入
     - 当上层位置的4张支撑卡都已放好，该位置加入可用候选
4. **构建覆盖关系**：麻将式1压4，上层(L,R,C)覆盖下层(L-1,R,C)/(R,C+1)/(R+1,C)/(R+1,C+1)
5. **DFS求解器验证** (`verifySolvable`)：
   - 模拟所有操作：收集普通卡、放置金卡、翻牌、回收
   - 步数消耗：收集/放置/翻牌=1步，回收=0步
   - 操作优先级：收集 > 放置金卡 > 翻牌 > 回收
   - 收集优先级：剩余目标少的类别优先
   - 节点上限 80万，最大回收次数 3次
   - 每关最多尝试 200次随机布局
6. **输出**：找到可解布局后触发浏览器下载JSON（每关一个文件）

### 效率瓶颈：
- 单线程纯JS，高层关卡搜索空间巨大
- 200次随机 × 80万节点/次
- 浏览器UI卡顿（仅 setTimeout(r,0) 让步）
- 每关弹一次浏览器保存对话框

---

## 流程二：generate_levels.py（Python确定性生成）

### 文件：`generate_levels.py`
### 用途：从Excel精确配置生成关卡JSON，用于正式发布

### 输入文件（均在 `config/` 目录）：
- `level_config.xlsx`：关卡定义（card_content, category_content, 每行=一个布局）
- `sort_game_basic_card_config.xlsx`：卡牌定义（ID→名称/图片）
- `sort_game_category_card_config.xlsx`：类别定义（ID→类别名/包含卡牌）
- `string_config.xlsx`：多语言翻译（TID→英文名）

### 流程：
1. **构建类别映射** (`build_categories`)：
   - string_config → TID到英文名映射
   - basic_card_config → 卡牌ID到{名称,图片}映射
   - category_card_config → 类别ID到{key,items}映射
2. **读取关卡配置**：按 level_id 分组
3. **逐行构建布局** (`build_layout`)：
   - 解析 `card_content`：嵌套数组，25个子数组对应5×5网格，每子数组=该位置各层卡牌
   - 解析 `category_content`：类别ID列表→生成手牌堆金卡
   - 卡牌ID映射：config ID → 类别key + 名称 + 图片
   - 区分 regular（活跃类别）vs filler（非活跃类别）
   - 层号计算：子数组index 0=最上层=最高layer号
4. **合并配置**：level_settings默认值 + Excel行级覆盖（bingo_num, slot_cnt, max_steps）
5. **输出**：直接写入 `level/level_<id>.json`

### 特点：
- 不做随机化，完全按Excel配置生成
- 不做可解性验证
- 支持 level_time 列作为 maxSteps 的降级兼容
- Excel元数据行：前5行（表头+类型/描述/范围/引用）

### Python level_settings：
- 硬编码了1-10关配置（与level_settings.js独立维护）
- maxSteps值与JS版不同（py: 40,55,60,70,75,80,90,95,100,105 vs js: 80,100,110,130,140,150,170,180,190,200）
- 超过10关使用第10关配置作为默认

---

## JSON输出格式（两者相同）
```json
[
  {
    "config": {
      "bingosNeeded": 5,
      "maxSlots": 5,
      "maxSteps": 200
    },
    "cards": [
      { "layer": 0, "row": 0, "col": 0, "card": { "type": "regular|gold|filler", "category": "...", "name": "...", "image": "...", "isText": false } }
    ],
    "categoryTargets": { "categoryKey": count },
    "handPile": [ { "type": "gold", "category": "...", "name": "...", "isText": false } ],
    "handDisplay": []
  }
]
```
