#!/usr/bin/env python3
"""
关卡解法分析工具：统计连续翻拖、连续翻牌等模式。

用法:
    # 从 solutions 文件读取（推荐，快速）
    python3 analyze_solutions.py --levels 21-30 --from-solutions
    python3 analyze_solutions.py --levels 21-30 --from-solutions --detail
    python3 analyze_solutions.py --levels 21-30 --from-solutions --context

    # 实时求解（慢，但不依赖 solutions 文件）
    python3 analyze_solutions.py --levels 21-30
    python3 analyze_solutions.py --levels 21-30 --detail --context
"""

import json, os, sys, re, random, argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

LEVEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'level')
DRAG_TYPES = {'display_to_slot', 'display_to_column', 'display_gold_to_slot'}

# Map solution text patterns to internal move types
MOVE_PATTERNS = [
    (re.compile(r'Col\d+→Slot\(multi\)'), 'tableau_multi_to_slot'),
    (re.compile(r'Col\d+→Slot\(gold\)'), 'tableau_gold_to_slot'),
    (re.compile(r'Col\d+→Slot'), 'tableau_to_slot'),
    (re.compile(r'Col\d+→Col\d+\(multi\)'), 'tableau_multi_to_column'),
    (re.compile(r'Col\d+→Col\d+'), 'tableau_to_column'),
    (re.compile(r'Hand→Slot\(gold\)'), 'display_gold_to_slot'),
    (re.compile(r'Hand→Slot'), 'display_to_slot'),
    (re.compile(r'Hand→Col\d+'), 'display_to_column'),
    (re.compile(r'Flip'), 'flip_hand'),
    (re.compile(r'Recycle'), 'recycle'),
]


def parse_levels(levels_str):
    """Parse '21-30' or '21' into list of ints."""
    if '-' in levels_str:
        lo, hi = levels_str.split('-')
        return list(range(int(lo), int(hi) + 1))
    return [int(levels_str)]


def parse_solution_file(filepath):
    """Parse a solutions txt file into structured data.
    Returns list of {level, layout, strategy, steps, move_types, hand_count, tableau_info}."""
    solutions = []
    current = None

    with open(filepath, encoding='utf-8') as f:
        for line in f:
            line = line.rstrip()

            # Layout header: "Level 22, Layout 1/5"
            m = re.match(r'Level (\d+), Layout (\d+)/(\d+)', line)
            if m:
                current_level = int(m.group(1))
                current_layout = int(m.group(2))
                continue

            # Hand count
            m = re.match(r'Hand: (\d+) cards', line)
            if m and current is None:
                hand_count = int(m.group(1))
                continue

            # Tableau info
            m = re.match(r'Tableau:', line)
            if m:
                continue
            m = re.match(r'\s+Col \d+:', line)
            if m:
                continue

            # Solution header: "=== solved 61 steps (priority) ==="
            m = re.match(r'=== solved (\d+) steps \((.+)\) ===', line)
            if m:
                steps = int(m.group(1))
                strategy_raw = m.group(2)
                strategy = 'S2' if 'conservative' in strategy_raw else 'S1'
                current = {
                    'level': current_level,
                    'layout': current_layout,
                    'strategy': strategy,
                    'steps': steps,
                    'move_types': [],
                }
                continue

            # Move line: "   1. Col0→Col2 [Sausage]  Slots=[...]"
            if current is not None:
                m = re.match(r'\s+\d+\.\s+(.+?)(?:\s+Slots=|\s*$)', line)
                if m:
                    action = m.group(1).strip()
                    move_type = classify_action(action)
                    if move_type:
                        current['move_types'].append(move_type)
                    continue

                # End of solution: "Solved! N steps"
                if line.startswith('Solved!') or (line == '' and current['move_types']):
                    if current['move_types']:
                        solutions.append(current)
                    current = None

    # Handle last solution if file doesn't end with blank line
    if current and current['move_types']:
        solutions.append(current)

    return solutions


def classify_action(action):
    """Map a solution text action to internal move type."""
    for pattern, move_type in MOVE_PATTERNS:
        if pattern.search(action):
            return move_type
    return None


def analyze_flip_drag(move_types):
    """Analyze flip→drag consecutive pairs."""
    pairs = []
    i = 0
    while i < len(move_types) - 1:
        if move_types[i] == 'flip_hand' and move_types[i + 1] in DRAG_TYPES:
            pairs.append(i)
            i += 2
        else:
            i += 1

    if not pairs:
        return {'total': 0, 'max_streak': 0, 'streaks': {}}

    streaks = []
    cur = 1
    for j in range(1, len(pairs)):
        if pairs[j] == pairs[j - 1] + 2:
            cur += 1
        else:
            streaks.append(cur)
            cur = 1
    streaks.append(cur)

    dist = {}
    for s in streaks:
        dist[s] = dist.get(s, 0) + 1

    return {'total': len(pairs), 'max_streak': max(streaks), 'streaks': dist}


