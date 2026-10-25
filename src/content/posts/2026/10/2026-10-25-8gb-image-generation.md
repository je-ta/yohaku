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
images:
  - id: 2a4e058b0b895573
    photoId: "2a4e058b0b895573"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#596163"
    alt: 雨上がりの夜の商店街を自転車で走る人を描いたZ-Imageの生成画像
    caption: "Z-Image Turbo / 1024px / 8steps / 20秒"
  - id: 800ca660048bcb8a
    photoId: "800ca660048bcb8a"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#4b414a"
    alt: 雨上がりの夜の商店街を自転車で走る人を描いたMOSS-Imageの生成画像
    caption: "MOSS-Image / 1024px / 4steps / 96秒"
  - id: f1fa2b7fbc28916e
    photoId: "f1fa2b7fbc28916e"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#7a736c"
    alt: 夕暮れの港でこちらを見る老漁師の肖像、Z-Image生成
    caption: "Z-Image Turbo / ポートレート"
  - id: 8eb32d02eac06c7f
    photoId: "8eb32d02eac06c7f"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#74685e"
    alt: 夕暮れの港でこちらを見る老漁師の肖像、MOSS-Image生成
    caption: "MOSS-Image / ポートレート"
  - id: 5467ba898495701d
    photoId: "5467ba898495701d"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#85868f"
    alt: 雨のネオン街に立つ銀髪の少女のアニメ調イラスト、Z-Image生成
    caption: "Z-Image Turbo / アニメ調"
  - id: 1d0de1e3e387e860
    photoId: "1d0de1e3e387e860"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#897896"
    alt: 雨のネオン街に立つ白髪の少女のアニメ調イラスト、MOSS-Image生成
    caption: "MOSS-Image / アニメ調"
  - id: 96c1486e578c6f40
    photoId: "96c1486e578c6f40"
    v: 1
    w: 1008
    h: 1008
    widths:
      - 320
      - 640
      - 860
    color: "#71a2af"
    alt: 青空の下の一本道を制服姿の少女が歩く、日本語タイトル文字入りのイラスト
    caption: "MOSS-Image のレイアウト指定。箱で構図と文字を指定できる"
  - id: 57bca85c0f1729cf
    photoId: "57bca85c0f1729cf"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#81828b"
    alt: 雪の山道に停まる赤いクラシックカーのZ-Image生成画像
    caption: "Z-Image Turbo / 赤い車"
  - id: d495ba6bfd71ca79
    photoId: "d495ba6bfd71ca79"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#776267"
    alt: 雪の山道に停まる赤いクラシックカーのMOSS-Image生成画像
    caption: "MOSS-Image / 赤い車"
  - id: 20d0f8cada2eda19
    photoId: "20d0f8cada2eda19"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#3c4335"
    alt: 陽光が差し込む竹林の小道、Z-Image生成
    caption: "Z-Image Turbo / 1024px / 4steps / 20秒"
  - id: 351e2a3470481bc5
    photoId: "351e2a3470481bc5"
    v: 1
    w: 768
    h: 768
    widths:
      - 320
      - 640
    color: "#484625"
    alt: 陽光が差し込む竹林の小道、MOSS-Image生成
    caption: "MOSS-Image / 768px / 87秒"
  - id: 3c1b5318f7c72290
    photoId: "3c1b5318f7c72290"
    v: 1
    w: 1280
    h: 1280
    widths:
      - 320
      - 640
      - 860
      - 1280
    color: "#404432"
    alt: 1280pxで生成した竹林の小道、Z-Image生成
    caption: "Z-Image Turbo / 1280px / 40秒"
  - id: 3c1834e382432956
    photoId: "3c1834e382432956"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#3a4131"
    alt: 6stepsで生成した竹林の小道、Z-Image生成
    caption: "Z-Image Turbo / 1024px / 6steps / 18秒"
  - id: bb2dc056398a479d
    photoId: "bb2dc056398a479d"
    v: 1
    w: 1024
    h: 1024
    widths:
      - 320
      - 640
      - 860
    color: "#734b3f"
    alt: 夕暮れの岩場の灯台と波、MOSS-Image生成
    caption: "MOSS-Image / 1024px / 96秒"
---

家のGPUで画像生成、どこまで実用的に回せるのか。8GBという少ないVRAMで1年近く試してきた結果を、数字と絵で並べておく。

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

雨上がりの夜の商店街。Z-Image と MOSS で同じプロンプトを回した。

| | 生成時間 | 所感 |
|---|---|---|
| Z-Image | 20秒 | 写実寄り。光の反射が自然 |
| MOSS | 96秒 | 看板の文字がはっきり出る |

老漁師のポートレート。

| | 生成時間 | 所感 |
|---|---|---|
| Z-Image | 28秒 | 肌の質感が細かい |
| MOSS | 96秒 | 帽子や服の小物まで描く |

アニメ調は **MOSS が明確に上**。線がきれいで、顔のバランスも安定している。

| | 生成時間 | 所感 |
|---|---|---|
| Z-Image | 28秒 | 塗りが平坦になりやすい |
| MOSS | 96秒 | 線・陰影・髪の描き込みが細かい |

雪道の赤い車。

| | 生成時間 | 所感 |
|---|---|---|
| Z-Image | 28秒 | 光沢と雪の質感が自然 |
| MOSS | 96秒 | 色彩がやや強め |

竹林の小道。Z-Image は 1024px で 20秒、MOSS は 768px で 87秒。

| | 解像度 | 生成時間 |
|---|---|---|
| Z-Image | 1024px | 20秒 |
| MOSS | 768px | 87秒 |

## 解像度とステップ

| 条件 | Z-Image | MOSS |
|---|---|---|
| 1024px / 4steps | 18秒 | 96秒 |
| 1024px / 8steps | 20〜28秒 | 198秒 |
| 1280px / 8steps | 40秒 | 未測定 |
| 768px / 4steps | 13秒 | 87秒 |

Z-Image は 4steps でも十分読める絵が出る。8steps にすると細部が詰まる。

1280px に上げても40秒。実用範囲。

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

上の画像は「上部中央に大きな日本語タイトル、中央に少女、奥に道」という箱を指定して出したもの。文字も正確に出る。

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
| 構図や文字を指定したい | MOSS-Image（レイアウト指定） |
| 大量に回したい | Z-Image Turbo |
| 日本語の文字を入れたい | MOSS-Image |

## まとめ

8GBのGPUでも、2026年10月時点のモデルなら **20秒で1024pxの絵が出る**。MOSS の4step蒸留（96秒）も、用途を選べば十分実用的。

Turing世代（sm75）はbf16のネイティブ演算がなく、エミュレーションで動く。fp16テンソルコアの8分の1しか出ない。それでも量子化と蒸留を組み合わせれば、記事に載せる品質には届く。

一番効くのは、モデル選びより先に **VRAMを空けること**。音声入力やローカルLLMのサーバーが常駐していると、それだけで毎回モデルをロードし直して3倍遅くなる。
