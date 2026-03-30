# 关卡生成与可解性验证 — 技术参考文档

> 基于 Solitaire Associations: Journey of Words 逆向分析
> 用于指导自研关卡生成及验证系统的开发

---

## 一、关卡数据模型

### 1.1 关卡 JSON 结构

```json
{
  "levelId": 11632,
  "slotsDefault": 4,
  "slotsRewarded": 0,
  "movesLimit": 161,
  "isRandom": true,
  "isStableMoves": true,
  "accuracy": 6,
  "penalty": -3,
  "tutorialType": 0,
  "categories": [
    {
      "id": 0,
      "categoryId": "Reptiles",
      "icon": false,
      "wordsData": [
        { "id": 1, "wordId": "Lizard", "icon": true },
        { "id": 2, "wordId": "Snake", "icon": true },
        { "id": 3, "wordId": "Alligator", "icon": true }
      ]
    }
  ],
  "stock": ["Cover", "Horse", "Month", ...],
  "cardColumns": [
    { "cards": ["Slippers", "Uggs", "Sports", "Bakery"] },
    { "cards": ["Movement", "Ghost", "Car", "Furniture", "Clogs"] }
  ]
}
```

### 1.2 字段定义

| 字段 | 类型 | 说明 |
|------|------|------|
| `levelId` | int | 关卡唯一 ID |
| `slotsDefault` | int | 底部卡槽数（3/4/5），玩家用于暂放已选卡牌的缓冲区 |
| `slotsRewarded` | int | 看广告可额外获得的卡槽数 |
| `movesLimit` | int | 步数上限，-1 表示无限（仅教程关） |
| `isRandom` | bool | true = 客户端随机发牌；false = 按 JSON 固定布局（仅教程关） |
| `isStableMoves` | bool | 步数是否稳定计算 |
| `accuracy` | int | 精确度参数（0/6/8/10），影响匹配判定 |
| `penalty` | int | 错误操作惩罚，正数 = 容错奖励，负数 = 扣分 |
| `tutorialType` | int | 0 = 非教程，1 = 教程关 |
| `categories` | array | 类别列表，每个包含 categoryId 和 wordsData |
| `categories[].icon` | bool | 类别名卡是否以图标展示 |
| `categories[].wordsData[].icon` | bool | 该词汇卡是否以图标（图片）展示 |
| `stock` | array | 备用牌堆（翻牌堆）的初始序列 |
| `cardColumns` | array | 场上牌列，每列是一个从底到顶的卡牌栈 |

### 1.3 卡牌构成规则

一副牌 = 所有类别名卡 + 所有词汇卡，数量恒等：

```
总牌数 = 类别数 + 所有类别的词汇数之和
```

例：10 个类别，每类平均 5.4 词 → 10 + 54 = 64 张牌

卡牌分布到两个区域：
- **cardColumns**（场上牌列）：部分牌面朝上叠放，只有顶牌可操作
- **stock**（备用牌堆）：逐张翻牌

---

## 二、关卡布局模板

### 2.1 列长度阶梯模式

列长度始终为**严格递增阶梯**，由难度等级决定：

| 卡槽数 | 列数 | 列长度模板 | 场上牌数 | 适用难度 |
|--------|------|-----------|---------|---------|
| 3 | 3 | [2, 3, 4] | 9 | 简单（喘息关） |
| 3 | 3 | [3, 4, 5] | 12 | 简单 |
| 4 | 4 | [3, 4, 5, 6] | 18 | 标准 |
| 4 | 4 | [4, 5, 6, 7] | 22 | 标准（中后期） |
| 4 | 4 | [5, 6, 7, 8] | 26 | 困难 |
| 5 | 5 | [5, 6, 7, 8, 9] | 35 | Boss |

**规律**：列数 = 卡槽数，列长度从 N 开始递增到 N+列数-1。

### 2.2 牌的分配比例