def analyze_consecutive_flips(move_types):
    """Find max consecutive flip_hand."""
    max_run = 0
    cur = 0
    for mt in move_types:
        if mt == 'flip_hand':
            cur += 1
            max_run = max(max_run, cur)
        else:
            cur = 0
    return max_run


def analyze_context_from_moves(move_types, hand_initial=None, tableau_initial=None):
    """Track hand/tableau state through moves and record flip-drag streaks with context.
    If hand_initial/tableau_initial not given, estimates from move counts."""
    # Estimate initials if not provided
    if hand_initial is None:
        hand_initial = sum(1 for mt in move_types if mt == 'flip_hand')
    if tableau_initial is None:
        # rough estimate: tableau cards = total steps - hand operations - recycles
        tableau_initial = 26  # fallback

    hand_remaining = hand_initial
    tableau_cards = tableau_initial

    streaks = []
    i = 0
    current_streak = 0
    streak_start_hand = 0
    streak_start_tableau = 0
    streak_start_step = 0

    while i < len(move_types):
        mt = move_types[i]

        if mt == 'flip_hand':
            hand_remaining -= 1
        elif mt in ('tableau_to_slot', 'tableau_gold_to_slot'):
            tableau_cards -= 1
        elif mt == 'tableau_multi_to_slot':
            tableau_cards -= 2  # approximate for multi
        elif mt == 'display_to_column':
            tableau_cards += 1

        if mt == 'flip_hand' and i + 1 < len(move_types) and move_types[i + 1] in DRAG_TYPES:
            if current_streak == 0:
                streak_start_hand = hand_remaining + 1
                streak_start_tableau = tableau_cards
                streak_start_step = i
            current_streak += 1
            i += 2
        else:
            if current_streak > 0:
                streaks.append({
                    'length': current_streak,
                    'hand': streak_start_hand,
                    'tableau': streak_start_tableau,
                    'step': streak_start_step,
                    'total_steps': len(move_types),
                })
                current_streak = 0
            i += 1

    if current_streak > 0:
        streaks.append({
            'length': current_streak,
            'hand': streak_start_hand,
            'tableau': streak_start_tableau,
            'step': streak_start_step,
            'total_steps': len(move_types),
        })

    return streaks


def print_detail(results):
    """Print per-layout detail table."""
    print(f"\n{'Level':>5} {'Layout':>6} {'策略':>4} {'步数':>4} {'翻拖总对':>8} {'最长连续':>8} {'最长连翻':>8}   连续翻拖分布")
    print("=" * 100)
    for r in sorted(results, key=lambda x: (-x['max_streak'], x['level'], x['layout'])):
        streak_str = ', '.join(f"{k}次×{v}" for k, v in sorted(r['streaks'].items(), reverse=True))
        print(f"{r['level']:>5} {r['layout']:>6} {r['strategy']:>4} {r['steps']:>4} "
              f"{r['total']:>8} {r['max_streak']:>8} {r['max_consec_flips']:>8}   {streak_str}")


def print_summary(results):
    """Print overall summary statistics."""
    if not results:
        print("无解法数据")
        return

    max_streaks = [r['max_streak'] for r in results]
    totals = [r['total'] for r in results]
    max_flips = [r['max_consec_flips'] for r in results]

    print(f"\n=== 总体统计（{len(results)} 个解法）===")
    print(f"翻拖对总数: avg={sum(totals) / len(totals):.1f}, max={max(totals)}")
    print(f"最长连续翻拖: avg={sum(max_streaks) / len(max_streaks):.1f}, max={max(max_streaks)}")
    print(f"最长连续翻牌: avg={sum(max_flips) / len(max_flips):.1f}, max={max(max_flips)}")

    print("\n最长连续翻拖分布:")
    dist = {}
    for ms in max_streaks:
        dist[ms] = dist.get(ms, 0) + 1
    for k in sorted(dist.keys()):
        print(f"  {k}次: {dist[k]}个解法")


