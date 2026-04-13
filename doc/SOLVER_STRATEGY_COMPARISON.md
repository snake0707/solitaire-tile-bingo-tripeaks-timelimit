# 求解器策略对比文档

本文档描述关卡生成中**策略1（激进）**和**策略2（保守）**的实现细节与差异。

代码位置：
- `generate_levels.py`：Python 端求解器（`solve_level()` 及内部 `solve_with_backtracking()`）
- `generator.html`：浏览器端求解器（`solveLevel()` 及内部 `solveWithBacktracking()`）

---

## 零、关键概念：两层不同的"策略"

代码中存在**两层正交概念**，容易混淆：

### 第一层：`conservative` 参数 — 用户层面的"策略1/策略2"

| | 策略1 | 策略2 |
|---|---|---|
| `conservative` | `False` | `True` |
| 含义 | 金牌使用无限制 | 金牌使用受三条保守规则约束 |
| 影响范围 | 仅影响 `getMoves()` 生成哪些候选 | — |

**这是用户和生成流程层面的策略区分**，就是"策略1/策略2"所指。

### 第二层：`use_priority` 参数 — `solve_level()` 内部的搜索算法

| | Priority Strategy | Equality Strategy |
|---|---|---|
| `use_priority` | `True` | `False` |
| 候选排序 | 按权重 + tiebreak 降序 | 保持 `getMoves()` 原序 |
| 贪心选择 | 权重最高组内随机 | 全随机 |

**这是求解器内部的算法区分**，仿竞品的 PriorityStrategy / EqualityStrategy。

### 两层的关系

`solve_level()` **对同一个 `conservative` 设置跑两轮算法**：先 Priority（3 次），失败再 Equality（3 次）。

```python
# solve_level() 内部（generate_levels.py:1509-1521）
for _ in range(MAX_SOLVER_ROUNDS):
    result = solve_with_backtracking(use_priority=True)   # 权重驱动
    if result and result['won']: return result

for _ in range(MAX_SOLVER_ROUNDS):
    result = solve_with_backtracking(use_priority=False)  # 无偏 DFS
    if result and result['won']: return result
```

**结论**：策略1 和策略2 **都在 Priority 轮使用权重系统**，只有 Priority 失败时才会进入 Equality 轮做无偏兜底。绝大多数布局在 Priority 轮就能解决。

---

## 一、生成流程调用

```python
# 策略1：激进，步数 = max_steps
result = solve_level(..., conservative=False, reject_greedy_ties=True, display_steps=display_steps)

# 策略2：保守，步数 = max_steps
result2 = solve_level(..., max_steps, conservative=True, reject_greedy_ties=True, display_steps=display_steps)
```

- **策略1 先跑**，用于难度过滤（easy=priority通过，hard=equality通过）
- **策略2 在策略1 之后跑**，用于验证保守规则下也可解
- 两个策略步数上限相同（均为 solveStepMax）
- 两个策略都开启 `rejectGreedyTies`（贪心阶段拒绝等权重随机）
- `generator.html` 调用策略2 时额外传 `priorityOnly=true`，**跳过 Equality 轮**（只跑 Priority）

---

## 二、策略1 vs 策略2 差异总表

| 维度 | 策略1 | 策略2 |
|------|-------|-------|
| `conservative` | `False` | `True` |
| 步数上限 | `solveStepMax` | `solveStepMax` |
| `rejectGreedyTies` | `True` | `True` |
| 金牌（类别牌）规则 | 不限制 | 三条保守约束 |
| 搜索算法 | Priority（3轮）→ Equality（3轮） | 同左†<br>† `generator.html` 只跑 Priority |
| 权重系统 | **使用**（Priority 轮） | **使用**（Priority 轮） |
| 执行顺序 | 先跑 | 策略1 之后跑 |

**两个策略的搜索算法完全相同**，唯一差别是 `conservative` 参数对 `getMoves()` 施加的金牌规则。

---

## 三、Priority Strategy：权重系统

### 3.1 权重表（`get_priority_weight()` / `getPriorityWeight()`）

