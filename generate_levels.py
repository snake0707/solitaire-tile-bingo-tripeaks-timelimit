#!/usr/bin/env python3
"""
Generate level JSON files from level_config_v2.xlsx (SAJLike solitaire format).

Reads:
  config/level_config_v2.xlsx  -- level definitions (sheet "level") + card defs (sheet "card")
  res/Item/*.png               -- image assets for image-type categories

Writes:
  level/level_<id>.json        (one file per level_id, default: levels 1-10)
  level_settings.js            (when --settings flag is used, all 108 levels)
  level_card_defs.js           (when --export-defs flag is used, for generator.html)

Usage:
  python3 generate_levels.py                   # generate level JSON files (1-10)
  python3 generate_levels.py --levels 1-20     # generate levels 1-20
  python3 generate_levels.py --settings        # generate level_settings.js only
  python3 generate_levels.py --export-defs     # generate level_card_defs.js only
"""

import json
import os
import sys
import random
import copy
import csv

try:
    import openpyxl
except ImportError:
    print("Error: openpyxl is required. Install with: pip3 install openpyxl")
    sys.exit(1)


# ── Image category → prefix: category name (lowercase) = prefix ──────────────
# After batch-renaming categories to match prefixes, mapping is trivial.
# Special cases only needed where capitalized prefix != category name.

def get_image_prefix(category_name):
    """Get image prefix for a category. Category names = capitalized prefix names."""
    return category_name.lower()

# Match mode: 'random' means don't try name matching (images ≠ card words)
IMAGE_RANDOM_PREFIXES = {
    'baking', 'toys', 'xmas', 'deck',
}


# ── Read v2 Excel ───────────────────────────────────────────────────────────

def read_level_sheet(filepath):
    """Read the 'level' sheet → dict[int, LevelConfig]."""
    wb = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
    ws = wb['level']
    rows = list(ws.iter_rows(values_only=True))
    wb.close()

    if len(rows) < 2:
        return {}

    # Row 0 = headers: level, 收集槽数量, 桌面牌1数量, ..., 类别数量
    result = {}
    for row in rows[1:]:
        level = row[0]
        if level is None:
            continue
        level = int(level)
        max_slots = int(row[1])
        # Column sizes: columns 2-6 (桌面牌1数量 to 桌面牌5数量), skip None
        column_sizes = []
        for i in range(2, 7):
            if i < len(row) and row[i] is not None:
                column_sizes.append(int(row[i]))
        num_categories = int(row[7]) if len(row) > 7 and row[7] is not None else 0
        max_steps = int(row[8]) if len(row) > 8 and row[8] is not None else 0

        result[level] = {
            'maxSlots': max_slots,
            'columnSizes': column_sizes,
            'numCategories': num_categories,
            'maxSteps': max_steps,
        }
    return result


def read_card_sheet(filepath):
    """Read the 'card' sheet → dict[int, list[CategoryDef]]."""
    wb = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
    ws = wb['card']
    rows = list(ws.iter_rows(values_only=True))
    wb.close()

    if len(rows) < 2:
        return {}

    # Row 0 = headers: level, category, categoryId, categoryName, 图片, 单词数量, 1-8
    result = {}
    for row in rows[1:]:
        level = row[0]
        if level is None:
            continue
        level = int(level)

        cat_name = str(row[3]).strip() if row[3] else ''
        is_image = row[4] == 1 or row[4] == '1'
        card_count = int(row[5]) if row[5] else 0

        # Card words: columns 6-13 (indices 1-8)
        card_words = []
        for i in range(6, 14):
            if i < len(row) and row[i] is not None:
                w = str(row[i]).strip()
                if w and w != '':
                    card_words.append(w)

        cat_def = {
            'categoryId': str(row[2]).strip() if row[2] else '',
            'categoryName': cat_name,
            'isImage': is_image,
            'cardCount': card_count,
            'cardWords': card_words,
        }

        if level not in result:
            result[level] = []
        result[level].append(cat_def)

    return result


# ── Image index ─────────────────────────────────────────────────────────────

def build_image_index(res_dir):
    """Scan res/Item/*.png, build { prefix: { item_name: filename } } index."""
    item_dir = os.path.join(res_dir, 'Item')
    if not os.path.isdir(item_dir):
        print("Warning: %s not found" % item_dir)
        return {}

    index = {}  # prefix -> { normalized_name: full_filename_without_ext }
    all_prefixes = set()

    for fname in sorted(os.listdir(item_dir)):
        if not fname.endswith('.png'):
            continue
        base = fname[:-4]  # remove .png
        parts = base.split('_')
        if len(parts) < 3:
            continue
        prefix = parts[0]
        # item name = middle parts (between prefix and trailing number)
        item_name = '_'.join(parts[1:-1])  # e.g. 'diamondring', 'doubledeckerbus'
        all_prefixes.add(prefix)

        if prefix not in index:
            index[prefix] = {}
        index[prefix][item_name.lower()] = fname[:-4]  # store without .png

    return index, all_prefixes


