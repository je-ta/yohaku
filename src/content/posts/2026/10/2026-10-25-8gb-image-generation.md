---
title: 8GBのGPUで画像生成はどこまで行けるか
date: 2026-10-25
category: still-life
tags:
  - local-llm
  - image-generation
  - rtx2080
  - benchmark
description: RTX 2080 SUPER 8GBで、MOSS-Image と Z-Image Turbo を実測。4step蒸留で96秒、最新モデルで20秒。数字と絵で比べた記録。
cover: 2a4e058b0b895573
gallery: false
images:
  - id: 2a4e058b0b895573
    photoId: "2a4e058b0b895573"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#596163"
    alt: 雨上がりの夜の商店街を自転車で走る人を描いたZ-Imageの生成画像
  - id: 800ca660048bcb8a
    photoId: "800ca660048bcb8a"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#4b414a"
    alt: 雨上がりの夜の商店街を自転車で走る人を描いたMOSS-Imageの生成画像
  - id: f1fa2b7fbc28916e
    photoId: "f1fa2b7fbc28916e"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#7a736c"
    alt: 夕暮れの港でこちらを見る老漁師の肖像、Z-Image生成
  - id: 8eb32d02eac06c7f
    photoId: "8eb32d02eac06c7f"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#74685e"
    alt: 夕暮れの港でこちらを見る老漁師の肖像、MOSS-Image生成
  - id: 5467ba898495701d
    photoId: "5467ba898495701d"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#85868f"
    alt: 雨のネオン街に立つ銀髪の少女のアニメ調イラスト、Z-Image生成
  - id: 1d0de1e3e387e860
    photoId: "1d0de1e3e387e860"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#897896"
    alt: 雨のネオン街に立つ白髪の少女のアニメ調イラスト、MOSS-Image生成
  - id: 96c1486e578c6f40
    photoId: "96c1486e578c6f40"
    v: 1
    w: 1008
    h: 1008
    widths: [320, 640, 860]
    color: "#71a2af"
    alt: 青空の下の一本道を制服姿の少女が歩く、日本語タイトル文字入りのイラスト
  - id: 57bca85c0f1729cf
    photoId: "57bca85c0f1729cf"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#81828b"
    alt: 雪の山道に停まる赤いクラシックカーのZ-Image生成画像
  - id: d495ba6bfd71ca79
    photoId: "d495ba6bfd71ca79"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#776267"
    alt: 雪の山道に停まる赤いクラシックカーのMOSS-Image生成画像
  - id: 20d0f8cada2eda19
    photoId: "20d0f8cada2eda19"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#3c4335"
    alt: 陽光が差し込む竹林の小道、Z-Image生成
  - id: 351e2a3470481bc5
    photoId: "351e2a3470481bc5"
    v: 1
    w: 768
    h: 768
    widths: [320, 640]
    color: "#484625"
    alt: 陽光が差し込む竹林の小道、MOSS-Image生成
  - id: 3c1b5318f7c72290
    photoId: "3c1b5318f7c72290"
    v: 1
    w: 1280
    h: 1280
    widths: [320, 640, 860, 1280]
    color: "#404432"
    alt: 1280pxで生成した竹林の小道、Z-Image生成
  - id: 3c1834e382432956
    photoId: "3c1834e382432956"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#3a4131"
    alt: 6stepsで生成した竹林の小道、Z-Image生成
  - id: bb2dc056398a479d
    photoId: "bb2dc056398a479d"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#734b3f"
    alt: 夕暮れの岩場の灯台と波、MOSS-Image生成
  - id: 8d3cc96ac2c42206
    photoId: "8d3cc96ac2c42206"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d1c6bc"
    alt: 朝の光の中に座る成人女性のヌード、アニメ調、MOSS-Image生成
  - id: dfe60d0c5965b4ca
    photoId: "dfe60d0c5965b4ca"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#dfcfc7"
    alt: 白いシーツの上に横たわる成人女性のヌード、アニメ調、MOSS-Image生成
  - id: d49c73132e031ba3
    photoId: "d49c73132e031ba3"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#59453a"
    alt: 薄暗い寝室に立つ成人女性のヌード、アニメ調、MOSS-Image生成
---

家のGPUで画像生成、どこまで実用的に回せるのか。8GBという少ないVRAMで試した結果を、数字と絵で並べておく。

## この環境

| パーツ | 内容 |
|---|---|
| GPU | NVIDIA RTX 2080 SUPER（8GB VRAM / sm75） |
| CPU | AMD Ryzen 9 3900XT（12コア24スレッド） |
| RAM | 32GB |
| OS | Ubuntu 24.04.5 LTS |
| 生成環境 | ComfyUI（2026-10-18版） |
| PyTorch | 2.14.1 + CUDA 13.0 |
| ドライバ | 595.99.02 |

