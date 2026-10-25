---
title: MOSS-Image を 98秒から 18秒にした話
date: 2026-10-25
category: still-life
tags:
  - local-llm
  - image-generation
  - rtx2080
  - benchmark
description: RTX 2080 SUPER 8GB で MOSS-Image の生成時間を実測しながら削った記録。効いたのはキャッシュだった。
cover: faa076738339e64a
gallery: false
images:
  - id: faa076738339e64a
    photoId: "faa076738339e64a"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#734c41"
    alt: 夕暮れの岩場に建つ灯台と波、MOSS-Image生成
  - id: 9cddbab10627011a
    photoId: "9cddbab10627011a"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#7b6b91"
    alt: 雨のネオン街に立つ銀髪の少女、アニメ調、MOSS-Image生成
  - id: e27c86d20588537e
    photoId: "e27c86d20588537e"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#7f6e5a"
    alt: 夕暮れの港でこちらを見る老漁師、MOSS-Image生成
  - id: c27a8b71ffd2536b
    photoId: "c27a8b71ffd2536b"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#695755"
    alt: 雪の山道に停まる赤いクラシックカー、MOSS-Image生成
  - id: 59bc664028b6d99d
    photoId: "59bc664028b6d99d"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#795b51"
    alt: INT8 attention で生成した灯台、MOSS-Image
  - id: 9d6971805c53a30d
    photoId: "9d6971805c53a30d"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#6e4d46"
    alt: 3step LoRA で生成した灯台、MOSS-Image
  - id: 6620fefff4881e03
    photoId: "6620fefff4881e03"
    v: 1
    w: 1024
    h: 1024
    widths: [320, 640, 860]
    color: "#4c4c32"
    alt: ベース設定（4step LoRA）で生成した灯台、MOSS-Image
---

MOSS-Image が 1024px で 98秒かかっていた。8GBのGPUで、1枚1分半はさすがに重い。内訳を測って、効く順に削った記録。

## 出発点

まず内訳を取った。これが全ての判断の基準になった。

| 工程 | 時間 | 割合 |
|---|---|---|
| テキストエンコーダ（CPU） | 67秒 | 68% |
| サンプリング（UNet） | 26秒 | 27% |
| VAE・その他 | 5秒 | 5% |
| **合計** | **98秒** | |

エンコーダが7割。**サンプリングをゼロにしても70秒は残る。** だからまずエンコーダを見るべきだった。

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

エンコーダは Qwen3.5-9B（7.0GB）を CPU に逃がしている。8GBに載せると OOM するため。

## 試して効いたもの

### 1. INT8 attention

`comfy kitchen attention` を `ModelAttentionBackend` ノードで指定する。sm75 対応を明示的に確認した上で試した。

| | 1枚 |
|---|---|
| ベース | 98.1秒 |
| INT8 attention | 93.2秒 |

5%短縮。サンプリング部分だけが速くなる。

![INT8 attention](photo:59bc664028b6d99d)

### 2. 3step 蒸留LoRA

`moss_image_sft_3step_v1.0.safetensors` に差し替える。4step から1step減る。

| | 1枚 |
|---|---|
| ベース（4step） | 98.1秒 |
| 3step LoRA | 93.1秒 |

こちらも5%。品質は見た目で遜色なかった。

![3step LoRA](photo:9d6971805c53a30d)

### 3. 両方組み合わせる

| | 1枚 |
|---|---|
| ベース | 98.1秒 |
| INT8 + 3step | 89.1秒 |

9%短縮。**ここまでで 98→89秒。** 期待したより小さい。

![両方適用](photo:faa076738339e64a)

### 4. conditioning キャッシュ

ここが本命だった。**同じプロンプトで seed だけ変えて回すと、ComfyUI がエンコーダの出力を再利用する。**

| | 1枚 |
|---|---|
| 1枚目（エンコードあり） | 98.2秒 |
| 2枚目（キャッシュ命中） | 29.1秒 |
| 3枚目 | 30.0秒 |

**70%短縮。** エンコーダ67秒がまるごと消える。

さらに INT8 + 3step と組み合わせる。

| | 1枚 |
|---|---|
| ベース | 98.1秒 |
| INT8 + 3step | 89.1秒 |
| INT8 + 3step + キャッシュ | **18.2秒** |

**98秒 から 18.2秒。5.4倍。**

## 効かなかったもの

### GPU にエンコーダを載せる

7.0GB を 8GB の VRAM に載せると OOM する。部分的にオフロードしても、UNet と競合するので現実的じゃなかった。

### `--fp32-text-enc`

CPU の fp16 演算が極端に遅いことは実測で確かめた。

| dtype | CPU matmul 性能 |
|---|---|
| fp32 | 478 GFLOP/s |
| bf16 | 1.0 GFLOP/s |
| fp16 | 0.9 GFLOP/s |

**fp16 は fp32 の 1/500。** Zen2 に fp16 の行列演算命令がないため。これなら fp32 の方が速いはずだと考えたが、実際に `--fp32-text-enc` で回すと 101秒と**逆に遅くなった**。

理由は W4A8 量子化モデルが専用カーネルを通るから。汎用 matmul の話は当てはまらなかった。

### 小さいエンコーダへの差し替え

`CLIPLoader` の type が `moss_image` の場合、エンコーダは `Qwen3.5-9B` 固定で判定される（`comfy/sd.py`）。4B などに差し替えるとロードできない。

### GGUF 版エンコーダ

`CLIPLoaderGGUF`（ComfyUI-GGUF）は `qwen35` アーキテクチャに未対応。対応PRは出ているが未マージ。

### INT8 ConvRot モデル

`moss_image_sft_int8_convrot.safetensors` が手元にあったが、**ファイルが259MB欠損していて使えなかった**。未完ダウンロード。

## 新規プロンプトだとどうなるか

キャッシュは同じプロンプトでしか効かない。毎回違うプロンプトを試す使い方では効果がない。

| 条件 | 1枚 |
|---|---|
| 新規プロンプト + INT8 + 3step | 86〜87秒 |
| 同一プロンプト + INT8 + 3step | 18秒 |

新規だと 98→87秒。**11%しか改善しない。**

## 品質

3step に落としても、INT8 attention にしても、見た目で分かる劣化はなかった。

![アニメ調](photo:9cddbab10627011a)

![老漁師](photo:e27c86d20588537e)

![赤い車](photo:c27a8b71ffd2536b)

## まとめ

| 施策 | 効果 | 手間 |
|---|---|---|
| conditioning キャッシュ（同一プロンプト） | **−70%** | なし |
| INT8 attention | −5% | ノード1個追加 |
| 3step LoRA | −5% | ファイル差し替え |
| INT8 + 3step + キャッシュ | **−81%** | 上記すべて |
| fp32 text encoder | +3%（逆効果） | — |

**一番効くのは、エンコーダを回さないこと。** モデルや量子化をいじる前に、同じプロンプトで seed を振る運用にすると 5倍速くなる。

新規プロンプトを大量に試したいなら、MOSS 以外のモデル（Z-Image Turbo なら 20秒）に逃がすのが現実的。MOSS の強みはアニメ品質と日本語文字、レイアウト指定なので、それが必要な場面でだけ使う。