def print_context(all_streaks, min_length=3):
    """Print context-aware analysis grouped by hand/tableau state."""
    long = [s for s in all_streaks if s['length'] >= min_length]
    print(f"\n=== 连续翻拖 ≥{min_length}次 共 {len(long)} 段 ===")

    print(f"\n--- 按手牌剩余数量 ---")
    print(f"{'手牌范围':>12} {'段数':>6} {'平均长度':>8} {'最长':>6}   长度分布")
    for lo, hi in [(0, 10), (10, 15), (15, 20), (20, 30), (30, 40), (40, 60)]:
        group = [s for s in long if lo <= s['hand'] < hi]
        if not group:
            continue
        avg = sum(s['length'] for s in group) / len(group)
        mx = max(s['length'] for s in group)
        dist = {}
        for s in group:
            dist[s['length']] = dist.get(s['length'], 0) + 1
        dist_str = ', '.join(f"{k}×{v}" for k, v in sorted(dist.items(), reverse=True))
        print(f"  {lo}-{hi}张: {len(group):>5} {avg:>8.1f} {mx:>6}   {dist_str}")

    print(f"\n--- 按桌面牌剩余数量 ---")
    print(f"{'桌面范围':>12} {'段数':>6} {'平均长度':>8} {'最长':>6}   长度分布")
    for lo, hi in [(0, 3), (3, 5), (5, 10), (10, 15), (15, 20), (20, 40)]:
        group = [s for s in long if lo <= s['tableau'] < hi]
        if not group:
            continue
        avg = sum(s['length'] for s in group) / len(group)
        mx = max(s['length'] for s in group)
        dist = {}
        for s in group:
            dist[s['length']] = dist.get(s['length'], 0) + 1
        dist_str = ', '.join(f"{k}×{v}" for k, v in sorted(dist.items(), reverse=True))
        print(f"  {lo}-{hi}张: {len(group):>5} {avg:>8.1f} {mx:>6}   {dist_str}")

    print(f"\n--- 按手牌+桌面组合 ---")
    combos = [
        ('手牌≥15 且 桌面≥3 (严格区)', lambda s: s['hand'] >= 15 and s['tableau'] >= 3),
        ('手牌≥15 且 桌面<3', lambda s: s['hand'] >= 15 and s['tableau'] < 3),
        ('手牌<15 且 桌面≥3', lambda s: s['hand'] < 15 and s['tableau'] >= 3),
        ('手牌<15 且 桌面<3 (末期)', lambda s: s['hand'] < 15 and s['tableau'] < 3),
    ]
    print(f"{'场景':>30} {'段数':>6} {'平均长度':>8} {'最长':>6}   长度分布")
    for name, cond in combos:
        group = [s for s in long if cond(s)]
        if not group:
            print(f"  {name}: {0:>5}")
            continue
        avg = sum(s['length'] for s in group) / len(group)
        mx = max(s['length'] for s in group)
        dist = {}
        for s in group:
            dist[s['length']] = dist.get(s['length'], 0) + 1
        dist_str = ', '.join(f"{k}×{v}" for k, v in sorted(dist.items(), reverse=True))
        print(f"  {name}: {len(group):>5} {avg:>8.1f} {mx:>6}   {dist_str}")

    print(f"\n--- 按游戏进度 ---")
    print(f"{'阶段':>15} {'段数':>6} {'平均长度':>8} {'最长':>6} {'平均手牌':>8} {'平均桌面':>8}")
    for name, cond in [
        ('前期(0-30%)', lambda s: s['step'] < s['total_steps'] * 0.3),
        ('中前(30-50%)', lambda s: 0.3 <= s['step'] / s['total_steps'] < 0.5),
        ('中后(50-70%)', lambda s: 0.5 <= s['step'] / s['total_steps'] < 0.7),
        ('后期(70%+)', lambda s: s['step'] >= s['total_steps'] * 0.7),
    ]:
        group = [s for s in long if cond(s)]
        if not group:
            continue
        avg = sum(s['length'] for s in group) / len(group)
        mx = max(s['length'] for s in group)
        avg_h = sum(s['hand'] for s in group) / len(group)
        avg_t = sum(s['tableau'] for s in group) / len(group)
        print(f"  {name}: {len(group):>5} {avg:>8.1f} {mx:>6} {avg_h:>8.0f} {avg_t:>8.0f}")


