/**
 * アバターSVGの共通座標。全パーツがこの数値を基準に描かれる。
 *
 * ポーズ（poses.ts）もこの座標を使うため、定数だけをここに切り出してある。
 * 実際に使うときは geometry.ts からまとめて import すればよい。
 */

export const VIEW = { w: 300, h: 640 };
export const CX = 150;

/** 顔まわり */
export const FACE = {
  top: 34,
  chin: 177,
  left: 100,
  right: 200,
  browY: 92,
  eyeY: 118,
  eyeDx: 23,
  noseY: 140,
  mouthY: 156,
  cheekY: 143,
  cheekDx: 33,
};

/**
 * 顔まわりのパーツは上の FACE 座標系（顔の幅100・高さ143）のまま描き、
 * 最後にこの変換で縮めて頭に載せる。こうすると顔の作り込みを崩さずに
 * 頭身バランスだけ調整できる。
 */
export const HEAD_SCALE = 0.78;
export const HEAD_TRANSFORM = `translate(${CX * (1 - HEAD_SCALE)},12) scale(${HEAD_SCALE})`;

/** 体の縦位置。頭を縮めたぶん、全体で約5.3頭身になる */
export const BODY = {
  neckTop: 138,
  shoulder: 168,
  bust: 226,
  waist: 288,
  hip: 342,
  crotch: 376,
  knee: 492,
  ankle: 600,
};

export type FigureDims = { bust: number; waist: number; hip: number };

export const FIGURE_DIMS: Record<string, FigureDims> = {
  slim: { bust: 43, waist: 32, hip: 45 },
  normal: { bust: 48, waist: 35, hip: 48 },
  rich: { bust: 55, waist: 36, hip: 52 },
};

export function figureDims(id: string): FigureDims {
  return FIGURE_DIMS[id] ?? FIGURE_DIMS.normal;
}

/** 顔の輪郭。こめかみが張って顎に向かって細くなる、アニメ寄りの形 */
export const FACE_PATH = `
  M 150,30
  C 122,30 103,50 101,84
  C 100,106 105,126 113,144
  C 121,162 136,177 150,178
  C 164,177 179,162 187,144
  C 195,126 200,106 199,84
  C 197,50 178,30 150,30 Z`;

/** 切り抜き範囲。サムネイルで使う（頭の変換後の座標） */
export const CROPS: Record<string, string> = {
  full: `0 0 ${VIEW.w} ${VIEW.h}`,
  /** クローゼットのプレビュー用。左右の余白を削って大きく見せる */
  preview: "48 0 204 624",
  face: "112 58 76 96",
  head: "88 6 124 172",
  /** 髪型用。ポニーテールやツインテールの毛先まで入れる */
  hair: "56 4 188 290",
  bust: "70 150 160 250",
  /** ポーズ用。全身の手足の広がりが見えるように全体を入れる */
  pose: `0 0 ${VIEW.w} ${VIEW.h}`,
};