2019年のGPU。VRAM 8GBは今の画像生成モデルにはかなり厳しい。

## 使ったモデル

| | MOSS-Image SFT | Z-Image Turbo |
|---|---|---|
| diffusion | Q4_K_M GGUF 3.5GB | Q4_K_M GGUF 4.7GB |
| テキストエンコーダ | Qwen3.5-9B（7.0GB / CPU） | Qwen3-4B（5.4GB / CPU） |
| VAE | flux2-vae_small | ae.safetensors |
| step数 | 4（蒸留LoRA） | 8 |
| 量子化合計 | 約20GB | 約10GB |

エンコーダは両方CPUに逃がしている。8GBに載せるとOOMするため。

### Z-Image Turbo とは

Alibaba（Tongyi-MAI）が2025年11月に公開した6Bの画像生成モデル。Apache-2.0で商用利用もできる。8stepで動く蒸留版で、cfgを切って（1.0）回すのが前提。公式は16GB VRAMの民生機を想定していて、8GBだと量子化が必須。

同じ系列に、50stepで動くベースモデル `Z-Image` と、編集特化の `Z-Image-Edit` がある。

| | Z-Image Turbo | Z-Image（ベース） |
|---|---|---|
| step | 8 | 50 |
| cfg | 不要（1.0） | 有効 |
| ネガティブプロンプト | 効かない | 効く |
| 得意 | 写実・速度 | 多様性・制御 |

### MOSS-Image とは

MOSS はアニメ・イラスト寄りのモデル。4step蒸留LoRAを重ねると実用速度になる。テキストエンコーダが9Bと重く、CPUエンコードだけで1枚70秒かかるのが速度差の主因。

| | MOSS-Image SFT | Z-Image Turbo |
|---|---|---|
| diffusion | Q4_K_M GGUF 3.5GB | Q4_K_M GGUF 4.7GB |
| テキストエンコーダ | Qwen3.5-9B（7.0GB） | Qwen3-4B（5.4GB） |
| VAE | flux2-vae_small | ae.safetensors |
| step数 | 4（蒸留LoRA） | 8 |
| エンコーダのCPU時間（概算） | 約70秒 | 約10秒 |
| 量子化合計 | 約20GB | 約10GB |

## 結果

1024×1024、同じプロンプトで測った値。

| モデル | 設定 | 1枚 |
|---|---|---|
| Z-Image Turbo | 8steps | **20〜28秒** |
| Z-Image Turbo | 4steps | 18秒 |
| Z-Image Turbo | 1280px | 40秒 |
| MOSS-Image | 4steps + 蒸留LoRA | 96秒 |
| MOSS-Image | 8steps + LoRA | 198秒 |
| MOSS-Image | 25steps LoRAなし | 326秒 |
| MOSS-Image | 4steps 768px | 87秒 |

**MOSS の4step蒸留は効く。** 25stepの326秒から96秒まで落ちる。3.4倍。

**Z-Image はそのさらに4倍速い。** エンコーダが9Bから4Bに減って、CPUエンコードが半分以下になるのが大きい。

## 同じプロンプトで比べる

雨上がりの夜の商店街。

![雨上がりの商店街、Z-Image生成](photo:2a4e058b0b895573)

![雨上がりの商店街、MOSS-Image生成](photo:800ca660048bcb8a)

| | 生成時間 | 所感 |
|---|---|---|
| Z-Image | 20秒 | 写実寄り。光の反射が自然 |
| MOSS | 96秒 | 看板の文字がはっきり出る |

老漁師のポートレート。

![老漁師の肖像、Z-Image生成](photo:f1fa2b7fbc28916e)

![老漁師の肖像、MOSS-Image生成](photo:8eb32d02eac06c7f)

| | 生成時間 | 所感 |
|---|---|---|
| Z-Image | 28秒 | 肌の質感が細かい |
| MOSS | 96秒 | 帽子や服の小物まで描く |

アニメ調は **MOSS が明確に上**。線がきれいで、顔のバランスも安定している。

![雨のネオン街の少女、Z-Image生成](photo:5467ba898495701d)

![雨のネオン街の少女、MOSS-Image生成](photo:1d0de1e3e387e860)

| | 生成時間 | 所感 |
|---|---|---|
| Z-Image | 28秒 | 塗りが平坦になりやすい |
| MOSS | 96秒 | 線・陰影・髪の描き込みが細かい |

雪道の赤い車。

