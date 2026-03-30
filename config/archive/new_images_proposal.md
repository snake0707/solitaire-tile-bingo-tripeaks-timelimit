# 新增图片类别方案（基于 v3 merged + card_old 全104关数据）

> 更新日期：2026-03-25
> 数据源：`config/level_config_v3_merged.xlsx`（104关），v2 `card_old` 页签（竞品原始数据）
> 策略：已有前缀复用 + 空闲前缀映射（优先名称匹配度，兼顾卡牌数量） + 跨类别同名 word 共用图片

## 总览

| 分类 | 类别数 | 需新增图片 | 说明 |
|------|--------|----------|------|
| A. 直接复用已有前缀 | 60 | 0 张 | categoryName 小写 = 已有前缀 |
| C. 空闲前缀映射 | 20 | 0 张 | 20 个空闲前缀全部映射 |
| E. 全新类别 | 118 | 见下方 | 无可复用前缀 |
| **总计** | **198** | **455 张** | E 类去重 + 复用已有 + 同名图片复用 |

### E 类图片需求明细

| 指标 | 数量 |
|------|------|
| E 类卡牌总槽位 | 603 |
| 跨类别同名 word 共用 | -80 |
| 复用 A/C 已有图片（名称精确匹配） | -54 |
| 已有同名图片可复用 | -14 |
| **实际需新画** | **455 张** |

> 详细清单见 `config/new_images_list.xlsx`（`需新增` sheet 列出了 455 张需新画的图片）
> 注：「复用A/C」仅标记 word 在 A/C 类前缀下有精确名称匹配图片的情况，随机分配不算复用
> 用户确认不复用已有图片的: Bottle(Milk)、Boots(Cowboy)、Lion(Big cats/Chimera)、Walrus(Arctic) — 其中 Big cats/Lion 和 Chimera/Lion 共用一张新画图片

---

## A. 直接复用已有前缀（60 个类别）

categoryName 小写直接匹配 `res/Item/` 中已有前缀，0 新图。

| 类别 | 前缀 | 出现关卡 | word 数 |
|------|------|---------|--------|
| 3D | 3d | 95 | 4 |
| Aquatics | aquatics | 44, 72, 85 | 3~8 |
| Beach | beach | 54, 94 | 4~6 |
| Birthday | birthday | 88 | 6 |
| Build | build | 41, 67, 101 | 4~8 |
| Burger | burger | 2 | 4 |
| Camping | camping | 24, 94 | 3~8 |
| Candy | candy | 75 | 4 |
| Chair | chair | 80 | 8 |
| Charger | charger | 86, 101 | 5~6 |
| Chef | chef | 93 | 3 |
| Chess | chess | 3 | 4 |
| Cleaning | cleaning | 39 | 8 |
| Deck | deck | 7 | 8 |
| Dogs | dogs | 24 | 8 |
| Drinks | drinks | 3, 90, 103 | 4~8 |
| Drupes | drupes | 63, 86 | 3~8 |
| Eats | eats | 32, 73 | 8 |
| Egypt | egypt | 104 | 4 |
| Flowers | flowers | 4 | 7 |
| Folklore | folklore | 56, 77 | 7~8 |
| Fruits | fruits | 16, 102 | 3~8 |
| Furniture | furniture | 6 | 5 |
| Garments | garments | 71, 91 | 5~6 |
| Gym | gym | 18, 85 | 3~6 |
| Hats | hats | 14, 70, 83 | 3~8 |
| Jewelry | jewelry | 4, 89, 102 | 4~8 |
| Keys | keys | 84, 95 | 4~8 |
| Landmark | landmark | 84, 97 | 4~8 |
| Lawn | lawn | 93 | 4 |
| Luxury | luxury | 15, 94 | 4~8 |
| Mail | mail | 76, 89 | 3~8 |
| Mall | mall | 78, 104 | 4~8 |
| Map | map | 5, 82 | 4~8 |
| Pairs | pairs | 24, 81, 92 | 3 |
| Pastry | pastry | 97 | 8 |
| Picnic | picnic | 74 | 8 |
| Pirate | pirate | 81 | 6 |
| Play | play | 25, 92 | 8 |
| Rain | rain | 83 | 6 |
| Reptiles | reptiles | 6, 69 | 4~7 |
| Rodents | rodents | 16, 76, 96 | 3~6 |
| Sailor | sailor | 78, 91 | 4 |
| Seafood | seafood | 21 | 8 |
| Shapes | shapes | 12, 100 | 4 |
| Shoes | shoes | 46, 92 | 8 |
| Space | space | 79 | 3 |
| Sports | sports | 6, 103 | 3~7 |
| Tarot | tarot | 44, 59 | 4 |
| Toolbox | toolbox | 36, 61, 87, 100 | 4~8 |
| Tools | tools | 86, 98 | 6~8 |
| Toys | toys | 17 | 3 |
| Transport | transport | 11, 79, 95 | 4~5 |
| Vampire | vampire | 65, 96 | 4~8 |
| Veggie | veggie | 20, 91 | 8 |
| Western | western | 34, 64 | 4~6 |
| Whiskers | whiskers | 71 | 5 |
| Wind | wind | 78, 99 | 8 |
| Xmas | xmas | 63, 87, 98 | 3~8 |
| Yellow | yellow | 66 | 8 |
| Zodiac | zodiac | 8, 80 | 3~8 |