def resolve_image(category_name, card_word, image_index, used_images, rng):
    """Resolve a card word to an image path for an image-type category.

    Category names = capitalized prefix names (after batch rename).
    Returns: "res/Item/<filename>.png" or None if no mapping available.
    """
    idx, all_prefixes = image_index

    # Category name lowercased = prefix (e.g. "Bird" → "bird")
    prefix = get_image_prefix(category_name)

    if prefix not in idx:
        print("  Warning: prefix '%s' not found in image index (category '%s')" % (prefix, category_name))
        return None

    prefix_items = idx[prefix]

    # Track used images per prefix
    if prefix not in used_images:
        used_images[prefix] = set()

    matched_key = None

    # If not a random-only prefix, try name matching first
    if prefix not in IMAGE_RANDOM_PREFIXES:
        normalized = card_word.lower().replace(' ', '')
        if normalized in prefix_items:
            matched_key = normalized

    # Fallback to random unused image
    if matched_key is None:
        available = [k for k in prefix_items if k not in used_images[prefix]]
        if available:
            matched_key = rng.choice(available)
        elif prefix_items:
            # All used, pick any
            matched_key = rng.choice(list(prefix_items.keys()))

    if matched_key is None:
        return None

    used_images[prefix].add(matched_key)
    return "res/Item/%s.png" % prefix_items[matched_key]


# ── Card generation ─────────────────────────────────────────────────────────

def generate_cards_for_level(level_config, categories, image_index, rng):
    """Generate all cards for a level and distribute to tableau + hand pile.

    Returns: { tableau, categoryTargets, handPile }
    """
    column_sizes = level_config['columnSizes']
    max_slots = level_config['maxSlots']
    tableau_size = sum(column_sizes)

    # Generate all cards
    all_cards = []
    category_targets = {}
    used_images = {}

    for cat_def in categories:
        cat_name = cat_def['categoryName']
        is_image = cat_def['isImage']
        card_words = cat_def['cardWords']

        # Category key: image categories use name, text categories use name_word
        cat_key = cat_name if is_image else cat_name + '_word'

        # Gold card
        gold_card = {
            'type': 'gold',
            'category': cat_key,
            'name': cat_name,
            'isText': not is_image,
        }
        all_cards.append(gold_card)

        # Regular cards
        category_targets[cat_key] = len(card_words)
        for word in card_words:
            card = {
                'type': 'regular',
                'category': cat_key,
                'name': word,
                'isText': not is_image,
            }
            if is_image:
                img_path = resolve_image(cat_name, word, image_index, used_images, rng)
                if img_path:
                    card['image'] = img_path
            all_cards.append(card)

    total_cards = len(all_cards)
    hand_count = total_cards - tableau_size

    if hand_count < 0:
        print("  Warning: total cards (%d) < tableau size (%d), padding needed" % (total_cards, tableau_size))
        hand_count = 0

    # Shuffle all cards
    rng.shuffle(all_cards)

    # Split into tableau cards and hand pile
    tableau_cards = all_cards[:tableau_size]
    hand_pile = all_cards[tableau_size:]

    # Build tableau columns
    tableau = []
    offset = 0
    for col_size in column_sizes:
        column = []
        for i in range(col_size):
            card = tableau_cards[offset + i]
            is_face_up = (i == col_size - 1)  # only last (bottom) card is face-up
            column.append({
                'card': card,
                'faceUp': is_face_up,
            })
        tableau.append(column)
        offset += col_size

    return {
        'tableau': tableau,
        'categoryTargets': category_targets,
        'handPile': hand_pile,
        'handDisplay': [],
    }


# ── Layout Quality Validation ────────────────────────────────────────────────

def try_greedy_drag(sim_tableau, sim_display, sim_slots, category_targets):
    """Try one greedy drag operation. Modifies sim state in-place. Returns True if a drag was made."""

    # Priority 1: face-up tableau card → matching slot (collect)
    for ci, col in enumerate(sim_tableau):
        if not col or not col[-1]['faceUp']:
            continue
        card = col[-1]['card']
        if card['type'] == 'regular':
            for si, s in enumerate(sim_slots):
                if s is not None and s['key'] == card['category'] and s['collected'] < s['target']:
                    col.pop()
                    s['collected'] += 1
                    if s['collected'] >= s['target']:
                        sim_slots[si] = None
                    # Auto-flip
                    if col and not col[-1]['faceUp']:
                        col[-1]['faceUp'] = True
                    return True

    # Priority 1b: face-up tableau gold → empty slot
    for ci, col in enumerate(sim_tableau):
        if not col or not col[-1]['faceUp']:
            continue
        card = col[-1]['card']
        if card['type'] == 'gold':
            for si, s in enumerate(sim_slots):
                if s is None:
                    col.pop()
                    sim_slots[si] = {
                        'key': card['category'],
                        'collected': 0,
                        'target': category_targets.get(card['category'], 0),
                    }
                    if col and not col[-1]['faceUp']:
                        col[-1]['faceUp'] = True
                    return True

    # Priority 1c: hand display top → matching slot
    if sim_display:
        top = sim_display[-1]
        if top['type'] == 'regular':
            for si, s in enumerate(sim_slots):
                if s is not None and s['key'] == top['category'] and s['collected'] < s['target']:
                    sim_display.pop()
                    s['collected'] += 1
                    if s['collected'] >= s['target']:
                        sim_slots[si] = None
                    return True
        if top['type'] == 'gold':
            for si, s in enumerate(sim_slots):
                if s is None:
                    sim_display.pop()
                    sim_slots[si] = {
                        'key': top['category'],
                        'collected': 0,
                        'target': category_targets.get(top['category'], 0),
                    }
                    return True

    # Priority 2: tableau → same-category column (stack)
    for ci, col in enumerate(sim_tableau):
        if not col or not col[-1]['faceUp']:
            continue
        card = col[-1]['card']
        if card['type'] == 'gold':
            continue  # gold cards don't stack on columns by category
        for ti, tcol in enumerate(sim_tableau):
            if ti == ci or not tcol:
                continue
            top_tc = tcol[-1]
            if top_tc['card']['type'] == 'gold':
                continue  # sealed
            if card['category'] == top_tc['card']['category']:
                tc = col.pop()
                tcol.append(tc)
                if col and not col[-1]['faceUp']:
                    col[-1]['faceUp'] = True
                return True

    # Priority 3: hand display → column (stack)
    if sim_display:
        top = sim_display[-1]
        for ti, tcol in enumerate(sim_tableau):
            if not tcol:
                # Can stack on empty column
                sim_display.pop()
                tcol.append({'card': top, 'faceUp': True})
                return True
            top_tc = tcol[-1]
            if top_tc['card']['type'] == 'gold':
                continue
            if top['category'] == top_tc['card']['category']:
                sim_display.pop()
                tcol.append({'card': top, 'faceUp': True})
                return True

    return False


