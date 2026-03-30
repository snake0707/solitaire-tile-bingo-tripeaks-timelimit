#!/usr/bin/env python3
"""
调试求解器：加载关卡 JSON，用优先策略贪心+随机 tiebreak 求解，输出每步操作。

用法:
  python3 solve_debug.py 21              # 解 level_21.json 的第 1 个 layout
  python3 solve_debug.py 21 2            # 解 level_21.json 的第 2 个 layout
  python3 solve_debug.py 21 1 --seed 0   # 指定随机种子
  python3 solve_debug.py 21 1 --max-tries 200  # 最多尝试 200 次
"""

import json, random, sys, argparse, os

MAX_RECYCLES = 3
LOW_PRIORITY = 1; NORMAL_PRIORITY = 2; HIGH_PRIORITY = 3
PLACE_TO_HOME_MUL = 4; PLACE_TO_PLAY_STACK_MUL = 2; STOCK_CARD_MUL = 1


def solve_and_print(layout, category_targets, max_steps, max_slots, seed=42, max_tries=100):
    tableau_orig = layout['tableau']
    hand_pile_orig = layout['handPile']

    def can_stack_on_column(card, col):
        if len(col) == 0: return True
        top = col[-1]
        if top['card']['type'] == 'gold': return False
        return card['category'] == top['card']['category']

    state = {}

    def reset():
        state['tableau'] = [[{'card': dict(tc['card']), 'faceUp': tc['faceUp']} for tc in col] for col in tableau_orig]
        state['slots'] = [None] * max_slots
        state['stepsLeft'] = max_steps
        state['completedCount'] = 0
        state['numCategories'] = len(category_targets)
        state['handPile'] = [dict(c) for c in hand_pile_orig]
        state['handDisplay'] = []
        state['recycleCount'] = 0

    def get_top(col):
        return col[-1] if col else None

    def get_moves():
        moves = []
        has_empty_slot = any(s is None for s in state['slots'])
        for ci in range(len(state['tableau'])):
            col = state['tableau'][ci]
            top = get_top(col)
            if not top or not top['faceUp']: continue
            top_idx = len(col) - 1
            cat = col[top_idx]['card']['category']
            start_idx = top_idx
            while start_idx > 0 and col[start_idx-1]['faceUp'] and col[start_idx-1]['card']['category'] == cat:
                start_idx -= 1
            drag_count = top_idx - start_idx + 1
            added_multi = False
            if drag_count >= 2:
                if col[top_idx]['card']['type'] == 'gold' and has_empty_slot:
                    if all(col[i]['card']['type'] == 'regular' for i in range(start_idx, top_idx)):
                        moves.append({'type': 'tableau_multi_to_slot', 'colIdx': ci, 'startIdx': start_idx, 'count': drag_count})
                        added_multi = True
                if not added_multi and all(col[i]['card']['type'] == 'regular' for i in range(start_idx, top_idx+1)):
                    for si, s in enumerate(state['slots']):
                        if s is not None and s['key'] == cat and s['collected'] + drag_count <= s['target']:
                            moves.append({'type': 'tableau_multi_to_slot', 'colIdx': ci, 'startIdx': start_idx, 'count': drag_count})
                            added_multi = True
                            break
            if top['card']['type'] == 'regular':
                for si, s in enumerate(state['slots']):
                    if s is not None and s['key'] == top['card']['category'] and s['collected'] < s['target']:
                        moves.append({'type': 'tableau_to_slot', 'colIdx': ci, 'slotIdx': si})
                        break
            if top['card']['type'] == 'gold' and has_empty_slot:
                moves.append({'type': 'tableau_gold_to_slot', 'colIdx': ci})
        if state['handDisplay']:
            tc = state['handDisplay'][-1]
            if tc['type'] == 'regular':
                for si, s in enumerate(state['slots']):
                    if s is not None and s['key'] == tc['category'] and s['collected'] < s['target']:
                        moves.append({'type': 'display_to_slot', 'slotIdx': si})
                        break
            if tc['type'] == 'gold' and has_empty_slot:
                moves.append({'type': 'display_gold_to_slot'})
        for ci in range(len(state['tableau'])):
            col = state['tableau'][ci]
            top = get_top(col)
            if not top or not top['faceUp']: continue
            for ti in range(len(state['tableau'])):
                if ti == ci: continue
                if can_stack_on_column(top['card'], state['tableau'][ti]):
                    moves.append({'type': 'tableau_to_column', 'srcCol': ci, 'dstCol': ti})
        # Multi-card column → column
        for ci in range(len(state['tableau'])):
            col = state['tableau'][ci]
            if not col: continue
            top_idx = len(col) - 1
            if not col[top_idx]['faceUp']: continue
            cat = col[top_idx]['card']['category']
            si2 = top_idx
            while si2 > 0 and col[si2-1]['faceUp'] and col[si2-1]['card']['category'] == cat:
                si2 -= 1
            dc = top_idx - si2 + 1
            if dc < 2: continue
            bottom_card = col[si2]['card']
            for ti in range(len(state['tableau'])):
                if ti == ci: continue
                if can_stack_on_column(bottom_card, state['tableau'][ti]):
                    moves.append({'type': 'tableau_multi_to_column', 'srcCol': ci, 'dstCol': ti, 'startIdx': si2, 'count': dc})
        if state['handDisplay']:
            tc = state['handDisplay'][-1]
            for ti in range(len(state['tableau'])):
                if can_stack_on_column(tc, state['tableau'][ti]):
                    moves.append({'type': 'display_to_column', 'dstCol': ti})
        if state['handPile']:
            moves.append({'type': 'flip_hand'})
        if not state['handPile'] and state['handDisplay'] and state['recycleCount'] < MAX_RECYCLES:
            moves.append({'type': 'recycle'})
        return moves

    def get_weight(move):
        mt = move['type']
        if mt == 'tableau_multi_to_slot': return HIGH_PRIORITY * PLACE_TO_HOME_MUL
        if mt in ('tableau_to_slot', 'display_to_slot'):
            cat_key = None
            if mt == 'tableau_to_slot':
                col = state['tableau'][move['colIdx']]
                cat_key = col[-1]['card']['category'] if col else None
            else:
                cat_key = state['handDisplay'][-1]['category'] if state['handDisplay'] else None
            if cat_key:
                for s in state['slots']:
                    if s is not None and s['key'] == cat_key:
                        if s['target'] - s['collected'] <= 2: return HIGH_PRIORITY * PLACE_TO_HOME_MUL
                        break
            return NORMAL_PRIORITY * PLACE_TO_HOME_MUL
        if mt in ('tableau_gold_to_slot', 'display_gold_to_slot'): return LOW_PRIORITY * PLACE_TO_HOME_MUL
        if mt == 'tableau_to_column':
            col = state['tableau'][move['srcCol']]
            if len(col) >= 2 and not col[-2]['faceUp']: return NORMAL_PRIORITY * PLACE_TO_PLAY_STACK_MUL
            return LOW_PRIORITY * PLACE_TO_PLAY_STACK_MUL
        if mt == 'tableau_multi_to_column':
            col = state['tableau'][move['srcCol']]
            si2 = move['startIdx']
            if si2 > 0 and not col[si2-1]['faceUp']: return NORMAL_PRIORITY * PLACE_TO_PLAY_STACK_MUL
            return LOW_PRIORITY * PLACE_TO_PLAY_STACK_MUL
        if mt == 'display_to_column': return LOW_PRIORITY * PLACE_TO_PLAY_STACK_MUL
        if mt == 'flip_hand': return NORMAL_PRIORITY * STOCK_CARD_MUL
        if mt == 'recycle': return LOW_PRIORITY * STOCK_CARD_MUL
        return 1

    def auto_flip(col):
        if col and not col[-1]['faceUp']:
            col[-1]['faceUp'] = True

    def apply(move):
        mt = move['type']
        if mt == 'tableau_multi_to_slot':
            state['stepsLeft'] -= 1
            col = state['tableau'][move['colIdx']]
            removed = col[move['startIdx']:]
            del col[move['startIdx']:]
            top_card = removed[-1]
            if top_card['card']['type'] == 'gold':
                ei = next(i for i,s in enumerate(state['slots']) if s is None)
                rc = len(removed)-1
                t = category_targets.get(top_card['card']['category'],0)
                state['slots'][ei] = {'key':top_card['card']['category'],'collected':rc,'target':t}
                if rc >= t: state['slots'][ei] = None; state['completedCount'] += 1
            else:
                cat = removed[0]['card']['category']
                for si,s in enumerate(state['slots']):
                    if s is not None and s['key'] == cat:
                        s['collected'] += len(removed)
                        if s['collected'] >= s['target']: state['slots'][si] = None; state['completedCount'] += 1
                        break
            auto_flip(col)
        elif mt == 'tableau_to_slot':
            state['stepsLeft'] -= 1
            col = state['tableau'][move['colIdx']]
            col.pop()
            slot = state['slots'][move['slotIdx']]
            slot['collected'] += 1
            if slot['collected'] >= slot['target']: state['slots'][move['slotIdx']] = None; state['completedCount'] += 1
            auto_flip(col)
        elif mt == 'tableau_gold_to_slot':
            state['stepsLeft'] -= 1
            col = state['tableau'][move['colIdx']]
            tc = col.pop()
            ei = next(i for i,s in enumerate(state['slots']) if s is None)
            state['slots'][ei] = {'key':tc['card']['category'],'collected':0,'target':category_targets.get(tc['card']['category'],0)}
            auto_flip(col)
        elif mt == 'display_to_slot':
            state['stepsLeft'] -= 1
            state['handDisplay'].pop()
            slot = state['slots'][move['slotIdx']]
            slot['collected'] += 1
            if slot['collected'] >= slot['target']: state['slots'][move['slotIdx']] = None; state['completedCount'] += 1
        elif mt == 'display_gold_to_slot':
            state['stepsLeft'] -= 1
            card = state['handDisplay'].pop()
            ei = next(i for i,s in enumerate(state['slots']) if s is None)
            state['slots'][ei] = {'key':card['category'],'collected':0,'target':category_targets.get(card['category'],0)}
        elif mt == 'tableau_to_column':
            state['stepsLeft'] -= 1
            src = state['tableau'][move['srcCol']]
            tc = src.pop()
            state['tableau'][move['dstCol']].append(tc)
            auto_flip(src)
        elif mt == 'tableau_multi_to_column':
            state['stepsLeft'] -= 1
            src = state['tableau'][move['srcCol']]
            removed = src[move['startIdx']:]
            del src[move['startIdx']:]
            state['tableau'][move['dstCol']].extend(removed)
            auto_flip(src)
        elif mt == 'display_to_column':
            state['stepsLeft'] -= 1
            card = state['handDisplay'].pop()
            state['tableau'][move['dstCol']].append({'card':card,'faceUp':True})
        elif mt == 'flip_hand':
            state['stepsLeft'] -= 1
            card = state['handPile'].pop()
            state['handDisplay'].append(card)
        elif mt == 'recycle':
            state['stepsLeft'] -= 1
            state['handPile'] = list(reversed(state['handDisplay']))
            state['handDisplay'] = []
            state['recycleCount'] += 1

    def slots_str():
        parts = []
        for s in state['slots']:
            if s is None: parts.append('___')
            else: parts.append("%s(%d/%d)" % (s['key'][:6], s['collected'], s['target']))
        return '[' + ', '.join(parts) + ']'

    def describe_move(move):
        mt = move['type']
        if mt == 'tableau_multi_to_slot':
            col = state['tableau'][move['colIdx']]
            names = [c['card']['name'] for c in col[move['startIdx']:]]
            return "列%d→槽(多张) [%s]" % (move['colIdx'], ', '.join(names))
        elif mt == 'tableau_to_slot':
            col = state['tableau'][move['colIdx']]
            return "列%d→槽 [%s]" % (move['colIdx'], col[-1]['card']['name'])
        elif mt == 'tableau_gold_to_slot':
            col = state['tableau'][move['colIdx']]
            return "列%d→槽(金牌) [%s]" % (move['colIdx'], col[-1]['card']['name'])
        elif mt == 'display_to_slot':
            return "手牌→槽 [%s]" % state['handDisplay'][-1]['name']
        elif mt == 'display_gold_to_slot':
            return "手牌→槽(金牌) [%s]" % state['handDisplay'][-1]['name']
        elif mt == 'tableau_to_column':
            src = state['tableau'][move['srcCol']]
            return "列%d→列%d [%s]" % (move['srcCol'], move['dstCol'], src[-1]['card']['name'])
        elif mt == 'tableau_multi_to_column':
            src = state['tableau'][move['srcCol']]
            names = [c['card']['name'] for c in src[move['startIdx']:]]
            return "列%d→列%d(多张) [%s]" % (move['srcCol'], move['dstCol'], ', '.join(names))
        elif mt == 'display_to_column':
            return "手牌→列%d [%s]" % (move['dstCol'], state['handDisplay'][-1]['name'])
        elif mt == 'flip_hand':
            return "翻牌 [%s]" % state['handPile'][-1]['name']
        elif mt == 'recycle':
            return "回收手牌 (%d张)" % len(state['handDisplay'])

    rng = random.Random(seed)

    for attempt in range(max_tries):
        reset()
        log = []
        step = 0
        won = False
        while state['stepsLeft'] > 0:
            if state['completedCount'] >= state['numCategories']:
                won = True
                break
            moves = get_moves()
            if not moves:
                break
            moves.sort(key=lambda m: get_weight(m), reverse=True)
            top_w = get_weight(moves[0])
            top_count = 1
            while top_count < len(moves) and get_weight(moves[top_count]) == top_w:
                top_count += 1
            move = moves[rng.randint(0, top_count - 1)]
            step += 1
            desc = describe_move(move)
            log.append("  %3d. [w=%2d] %s  槽位=%s" % (step, get_weight(move), desc, slots_str()))
            apply(move)

        if won:
            print("=== 第%d次尝试成功! %d步 ===\n" % (attempt + 1, step))
            for line in log:
                print(line)
            print("\n完成! %d/%d 类别, %d步" % (state['completedCount'], state['numCategories'], step))
            return True

    print("=== %d次尝试均失败 ===" % max_tries)
    return False


def main():
    parser = argparse.ArgumentParser(description='调试求解器：输出关卡解法步骤')
    parser.add_argument('level', type=int, help='关卡号 (如 21)')
    parser.add_argument('layout', type=int, nargs='?', default=1, help='第几个 layout (从1开始, 默认1)')
    parser.add_argument('--seed', type=int, default=42, help='随机种子 (默认42)')
    parser.add_argument('--max-tries', type=int, default=100, help='最多尝试次数 (默认100)')
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
    max_steps = config.get('solverSteps', config['maxSteps']) + 10
    max_slots = config['maxSlots']

    # Print layout info
    print("Level %d, Layout %d/%d" % (args.level, args.layout, len(layouts)))
    print("Config: slots=%d, maxSteps=%d, solverSteps=%s, strategyType=%s" % (
        max_slots, config['maxSteps'],
        config.get('solverSteps', '?'), config.get('strategyType', '?')))
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

    solve_and_print(layout, category_targets, max_steps, max_slots,
                    seed=args.seed, max_tries=args.max_tries)


if __name__ == '__main__':
    main()
