# 竞品前101关图片类别相似性与重复分析

## 一、类别名称相似的组合（18 组）

| 类别A | 关卡 | 中文 | 类别B | 关卡 | 中文 | 关系 | 重叠word |
|-------|------|------|-------|------|------|------|---------|
| Ads | 101 | 广告 | Breads | 12 | 面包 | 包含 | — |
| Age | 89 | 年龄 | Garage | 100 | 车库 | 包含 | — |
| Chair | 80 | 椅子 | Hair | 26 | 头发 | 包含 | — |
| Eats | 32 | 吃 | Seats | 27 | 座位 | 包含 | — |
| Eats | 32 | 吃 | Treats | 46 | 零食 | 包含 | — |
| Egg | 55 | 蛋 | Veggie | 20 | 蔬菜 | 包含 | — |
| Hair | 26 | 头发 | Hairs | 43 | 发型 | 包含 | — |
| Head | 49 | 头部 | Headwear | 83 | 头饰 | 包含 | — |
| Hoof | 30 | 蹄 | Hoofed | 84 | 有蹄类 | 包含 | bison, giraffe, zebra |
| Neck | 81 | 颈部 | Neckline | 91 | 领口 | 包含 | collar |
| Neck | 81 | 颈部 | Neckwear | 72 | 颈部饰品 | 包含 | bow tie, scarf |
| Neckline | 91 | 领口 | Neckwear | 72 | 颈部饰品 | 相同前缀(neck) | — |
| Pasta | 48 | 意大利面 | Pastry | 97 | 糕点 | 相同前缀(past) | — |
| Sand | 62 | 沙 | Sandwich | 73 | 三明治 | 包含 | — |
| Sea fish | 100 | 海鱼 | Seafood | 21 | 海鲜 | 相同前缀(seaf) | — |
| Toolbox | 36 | 工具箱 | Tools | 90 | 工具 | 相同前缀(tool) | drill, hammer, pliers, wrench |
| Vehicle | 95 | 交通工具 | Vehicles | 9 | 车辆 | 包含 | — |
| Whiskers | 71 | 胡须 | Whistle | 74 | 哨子 | 相同前缀(whis) | — |

### 详细卡牌对比

**Ads**（关卡101, 广告）vs **Breads**（关卡12, 面包）— 包含

- Ads: Billboard, Newspaper, TV screen
- Breads: Ciabatta, Baguette, Focaccia, Pita, Challah, Tortilla, Brioche, Arepa

**Age**（关卡89, 年龄）vs **Garage**（关卡100, 车库）— 包含

- Age: Adult, Teenager, Child, Toddler, Newborn, Senior
- Garage: Driveway, Workshop, Opener, Remote

**Chair**（关卡80, 椅子）vs **Hair**（关卡26, 头发）— 包含

- Chair: Cushion, Throne, Ottoman, Stool, Armrest, Loveseat, Recliner, Beanbag
- Hair: Wavy, Curly, Coily

**Eats**（关卡32, 吃）vs **Seats**（关卡27, 座位）— 包含

- Eats: Pizza, Taco, Fries, Burger, Kebab, Sandwich, Burrito, Hot dog
- Seats: Chair, Sofa, Bench, Stool

**Eats**（关卡32, 吃）vs **Treats**（关卡46, 零食）— 包含

- Eats: Pizza, Taco, Fries, Burger, Kebab, Sandwich, Burrito, Hot dog
- Treats: Brownie, Cupcake, Churro, Lollipop

**Egg**（关卡55, 蛋）vs **Veggie**（关卡20, 蔬菜）— 包含

- Egg: Chicken, Duck, Quail, Goose, Turkey, Ostrich, Swan, Penguin
- Veggie: Broccoli, Cabbage, Potato, Carrot, Beetroot, Cucumber, Onion, Eggplant

**Hair**（关卡26, 头发）vs **Hairs**（关卡43, 发型）— 包含

- Hair: Wavy, Curly, Coily
- Hairs: Bob, Undercut, Mohawk, Fade, Mullet, Afro

**Head**（关卡49, 头部）vs **Headwear**（关卡83, 头饰）— 包含

- Head: Hair, Skull, Brain, Face
- Headwear: Hat, Turban, Bowler, Bonnet, Fez, Cap, Crown, Helmet

**Hoof**（关卡30, 蹄）vs **Hoofed**（关卡84, 有蹄类）— 包含