| 难度 | 场上牌占比 | 备用牌占比 | 说明 |
|------|-----------|-----------|------|
| 教程 | ~86% | ~14% | 几乎全在场上，不需要翻牌 |
| 简单 | ~28% | ~72% | 场上少量，主要靠翻牌 |
| 标准 | ~28-34% | ~66-72% | 标准比例 |
| 困难 | ~33% | ~67% | 场上稍多，视觉压力更大 |
| Boss | ~36% | ~64% | 场上最多 |

---

## 三、发牌（Shuffle）算法

### 3.1 流程

```
输入: level.json（定义牌池 + 布局模板）
输出: 一个具体的牌面排列（seed 确定后唯一）

1. 构造牌池
   allCards = []
   for category in categories:
       allCards.append(category.categoryId)     // 类别名卡
       for word in category.wordsData:
           allCards.append(word.wordId)          // 词汇卡

2. 生成随机种子 seed

3. 用 seed 初始化随机数生成器

4. ShuffleLevelWithSeed(allCards, seed):
   - 对 allCards 执行 Fisher-Yates 洗牌（ShuffleIterations 轮）

5. 按布局模板分配:
   index = 0
   for col in cardColumns:
       col.cards = allCards[index : index + col.length]
       index += col.length
   stock = allCards[index:]

6. 运行可解性验证 RunLevelSimulation()
   - 成功 → 使用该 seed
   - 失败 → 回到步骤 2，换 seed 重试
   - 超过 MaxSimulationAttempts → 报告失败（MsgSimulationFailed）
```

### 3.2 关键参数

| 参数 | 说明 | 推测默认值 |
|------|------|-----------|
| `ShuffleIterations` | 洗牌轮数（Fisher-Yates 执行次数） | 1-3 |
| `MaxSimulationAttempts` | 最大重试次数（换 seed 重洗） | 50-200 |

### 3.3 伪代码

```csharp
public LevelLayout ShuffleLevelWithSeed(LevelData level, int seed)
{
    var rng = new Random(seed);
    var allCards = BuildCardPool(level.categories);

    // Fisher-Yates shuffle
    for (int iter = 0; iter < shuffleIterations; iter++)
    {
        for (int i = allCards.Count - 1; i > 0; i--)
        {
            int j = rng.Next(0, i + 1);
            Swap(allCards, i, j);
        }
    }

    // 按模板填充
    var layout = new LevelLayout();
    int idx = 0;
    foreach (var colTemplate in level.cardColumns)
    {
        var col = new CardColumn();
        int colLen = colTemplate.cards.Count;  // 用模板的长度
        col.cards = allCards.GetRange(idx, colLen);
        idx += colLen;
        layout.columns.Add(col);
    }
    layout.stock = allCards.GetRange(idx, allCards.Count - idx);

    return layout;
}
```

---

## 四、可解性验证算法

### 4.1 整体架构

```
RunLevelSimulation(layout, strategies)
    │
    ├── for each strategy in [PriorityStrategy, EqualityStrategy]:
    │       │
    │       ├── SimulationWorld.DoSimulation(layout, strategy)
    │       │       │
    │       │       ├── 构建 ActionsTree（决策树）
    │       │       ├── 有限深度搜索 + 回溯
    │       │       └── 返回 SimulationResult
    │       │
    │       ├── result.gameState == Win → 返回 Success
    │       └── result.gameState == Lose → 尝试下一个 strategy
    │
    └── 所有 strategy 都失败 → 返回 Failed
```

### 4.2 核心类职责

| 类 | 职责 |
|------|------|
| `SimulationController` | 控制整个模拟流程 |
| `SimulationWorld` | 模拟世界，维护牌面状态 |
| `ActionsTreeController` | 管理决策树的构建、搜索和回溯 |
| `TreeArray<TreeNode>` | 决策树的数据结构 |
| `PossibleMovesSystem` | 枚举当前局面所有合法操作 |
| `PriorityStrategySystem` | 按优先级为每个操作计算权重 |
| `EqualityStrategySystem` | 所有操作等权重（近似随机） |
| `SimulationHelper` | 辅助方法 |
| `DebugAnalyzer` | 模拟结果分析/调试 |

