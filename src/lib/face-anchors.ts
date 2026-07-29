import { CROPS } from "@/components/avatar/geometry";

/**
 * 立ち絵のどこに顔があるかの目印。
 * 照れ線や記号を「顔の上」に正確に置くために使う。
 *
 * 写真の立ち絵は、透明部分を除いた輪郭から自動で割り出した値。
 * 頭がいちばん横に広がる行＝耳と目のあたり、という当たりの付け方をしている。
 * 顔の幅は髪型で変わるが、画像の高さに対する比はどの絵でも安定していたので、
 * 頬の位置は高さを基準に決めた。
 *
 * すべて画像の幅・高さに対する割合（0〜1）。
 */
export interface FaceAnchor {
  /** 目線の高さ */
  eyeY: number;
  /** 顔の中心 */
  headX: number;
  /** 中心から頬までの横のずれ */
  cheekDX: number;
  /** 頬の高さ */
  cheekY: number;
  /** 記号（♪や怒りマーク）を置く、頭の横までの距離 */
  markDX: number;
  /** 記号の高さ */
  markY: number;
}

/** キーは `<キャラID>/<衣装ID>` */
export const PHOTO_ANCHORS: Record<string, FaceAnchor> = {
  "aimi/swimsuit": {
    eyeY: 0.1376, headX: 0.4949, cheekDX: 0.0817, cheekY: 0.1706, markDX: 0.3178, markY: 0.0926,
  },
  "nagi/street": {
    eyeY: 0.1166, headX: 0.5412, cheekDX: 0.1473, cheekY: 0.1496, markDX: 0.5985, markY: 0.0716,
  },
  "rena/suit": {
    eyeY: 0.1346, headX: 0.4928, cheekDX: 0.0972, cheekY: 0.1676, markDX: 0.338, markY: 0.0896,
  },
  "hinata/blazer": {
    eyeY: 0.1356, headX: 0.5, cheekDX: 0.1069, cheekY: 0.1686, markDX: 0.4381, markY: 0.0906,
  },
  "aimi/sailor": {
    eyeY: 0.1214, headX: 0.5988, cheekDX: 0.1613, cheekY: 0.1544, markDX: 0.58, markY: 0.0764,
  },
  "aimi/hoodie": {
    eyeY: 0.1213, headX: 0.5047, cheekDX: 0.1738, cheekY: 0.1543, markDX: 0.58, markY: 0.0763,
  },
  "aimi/beachcover": {
    eyeY: 0.1218, headX: 0.509, cheekDX: 0.1671, cheekY: 0.1548, markDX: 0.58, markY: 0.0768,
  },
  "aimi/mermaid": {
    eyeY: 0.1236, headX: 0.5365, cheekDX: 0.0652, cheekY: 0.1566, markDX: 0.2714, markY: 0.0786,
  },
  "aimi/suit": {
    eyeY: 0.1329, headX: 0.4684, cheekDX: 0.1729, cheekY: 0.1659, markDX: 0.58, markY: 0.0879,
  },
  "aimi/roomwear": {
    eyeY: 0.1314, headX: 0.4848, cheekDX: 0.0952, cheekY: 0.1644, markDX: 0.4086, markY: 0.0864,
  },
};

/** 目印を持っていない立ち絵のための当たり。だいたいの位置には乗る */
const FALLBACK: FaceAnchor = {
  eyeY: 0.13, headX: 0.5, cheekDX: 0.1, cheekY: 0.163, markDX: 0.33, markY: 0.085,
};

export function photoAnchor(personaId: string, outfitId: string): FaceAnchor {
  return PHOTO_ANCHORS[`${personaId}/${outfitId}`] ?? FALLBACK;
}

/* -------------------------------------------------------------------------- */
/*  SVGで描くキャラの顔の位置                                                  */
/*  こちらは座標が分かっているので、切り抜き範囲から計算で出せる               */
/* -------------------------------------------------------------------------- */

// 顔の座標系（Avatar が使っている値）を、変換後の実座標に直したもの
const SVG_EYE_Y = 104; // 12 + 118 * 0.78
const SVG_CHEEK_Y = 124; // 12 + 143 * 0.78
const SVG_HEAD_X = 150;
const SVG_CHEEK_DX = 26; // 33 * 0.78
const SVG_MARK_DX = 59; // 頭の半分 39 ＋ 外側へ 20
const SVG_MARK_Y = 72;

export function svgAnchor(crop: string): FaceAnchor {
  const box = (CROPS[crop] ?? CROPS.full).trim().split(/\s+/).map(Number);
  const [vx, vy, vw, vh] = box;
  return {
    eyeY: (SVG_EYE_Y - vy) / vh,
    headX: (SVG_HEAD_X - vx) / vw,
    cheekDX: SVG_CHEEK_DX / vw,
    cheekY: (SVG_CHEEK_Y - vy) / vh,
    markDX: SVG_MARK_DX / vw,
    markY: (SVG_MARK_Y - vy) / vh,
  };
}

/**
 * 中に収めて下端を揃えたときの、絵が実際に描かれている枠を返す。
 * 画像の object-contain / object-bottom と、SVGの xMidYMax meet は
 * どちらも同じ計算になる。
 */
export function fitBox(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number,
) {
  if (!containerW || !containerH || !naturalW || !naturalH) {
    return { left: 0, top: 0, width: containerW, height: containerH };
  }
  const scale = Math.min(containerW / naturalW, containerH / naturalH);
  const width = naturalW * scale;
  const height = naturalH * scale;
  return { left: (containerW - width) / 2, top: containerH - height, width, height };
}
