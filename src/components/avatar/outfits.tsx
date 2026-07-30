import type { ReactNode } from "react";
import type { ColorOption } from "@/lib/types";
import {
  BODY,
  CX,
  armPath,
  poseById,
  shortSleevePath,
  type FigureDims,
  type Pose,
} from "./geometry";
import { hi, ink, mix } from "./palette";

interface OutfitProps {
  d: FigureDims;
  skin: ColorOption;
  /** 手足の配置。袖だけがこれを見る */
  pose: Pose;
}

/** ウエストからスカートを描く */
function skirt(
  d: FigureDims,
  topY: number,
  hemY: number,
  flare: number,
): string {
  const w = d.waist + 3;
  const h = w + flare;
  return `M ${CX - w},${topY}
          L ${CX + w},${topY}
          C ${CX + w + flare * 0.4},${topY + (hemY - topY) * 0.5} ${CX + h},${hemY - 10} ${CX + h},${hemY - 4}
          C ${CX + h * 0.5},${hemY + 8} ${CX - h * 0.5},${hemY + 8} ${CX - h},${hemY - 4}
          C ${CX - h},${hemY - 10} ${CX - w - flare * 0.4},${topY + (hemY - topY) * 0.5} ${CX - w},${topY} Z`;
}

/** プリーツの線 */
function pleats(d: FigureDims, topY: number, hemY: number, flare: number, color: string) {
  const w = d.waist + 3;
  const h = w + flare;
  const lines: ReactNode[] = [];
  for (let i = -3; i <= 3; i++) {
    const tx = CX + (w * i) / 3.6;
    const bx = CX + (h * i) / 3.6;
    lines.push(
      <path
        key={i}
        d={`M ${tx},${topY + 4} C ${tx + (bx - tx) * 0.4},${topY + (hemY - topY) * 0.6} ${bx},${hemY - 14} ${bx},${hemY - 2}`}
        stroke={color}
        strokeWidth={1.4}
        fill="none"
        opacity={0.55}
      />,
    );
  }
  return <g>{lines}</g>;
}

/** 肩からウエストまでを覆うトップス */
function topShape(d: FigureDims, topY = BODY.shoulder - 4, botY = BODY.waist + 6, grow = 2): string {
  const b = d.bust + grow;
  const w = d.waist + grow;
  return `M ${CX - 32},${topY}
          C ${CX - 46},${topY + 6} ${CX - b},${BODY.bust - 22} ${CX - b},${BODY.bust}
          C ${CX - b},${BODY.bust + 22} ${CX - w},${BODY.waist - 16} ${CX - w},${botY}
          L ${CX + w},${botY}
          C ${CX + w},${BODY.waist - 16} ${CX + b},${BODY.bust + 22} ${CX + b},${BODY.bust}
          C ${CX + b},${BODY.bust - 22} ${CX + 46},${topY + 6} ${CX + 32},${topY} Z`;
}

/**
 * 袖。腕そのものの曲線をなぞって描くので、ポーズを増やしても
 * 服側を書き換える必要がない
 */
function Sleeves({
  color,
  long,
  width = 22,
  pose,
}: {
  color: string;
  long: boolean;
  width?: number;
  pose: Pose;
}) {
  return (
    <g stroke={color} strokeWidth={width} strokeLinecap="round" fill="none">
      <path d={long ? armPath(-1, pose) : shortSleevePath(-1, pose)} />
      <path d={long ? armPath(1, pose) : shortSleevePath(1, pose)} />
    </g>
  );
}


/* -------------------------------------------------------------------------- */
/*  布の質感                                                                   */
/*  ベタ塗りだと安っぽく見えるので、上が明るく裾が沈むグラデを敷く             */
/* -------------------------------------------------------------------------- */

const gradId = (c: string) => `cloth${c.replace("#", "")}`;
const cloth = (c: string) => `url(#${gradId(c)})`;

/** 服ごとに使う色。使う色のぶんだけグラデを定義する */
const OUTFIT_PALETTE: Record<string, string[]> = {
  swimsuit: ["#fdfbf5", "#e8934c", "#7ec8e8"],
  street: ["#e07a2e", "#2a2529", "#3a2e28", "#5a4438"],
  sailor: ["#fdfdfd", "#2f4a7a", "#cf3f4e"],
  blazer: ["#fdfdfd", "#39405c", "#8a4450", "#4a5273"],
  hoodie: ["#e8bcd6", "#d9a8c4", "#6d7a99"],
  onepiece: ["#f5f0e4", "#c98fa6"],
  suit: ["#9aa3ad", "#2e2e35", "#aeb6c0"],
  roomwear: ["#f2e6cf", "#cfe4f5"],
  knit: ["#d8b8a0", "#c2a086"],
  yukata: ["#5d84be", "#4a6fa8", "#d9536a"],
  camisole: ["#f7eef2", "#5f7ba3"],
};

function ClothDefs({ colors }: { colors: string[] }) {
  return (
    <defs>
      {colors.map((c) => (
        <linearGradient key={c} id={gradId(c)} x1="0.1" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={hi(c, 0.2)} />
          <stop offset="48%" stopColor={c} />
          <stop offset="100%" stopColor={mix(c, "#3b2430", 0.3)} />
        </linearGradient>
      ))}
    </defs>
  );
}

