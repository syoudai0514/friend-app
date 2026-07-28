/** 色をいじるための小さなユーティリティ。アニメ塗りの陰影と線画に使う */

function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(rgb: [number, number, number]): string {
  return "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

/** a と b を t の割合で混ぜる（t=0 で a、t=1 で b） */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

/**
 * 線画の色。真っ黒ではなく、その色を濃く沈めた紫寄りの暗色にすると
 * イラストらしく馴染む。
 */
export function ink(base: string, t = 0.62): string {
  return mix(base, "#3b2430", t);
}

/** 1影（アニメ塗りの標準的な陰） */
export function shade1(base: string): string {
  return mix(base, "#c47a92", 0.3);
}

/** 2影（より暗い陰。首の下や胸の下など） */
export function shade2(base: string): string {
  return mix(base, "#9c5470", 0.45);
}

/** ハイライト */
export function hi(base: string, t = 0.5): string {
  return mix(base, "#ffffff", t);
}