def run_from_solutions(levels, args):
    """Analyze from solution text files."""
    results = []
    all_streaks = []

    for lv in levels:
        fn = os.path.join(LEVEL_DIR, f'level_{lv}_solutions.txt')
        if not os.path.exists(fn):
            print(f"Level {lv}: solutions 文件不存在，跳过")
            continue

        solutions = parse_solution_file(fn)
        for sol in solutions:
            mt = sol['move_types']
            fd_stats = analyze_flip_drag(mt)
            max_flips = analyze_consecutive_flips(mt)

            results.append({
                'level': sol['level'], 'layout': sol['layout'],
                'strategy': sol['strategy'], 'steps': sol['steps'],
                'total': fd_stats['total'],
                'max_streak': fd_stats['max_streak'], 'streaks': fd_stats['streaks'],
                'max_consec_flips': max_flips,
            })

            if args.context:
                # Estimate hand_initial from flip count
                hand_initial = sum(1 for m in mt if m == 'flip_hand')
                streaks = analyze_context_from_moves(mt, hand_initial=hand_initial)
                for s in streaks:
                    s['level'] = sol['level']
                    s['layout'] = sol['layout']
                    s['strategy'] = sol['strategy']
                    all_streaks.append(s)

        print(f"Level {lv}: {len(solutions)} 个解法（from solutions）")

    return results, all_streaks


def run_from_solver(levels, args):
    """Analyze by running solver on level JSONs."""
    from generate_levels import solve_level

    results = []
    all_streaks = []

    for lv in levels:
        fn = os.path.join(LEVEL_DIR, f'level_{lv}.json')
        if not os.path.exists(fn):
            continue
        with open(fn) as f:
            data = json.load(f)

        for li, layout in enumerate(data):
            config = layout.get('config', {})
            cat_targets = layout.get('categoryTargets', {})
            max_steps = config.get('solverMaxSteps', config.get('maxSteps', 200))
            max_slots = config.get('maxSlots', 4)
            display_steps = config.get('maxSteps', max_steps)

            for label, conservative in [('S1', False), ('S2', True)]:
                extra = 20 if conservative else 0
                r = None
                for seed in range(20):
                    random.seed(seed)
                    r = solve_level(layout['tableau'], cat_targets, max_steps + extra, max_slots,
                                    layout.get('handPile', []), conservative=conservative,
                                    display_steps=display_steps)
                    if r and r['won']:
                        break
                if not r or not r['won']:
                    continue

                path = r.get('movePath', [])
                if not path:
                    continue

                mt = [m.get('type', '') if isinstance(m, dict) else m for m in path]
                fd_stats = analyze_flip_drag(mt)
                max_flips = analyze_consecutive_flips(mt)

                results.append({
                    'level': lv, 'layout': li + 1, 'strategy': label,
                    'steps': r['stepsUsed'], 'total': fd_stats['total'],
                    'max_streak': fd_stats['max_streak'], 'streaks': fd_stats['streaks'],
                    'max_consec_flips': max_flips,
                })

                if args.context:
                    total_hand = len(layout.get('handPile', []))
                    total_tableau = sum(len(col) for col in layout['tableau'])
                    streaks = analyze_context_from_moves(mt, hand_initial=total_hand,
                                                         tableau_initial=total_tableau)
                    for s in streaks:
                        s['level'] = lv
                        s['layout'] = li + 1
                        s['strategy'] = label
                        all_streaks.append(s)

            print(f"  Level {lv} Layout {li + 1}/{len(data)}", end='\r')
        print(f"Level {lv}: {len(data)} layouts done      ")

    return results, all_streaks


def main():
    parser = argparse.ArgumentParser(description='关卡解法分析工具')
    parser.add_argument('--levels', type=str, default=None,
                        help='关卡范围，如 "21-30" 或 "21"（默认全部）')
    parser.add_argument('--from-solutions', action='store_true',
                        help='从 level/*_solutions.txt 读取（快速，不需要跑求解器）')
    parser.add_argument('--detail', action='store_true',
                        help='输出每个layout的详细数据')
    parser.add_argument('--context', action='store_true',
                        help='按手牌/桌面状态分组统计')
    parser.add_argument('--min-streak', type=int, default=3,
                        help='上下文分析中的最小连续翻拖长度（默认3）')
    args = parser.parse_args()

    # Determine levels
    if args.levels:
        levels = parse_levels(args.levels)
    else:
        if args.from_solutions:
            sol_files = [f for f in os.listdir(LEVEL_DIR) if f.endswith('_solutions.txt')]
            levels = sorted(int(f.split('_')[1]) for f in sol_files)
        else:
            level_files = [f for f in os.listdir(LEVEL_DIR) if f.startswith('level_') and f.endswith('.json')]
            levels = sorted(int(f.split('_')[1].split('.')[0]) for f in level_files)

    if args.from_solutions:
        results, all_streaks = run_from_solutions(levels, args)
    else:
        results, all_streaks = run_from_solver(levels, args)

    if args.detail:
        print_detail(results)

    print_summary(results)

    if args.context:
        print_context(all_streaks, min_length=args.min_streak)


if __name__ == '__main__':
    main()