def validate_layout(tableau, hand_pile, category_targets, max_slots):
    """Check 3 early-game quality conditions. Returns True if layout is good."""

    # ── 条件 3：金牌可及性 ──
    gold_accessible = False
    for col in tableau:
        if col and col[-1]['faceUp'] and col[-1]['card']['type'] == 'gold':
            gold_accessible = True
            break
    if not gold_accessible:
        for card in hand_pile[:5]:
            if card['type'] == 'gold':
                gold_accessible = True
                break
    if not gold_accessible:
        return False

    # ── 条件 1：开局可操作 ──
    face_up_cards = []  # (colIdx, card)
    for ci, col in enumerate(tableau):
        if col and col[-1]['faceUp']:
            face_up_cards.append((ci, col[-1]['card']))

    has_immediate_move = False

    # 检查面朝上牌之间的交互
    for i, (ci, card_i) in enumerate(face_up_cards):
        # 金牌 → 可以进空槽
        if card_i['type'] == 'gold':
            has_immediate_move = True
            break
        # 同类别牌 → 可以叠放
        for j, (cj, card_j) in enumerate(face_up_cards):
            if i != j and card_i['category'] == card_j['category']:
                has_immediate_move = True
                break
        if has_immediate_move:
            break

    if not has_immediate_move:
        # 检查手牌前 2 张
        for card in hand_pile[:2]:
            if card['type'] == 'gold':
                has_immediate_move = True
                break
            for ci, fu_card in face_up_cards:
                if card['category'] == fu_card['category']:
                    has_immediate_move = True
                    break
            if has_immediate_move:
                break

    if not has_immediate_move:
        return False

    # ── 条件 2：前期流畅性（贪心模拟）──
    # 深拷贝状态进行模拟
    sim_tableau = [[{'card': dict(tc['card']), 'faceUp': tc['faceUp']} for tc in col] for col in tableau]
    sim_hand = [dict(c) for c in hand_pile]
    sim_display = []
    sim_slots = [None] * max_slots

    drag_count = 0
    consec_flips = 0

    for step in range(20):  # 最多模拟 20 步
        if drag_count >= 5:
            break  # 已满 5 次拖动，通过

        # 尝试找拖动操作（贪心优先级）
        did_drag = try_greedy_drag(sim_tableau, sim_display, sim_slots, category_targets)

        if did_drag:
            drag_count += 1
            consec_flips = 0
        else:
            # 翻手牌
            if sim_hand:
                sim_display.append(sim_hand.pop(0))
                consec_flips += 1
                if consec_flips > 3:
                    return False  # 连续翻牌超过 3 次
            else:
                break  # 手牌空了

    return True


# ── MCTS Solver (Monte Carlo Tree Search) ───────────────────────────────────

MAX_NODES = 2000000
MAX_RECYCLES = 3
DEFAULT_MCTS_ITERATIONS = 5000


def can_stack_on_column(card, col):
    """Check if a card can be stacked on a column."""
    if len(col) == 0:
        return True
    top_card = col[-1]
    if top_card['card']['type'] == 'gold':
        return False  # sealed column
    return card['category'] == top_card['card']['category']


