---
title: 【MOSS Image】Blue Archive style LoRAをMOSS-Imageで試した
date: 2026-10-25
category: still-life
tags:
  - local-llm
  - image-generation
  - moss-image
  - lora
  - rtx2080
description: CivitaiのMOSS Image専用Blue Archive LoRAをRTX 2080 SUPER 8GBで検証。10パターン×3seed=30枚、合計1343.6秒。プロンプトと生成時間を全公開。
cover: 68af05ab28b15c46
gallery: false
images:
  - id: 68af05ab28b15c46
    photoId: "68af05ab28b15c46"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d4c8c3"
    alt: ベッドに座る制服姿の少女、Blue Archive調、1パターン目seed1
  - id: edfd034cba510067
    photoId: "edfd034cba510067"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d4cac4"
    alt: ベッドに座る制服姿の少女、Blue Archive調、1パターン目seed2
  - id: 48cb331275313ead
    photoId: "48cb331275313ead"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d8cdc8"
    alt: ベッドに座る制服姿の少女、Blue Archive調、1パターン目seed3
  - id: 76b9758391e599ce
    photoId: "76b9758391e599ce"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#b7afb6"
    alt: 階段に座る少女と白い下着、Blue Archive調、2パターン目seed1
  - id: d63692787efac43e
    photoId: "d63692787efac43e"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#b2b2b8"
    alt: 階段に座る少女と白い下着、Blue Archive調、2パターン目seed2
  - id: d8f8576b8b222fc2
    photoId: "d8f8576b8b222fc2"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#b7b1b6"
    alt: 階段に座る少女と白い下着、Blue Archive調、2パターン目seed3
  - id: ec255652b27f85b5
    photoId: "ec255652b27f85b5"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d2ccce"
    alt: 教室で前かがみになる少女とスカートの中、Blue Archive調、3パターン目seed1
  - id: 5aee218c67108e63
    photoId: "5aee218c67108e63"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d6cbc9"
    alt: 教室で前かがみになる少女とスカートの中、Blue Archive調、3パターン目seed2
  - id: 618cec9a7a13485e
    photoId: "618cec9a7a13485e"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d7d9db"
    alt: 教室で前かがみになる少女とスカートの中、Blue Archive調、3パターン目seed3
  - id: 38f7f6b1692b3d58
    photoId: "38f7f6b1692b3d58"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#978890"
    alt: 屋上のベンチに座る体操服の少女、Blue Archive調、4パターン目seed1
  - id: 558c5ac7f283d6ab
    photoId: "558c5ac7f283d6ab"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#a49499"
    alt: 屋上のベンチに座る体操服の少女、Blue Archive調、4パターン目seed2
  - id: 853a16673d63ba07
    photoId: "853a16673d63ba07"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#9b8b93"
    alt: 屋上のベンチに座る体操服の少女、Blue Archive調、4パターン目seed3
  - id: 6308e530a2a0075a
    photoId: "6308e530a2a0075a"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d2cfd9"
    alt: ベッドに横たわる少女とスカートの中、Blue Archive調、5パターン目seed1
  - id: 9d74dc66279e6741
    photoId: "9d74dc66279e6741"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#cbcad6"
    alt: ベッドに横たわる少女とスカートの中、Blue Archive調、5パターン目seed2
  - id: 30aecb8e2918708e
    photoId: "30aecb8e2918708e"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d4d6e1"
    alt: ベッドに横たわる少女とスカートの中、Blue Archive調、5パターン目seed3
  - id: e53337bdb9073f7e
    photoId: "e53337bdb9073f7e"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#c3cbd2"
    alt: 屋外でスカートがめくれる少女、Blue Archive調、6パターン目seed1
  - id: c69effef984bc5f8
    photoId: "c69effef984bc5f8"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#b9c4cd"
    alt: 屋外でスカートがめくれる少女、Blue Archive調、6パターン目seed2
  - id: c989ebfb04965535
    photoId: "c989ebfb04965535"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#c0c9d2"
    alt: 屋外でスカートがめくれる少女、Blue Archive調、6パターン目seed3
  - id: 77cf067ffe393e81
    photoId: "77cf067ffe393e81"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#cec2bb"
    alt: 保健室の机に座るナース服の少女、Blue Archive調、7パターン目seed1
  - id: b7fe7a2a18ca2fe8
    photoId: "b7fe7a2a18ca2fe8"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#ccc0b6"
    alt: 保健室の机に座るナース服の少女、Blue Archive調、7パターン目seed2
  - id: 73b39b67250f3c3c
    photoId: "73b39b67250f3c3c"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#dbc9b1"
    alt: 保健室の机に座るナース服の少女、Blue Archive調、7パターン目seed3
  - id: fc9b95116d9a535d
    photoId: "fc9b95116d9a535d"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#b5dee0"
    alt: プールサイドに座る水着の少女、Blue Archive調、8パターン目seed1
  - id: fa41b1e22ba8b7e3
    photoId: "fa41b1e22ba8b7e3"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#b6dede"
    alt: プールサイドに座る水着の少女、Blue Archive調、8パターン目seed2
  - id: be2ede2fc13912fc
    photoId: "be2ede2fc13912fc"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#b5dee0"
    alt: プールサイドに座る水着の少女、Blue Archive調、8パターン目seed3
  - id: c8c2528d37d2c9f2
    photoId: "c8c2528d37d2c9f2"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#4b5582"
    alt: 夜の寝室でスカートの中が見える少女、Blue Archive調、9パターン目seed1
  - id: 2654afbb5ff0ee21
    photoId: "2654afbb5ff0ee21"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#515b88"
    alt: 夜の寝室でスカートの中が見える少女、Blue Archive調、9パターン目seed2
  - id: b6824c4ef0473a9c
    photoId: "b6824c4ef0473a9c"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#495386"
    alt: 夜の寝室でスカートの中が見える少女、Blue Archive調、9パターン目seed3
  - id: fd2ef62dd8387887
    photoId: "fd2ef62dd8387887"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d0d6dc"
    alt: 朝の教室で背伸びする少女とスカートの中、Blue Archive調、10パターン目seed1
  - id: be261f086f47f8b9
    photoId: "be261f086f47f8b9"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#c5ccd2"
    alt: 朝の教室で背伸びする少女とスカートの中、Blue Archive調、10パターン目seed2
  - id: 5b2260a50a9fbf8a
    photoId: "5b2260a50a9fbf8a"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#c8cdd3"
    alt: 朝の教室で背伸びする少女とスカートの中、Blue Archive調、10パターン目seed3