## C. 空闲前缀映射（20 个类别）

将 20 个空闲前缀映射到 E 类中卡牌数量最多的类别，优先 8 word 的。0 新图。

| 类别 | → 前缀 | 出现关卡 | word 数 | 匹配度 |
|------|--------|---------|--------|--------|
| Baby | babies | 70 | 4 | 高（婴儿用品，100%名称匹配） |
| Birds | bird | 10 | 8 | 高（鸟类） |
| Fantasy | halloween | 77 | 8 | 高（奇幻→万圣节） |
| Emoji | icons | 5 | 8 | 高（表情→图标） |
| Desktop | screen | 68 | 8 | 高（桌面→屏幕） |
| Elements | space | 13 | 8 | 中（化学元素→太空） |
| Ensemble | strings | 52 | 8 | 中（合奏→弦乐） |
| Mosaic | arts | 78 | 8 | 高（马赛克→艺术） |
| Has red | purple | 90 | 8 | 中（红色物品→紫色） |
| Sandwich | utensils | 73 | 8 | 中（三明治→厨具） |
| Plant | ecoitems | 98 | 8 | 高（植物→环保） |
| Writing | supplies | 58 | 6 | 高（书写→文具） |
| Titles | egypt | 28 | 6 | 中（头衔→埃及） |
| Age | medical | 89 | 6 | 中（年龄→医疗） |
| Sea fish | seafish | 100 | 6 | 高（海鱼→海鱼） |
| Deserts | desert | 102 | 4 | 高（沙漠，100%名称匹配） |
| Decorate | decor | 41 | 4 | 高（装饰→装饰） |
| Backpack | survival | 65 | 4 | 高（背包→生存） |
| Gems | gemstone | 89 | 4 | 高（宝石→宝石） |
| No bones | insects | 31 | 5 | 中（无脊椎→昆虫） |

## E. 全新类别（118 个）— 需新增图片

### 8 word 类别（27 个）