/* ========================================================================== */

const OUTFITS: Record<string, (p: OutfitProps) => ReactNode> = {
  /* ------------------------- ビキニ＆パレオ ------------------------- */
  swimsuit: ({ d }) => {
    const b = d.bust;
    const h = d.hip;
    const top = BODY.bust - 8;
    const hem = BODY.hip + 66;
    return (
      <g>
        {/* 肩にかかる紐 */}
        <g fill="none" stroke="#fdfbf5" strokeWidth={2.8} strokeLinecap="round">
          <path d={`M ${CX - 24},${BODY.shoulder + 2} C ${CX - 20},${top - 18} ${CX - 16},${top - 14} ${CX - 14},${top - 6}`} />
          <path d={`M ${CX + 24},${BODY.shoulder + 2} C ${CX + 20},${top - 18} ${CX + 16},${top - 14} ${CX + 14},${top - 6}`} />
        </g>
        {/* カップ */}
        <path
          d={`M ${CX - b - 1},${top - 6}
              C ${CX - b + 2},${top + 22} ${CX - 20},${top + 34} ${CX},${top + 26}
              C ${CX + 20},${top + 34} ${CX + b - 2},${top + 22} ${CX + b + 1},${top - 6}
              C ${CX + b - 10},${top - 22} ${CX + 22},${top - 12} ${CX + 3},${top + 2}
              C ${CX + 1},${top + 4} ${CX - 1},${top + 4} ${CX - 3},${top + 2}
              C ${CX - 22},${top - 12} ${CX - b + 10},${top - 22} ${CX - b - 1},${top - 6} Z`}
          fill={cloth("#fdfbf5")}
        />
        {/* カップの縫い目 */}
        <g fill="none" stroke={mix("#fdfbf5", "#3b2430", 0.22)} strokeWidth={1.1} opacity={0.65}>
          <path d={`M ${CX - b + 8},${top + 2} C ${CX - b + 14},${top + 20} ${CX - 14},${top + 26} ${CX - 4},${top + 12}`} />
          <path d={`M ${CX + b - 8},${top + 2} C ${CX + b - 14},${top + 20} ${CX + 14},${top + 26} ${CX + 4},${top + 12}`} />
        </g>
        {/* ハイビスカス柄 */}
        <g opacity={0.85}>
          <circle cx={CX - b + 16} cy={top + 12} r={5.5} fill="#f0a05a" />
          <circle cx={CX + b - 18} cy={top + 9} r={4.5} fill="#f0a05a" />
          <circle cx={CX - 22} cy={top + 20} r={4} fill={cloth("#7ec8e8")} />
          <circle cx={CX + 24} cy={top + 17} r={4.5} fill={cloth("#7ec8e8")} />
          <circle cx={CX - b + 30} cy={top - 2} r={3} fill={cloth("#7ec8e8")} />
        </g>
        {/* 中央の金具 */}
        <circle cx={CX} cy={top + 6} r={5.5} fill="none" stroke="#d8b25e" strokeWidth={2.6} />
        {/* ボトム */}
        <path
          d={`M ${CX - h + 4},${BODY.hip + 2}
              C ${CX - 20},${BODY.crotch - 2} ${CX + 20},${BODY.crotch - 2} ${CX + h - 4},${BODY.hip + 2}
              C ${CX + h - 8},${BODY.hip + 20} ${CX + 13},${BODY.crotch + 12} ${CX},${BODY.crotch + 12}
              C ${CX - 13},${BODY.crotch + 12} ${CX - h + 8},${BODY.hip + 20} ${CX - h + 4},${BODY.hip + 2} Z`}
          fill={cloth("#fdfbf5")}
        />
        {/* パレオ。左腰で結んで、裾は右に向かって長くなる */}
        <path
          d={`M ${CX - h - 6},${BODY.hip - 6}
              L ${CX + h + 6},${BODY.hip - 6}
              C ${CX + h + 13},${BODY.hip + 34} ${CX + h + 11},${hem - 26} ${CX + h + 3},${hem - 2}
              C ${CX + 30},${hem + 10} ${CX + 4},${hem - 12} ${CX - 14},${hem - 26}
              C ${CX - 30},${hem - 38} ${CX - h + 4},${hem - 40} ${CX - h - 4},${hem - 48}
              C ${CX - h - 11},${BODY.hip + 30} ${CX - h - 9},${BODY.hip + 6} ${CX - h - 6},${BODY.hip - 6} Z`}
          fill={cloth("#e8934c")}
        />
        {/* 結び目から広がる布のたるみ */}
        <g
          fill="none"
          stroke={mix("#e8934c", "#3b2430", 0.32)}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.5}
        >
          <path d={`M ${CX - h + 2},${BODY.hip + 6} C ${CX - h + 14},${BODY.hip + 34} ${CX - h + 20},${hem - 54} ${CX - h + 18},${hem - 44}`} />
          <path d={`M ${CX - h + 6},${BODY.hip + 4} C ${CX - 16},${BODY.hip + 36} ${CX - 10},${hem - 44} ${CX - 8},${hem - 30}`} />
          <path d={`M ${CX - h + 10},${BODY.hip + 2} C ${CX + 12},${BODY.hip + 30} ${CX + 22},${hem - 38} ${CX + 24},${hem - 20}`} />
          <path d={`M ${CX + 20},${BODY.hip} C ${CX + h - 2},${BODY.hip + 26} ${CX + h + 4},${hem - 34} ${CX + h + 2},${hem - 12}`} />
        </g>
        {/* 巻きの重なりでできる影 */}
        <path
          d={`M ${CX + h - 10},${BODY.hip - 6}
              C ${CX + h + 4},${BODY.hip + 30} ${CX + h + 4},${hem - 30} ${CX + h + 3},${hem - 2}
              C ${CX + h + 11},${hem - 26} ${CX + h + 13},${BODY.hip + 34} ${CX + h + 6},${BODY.hip - 6} Z`}
          fill={mix("#e8934c", "#3b2430", 0.3)}
          opacity={0.45}
          stroke="none"
        />
        {/* ハイビスカス柄 */}
        <g fill={cloth("#fdfbf5")} opacity={0.92}>
          <ellipse cx={CX - 26} cy={BODY.hip + 24} rx={7.5} ry={4} transform={`rotate(-18 ${CX - 26} ${BODY.hip + 24})`} />
          <ellipse cx={CX + 6} cy={BODY.hip + 42} rx={8.5} ry={4.5} transform={`rotate(12 ${CX + 6} ${BODY.hip + 42})`} />
          <ellipse cx={CX + 34} cy={BODY.hip + 14} rx={6} ry={3.5} transform={`rotate(-8 ${CX + 34} ${BODY.hip + 14})`} />
          <ellipse cx={CX - 8} cy={BODY.hip + 12} rx={6.5} ry={3.5} transform={`rotate(24 ${CX - 8} ${BODY.hip + 12})`} />
          <ellipse cx={CX + 22} cy={hem - 34} rx={7} ry={4} transform={`rotate(-14 ${CX + 22} ${hem - 34})`} />
        </g>
        {/* 結び目 */}
        <path
          d={`M ${CX - h - 3},${BODY.hip - 2} l -16,-10 l 4,14 l -14,6 l 20,4 Z`}
          fill={cloth("#7ec8e8")}
        />
        {/* 手首のシュシュ */}
        <ellipse cx={CX + 62} cy={BODY.crotch - 6} rx={6.5} ry={4.5} fill={cloth("#e8934c")} />
      </g>
    );
  },

  /* ------------------------------ ストリート ------------------------------ */
  street: ({ d, pose }) => (
    <g>
      {/* インナー */}
      <path d={topShape(d, BODY.shoulder - 2, BODY.waist - 10, 0)} fill={cloth("#2a2529")} />
      {/* 肩を出した長袖 */}
      <Sleeves pose={pose} color="#e07a2e" long width={26} />
      {/* クロップトップ */}
      <path
        d={`M ${CX - 34},${BODY.shoulder + 10}
            C ${CX - 48},${BODY.shoulder + 16} ${CX - d.bust - 3},${BODY.bust - 18} ${CX - d.bust - 3},${BODY.bust}
            C ${CX - d.bust - 3},${BODY.bust + 20} ${CX - d.waist - 3},${BODY.waist - 28} ${CX - d.waist - 3},${BODY.waist - 16}
            L ${CX + d.waist + 3},${BODY.waist - 16}
            C ${CX + d.waist + 3},${BODY.waist - 28} ${CX + d.bust + 3},${BODY.bust + 20} ${CX + d.bust + 3},${BODY.bust}
            C ${CX + d.bust + 3},${BODY.bust - 18} ${CX + 48},${BODY.shoulder + 16} ${CX + 34},${BODY.shoulder + 10}
            C ${CX + 16},${BODY.bust - 4} ${CX - 16},${BODY.bust - 4} ${CX - 34},${BODY.shoulder + 10} Z`}
        fill={cloth("#e07a2e")}
      />
      {/* 裾のライン */}
      <path
        d={`M ${CX - d.waist - 3},${BODY.waist - 22} L ${CX + d.waist + 3},${BODY.waist - 22}`}
        stroke={mix("#e07a2e", "#3b2430", 0.35)}
        strokeWidth={2.4}
      />
      {/* 巻きスカート */}
      <path
        d={`M ${CX - d.hip - 2},${BODY.hip - 6}
            L ${CX + d.hip + 2},${BODY.hip - 6}
            C ${CX + d.hip + 4},${BODY.hip + 30} ${CX + d.hip},${BODY.crotch + 38} ${CX + d.hip - 4},${BODY.crotch + 50}
            L ${CX - d.hip + 4},${BODY.crotch + 50}
            C ${CX - d.hip},${BODY.crotch + 38} ${CX - d.hip - 4},${BODY.hip + 30} ${CX - d.hip - 2},${BODY.hip - 6} Z`}
        fill={cloth("#3a2e28")}
      />
      {/* 重ねた別布 */}
      <path
        d={`M ${CX + 4},${BODY.hip - 6}
            L ${CX + d.hip + 2},${BODY.hip - 6}
            C ${CX + d.hip + 4},${BODY.hip + 30} ${CX + d.hip},${BODY.crotch + 38} ${CX + d.hip - 4},${BODY.crotch + 50}
            L ${CX + 12},${BODY.crotch + 50} Z`}
        fill={cloth("#5a4438")}
      />
      <g stroke={mix("#3a2e28", "#000000", 0.3)} strokeWidth={1.2} opacity={0.55}>
        {[10, 20, 30, 40].map((o) => (
          <path key={o} d={`M ${CX + 6 + o},${BODY.hip - 4} L ${CX + 10 + o},${BODY.crotch + 48}`} />
        ))}
      </g>
      {/* ベルトとチェーン */}
      <path
        d={`M ${CX - d.hip - 2},${BODY.hip - 4} L ${CX + d.hip + 2},${BODY.hip - 4}`}
        stroke="#e0d2b0"
        strokeWidth={2.6}
      />
      <g fill="none" stroke="#d9c48a" strokeWidth={1.5} strokeLinecap="round">
        <path
          d={`M ${CX - d.hip + 6},${BODY.hip + 2} C ${CX - 12},${BODY.hip + 24} ${CX + 8},${BODY.hip + 22} ${CX + d.hip - 8},${BODY.hip + 2}`}
        />
        <path
          d={`M ${CX - d.hip + 12},${BODY.hip + 6} C ${CX - 8},${BODY.hip + 34} ${CX + 10},${BODY.hip + 30} ${CX + d.hip - 14},${BODY.hip + 8}`}
        />
        <path d={`M ${CX + 6},${BODY.hip - 2} L ${CX + 9},${BODY.hip + 22}`} />
      </g>
      <circle cx={CX + 9} cy={BODY.hip + 24} r={2.4} fill="#e0d2b0" />
      {/* ブーツ */}
      <g fill={cloth("#3a2e28")}>
        <path
          d={`M ${CX - 32},${BODY.ankle - 24} L ${CX - 10},${BODY.ankle - 24} L ${CX - 10},${BODY.ankle + 8}
              L ${CX - 33},${BODY.ankle + 8} Z`}
        />
        <path
          d={`M ${CX + 10},${BODY.ankle - 24} L ${CX + 32},${BODY.ankle - 24} L ${CX + 33},${BODY.ankle + 8}
              L ${CX + 10},${BODY.ankle + 8} Z`}
        />
      </g>
      <g fill="#8a5a34">
        <path d={`M ${CX - 33},${BODY.ankle - 26} l 24,0 l 0,7 l -24,0 Z`} />
        <path d={`M ${CX + 9},${BODY.ankle - 26} l 24,0 l 0,7 l -24,0 Z`} />
      </g>
    </g>
  ),

  /* ----------------------------- セーラー服 ----------------------------- */
  sailor: ({ d, pose }) => (
    <g>
      <Sleeves pose={pose} color="#fdfdfd" long={false} />
      <path d={topShape(d)} fill={cloth("#fdfdfd")} />
      {/* セーラー襟 */}
      <path
        d={`M ${CX - 30},${BODY.shoulder - 6}
            L ${CX - 47},${BODY.shoulder + 12}
            C ${CX - 43},${BODY.shoulder + 32} ${CX - 36},${BODY.bust} ${CX - 27},${BODY.bust + 6}
            L ${CX},${BODY.bust + 18}
            L ${CX + 27},${BODY.bust + 6}
            C ${CX + 36},${BODY.bust} ${CX + 43},${BODY.shoulder + 32} ${CX + 47},${BODY.shoulder + 12}
            L ${CX + 30},${BODY.shoulder - 6}
            C ${CX + 18},${BODY.shoulder + 22} ${CX},${BODY.bust - 4} ${CX},${BODY.bust - 4}
            C ${CX},${BODY.bust - 4} ${CX - 18},${BODY.shoulder + 22} ${CX - 30},${BODY.shoulder - 6} Z`}
        fill={cloth("#2f4a7a")}
      />
      <g stroke="#fdfdfd" strokeWidth={1.8} fill="none" opacity={0.9}>
        <path d={`M ${CX - 40},${BODY.shoulder + 16} C ${CX - 36},${BODY.shoulder + 32} ${CX - 30},${BODY.bust - 3} ${CX - 22},${BODY.bust + 2}`} />
        <path d={`M ${CX + 40},${BODY.shoulder + 16} C ${CX + 36},${BODY.shoulder + 32} ${CX + 30},${BODY.bust - 3} ${CX + 22},${BODY.bust + 2}`} />
      </g>
      {/* スカーフ */}
      <path d={`M ${CX - 11},${BODY.shoulder + 26} L ${CX + 11},${BODY.shoulder + 26} L ${CX + 4},${BODY.bust + 30} L ${CX - 4},${BODY.bust + 30} Z`} fill={cloth("#cf3f4e")} />
      <path d={`M ${CX - 12},${BODY.shoulder + 22} l 12,-4 l 12,4 l -6,10 l -12,0 Z`} fill="#e0505f" />
      {/* スカート */}
      <path d={skirt(d, BODY.waist, BODY.crotch + 62, 26)} fill={cloth("#2f4a7a")} />
      {pleats(d, BODY.waist, BODY.crotch + 62, 26, "#1e3157")}
    </g>
  ),

  /* ------------------------------ ブレザー ------------------------------ */
  blazer: ({ d, pose }) => (
    <g>
      <path d={topShape(d)} fill={cloth("#fdfdfd")} />
      <Sleeves pose={pose} color="#39405c" long />
      {/* ジャケット本体（前開き） */}
      <path
        d={`M ${CX - 32},${BODY.shoulder - 4}
            C ${CX - 46},${BODY.shoulder + 4} ${CX - d.bust - 2},${BODY.bust - 22} ${CX - d.bust - 2},${BODY.bust}
            C ${CX - d.bust - 2},${BODY.bust + 22} ${CX - d.waist - 2},${BODY.waist - 14} ${CX - d.waist - 2},${BODY.waist + 10}
            L ${CX - 12},${BODY.waist + 10}
            L ${CX - 16},${BODY.bust - 6}
            Z`}
        fill={cloth("#39405c")}
      />
      <path
        d={`M ${CX + 32},${BODY.shoulder - 4}
            C ${CX + 46},${BODY.shoulder + 4} ${CX + d.bust + 2},${BODY.bust - 22} ${CX + d.bust + 2},${BODY.bust}
            C ${CX + d.bust + 2},${BODY.bust + 22} ${CX + d.waist + 2},${BODY.waist - 14} ${CX + d.waist + 2},${BODY.waist + 10}
            L ${CX + 12},${BODY.waist + 10}
            L ${CX + 16},${BODY.bust - 6}
            Z`}
        fill={cloth("#39405c")}
      />
      {/* 襟 */}
      <path d={`M ${CX - 30},${BODY.shoulder - 4} L ${CX - 16},${BODY.bust - 6} L ${CX - 4},${BODY.bust - 20} Z`} fill={cloth("#4a5273")} />
      <path d={`M ${CX + 30},${BODY.shoulder - 4} L ${CX + 16},${BODY.bust - 6} L ${CX + 4},${BODY.bust - 20} Z`} fill={cloth("#4a5273")} />
      {/* リボンタイ */}
      <path d={`M ${CX},${BODY.bust - 22} l -16,-7 l 3,15 l 13,3 Z`} fill="#c8404f" />
      <path d={`M ${CX},${BODY.bust - 22} l 16,-7 l -3,15 l -13,3 Z`} fill="#c8404f" />
      <circle cx={CX} cy={BODY.bust - 20} r={3.4} fill="#8f2833" />
      {/* チェックスカート */}
      <path d={skirt(d, BODY.waist + 4, BODY.crotch + 58, 24)} fill={cloth("#8a4450")} />
      <g stroke="#5e2c36" strokeWidth={1.3} opacity={0.6}>
        {[-24, -8, 8, 24].map((o) => (
          <path key={o} d={`M ${CX + o},${BODY.waist + 6} L ${CX + o * 1.7},${BODY.crotch + 56}`} />
        ))}
      </g>
      <g stroke="#5e2c36" strokeWidth={1.1} opacity={0.45}>
        {[14, 32, 50].map((o) => (
          <path key={o} d={`M ${CX - d.waist - 8 - o * 0.3},${BODY.waist + o} L ${CX + d.waist + 8 + o * 0.3},${BODY.waist + o}`} />
        ))}
      </g>
    </g>
  ),

  /* ------------------------------ パーカー ------------------------------ */
  hoodie: ({ d, pose }) => (
    <g>
      {/* フード */}
      <path
        d={`M ${CX - 40},${BODY.shoulder + 10} C ${CX - 34},188 ${CX + 34},188 ${CX + 40},${BODY.shoulder + 10}
            C ${CX + 26},${BODY.shoulder + 22} ${CX - 26},${BODY.shoulder + 22} ${CX - 40},${BODY.shoulder + 10} Z`}
        fill={cloth("#d9a8c4")}
      />
      <Sleeves pose={pose} color="#e8bcd6" long width={26} />
      <path d={topShape(d, BODY.shoulder - 6, BODY.crotch + 24, 8)} fill={cloth("#e8bcd6")} />
      {/* 前ポケット */}
      <path
        d={`M ${CX - 30},${BODY.waist + 18} L ${CX + 30},${BODY.waist + 18}
            L ${CX + 26},${BODY.crotch + 12} L ${CX - 26},${BODY.crotch + 12} Z`}
        fill={cloth("#d9a8c4")}
      />
      {/* 紐 */}
      <g stroke="#fdf6fa" strokeWidth={3} strokeLinecap="round" fill="none">
        <path d={`M ${CX - 8},${BODY.shoulder + 16} L ${CX - 11},${BODY.bust + 6}`} />
        <path d={`M ${CX + 8},${BODY.shoulder + 16} L ${CX + 11},${BODY.bust + 6}`} />
      </g>
      {/* 裾のリブ */}
      <rect x={CX - d.waist - 10} y={BODY.crotch + 16} width={(d.waist + 10) * 2} height={9} rx={4} fill="#c996b4" />
      {/* ショートパンツ */}
      <path
        d={`M ${CX - d.hip},${BODY.crotch + 6} L ${CX + d.hip},${BODY.crotch + 6}
            L ${CX + d.hip - 2},${BODY.crotch + 46} L ${CX + 4},${BODY.crotch + 40}
            L ${CX - 4},${BODY.crotch + 40} L ${CX - d.hip + 2},${BODY.crotch + 46} Z`}
        fill={cloth("#6d7a99")}
      />
    </g>
  ),

  /* ------------------------------ ワンピース ------------------------------ */
  onepiece: ({ d, pose }) => (
    <g>
      <Sleeves pose={pose} color="#f5f0e4" long={false} width={20} />
      <path d={topShape(d, BODY.shoulder - 6, BODY.waist)} fill={cloth("#f5f0e4")} />
      {/* 襟もと */}
      <path d={`M ${CX - 20},${BODY.shoulder - 4} C ${CX - 10},${BODY.shoulder + 22} ${CX + 10},${BODY.shoulder + 22} ${CX + 20},${BODY.shoulder - 4}`} fill="none" stroke="#ded4bf" strokeWidth={2.4} />
      {/* ウエストリボン */}
      <rect x={CX - d.waist - 3} y={BODY.waist - 8} width={(d.waist + 3) * 2} height={11} fill={cloth("#c98fa6")} />
      <path d={`M ${CX + d.waist - 4},${BODY.waist - 4} l 16,-8 l -3,16 Z`} fill={cloth("#c98fa6")} />
      {/* フレアスカート */}
      <path d={skirt(d, BODY.waist + 2, BODY.knee - 16, 34)} fill={cloth("#f5f0e4")} />
      <g stroke="#ded4bf" strokeWidth={1.3} fill="none" opacity={0.7}>
        {[-1, 0, 1].map((i) => (
          <path
            key={i}
            d={`M ${CX + i * 20},${BODY.waist + 12} C ${CX + i * 26},${BODY.hip + 40} ${CX + i * 32},${BODY.knee - 60} ${CX + i * 36},${BODY.knee - 22}`}
          />
        ))}
      </g>
      <path
        d={`M ${CX - d.waist - 37},${BODY.knee - 20} C ${CX - 20},${BODY.knee - 8} ${CX + 20},${BODY.knee - 8} ${CX + d.waist + 37},${BODY.knee - 20}`}
        fill="none"
        stroke="#c98fa6"
        strokeWidth={3}
      />
    </g>
  ),

  /* -------------------------------- スーツ -------------------------------- */
  suit: ({ d, pose }) => (
    <g>
      <path d={topShape(d)} fill={cloth("#2e2e35")} />
      <Sleeves pose={pose} color="#9aa3ad" long />
      <path
        d={`M ${CX - 32},${BODY.shoulder - 4}
            C ${CX - 46},${BODY.shoulder + 4} ${CX - d.bust - 2},${BODY.bust - 22} ${CX - d.bust - 2},${BODY.bust}
            C ${CX - d.bust - 2},${BODY.bust + 22} ${CX - d.waist - 2},${BODY.waist - 14} ${CX - d.waist - 2},${BODY.waist + 6}
            L ${CX - 14},${BODY.waist + 6}
            L ${CX - 20},${BODY.bust - 8} Z`}
        fill={cloth("#9aa3ad")}
      />
      <path
        d={`M ${CX + 32},${BODY.shoulder - 4}
            C ${CX + 46},${BODY.shoulder + 4} ${CX + d.bust + 2},${BODY.bust - 22} ${CX + d.bust + 2},${BODY.bust}
            C ${CX + d.bust + 2},${BODY.bust + 22} ${CX + d.waist + 2},${BODY.waist - 14} ${CX + d.waist + 2},${BODY.waist + 6}
            L ${CX + 14},${BODY.waist + 6}
            L ${CX + 20},${BODY.bust - 8} Z`}
        fill={cloth("#9aa3ad")}
      />
      <path d={`M ${CX - 30},${BODY.shoulder - 4} L ${CX - 20},${BODY.bust - 8} L ${CX - 6},${BODY.bust - 24} Z`} fill={cloth("#aeb6c0")} />
      <path d={`M ${CX + 30},${BODY.shoulder - 4} L ${CX + 20},${BODY.bust - 8} L ${CX + 6},${BODY.bust - 24} Z`} fill={cloth("#aeb6c0")} />
      {/* タイトスカート */}
      <path
        d={`M ${CX - d.waist - 2},${BODY.waist + 2}
            L ${CX + d.waist + 2},${BODY.waist + 2}
            C ${CX + d.hip + 3},${BODY.hip} ${CX + d.hip + 1},${BODY.crotch + 40} ${CX + d.hip - 2},${BODY.crotch + 54}
            L ${CX - d.hip + 2},${BODY.crotch + 54}
            C ${CX - d.hip - 1},${BODY.crotch + 40} ${CX - d.hip - 3},${BODY.hip} ${CX - d.waist - 2},${BODY.waist + 2} Z`}
        fill={cloth("#9aa3ad")}
      />
      <path d={`M ${CX + 10},${BODY.crotch + 20} L ${CX + 10},${BODY.crotch + 54}`} stroke="#7e8791" strokeWidth={1.6} />
    </g>
  ),

  /* ----------------------------- ルームウェア ----------------------------- */
  roomwear: ({ d, pose }) => (
    <g>
      {/* キャミ */}
      <path d={topShape(d, BODY.shoulder + 22, BODY.waist + 14, 0)} fill={cloth("#cfe4f5")} />
      <g stroke="#cfe4f5" strokeWidth={3} fill="none" strokeLinecap="round">
        <path d={`M ${CX - 20},${BODY.shoulder + 24} L ${CX - 12},${BODY.neckTop + 30}`} />
        <path d={`M ${CX + 20},${BODY.shoulder + 24} L ${CX + 12},${BODY.neckTop + 30}`} />
      </g>
      <path d={`M ${CX - 22},${BODY.shoulder + 28} C ${CX - 10},${BODY.bust - 2} ${CX + 10},${BODY.bust - 2} ${CX + 22},${BODY.shoulder + 28}`} fill="none" stroke="#eaf4fc" strokeWidth={2.4} />
      {/* ショートパンツ */}
      <path
        d={`M ${CX - d.hip},${BODY.hip + 4} L ${CX + d.hip},${BODY.hip + 4}
            L ${CX + d.hip - 3},${BODY.crotch + 34} L ${CX + 4},${BODY.crotch + 28}
            L ${CX - 4},${BODY.crotch + 28} L ${CX - d.hip + 3},${BODY.crotch + 34} Z`}
        fill={cloth("#cfe4f5")}
      />
      {/* もこもこカーディガン */}
      <Sleeves pose={pose} color="#f2e6cf" long width={30} />
      <path
        d={`M ${CX - 34},${BODY.shoulder - 6}
            C ${CX - 50},${BODY.shoulder + 4} ${CX - d.bust - 8},${BODY.bust - 20} ${CX - d.bust - 8},${BODY.bust + 6}
            C ${CX - d.bust - 8},${BODY.bust + 40} ${CX - d.waist - 10},${BODY.waist + 10} ${CX - d.waist - 12},${BODY.crotch + 20}
            L ${CX - 10},${BODY.crotch + 20}
            L ${CX - 14},${BODY.bust - 4} Z`}
        fill={cloth("#f2e6cf")}
      />
      <path
        d={`M ${CX + 34},${BODY.shoulder - 6}
            C ${CX + 50},${BODY.shoulder + 4} ${CX + d.bust + 8},${BODY.bust - 20} ${CX + d.bust + 8},${BODY.bust + 6}
            C ${CX + d.bust + 8},${BODY.bust + 40} ${CX + d.waist + 10},${BODY.waist + 10} ${CX + d.waist + 12},${BODY.crotch + 20}
            L ${CX + 10},${BODY.crotch + 20}
            L ${CX + 14},${BODY.bust - 4} Z`}
        fill={cloth("#f2e6cf")}
      />
      <g fill="#e3d3b4" opacity={0.8}>
        <circle cx={CX - d.bust - 4} cy={BODY.bust + 10} r={7} />
        <circle cx={CX - d.waist - 10} cy={BODY.waist + 24} r={7} />
        <circle cx={CX + d.bust + 4} cy={BODY.bust + 10} r={7} />
        <circle cx={CX + d.waist + 10} cy={BODY.waist + 24} r={7} />
      </g>
    </g>
  ),

  /* -------------------------------- ニット -------------------------------- */
  knit: ({ d, pose }) => (
    <g>
      <Sleeves pose={pose} color="#d8b8a0" long width={26} />
      <path d={topShape(d, BODY.shoulder - 8, BODY.crotch + 26, 9)} fill={cloth("#d8b8a0")} />
      {/* 襟のリブ */}
      <path d={`M ${CX - 26},${BODY.shoulder - 4} C ${CX - 14},${BODY.shoulder + 18} ${CX + 14},${BODY.shoulder + 18} ${CX + 26},${BODY.shoulder - 4}`} fill="none" stroke="#c2a086" strokeWidth={7} strokeLinecap="round" />
      {/* 編み目 */}
      <g stroke="#c2a086" strokeWidth={1.2} opacity={0.6}>
        {[-30, -18, -6, 6, 18, 30].map((o) => (
          <path key={o} d={`M ${CX + o},${BODY.bust - 10} L ${CX + o},${BODY.crotch + 20}`} />
        ))}
      </g>
      <rect x={CX - d.waist - 11} y={BODY.crotch + 18} width={(d.waist + 11) * 2} height={11} rx={5} fill={cloth("#c2a086")} />
    </g>
  ),

  /* -------------------------------- 浴衣 -------------------------------- */
  yukata: ({ d, pose }) => (
    <g>
      <Sleeves pose={pose} color="#4a6fa8" long={false} width={30} />
      {/* たもと */}
      <path d={`M ${CX - d.bust - 12},${BODY.bust - 4} l -12,58 l 26,6 l 4,-58 Z`} fill={cloth("#4a6fa8")} />
      <path d={`M ${CX + d.bust + 12},${BODY.bust - 4} l 12,58 l -26,6 l -4,-58 Z`} fill={cloth("#4a6fa8")} />
      {/* 身頃 */}
      <path d={topShape(d, BODY.shoulder - 6, BODY.waist + 4, 4)} fill={cloth("#5d84be")} />
      {/* 打ち合わせ */}
      <path d={`M ${CX - 30},${BODY.shoulder - 6} L ${CX + 6},${BODY.waist + 4} L ${CX - d.waist - 4},${BODY.waist + 4} Z`} fill={cloth("#4a6fa8")} />
      <path d={`M ${CX - 30},${BODY.shoulder - 6} L ${CX + 8},${BODY.bust + 4} L ${CX + 2},${BODY.bust + 12} L ${CX - 36},${BODY.shoulder - 2} Z`} fill="#f0f2f7" />
      <path d={`M ${CX + 30},${BODY.shoulder - 6} L ${CX - 4},${BODY.bust + 8} L ${CX + 2},${BODY.bust + 16} L ${CX + 36},${BODY.shoulder - 2} Z`} fill="#f7f9fc" />
      {/* 帯 */}
      <rect x={CX - d.waist - 5} y={BODY.waist - 10} width={(d.waist + 5) * 2} height={26} fill={cloth("#d9536a")} />
      <rect x={CX - d.waist - 5} y={BODY.waist - 2} width={(d.waist + 5) * 2} height={5} fill="#f0c26a" />
      <path d={`M ${CX + d.waist},${BODY.waist - 6} l 20,-10 l -4,20 l 16,6 l -22,4 Z`} fill="#e0687d" />
      {/* 裾 */}
      <path
        d={`M ${CX - d.waist - 5},${BODY.waist + 14}
            L ${CX + d.waist + 5},${BODY.waist + 14}
            C ${CX + d.hip + 6},${BODY.hip + 40} ${CX + d.hip + 2},${BODY.knee + 30} ${CX + d.hip - 4},${BODY.knee + 54}
            L ${CX - d.hip + 4},${BODY.knee + 54}
            C ${CX - d.hip - 2},${BODY.knee + 30} ${CX - d.hip - 6},${BODY.hip + 40} ${CX - d.waist - 5},${BODY.waist + 14} Z`}
        fill={cloth("#5d84be")}
      />
      {/* 花柄 */}
      <g fill="#f7d9e2" opacity={0.85}>
        {[
          [-26, 60], [10, 100], [-14, 150], [26, 170], [-30, 210], [18, 230],
        ].map(([ox, oy], i) => (
          <g key={i} transform={`translate(${CX + ox},${BODY.waist + oy})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-4} rx={2.4} ry={4} transform={`rotate(${a})`} />
            ))}
          </g>
        ))}
      </g>
    </g>
  ),

  /* ----------------------------- キャミソール ----------------------------- */
  camisole: ({ d }) => (
    <g>
      <path d={topShape(d, BODY.shoulder + 24, BODY.waist + 16, 0)} fill={cloth("#f7eef2")} />
      <g stroke="#f7eef2" strokeWidth={3} fill="none" strokeLinecap="round">
        <path d={`M ${CX - 20},${BODY.shoulder + 26} L ${CX - 12},${BODY.neckTop + 32}`} />
        <path d={`M ${CX + 20},${BODY.shoulder + 26} L ${CX + 12},${BODY.neckTop + 32}`} />
      </g>
      <path d={`M ${CX - 24},${BODY.shoulder + 30} C ${CX - 12},${BODY.bust + 2} ${CX + 12},${BODY.bust + 2} ${CX + 24},${BODY.shoulder + 30}`} fill="none" stroke="#e6d2da" strokeWidth={2.6} />
      {/* デニムショートパンツ */}
      <path
        d={`M ${CX - d.hip - 1},${BODY.hip}
            L ${CX + d.hip + 1},${BODY.hip}
            L ${CX + d.hip - 2},${BODY.crotch + 40} L ${CX + 4},${BODY.crotch + 34}
            L ${CX - 4},${BODY.crotch + 34} L ${CX - d.hip + 2},${BODY.crotch + 40} Z`}
        fill={cloth("#5f7ba3")}
      />
      <path d={`M ${CX - d.hip - 1},${BODY.hip + 8} L ${CX + d.hip + 1},${BODY.hip + 8}`} stroke="#405672" strokeWidth={2} />
      <g stroke="#e0c98a" strokeWidth={1} opacity={0.7} fill="none">
        <path d={`M ${CX - d.hip + 6},${BODY.crotch + 36} L ${CX - 6},${BODY.crotch + 30}`} />
        <path d={`M ${CX + d.hip - 6},${BODY.crotch + 36} L ${CX + 6},${BODY.crotch + 30}`} />
      </g>
    </g>
  ),
};

export function Outfit({
  variant,
  d,
  skin,
  pose = poseById(undefined),
}: {
  variant: string;
  d: FigureDims;
  skin: ColorOption;
  pose?: Pose;
}) {
  const render = OUTFITS[variant] ?? OUTFITS.sailor;
  const palette = OUTFIT_PALETTE[variant] ?? OUTFIT_PALETTE.sailor;
  return (
    // 子の path はここの stroke を継ぎ、まとめて線画がつく。
    // 自前で stroke を指定しているパーツ（袖など）はそちらが優先される
    <g
      stroke={ink("#b0a2ac", 0.55)}
      strokeWidth={1.25}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <ClothDefs colors={palette} />
      {render({ d, skin, pose })}
    </g>
  );
}
