# 图片文件实际复用报告

> 基于 level_card_defs.js 中确定性的 word→image 映射
> 统计同一张 PNG 图片在多个关卡中被使用的情况

## 总览

| 指标 | 数量 |
|------|------|
| 图片引用总次数 | 1124 |
| 去重图片文件数 | 597 |
| 跨关卡复用的图片 | **374** |
| 涉及的类别数 | 78 |

## 按类别分组的复用图片

### Bird（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| bird_dove_1.png | 3 | 关卡10: Dove / 关卡26: Lorikeet / 关卡55: Chicken |
| bird_eagle_2.png | 3 | 关卡10: Eagle / 关卡26: Macaw / 关卡55: Turkey |
| bird_finch_7.png | 3 | 关卡10: Finch / 关卡55: Ostrich / 关卡74: Referee |
| bird_heron_5.png | 3 | 关卡10: Heron / 关卡26: Eclectus / 关卡55: Goose |
| bird_owl_4.png | 3 | 关卡10: Owl / 关卡26: Parakeet / 关卡74: Kettle |
| bird_robin_6.png | 3 | 关卡10: Robin / 关卡26: Budgie / 关卡55: Quail |
| bird_swan_3.png | 3 | 关卡10: Swan / 关卡26: Cockatoo / 关卡55: Duck, Swan |
| bird_vulture_8.png | 3 | 关卡10: Vulture / 关卡55: Penguin / 关卡74: Bird |

### Drinks（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| drinks_espresso_2.png | 3 | 关卡3: Espresso / 关卡90: Rainbow / 关卡103: Bottle |
| drinks_juice_4.png | 3 | 关卡3: Juice / 关卡90: Xmas / 关卡103: Cup |
| drinks_lemonade_3.png | 3 | 关卡3: Lemonade / 关卡90: Lipstick / 关卡103: Carton |
| drinks_soda_1.png | 3 | 关卡3: Soda / 关卡90: Sunset / 关卡103: Glass |
| drinks_bubbletea_7.png | 2 | 关卡90: Mars / 关卡103: Almond |
| drinks_milk_6.png | 2 | 关卡90: Blusher / 关卡103: Oat |
| drinks_sportsdrink_8.png | 2 | 关卡90: Ladybug / 关卡103: Soy |
| drinks_tea_5.png | 2 | 关卡90: USA flag / 关卡103: Coconut |

### Gemstone（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| gemstone_crystal_5.png | 2 | 关卡13: Silicon / 关卡58: Tony |
| gemstone_diamond_1.png | 2 | 关卡13: Hydrogen / 关卡58: Grammy |
| gemstone_emerald_4.png | 2 | 关卡13: Oxygen / 关卡58: Emmy |
| gemstone_garnet_6.png | 2 | 关卡13: Sulfur / 关卡82: Medal |
| gemstone_opal_8.png | 2 | 关卡13: Nitrogen / 关卡82: Cutlery |
| gemstone_peridot_7.png | 2 | 关卡13: Sodium / 关卡82: Coin |
| gemstone_ruby_2.png | 2 | 关卡13: Carbon / 关卡82: Goblet |
| gemstone_sapphire_3.png | 2 | 关卡13: Iodine / 关卡58: Oscar |

### Hats（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| hats_panamahat_8.png | 5 | 关卡14: Panama / 关卡26: Wavy / 关卡43: Bob / 关卡70: Goatee / 关卡83: Fez |
| hats_cap_3.png | 4 | 关卡14: Cap / 关卡26: Coily / 关卡70: Balbo / 关卡83: Cap |
| hats_kepi_1.png | 4 | 关卡14: Kepi / 关卡26: Curly / 关卡43: Undercut / 关卡83: Helmet |
| hats_visor_5.png | 4 | 关卡14: Visor / 关卡43: Mohawk / 关卡70: Ducktail / 关卡83: Bowler |
| hats_beret_2.png | 3 | 关卡14: Beret / 关卡43: Afro / 关卡83: Bonnet |
| hats_sombrero_7.png | 3 | 关卡14: Sombrero / 关卡43: Mullet / 关卡83: Crown |
| hats_turban_6.png | 3 | 关卡14: Turban / 关卡43: Fade / 关卡83: Turban |
| hats_hat_4.png | 2 | 关卡14: Hat / 关卡83: Hat |

### Icons（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| icons_lockicon_7.png | 4 | 关卡5: Up / 关卡76: Keep right / 关卡89: Zero / 关卡101: Newspaper |
| icons_arrow_4.png | 3 | 关卡5: Crying / 关卡76: Yield / 关卡89: Nine |
| icons_checkmark_1.png | 3 | 关卡5: Tears / 关卡76: Speed limit / 关卡89: Three |
| icons_circle_3.png | 3 | 关卡5: Poo / 关卡89: Two / 关卡101: Billboard |
| icons_cross_2.png | 3 | 关卡5: Eyes / 关卡76: Keep left / 关卡89: Six |
| icons_envelopeicon_8.png | 3 | 关卡5: Prayer / 关卡76: Stop / 关卡89: Eight |
| icons_heart_5.png | 3 | 关卡5: Heart / 关卡89: Five / 关卡101: TV screen |
| icons_star_6.png | 3 | 关卡5: Rolling / 关卡76: No turns / 关卡89: Seven |

