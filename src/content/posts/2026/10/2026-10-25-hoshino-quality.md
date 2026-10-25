---
title: MOSS-Imageで品質優先設定を試す　ホシノを25step・cfg3.0で生成
date: 2026-10-25
category: still-life
tags:
  - local-llm
  - image-generation
  - moss-image
  - lora
  - rtx2080
description: RTX 2080 SUPER 8GBでMOSS-Imageの品質優先設定を検証。蒸留LoRAを外して25step・cfg3.0で回したら266秒。Q8は8GBでOOMした記録。
cover: bcd29cf2368561da
gallery: false
images:
  - id: bcd29cf2368561da
    photoId: "bcd29cf2368561da"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#ceb8c7"
    alt: ベッドで恥じらいながら顔を隠すホシノ、MOSS-Image生成
  - id: 7f27f6b9e838002d
    photoId: "7f27f6b9e838002d"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d2bfcc"
    alt: ベッドで脚を開き顔を隠すホシノ、1枚目
  - id: 4f3fb80105d88478
    photoId: "4f3fb80105d88478"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d6c1ce"
    alt: ベッドで脚を開き顔を隠すホシノ、2枚目
  - id: d0eb09b4d3c99347
    photoId: "d0eb09b4d3c99347"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#c7bbc8"
    alt: ベッドで脚を開き顔を隠すホシノ、3枚目
  - id: c2d2a611a95c19da
    photoId: "c2d2a611a95c19da"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#c8b3b7"
    alt: 朝の光の中、見上げるホシノ
---

速度優先だと 19秒で1枚出る。品質を優先したらどこまで上がるのか、ホシノで試した。

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

## 速度優先と品質優先の差

| 項目 | 速度優先 | 品質優先 |
|---|---|---|
| diffusion | Q4_K_M | Q4_K_M（Q8は断念） |
| 蒸留LoRA | 3step 1.0 | **なし** |
| スタイルLoRA | 0.9 | 0.9 |
| step | 3 | **25** |
| cfg | 1.0 | **3.0** |
| 1枚 | 19秒 | **266.1秒** |

**14倍の差。** 蒸留LoRAを外すと step を増やす必要があり、cfg も上げられるようになる（蒸留時は1.0固定でネガティブが効かない）。

## Q8は使えなかった

diffusion を Q8_0（5.5GB）に上げようとしたが、1024²×25step で OOM した。

```
Allocation on device 0 would exceed allowed memory
```

VRAMを空けても同じ。**8GBでは Q8 + 25step + 1024px の組み合わせは無理。** 活性化メモリが足りない。

逃げ道は3つ:

| 案 | 見込み |
|---|---|
| Q8 + 768px | 活性化が半分。解像度を落とす |
| Q8 + step 15 | 品質と引き換え |
| **Q4 + 25step** | 今回これ。モデルは軽いがstepで稼ぐ |

## プロンプト

ホシノは**オッドアイ**（右が黄・左が青）とピンクの超ロング、アホ毛、黒い胸ハーネスが特徴。名前だけだと設定が混ざるので外見を全部書く。

```
2D anime illustration, cel shaded anime art, detailed lineart, blue archive style,
hoshino (blue archive), 1girl, solo, very long pink hair, large looped ahoge,
heterochromia, yellow right eye, blue left eye, pale pink concentric-ring halo,
white long-sleeved shirt, aqua necktie, black chest harness, dark plaid pleated skirt,
lying on a bed with legs spread, shirt completely open, bare breasts, large breasts,
nipples, skirt pulled up, white panties pulled aside, pussy, explicit, detailed pussy,
deeply embarrassed, teary eyes, heavy blush, covering her face with one arm,
looking away shyly, trembling, morning light through curtains, messy bed sheets,
highly detailed, sharp focus
```

ネガティブ:

```
worst quality, low quality, bad anatomy, bad hands, deformed hands, extra limbs,
missing limbs, fused fingers, watermark, signature, jpeg artifact, blurry,
bad proportions, misspelled text
```

**cfg 3.0 にしたことでネガティブが実際に効くようになった。** 速度優先の cfg 1.0 では `worst quality` も `deformed hands` も事実上無視されていた。

## 結果

![ホシノ](photo:bcd29cf2368561da)

**恥じらいの表現は具体的な動作で書くと出る。**

| 狙い | 効いた語 |
|---|---|
| 顔を隠す | `covering her face with one arm` |
| 目を逸らす | `looking away shyly` |
| 涙目 | `teary eyes` |
| 赤面 | `heavy blush` |
| 震え | `trembling` |

`embarrassed` だけだと表情が弱い。動作と生理反応（涙・赤面・震え）を重ねると出る。

## 速度優先とどっちを使うか

| 用途 | 設定 |
|---|---|
| 構図やポーズを探す | 速度優先（19秒） |
| 1枚を仕上げる | 品質優先（266秒） |
| 10枚から選ぶ | 速度優先で10枚 → 当たりを品質優先で再生成 |

**探す段階で266秒は払えない。** 速度優先で seed を振って当たりを探し、そのプロンプトと seed だけ品質設定で回すのが現実的。

## まとめ

| 設定 | 1枚 | 品質 |
|---|---|---|
| 3step + 蒸留 + cfg1.0 | 19秒 | 実用十分 |
| 25step 蒸留なし + cfg3.0 | 266秒 | 陰影・質感・小物の密度が上がる |

Q8 は 8GB では 1024px で回せない。量子化を上げるより、step と cfg を上げた方が効く。

## ホシノ 30枚

10パターン × 3seed。生成のたびにここへ追加していく。

![ベッド・顔を隠す 1](photo:7f27f6b9e838002d)

![ベッド・顔を隠す 2](photo:4f3fb80105d88478)

![ベッド・顔を隠す 3](photo:d0eb09b4d3c99347)

![朝の光・見上げる 1](photo:c2d2a611a95c19da)