- Hoof: Addax, Giraffe, Zebra, Alpaca, Antelope, Moose, Okapi, Bison
- Hoofed: Giraffe, Camel, Sheep, Warthog, Zebra, Bison, Goat, Llama
- 重叠: bison, giraffe, zebra

**Neck**（关卡81, 颈部）vs **Neckline**（关卡91, 领口）— 包含

- Neck: tie, Bow tie, Collar, Scarf
- Neckline: Polo, Turtleneck, Cowl, Collar, Scooped, V-neck
- 重叠: collar

**Neck**（关卡81, 颈部）vs **Neckwear**（关卡72, 颈部饰品）— 包含

- Neck: tie, Bow tie, Collar, Scarf
- Neckwear: Scarf, Necktie, Bow tie, Choker
- 重叠: bow tie, scarf

**Neckline**（关卡91, 领口）vs **Neckwear**（关卡72, 颈部饰品）— 相同前缀(neck)

- Neckline: Polo, Turtleneck, Cowl, Collar, Scooped, V-neck
- Neckwear: Scarf, Necktie, Bow tie, Choker

**Pasta**（关卡48, 意大利面）vs **Pastry**（关卡97, 糕点）— 相同前缀(past)

- Pasta: Ravioli, Macaroni, Rigatoni, Penne
- Pastry: Eclairs, Pie, Cake, Brioche, Tart, Scone, Strudel, Brownie

**Sand**（关卡62, 沙）vs **Sandwich**（关卡73, 三明治）— 包含

- Sand: Oasis, Cactus, Mirage, Dune
- Sandwich: Toast, Cheese, Ham, Lettuce, Mayo, Tomato, Pickles, Sausage

**Sea fish**（关卡100, 海鱼）vs **Seafood**（关卡21, 海鲜）— 相同前缀(seaf)

- Sea fish: Tuna, Marlin, Cod, Sardine, Shark, Sawfish
- Seafood: Lobster, Oyster, Mussel, Crab, Scallop, Prawn, Squid, Shrimp

**Toolbox**（关卡36, 工具箱）vs **Tools**（关卡90, 工具）— 相同前缀(tool)

- Toolbox: Pliers, Wrench, Drill, Adhesive tape, Saw, Chisel, Clamp, Hammer
- Tools: Hammer, Wrench, Drill, Pliers
- 重叠: drill, hammer, pliers, wrench

**Vehicle**（关卡95, 交通工具）vs **Vehicles**（关卡9, 车辆）— 包含

- Vehicle: Train, Boat, Bus, Car
- Vehicles: Pickup, Combine, Trailer, Truck

**Whiskers**（关卡71, 胡须）vs **Whistle**（关卡74, 哨子）— 相同前缀(whis)

- Whiskers: Cat, Dog, Seal, Walrus, Otter
- Whistle: Kettle, Referee, Bird

---

## 二、卡牌内容高度重叠的类别对（17 组）

>=40%% word重叠且 >=2 个相同word

| 类别A | 关卡 | 张数 | 类别B | 关卡 | 张数 | 重叠数 | 重叠率 | 重叠word |
|-------|------|------|-------|------|------|--------|--------|---------|
| Egg | 55 | 8 | Poultry | 82 | 4 | 4 | 50%/100% | chicken, duck, quail, turkey |
| Equidae | 50 | 6 | Horse | 37 | 3 | 3 | 50%/100% | donkey, mule, zebra |
| Toolbox | 36 | 8 | Tools | 90 | 4 | 4 | 50%/100% | drill, hammer, pliers, wrench |
| Office | 19 | 4 | Writing | 58 | 6 | 3 | 75%/50% | marker, pen, pencil |
| Singer | 86 | 6 | Studio | 79 | 3 | 2 | 33%/67% | microphone stand, music notes |
| Clothes | 98 | 6 | Wardrobe | 11 | 5 | 3 | 50%/60% | jacket, jeans, sweater |
| Baking | 70 | 4 | Pastry | 97 | 8 | 2 | 50%/25% | cake, pie |
| Bugs | 60 | 4 | Insects | 4 | 6 | 2 | 50%/33% | ant, mosquito |
| Cowboy | 64 | 4 | Western | 34 | 6 | 2 | 50%/33% | gambler, lasso |
| Furniture | 6 | 5 | Seats | 27 | 4 | 2 | 40%/50% | chair, sofa |
| Mechanic | 61 | 6 | Tools | 90 | 4 | 2 | 33%/50% | pliers, wrench |
| Neck | 81 | 4 | Neckwear | 72 | 4 | 2 | 50%/50% | bow tie, scarf |
| Play | 25 | 8 | Violin | 53 | 4 | 2 | 25%/50% | cello, flute |
| Violin | 53 | 4 | Wind | 99 | 8 | 2 | 50%/25% | clarinet, flute |
| Charger | 101 | 6 | Gadget | 86 | 5 | 2 | 33%/40% | laptop, smartwatch |
| Clothes | 98 | 6 | Laundry | 71 | 5 | 2 | 33%/40% | blouse, skirt |
| Garments | 92 | 8 | Wardrobe | 11 | 5 | 2 | 25%/40% | jacket, pants |