### Map（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| map_france_4.png | 3 | 关卡5: France / 关卡20: 0 / 关卡82: Quail |
| map_italy_1.png | 3 | 关卡5: Italy / 关卡20: 0 / 关卡82: Turkey |
| map_japan_8.png | 3 | 关卡5: Cyprus, Japan / 关卡20: 0 / 关卡82: Chicken |
| map_australia_3.png | 2 | 关卡5: Australia / 关卡20: 0 |
| map_india_2.png | 2 | 关卡5: India / 关卡20: 0 |
| map_spain_7.png | 2 | 关卡20: 0 / 关卡82: Duck |
| map_uk_6.png | 2 | 关卡5: UK / 关卡20: 0 |
| map_usa_5.png | 2 | 关卡5: USA / 关卡20: 0 |

### Play（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| play_cello_8.png | 3 | 关卡25: Cello / 关卡52: Trio / 关卡92: Olive |
| play_drum_4.png | 3 | 关卡25: Drum / 关卡52: Septet / 关卡92: Tomato |
| play_flute_6.png | 3 | 关卡25: Flute / 关卡52: Sextet / 关卡92: Oats |
| play_guitar_7.png | 3 | 关卡25: Guitar / 关卡52: Quartet / 关卡92: Flax |
| play_organ_1.png | 3 | 关卡25: Organ / 关卡52: Duet / 关卡92: Sunflower |
| play_piano_5.png | 3 | 关卡25: Piano / 关卡52: Choir / 关卡92: Corn |
| play_ukulele_3.png | 3 | 关卡25: Ukulele / 关卡52: Quintet / 关卡92: Quinoa |
| play_violin_2.png | 3 | 关卡25: Violin / 关卡52: Octet / 关卡92: Potato |

### Rodents（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| rodents_nutria_3.png | 4 | 关卡16: Nutria / 关卡30: Alpaca / 关卡76: Deer / 关卡96: Monkey |
| rodents_beaver_1.png | 3 | 关卡16: Beaver / 关卡30: Bison / 关卡96: Human |
| rodents_hamster_7.png | 3 | 关卡30: Antelope / 关卡76: Gazelle / 关卡96: Bear |
| rodents_marmot_2.png | 3 | 关卡16: Marmot / 关卡30: Moose / 关卡96: Boar |
| rodents_rat_6.png | 3 | 关卡16: Rat / 关卡30: Okapi / 关卡76: Antelope |
| rodents_squirrel_4.png | 3 | 关卡16: Squirrel / 关卡30: Zebra / 关卡96: Skunk |
| rodents_capybara_5.png | 2 | 关卡16: Capybara / 关卡30: Giraffe |
| rodents_guineapig_8.png | 2 | 关卡30: Addax / 关卡96: Raccoon |

### Screen（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| screen_moviescreen_7.png | 3 | 关卡35: Alt / 关卡68: Folder / 关卡98: Sunglasses |
| screen_smartphone_4.png | 3 | 关卡35: Control / 关卡68: Cursor / 关卡98: Safety |
| screen_smartwatch_5.png | 3 | 关卡35: Delete / 关卡68: Files / 关卡98: Monocle |
| screen_tv_1.png | 3 | 关卡35: Enter / 关卡68: Bin / 关卡98: Reading |
| screen_calculator_8.png | 2 | 关卡35: Spacebar / 关卡68: Shortcut |
| screen_ereader_3.png | 2 | 关卡35: Escape / 关卡68: Taskbar |
| screen_handheldgameconsole_6.png | 2 | 关卡35: Tab / 关卡68: Widget |
| screen_laptop_2.png | 2 | 关卡35: Shift / 关卡68: Icons |

### Shoes（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| shoes_boots_1.png | 3 | 关卡9: North / 关卡46: Boots / 关卡92: Shirt |
| shoes_brogues_7.png | 3 | 关卡9: East / 关卡46: Brogues / 关卡92: Panties |
| shoes_derbies_8.png | 3 | 关卡9: South / 关卡46: Derbies / 关卡92: Skirt |
| shoes_monks_6.png | 3 | 关卡9: West / 关卡46: Monks / 关卡92: Pants |
| shoes_flats_3.png | 2 | 关卡46: Flats / 关卡92: Jacket |
| shoes_heels_2.png | 2 | 关卡46: Heels / 关卡92: Dress |
| shoes_oxfords_4.png | 2 | 关卡46: Oxfords / 关卡92: Gloves |
| shoes_wedges_5.png | 2 | 关卡46: Wedges / 关卡92: Coat |

### Toolbox（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| toolbox_chisel_6.png | 5 | 关卡8: Guitar / 关卡36: Chisel / 关卡61: Ratchet / 关卡87: Ladder / 关卡100: Driveway |
| toolbox_drill_3.png | 5 | 关卡36: Drill / 关卡48: Bolt / 关卡61: Workshop / 关卡87: Ruler / 关卡100: Remote |
| toolbox_pliers_1.png | 5 | 关卡36: Pliers / 关卡48: Nail / 关卡61: Pliers / 关卡87: Rod / 关卡100: Workshop |
| toolbox_adhesivetape_4.png | 4 | 关卡36: Adhesive tape / 关卡48: Rivet / 关卡61: Jack / 关卡87: Rails |
| toolbox_saw_5.png | 4 | 关卡36: Saw / 关卡48: Screw / 关卡61: Spanner / 关卡87: Column |
| toolbox_wrench_2.png | 4 | 关卡36: Wrench / 关卡61: Wrench / 关卡87: Sword / 关卡100: Opener |
| toolbox_clamp_7.png | 3 | 关卡8: Pencil / 关卡36: Clamp / 关卡87: Pole |
| toolbox_hammer_8.png | 3 | 关卡8: Book / 关卡36: Hammer / 关卡87: Pointer |