def verify_solvable(tableau, category_targets, max_steps, max_slots, hand_pile, mcts_iterations=None):
    """MCTS solver to verify a level layout is solvable.

    Returns: { solvable: bool, nodesExplored: int, stepsUsed: int }
    """
    if mcts_iterations is None:
        mcts_iterations = DEFAULT_MCTS_ITERATIONS

    # Deep clone state
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

    nodes_explored = [0]  # mutable counter

    def get_top_card(col):
        return col[-1] if col else None

    def get_moves():
        moves = []
        has_empty_slot = any(s is None for s in state['slots'])

        # Tableau top cards → slot
        for ci in range(len(state['tableau'])):
            top = get_top_card(state['tableau'][ci])
            if not top or not top['faceUp']:
                continue

            if top['card']['type'] == 'regular':
                slot_idx = None
                for si, s in enumerate(state['slots']):
                    if s is not None and s['key'] == top['card']['category'] and s['collected'] < s['target']:
                        slot_idx = si
                        break
                if slot_idx is not None:
                    moves.append({'type': 'tableau_to_slot', 'colIdx': ci, 'slotIdx': slot_idx})

            if top['card']['type'] == 'gold' and has_empty_slot:
                moves.append({'type': 'tableau_gold_to_slot', 'colIdx': ci})

        # Hand display → slot
        if state['handDisplay']:
            top_card = state['handDisplay'][-1]
            if top_card['type'] == 'regular':
                slot_idx = None
                for si, s in enumerate(state['slots']):
                    if s is not None and s['key'] == top_card['category'] and s['collected'] < s['target']:
                        slot_idx = si
                        break
                if slot_idx is not None:
                    moves.append({'type': 'display_to_slot', 'slotIdx': slot_idx})

            if top_card['type'] == 'gold' and has_empty_slot:
                moves.append({'type': 'display_gold_to_slot'})

        # Tableau → column
        for ci in range(len(state['tableau'])):
            col = state['tableau'][ci]
            top = get_top_card(col)
            if not top or not top['faceUp']:
                continue
            for ti in range(len(state['tableau'])):
                if ti == ci:
                    continue
                if can_stack_on_column(top['card'], state['tableau'][ti]):
                    moves.append({'type': 'tableau_to_column', 'srcCol': ci, 'dstCol': ti})

        # Hand display → column
        if state['handDisplay']:
            top_card = state['handDisplay'][-1]
            for ti in range(len(state['tableau'])):
                if can_stack_on_column(top_card, state['tableau'][ti]):
                    moves.append({'type': 'display_to_column', 'dstCol': ti})

        # Flip hand
        if state['handPile']:
            moves.append({'type': 'flip_hand'})

        # Recycle
        if not state['handPile'] and state['handDisplay'] and state['recycleCount'] < MAX_RECYCLES:
            moves.append({'type': 'recycle'})

        return moves

    def auto_flip(col):
        if col and not col[-1]['faceUp']:
            col[-1]['faceUp'] = True
            return True
        return False

    def apply_move(move):
        undo = {'type': move['type']}

        if move['type'] == 'tableau_to_slot':
            state['stepsLeft'] -= 1
            col = state['tableau'][move['colIdx']]
            tc = col.pop()
            undo['colIdx'] = move['colIdx']
            undo['tc'] = tc
            undo['slotIdx'] = move['slotIdx']

            slot = state['slots'][move['slotIdx']]
            undo['prevCollected'] = slot['collected']
            slot['collected'] += 1
            if slot['collected'] >= slot['target']:
                undo['completed'] = dict(slot)
                state['slots'][move['slotIdx']] = None
                state['completedCount'] += 1
            undo['flipped'] = auto_flip(col)

        elif move['type'] == 'tableau_gold_to_slot':
            state['stepsLeft'] -= 1
            col = state['tableau'][move['colIdx']]
            tc = col.pop()
            undo['colIdx'] = move['colIdx']
            undo['tc'] = tc

            empty_idx = next(i for i, s in enumerate(state['slots']) if s is None)
            state['slots'][empty_idx] = {
                'key': tc['card']['category'],
                'collected': 0,
                'target': category_targets.get(tc['card']['category'], 0),
            }
            undo['slotIdx'] = empty_idx
            undo['flipped'] = auto_flip(col)

        elif move['type'] == 'display_to_slot':
            state['stepsLeft'] -= 1
            card = state['handDisplay'].pop()
            undo['card'] = card
            undo['slotIdx'] = move['slotIdx']

            slot = state['slots'][move['slotIdx']]
            undo['prevCollected'] = slot['collected']
            slot['collected'] += 1
            if slot['collected'] >= slot['target']:
                undo['completed'] = dict(slot)
                state['slots'][move['slotIdx']] = None
                state['completedCount'] += 1

        elif move['type'] == 'display_gold_to_slot':
            state['stepsLeft'] -= 1
            card = state['handDisplay'].pop()
            undo['card'] = card
            empty_idx = next(i for i, s in enumerate(state['slots']) if s is None)
            state['slots'][empty_idx] = {
                'key': card['category'],
                'collected': 0,
                'target': category_targets.get(card['category'], 0),
            }
            undo['slotIdx'] = empty_idx

        elif move['type'] == 'tableau_to_column':
            state['stepsLeft'] -= 1
            src_col = state['tableau'][move['srcCol']]
            tc = src_col.pop()
            undo['srcCol'] = move['srcCol']
            undo['dstCol'] = move['dstCol']
            undo['tc'] = tc
            state['tableau'][move['dstCol']].append(tc)
            undo['flipped'] = auto_flip(src_col)

        elif move['type'] == 'display_to_column':
            state['stepsLeft'] -= 1
            card = state['handDisplay'].pop()
            undo['card'] = card
            undo['dstCol'] = move['dstCol']
            state['tableau'][move['dstCol']].append({'card': card, 'faceUp': True})

        elif move['type'] == 'flip_hand':
            state['stepsLeft'] -= 1
            card = state['handPile'].pop()
            state['handDisplay'].append(card)
            undo['card'] = card

        elif move['type'] == 'recycle':
            state['stepsLeft'] -= 1
            undo['displaySnapshot'] = list(state['handDisplay'])
            state['handPile'] = list(reversed(state['handDisplay']))
            state['handDisplay'] = []
            state['recycleCount'] += 1

        return undo

    def undo_move(undo):
        if undo['type'] == 'tableau_to_slot':
            state['stepsLeft'] += 1
            col = state['tableau'][undo['colIdx']]
            if undo.get('flipped'):
                col[-1]['faceUp'] = False
            col.append(undo['tc'])
            if 'completed' in undo:
                state['completedCount'] -= 1
                state['slots'][undo['slotIdx']] = undo['completed']
                state['slots'][undo['slotIdx']]['collected'] = undo['prevCollected']
            else:
                state['slots'][undo['slotIdx']]['collected'] -= 1

        elif undo['type'] == 'tableau_gold_to_slot':
            state['stepsLeft'] += 1
            col = state['tableau'][undo['colIdx']]
            if undo.get('flipped'):
                col[-1]['faceUp'] = False
            col.append(undo['tc'])
            state['slots'][undo['slotIdx']] = None

        elif undo['type'] == 'display_to_slot':
            state['stepsLeft'] += 1
            if 'completed' in undo:
                state['completedCount'] -= 1
                state['slots'][undo['slotIdx']] = undo['completed']
                state['slots'][undo['slotIdx']]['collected'] = undo['prevCollected']
            else:
                state['slots'][undo['slotIdx']]['collected'] -= 1
            state['handDisplay'].append(undo['card'])

        elif undo['type'] == 'display_gold_to_slot':
            state['stepsLeft'] += 1
            state['slots'][undo['slotIdx']] = None
            state['handDisplay'].append(undo['card'])

        elif undo['type'] == 'tableau_to_column':
            state['stepsLeft'] += 1
            state['tableau'][undo['dstCol']].pop()
            if undo.get('flipped'):
                state['tableau'][undo['srcCol']][-1]['faceUp'] = False
            state['tableau'][undo['srcCol']].append(undo['tc'])

        elif undo['type'] == 'display_to_column':
            state['stepsLeft'] += 1
            state['tableau'][undo['dstCol']].pop()
            state['handDisplay'].append(undo['card'])

        elif undo['type'] == 'flip_hand':
            state['stepsLeft'] += 1
            state['handDisplay'].pop()
            state['handPile'].append(undo['card'])

        elif undo['type'] == 'recycle':
            state['stepsLeft'] += 1
            state['handDisplay'] = undo['displaySnapshot']
            state['handPile'] = []
            state['recycleCount'] -= 1

    # ── MCTS Implementation ──────────────────────────────────────────

    import math

    EXPLORATION_C = 1.414
    best_steps = [None]

    class MCTSNode:
        __slots__ = ['parent', 'move', 'children', 'untried_moves', 'visits', 'wins', 'total_steps', 'depth']
        def __init__(self, parent, move, depth):
            self.parent = parent
            self.move = move
            self.children = []
            self.untried_moves = None  # lazy init
            self.visits = 0
            self.wins = 0
            self.total_steps = 0
            self.depth = depth

        def ucb1(self, parent_visits):
            if self.visits == 0:
                return float('inf')
            exploit = self.wins / self.visits
            explore = EXPLORATION_C * math.sqrt(math.log(parent_visits) / self.visits)
            return exploit + explore

        def best_child(self):
            pv = self.visits
            best = None
            best_val = -1
            for c in self.children:
                v = c.ucb1(pv)
                if v > best_val:
                    best_val = v
                    best = c
            return best

    def init_untried_moves(node):
        if node.untried_moves is None:
            node.untried_moves = get_moves()
            random.shuffle(node.untried_moves)

    def get_move_weight(move):
        """Higher weight = higher priority for greedy rollout."""
        mt = move['type']
        if mt in ('tableau_to_slot', 'tableau_gold_to_slot', 'display_to_slot', 'display_gold_to_slot'):
            return 100
        if mt == 'tableau_to_column':
            # Prefer moves that uncover hidden cards
            return 50
        if mt == 'display_to_column':
            return 20
        if mt == 'flip_hand':
            return 20
        return 10  # recycle

    def greedy_rollout_choice(moves):
        """Greedy: pick the highest-weight move, random tiebreak among same weight."""
        best_weight = -1
        candidates = []
        for m in moves:
            w = get_move_weight(m)
            if w > best_weight:
                best_weight = w
                candidates = [m]
            elif w == best_weight:
                candidates.append(m)
        if len(candidates) == 1:
            return candidates[0]
        return candidates[random.randint(0, len(candidates) - 1)]

    def rollout():
        rollout_undos = []
        won = False
        while state['stepsLeft'] > 0:
            if state['completedCount'] >= state['numCategories']:
                won = True
                break
            moves = get_moves()
            if not moves:
                break
            move = greedy_rollout_choice(moves)
            rollout_undos.append(apply_move(move))
            nodes_explored[0] += 1
        steps_used = max_steps - state['stepsLeft']
        for u in reversed(rollout_undos):
            undo_move(u)
        return won, steps_used

    def mcts_iterate(root):
        # SELECT
        node = root
        path_undos = []
        while node.untried_moves is not None and len(node.untried_moves) == 0 and node.children:
            node = node.best_child()
            path_undos.append(apply_move(node.move))
            nodes_explored[0] += 1

        # Check if already won at this node
        if state['completedCount'] >= state['numCategories']:
            steps_used = max_steps - state['stepsLeft']
            if best_steps[0] is None or steps_used < best_steps[0]:
                best_steps[0] = steps_used
            n = node
            while n is not None:
                n.visits += 1
                n.wins += 1
                n.total_steps += steps_used
                n = n.parent
            for u in reversed(path_undos):
                undo_move(u)
            return

        # EXPAND
        init_untried_moves(node)
        if node.untried_moves:
            move = node.untried_moves.pop()
            child = MCTSNode(parent=node, move=move, depth=node.depth + 1)
            node.children.append(child)
            path_undos.append(apply_move(move))
            nodes_explored[0] += 1
            node = child

        # SIMULATE
        won, steps_used = rollout()
        if won and (best_steps[0] is None or steps_used < best_steps[0]):
            best_steps[0] = steps_used

        # BACKPROPAGATE
        n = node
        while n is not None:
            n.visits += 1
            if won:
                n.wins += 1
                n.total_steps += steps_used
            n = n.parent

        # Undo path
        for u in reversed(path_undos):
            undo_move(u)

    root = MCTSNode(parent=None, move=None, depth=0)
    init_untried_moves(root)

    for _ in range(mcts_iterations):
        mcts_iterate(root)
        if nodes_explored[0] > MAX_NODES:
            break

    solvable = best_steps[0] is not None
    steps_used = best_steps[0] if solvable else 0
    return {'solvable': solvable, 'nodesExplored': nodes_explored[0], 'stepsUsed': steps_used}