---

## 三、跨类别重复卡牌名汇总

| 指标 | 数量 |
|------|------|
| 跨类别重复的卡牌名 | 112 个 |
| 额外重复次数 | 131 次 |

| 出现类别数 | 卡牌名数量 |
|-----------|----------|
| 4 个类别 | 1 个 |
| 3 个类别 | 17 个 |
| 2 个类别 | 94 个 |

**Zebra**(斑马) — 4个类别: Hoof(关卡30), Horse(关卡37), Equidae(关卡50), Hoofed(关卡84)

**Boots**(靴子) — 3个类别: Shoes(关卡46), Cowboy(关卡64), Rain(关卡83)

**Cake**(蛋糕) — 3个类别: Baking(关卡70), Birthday(关卡88), Pastry(关卡97)

**Duck**(鸭蛋) — 3个类别: Egg(关卡55), Poultry(关卡82), Pond(关卡85)

**Flute**(长笛) — 3个类别: Play(关卡25), Violin(关卡53), Wind(关卡99)

**Goat**(山羊) — 3个类别: Animals(关卡2), Chimera(关卡81), Hoofed(关卡84)

**Grass**(草地) — 3个类别: Park(关卡35), Picnic(关卡74), Lawn(关卡93)

**Hat**(帽子) — 3个类别: Hats(关卡14), Headwear(关卡83), Chef(关卡93)

**Horse**(马) — 3个类别: Animals(关卡2), Equidae(关卡50), Cowboy(关卡64)

**Jacket**(夹克) — 3个类别: Wardrobe(关卡11), Garments(关卡92), Clothes(关卡98)

**Marker**(马克笔) — 3个类别: Office(关卡19), Writing(关卡58), Schools(关卡101)

**Olive**(橄榄油) — 3个类别: Oil(关卡50), Drupes(关卡63), Crops(关卡92)

**Pencil**(铅笔) — 3个类别: Wooden(关卡8), Office(关卡19), Writing(关卡58)

**Pliers**(钳子) — 3个类别: Toolbox(关卡36), Mechanic(关卡61), Tools(关卡90)

**Sausage**(香肠) — 3个类别: Hot dog(关卡22), Meat(关卡45), Sandwich(关卡73)

**Skirt**(裙子) — 3个类别: Laundry(关卡71), Garments(关卡92), Clothes(关卡98)

**Wrench**(扳手) — 3个类别: Toolbox(关卡36), Mechanic(关卡61), Tools(关卡90)

**Yacht**(游艇) — 3个类别: Luxury(关卡15), Ships(关卡88), Property(关卡94)

**Alpaca**(羊驼) — 2个类别: Hoof(关卡30), Fluffy(关卡94)

**Ant**(蚂蚁) — 2个类别: Insects(关卡4), Bugs(关卡60)

**Antelope**(羚羊) — 2个类别: Hoof(关卡30), Ruminant(关卡76)

**Apricot**(杏子) — 2个类别: Fruits(关卡16), Drupes(关卡63)

**Banana**(香蕉) — 2个类别: Fruits(关卡16), Yellow(关卡66)

**Bear**(熊) — 2个类别: Animals(关卡2), Omnivore(关卡96)

**Beast**(野兽) — 2个类别: Monsters(关卡37), Fantasy(关卡77)

**Bench**(长凳) — 2个类别: Seats(关卡27), Park(关卡35)

**Bin**(垃圾桶) — 2个类别: Cleaning(关卡39), Desktop(关卡68)

**Bison**(野牛) — 2个类别: Hoof(关卡30), Hoofed(关卡84)

**Blouse**(女式衬衫) — 2个类别: Laundry(关卡71), Clothes(关卡98)

