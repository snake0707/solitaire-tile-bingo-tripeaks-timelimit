#!/usr/bin/env python3
"""
调试求解器：加载关卡 JSON，用 Priority+Equality 回溯策略求解，输出每步操作。

直接调用 generate_levels.py 的 solve_level 函数（返回精确 movePath），
然后对解法路径进行重放和详细日志输出。

步数上限优先级：JSON config.solverMaxSteps > Excel solveStepMax > solverSteps*2
求解种子优先级：--seed 命令行参数 > JSON config.solverSeed > 默认42

求解成功后，会将 solverSeed 和 solverMaxSteps 写回 level JSON，方便后续复现。

用法:
  python3 solve_debug.py 6              # 解 level_6.json 的第 1 个 layout
  python3 solve_debug.py 6 2            # 解 level_6.json 的第 2 个 layout
  python3 solve_debug.py 6 1 --seed 0   # 指定随机种子
  python3 solve_debug.py 6 --no-save    # 不回写 seed 到 JSON
"""

import json, random, sys, argparse, os

# ── Import solve_level from generate_levels.py ──

def _load_solver():
    """Load solve_level and helpers from generate_levels.py via exec."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    gen_path = os.path.join(base_dir, 'generate_levels.py')
    with open(gen_path, 'r', encoding='utf-8') as f:
        src = f.read()

    # Extract helper functions + solve_level
    helpers_start = src.index('\ndef empty_move_stats(')
    solve_end_marker = '\n\n# ── MCTS'
    if solve_end_marker in src:
        solve_end = src.index(solve_end_marker)
    else:
        solve_end = src.index('\ndef generate_settings_js')

    # can_stack_on_column is defined later in the file
    csc_start = src.index('\ndef can_stack_on_column(')
    csc_end = src.index('\n\ndef ', csc_start + 10)

    code = src[helpers_start:solve_end]
    csc_code = src[csc_start:csc_end]

    ns = {'random': random}
    exec(csc_code, ns)
    exec(code, ns)
    return ns['solve_level']


solve_level = _load_solver()

MAX_RECYCLES = 3
MAX_AUTO_SEEDS = 20  # Auto-retry up to this many seeds


def try_solve(layout, category_targets, max_steps, max_slots, seed, conservative=False, display_steps=None):
    """Try solving with a given seed. Returns (won, result)."""
    random.seed(seed)
    result = solve_level(layout['tableau'], category_targets, max_steps, max_slots, layout['handPile'], conservative=conservative, display_steps=display_steps)
    return result['won'], result


def read_solve_step_max(level):
    """Read solveStepMax for a level from Excel config. Returns None if unavailable."""
    try:
        import openpyxl
    except ImportError:
        return None
    base_dir = os.path.dirname(os.path.abspath(__file__))
    excel_path = os.path.join(base_dir, 'config', 'level_config_v3_merged.xlsx')
    if not os.path.exists(excel_path):
        return None
    try:
        wb = openpyxl.load_workbook(excel_path, read_only=True, data_only=True)
        ws = wb['level']
        rows = list(ws.iter_rows(values_only=True))
        wb.close()
        for row in rows[1:]:
            if row[0] is not None and int(row[0]) == level:
                # Column 14 = solve_step_max (求解步数上限)
                if len(row) > 14 and row[14] is not None:
                    return int(row[14])
                # Fallback: compute from base_steps + delta
                base_steps = int(row[9]) if len(row) > 9 and row[9] is not None else 0
                solve_range = float(row[11]) if len(row) > 11 and row[11] is not None else 0
                delta = round(base_steps * solve_range / 100 / 2)
                return base_steps + delta
    except Exception as e:
        print("Warning: failed to read Excel config: %s" % e)
    return None


def solve_and_print(layout, category_targets, max_steps, max_slots, seed=42, conservative=False, display_steps=None):
    """Solve using generate_levels.py's solver, then replay movePath with detailed logging."""

    tableau = layout['tableau']
    hand_pile = layout['handPile']

    # Set random seed for reproducibility
    random.seed(seed)

    result = solve_level(tableau, category_targets, max_steps, max_slots, hand_pile, conservative=conservative, display_steps=display_steps)

    mode_str = "保守策略" if conservative else "标准策略"
    if not result['won']:
        print("=== %s 求解失败 (策略: %s) ===" % (mode_str, result.get('strategyType', '?')))
        return False, result

    move_path = result.get('movePath', [])
    print("=== %s 求解成功! %d步 (策略: %s, seed=%d, maxSteps=%d) ===" % (
        mode_str, result['stepsUsed'], result['strategyType'], seed, max_steps))
    print("操作统计: %s" % json.dumps(result['moveStats'], ensure_ascii=False))
    print()

    if not move_path:
        print("（无 movePath，跳过重放）")
        return True, result

    # ── Replay exact movePath with detailed logging ──
    state = {
        'tableau': [[{'card': dict(tc['card']), 'faceUp': tc['faceUp']} for tc in col] for col in tableau],
        'slots': [None] * max_slots,
        'stepsLeft': max_steps,
        'completedCount': 0,
        'numCategories': len(category_targets),
        'handPile': [dict(c) for c in hand_pile],
        'handDisplay': [],
        'recycleCount': 0,
    }

    def auto_flip(col):
        if col and not col[-1]['faceUp']:
            col[-1]['faceUp'] = True

    def slots_str():
        parts = []
        for s in state['slots']:
            if s is None:
                parts.append('___')
            else:
                parts.append("%s(%d/%d)" % (s['key'][:8], s['collected'], s['target']))
        return '[' + ', '.join(parts) + ']'

    def describe(move):
        mt = move['type']
        if mt == 'tableau_multi_to_slot':
            col = state['tableau'][move['colIdx']]
            si = move.get('startIdx', 0)
            names = [c['card']['name'] for c in col[si:]]
            return "列%d→槽(多) [%s]" % (move['colIdx'], ', '.join(names))
        elif mt == 'tableau_to_slot':
            return "列%d→槽 [%s]" % (move['colIdx'], state['tableau'][move['colIdx']][-1]['card']['name'])
        elif mt == 'tableau_gold_to_slot':
            return "列%d→槽(金) [%s]" % (move['colIdx'], state['tableau'][move['colIdx']][-1]['card']['name'])
        elif mt == 'display_to_slot':
            return "手牌→槽 [%s]" % state['handDisplay'][-1]['name']
        elif mt == 'display_gold_to_slot':
            return "手牌→槽(金) [%s]" % state['handDisplay'][-1]['name']
        elif mt == 'tableau_to_column':
            return "列%d→列%d [%s]" % (move['srcCol'], move['dstCol'], state['tableau'][move['srcCol']][-1]['card']['name'])
        elif mt == 'tableau_multi_to_column':
            si = move.get('startIdx', 0)
            names = [c['card']['name'] for c in state['tableau'][move['srcCol']][si:]]
            return "列%d→列%d(多) [%s]" % (move['srcCol'], move['dstCol'], ', '.join(names))
        elif mt == 'display_to_column':
            return "手牌→列%d [%s]" % (move['dstCol'], state['handDisplay'][-1]['name'])
        elif mt == 'flip_hand':
            return "翻牌 [%s]" % state['handPile'][-1]['name']
        elif mt == 'recycle':
            return "回收手牌 (%d张)" % len(state['handDisplay'])
        return mt

    def apply_move(move):
        mt = move['type']
        state['stepsLeft'] -= 1
        if mt == 'tableau_multi_to_slot':
            col = state['tableau'][move['colIdx']]
            si = move.get('startIdx', 0)
            removed = col[si:]
            del col[si:]
            top = removed[-1]
            if top['card']['type'] == 'gold':
                ei = next(i for i, s in enumerate(state['slots']) if s is None)
                rc = len(removed) - 1
                t = category_targets.get(top['card']['category'], 0)
                state['slots'][ei] = {'key': top['card']['category'], 'collected': rc, 'target': t}
                if rc >= t:
                    state['slots'][ei] = None
                    state['completedCount'] += 1
            else:
                for si2, s in enumerate(state['slots']):
                    if s and s['key'] == top['card']['category']:
                        s['collected'] += len(removed)
                        if s['collected'] >= s['target']:
                            state['slots'][si2] = None
                            state['completedCount'] += 1
                        break
            auto_flip(col)
        elif mt == 'tableau_to_slot':
            col = state['tableau'][move['colIdx']]
            card = col.pop()
            for si, s in enumerate(state['slots']):
                if s and s['key'] == card['card']['category']:
                    s['collected'] += 1
                    if s['collected'] >= s['target']:
                        state['slots'][si] = None
                        state['completedCount'] += 1
                    break
            auto_flip(col)
        elif mt == 'tableau_gold_to_slot':
            col = state['tableau'][move['colIdx']]
            card = col.pop()
            ei = next(i for i, s in enumerate(state['slots']) if s is None)
            state['slots'][ei] = {'key': card['card']['category'], 'collected': 0, 'target': category_targets.get(card['card']['category'], 0)}
            auto_flip(col)
        elif mt == 'display_to_slot':
            card = state['handDisplay'].pop()
            for si, s in enumerate(state['slots']):
                if s and s['key'] == card['category']:
                    s['collected'] += 1
                    if s['collected'] >= s['target']:
                        state['slots'][si] = None
                        state['completedCount'] += 1
                    break
        elif mt == 'display_gold_to_slot':
            card = state['handDisplay'].pop()
            ei = next(i for i, s in enumerate(state['slots']) if s is None)
            state['slots'][ei] = {'key': card['category'], 'collected': 0, 'target': category_targets.get(card['category'], 0)}
        elif mt == 'tableau_to_column':
            src = state['tableau'][move['srcCol']]
            tc = src.pop()
            state['tableau'][move['dstCol']].append(tc)
            auto_flip(src)
        elif mt == 'tableau_multi_to_column':
            src = state['tableau'][move['srcCol']]
            si = move.get('startIdx', 0)
            removed = src[si:]
            del src[si:]
            state['tableau'][move['dstCol']].extend(removed)
            auto_flip(src)
        elif mt == 'display_to_column':
            card = state['handDisplay'].pop()
            state['tableau'][move['dstCol']].append({'card': card, 'faceUp': True})
        elif mt == 'flip_hand':
            card = state['handPile'].pop()
            state['handDisplay'].append(card)
        elif mt == 'recycle':
            state['handPile'] = list(reversed(state['handDisplay']))
            state['handDisplay'] = []
            state['recycleCount'] += 1

    print("--- 精确解法路径 (%d步) ---\n" % len(move_path))
    for i, move in enumerate(move_path):
        desc = describe(move)
        print("  %3d. %s  槽=%s" % (i + 1, desc, slots_str()))
        apply_move(move)

    if state['completedCount'] >= state['numCategories']:
        print("\n求解完成! %d步" % len(move_path))
    else:
        print("\n重放异常：%d/%d 类别完成" % (state['completedCount'], state['numCategories']))

    return True, result


