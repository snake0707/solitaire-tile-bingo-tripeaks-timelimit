# v2 vs v3 内容差异行记录（Level 58-104）

> 日期：2026-03-24
> 背景：v3 原始文件 Level 58-104 没有英文和类别名，从 v2 的 **card_old** 页签（竞品原始数据）补全
> 注意：之前误用了 v2 的 card 页签（我们改过名的版本），导致类别名不准确（如 Wings→Mail, Ruminant→Rodents）

## 差异说明

v3 在 Level 58-104 只有中文翻译，英文列为空。合并时从 v2 **card_old** 按 (level, category) 编号补全英文。
其中 17 行 v3 的中文内容与 card_old 的英文描述不同主题，不能直接沿用。

## 处理决策

- **使用 v2 英文**（6 行）：保留已拷贝的 v2 英文，不改动中文
- **使用 v3 中文**（13 行）：将 v3 中文翻译为英文，替换掉错误拷贝的 v2 英文

---

## 使用 v2 英文（6 行）

以下行保留 v2 英文不变，v3 中文虽有差异但不影响使用。

### Level 60, cat6 — Thriller
- 类别名: v2=Thriller(惊悚) / v3=成語
- v2 英文: Danger / Suspense / Intrigue / Tension
- v2 中文: 危险 / 悬念 / 阴谋 / 紧张
- v3 中文: 以卵擊石 / 先發制人 / 老當益壯 / 井底之蛙

### Level 70, cat1 — Mascots
- 类别名: v2=Mascots(吉祥物) / v3=吉祥物
- v2 英文: Gritty / Youppi / Burnie / Poe / Nordy / Iceburgh / Roary / Fredbird
- v2 中文: 坚韧的 / 优皮 / 伯尼 / 坡 / 诺迪 / 冰堡 / 罗瑞 / 弗雷德鸟
- v3 中文: 熊本熊 / 尤皮吉祥物 / 凱蒂貓 / 吉伊卡哇 / 熊大 / 米其林寶寶 / 皮卡丘 / 紅雀吉祥物

### Level 81, cat12 — Jupiter
- 类别名: v2=Jupiter(木星) / v3=木星
- v2 英文: Io / Europa / Ganymede / Callisto
- v2 中文: 艾奥 / 欧罗巴 / 盖尼米得 / 卡利斯托
- v3 中文: 木衛一 / 木衛二 / 木衛三 / 木衛四

### Level 88, cat1 — US State
- 类别名: v2=US State(美国州) / v3=台灣地區
- v2 英文: Maine / Montana / Idaho / Oregon / Utah / Arizona / Iowa / Wyoming
- v2 中文: 缅因州 / 蒙大拿州 / 爱达荷州 / 俄勒冈州 / 犹他州 / 亚利桑那州 / 爱荷华州 / 怀俄明州
- v3 中文: 宜蘭縣 / 新竹縣 / 苗栗縣 / 彰化縣 / 南投縣 / 雲林縣 / 嘉義縣 / 花蓮縣

### Level 90, cat3 — Names
- 类别名: v2=Names(名字) / v3=姓氏
- v2 英文: Michael / Andrew / Brian / Craig / David / Justin / Kevin / Sheldon
- v2 中文: 迈克尔 / 安德鲁 / 布莱恩 / 克雷格 / 大卫 / 贾斯汀 / 凯文 / 谢尔顿
- v3 中文: 陳 / 李 / 張 / 蔡 / 楊 / 林 / 黃 / 吳

### Level 90, cat4 — Hobbies
- 类别名: v2=Hobbies(爱好) / v3=興趣
- v2 英文: Beading / Gaming / Fishing / Origami / Camping / Crochet
- v2 中文: 串珠 / 游戏 / 钓鱼 / 折纸 / 露营 / 钩针编织
- v3 中文: 寫作 / 烹飪 / 釣魚 / 摺紙 / 露營 / 園藝

---

## 使用 v3 中文 → 翻译为英文（13 行）

以下行的 v2 英文与 v3 中文主题不同，需将 v3 中文翻译为英文替换。

### Level 59, cat2 — Comics → 英雄漫畫
- 类别名: v2=Comics(漫画) / v3=英雄漫畫
- v2 英文: Issue / Universe / Villain / Antihero / Bubble / Sidekick / Hero / Caption
- v3 中文: 期刊 / 漫威宇宙 / 反派 / 超凡能力 / 對話框 / 標誌性服裝 / 英雄 / DC宇宙
- **翻译英文**: Issue / Marvel Universe / Villain / Superpower / Speech bubble / Iconic costume / Hero / DC Universe