**Boat**(小船) — 2个类别: Ships(关卡88), Vehicle(关卡95)

**Boulder**(巨石) — 2个类别: Rocks(关卡36), Heavy(关卡85)

**Bow tie**(蝴蝶结领结) — 2个类别: Neckwear(关卡72), Neck(关卡81)

**Brioche**(布里欧修) — 2个类别: Breads(关卡12), Pastry(关卡97)

**Brownie**(布朗尼) — 2个类别: Treats(关卡46), Pastry(关卡97)

**Cap**(鸭舌帽) — 2个类别: Hats(关卡14), Headwear(关卡83)

**Car**(汽车) — 2个类别: Keys(关卡84), Vehicle(关卡95)

**Carrot**(胡萝卜) — 2个类别: Veggie(关卡20), Roots(关卡91)

**Cello**(大提琴) — 2个类别: Play(关卡25), Violin(关卡53)

**Chair**(椅子) — 2个类别: Furniture(关卡6), Seats(关卡27)

**Cheese**(芝士) — 2个类别: Burger(关卡2), Sandwich(关卡73)

**Chicken**(鸡蛋) — 2个类别: Egg(关卡55), Poultry(关卡82)

**Clarinet**(单簧管) — 2个类别: Violin(关卡53), Wind(关卡99)

**Cloud**(云) — 2个类别: Rain(关卡83), Fluffy(关卡94)

**coat**(雨衣) — 2个类别: Rain(关卡83), Garments(关卡92)

**Coin**(硬币) — 2个类别: Pay(关卡51), Silver(关卡82)

**Collar**(衣领) — 2个类别: Neck(关卡81), Neckline(关卡91)

**Cookies**(饼干) — 2个类别: Baking(关卡70), Xmas(关卡87)

**Corn**(玉米) — 2个类别: Yellow(关卡66), Crops(关卡92)

**Crypto**(加密货币) — 2个类别: Pay(关卡51), Property(关卡94)

**Cutlass**(短弯刀) — 2个类别: Swords(关卡31), Pirate(关卡81)

**Donkey**(驴) — 2个类别: Horse(关卡37), Equidae(关卡50)

**Dragon**(龙) — 2个类别: Monsters(关卡37), Wings(关卡76)

**Drill**(电钻) — 2个类别: Toolbox(关卡36), Tools(关卡90)

**Dumbbell**(哑铃) — 2个类别: Gym(关卡18), Heavy(关卡85)

**Eagle**(鹰) — 2个类别: Birds(关卡10), Wings(关卡76)

**Eggplant**(茄子) — 2个类别: Veggie(关卡20), Squashes(关卡94)

**Foliage**(叶子) — 2个类别: Bouquet(关卡33), Plant(关卡98)

**Gambler**(赌徒) — 2个类别: Western(关卡34), Cowboy(关卡64)

**Giraffe**(长颈鹿) — 2个类别: Hoof(关卡30), Hoofed(关卡84)

**Guitar**(吉他) — 2个类别: Wooden(关卡8), Play(关卡25)

**Hammer**(锤子) — 2个类别: Toolbox(关卡36), Tools(关卡90)

**Jeans**(牛仔裤) — 2个类别: Wardrobe(关卡11), Clothes(关卡98)

**Juice**(果汁) — 2个类别: Drinks(关卡3), Picnic(关卡74)

**Ladybug**(瓢虫) — 2个类别: Insects(关卡4), Has red(关卡90)

**Laptop**(笔记本电脑) — 2个类别: Gadget(关卡86), Charger(关卡101)

**Lasso**(套索) — 2个类别: Western(关卡34), Cowboy(关卡64)

**Lemon**(柠檬) — 2个类别: Citrus(关卡19), Yellow(关卡66)

**Lion**(狮子) — 2个类别: Big cats(关卡51), Chimera(关卡81)

**Lollipop**(棒棒糖) — 2个类别: Treats(关卡46), Candy(关卡75)

**Microphone stand**(麦克风架) — 2个类别: Studio(关卡79), Singer(关卡86)

**Monkey**(猴子) — 2个类别: Animals(关卡2), Omnivore(关卡96)

**Mosquito**(蚊子) — 2个类别: Insects(关卡4), Bugs(关卡60)

**Mule**(骡子) — 2个类别: Horse(关卡37), Equidae(关卡50)

**Music notes**(音符) — 2个类别: Studio(关卡79), Singer(关卡86)