### Whiskers（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| whiskers_cat_1.png | 4 | 关卡2: Pig / 关卡17: Tarsier / 关卡51: Puma / 关卡71: Cat |
| whiskers_dog_2.png | 4 | 关卡2: Bear / 关卡17: Gorilla / 关卡51: Jaguar / 关卡71: Dog |
| whiskers_otter_5.png | 4 | 关卡2: Horse / 关卡17: Simian / 关卡51: Leopard / 关卡71: Otter |
| whiskers_catfish_7.png | 3 | 关卡2: Sheep / 关卡17: Lemur / 关卡51: Tiger |
| whiskers_lion_8.png | 3 | 关卡2: Monkey / 关卡17: Macaque / 关卡51: Cheetah, Lion |
| whiskers_seal_3.png | 3 | 关卡17: Gibbon / 关卡51: Bobcat / 关卡71: Seal |
| whiskers_walrus_4.png | 3 | 关卡2: Goat / 关卡17: Baboon / 关卡71: Walrus |
| whiskers_squirrel_6.png | 2 | 关卡17: Mandrill / 关卡51: Cougar |

### Wind（8张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| wind_bagpipes_6.png | 2 | 关卡78: Texture / 关卡99: Bagpipes |
| wind_bugle_1.png | 2 | 关卡78: Grid / 关卡99: Bugle |
| wind_clarinet_7.png | 2 | 关卡78: Ornament / 关卡99: Clarinet |
| wind_flute_3.png | 2 | 关卡78: Tiles / 关卡99: Flute |
| wind_harmonica_5.png | 2 | 关卡78: Frame / 关卡99: Harmonica |
| wind_sax_4.png | 2 | 关卡78: Mirror / 关卡99: Sax |
| wind_trumpet_8.png | 2 | 关卡78: Murals / 关卡99: Trumpet |
| wind_tuba_2.png | 2 | 关卡78: Puzzle / 关卡99: Tuba |

### Build（7张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| build_factory_6.png | 3 | 关卡41: Factory / 关卡67: Duplex / 关卡101: Classroom |
| build_library_1.png | 3 | 关卡41: Library / 关卡67: Tent / 关卡101: Marker |
| build_mall_8.png | 3 | 关卡41: Mall / 关卡67: Mansion / 关卡101: Locker |
| build_schoolbuilding_4.png | 3 | 关卡41: School building / 关卡67: Bungalow / 关卡101: Calculator, School building |
| build_hospital_3.png | 2 | 关卡41: Hospital / 关卡101: Chalkboard |
| build_museum_2.png | 2 | 关卡41: Museum / 关卡101: Textbook |
| build_stadium_7.png | 2 | 关卡41: Stadium / 关卡101: Laboratory |

### Cleaning（7张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| cleaning_bin_7.png | 2 | 关卡39: Bin / 关卡107: Button |
| cleaning_broom_1.png | 2 | 关卡39: Broom / 关卡107: Straw |
| cleaning_bucket_6.png | 2 | 关卡39: Bucket / 关卡107: Bucket |
| cleaning_duster_4.png | 2 | 关卡39: Duster / 关卡107: Lunchbox |
| cleaning_dustpan_8.png | 2 | 关卡39: Dustpan / 关卡107: Crate, Dustpan |
| cleaning_sponge_5.png | 2 | 关卡39: Sponge / 关卡107: Bag |
| cleaning_vacuum_3.png | 2 | 关卡39: Vacuum / 关卡107: Frisbee |

### Folklore（7张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| folklore_banshee_4.png | 2 | 关卡56: Banshee / 关卡77: Oracle |
| folklore_fairy_6.png | 2 | 关卡56: Fairy / 关卡77: Magic |
| folklore_genie_8.png | 2 | 关卡56: Genie / 关卡77: Elf |
| folklore_goblin_2.png | 2 | 关卡56: Goblin / 关卡77: Dragon fire |
| folklore_ogre_3.png | 2 | 关卡56: Ogre / 关卡77: Castle |
| folklore_troll_1.png | 2 | 关卡56: Troll / 关卡77: Sword, Troll |
| folklore_unicorn_5.png | 2 | 关卡56: Unicorn / 关卡77: Beast |

### Garments（7张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| garments_dress_2.png | 3 | 关卡18: Cocktail / 关卡71: Hoodie / 关卡91: Scooped |
| garments_panties_5.png | 3 | 关卡18: Sundress / 关卡71: Blouse / 关卡91: Cowl |
| garments_coat_6.png | 2 | 关卡18: Bodycon / 关卡71: Trousers |
| garments_gloves_1.png | 2 | 关卡18: Tunic / 关卡91: Turtleneck |
| garments_pants_3.png | 2 | 关卡18: Mini / 关卡91: Polo |
| garments_shirt_4.png | 2 | 关卡71: Vest / 关卡91: Collar |
| garments_skirt_8.png | 2 | 关卡18: Gown / 关卡71: Skirt |

