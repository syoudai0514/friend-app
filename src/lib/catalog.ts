import type { AffectionLevel, ColorOption, Look, PartOption } from "./types";

/* -------------------------------------------------------------------------- */
/*  パーツカタログ                                                             */
/*  参考アプリの「服 / 髪型 / アクセサリー / パーツ / 背景」タブ構成に合わせる  */
/* -------------------------------------------------------------------------- */

export const HAIR: PartOption[] = [
  { id: "ponytail", name: "ポニーテール", rarity: "SSR" },
  { id: "long", name: "ロングストレート", rarity: "SSR" },
  { id: "bob", name: "ボブ", rarity: "SR" },
  { id: "twin", name: "ツインテール", rarity: "SSR" },
  { id: "bun", name: "お団子", rarity: "SR" },
  { id: "short", name: "ショート", rarity: "NR" },
  { id: "sidetail", name: "サイドテール", rarity: "SR" },
  { id: "wavy", name: "ゆるふわウェーブ", rarity: "SSR" },
];

export const HAIR_COLORS: ColorOption[] = [
  { id: "blonde", name: "きんいろ", value: "#f5c33b", light: "#ffe694", dark: "#c98f1b" },
  { id: "brown", name: "ブラウン", value: "#8a5a3b", light: "#c08d64", dark: "#5c3823" },
  { id: "black", name: "くろ", value: "#2f2b38", light: "#5b5468", dark: "#191721" },
  { id: "silver", name: "シルバー", value: "#c8ccd8", light: "#eef0f6", dark: "#989db0" },
  { id: "pink", name: "さくら", value: "#f0a0bc", light: "#ffd0de", dark: "#c9738f" },
  { id: "ash", name: "アッシュ", value: "#9c9382", light: "#cfc7b7", dark: "#6f685a" },
  { id: "orange", name: "オレンジ", value: "#f08b45", light: "#ffc08a", dark: "#c06325" },
  { id: "purple", name: "パープル", value: "#a58ad6", light: "#d3c2f0", dark: "#7a61a8" },
];

export const EYES: PartOption[] = [
  { id: "round", name: "ぱっちり", rarity: "SSR" },
  { id: "droopy", name: "たれ目", rarity: "SR" },
  { id: "sharp", name: "つり目", rarity: "SR" },
  { id: "half", name: "じと目", rarity: "NR" },
  { id: "closed", name: "にっこり", rarity: "SR" },
  { id: "sleepy", name: "ねむたげ", rarity: "NR" },
];

export const EYE_COLORS: ColorOption[] = [
  { id: "sky", name: "スカイブルー", value: "#4aa8e0", light: "#a6dcf7", dark: "#2b6f9c" },
  { id: "aqua", name: "アクアミント", value: "#41bfae", light: "#9fe8dd", dark: "#268073" },
  { id: "amber", name: "こはく", value: "#d9913a", light: "#f5cd8e", dark: "#9c6120" },
  { id: "ruby", name: "ルビー", value: "#d95571", light: "#f4a3b4", dark: "#9c3049" },
  { id: "emerald", name: "エメラルド", value: "#48a862", light: "#a3dcb1", dark: "#2a6f3d" },
  { id: "violet", name: "すみれ", value: "#8e6ad0", light: "#c7b1ef", dark: "#61439a" },
  { id: "gold", name: "こんじき", value: "#e0b13a", light: "#f7de95", dark: "#a17716" },
  { id: "night", name: "よぞら", value: "#4a4f7a", light: "#9aa0c9", dark: "#2b2e4d" },
];

export const BROWS: PartOption[] = [
  { id: "soft", name: "やわらか", rarity: "NR" },
  { id: "arch", name: "アーチ", rarity: "NR" },
  { id: "sharp", name: "きりっと", rarity: "NR" },
  { id: "droopy", name: "たれまゆ", rarity: "NR" },
  { id: "thick", name: "ふとまゆ", rarity: "NR" },
];

export const MOUTH: PartOption[] = [
  { id: "smile", name: "ほほえみ", rarity: "NR" },
  { id: "open", name: "にっこり", rarity: "NR" },
  { id: "cat", name: "ねこ口", rarity: "SR" },
  { id: "pout", name: "とがらせ", rarity: "NR" },
  { id: "calm", name: "まじめ", rarity: "NR" },
  { id: "surprised", name: "ぽかん", rarity: "NR" },
];

export const NOSE: PartOption[] = [
  { id: "dot", name: "ちょこん", rarity: "NR" },
  { id: "line", name: "すっと", rarity: "NR" },
  { id: "none", name: "なし", rarity: "NR" },
];