**Octagon**(八边形) — 2个类别: Shapes(关卡12), Polygons(关卡38)

**Ogre**(食人魔) — 2个类别: Monsters(关卡37), Folklore(关卡56)

**Otter**(水獭) — 2个类别: Aquatics(关卡44), Whiskers(关卡71)

**Pants**(裤子) — 2个类别: Wardrobe(关卡11), Garments(关卡92)

**Peach**(桃子) — 2个类别: Fruits(关卡16), Drupes(关卡63)

**Pen**(钢笔) — 2个类别: Office(关卡19), Writing(关卡58)

**Petal**(花瓣) — 2个类别: Bouquet(关卡33), Plant(关卡98)

**Pie**(馅饼) — 2个类别: Baking(关卡70), Pastry(关卡97)

**Pizza**(披萨) — 2个类别: Eats(关卡32), Olives(关卡86)

**Poppy**(罂粟花) — 2个类别: Flowers(关卡4), Lawn(关卡93)

**Potato**(土豆) — 2个类别: Veggie(关卡20), Crops(关卡92)

**Quail**(鹌鹑蛋) — 2个类别: Egg(关卡55), Poultry(关卡82)

**Reindeer**(驯鹿) — 2个类别: Arctic(关卡20), Santa(关卡63)

**Sandwich**(三明治) — 2个类别: Eats(关卡32), Picnic(关卡74)

**Scarf**(围巾) — 2个类别: Neckwear(关卡72), Neck(关卡81)

**School building**(学校建筑) — 2个类别: Build(关卡41), Schools(关卡101)

**Shark**(鲨鱼) — 2个类别: Aquatics(关卡44), Sea fish(关卡100)

**Sheep**(绵羊) — 2个类别: Animals(关卡2), Hoofed(关卡84)

**Smartwatch**(智能手表) — 2个类别: Gadget(关卡86), Charger(关卡101)

**Sofa**(沙发) — 2个类别: Furniture(关卡6), Seats(关卡27)

**Spider**(蜘蛛) — 2个类别: No bones(关卡31), Crawlies(关卡99)

**Squid**(鱿鱼) — 2个类别: Seafood(关卡21), No bones(关卡31)

**Stool**(凳子) — 2个类别: Seats(关卡27), Chair(关卡80)

**Sun**(太阳) — 2个类别: Yellow(关卡66), Picnic(关卡74)

**Swan**(天鹅) — 2个类别: Birds(关卡10), Egg(关卡55)

**Sweater**(毛衣) — 2个类别: Wardrobe(关卡11), Clothes(关卡98)

**Sword**(剑) — 2个类别: Fantasy(关卡77), Straight(关卡87)

**Tears**(眼泪) — 2个类别: Emoji(关卡5), Fluids(关卡59)

**Tent**(帐篷) — 2个类别: Camping(关卡24), Housing(关卡67)

**Tomato**(番茄) — 2个类别: Sandwich(关卡73), Crops(关卡92)

**Train**(火车) — 2个类别: Transport(关卡11), Vehicle(关卡95)

**Troll**(巨魔) — 2个类别: Folklore(关卡56), Fantasy(关卡77)

**Truck**(卡车) — 2个类别: Vehicles(关卡9), Heavy(关卡85)

**Turban**(头巾) — 2个类别: Hats(关卡14), Headwear(关卡83)

**Turkey**(火鸡蛋) — 2个类别: Egg(关卡55), Poultry(关卡82)

**Turtle**(龟) — 2个类别: Reptiles(关卡6), Slow(关卡47)

**Walrus**(海象) — 2个类别: Arctic(关卡20), Whiskers(关卡71)

**Workshop**(车间) — 2个类别: Mechanic(关卡61), Garage(关卡100)

---

## 四、允许跨类别共用图片后的新增需求变化

如果同一个卡牌名（word）在不同类别中使用同一张图片，只需画一次。

### 仅考虑D+E类内部去重

| 指标 | 数量 |
|------|------|
| D+E类原始需求（每张独立） | 565 张 |
| 去重后独立word数 | 509 张 |
| **可节省** | **56 张** |

### 进一步：D+E类word在A/B/C中已有图片

D+E类中的word如果在A/B/C类别中也出现过，可直接复用已有图片，不用画新图。

| 指标 | 数量 |
|------|------|
| D+E类去重word总数 | 509 |
| 其中在A/B/C中已有 | 53（可复用） |
| 真正需要新画的 | **456 张** |

### 对比汇总