### Jewelry（7张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| jewelry_bracelet_4.png | 3 | 关卡4: Bracelet / 关卡89: Ruby / 关卡102: Nail polish |
| jewelry_diadem_7.png | 3 | 关卡4: Diadem / 关卡89: Emerald / 关卡102: Perfume |
| jewelry_diamondring_3.png | 3 | 关卡4: Diamond ring / 关卡89: Pearl / 关卡102: Handbag |
| jewelry_brooch_8.png | 2 | 关卡89: Diamond / 关卡102: High heels |
| jewelry_earring_2.png | 2 | 关卡4: Earring / 关卡102: Dress, Earring |
| jewelry_locket_6.png | 2 | 关卡4: Locket / 关卡102: Lipstick |
| jewelry_necklace_1.png | 2 | 关卡4: Necklace / 关卡102: Necklace |

### Mall（7张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| mall_paperbag_7.png | 3 | 关卡51: Crypto / 关卡78: Goods / 关卡104: Paper bag |
| mall_pharmacy_2.png | 3 | 关卡51: Coin / 关卡78: Tags / 关卡104: Pharmacy |
| mall_bookstore_1.png | 2 | 关卡51: Bank card / 关卡104: Bookstore |
| mall_cash_6.png | 2 | 关卡51: Cash / 关卡104: Cash |
| mall_creditcard_5.png | 2 | 关卡78: Fruits / 关卡104: Credit card |
| mall_fittingroom_8.png | 2 | 关卡51: Banknote / 关卡104: Fitting room |
| mall_janitor_4.png | 2 | 关卡78: Bags / 关卡104: Janitor |

### Seafood（7张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| seafood_crab_4.png | 2 | 关卡21: Crab / 关卡32: Sandwich |
| seafood_lobster_1.png | 2 | 关卡21: Lobster / 关卡32: Burger |
| seafood_mussel_3.png | 2 | 关卡21: Mussel / 关卡32: Kebab |
| seafood_oyster_2.png | 2 | 关卡21: Oyster / 关卡32: Burrito |
| seafood_scallop_5.png | 2 | 关卡21: Scallop / 关卡32: Taco |
| seafood_shrimp_8.png | 2 | 关卡21: Shrimp / 关卡32: Fries |
| seafood_squid_7.png | 2 | 关卡21: Prawn, Squid / 关卡32: Hot dog |

### Veggie（7张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| veggie_beetroot_5.png | 2 | 关卡20: Beetroot / 关卡91: Ginger |
| veggie_broccoli_1.png | 2 | 关卡20: Broccoli / 关卡91: Celery |
| veggie_cabbage_2.png | 2 | 关卡20: Cabbage / 关卡91: Turnip |
| veggie_carrot_4.png | 2 | 关卡20: Carrot / 关卡91: Beet, Carrot |
| veggie_eggplant_8.png | 2 | 关卡20: Eggplant / 关卡91: Radish |
| veggie_onion_7.png | 2 | 关卡20: Onion / 关卡91: Daikon |
| veggie_potato_3.png | 2 | 关卡20: Potato / 关卡91: Parsnip |

### Xmas（7张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| xmas_reindeer_6.png | 3 | 关卡63: Gifts / 关卡87: Milk / 关卡98: Pullover |
| xmas_santa_3.png | 3 | 关卡63: Reindeer / 关卡87: Cookies / 关卡98: Skirt |
| xmas_candycane_1.png | 2 | 关卡63: Chimney / 关卡98: Sweater |
| xmas_christmasgift_8.png | 2 | 关卡63: Elves / 关卡98: Jeans |
| xmas_christmasstocking_2.png | 2 | 关卡63: Claus / 关卡98: Blouse |
| xmas_christmastree_4.png | 2 | 关卡63: Stocking / 关卡98: Jacket |
| xmas_fairylights_5.png | 2 | 关卡63: Sleigh / 关卡87: Santa |

### Deck（6张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| deck_7hearts_8.png | 2 | 关卡7: King hearts / 关卡40: Badge |
| deck_8hearts_7.png | 2 | 关卡7: 10 hearts / 关卡40: Arrest |
| deck_9hearts_6.png | 2 | 关卡7: Queen hearts / 关卡40: Officer |
| deck_aceofhearts_1.png | 2 | 关卡7: Jack hearts / 关卡40: Baton |
| deck_kinghearts_2.png | 2 | 关卡7: 7 hearts / 关卡40: Handcuff |
| deck_queenhearts_3.png | 2 | 关卡7: 9 hearts / 关卡40: Uniform |

### Ecoitems（6张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| ecoitems_bicycle_6.png | 2 | 关卡33: Flower / 关卡106: Bicycle |
| ecoitems_ledlight_8.png | 2 | 关卡33: Filler / 关卡106: Motorbike |
| ecoitems_reusablebag_1.png | 2 | 关卡33: Ribbon / 关卡106: Scooter |
| ecoitems_solarpanel_3.png | 2 | 关卡33: Corsage / 关卡106: BMX |
| ecoitems_watersavingfaucet_7.png | 2 | 关卡33: Petal / 关卡106: Segway |
| ecoitems_windmill_4.png | 2 | 关卡33: Florist / 关卡106: Moped |