### 4.3 模拟算法详细流程

```
DoSimulation(layout, strategy):

    state = InitializeGameState(layout)
    tree = new ActionsTree()
    rootNode = tree.CreateNode(state)
    currentNode = rootNode
    steps = 0

    while steps < SimulationSteps:
        steps++

        // 1. 找出所有合法操作
        possibleMoves = FindPossibleMoves(state)

        if possibleMoves.isEmpty():
            if stock.hasCards():
                // 翻一张备用牌
                FlipStockCard(state)
                continue
            else:
                // 死局：无牌可操作
                if CanBacktrack(tree, currentNode):
                    currentNode = Backtrack(tree, currentNode)
                    state = RestoreState(currentNode)
                    continue
                else:
                    return SimulationResult(Lose, NoMoves, steps)

        // 2. 用策略计算每个操作的权重
        for move in possibleMoves:
            move.weight = strategy.CalculateWeight(state, move)

        // 3. 按权重排序，选最优操作
        possibleMoves.SortByWeightDescending()
        bestMove = possibleMoves[0]

        // 4. 限制分支数
        possibleMoves = possibleMoves.Take(MaxPossibleMoves)

        // 5. 执行操作
        ExecuteMove(state, bestMove)

        // 6. 在决策树中记录
        childNode = tree.AddChild(currentNode, bestMove, state.Clone())
        currentNode = childNode

        // 7. 检查是否全部消除
        if AllCardsCleared(state):
            return SimulationResult(Win, steps, strategy.type)

        // 8. 检查是否步数用尽
        if state.movesUsed >= layout.movesLimit:
            return SimulationResult(Lose, OutOfMoves, steps)

    return SimulationResult(Lose, MaxStepsReached, steps)
```

### 4.4 操作类型与权重乘数

#### 4.4.1 三种操作类型

每一步操作属于以下三种类型之一：

| 操作类型 | 代码标识 | 说明 |
|----------|---------|------|
| **放入卡槽** | `PlaceToHome` | 从场上牌列顶部或备用牌堆**选一张牌放入底部卡槽**，这是推进游戏的核心操作 |
| **放到牌列** | `PlaceToPlayStack` | 在牌列间移动牌（预留机制，当前版本可能未启用） |
| **翻备用牌** | `StockCard` | 从备用牌堆**翻一张牌**到可操作区域 |

#### 4.4.2 权重计算机制

权重不是硬编码的 if-else，而是通过 **`GetMultiplier()`** 方法根据操作类型返回一个**乘数**（multiplier），该乘数来自远程配置：

```
Weight = BaseWeight × GetMultiplier(moveType)

GetMultiplier(moveType):
    switch moveType:
        case PlaceToHome:      return PlaceToHomeMul       // 远程配置值
        case PlaceToPlayStack: return PlaceToPlayStackMul  // 远程配置值
        case StockCard:        return 1                    // 基准
```

`PlaceToHomeMul` 和 `PlaceToPlayStackMul` 是存储在 `GameplayDefaultRemoteConfigs` 中的配置值，**可通过服务端远程下发调整**，无需更新客户端。具体数值无法从二进制中直接提取（MonoBehaviour 无 TypeTree），但从代码结构推断：

- `PlaceToHomeMul` 控制「选牌放入卡槽」的优先级权重
- `PlaceToPlayStackMul` 控制「牌列间移动」的优先级权重
- 两个乘数的比值决定了 AI 是更倾向于收集牌到卡槽，还是更倾向于整理牌列

#### 4.4.3 PriorityStrategySystem（优先策略）

核心方法链：`FindAvailableCards` → `TryPlaceCard` → 计算 Weight → 写入 `_moveDataList`