| 类别 | 出现关卡 | 卡牌列表 |
|------|---------|---------|
| 90s | 20 | Boom box, Cassette tape, Landline phone, Neon windbreaker, Polaroid camera, Scrunchie, VHS tape, Walkman |
| Baby birds | 66 | Baby owlet, Baby eaglet, Baby squab, Baby poult, Baby duckling, Baby gosling, Baby cygnet, Baby puffling |
| Big cats | 51 | Bobcat, Cheetah, Cougar, Jaguar, Leopard, Lion, Puma, Tiger |
| Bouquet | 33 | Corsage, Filler, Florist, Flower, Foliage, Petal, Ribbon, Wrapper |
| Breads | 12 | Arepa, Baguette, Brioche, Challah, Ciabatta, Focaccia, Pita, Tortilla |
| Crops | 92 | Corn, Flax, Oats, Olive, Potato, Quinoa, Sunflower, Tomato |
| Egg | 55 | Chicken, Duck, Goose, Ostrich, Penguin, Quail, Swan, Turkey |
| Fluffy | 94 | Alpaca, Cloud, Cotton, Feather, Foam, Fur, Pom-pom, Snow |
| Headwear | 83 | Bonnet, Bowler, Cap, Crown, Fez, Hat, Helmet, Turban |
| Hoof | 30 | Addax, Alpaca, Antelope, Bison, Giraffe, Moose, Okapi, Zebra |
| Hoofed | 84 | Bison, Camel, Giraffe, Goat, Llama, Sheep, Warthog, Zebra |
| Japan | 28 | Gyoza, Ikebana, Kimono, Miso, Mochi, Origami, Ramen, Tempura |
| Keyboard | 35 | Alt, Control, Delete, Enter, Escape, Shift, Spacebar, Tab |
| Legumes | 95 | Alfalfa, Clover, Gram, Guar, Lentil, Lupin, Peanut, Soybean |
| Milk | 103 | Almond, Bottle, Carton, Coconut, Cup, Glass, Oat, Soy |
| Money | 57 | Dollar, Euro, Franc, Lira, Peso, Rupee, Yen, Yuan |
| Numbers | 89 | Eight, Five, Nine, Seven, Six, Three, Two, Zero |
| Primates | 17 | Baboon, Gibbon, Gorilla, Lemur, Macaque, Mandrill, Simian, Tarsier |
| Property | 94 | Crypto, Flat, Gems, House, Land, Money, Stocks, Yacht |
| Roots | 91 | Beet, Carrot, Celery, Daikon, Ginger, Parsnip, Radish, Turnip |
| Santa | 63 | Beard, Chimney, Claus, Elves, Gifts, Reindeer, Sleigh, Stocking |
| Schools | 101 | Calculator, Chalkboard, Classroom, Laboratory, Locker, Marker, School building, Textbook |
| Sound | 29 | Bark, Bleat, Caw, Croak, Howl, Meow, Quack, Squeal |
| Straight | 87 | Column, Ladder, Pointer, Pole, Rails, Rod, Ruler, Sword |
| Swords | 31 | Claymore, Cutlass, Falcata, Falchion, Katana, Rapier, Saber, Scimitar |
| Wings | 76 | Angel, Bat, Butterfly, Dragon, Eagle, Firefly, Pegasus, Pigeon |
| Woman | 102 | Dress, Earring, Handbag, High heels, Lipstick, Nail polish, Necklace, Perfume |

### 7 word 类别（1 个）

| 类别 | 出现关卡 | 卡牌列表 |
|------|---------|---------|
| Desserts | 7 | Donut, Eclair, Macaron, Muffin, Sorbet, Sweets, Tiramisu |

### 6 word 类别（16 个）

| 类别 | 出现关卡 | 卡牌列表 |
|------|---------|---------|
| Animals | 2 | Bear, Goat, Horse, Monkey, Pig, Sheep |
| Clothes | 98 | Blouse, Jacket, Jeans, Pullover, Skirt, Sweater |
| Dress | 18 | Bodycon, Cocktail, Gown, Mini, Sundress, Tunic |
| Equidae | 50 | Donkey, Horse, Mule, Mustang, Pony, Zebra |
| Grandma | 4 | Cozy slippers, Grandma glasses, Grandma photos, Knitting scarf, Needle case, Rocking chair |
| Hairs | 43 | Afro, Bob, Fade, Mohawk, Mullet, Undercut |
| Heavy | 85 | Anchor, Anvil, Boulder, Dumbbell, Ship, Truck |
| Herbs | 29 | Chives, Dill, Parsley, Rosemary, Sage, Thyme |
| Lipstick | 33 | Burgundy, Crimson, Fuchsia, Nude, Ruby red, Scarlet |
| Mechanic | 61 | Jack, Pliers, Ratchet, Spanner, Workshop, Wrench |
| Neckline | 91 | Collar, Cowl, Polo, Scooped, Turtleneck, V-neck |
| Omnivore | 96 | Bear, Boar, Human, Monkey, Raccoon, Skunk |
| Park | 35 | Bench, Fountain, Grass, Pathway, Plant, Tree |
| Parrots | 26 | Budgie, Cockatoo, Eclectus, Lorikeet, Macaw, Parakeet |
| Police | 40 | Arrest, Badge, Baton, Handcuff, Officer, Uniform |
| Polygons | 38 | Decagon, Heptagon, Hexagon, Octagon, Pentagon, Triangle |