| 方案 | 需新增图片 | 节省 |
|------|----------|------|
| 原方案（每类别独立画） | 565 张 | — |
| D+E内部去重 | 509 张 | -56 |
| D+E去重 + 复用A/B/C | **456 张** | **-109** |

### 可从A/B/C复用的word（53个）

| word | D/E类中的类别(关卡) | A/B/C类中的类别(关卡) |
|------|-------------------|---------------------|
| Ant | Bugs(关卡60) | Insects(关卡4) |
| Beast | Fantasy(关卡77) | Monsters(关卡37) |
| Boots | Cowboy(关卡64) | Shoes(关卡46), Rain(关卡83) |
| Brioche | Breads(关卡12) | Pastry(关卡97) |
| Brownie | Treats(关卡46) | Pastry(关卡97) |
| Cap | Headwear(关卡83) | Hats(关卡14) |
| Car | Vehicle(关卡95) | Keys(关卡84) |
| Carrot | Roots(关卡91) | Veggie(关卡20) |
| Chair | Seats(关卡27) | Furniture(关卡6) |
| Cloud | Fluffy(关卡94) | Rain(关卡83) |
| Coin | Silver(关卡82) | Pay(关卡51) |
| Corn | Crops(关卡92) | Yellow(关卡66) |
| Crypto | Property(关卡94) | Pay(关卡51) |
| Cutlass | Swords(关卡31) | Pirate(关卡81) |
| Dragon | Wings(关卡76) | Monsters(关卡37) |
| Dumbbell | Heavy(关卡85) | Gym(关卡18) |
| Eagle | Wings(关卡76) | Birds(关卡10) |
| Eggplant | Squashes(关卡94) | Veggie(关卡20) |
| Gambler | Cowboy(关卡64) | Western(关卡34) |
| Grass | Park(关卡35) | Picnic(关卡74), Lawn(关卡93) |
| Guitar | Wooden(关卡8) | Play(关卡25) |
| Hat | Headwear(关卡83) | Hats(关卡14), Chef(关卡93) |
| Jacket | Wardrobe(关卡11), Clothes(关卡98) | Garments(关卡92) |
| Ladybug | Has red(关卡90) | Insects(关卡4) |
| Laptop | Gadget(关卡86) | Charger(关卡101) |
| Lasso | Cowboy(关卡64) | Western(关卡34) |
| Lemon | Citrus(关卡19) | Yellow(关卡66) |
| Lollipop | Treats(关卡46) | Candy(关卡75) |
| Marker | Office(关卡19), Writing(关卡58) | Schools(关卡101) |
| Mosquito | Bugs(关卡60) | Insects(关卡4) |
| Octagon | Polygons(关卡38) | Shapes(关卡12) |
| Olive | Oil(关卡50), Crops(关卡92) | Drupes(关卡63) |
| Pants | Wardrobe(关卡11) | Garments(关卡92) |
| Pizza | Olives(关卡86) | Eats(关卡32) |
| Pliers | Mechanic(关卡61) | Toolbox(关卡36), Tools(关卡90) |
| Potato | Crops(关卡92) | Veggie(关卡20) |
| Sausage | Hot dog(关卡22), Meat(关卡45) | Sandwich(关卡73) |
| Skirt | Laundry(关卡71), Clothes(关卡98) | Garments(关卡92) |
| Smartwatch | Gadget(关卡86) | Charger(关卡101) |
| Sofa | Seats(关卡27) | Furniture(关卡6) |
| Squid | No bones(关卡31) | Seafood(关卡21) |
| Stool | Seats(关卡27) | Chair(关卡80) |
| Swan | Egg(关卡55) | Birds(关卡10) |
| Tears | Fluids(关卡59) | Emoji(关卡5) |
| Tent | Housing(关卡67) | Camping(关卡24) |
| Tomato | Crops(关卡92) | Sandwich(关卡73) |
| Train | Vehicle(关卡95) | Transport(关卡11) |
| Troll | Fantasy(关卡77) | Folklore(关卡56) |
| Turban | Headwear(关卡83) | Hats(关卡14) |
| Turtle | Slow(关卡47) | Reptiles(关卡6) |
| Walrus | Arctic(关卡20) | Whiskers(关卡71) |
| Wrench | Mechanic(关卡61) | Toolbox(关卡36), Tools(关卡90) |
| Yacht | Ships(关卡88), Property(关卡94) | Luxury(关卡15) |