![雪道の赤い車、Z-Image生成](photo:57bca85c0f1729cf)

![雪道の赤い車、MOSS-Image生成](photo:d495ba6bfd71ca79)

| | 生成時間 | 所感 |
|---|---|---|
| Z-Image | 28秒 | 光沢と雪の質感が自然 |
| MOSS | 96秒 | 色彩がやや強め |

竹林の小道。

![竹林の小道、Z-Image生成](photo:20d0f8cada2eda19)

![竹林の小道、MOSS-Image生成](photo:351e2a3470481bc5)

| | 解像度 | 生成時間 |
|---|---|---|
| Z-Image | 1024px | 20秒 |
| MOSS | 768px | 87秒 |

灯台と波。MOSS の非アニメ出力。

![灯台と波、MOSS-Image生成](photo:bb2dc056398a479d)

## 解像度とステップ

| 条件 | Z-Image | MOSS |
|---|---|---|
| 1024px / 4steps | 18秒 | 96秒 |
| 1024px / 8steps | 20〜28秒 | 198秒 |
| 1280px / 8steps | 40秒 | 未測定 |
| 768px / 4steps | 13秒 | 87秒 |

Z-Image は 4steps でも十分読める絵が出る。8steps にすると細部が詰まる。

![6stepsで生成した竹林](photo:3c1834e382432956)

1280px に上げても40秒。実用範囲。

![1280pxで生成した竹林](photo:3c1b5318f7c72290)

## アダルトも出る

MOSS はベースモデルの時点で NSFW を出せる。専用LoRAは要らない。

![朝の光の中のヌード](photo:8d3cc96ac2c42206)

![白いシーツの上のヌード](photo:dfe60d0c5965b4ca)

![薄暗い寝室のヌード](photo:d49c73132e031ba3)

| 用途 | 効くプロンプト語 |
|---|---|
| 胸 | `completely nude, topless, visible nipples, detailed areolas` |
| 性器 | `spread legs, detailed pussy, explicit` |
| 大人の明示 | `mature adult woman in her late twenties` |
| 画風 | `2D anime illustration, cel shaded anime art, detailed lineart` |

3枚とも4step蒸留で96〜98秒。NSFW LoRA を重ねても速度は変わらず、画風が変わるだけだった。

## MOSS のチューニングで分かったこと

| やったこと | 効果 |
|---|---|
| 4step蒸留LoRA | 326秒 → 96秒 |
| ネガティブから `nsfw` を外す | 露骨なプロンプトでも絵が出るようになる |
| エンコーダをCPU固定 | OOM回避。GPUに置くと落ちる |
| `--highvram` で起動 | モデルの再ロードが止まる |
| vocalinux（音声入力）を止める | VRAM 716MiB解放。止めないと毎回ロードし直し |
| アニメLoRA / NSFW LoRA 追加 | 速度は変わらない。画風だけ変わる |

**一番効いたのはネガティブの `nsfw` を外すこと。** ComfyUI 公式テンプレの推奨ネガティブに `nsfw` が入っていて、これをコピペすると露骨なプロンプトでも何も描かれない。LoRA を何枚重ねても効かない。

## レイアウト指定

MOSS は箱を描いて構図を指定できる。`ComfyUI-MOSS-Layout-YDR` というカスタムノードを使う。

![レイアウト指定で生成した、日本語タイトル入りのイラスト](photo:96c1486e578c6f40)

「上部中央に大きな日本語タイトル、中央に少女、奥に道」という箱を指定して出したもの。文字も正確に出る。

| 要素 | 指定内容 |
|---|---|
| text | 私の生きる道 |
| character | 道を歩くアニメの女の子 |
| object | 青空と白い雲 |
| object | 奥へ続くまっすぐな道 |

プロンプトはJSONで渡す。座標は画像中心を原点にした `[y1, x1, y2, x2]`。

## どっちを使うか

| 用途 | おすすめ |
|---|---|
| 写実・風景・物撮り | Z-Image Turbo（速い・きれい） |
| アニメ・イラスト | MOSS-Image（線がきれい） |
| アダルト | MOSS-Image（ベースで出る） |
| 構図や文字を指定したい | MOSS-Image（レイアウト指定） |
| 大量に回したい | Z-Image Turbo |

## まとめ

8GBのGPUでも、2026年10月時点のモデルなら **20秒で1024pxの絵が出る**。MOSS の4step蒸留（96秒）も、用途を選べば十分実用的。

Turing世代（sm75）はbf16のネイティブ演算がなく、エミュレーションで動く。fp16テンソルコアの8分の1しか出ない。それでも量子化と蒸留を組み合わせれば、記事に載せる品質には届く。