export const MAKEUP: PartOption[] = [
  { id: "none", name: "すっぴん", rarity: "NR" },
  { id: "light", name: "ほんのり", rarity: "SR" },
  { id: "cheek", name: "チーク", rarity: "SR" },
  { id: "glossy", name: "つやめき", rarity: "SR" },
  { id: "hot", name: "まっか", rarity: "SR" },
];

export const OUTFIT: PartOption[] = [
  { id: "swimsuit", name: "ビキニ＆パレオ", rarity: "SSR" },
  { id: "street", name: "ストリート", rarity: "SSR" },
  { id: "sailor", name: "セーラー服", rarity: "SSR" },
  { id: "blazer", name: "ブレザー", rarity: "SR" },
  { id: "hoodie", name: "パーカー", rarity: "NR" },
  { id: "onepiece", name: "ワンピース", rarity: "SR" },
  { id: "suit", name: "スーツ", rarity: "SR" },
  { id: "roomwear", name: "ルームウェア", rarity: "SSR" },
  { id: "knit", name: "ニット", rarity: "NR" },
  { id: "yukata", name: "浴衣", rarity: "SSR" },
  { id: "camisole", name: "キャミソール", rarity: "NR" },
];

export const HEAD_ACC: PartOption[] = [
  { id: "none", name: "なし", rarity: "NR" },
  { id: "catphones", name: "ネコ耳ヘッドホン", rarity: "SR" },
  { id: "ribbon", name: "リボン", rarity: "SR" },
  { id: "hairband", name: "カチューシャ", rarity: "NR" },
  { id: "flower", name: "花かざり", rarity: "SR" },
  { id: "animalears", name: "けもみみ", rarity: "SSR" },
];

export const GLASSES: PartOption[] = [
  { id: "none", name: "なし", rarity: "NR" },
  { id: "round", name: "丸メガネ", rarity: "SR" },
  { id: "square", name: "伊達メガネ", rarity: "NR" },
  { id: "heart", name: "ハートサングラス", rarity: "SR" },
];

export const EARRINGS: PartOption[] = [
  { id: "none", name: "なし", rarity: "NR" },
  { id: "pearl", name: "パール", rarity: "SR" },
  { id: "hoop", name: "フープ", rarity: "NR" },
  { id: "heart", name: "ハート", rarity: "SR" },
];

export const FIGURE: PartOption[] = [
  { id: "slim", name: "すらり", rarity: "NR" },
  { id: "normal", name: "ふつう", rarity: "NR" },
  { id: "rich", name: "ゆたか", rarity: "SR" },
];

export const SKIN: ColorOption[] = [
  { id: "fair", name: "いろじろ", value: "#fce6da", light: "#fff4ee", dark: "#e9c3b1" },
  { id: "normal", name: "ふつう", value: "#f8d9c5", light: "#fdeee4", dark: "#dfb198" },
  { id: "tan", name: "こむぎ", value: "#e0b18c", light: "#f0d2b7", dark: "#bd8760" },
];

export const SCENE: PartOption[] = [
  { id: "room", name: "自分の部屋", rarity: "NR" },
  { id: "poolside", name: "プールサイド", rarity: "SSR" },
  { id: "arcade", name: "ゲームセンター", rarity: "SR" },
  { id: "office", name: "オフィス", rarity: "NR" },
  { id: "izakaya", name: "居酒屋", rarity: "SR" },
  { id: "classroom", name: "夕暮れの教室", rarity: "SR" },
  { id: "sakura", name: "桜並木", rarity: "SSR" },
  { id: "night", name: "夜景の部屋", rarity: "SSR" },
  { id: "cafe", name: "カフェ", rarity: "NR" },
  { id: "washitsu", name: "和室", rarity: "NR" },
];

/* -------------------------------------------------------------------------- */
/*  タブ構成                                                                   */
/* -------------------------------------------------------------------------- */

export type LookKey = keyof Look;

export interface SubTab {
  key: LookKey;
  label: string;
  options: PartOption[] | ColorOption[];
  /** カラーパレット形式で出すか */
  isColor?: boolean;
  /** サムネイルの切り抜き */
  crop: "face" | "head" | "hair" | "bust" | "full" | "scene";
}

export interface Tab {
  id: string;
  label: string;
  subTabs: SubTab[];
}