| 权重 | 操作类型 | 说明 |
|---:|------|------|
| **16** | 完成类别 | 该操作后类别槽位释放（最高优先） |
| **14** | 桌面基础牌 → 收集区 | `tableau_to_slot` / `tableau_multi_to_slot`（纯基础） |
| **12** | 手牌基础牌 → 收集区 | `display_to_slot` |
| **10** | 桌面类别牌(gold) → 收集区 | `tableau_gold_to_slot` / gold multi |
| **8** | 手牌类别牌(gold) → 收集区 | `display_gold_to_slot` |
| **6** | 列间移动（翻暗牌） | 源列有暗牌，移动后翻出 |
| **5** | 金牌移到空列（翻暗牌） | 金牌特例，低于普通翻暗牌 |
| **4** | 手牌 → 桌面列 | `display_to_column` |
| **3** | 列间移动（不翻暗牌） | 归拢同类别 |
| **2** | 翻手牌 | `flip_hand` |
| **1** | 手牌回收 | `recycle` |
| **0** | 不执行 | 源列无暗牌 + 目标空列（无意义） |

### 3.2 Tiebreak 规则（同权重内排序）

| 权重 | Tiebreak 规则 |
|---:|---------------|
| 14 (桌面基础牌归类) | 源列暗牌数少者优先 |
| 10 (桌面金牌收集) | 源列暗牌数少者优先 |
| 6 (翻暗牌) | 源列暗牌数少者优先 |
| 4 (手牌放列) | 目标列同类别明牌多者优先 |
| 3 (列间归拢) | 目标列同类别明牌多者优先 |
| 其他 | 无 tiebreak，随机 |

---

## 四、策略2 专有：保守金牌规则

策略2 通过 `conservative=True` 在 `getMoves()` 中施加三条金牌使用限制。代码位置：`generate_levels.py:651-786`。

| 场景 | 策略1（激进） | 策略2（保守） |
|------|---------------|---------------|
| **手牌金牌 → 空槽** (`display_gold_to_slot`) | 有空槽即可 | 必须桌面有该类别的**明牌基础牌**（`_has_tableau_regular_for`） |
| **金牌列间移动** (`tableau_to_column` gold) | 不限制 | 必须该类别**全部基础牌已在同一列明牌**（`_is_cat_all_regulars_on_tableau`）；例外：源列有暗牌且目标列为空（允许用于翻暗牌） |
| **手牌金牌 → 列** (`display_to_column` gold) | 不限制 | 无空槽时，必须该类别基础牌已全部在桌面 |

### 设计意图

金牌使用过早会占用槽位，阻塞基础牌收集。策略2 约束金牌使用时机，让求解器优先处理基础牌归类，在基础牌稳定后再动用金牌。

---

## 五、Priority vs Equality 算法差异（`solve_with_backtracking` 内部）

这是 `solve_level()` 内部的两种搜索算法，**策略1 和策略2 都会依次调用两者**。

### 5.1 候选排序（`get_sorted_candidates` / `getSortedCandidates`）

- **Priority**：按权重降序 + tiebreak 排序
- **Equality**：不排序，保持 `getMoves()` 原序

### 5.2 贪心选择（`_pick_greedy_move` / `pickGreedyMove`）

- **Priority**：权重最高组 + 同 tiebreak 内随机选一个
- **Equality**：所有候选完全随机选一个

### 5.3 Equality 并非完全"无偏"

`getMoves()` 生成操作时有**固定顺序**，这个顺序本身构成了隐含优先级：

```
1. 桌面牌 → 收集区（multi → single → gold）   ← 最先生成
2. 手牌 → 收集区（regular → gold）
3. 桌面牌 → 列间移动（single → multi）
4. 手牌 → 列
5. 翻手牌
6. 回收                                        ← 最后生成
```

由于 Equality 的回溯阶段始终从 `candidates[0]` 开始（即 `getMoves()` 返回的第一个操作），**回溯层面仍偏好桌面基础牌归类**。贪心阶段才是真正随机的。

但这个隐含顺序和权重系统**并不完全一致**：

- gold multi（权重10）在 `getMoves()` 中先于 regular single（权重14）生成
- 列间移动（权重可能是 0/3/5/6）按单一类别生成，`getMoves()` 不区分权重细分
- "完成类别"（权重16）不被 `getMoves()` 特殊处理

---

## 六、两阶段框架（`solve_with_backtracking`）

**策略1 和策略2 共用**此框架。每次调用 `solve_with_backtracking(use_priority)` 都是：

### Phase 1：纯贪心
- 前 `displaySteps × GREEDY_PHASE_RATIO`（60%）步
- 用 `_pick_greedy_move` 选操作
- 卡住 → 返回 null（该轮失败）
- 完成 → 直接返回结果
- 策略1 的 Priority 轮启用 `reject_greedy_ties`：同权重同 tiebreak 出现多个候选时，直接判定失败