```
// PriorityStrategySystem 的处理流程（基于逆向的方法名和字段推断）

ProcessMoves(state):
    availableCards = FindAvailableCards(state)
    // 遍历所有 cardColumns 的顶牌 + 备用牌堆当前牌

    moveDataList = []
    for card in availableCards:
        if IsThereAnyCardToPlace(card, state):
            // 该卡牌可以放入某个有意义的位置

            move = CreateMoveData(card, targetSlot)
            move.weight = ComputeBaseWeight(card, state) × GetMultiplier(move.type)
            moveDataList.append(move)

    // 按 weight 降序排序，取前 MaxPossibleMoves 个
    moveDataList.SortByWeightDescending()
    return moveDataList.Take(MaxPossibleMoves)
```

**基础权重的计算因素**（从 `CardEntity` 的字段 `IsCategoryCard`、`CategoryCardID`、`WordsRequired`、`PositionInContainer` 推断）：

| 因素 | 权重影响 | 推断依据 |
|------|---------|---------|
| 牌的来源是场上牌列顶牌 | 较高 | 消除后暴露下层牌，减少遮挡 |
| 牌的来源是备用牌堆 | 较低 | 不会减少场上遮挡 |
| 该牌所属类别已经有多张在卡槽中 | 较高 | 快集齐了，优先完成可释放卡槽空间 |
| 该牌会开启一个全新的类别占用卡槽 | 较低 | 占用卡槽空间，有卡槽溢出风险 |
| 该牌是类别名卡（`IsCategoryCard`） | 可能较低 | 类别名卡一般最后收集（先集齐词汇卡） |
| 翻备用牌（StockCard） | 基准/最低 | 是被动操作，不直接推进消除 |

> **注意**：以上权重因素是基于代码结构、字段名和游戏逻辑推断的，非直接反编译结果。具体的加减权值和乘数比例存储在远程配置中，可能随版本调整。

#### 4.4.4 EqualityStrategySystem（均等策略）

核心方法：`Simulate` → `ExecuteMove` → `IsMoveValid`

```
// EqualityStrategySystem 的处理流程

Simulate(state):
    while not finished:
        // 找所有合法操作（与 Priority 相同的 FindPossibleMoves）
        moves = FindPossibleMoves(state)

        // 不计算权重，不排序
        // 检查是否有空的卡槽位置（foundEmptyHomeCardIdx）
        // 检查是否有空的牌列位置（foundEmptyPlayStackCardIdx）

        for move in moves:
            if IsMoveValid(move, state):
                ExecuteMove(state, move)  // 依次尝试，不做优先级判断
                break
```

本质上是一个**无启发式的顺序尝试**——按照 `FindPossibleMoves` 返回的默认顺序逐个尝试，不做任何优先级判断。配合回溯机制，相当于一个**无偏好的深度优先搜索**。

### 4.5 回溯机制

```
Backtrack(tree, currentNode):
    // 回退到父节点
    parent = tree.GetParent(currentNode)

    // 标记当前分支为已探索
    MarkExplored(currentNode)

    // 在父节点尝试下一个未探索的分支
    nextMove = parent.GetNextUnexploredMove()
    if nextMove != null:
        return parent  // 从父节点尝试新分支
    else:
        return Backtrack(tree, parent)  // 继续向上回溯
```

### 4.6 游戏状态判定

| 状态 | 条件 | 结果 |
|------|------|------|
| **Win** | 所有卡牌全部消除 | 验证通过 |
| **Lose - NoMoves** | 场上无牌可操作 + 备用牌用完 + 无法回溯 | 死局 |
| **Lose - OutOfMoves** | 步数耗尽但未消完 | 步数不够 |
| **Lose - MaxSteps** | 模拟步数达到 SimulationSteps 上限 | 搜索空间耗尽 |

---

## 五、多策略轮替与付费墙评估

### 5.1 策略轮替

