/** アバターSVGの共通座標。全パーツがこの数値を基準に描かれる */

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

/** 顔の輪郭 */
export const FACE_PATH = `
  M 150,34
  C 116,34 100,58 100,96
  C 100,124 106,148 120,162
  C 128,171 139,177 150,177
  C 161,177 172,171 180,162
  C 194,148 200,124 200,96
  C 200,58 184,34 150,34 Z`;

/** 胴体。体型に応じて幅が変わる */
export function torsoPath({ bust, waist, hip }: FigureDims): string {
  return `
    M ${CX - 30},${BODY.shoulder - 2}
    C ${CX - 44},${BODY.shoulder + 4} ${CX - bust},${BODY.bust - 22} ${CX - bust},${BODY.bust}
    C ${CX - bust},${BODY.bust + 22} ${CX - waist},${BODY.waist - 16} ${CX - waist},${BODY.waist}
    C ${CX - waist},${BODY.waist + 18} ${CX - hip},${BODY.hip - 12} ${CX - hip},${BODY.hip}
    C ${CX - hip},${BODY.hip + 16} ${CX - hip + 6},${BODY.crotch - 2} ${CX - hip + 16},${BODY.crotch}
    L ${CX + hip - 16},${BODY.crotch}
    C ${CX + hip - 6},${BODY.crotch - 2} ${CX + hip},${BODY.hip + 16} ${CX + hip},${BODY.hip}
    C ${CX + hip},${BODY.hip - 12} ${CX + waist},${BODY.waist + 18} ${CX + waist},${BODY.waist}
    C ${CX + waist},${BODY.waist - 16} ${CX + bust},${BODY.bust + 22} ${CX + bust},${BODY.bust}
    C ${CX + bust},${BODY.bust - 22} ${CX + 44},${BODY.shoulder + 4} ${CX + 30},${BODY.shoulder - 2}
    Z`;
}

/** 腕。side は -1（左）/ +1（右）。胴のシルエットより外側を通す */
export function armPath(side: number): string {
  return `M ${CX + side * 50},${BODY.shoulder + 6}
          C ${CX + side * 62},${BODY.bust + 14} ${CX + side * 68},${BODY.waist + 18} ${CX + side * 67},${BODY.crotch + 2}`;
}

/** 半袖の袖丈 */
export function shortSleevePath(side: number): string {
  return `M ${CX + side * 50},${BODY.shoulder + 6}
          C ${CX + side * 57},${BODY.shoulder + 26} ${CX + side * 62},${BODY.bust + 4} ${CX + side * 63},${BODY.bust + 20}`;
}

export function thighPath(side: number): string {
  return `M ${CX + side * 22},${BODY.crotch - 4}
          C ${CX + side * 25},${BODY.crotch + 44} ${CX + side * 24},${BODY.knee - 30} ${CX + side * 23},${BODY.knee}`;
}

export function calfPath(side: number): string {
  return `M ${CX + side * 23},${BODY.knee - 2}
          C ${CX + side * 22},${BODY.knee + 40} ${CX + side * 21},${BODY.ankle - 26} ${CX + side * 21},${BODY.ankle}`;
}

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
};
