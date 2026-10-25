---
title: プロンプトのベクトルを使い回すと10枚が5分で出る
date: 2026-10-25
category: still-life
tags:
  - local-llm
  - image-generation
  - comfyui
  - benchmark
description: MOSS-Image で同じプロンプトのまま seed を振ると、2枚目以降が18秒になる。10枚生成の実測ログ。
cover: 4b96b5aa693a50d1
gallery: false
images:
  - id: 4b96b5aa693a50d1
    photoId: "4b96b5aa693a50d1"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d3bcab"
    alt: 朝の光が差す部屋でベッドに座る成人女性のヌード、アニメ調1枚目
  - id: e4783ac43a78df07
    photoId: "e4783ac43a78df07"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d0baa9"
    alt: 朝の光が差す部屋でベッドに座る成人女性のヌード、アニメ調2枚目
  - id: 7068087a006cfa92
    photoId: "7068087a006cfa92"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#cdb29c"
    alt: 朝の光が差す部屋でベッドに座る成人女性のヌード、アニメ調3枚目
  - id: 0ef6f24acb21bda3
    photoId: "0ef6f24acb21bda3"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d4beae"
    alt: 朝の光が差す部屋でベッドに座る成人女性のヌード、アニメ調4枚目
  - id: a853daedbb3e606d
    photoId: "a853daedbb3e606d"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#cfbbad"
    alt: 朝の光が差す部屋でベッドに座る成人女性のヌード、アニメ調5枚目
  - id: d9edb6aadfbad9c4
    photoId: "d9edb6aadfbad9c4"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d3bcaa"
    alt: 朝の光が差す部屋でベッドに座る成人女性のヌード、アニメ調6枚目
  - id: 2426431ffb9c268c
    photoId: "2426431ffb9c268c"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d2b9a7"
    alt: 朝の光が差す部屋でベッドに座る成人女性のヌード、アニメ調7枚目
  - id: 409f9b388f0196d9
    photoId: "409f9b388f0196d9"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d4b9a5"
    alt: 朝の光が差す部屋でベッドに座る成人女性のヌード、アニメ調8枚目
  - id: c85655267239f95d
    photoId: "c85655267239f95d"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d4beaf"
    alt: 朝の光が差す部屋でベッドに座る成人女性のヌード、アニメ調9枚目
  - id: 8a53a7dcb373644d
    photoId: "8a53a7dcb373644d"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#d4bdad"
    alt: 朝の光が差す部屋でベッドに座る成人女性のヌード、アニメ調10枚目
---

画像生成モデルに渡す前に、プロンプトは数値のベクトルに変換される。**このベクトルは使い回せる。** 同じプロンプトなら、2枚目以降は変換をスキップできる。

MOSS-Image で10枚生成したログ。

## 何をキャッシュしているのか

ComfyUI はノード単位で出力をキャッシュしている。

```
プロンプト文字列 → [CLIPTextEncode] → conditioning（テンソル）
                       ↑ ここが67秒
```

`CLIPTextEncode` ノードの出力である conditioning は、形状 `(1, トークン数, 4096)` のテンソル。プロンプトをエンコーダ（Qwen3.5-9B）に通した結果。

ComfyUI は各ノードの**入力値のハッシュ**を取って、前回と同じなら計算をスキップして前回の出力を返す。

| CLIPTextEncode の入力 | 値 |
|---|---|
| `clip` | ロード済みのエンコーダ |
| `text` | プロンプト文字列 |

**seed は KSampler の入力であって、CLIPTextEncode には入らない。** だから seed だけ変えると「入力が変わっていない」と判定されて、67秒の計算が丸ごと飛ばされる。

## 実測

1024×1024、同一プロンプトで seed だけ変えて10枚。

| # | 時間 | 累計 |
|---|---|---|
| 1 | 156.3秒 | 156.3秒 |
| 2 | 18.0秒 | 174.3秒 |
| 3 | 18.0秒 | 192.3秒 |
| 4 | 18.0秒 | 210.4秒 |
| 5 | 18.2秒 | 228.5秒 |
| 6 | 19.0秒 | 247.5秒 |
| 7 | 19.0秒 | 266.6秒 |
| 8 | 19.0秒 | 285.6秒 |
| 9 | 19.0秒 | 304.6秒 |
| 10 | 19.0秒 | 323.6秒 |

**10枚で 323.6秒（5分24秒）。平均 32.4秒。**

1枚目だけ156秒かかる。これはモデルのロード込みだから。2枚目以降は18〜19秒で安定している。

比較のため、毎回違うプロンプトで回すと1枚あたり86秒。10枚なら14分。**キャッシュが効くと2.6倍速い。**

## 生成した10枚

同じプロンプト、seed だけ違う。構図と光はほぼ同じで、顔と髪が変わる。

![1枚目](photo:4b96b5aa693a50d1)

![2枚目](photo:e4783ac43a78df07)

![3枚目](photo:7068087a006cfa92)

![4枚目](photo:0ef6f24acb21bda3)

![5枚目](photo:a853daedbb3e606d)

![6枚目](photo:d9edb6aadfbad9c4)

![7枚目](photo:2426431ffb9c268c)

![8枚目](photo:409f9b388f0196d9)

![9枚目](photo:c85655267239f95d)

![10枚目](photo:8a53a7dcb373644d)

## 設定

| 項目 | 値 |
|---|---|
| モデル | MOSS-Image SFT Q4_K_M |
| エンコーダ | Qwen3.5-9B W4A8（CPU） |
| LoRA | moss_image_sft_3step_v1.0 |
| attention | comfy kitchen attention（INT8） |
| 解像度 | 1024×1024 |
| step | 3 |
| cfg | 1.0 |
| sampler | er_sde / simple |

プロンプト:

```
2D anime illustration, cel shaded anime art, detailed lineart, anime shading,
mature adult woman in her late twenties, cute face, soft smile, completely nude,
topless, large breasts, visible nipples, detailed areolas, sitting on a bed in a
sunlit room, soft morning light, warm colors, upper body portrait
```

ネガティブに `nsfw` を入れないこと。入れると何も描かれなくなる。

## キャッシュが効かない条件

| 条件 | 結果 |
|---|---|
| 同じプロンプト + seed 違い | 効く（18秒） |
| プロンプト変更 | 効かない（86秒） |
| ネガティブ変更 | 効かない |
| LoRA 変更 | 効かない（clip の入力が変わる） |
| ComfyUI 再起動 | 消える（RAM上） |
| `--cache-none` で起動 | 常に無効 |

**1プロンプトで seed を10〜20振って選ぶ運用が一番効率的。** 最初の1枚だけ156秒で、以降は18秒。

新規プロンプトを次々試したいなら、MOSS は向かない。Z-Image Turbo なら新規プロンプトでも20秒で出る。