```
for attemptIdx in range(MaxSimulationAttempts):
    seed = GenerateNewSeed()
    layout = ShuffleLevelWithSeed(level, seed)

    for strategyIdx in range(StrategySystemsCount):
        strategy = strategies[strategyIdx]  // [Priority, Equality]
        result = DoSimulation(layout, strategy)

        if result.gameState == Win:
            Log("Success! Attempts: {attemptIdx}, Steps: {result.steps}, "
                "StrategyType: {strategy.type}, Seed: {seed}")
            return (layout, seed, strategy.type)

Log("MsgSimulationFailed")
return null
```

### 5.2 两种策略的本质区别

| 维度 | PriorityStrategy | EqualityStrategy |
|------|------------------|-------------------|
| **搜索性质** | 贪心搜索 + 有限回溯 | 无偏好深度优先搜索 + 回溯 |
| **权重计算** | 有，通过 `GetMultiplier` 和多因素评估 | 无，所有操作等价 |
| **类比** | 一个「会基本策略但不会深度规划」的 AI | 一个「随便点」的玩家 |
| **能力边界** | 知道优先清场上牌、凑齐类别优先完成，但不会为 N 步后的最优解牺牲当前步 | 不做任何策略判断，纯靠搜索+回溯穷举可行路径 |
| **搜索空间** | 较小（高权重分支优先，低权重分支可能被剪枝） | 较大（不剪枝，遍历更多分支） |
| **模拟速度** | 较快（贪心收敛快） | 较慢（盲目搜索路径长） |

**关键理解**：Priority 策略不是最优解算法。它受限于：
- `MaxPossibleMoves` 限制每步考虑的分支数
- `SimulationSteps` 限制总搜索深度
- 贪心选择可能错过需要「先退后进」的最优路径

因此**验证通过 ≠ 玩家一定能轻松过关**。验证只保证"一个用贪心策略的 AI 能在步数限制内通关"。玩家如果策略不当或运气差，仍然可能失败——这正是游戏的商业化设计空间（道具/广告/重试）。

### 5.3 付费墙策略（PaywallStrategy）

模拟结果中记录了使用哪种策略通过的，这决定了关卡的**实际难度体感**和**商业化强度**：

| 通过策略 | PaywallStrategy | 玩家体验 | 商业化影响 |
|----------|-----------------|---------|-----------|
| Priority 策略通过，步数余量大 | 无付费墙 | 有明确最优路径，轻松通关 | 低变现 |
| Priority 策略通过，步数接近上限 | 低付费墙 | 需要合理规划，有一定挑战 | 中等变现 |
| Priority 过不了，Equality 能过 | 中等付费墙 | 需要运气或道具辅助 | 高变现（道具/广告） |
| 两种都过不了 → 重洗 | - | 该排列被废弃 | - |

相关分析事件：
- `simulation_level_result` — 模拟结果
- `simulation_attempts` — 尝试了多少次 seed
- `strategy_type` — 最终通过的策略类型
- `step_order` — 通关的操作步骤序列
- `g_exit_level` — 玩家放弃该关
- `g_continue_level` — 玩家看广告/用道具继续

---

## 六、难度阶梯设计参考

### 6.1 难度等级定义

| 等级 | 卡槽 | 列模板 | 类别数 | 词汇数 | 步数限制 | 精确度 | 惩罚 |
|------|------|--------|--------|--------|---------|--------|------|
| 教程 | 3 | [8,5,5] 固定 | 4 | 17 | 无限 | 0 | 0 |
| 简单 | 3 | [2,3,4] 或 [3,4,5] | 6 | 26-30 | 61-65 | 10 | +15 |
| 标准A | 4 | [3,4,5,6] | 10 | 51-54 | 117-127 | 8 | +2 |
| 标准B | 4 | [4,5,6,7] | 10 | 53-54 | 116-130 | 8 | +2 |
| 困难 | 4 | [4,5,6,7] 或 [5,6,7,8] | 12 | 66-68 | 161-168 | 6 | -3 |
| Boss | 5 | [5,6,7,8,9] | 14-15 | 78-83 | 182-200 | 6 | -4~-5 |