# ── Generate level_settings.js ──────────────────────────────────────────────

def generate_settings_js(level_configs, card_defs, output_path):
    """Generate level_settings.js with all 108 levels."""
    lines = []
    lines.append('/**')
    lines.append(' * Shared Level Settings for Solitaire Tile (SAJLike)')
    lines.append(' *')
    lines.append(' * Auto-generated from level_config_v2.xlsx.')
    lines.append(' * Used by game.js, generator.html, and converter.html.')
    lines.append(' */')
    lines.append('')
    lines.append('const LEVEL_SETTINGS = {')

    for level in sorted(level_configs.keys()):
        cfg = level_configs[level]
        cats = card_defs.get(level, [])

        # Total cards = num categories (gold cards) + sum of all card words
        total_cards = len(cats)
        for cat in cats:
            total_cards += len(cat['cardWords'])

        max_steps = cfg['maxSteps']
        col_sizes_str = ', '.join(str(s) for s in cfg['columnSizes'])
        num_columns = len(cfg['columnSizes'])

        lines.append('    %d: {' % level)
        lines.append('        maxSlots: %d, numCategories: %d, numColumns: %d,' % (
            cfg['maxSlots'], len(cats), num_columns))
        lines.append('        columnSizes: [%s], maxSteps: %d,' % (col_sizes_str, max_steps))
        lines.append('    },')

    lines.append('};')
    lines.append('')
    lines.append('function countTotalColumnCards(columnSizes) {')
    lines.append('    return columnSizes.reduce((sum, n) => sum + n, 0);')
    lines.append('}')
    lines.append('')
    lines.append('const MAX_SETTINGS_LEVEL = Math.max(...Object.keys(LEVEL_SETTINGS).map(Number));')
    lines.append('')
    lines.append('function getLevelSettings(level) {')
    lines.append('    const settings = LEVEL_SETTINGS[level] || LEVEL_SETTINGS[MAX_SETTINGS_LEVEL];')
    lines.append('    const totalColumnCards = countTotalColumnCards(settings.columnSizes);')
    lines.append('    return {')
    lines.append('        numCategories: settings.numCategories,')
    lines.append('        maxSlots: settings.maxSlots,')
    lines.append('        maxSteps: settings.maxSteps,')
    lines.append('        numColumns: settings.numColumns,')
    lines.append('        columnSizes: settings.columnSizes,')
    lines.append('        totalColumnCards,')
    lines.append('    };')
    lines.append('}')

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print("Wrote %s (%d levels)" % (output_path, len(level_configs)))


