/** public/ に置かれた画像の一覧 */
export interface AssetManifest {
  /** キャラID → 衣装ID → 画像のURL */
  characters: Record<string, Record<string, string>>;
  /** 背景ID → 画像のURL */
  backgrounds: Record<string, string>;
  /** キャラID → パーツ立ち絵。1枚絵ではなく重ねて作るキャラだけが持つ */
  parts?: Record<string, CharacterParts>;
}

/**
 * 重ねて作る立ち絵。
 *
 * 元になったスクショはどれも同じ大きさ・同じ位置で描かれているので、
 * 全パーツを共通のキャンバス（canvas）に切り出してある。
 * だから合成側は拡大縮小をせず、キャンバス内の座標に置くだけでよい。
 */
export interface CharacterParts {
  /** 全パーツ共通の下地の大きさ */
  canvas: { w: number; h: number };
  /** 体（衣装＋ポーズが一体になっている）。キーは衣装ID */
  body: Record<string, PartImage>;
  /** 頭（髪＋顔）。キーは髪型ID */
  head: Record<string, PartImage>;
}

export interface PartImage {
  src: string;
  /** 画像そのものの大きさ（透明な余白は切り詰めてある） */
  w: number;
  h: number;
  /** 共通キャンバスの中で、この画像の左上を置く位置 */
  x: number;
  y: number;
  /** 首の位置（共通キャンバス基準）。頭と体はここを合わせて重ねる */
  neckX: number;
  neckY: number;
  /** 顔の基準点（共通キャンバス基準）。頭パーツだけが持つ */
  face?: PartFace;
  /** この絵がとっているポーズ。体パーツだけが持つ */
  pose?: string;
}

/** 照れ線や♪の記号を顔に合わせて置くための目印。すべて共通キャンバスの座標 */
export interface PartFace {
  eyeY: number;
  headX: number;
  cheekDX: number;
  cheekY: number;
  markDX: number;
  markY: number;
}