### 6.2 7关一轮的循环结构

```
轮次 N:
  关卡 N*7 + 1: 简单（喘息关）
  关卡 N*7 + 2: 标准
  关卡 N*7 + 3: 标准
  关卡 N*7 + 4: 标准
  关卡 N*7 + 5: 标准
  关卡 N*7 + 6: 困难
  (周期性插入 Boss 关)
```

### 6.3 难度递进趋势

| 维度 | 前期 | 中期 | 后期 |
|------|------|------|------|
| 类别数 | 8.8 | 9.6 | 10.3 |
| 词汇数 | 45.7 | 52.0 | 55.6 |
| 场上牌数 | 16.6 | 20.0 | 22.9 |
| 备用牌数 | 37.9 | 41.6 | 43.0 |
| 惩罚值 | +3.9 | +3.6 | +2.7 |
| 标准关列模板 | [3,4,5,6] | [4,5,6,7] | [4,5,6,7] |

---

## 七、开发建议

### 7.1 关卡生成流程

```
1. 设计关卡参数（难度等级、类别数、词汇数等）
2. 选择词汇类别和具体词汇
3. 确定布局模板（列长度阶梯）
4. 组装 level.json
5. 运行验证：
   for seed in generate_seeds():
       layout = shuffle(level, seed)
       result = simulate(layout, PriorityStrategy)
       if result == Win:
           // 记录 seed 和步数
           // 评估付费墙策略
           save(level, seed, result)
           break
```

### 7.2 验证系统开发要点

1. **实现 FindPossibleMoves**
   - 枚举：从牌列顶部取牌放入卡槽、从备用牌堆翻牌、将卡槽中已集齐的类别消除
   - 消除条件：同一类别的所有词汇卡 + 类别名卡全部在卡槽中

2. **实现权重策略**
   - Priority 策略的关键权重因素（按重要性排序）：
     - 场上牌列顶牌 > 备用牌堆牌（优先减少遮挡）
     - 所属类别已在卡槽中有多张 > 开启全新类别（优先完成快集齐的）
     - 避免卡槽满载时还开新类别（防死局）
   - 权重 = 基础权重 × 操作类型乘数（`GetMultiplier`），乘数值建议可配置
   - Equality 策略：等权重，作为兜底验证

3. **实现决策树搜索**
   - 不需要穷举所有分支，用 `MaxPossibleMoves` 控制每步的分支因子
   - 搜索深度由 `SimulationSteps` 控制
   - 支持 `UndoLastMove` 回溯，回溯后尝试当前节点的下一个未探索分支
   - Priority 策略实质是**贪心搜索 + 有限回溯**，不是全局最优解

4. **死局检测**
   - 卡槽满 + 无法消除任何完整类别 = 死局（`NoMoves`）
   - 场上无可操作牌 + 备用牌用完 + 无法回溯 = 死局
   - 步数耗尽 = 失败（`OutOfMoves`）

5. **难度评估**
   - Priority 策略通过且步数余量大 → 简单排列
   - Priority 策略勉强通过 → 有挑战的排列
   - 仅 Equality 策略通过 → 需要运气，适合设置付费点
   - 记录 `stepsAmount` 和 `strategyType` 用于后续数据分析

6. **性能考虑**
   - 模拟是 CPU 密集型，每次模拟可能走数百步
   - 可能需要重试数十个 seed
   - 建议在服务端或构建时离线运行（原版有 SimulationServer + HTTP `/simulate` 接口）
   - 权重乘数（`PlaceToHomeMul`、`PlaceToPlayStackMul`）建议做成远程可配参数，便于运营期调优

### 7.3 服务端模拟 API

原版提供了 HTTP 模拟接口：

```
POST /simulate
请求体: SimulationRequest (level JSON)
响应体: SimulationResponse (result + seed + steps + strategy)
```

建议自研时也做成独立服务，供关卡编辑器和 CI 流水线调用。

---

## 八、全量关卡元数据分析（3896关）