def main():
    parser = argparse.ArgumentParser(description='调试求解器：输出关卡解法步骤')
    parser.add_argument('level', type=int, help='关卡号 (如 6)')
    parser.add_argument('layout', type=int, nargs='?', default=1, help='第几个 layout (从1开始, 默认1)')
    parser.add_argument('--seed', type=int, default=None, help='随机种子 (覆盖 JSON 中保存的 seed)')
    parser.add_argument('--no-save', action='store_true', help='不回写 seed 到 level JSON')
    parser.add_argument('--conservative', action='store_true', help='仅使用保守策略求解')
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, 'level', 'level_%d.json' % args.level)

    if not os.path.exists(json_path):
        print("Error: %s not found" % json_path)
        sys.exit(1)

    with open(json_path, 'r', encoding='utf-8') as f:
        layouts = json.load(f)

    idx = args.layout - 1
    if idx < 0 or idx >= len(layouts):
        print("Error: layout %d not found (file has %d layouts)" % (args.layout, len(layouts)))
        sys.exit(1)

    layout = layouts[idx]
    category_targets = layout['categoryTargets']
    config = layout['config']
    max_slots = config['maxSlots']

    # ── Determine step limit ──
    # Priority: JSON solverMaxSteps > Excel solveStepMax > solverSteps*2
    if 'solverMaxSteps' in config:
        max_steps = config['solverMaxSteps']
        steps_source = 'JSON solverMaxSteps'
    else:
        excel_max = read_solve_step_max(args.level)
        if excel_max is not None:
            max_steps = excel_max
            steps_source = 'Excel solveStepMax'
        else:
            max_steps = config.get('solverSteps', config['maxSteps']) * 2
            steps_source = 'solverSteps*2 (fallback)'

    # ── Determine seed ──
    # Priority: --seed arg > JSON solverSeed > auto-search
    seed_fixed = False  # True if seed is explicitly specified (no auto-retry)
    if args.seed is not None:
        seed = args.seed
        seed_source = '--seed arg'
        seed_fixed = True
    elif 'solverSeed' in config:
        seed = config['solverSeed']
        seed_source = 'JSON solverSeed'
        seed_fixed = True
    else:
        seed = 42
        seed_source = 'default (auto-retry if fail)'

    print("Level %d, Layout %d/%d" % (args.level, args.layout, len(layouts)))
    print("Config: slots=%d, maxSteps=%d, solverSteps=%s, strategyType=%s" % (
        max_slots, config['maxSteps'],
        config.get('solverSteps', '?'), config.get('strategyType', '?')))
    print("Solver: maxSteps=%d (%s), seed=%d (%s)" % (max_steps, steps_source, seed, seed_source))
    print("Tableau:")
    for i, col in enumerate(layout['tableau']):
        cards = []
        for tc in col:
            flag = '↑' if tc['faceUp'] else '↓'
            ctype = 'G' if tc['card']['type'] == 'gold' else 'R'
            cards.append('%s%s:%s' % (flag, ctype, tc['card']['name']))
        print("  Col %d: %s" % (i, ' | '.join(cards)))
    print("Hand: %d cards" % len(layout['handPile']))
    print("Categories: %s" % json.dumps(category_targets))
    print()

    # ── Auto-retry with different seeds and relaxed limits if no fixed seed ──
    if not seed_fixed:
        # Try increasing step limits: 1x, 1.5x, 2x of base
        multipliers = [1.0, 1.5, 2.0]
        base_max_steps = max_steps
        found = False
        for mult in multipliers:
            trial_steps = int(base_max_steps * mult)
            for try_seed in range(MAX_AUTO_SEEDS):
                won, _ = try_solve(layout, category_targets, trial_steps, max_slots, try_seed, display_steps=config['maxSteps'])
                if won:
                    seed = try_seed
                    max_steps = trial_steps
                    found = True
                    break
            if found:
                if mult > 1.0:
                    print("Excel限制(%d)下无解，放宽到 %.1fx(%d), seed=%d\n" % (
                        base_max_steps, mult, max_steps, seed))
                else:
                    print("自动选择 seed=%d\n" % seed)
                break
        if not found:
            print("尝试 %d 个 seed × %d 种步数限制均失败" % (MAX_AUTO_SEEDS, len(multipliers)))

    success, result = solve_and_print(layout, category_targets, max_steps, max_slots, seed=seed,
                                      conservative=args.conservative, display_steps=config['maxSteps'])

    # If standard solve succeeded and not in --conservative mode, also try conservative
    if success and not args.conservative:
        print("\n" + "=" * 60)
        print("=== 保守策略对比 ===")
        print("=" * 60 + "\n")
        con_max = max_steps + 20
        random.seed(seed)
        con_result = solve_level(layout['tableau'], category_targets, con_max, max_slots, layout['handPile'], conservative=True, display_steps=config['maxSteps'])
        if con_result['won']:
            print("策略2(保守): %d步 (策略: %s, maxSteps=%d)" % (
                con_result['stepsUsed'], con_result['strategyType'], con_max))
            print("操作统计: %s" % json.dumps(con_result['moveStats'], ensure_ascii=False))
            print("\n对比: 标准=%d步 vs 保守=%d步 (差=%+d)" % (
                result['stepsUsed'], con_result['stepsUsed'],
                con_result['stepsUsed'] - result['stepsUsed']))
        else:
            print("策略2(保守): 无法通关 (maxSteps=%d)" % con_max)

    # ── Save seed and maxSteps back to JSON ──
    if success and not args.no_save:
        changed = False
        if config.get('solverSeed') != seed:
            config['solverSeed'] = seed
            changed = True
        if config.get('solverMaxSteps') != max_steps:
            config['solverMaxSteps'] = max_steps
            changed = True
        # Also update solverSteps to match this solution
        if result and result.get('stepsUsed') and config.get('solverSteps') != result['stepsUsed']:
            config['solverSteps'] = result['stepsUsed']
            changed = True
        if changed:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(layouts, f, ensure_ascii=False, indent=2)
            print("\n[已回写 solverSeed=%d, solverMaxSteps=%d, solverSteps=%d 到 %s]" % (
                seed, max_steps, result.get('stepsUsed', 0), json_path))


if __name__ == '__main__':
    main()