### Landmark（6张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| landmark_pyramids_4.png | 3 | 关卡84: Goat / 关卡97: Pyramids / 关卡108: Gas mask |
| landmark_statueofliberty_2.png | 3 | 关卡84: Llama / 关卡97: Sphinx / 关卡108: Helmet |
| landmark_bigben_1.png | 2 | 关卡84: Zebra / 关卡97: Big Ben |
| landmark_colosseum_3.png | 2 | 关卡84: Camel / 关卡97: Colosseum |
| landmark_greatwall_5.png | 2 | 关卡84: Warthog / 关卡108: Shield |
| landmark_parthenon_7.png | 2 | 关卡84: Bison / 关卡108: Goggles |

### Pastry（6张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| pastry_brioche_4.png | 3 | 关卡7: Sorbet / 关卡46: Cupcake / 关卡97: Brioche |
| pastry_brownie_8.png | 3 | 关卡7: Macaron / 关卡46: Brownie / 关卡97: Eclairs, Brownie |
| pastry_cake_3.png | 3 | 关卡7: Sweets / 关卡46: Lollipop / 关卡97: Cake |
| pastry_pie_2.png | 3 | 关卡7: Tiramisu / 关卡46: Churro / 关卡97: Pie |
| pastry_strudel_7.png | 2 | 关卡7: Muffin / 关卡97: Strudel |
| pastry_tart_5.png | 2 | 关卡7: Eclair / 关卡97: Tart |

### Picnic（6张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| picnic_ants_4.png | 3 | 关卡11: Train / 关卡74: Ants / 关卡106: Synagogue |
| picnic_crackers_8.png | 3 | 关卡11: Taxi / 关卡74: Crackers / 关卡106: Chapel |
| picnic_grass_7.png | 3 | 关卡11: Scooter / 关卡74: Grass / 关卡106: Abbey |
| picnic_juice_5.png | 3 | 关卡11: Plane / 关卡74: Juice / 关卡106: Mosque |
| picnic_sandwich_3.png | 3 | 关卡11: Helicopter / 关卡74: Sandwich / 关卡106: Pagoda |
| picnic_sun_6.png | 2 | 关卡74: Sun / 关卡106: Church |

### Seafish（6张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| seafish_cod_3.png | 2 | 关卡44: Otter / 关卡100: Cod |
| seafish_marlin_2.png | 2 | 关卡44: Seahorse / 关卡100: Marlin |
| seafish_sardine_4.png | 2 | 关卡44: Whale / 关卡100: Sardine |
| seafish_sawfish_6.png | 2 | 关卡44: Dolphin / 关卡100: Sawfish |
| seafish_shark_5.png | 2 | 关卡44: Shark / 关卡100: Shark |
| seafish_tuna_1.png | 2 | 关卡44: Octopus / 关卡100: Tuna |

### Tools（6张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| tools_gavel_4.png | 2 | 关卡86: Music notes / 关卡98: Sprout |
| tools_hardhat_6.png | 2 | 关卡86: Music awards / 关卡98: Foliage |
| tools_microphone_5.png | 2 | 关卡86: Band / 关卡98: Trunk |
| tools_paintbrush_3.png | 2 | 关卡86: Microphone stand / 关卡98: Root |
| tools_stethoscope_1.png | 2 | 关卡86: Audience / 关卡98: Branch |
| tools_wrench_2.png | 2 | 关卡86: Vinyl record / 关卡98: Seed |

### Beach（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| beach_bay_3.png | 3 | 关卡11: Sweater / 关卡54: Bay / 关卡94: Squash |
| beach_seagull_2.png | 3 | 关卡11: Jeans / 关卡54: Seagull / 关卡94: Zucchini |
| beach_waves_5.png | 3 | 关卡11: Jacket / 关卡54: Waves / 关卡94: Pumpkin |
| beach_beachchair_7.png | 2 | 关卡11: Pants / 关卡94: Eggplant |
| beach_sand_4.png | 2 | 关卡11: Jumper / 关卡54: Sand |

### Drupes（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| drupes_olive_7.png | 3 | 关卡50: Olive / 关卡63: Olive / 关卡86: Salad |
| drupes_apricot_1.png | 2 | 关卡63: Apricot / 关卡86: Pizza |
| drupes_cherry_4.png | 2 | 关卡50: Coconut / 关卡63: Cherry |
| drupes_lychee_8.png | 2 | 关卡50: Palm / 关卡63: Lychee |
| drupes_plum_3.png | 2 | 关卡63: Plum / 关卡86: Oil |

### Flowers（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| flowers_aster_7.png | 2 | 关卡4: Aster / 关卡29: Chives |
| flowers_daisy_1.png | 2 | 关卡4: Daisy / 关卡29: Dill |
| flowers_lily_2.png | 2 | 关卡4: Lily / 关卡29: Sage |
| flowers_poppy_5.png | 2 | 关卡4: Poppy / 关卡29: Rosemary |
| flowers_tulip_3.png | 2 | 关卡4: Tulip / 关卡29: Parsley |

### Furniture（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| furniture_bed_5.png | 2 | 关卡6: Bed / 关卡24: Poodle |
| furniture_chair_3.png | 2 | 关卡6: Chair / 关卡24: Bulldog |
| furniture_desk_4.png | 2 | 关卡6: Desk / 关卡24: Collie |
| furniture_sofa_2.png | 2 | 关卡6: Sofa / 关卡24: Spaniel |
| furniture_table_1.png | 2 | 关卡6: Table / 关卡24: Terrier |