### 8.1 数据来源

通过解密 `mapEnV3.json`（使用相同的 AES-128-CBC 密钥），获得了全部 3896 关的 `accuracy` 和 `penalty` 配置。

| 数据 | 数量 | 来源 | 文件 |
|------|------|------|------|
| 全部关卡的 accuracy/penalty | 3896 关 | `mapEnV3.json` 解密 | `decrypted_levels/mapEnV3_decrypted.json` |
| 完整 level.json（词汇/牌堆/布局） | 31 关 | APK 内置 assetbundle 解密 | `decrypted_levels/all_levels.json` |
| 远程关卡清单 | 8093 个 bundle | `RemoteFilesManifest.json` 解密 | 含文件名和 hash |
| 带序号的完整配置 | 3896 关 | 整合分析 | `decrypted_levels/all_3896_levels_config.json` |

### 8.2 难度分布

| 难度 | accuracy | penalty | 数量 | 占比 |
|------|----------|---------|------|------|
| Tutorial | 0 | 0 | 1 | 0.0% |
| Easy | 10 | +15 | 779 | 20.0% |
| Normal | 8 | +2 | 2337 | 60.0% |
| Hard | 6 | -3 | 198 | 5.1% |
| Boss-A | 6 | -4 | 194 | 5.0% |
| Boss-B | 6 | -5 | 387 | 9.9% |

### 8.3 完整难度循环规律（全量验证）

#### 小周期（5关一组，恒定不变）

```
Easy → Normal → Normal → Normal → [难关]
```

#### 难关的大周期规律

**过渡期**（第 1-21 关）：
- 第 1 关：Tutorial
- 第 2-21 关（4 个小周期）：难关全部为 Hard (pen=-3)

**稳定期**（第 22 关起，已验证全部 3875 关）：

每 20 关（4 个小周期）为一个大周期，难关按 **ABHB** 模式循环：

```
小周期1: Easy → Normal × 3 → Boss-A (pen=-4)
小周期2: Easy → Normal × 3 → Boss-B (pen=-5)
小周期3: Easy → Normal × 3 → Hard   (pen=-3)
小周期4: Easy → Normal × 3 → Boss-B (pen=-5)
```

共 193 个完整大周期（772 个小周期），加上末尾 3 个小周期（ABH）。

#### 图示

```
关卡序号:  1  |  2  3  4  5  6  |  7  8  9  10  11 | ...
难度:      T  |  E  N  N  N  H  |  E  N  N  N   H  | ...
                 \_____________/    \______________/
                    小周期1             小周期2

过渡期(4个小周期): H H H H

稳定期(无限循环):  A B H B | A B H B | A B H B | ...
                   \_____/
                   大周期(20关)
```

### 8.4 后续关卡获取

剩余 3865 关的完整 level.json 存储在远程 CDN 上，按需下载。获取方式：

1. **推进游戏进度** — 游戏会自动下载当前进度附近的关卡 bundle，通过 `adb pull` 拉取后用已知密钥解密
2. **批量下载** — 需先获取 CDN 的 `RemoteUrl` 地址（存储在 Firebase Remote Config 中），然后结合 `RemoteFilesManifest.json` 中的 8093 个文件名批量下载

---

## 九、IL2CPP 反编译精确参数（硬编码常量）

通过 Il2CppDumper 反编译 `libil2cpp.so` + `global-metadata.dat`，提取到以下**硬编码在代码中的常量值**（非远程配置，不可被服务端覆盖）：

### 9.1 权重乘数（`ActionsTreeController` 类）

```csharp
private const byte MaxDepth = 4;              // 决策树最大搜索深度
private const byte PlaceToPlayStackMul = 2;   // 牌列间移动的权重乘数
private const byte PlaceToHomeMul = 4;        // 放入卡槽的权重乘数
```

