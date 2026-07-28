# こいびとアプリ

自分だけの恋人と話せる、スマホ向けのWebアプリ。
可愛いキャラを自分好みに着せ替えて、日々の疲れを労ってもらえます。

会話は **Google Gemini の無料枠** で動きます。

---

## できること

| 画面 | 内容 |
|---|---|
| ホーム | 背景シーン＋立ち絵＋待機セリフ。↻ でセリフが変わる |
| トーク | Geminiと会話。返事は1文字ずつ流れてくる |
| クローゼット | 服 / 髪型 / アクセサリー / パーツ / 背景 の着せ替え |
| キャラ | 性格の違う5人から選ぶ |
| せってい | 呼ばれたい名前、キャラの口調・性格・セリフの編集 |

- **好感度**：話しかけるたびに上がり、5段階で口調と距離感が変わります
- **保存先**：会話・見た目・好感度はすべてブラウザのlocalStorageのみ。サーバーには残りません

---

## はじめかた

### 1. APIキーを取る

[Google AI Studio](https://aistudio.google.com/apikey) を開いて「Create API key」。
Googleアカウントがあれば無料で、クレジットカードの登録もいりません。

### 2. キーを設定する

```bash
cp .env.local.example .env.local
```

`.env.local` を開いて `GEMINI_API_KEY=` の右にキーを貼ります。

### 3. 起動する

```bash
npm install
npm run dev
```

http://localhost:3000 を開いてください。

同じWi-Fiのスマホから開くときは `npm run dev -- -H 0.0.0.0` で起動して、
PCのIPアドレス（例 `http://192.168.1.5:3000`）を叩きます。
ホーム画面に追加すると、アプリっぽく全画面で使えます。

### 無料枠について

1日あたりのリクエスト数に上限があります（モデルごとに違い、随時変わります →
[最新の上限](https://ai.google.dev/gemini-api/docs/rate-limits)）。
上限に届くとキャラが「無料枠の上限に届いちゃったみたい」と言うので、
時間をおくか、`.env.local` の `GEMINI_MODEL` を `gemini-2.5-flash-lite` に変えてください。

無料枠を長持ちさせるために、会話に送る履歴は直近24件までに絞り、
思考トークン（thinking）は切ってあります。

---

## 自分で用意した立ち絵に差し替える

画像を置くだけで、コードを触らずに立ち絵と背景を差し替えられます。
**ビルドも再起動も不要。置いてリロードするだけです。**

```
public/characters/aimi/swimsuit.png   ← アイミーのビキニ姿
public/characters/aimi/default.png    ← 衣装別の画像が無いときの立ち絵
public/backgrounds/poolside.jpg       ← プールサイドの背景
```

- まずは `default.png` を1枚置くところから試せます
- 背景は透過PNG、縦長（例 800×1400）で足元が画像の下端に来るように切り抜くと座りが良いです
- 画像が無い衣装・背景は、これまでどおりSVG／CSSで描かれます（混在OK）
- クローゼットでは、立ち絵を用意した衣装に 📷 が付きます

使えるIDの一覧と、画像を作るときのコツは
[`public/characters/README.md`](public/characters/README.md) と
[`public/backgrounds/README.md`](public/backgrounds/README.md) にまとめてあります。

> 立ち絵の画像を使っているあいだ、その衣装では髪型・目・口などのパーツ変更は反映されません
> （絵に焼き付いているため）。クローゼットにもその旨が表示されます。

---

## キャラの見た目のしくみ（画像を置かないとき）

立ち絵は1枚絵ではなく、**SVGのレイヤーを重ねて** 描いています。

```
背景シーン
 └ 後ろ髪
    └ 脚 → 腕 → 首 → 胴
       └ 服（袖・スカートを含む）
          └ 顔（輪郭 → メイク → まゆげ → 目 → 鼻 → 口 → めがね）
             └ 前髪 → 頭のアクセサリー
```

そのため、目だけ・服だけ・髪色だけを差し替えても破綻しません。

| ファイル | 役割 |
|---|---|
| `src/components/avatar/geometry.ts` | 体の座標（肩・胸・腰・膝の位置、体型別の幅） |
| `src/components/avatar/face.tsx` | 目・まゆげ・鼻・口・メイク・めがね・ピアス |
| `src/components/avatar/hair.tsx` | 髪型（後ろ髪と前髪） |
| `src/components/avatar/outfits.tsx` | 服 |
| `src/components/avatar/accessories.tsx` | 頭のアクセサリー |
| `src/components/avatar/Scene.tsx` | 背景シーン |
| `src/lib/catalog.ts` | 選べるパーツの一覧とクローゼットのタブ構成 |
| `src/components/CharacterArt.tsx` | 画像とSVGのどちらを描くかの切り替え |
| `src/app/api/assets/route.ts` | `public/` に置かれた画像の検出 |

### パーツを増やすには

1. 描画ファイル（例 `outfits.tsx`）の `OUTFITS` に `id` を足してSVGを書く
2. `src/lib/catalog.ts` の対応する配列（例 `OUTFIT`）に `{ id, name, rarity }` を足す

これだけでクローゼットに並びます。

### キャラを増やすには

`src/lib/personas.ts` の `PRESETS` に1件足すだけです。
`persona`（名前・一人称・口調・性格・待機セリフ）と `look`（見た目）を書きます。

---

## 会話の中身を変える

キャラへの指示は `src/lib/prompt.ts` の `buildSystemInstruction()` で組み立てています。
返事の長さ、口調、労い方のルールはここにまとまっています。

一人ひとりの性格・口調・呼び方は、コードを触らなくても
アプリの「せってい」画面から書き換えられます。

---

## 技術構成

- Next.js 16（App Router）/ React 19 / TypeScript
- Tailwind CSS v4
- `@google/genai`（Gemini SDK）
- APIキーはサーバー側（`src/app/api/chat/route.ts`）だけで使い、ブラウザには渡していません