# ── Read zh-CN translations ────────────────────────────────────────────────

def read_zh_translations(base_dir):
    """Read zh-CN translations from level_config_v2.xlsx card sheet.

    The Excel card sheet has columns:
      col 4: categoryName (en), col 15: 类别中文
      cols 7-14: en words, cols 16-23: zh words

    Returns: (basic_map, basic_fallback, category_map)
      basic_map: {(en_name, category_en): zh}
      basic_fallback: {en_name: zh}
      category_map: {category_en: zh}
    """
    config_file = os.path.join(base_dir, 'config', 'level_config_v2.xlsx')
    if not os.path.exists(config_file):
        print("  Warning: %s not found for zh translations" % config_file)
        return {}, {}, {}

    wb = openpyxl.load_workbook(config_file, data_only=True)
    ws = wb['card']

    category_map = {}  # {en_name: zh}
    basic_map = {}     # {(en_name, category_en): zh}
    basic_fallback = {}  # {en_name: zh}

    for r in range(2, ws.max_row + 1):
        level = ws.cell(r, 1).value
        if level is None:
            continue
        cat_name = str(ws.cell(r, 4).value or '').strip()
        cat_zh = str(ws.cell(r, 15).value or '').strip()

        if cat_name and cat_zh:
            category_map[cat_name] = cat_zh

        for i in range(8):
            en_val = ws.cell(r, 7 + i).value
            zh_val = ws.cell(r, 16 + i).value
            if en_val and zh_val:
                en = str(en_val).strip()
                zh = str(zh_val).strip()
                if en and zh:
                    basic_map[(en, cat_name)] = zh
                    # Fallback: first occurrence wins
                    if en not in basic_fallback:
                        basic_fallback[en] = zh

    # Build positional map for image categories where en_word is "0"
    # {(category_name, index): zh}
    image_zh_map = {}
    for r in range(2, ws.max_row + 1):
        level = ws.cell(r, 1).value
        if level is None:
            continue
        cat_name = str(ws.cell(r, 4).value or '').strip()
        is_image = ws.cell(r, 5).value
        if not is_image:
            continue
        for i in range(8):
            zh_val = ws.cell(r, 16 + i).value
            if zh_val:
                image_zh_map[(cat_name, i)] = str(zh_val).strip()

    wb.close()
    print("  Read %d category translations, %d word translations (context), %d word translations (fallback), %d image positional translations from Excel" % (
        len(category_map), len(basic_map), len(basic_fallback), len(image_zh_map)))

    return basic_map, basic_fallback, category_map, image_zh_map


