#!/usr/bin/env python3
"""
Translate card names in CSV config files to French, German, Spanish, Portuguese.
Uses context-aware translations based on theme column.
"""

import csv
import sys

# Translation dictionary: name -> (French, German, Spanish, Portuguese)
# For context-dependent words: name -> { theme_substring: (fr, de, es, pt) }
TRANSLATIONS = {}

def load_dict_from_file(filepath):
    """Load a Python dict from a file containing a dict literal."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    return eval(content)

def merge_dicts(*dicts):
    """Merge multiple translation dicts."""
    result = {}
    for d in dicts:
        result.update(d)
    return result

def get_translation(name, theme, translations):
    """Look up translation for a name, considering theme context for ambiguous words."""
    entry = translations.get(name)
    if entry is None:
        return None

    # Simple tuple: same translation regardless of context
    if isinstance(entry, tuple):
        return entry

    # Dict: context-dependent, find matching theme substring
    if isinstance(entry, dict):
        for theme_key, trans in entry.items():
            if theme_key.lower() in theme.lower():
                return trans
        # If no theme match, return first entry as fallback
        return list(entry.values())[0]

    return None

def process_csv(filepath, name_col_idx, theme_col_idx, fr_col_idx, de_col_idx, es_col_idx, pt_col_idx, header_rows, translations):
    """Read CSV, fill in translations, write back."""
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

    translated = 0
    missing = []

    for i in range(header_rows, len(rows)):
        row = rows[i]
        if len(row) <= max(name_col_idx, theme_col_idx, fr_col_idx, de_col_idx, es_col_idx, pt_col_idx):
            continue

        name = row[name_col_idx].strip()
        theme = row[theme_col_idx].strip()

        if not name:
            continue

        trans = get_translation(name, theme, translations)
        if trans is None:
            missing.append(f"  {name} (theme: {theme})")
            continue

        fr, de, es, pt = trans
        row[fr_col_idx] = fr
        row[de_col_idx] = de
        row[es_col_idx] = es
        row[pt_col_idx] = pt
        translated += 1

    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)

    return translated, missing

def main():
    # Load translation dicts from the 4 agent output files
    print("Loading translation dictionaries...")

    dict_files = [
        '/tmp/translations_A_D.py',
        '/tmp/translations_e_to_k.py',
        '/tmp/translations_L_R.py',
        '/tmp/translations_S_Z.py',
    ]

    all_trans = {}
    for fpath in dict_files:
        try:
            d = load_dict_from_file(fpath)
            all_trans.update(d)
            print(f"  Loaded {len(d)} entries from {fpath}")
        except Exception as e:
            print(f"  Warning: Could not load {fpath}: {e}")

    print(f"Total translation entries: {len(all_trans)}")
    print()

    # Process basic card config
    # Columns: id(0), comments(1), basic_card_name(2), basic_card_res(3),
    #          basic_card_name_en(4), theme(5), French(6), German(7), Spanish(8), Portuguese(9)
    print("Processing sort_game_basic_card_config.csv...")
    t, m = process_csv(
        'config/sort_game_basic_card_config.csv',
        name_col_idx=4, theme_col_idx=5,
        fr_col_idx=6, de_col_idx=7, es_col_idx=8, pt_col_idx=9,
        header_rows=5, translations=all_trans
    )
    print(f"  Translated: {t}, Missing: {len(m)}")
    if m:
        print("  Missing translations:")
        for x in m[:20]:
            print(x)
        if len(m) > 20:
            print(f"  ... and {len(m)-20} more")
    print()

    # Process category card config
    # Columns: id(0), comments(1), category_name(2), basic_card_content(3),
    #          is_text(4), category_name_en(5), theme(6), French(7), German(8), Spanish(9), Portuguese(10)
    print("Processing sort_game_category_card_config.csv...")
    t, m = process_csv(
        'config/sort_game_category_card_config.csv',
        name_col_idx=5, theme_col_idx=6,
        fr_col_idx=7, de_col_idx=8, es_col_idx=9, pt_col_idx=10,
        header_rows=5, translations=all_trans
    )
    print(f"  Translated: {t}, Missing: {len(m)}")
    if m:
        print("  Missing translations:")
        for x in m[:20]:
            print(x)
        if len(m) > 20:
            print(f"  ... and {len(m)-20} more")

    print()
    print("Done!")

if __name__ == '__main__':
    main()