**`GetMultiplier` 方法的完整逻辑**：
```csharp
private static byte GetMultiplier(MoveData move)
{
    switch (move.MoveType)
    {
        case MoveType.PlaceToPlayStack: return 2;  // 牌列间移动
        case MoveType.PlaceToHome:      return 4;  // 放入卡槽
        default:                        return 1;  // 翻牌/其他
    }
}
```

含义：**放入卡槽的操作权重是翻牌的 4 倍，是牌列移动的 2 倍。** AI 强烈倾向于收集牌到卡槽而非整理牌列。

### 9.2 优先级常量（`SimulationWorld` 类）

```csharp
public const byte LowPriority = 1;
public const byte NormalPriority = 2;
public const byte HighPriority = 3;
public const ushort MaxSteps = 500;           // 单次模拟最大步数
public const byte MaxPossibleMoves = 50;      // 每步最多考虑的分支数
```

### 9.3 洗牌参数（`SimulationController` 类）

```csharp
public const byte ShuffleIterations = 10;     // Fisher-Yates 洗牌执行 10 轮
```

### 9.4 模拟控制（`LevelSimulationRunner` 类）

```csharp
private const ushort MaxSimulationAttempts = 100;  // 最多尝试 100 个不同的 seed
```

### 9.5 操作类型枚举（`MoveType`）

```csharp
public enum MoveType : byte
{
    PlaceToPlayStack = 0,  // 牌列间移动
    PlaceToHome = 1,       // 放入底部卡槽（消除）
    StockCard = 2,         // 翻备用牌
    RestoreStock = 3       // 重置备用牌堆（全部翻完后重新翻）
}
```

### 9.6 容器类型枚举（`ContainerType`）

```csharp
public enum ContainerType : byte
{
    Stock = 0,      // 备用牌堆
    Waste = 1,      // 废牌区（已翻出的备用牌）
    PlayStack = 2,  // 场上牌列
    Home = 3        // 底部卡槽
}
```

### 9.7 策略类型枚举（`StrategyType`）

```csharp
public enum StrategyType : byte
{
    Priority = 0,   // 优先策略（贪心 + 回溯）
    Equality = 1,   // 均等策略（无偏好搜索）
    None = 2        // 无策略
}
```

### 9.8 权重计算完整公式

```
Weight = BaseWeight × GetMultiplier(MoveType)

其中:
  BaseWeight ∈ {LowPriority(1), NormalPriority(2), HighPriority(3)}
  GetMultiplier:
    PlaceToHome      → 4
    PlaceToPlayStack → 2
    StockCard        → 1
    RestoreStock     → 1

权重范围: 1×1=1 (最低: 低优先级翻牌) ~ 3×4=12 (最高: 高优先级放入卡槽)
```

### 9.9 洗牌方法签名

```csharp
// 关卡洗牌
public static LevelDto Shuffle(LevelDto level, int seed, byte shuffleIterations,
                                bool placeCategoryPairsOnTop = false);

// placeCategoryPairsOnTop: 是否将同类别的卡牌配对放在牌列顶部（降低难度）
// 内部调用: PlaceCategoryPairsOnUniqueStacks / PlaceCategoryPairOnStack / SwapCards

// 洗牌 + 验证入口
private static int ShuffleLevelWithSeed(ref LevelDto level, int seed = -1,
                                         bool placeCategoryPairsOnTop = false);
```

### 9.10 关键数据结构

```csharp
public struct MoveData
{
    public IndexHandle<CardEntity> CardID;              // 卡牌 ID
    public IndexHandle<ContainerEntity> SourceContainerID;  // 来源容器
    public IndexHandle<ContainerEntity> TargetContainerID;  // 目标容器
    public bool IsDirty;                                // 是否已被处理
    public MoveType MoveType;                           // 操作类型
    public int Weight;                                  // 权重值
}

public struct SimulationResult
{
    public readonly int StepsAmount;           // 通关步数
    public readonly StrategyType StrategyType; // 使用的策略类型
    public readonly GameStateEntity GameState; // 最终游戏状态（Win/Lose）
}
```