### 5 word 类别（4 个）

| 类别 | 出现关卡 | 卡牌列表 |
|------|---------|---------|
| Gadget | 86 | Drone, Laptop, Robot vacuum, Smartwatch, VR headset |
| Laundry | 71 | Blouse, Hoodie, Skirt, Trousers, Vest |
| Pay | 51 | Bank card, Banknote, Cash, Coin, Crypto |
| Wardrobe | 11 | Jacket, Jeans, Jumper, Pants, Sweater |

### 4 word 类别（42 个）

| 类别 | 出现关卡 | 卡牌列表 |
|------|---------|---------|
| Anchors | 91 | Claw, Fluke, Grapnel, Plow |
| Arctic | 20 | Polar bear, Reindeer, Snowy owl, Walrus |
| Awards | 58 | Emmy, Grammy, Oscar, Tony |
| Baby | 70 | Diaper, Pacifier, Rattle, Stroller |
| Coins | 39 | Cent, Dime, Nickel, Penny |
| Compass | 9 | East, North, South, West |
| Cowboy | 64 | Boots, Gambler, Horse, Lasso |
| Deserts | 102 | Cacti, Camel, Dunes, Oasis |
| Email | 44 | Drafts, Inbox, Sent, Trash |
| Engineer | 99 | Blueprint, Equations, Lightbulb, Protractor |
| Exam | 103 | Blackboard, Calculator, Diploma, Notes |
| Fastener | 48 | Bolt, Nail, Rivet, Screw |
| Fluids | 59 | Blood, Saliva, Sweat, Tears |
| Garage | 100 | Driveway, Opener, Remote, Workshop |
| Glasses | 98 | Monocle, Reading, Safety, Sunglasses |
| Head | 49 | Brain, Face, Hair, Skull |
| Housing | 67 | Bungalow, Duplex, Mansion, Tent |
| Lamp | 40 | Bulb, Cord, Plug, Switch |
| Market | 78 | Bags, Fruits, Goods, Tags |
| Match | 101 | Lighter, Score, Spark, Wedding |
| Meat | 45 | Bacon, Chops, Chorizo, Sausage |
| Monsters | 37 | Beast, Dragon, Ogre, Vampire |
| Neck | 81 | Bow tie, Collar, Scarf, tie |
| Neckwear | 72 | Bow tie, Choker, Necktie, Scarf |
| Office | 19 | Eraser, Marker, Pen, Pencil |
| Pasta | 48 | Macaroni, Penne, Ravioli, Rigatoni |
| Poultry | 82 | Chicken, Duck, Quail, Turkey |
| Round | 100 | Ball, Clocks, Earth, Plate |
| Seats | 27 | Bench, Chair, Sofa, Stool |
| Ships | 88 | Barge, Boat, Canoe, Ferry, Frigate, Yacht |
| Sign | 76 | Keep left, Keep right, No turns, Speed limit, Stop, Yield |
| Silver | 82 | Coin, Cutlery, Goblet, Medal |
| Squashes | 94 | Eggplant, Pumpkin, Squash, Zucchini |
| Street | 79 | Bike, Brick, Corner, Driver |
| Toppings | 34 | Caramel, Honey, Jelly, Syrup |
| Treats | 46 | Brownie, Churro, Cupcake, Lollipop |
| Tribe | 104 | Djembe, Talisman, Tattoo, Totem |
| Turtles | 69 | Donnie, Leonardo, Mikey, Raph |
| Vehicle | 95 | Boat, Bus, Car, Train |
| Vehicles | 9 | Combine, Pickup, Trailer, Truck |
| Violin | 53 | Cello, Clarinet, Flute, Oboe |
| Wall | 60 | Wall doorbell, Wall mirror, Wall poster, Wall switch |
| X-ray | 72 | Abdomen X-ray, Chest X-ray, Skull X-ray, Teeth X-ray |