### Level 59, cat3 — Engine → 運動
- 类别名: v2=Engine(发动机) / v3=運動
- v2 英文: Diesel / Gasoline / Injector / Petrol / Piston / Camshaft / Cylinder / Torque
- v3 中文: 游泳 / 高爾夫 / 超慢跑 / 網球 / 籃球 / 足球 / 羽毛球 / 乒乓球
- **翻译英文**: Swimming / Golf / Jogging / Tennis / Basketball / Football / Badminton / Table tennis

### Level 59, cat5 — Ecology → 生態學
- 类别名: v2=Ecology(生态) / v3=生態學
- v2 英文: Recycle / Reuse / Upcycle / Wildlife / Ecozone / Nature
- v3 中文: 食物鏈 / 生物圈 / 物質循環 / 能量流動 / 生態區 / 全球變遷
- **翻译英文**: Food chain / Biosphere / Material cycle / Energy flow / Ecozone / Global change

### Level 60, cat8 — Insects → 牆壁 [图片]
- 类别名: v2=Insects(昆虫) / v3=牆壁
- v2 英文: Beetle / Termite / Mosquito / Ant
- v3 中文: Wall mirror / Wall doorbell / Wall switch / Wall poster
- **翻译英文**: Wall mirror / Wall doorbell / Wall switch / Wall poster（已是英文）

### Level 62, cat5 — Scorpion → 記者 [文字→图片]
- 类别名: v2=Scorpion(蝎子) / v3=記者
- v2 英文: Stinger / Venom / Arachnid
- v3 中文: Audio recorder / Press card / Headline
- **翻译英文**: Audio recorder / Press card / Headline（已是英文）

### Level 65, cat8 — Vampire → 背包 [图片]
- 类别名: v2=Vampire(吸血鬼) / v3=背包
- v2 英文: Scarab / Weevil / Rhino beetle / Weaver
- v3 中文: First aid / Warm hat / Rain jacket / Rescue flashlight
- **翻译英文**: First aid / Warm hat / Rain jacket / Rescue flashlight（已是英文）

### Level 66, cat2 — Ants → 嬰兒 [文字→图片]
- 类别名: v2=Ants(蚂蚁) / v3=嬰兒
- v2 英文: Colony / Queen / Worker / Soldier / Teamwork / Anthill / Larvae / Antennae
- v3 中文: Baby owlet / Baby eaglet / Baby squab / Baby poult / Baby duckling / Baby gosling / Baby cygnet / Baby puffling
- **翻译英文**: Baby owlet / Baby eaglet / Baby squab / Baby poult / Baby duckling / Baby gosling / Baby cygnet / Baby puffling（已是英文）

### Level 72, cat3 — Spider → X光 [文字→图片]
- 类别名: v2=Spider(蜘蛛) / v3=X光
- v2 英文: Web / Arachnid / Venom / Cocoon
- v3 中文: Chest X / Teeth X / Abdomen X / Skull X
- **翻译英文**: Chest X-ray / Teeth X-ray / Abdomen X-ray / Skull X-ray

### Level 91, cat4 — Part of → 碎屑
- 类别名: v2=Part of(部分) / v3=碎屑
- v2 英文: Crumb / Clod / Blob / Speck / Slab / Splinter / Chunk / Segment
- v3 中文: 麵包屑 / 土塊 / 植物殘體 / 粉末狀 / 石板 / 珊瑚骨骼 / 木材 / 枯枝落葉
- **翻译英文**: Breadcrumb / Clod / Plant debris / Powder / Slab / Coral skeleton / Timber / Leaf litter

### Level 91, cat13 — Day → 日子
- 类别名: v2=Day(一天) / v3=日子
- v2 英文: Holiday / Sunday / light / dream
- v3 中文: 星期六 / 星期日 / 星期一 / 星期三
- **翻译英文**: Saturday / Sunday / Monday / Wednesday

### Level 91, cat14 — X-word → X字詞
- 类别名: v2=X-word(X词) / v3=X字詞
- v2 英文: X-ray / X-files / X-mass
- v3 中文: X射線 / X檔案 / X戰警
- **翻译英文**: X-ray / X-Files / X-Men

### Level 99, cat8 — Insects → 工程師 [图片]
- 类别名: v2=Insects(昆虫) / v3=工程師
- v2 英文: Spider / Centipede / Scorpion / Tick
- v3 中文: Blueprint / Equations / Lightbulb / Protractor
- **翻译英文**: Blueprint / Equations / Lightbulb / Protractor（已是英文）

### Level 101, cat12 — Costume → 裝扮
- 类别名: v2=Costume(服装) / v3=裝扮
- v2 英文: Mime / Viking / Cosplay / Vampire
- v3 中文: 默劇 / 間諜 / 角色扮演 / 模特兒
- **翻译英文**: Mime / Spy / Cosplay / Model