### Lawn（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| lawn_gardeninggloves_5.png | 3 | 关卡35: Bench / 关卡93: Poppy / 关卡108: Chestnut |
| lawn_grass_1.png | 3 | 关卡35: Grass / 关卡93: Grass / 关卡108: Poplar |
| lawn_mower_2.png | 3 | 关卡35: Tree / 关卡93: Mower / 关卡108: Palm |
| lawn_picnicblanket_7.png | 2 | 关卡35: Plant / 关卡108: Oak |
| lawn_sprinkler_4.png | 2 | 关卡93: Sprinkler / 关卡108: Ash |

### Luxury（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| luxury_watch_2.png | 3 | 关卡15: Watch / 关卡39: Dime / 关卡94: Crypto |
| luxury_americanexpresscenturioncard_8.png | 2 | 关卡39: Penny / 关卡94: Flat |
| luxury_artpainting_7.png | 2 | 关卡39: Cent / 关卡94: Gems |
| luxury_supercar_6.png | 2 | 关卡39: Nickel / 关卡94: Stocks |
| luxury_yacht_4.png | 2 | 关卡15: Caviar, Yacht / 关卡94: Money, Yacht |

### Reptiles（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| reptiles_turtle_7.png | 3 | 关卡6: Turtle / 关卡47: Turtle / 关卡69: Raph |
| reptiles_alligator_3.png | 2 | 关卡6: Alligator / 关卡69: Leonardo |
| reptiles_chameleon_5.png | 2 | 关卡6: Chameleon / 关卡47: Sloth |
| reptiles_iguana_6.png | 2 | 关卡6: Iguana / 关卡69: Mikey |
| reptiles_snake_2.png | 2 | 关卡6: Snake / 关卡47: Snail |

### Sailor（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| sailor_flag_2.png | 2 | 关卡25: Signpost / 关卡78: Flag |
| sailor_knot_4.png | 2 | 关卡78: Knot / 关卡91: Plow |
| sailor_rope_1.png | 2 | 关卡78: Rope / 关卡91: Fluke |
| sailor_sextant_7.png | 2 | 关卡25: Sextant / 关卡91: Claw |
| sailor_storm_3.png | 2 | 关卡25: Compass / 关卡78: Storm |

### Shapes（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| shapes_octagon_4.png | 3 | 关卡12: Octagon / 关卡38: Octagon / 关卡100: Earth |
| shapes_circle_1.png | 2 | 关卡12: Circle / 关卡38: Decagon |
| shapes_oval_3.png | 2 | 关卡12: Oval / 关卡100: Plate |
| shapes_rhombus_8.png | 2 | 关卡38: Heptagon / 关卡100: Clocks |
| shapes_square_2.png | 2 | 关卡12: Square / 关卡100: Ball |

### Yellow（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| yellow_banana_1.png | 2 | 关卡31: Starfish / 关卡66: Banana |
| yellow_cheese_4.png | 2 | 关卡31: Barnacle / 关卡66: Curry |
| yellow_corn_2.png | 2 | 关卡31: Spider / 关卡66: Corn |
| yellow_gold_3.png | 2 | 关卡31: Squid / 关卡66: Canary |
| yellow_yellowgemstone_7.png | 2 | 关卡31: Worm / 关卡66: Mustard |

### Zodiac（5张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| zodiac_sagittarius_8.png | 3 | 关卡8: Scorpio / 关卡19: Lemon / 关卡80: Zipper |
| zodiac_cancer_4.png | 2 | 关卡8: Pisces / 关卡19: Lime |
| zodiac_gemini_3.png | 2 | 关卡8: Gemini / 关卡80: Legs |
| zodiac_taurus_2.png | 2 | 关卡8: Taurus / 关卡80: Pocket |
| zodiac_virgo_6.png | 2 | 关卡8: Virgo / 关卡19: Pomelo |

### Baking（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| baking_chocolatechips_6.png | 2 | 关卡12: Pita / 关卡70: Pie |
| baking_sugar_3.png | 2 | 关卡12: Tortilla / 关卡70: Cookies |
| baking_vanillaextract_7.png | 2 | 关卡12: Baguette / 关卡70: Bagels |
| baking_yeast_5.png | 2 | 关卡12: Arepa / 关卡70: Cake |

### Charger（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| charger_digitalcamera_4.png | 2 | 关卡86: VR headset / 关卡101: Digital camera |
| charger_electriccar_1.png | 2 | 关卡86: Robot vacuum / 关卡101: Electric car |
| charger_laptop_3.png | 2 | 关卡86: Laptop / 关卡101: Laptop |
| charger_smartwatch_2.png | 2 | 关卡86: Smartwatch / 关卡101: Smartwatch |

### Chess（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| chess_bishop_4.png | 2 | 关卡3: Bishop / 关卡29: Caw |
| chess_pawn_1.png | 2 | 关卡3: Pawn / 关卡29: Meow |
| chess_queen_5.png | 2 | 关卡3: Queen / 关卡29: Quack |
| chess_rook_2.png | 2 | 关卡3: Rook / 关卡29: Bark |