### 3 word 类别（28 个）

| 类别 | 出现关卡 | 卡牌列表 |
|------|---------|---------|
| Ads | 101 | Billboard, Newspaper, TV screen |
| Ball | 103 | Baseball, Basketball, Golf ball |
| Beards | 70 | Balbo, Ducktail, Goatee |
| Canvas | 77 | Colors, Lines, Shapes |
| Chimera | 81 | Goat, Lion, Serpent |
| Citrus | 19 | Lemon, Lime, Pomelo |
| Hair | 26 | Coily, Curly, Wavy |
| Horse | 37 | Donkey, Mule, Zebra |
| Hot dog | 22 | Ketchup, Sausage, Soft bun |
| Jeans | 80 | Legs, Pocket, Zipper |
| Kettle | 45 | Handle, Lid, Spout |
| Navigate | 25 | Compass, Sextant, Signpost |
| Oil | 50 | Coconut, Olive, Palm |
| Olives | 86 | Oil, Pizza, Salad |
| Orange | 102 | Fire, Pumpkin, juice |
| Person | 92 | Kid, Man, Woman |
| Pig | 42 | Hog, Piglet, Sow |
| Pond | 85 | Duck, Frog, Reed |
| Reporter | 62 | Audio recorder, Headline, Press card |
| Rocks | 36 | Boulder, Gravel, Pebble |
| Ruminant | 76 | Antelope, Deer, Gazelle |
| Slow | 47 | Sloth, Snail, Turtle |
| Singer | 86 | Audience, Band, Microphone stand, Music awards, Music notes, Vinyl record |
| Studio | 79 | Microphone stand, Music notes, Room |
| Wake up | 73 | Alarm, Rooster, Sunrise |
| Whistle | 74 | Bird, Kettle, Referee |
| Wooden | 8 | Book, Guitar, Pencil |

---

## E 类图片优化

### 跨类别同名 word（只需画 1 次，省 50 张）

出现在 2+ 个 E 类类别的 word，只需画一次：

| word | 出现类别 |
|------|---------|
| Zebra | Equidae, Hoof, Hoofed, Horse |
| Goat | Animals, Chimera, Hoofed |
| Duck | Egg, Pond, Poultry |
| Horse | Animals, Cowboy, Equidae |
| Bison | Hoof, Hoofed |
| Giraffe | Hoof, Hoofed |
| Bear | Animals, Omnivore |
| Monkey | Animals, Omnivore |
| Donkey | Equidae, Horse |
| Mule | Equidae, Horse |
| Lion | Big cats, Chimera |
| Swan | Birds, Egg |
| Eagle | Birds, Wings |
| Dragon | Monsters, Wings |
| Chicken | Egg, Poultry |
| Turkey | Egg, Poultry |
| Quail | Egg, Poultry |
| …（共 58 个 word） |

### 复用 A/C 已有图片（省 63 张）

E 类 word 与 A/C 类 word 同名，可复用已有图片：

Bin, Boots, Brioche, Brownie, Cap, Car, Carrot, Cash, Cello, Chair, Cheese, Clarinet, Cloud, Corn, Cutlass, Dress, Dumbbell, Earring, Eggplant, Flute, Gambler, Grass, Guitar, Hat, Jacket, Laptop, Lasso, Lemon, Lollipop, Necklace, Octagon, Ogre, Olive, Pants, Pizza, Pliers, Potato, School building, Shark, Skirt, Smartwatch, Sofa, Squid, Stool, Tent, Train, Troll, Turban, Turtle, Walrus, Wrench, Yacht
