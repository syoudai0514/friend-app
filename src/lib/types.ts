export type Rarity = "NR" | "SR" | "SSR";

/** アバターSVGの切り抜き範囲。サムネイルとフル表示で使い分ける */
export type Crop = "full" | "preview" | "face" | "head" | "hair" | "bust";

export interface PartOption {
  id: string;
  name: string;
  rarity: Rarity;
}

export interface ColorOption {
  id: string;
  name: string;
  /** 主色 */
  value: string;
  /** ハイライト用の明るい色 */
  light: string;
  /** 影用の暗い色 */
  dark: string;
}

/** キャラの見た目。すべてカタログ内のIDを指す */
export interface Look {
  hair: string;
  hairColor: string;
  eyes: string;
  eyeColor: string;
  brows: string;
  mouth: string;
  nose: string;
  makeup: string;
  outfit: string;
  headAcc: string;
  glasses: string;
  earrings: string;
  skin: string;
  figure: string;
  scene: string;
}

/** キャラの中身（人格）。会話プロンプトの素になる */
export interface Persona {
  id: string;
  /** キャラ名 */
  name: string;
  /** 一人称 */
  firstPerson: string;
  /** ユーザーの呼び方につける敬称。空文字なら呼び捨て */
  honorific: string;
  /** 口調の指示 */
  speech: string;
  /** 性格の指示 */
  personality: string;
  /** ホーム画面の待機セリフ。{user} がユーザー名に置換される */
  idleLines: string[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  at: number;
}

export interface AppState {
  /** 初回の名前入力が済んでいるか */
  onboarded: boolean;
  /** キャラからの呼ばれ方 */
  userName: string;
  persona: Persona;
  look: Look;
  /** 好感度。会話するたびに増える */
  affection: number;
  messages: ChatMessage[];
  /** 会話から覚えた要点（好きなもの・約束など）。短い文の一覧 */
  memories: string[];
}

/** 好感度レベル。会話のトーンが段階的に変わる */
export interface AffectionLevel {
  level: number;
  label: string;
  /** このレベルに到達するのに必要な好感度 */
  threshold: number;
  /** プロンプトに差し込む距離感の指示 */
  attitude: string;
}