### Desert（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| desert_dunes_1.png | 3 | 关卡36: Boulder / 关卡62: Mirage / 关卡102: Dunes |
| desert_camel_4.png | 2 | 关卡36: Pebble / 关卡102: Camel |
| desert_leatherwatercanteen_5.png | 2 | 关卡36: Gravel / 关卡62: Dune |
| desert_oasis_3.png | 2 | 关卡62: Oasis / 关卡102: Oasis |

### Insects（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| insects_ant_6.png | 3 | 关卡4: Ant / 关卡60: Beetle, Ant / 关卡99: Tick |
| insects_mosquito_1.png | 3 | 关卡4: Mosquito / 关卡60: Mosquito / 关卡99: Scorpion |
| insects_ladybug_2.png | 2 | 关卡4: Ladybug / 关卡60: Termite |
| insects_wasp_4.png | 2 | 关卡4: Wasp / 关卡99: Centipede |

### Keys（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| keys_car_3.png | 2 | 关卡84: Car / 关卡95: Lentil |
| keys_door_1.png | 2 | 关卡84: Door / 关卡95: Soybean |
| keys_padlock_2.png | 2 | 关卡84: Padlock / 关卡95: Lupin |
| keys_safe_4.png | 2 | 关卡84: Safe / 关卡95: Clover |

### Medical（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| medical_bloodpressuremonitor_7.png | 2 | 关卡49: Hair / 关卡89: Teenager |
| medical_pills_4.png | 2 | 关卡49: Skull / 关卡89: Adult |
| medical_thermometer_1.png | 2 | 关卡49: Face / 关卡89: Newborn |
| medical_wheelchair_6.png | 2 | 关卡49: Brain / 关卡89: Senior |

### Pirate（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| pirate_cutlass_3.png | 2 | 关卡31: Claymore, Cutlass / 关卡81: Cutlass |
| pirate_parrot_2.png | 2 | 关卡31: Katana / 关卡81: Parrot |
| pirate_rum_5.png | 2 | 关卡31: Saber / 关卡81: Peg leg, Rum |
| pirate_woodenshipswheel_7.png | 2 | 关卡31: Falchion / 关卡81: Treasure |

### Strings（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| strings_cello_3.png | 2 | 关卡53: Cello / 关卡106: Cello |
| strings_mandolin_8.png | 2 | 关卡53: Oboe / 关卡106: Mandolin |
| strings_ukulele_7.png | 2 | 关卡53: Clarinet / 关卡106: Ukulele |
| strings_violin_1.png | 2 | 关卡53: Flute / 关卡106: Violin |

### Supplies（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| supplies_pencil_7.png | 3 | 关卡19: Pencil / 关卡58: Pencil / 关卡103: Diploma |
| supplies_filefolder_6.png | 2 | 关卡19: Pen / 关卡58: Ink |
| supplies_paperclip_3.png | 2 | 关卡58: Marker / 关卡103: Blackboard |
| supplies_stapler_1.png | 2 | 关卡19: Marker / 关卡58: Stylus |

### Western（4张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| western_cowboyhat_1.png | 3 | 关卡34: Rodeo / 关卡50: Horse / 关卡64: Horse |
| western_lasso_3.png | 3 | 关卡34: Lasso / 关卡50: Donkey / 关卡64: Gambler, Lasso |
| western_saloon_7.png | 3 | 关卡34: Saloon / 关卡50: Pony / 关卡64: Boots |
| western_cowboy_4.png | 2 | 关卡34: Cowboy / 关卡50: Mule |

### Arts（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| arts_camera_4.png | 2 | 关卡77: Lines / 关卡88: Ferry |
| arts_sculpture_3.png | 2 | 关卡77: Shapes / 关卡88: Frigate |
| arts_sheetmusic_6.png | 2 | 关卡77: Colors / 关卡88: Canoe |

### Burger（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| burger_beef_1.png | 2 | 关卡2: Beef / 关卡45: Sausage |
| burger_bun_2.png | 2 | 关卡2: Bun / 关卡45: Bacon |
| burger_sauce_3.png | 2 | 关卡2: Sauce / 关卡45: Chorizo |

### Camping（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| camping_campfire_2.png | 2 | 关卡24: Campfire / 关卡94: Feather |
| camping_hammock_3.png | 2 | 关卡24: Hammock / 关卡94: Cotton |
| camping_tent_1.png | 2 | 关卡24: Tent / 关卡94: Pom-pom |

### Chef（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| chef_dish_3.png | 2 | 关卡28: Kimono / 关卡93: Dish |
| chef_restaurant_2.png | 2 | 关卡28: Miso / 关卡93: Restaurant |
| chef_spicejar_8.png | 2 | 关卡28: Tempura / 关卡93: hat |

### Decor（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| decor_curtains_6.png | 3 | 关卡40: Cord / 关卡73: Rooster / 关卡90: Drill |
| decor_rug_3.png | 2 | 关卡73: Sunrise / 关卡90: Pliers |
| decor_wallclock_1.png | 2 | 关卡40: Bulb / 关卡90: Hammer |

### Dogs（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| dogs_husky_5.png | 2 | 关卡23: Foal / 关卡42: let |
| dogs_poodle_3.png | 2 | 关卡23: Lamb / 关卡42: Hog |
| dogs_terrier_1.png | 2 | 关卡23: Cygnet / 关卡42: Sow |