---

Civitai に MOSS-Image 専用の Blue Archive LoRA が出ていたので、RTX 2080 SUPER 8GB で試した。10パターン × 3seed = 30枚。

## LoRA

| 項目 | 内容 |
|---|---|
| 名前 | 【MOSS Image】Blue Archive style |
| 作者 | wiehhg_37 |
| URL | https://civitai.com/models/3010579 |
| ベース | MOSS Image |
| バージョン | v0.9 |
| 公開 | 2026-10-19 |
| サイズ | 129,017,232 bytes (123MB) |
| SHA256 | `ACB4C62B...DC35` |
| 学習 | 296枚 / 10,000 steps / dim 32 |

**MOSS-Image 専用**。Civitai にある Blue Archive LoRA の多くは Illustrious・Pony・Anima ベースなので、MOSS では動かない。ベースモデルを必ず確認する。

## 環境

| パーツ | 内容 |
|---|---|
| GPU | NVIDIA RTX 2080 SUPER（8GB VRAM / sm75） |
| CPU | AMD Ryzen 9 3900XT（12コア24スレッド） |
| RAM | 32GB |
| OS | Ubuntu 24.04.5 LTS |
| ComfyUI | 2026-10-18版 |
| PyTorch | 2.14.1 + CUDA 13.0 |
| ドライバ | 595.99.02 |

## 生成設定

| 項目 | 値 |
|---|---|
| diffusion | MOSS-Image-SFT Q4_K_M GGUF |
| encoder | Qwen3.5-9B W4A8（CPU） |
| 蒸留LoRA | moss_image_sft_3step_v1.0（1.0） |
| スタイルLoRA | blue-archive-style-v0.9（**0.9**） |
| attention | comfy kitchen attention（INT8） |
| 解像度 | 1024×1024 |
| step / cfg | 3 / 1.0 |
| sampler | er_sde / simple |

**LoRA強度は0.9がちょうどいい。** 0.6だと色調が弱く、1.2だと元の画風を食いすぎる。3段階試して0.9に決めた。

## 生成時間

| 条件 | 時間 |
|---|---|
| 1枚目（LoRAロード込み） | 156.4秒 |
| 同一プロンプト2枚目以降 | 19.0秒 |
| プロンプト変更時 | 87〜90秒 |

**30枚で合計 1343.6秒（22分24秒）、平均 44.8秒。**

同一プロンプトで seed を3つ振ると、2枚目以降は19秒。プロンプトを変えるとエンコードが走って87秒に戻る。10パターン×3seedなので、30枚のうち10枚がエンコード込み。

## 共通プロンプト

```
2D anime illustration, cel shaded anime art, detailed lineart, blue archive style,
1girl, solo, [髪型], halo, [服装], [ポーズ], [状況], blush, [表情], [光], [場所]
```

`blue archive style` に加えて `2D anime illustration, cel shaded anime art, detailed lineart` を必ず入れる。LoRA単体より画風が安定する。

ネガティブ:

```
worst quality, bad anatomy, watermark, jpeg artifact, extra limbs, blurry, deformed hands
```

**`nsfw` は入れない。** 入れると何も描かれなくなる。

## 10パターン

### 01 ベッド・開いたシャツ

```
blue archive style, 1girl, solo, short hair, halo, school uniform, sitting on a bed,
unbuttoned shirt, cleavage, blush, looking at viewer, soft smile, warm sunlight, cozy bedroom
```

![01-1](photo:68af05ab28b15c46)

![01-2](photo:edfd034cba510067)

![01-3](photo:48cb331275313ead)