### Phase 2：决策树回溯
- 从 Phase 1 结束的状态继续
- 最大深度 `MAX_TREE_DEPTH=8`
- 达到最大深度后 `greedy_playout` 下探验证
- 失败时按 LIFO 顺序尝试兄弟分支

### 布局淘汰规则（Phase 1 + Phase 2 + greedy_playout 共用）

| 条件 | 触发效果 |
|------|----------|
| 软死锁（`_is_soft_deadlock`）| Phase 1 判定失败；Phase 2/playout 视为死端 |
| 连续翻手牌 ≥ `MAX_CONSECUTIVE_FLIPS`（9次）| 同上 |
| Phase 1 贪心阶段无可选操作 | 布局无效 |
| Phase 1 策略1 Priority 轮出现等权重随机（`reject_greedy_ties`）| 布局无效 |

---

## 七、`generator.html` vs `generate_levels.py` 的一致性

两端代码结构**已同步**（2026-04-10）：

| 特性 | 状态 |
|------|------|
| `GREEDY_PHASE_RATIO = 0.6` | 两端一致 |
| `MAX_CONSECUTIVE_FLIPS = 9` | 两端一致 |
| 两阶段框架（Phase 1 贪心 + Phase 2 回溯） | 两端一致 |
| `solveLevel` 接受 `displaySteps` 参数 | 两端一致 |
| 权重系统 `getPriorityWeight()` | 两端一致 |
| Tiebreak 规则 `getTiebreakKey()` | 两端一致 |

### 7.1 调用方传参

| 调用场景 | `generate_levels.py` | `generator.html` |
|---------|---------------------|-------------------|
| 策略1求解 | `solve_level(..., reject_greedy_ties=True, display_steps=...)` | `solveLevel(..., false, false, false, displaySteps, true)` |
| 策略2求解 | `solve_level(..., conservative=True, reject_greedy_ties=True, display_steps=...)` | `solveLevel(..., true, true, false, displaySteps, true)` |
| 纯贪心模式 | 无单独模式 | `solveLevel(..., true, true, true)` — 不走两阶段 |

### 7.2 策略2 在两端的区别

- **`generate_levels.py`**：策略2 完整跑 Priority（3轮）→ Equality（3轮）
- **`generator.html`**：策略2 只跑 Priority（3轮），不跑 Equality

---

## 八、两策略共享的常量

- **两阶段框架**：贪心阶段 → 回溯阶段
- **贪心阶段比例**：`GREEDY_PHASE_RATIO = 0.6`
- **回溯最大深度**：`MAX_TREE_DEPTH = 8`
- **单次候选数上限**：`MAX_POSSIBLE_MOVES = 50`
- **最大求解步数**：`MAX_SOLVER_STEPS = 5000`
- **每算法轮数**：`MAX_SOLVER_ROUNDS = 3`
- **连续翻手牌上限**：`MAX_CONSECUTIVE_FLIPS = 9`
- **软死锁检测**（`_is_soft_deadlock`）：手牌全部见过且无有效归类/列间移动

---

## 九、总结

| 维度 | 策略1 | 策略2 |
|------|-------|-------|
| `conservative` | False | True |
| 金牌使用 | 激进 | 保守（三条约束） |
| 步数预算 | solveStepMax | solveStepMax |
| `rejectGreedyTies` | True | True |
| 主搜索算法 | **Priority（权重驱动）** | **Priority（权重驱动）** |
| 兜底算法 | Equality（无偏 DFS） | Equality（仅 Python 端） |
| 解的特点 | 激进用金牌，顺畅 | 延迟用金牌，稳健 |
| 适用场景 | 大部分关卡 | 策略2 验证保守玩法可行 |

**核心要点**：

1. **策略1 和策略2 的主要差别是 `conservative` 参数**（影响金牌规则），不是搜索算法
2. 两个策略**都在 Priority 轮使用权重系统**（权重14/12/10/8/...）
3. 只有当 Priority 全部失败时，才会进入 Equality 轮做无偏 DFS 兜底
4. `generator.html` 中策略2 更激进地限定在 Priority 搜索，不做 Equality 兜底

---

*文档更新日期：2026-04-13，S2步数上限对齐+rejectGreedyTies双端开启*