# ── Export level_card_defs.js ─────────────────────────────────────────────

def generate_card_defs_js(card_defs, image_index, output_path, zh_translations=None):
    """Generate level_card_defs.js with all level card definitions.

    For isImage categories, resolves image paths at export time so
    generator.html doesn't need image mapping logic.
    If zh_translations is provided, includes zhCategoryName and zh fields.
    """
    rng = random.Random(42)
    used_images = {}

    basic_map, basic_fallback, category_map, image_zh_map = zh_translations if zh_translations else ({}, {}, {}, {})
    has_zh = bool(zh_translations)

    lines = []
    lines.append('/**')
    lines.append(' * Level Card Definitions for Solitaire Tile (SAJLike)')
    lines.append(' *')
    lines.append(' * Auto-generated from level_config_v2.xlsx by:')
    lines.append(' *   python3 generate_levels.py --export-defs')
    lines.append(' *')
    lines.append(' * Used by generator.html to generate solvable layouts.')
    lines.append(' */')
    lines.append('')
    lines.append('const LEVEL_CARD_DEFS = {')

    for level in sorted(card_defs.keys()):
        cats = card_defs[level]
        lines.append('    %d: [' % level)

        # Reset used_images per level so each level gets fresh assignments
        used_images_level = {}

        for cat_def in cats:
            cat_name = cat_def['categoryName']
            is_image = cat_def['isImage']
            card_words = cat_def['cardWords']

            zh_cat = json.dumps(category_map.get(cat_name, ''), ensure_ascii=False) if has_zh else None

            if is_image:
                # Resolve image paths for each card word
                word_entries = []
                for wi, word in enumerate(card_words):
                    img_path = resolve_image(cat_name, word, image_index, used_images_level, rng)
                    if has_zh:
                        # For image cards with name "0", use positional map
                        zh_word = image_zh_map.get((cat_name, wi)) or basic_map.get((word, cat_name)) or basic_fallback.get(word, '')
                    else:
                        zh_word = ''
                    img_str = json.dumps(img_path or '', ensure_ascii=False)
                    if has_zh:
                        word_entries.append('{ name: %s, zh: %s, image: %s }' % (
                            json.dumps(word, ensure_ascii=False),
                            json.dumps(zh_word, ensure_ascii=False),
                            img_str,
                        ))
                    else:
                        word_entries.append('{ name: %s, image: %s }' % (
                            json.dumps(word, ensure_ascii=False),
                            img_str,
                        ))
                if has_zh:
                    lines.append('        { categoryName: %s, zhCategoryName: %s, isImage: true, cardWords: [%s] },' % (
                        json.dumps(cat_name, ensure_ascii=False),
                        zh_cat,
                        ', '.join(word_entries),
                    ))
                else:
                    lines.append('        { categoryName: %s, isImage: true, cardWords: [%s] },' % (
                        json.dumps(cat_name, ensure_ascii=False),
                        ', '.join(word_entries),
                    ))
            else:
                # Text category: cardWords as objects with name and zh
                if has_zh:
                    word_entries = []
                    for w in card_words:
                        zh_word = basic_map.get((w, cat_name)) or basic_fallback.get(w, '')
                        word_entries.append('{ name: %s, zh: %s }' % (
                            json.dumps(w, ensure_ascii=False),
                            json.dumps(zh_word, ensure_ascii=False),
                        ))
                    lines.append('        { categoryName: %s, zhCategoryName: %s, isImage: false, cardWords: [%s] },' % (
                        json.dumps(cat_name, ensure_ascii=False),
                        zh_cat,
                        ', '.join(word_entries),
                    ))
                else:
                    words_str = ', '.join(json.dumps(w, ensure_ascii=False) for w in card_words)
                    lines.append('        { categoryName: %s, isImage: false, cardWords: [%s] },' % (
                        json.dumps(cat_name, ensure_ascii=False),
                        words_str,
                    ))

        lines.append('    ],')

    lines.append('};')

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print("Wrote %s (%d levels)" % (output_path, len(card_defs)))


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Generate SAJLike solitaire levels from v2 config')
    parser.add_argument('--settings', action='store_true', help='Generate level_settings.js only')
    parser.add_argument('--export-defs', action='store_true',
                        help='Export level_card_defs.js (v2 card definitions for generator.html)')
    parser.add_argument('--levels', type=str, default='1-10',
                        help='Level range to generate, e.g. "1-10" or "1-108" (default: 1-10)')
    parser.add_argument('--layouts', type=int, default=5,
                        help='Number of solvable layouts per level (default: 5)')
    parser.add_argument('--attempts', type=int, default=200,
                        help='Max attempts per layout for MCTS verification (default: 200)')
    parser.add_argument('--seed', type=int, default=None,
                        help='Random seed for reproducibility')
    parser.add_argument('--step-min-ratio', type=float, default=0.0,
                        help='Min ratio of stepsUsed/maxSteps to accept (default: 0.0, disabled)')
    parser.add_argument('--step-max-ratio', type=float, default=1.0,
                        help='Max ratio of stepsUsed/maxSteps to accept (default: 1.0, disabled)')
    parser.add_argument('--mcts-iterations', type=int, default=DEFAULT_MCTS_ITERATIONS,
                        help='MCTS iteration count per solve (default: %d)' % DEFAULT_MCTS_ITERATIONS)
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.abspath(__file__))
    config_file = os.path.join(base_dir, 'config', 'level_config_v2.xlsx')
    res_dir = os.path.join(base_dir, 'res')
    output_dir = os.path.join(base_dir, 'level')
    settings_path = os.path.join(base_dir, 'level_settings.js')

    if not os.path.exists(config_file):
        print("Error: %s not found" % config_file)
        sys.exit(1)

    # Read v2 config
    print("Reading %s ..." % config_file)
    level_configs = read_level_sheet(config_file)
    card_defs = read_card_sheet(config_file)
    print("  %d levels, %d levels with card data" % (len(level_configs), len(card_defs)))

    # Settings mode
    if args.settings:
        generate_settings_js(level_configs, card_defs, settings_path)
        return

    # Export card defs mode
    if args.export_defs:
        defs_path = os.path.join(base_dir, 'level_card_defs.js')
        print("Building image index from %s ..." % os.path.join(res_dir, 'Item'))
        image_index = build_image_index(res_dir)
        if not isinstance(image_index, tuple):
            image_index = ({}, set())
        else:
            idx, all_prefixes = image_index
            print("  %d image prefixes, %d total images" % (len(idx), sum(len(v) for v in idx.values())))
        print("Reading zh-CN translations ...")
        zh_translations = read_zh_translations(base_dir)
        generate_card_defs_js(card_defs, image_index, defs_path, zh_translations)
        return

    # Parse level range
    if '-' in args.levels:
        parts = args.levels.split('-')
        level_start, level_end = int(parts[0]), int(parts[1])
    else:
        level_start = level_end = int(args.levels)
    levels_to_generate = list(range(level_start, level_end + 1))

    # Build image index
    print("Building image index from %s ..." % os.path.join(res_dir, 'Item'))
    image_index = build_image_index(res_dir)
    if isinstance(image_index, tuple):
        idx, all_prefixes = image_index
        print("  %d image prefixes, %d total images" % (len(idx), sum(len(v) for v in idx.values())))
    else:
        image_index = ({}, set())

    # Set up RNG
    rng = random.Random(args.seed if args.seed is not None else 42)

    os.makedirs(output_dir, exist_ok=True)

    success_count = 0
    fail_count = 0

    for level in levels_to_generate:
        if level not in level_configs:
            print("Level %d: no config found, skipping" % level)
            continue
        if level not in card_defs:
            print("Level %d: no card data found, skipping" % level)
            continue

        cfg = level_configs[level]
        cats = card_defs[level]

        # Calculate total cards and maxSteps
        total_cards = len(cats)  # gold cards
        for cat in cats:
            total_cards += len(cat['cardWords'])
        max_steps = cfg['maxSteps']
        tableau_size = sum(cfg['columnSizes'])
        hand_size = total_cards - tableau_size

        print("\n-- Level %d: %d categories, %d cards (tableau=%d, hand=%d), maxSteps=%d, slots=%d --" % (
            level, len(cats), total_cards, tableau_size, hand_size, max_steps, cfg['maxSlots']))

        if hand_size < 0:
            print("  ERROR: more tableau slots (%d) than total cards (%d)" % (tableau_size, total_cards))
            fail_count += 1
            continue

        # Generate multiple solvable layouts
        layouts = []
        total_attempts = 0
        validate_skips = 0
        for li in range(args.layouts):
            found = False
            for attempt in range(args.attempts):
                total_attempts += 1
                gen = generate_cards_for_level(cfg, cats, image_index, rng)

                # 布局质量检查（快速，<1ms）
                if not validate_layout(gen['tableau'], gen['handPile'], gen['categoryTargets'], cfg['maxSlots']):
                    validate_skips += 1
                    continue

                result = verify_solvable(
                    gen['tableau'],
                    gen['categoryTargets'],
                    max_steps,
                    cfg['maxSlots'],
                    gen['handPile'],
                    mcts_iterations=args.mcts_iterations
                )

                if result['solvable']:
                    steps_used = result['stepsUsed']
                    min_steps = int(max_steps * args.step_min_ratio)
                    max_steps_limit = int(max_steps * args.step_max_ratio)
                    if steps_used < min_steps or steps_used > max_steps_limit:
                        continue
                    print("  Layout %d/%d: solved on attempt %d (%d nodes, %d/%d steps)" % (
                        li + 1, args.layouts, attempt + 1, result['nodesExplored'], steps_used, max_steps))
                    layouts.append({
                        'config': {
                            'maxSlots': cfg['maxSlots'],
                            'maxSteps': max_steps,
                        },
                        'tableau': gen['tableau'],
                        'categoryTargets': gen['categoryTargets'],
                        'handPile': gen['handPile'],
                        'handDisplay': [],
                    })
                    found = True
                    break

            if not found:
                print("  Layout %d/%d: FAILED after %d attempts" % (li + 1, args.layouts, args.attempts))

        if validate_skips > 0:
            print("  (validate_layout filtered %d/%d attempts)" % (validate_skips, total_attempts))

        if not layouts:
            print("  FAILED: no solvable layouts found!")
            fail_count += 1
            continue

        out_path = os.path.join(output_dir, 'level_%d.json' % level)
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(layouts, f, indent=2, ensure_ascii=False)
            f.write('\n')
        print("  -> Wrote %s (%d layouts)" % (out_path, len(layouts)))
        success_count += 1

    print("\n=== Done: %d succeeded, %d failed ===" % (success_count, fail_count))


if __name__ == '__main__':
    main()