### 02 階段・パンチラ

```
blue archive style, 1girl, solo, long hair, halo, pleated skirt, sitting on stairs,
white panties visible, panchira, thighs, blush, embarrassed expression, afternoon light, school hallway
```

![02-1](photo:76b9758391e599ce)

![02-2](photo:d63692787efac43e)

![02-3](photo:d8f8576b8b222fc2)

### 03 教室・前かがみ

```
blue archive style, 1girl, solo, twintails, halo, school uniform, bending forward,
skirt flipped up, white panties, panchira, surprised expression, blush, classroom, sunlight through windows
```

![03-1](photo:ec255652b27f85b5)

![03-2](photo:5aee218c67108e63)

![03-3](photo:618cec9a7a13485e)

### 04 屋上・体操服

```
blue archive style, 1girl, solo, ponytail, halo, gym uniform, sitting on a bench,
shorts, bare thighs, sweat, blush, looking away, evening light, school rooftop
```

![04-1](photo:38f7f6b1692b3d58)

![04-2](photo:558c5ac7f283d6ab)

![04-3](photo:853a16673d63ba07)

### 05 ベッド・横たわる

```
blue archive style, 1girl, solo, medium hair, halo, school uniform, lying on a bed,
skirt riding up, white panties visible, legs crossed, soft smile, morning light, cozy room
```

![05-1](photo:6308e530a2a0075a)

![05-2](photo:9d74dc66279e6741)

![05-3](photo:30aecb8e2918708e)

### 06 屋外・風でスカートがめくれる

```
blue archive style, 1girl, solo, short hair, halo, school uniform, leaning against a wall,
skirt lifted by wind, panchira, white panties, blush, looking at viewer, outdoor, sunny day
```

![06-1](photo:e53337bdb9073f7e)

![06-2](photo:c69effef984bc5f8)

![06-3](photo:c989ebfb04965535)

### 07 保健室・ナース服

```
blue archive style, 1girl, solo, long hair, halo, nurse outfit, sitting on a desk,
skirt short, white panties visible, panchira, shy expression, warm indoor light, clinic room
```

![07-1](photo:77cf067ffe393e81)

![07-2](photo:b7fe7a2a18ca2fe8)

![07-3](photo:73b39b67250f3c3c)

### 08 プール・水着

```
blue archive style, 1girl, solo, twintails, halo, swimsuit, sitting by a pool,
wet skin, blush, looking at viewer, summer sunlight, sparkling water
```

![08-1](photo:fc9b95116d9a535d)

![08-2](photo:fa41b1e22ba8b7e3)

![08-3](photo:be2ede2fc13912fc)

### 09 夜の寝室

```
blue archive style, 1girl, solo, short hair, halo, school uniform, kneeling on a bed,
skirt flipped, white panties, panchira, embarrassed, blushing, night, dim lamp light, bedroom
```

![09-1](photo:c8c2528d37d2c9f2)

![09-2](photo:2654afbb5ff0ee21)

![09-3](photo:b6824c4ef0473a9c)

### 10 朝の教室・背伸び

```
blue archive style, 1girl, solo, long hair, halo, school uniform, stretching arms up,
skirt riding up, panchira, white panties, thighs, soft smile, morning sunlight, classroom
```

![10-1](photo:fd2ef62dd8387887)

![10-2](photo:be261f086f47f8b9)

![10-3](photo:5b2260a50a9fbf8a)

## 効いたプロンプト語

| 狙い | 語 |
|---|---|
| 画風 | `blue archive style` + `2D anime illustration, cel shaded anime art, detailed lineart` |
| ハロー | `halo` |
| パンチラ | `panchira, white panties, white panties visible, skirt flipped up` |
| チラ | `skirt riding up, skirt lifted by wind, skirt flipped` |
| 照れ | `blush, embarrassed expression, shy expression` |
| 太もも | `thighs, bare thighs` |

`panchira` 単体より `white panties visible` を併記した方が確実に出る。スカートの状態（`skirt riding up` / `skirt flipped up` / `lifted by wind`）を具体的に書くとポーズが安定する。

## LoRA強度の比較

| 強度 | 結果 |
|---|---|
| 0.6 | 色調が弱い。通常のMOSS出力に寄る |
| **0.9** | **Blue Archive の淡い色調と制服が出る。採用** |
| 1.2 | 線が硬くなる。顔のバリエーションが減る |

## まとめ

| 項目 | 結果 |
|---|---|
| 30枚の合計 | 1343.6秒（22分24秒） |
| 平均 | 44.8秒/枚 |
| 同一プロンプト2枚目以降 | 19.0秒 |
| 推奨LoRA強度 | 0.9 |
| 品質 | 制服・ハロー・淡い色調が安定。パンチラも指示どおり |

MOSS-Image に Civitai のLoRAを重ねる場合、**ベースモデルが `MOSS Image` であることを必ず確認する**。Illustrious や Pony ベースのLoRAは読み込めても効果が出ない。

生成時間は同一プロンプトで seed を振ると19秒まで落ちる。1プロンプトで複数seedを試すのが効率的。