### Eats（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| eats_burrito_7.png | 2 | 关卡22: Ketchup / 关卡73: Ham |
| eats_fries_3.png | 2 | 关卡22: Sausage / 关卡73: Lettuce |
| eats_sandwich_6.png | 2 | 关卡22: Soft bun / 关卡73: Tomato |

### Egypt（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| egypt_mummy_4.png | 2 | 关卡28: Sultan / 关卡104: Totem |
| egypt_nileriver_6.png | 2 | 关卡28: Emir / 关卡104: Talisman |
| egypt_sphinx_2.png | 2 | 关卡28: Baron / 关卡104: Tattoo |

### Fruits（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| fruits_banana_3.png | 2 | 关卡16: Banana / 关卡102: Fire |
| fruits_kiwi_2.png | 2 | 关卡16: Kiwi / 关卡102: Pumpkin |
| fruits_peach_6.png | 2 | 关卡16: Peach / 关卡102: juice |

### Gym（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| gym_barbell_2.png | 3 | 关卡18: Barbell / 关卡85: Truck / 关卡105: E-reader |
| gym_dumbbell_1.png | 3 | 关卡18: Dumbbell / 关卡85: Dumbbell / 关卡105: TV |
| gym_airbike_3.png | 2 | 关卡18: Air bike / 关卡85: Anchor |

### Mail（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| mail_letter_3.png | 2 | 关卡76: Pigeon / 关卡89: Letter |
| mail_parcel_2.png | 2 | 关卡76: Eagle / 关卡89: Parcel |
| mail_stamp_1.png | 2 | 关卡76: Dragon / 关卡89: Stamp |

### Pairs（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| pairs_skis_3.png | 2 | 关卡24: Skis / 关卡81: Serpent |
| pairs_twins_2.png | 2 | 关卡24: Twins / 关卡81: Lion |
| pairs_wings_6.png | 2 | 关卡81: Goat / 关卡92: Man |

### Purple（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| purple_eggplant_1.png | 2 | 关卡33: Ruby red / 关卡107: Eggplant |
| purple_lavender_4.png | 2 | 关卡33: Fuchsia / 关卡107: Lavender |
| purple_violet_2.png | 2 | 关卡33: Nude / 关卡107: Violet |

### Sports（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| sports_curling_7.png | 2 | 关卡6: Curling / 关卡103: Golf ball |
| sports_golf_5.png | 2 | 关卡6: Golf / 关卡103: Baseball |
| sports_rugby_6.png | 2 | 关卡6: Rugby / 关卡103: Basketball |

### Transport（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| transport_train_2.png | 3 | 关卡9: Combine / 关卡79: Corner / 关卡95: Train |
| transport_hotairballoon_8.png | 2 | 关卡9: Trailer / 关卡79: Bike |
| transport_scooter_5.png | 2 | 关卡9: Pickup / 关卡79: Brick |

### Utensils（3张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| utensils_bowl_1.png | 2 | 关卡45: Spout / 关卡57: Yen |
| utensils_cup_6.png | 2 | 关卡45: Lid / 关卡57: Lira |
| utensils_plate_2.png | 2 | 关卡45: Handle / 关卡57: Euro |

### Aquatics（2张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| aquatics_lifering_4.png | 2 | 关卡72: Scarf / 关卡85: Reed |
| aquatics_paddleboard_7.png | 2 | 关卡72: Choker / 关卡85: Duck |

### Birthday（2张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| birthday_box_4.png | 2 | 关卡88: Box / 关卡105: Box |
| birthday_confetti_5.png | 2 | 关卡88: Confetti / 关卡105: Confetti |

### Candy（2张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| candy_choco_2.png | 2 | 关卡34: Caramel / 关卡75: Choco |
| candy_gum_1.png | 2 | 关卡34: Honey / 关卡75: Gum |

### Chair（2张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| chair_stool_4.png | 2 | 关卡27: Bench, Stool / 关卡80: Stool |
| chair_throne_2.png | 2 | 关卡27: Chair / 关卡80: Throne |

### Halloween（2张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| halloween_jackolantern_1.png | 2 | 关卡37: Vampire / 关卡48: Macaroni |
| halloween_witchhat_5.png | 2 | 关卡37: Beast / 关卡48: Penne |

### Rain（2张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| rain_lightning_6.png | 2 | 关卡37: Mule / 关卡83: Lightning |
| rain_rainboots_5.png | 2 | 关卡37: Donkey / 关卡83: boots |

### Vampire（2张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| vampire_bats_1.png | 2 | 关卡65: Weaver / 关卡96: Bats |
| vampire_fangs_2.png | 2 | 关卡65: Weevil / 关卡96: Fangs |

### 3d（1张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| 3d_cone_3.png | 2 | 关卡41: Wreath / 关卡95: Cone |

### Babies（1张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| babies_diaper_2.png | 2 | 关卡70: Diaper / 关卡81: Collar |

### Space（1张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| space_saturn_5.png | 2 | 关卡20: Snowy owl / 关卡79: Music notes |

### Tarot（1张图片复用）

| 图片文件 | 复用次数 | 各关卡中的卡牌名 |
|---------|---------|-----------------|
| tarot_fool_1.png | 2 | 关卡44: Fool / 关卡59: Sweat |
