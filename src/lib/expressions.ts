/**
 * 表情。ベースの見た目（目・口・まゆげ・メイク）を一時的に上書きする。
 *
 * 会話の返事にタグが付いてくるので、それをこの表に当てて顔を変える。
 * 立ち絵の画像を使っているキャラでは、
 * `<衣装ID>@<表情ID>.png` があればそちらに差し替わる。
 */

export type Expression =
  | "normal"
  | "happy"
  | "shy"
  | "sad"
  | "angry"
  | "surprised"
  | "sleepy";

export interface ExpressionParts {
  eyes?: string;
  mouth?: string;
  brows?: string;
  makeup?: string;
}

export const EXPRESSIONS: Record<Expression, ExpressionParts> = {
  /** ふだんの顔。ベースの見た目をそのまま使う */
  normal: {},
  /** うれしい・笑っている */
  happy: { eyes: "closed", mouth: "open", brows: "arch" },
  /** 照れ。目を伏せて頬を赤く */
  shy: { eyes: "half", mouth: "calm", brows: "droopy", makeup: "hot" },
  /** しょんぼり */
  sad: { eyes: "droopy", mouth: "calm", brows: "droopy" },
  /** むくれている */
  angry: { eyes: "sharp", mouth: "pout", brows: "sharp" },
  /** びっくり */
  surprised: { eyes: "round", mouth: "surprised", brows: "arch" },
  /** ねむそう */
  sleepy: { eyes: "sleepy", mouth: "calm", brows: "droopy" },
};

export const EXPRESSION_IDS = Object.keys(EXPRESSIONS) as Expression[];

export function isExpression(value: string): value is Expression {
  return (EXPRESSION_IDS as string[]).includes(value);
}

/**
 * 返事の先頭に付いてくる `[happy]` のようなタグを取り出して、本文と分ける。
 * タグが無い・知らない名前のときは normal 扱いにして、本文はそのまま返す。
 */
export function splitExpression(text: string): { expression: Expression; body: string } {
  const m = /^\s*[[［]\s*([a-zA-Z]+)\s*[\]］]\s*/.exec(text);
  if (!m) return { expression: "normal", body: text };

  const name = m[1].toLowerCase();
  const body = text.slice(m[0].length);
  return { expression: isExpression(name) ? name : "normal", body };
}

/**
 * 返事が届く途中でもタグだけ先に読めるようにする。
 * まだタグが出そろっていない（`[ha` のような）ときは表示を止めておく。
 */
export function isTagIncomplete(text: string): boolean {
  return /^\s*[[［][a-zA-Z]*$/.test(text);
}