export const CLOSET_TABS: Tab[] = [
  {
    id: "outfit",
    label: "服",
    subTabs: [
      { key: "outfit", label: "服", options: OUTFIT, crop: "bust" },
      { key: "figure", label: "体型", options: FIGURE, crop: "bust" },
    ],
  },
  {
    id: "hair",
    label: "髪型",
    subTabs: [
      { key: "hair", label: "髪型", options: HAIR, crop: "hair" },
      { key: "hairColor", label: "髪色", options: HAIR_COLORS, isColor: true, crop: "hair" },
    ],
  },
  {
    id: "accessory",
    label: "アクセサリー",
    subTabs: [
      { key: "headAcc", label: "あたま", options: HEAD_ACC, crop: "head" },
      { key: "glasses", label: "めがね", options: GLASSES, crop: "face" },
      { key: "earrings", label: "ピアス", options: EARRINGS, crop: "face" },
    ],
  },
  {
    id: "parts",
    label: "パーツ",
    subTabs: [
      { key: "makeup", label: "メイク", options: MAKEUP, crop: "face" },
      { key: "eyes", label: "目", options: EYES, crop: "face" },
      { key: "eyeColor", label: "瞳の色", options: EYE_COLORS, isColor: true, crop: "face" },
      { key: "mouth", label: "口", options: MOUTH, crop: "face" },
      { key: "nose", label: "鼻", options: NOSE, crop: "face" },
      { key: "brows", label: "まゆげ", options: BROWS, crop: "face" },
      { key: "skin", label: "肌", options: SKIN, isColor: true, crop: "face" },
    ],
  },
  {
    id: "scene",
    label: "背景",
    subTabs: [{ key: "scene", label: "背景", options: SCENE, crop: "scene" }],
  },
];

/* -------------------------------------------------------------------------- */
/*  ルックアップ用ヘルパー                                                     */
/* -------------------------------------------------------------------------- */

const colorMap = (list: ColorOption[]) =>
  Object.fromEntries(list.map((c) => [c.id, c])) as Record<string, ColorOption>;

export const HAIR_COLOR_MAP = colorMap(HAIR_COLORS);
export const EYE_COLOR_MAP = colorMap(EYE_COLORS);
export const SKIN_MAP = colorMap(SKIN);

/** カタログに無いIDが入っていても落ちないようにフォールバックする */
export function color(map: Record<string, ColorOption>, id: string, fallback: string): ColorOption {
  return map[id] ?? map[fallback];
}

export const DEFAULT_LOOK: Look = {
  hair: "ponytail",
  hairColor: "blonde",
  eyes: "round",
  eyeColor: "sky",
  brows: "soft",
  mouth: "smile",
  nose: "dot",
  makeup: "cheek",
  outfit: "swimsuit",
  headAcc: "catphones",
  glasses: "none",
  earrings: "none",
  skin: "fair",
  figure: "rich",
  scene: "poolside",
};

/* -------------------------------------------------------------------------- */
/*  好感度                                                                     */
/* -------------------------------------------------------------------------- */

export const AFFECTION_LEVELS: AffectionLevel[] = [
  {
    level: 1,
    label: "はじめまして",
    threshold: 0,
    attitude:
      "まだ知り合ったばかり。少し敬語まじりで、遠慮がちだけど好意的に接する。相手のことを知りたがる。",
  },
  {
    level: 2,
    label: "気になる人",
    threshold: 10,
    attitude:
      "打ち解けてきた。タメ口が増え、冗談を言い合える。相手の生活や好みを覚えていて話題に出す。",
  },
  {
    level: 3,
    label: "仲良し",
    threshold: 30,
    attitude:
      "気を許している。甘えたり、からかったりする。相手の疲れに気づいて自分から労わる。",
  },
  {
    level: 4,
    label: "大切な人",
    threshold: 60,
    attitude:
      "はっきり好意を示す。会えない時間を寂しがり、次に話す約束をしたがる。ときどき照れる。",
  },
  {
    level: 5,
    label: "恋人",
    threshold: 100,
    attitude:
      "恋人として接する。素直に愛情を伝え、甘い言葉やスキンシップの描写も自然に混ぜる。相手を全面的に肯定して支える。",
  },
];

export function affectionLevel(affection: number): AffectionLevel {
  let current = AFFECTION_LEVELS[0];
  for (const lv of AFFECTION_LEVELS) {
    if (affection >= lv.threshold) current = lv;
  }
  return current;
}

/** 現在レベル内での進捗（0〜1）。ゲージ表示に使う */
export function affectionProgress(affection: number): number {
  const lv = affectionLevel(affection);
  const next = AFFECTION_LEVELS.find((l) => l.level === lv.level + 1);
  if (!next) return 1;
  return (affection - lv.threshold) / (next.threshold - lv.threshold);
}
