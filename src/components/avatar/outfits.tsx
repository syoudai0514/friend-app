import type { ReactNode } from "react";
import type { ColorOption } from "@/lib/types";
import { BODY, CX, armPath, shortSleevePath, type FigureDims } from "./geometry";

interface OutfitProps {
  d: FigureDims;
  skin: ColorOption;
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
function topShape(d: FigureDims, topY = 202, botY = BODY.waist + 6, grow = 2): string {
  const b = d.bust + grow;
  const w = d.waist + grow;
  return `M ${CX - 32},${topY}
          C ${CX - 46},${topY + 6} ${CX - b},${BODY.bust - 22} ${CX - b},${BODY.bust}
          C ${CX - b},${BODY.bust + 22} ${CX - w},${BODY.waist - 16} ${CX - w},${botY}
          L ${CX + w},${botY}
          C ${CX + w},${BODY.waist - 16} ${CX + b},${BODY.bust + 22} ${CX + b},${BODY.bust}
          C ${CX + b},${BODY.bust - 22} ${CX + 46},${topY + 6} ${CX + 32},${topY} Z`;
}

function Sleeves({ color, long, width = 22 }: { color: string; long: boolean; width?: number }) {
  return (
    <g stroke={color} strokeWidth={width} strokeLinecap="round" fill="none">
      <path d={long ? armPath(-1) : shortSleevePath(-1)} />
      <path d={long ? armPath(1) : shortSleevePath(1)} />
    </g>
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
        {/* 首まわりのホルター */}
        <path
          d={`M ${CX - 8},${BODY.neckTop + 12}
              C ${CX - 7},${top - 20} ${CX - 5},${top - 16} ${CX - 4},${top - 10}
              L ${CX + 4},${top - 10}
              C ${CX + 5},${top - 16} ${CX + 7},${top - 20} ${CX + 8},${BODY.neckTop + 12}`}
          fill="none"
          stroke="#fdfbf5"
          strokeWidth={3.4}
          strokeLinecap="round"
        />
        {/* カップ */}
        <path
          d={`M ${CX - b - 1},${top - 6}
              C ${CX - b + 2},${top + 22} ${CX - 20},${top + 34} ${CX},${top + 28}
              C ${CX + 20},${top + 34} ${CX + b - 2},${top + 22} ${CX + b + 1},${top - 6}
              C ${CX + b - 10},${top - 22} ${CX + 20},${top - 14} ${CX + 6},${top - 2}
              L ${CX + 5},${top + 12} L ${CX - 5},${top + 12} L ${CX - 6},${top - 2}
              C ${CX - 20},${top - 14} ${CX - b + 10},${top - 22} ${CX - b - 1},${top - 6} Z`}
          fill="#fdfbf5"
        />
        {/* ハイビスカス柄 */}
        <g opacity={0.85}>
          <circle cx={CX - b + 16} cy={top + 12} r={5.5} fill="#f0a05a" />
          <circle cx={CX + b - 18} cy={top + 9} r={4.5} fill="#f0a05a" />
          <circle cx={CX - 22} cy={top + 20} r={4} fill="#7ec8e8" />
          <circle cx={CX + 24} cy={top + 17} r={4.5} fill="#7ec8e8" />
          <circle cx={CX - b + 30} cy={top - 2} r={3} fill="#7ec8e8" />
        </g>
        {/* 中央の金具 */}
        <circle cx={CX} cy={top + 6} r={5.5} fill="none" stroke="#d8b25e" strokeWidth={2.6} />
        {/* ボトム */}
        <path
          d={`M ${CX - h + 4},${BODY.hip + 2}
              C ${CX - 20},${BODY.crotch - 2} ${CX + 20},${BODY.crotch - 2} ${CX + h - 4},${BODY.hip + 2}
              C ${CX + h - 8},${BODY.hip + 20} ${CX + 13},${BODY.crotch + 12} ${CX},${BODY.crotch + 12}
              C ${CX - 13},${BODY.crotch + 12} ${CX - h + 8},${BODY.hip + 20} ${CX - h + 4},${BODY.hip + 2} Z`}
          fill="#fdfbf5"
        />
        {/* パレオ（左腰で結んで、裾は斜め） */}
        <path
          d={`M ${CX - h - 5},${BODY.hip - 4}
              L ${CX + h + 5},${BODY.hip - 4}
              C ${CX + h + 10},${BODY.hip + 30} ${CX + h + 8},${hem - 20} ${CX + h + 4},${hem}
              C ${CX + 18},${hem + 12} ${CX - 22},${hem - 8} ${CX - h - 10},${hem - 30}
              C ${CX - h - 10},${BODY.hip + 26} ${CX - h - 7},${BODY.hip + 8} ${CX - h - 5},${BODY.hip - 4} Z`}
          fill="#e8934c"
        />
        <g fill="#fdfbf5" opacity={0.92}>
          <ellipse cx={CX - 26} cy={BODY.hip + 24} rx={7.5} ry={4} transform={`rotate(-18 ${CX - 26} ${BODY.hip + 24})`} />
          <ellipse cx={CX + 6} cy={BODY.hip + 42} rx={8.5} ry={4.5} transform={`rotate(12 ${CX + 6} ${BODY.hip + 42})`} />
          <ellipse cx={CX + 34} cy={BODY.hip + 14} rx={6} ry={3.5} transform={`rotate(-8 ${CX + 34} ${BODY.hip + 14})`} />
          <ellipse cx={CX - 8} cy={BODY.hip + 12} rx={6.5} ry={3.5} transform={`rotate(24 ${CX - 8} ${BODY.hip + 12})`} />
        </g>
        {/* 結び目 */}
        <path
          d={`M ${CX - h - 2},${BODY.hip - 2} l -15,-9 l 3,13 l -13,5 l 18,4 Z`}
          fill="#7ec8e8"
        />
        {/* 手首のシュシュ */}
        <ellipse cx={CX + 62} cy={BODY.crotch - 6} rx={6.5} ry={4.5} fill="#e8934c" />
      </g>
    );
  },

  /* ----------------------------- セーラー服 ----------------------------- */
  sailor: ({ d }) => (
    <g>
      <Sleeves color="#fdfdfd" long={false} />
      <path d={topShape(d)} fill="#fdfdfd" />
      {/* セーラー襟 */}
      <path
        d={`M ${CX - 30},200
            L ${CX - 47},216
            C ${CX - 43},236 ${CX - 36},248 ${CX - 27},254
            L ${CX},266
            L ${CX + 27},254
            C ${CX + 36},248 ${CX + 43},236 ${CX + 47},216
            L ${CX + 30},200
            C ${CX + 18},226 ${CX},244 ${CX},244
            C ${CX},244 ${CX - 18},226 ${CX - 30},200 Z`}
        fill="#2f4a7a"
      />
      <g stroke="#fdfdfd" strokeWidth={1.8} fill="none" opacity={0.9}>
        <path d={`M ${CX - 40},220 C ${CX - 36},236 ${CX - 30},245 ${CX - 22},250`} />
        <path d={`M ${CX + 40},220 C ${CX + 36},236 ${CX + 30},245 ${CX + 22},250`} />
      </g>
      {/* スカーフ */}
      <path d={`M ${CX - 11},230 L ${CX + 11},230 L ${CX + 4},278 L ${CX - 4},278 Z`} fill="#cf3f4e" />
      <path d={`M ${CX - 12},226 l 12,-4 l 12,4 l -6,10 l -12,0 Z`} fill="#e0505f" />
      {/* スカート */}
      <path d={skirt(d, BODY.waist, BODY.crotch + 62, 26)} fill="#2f4a7a" />
      {pleats(d, BODY.waist, BODY.crotch + 62, 26, "#1e3157")}
    </g>
  ),

  /* ------------------------------ ブレザー ------------------------------ */
  blazer: ({ d }) => (
    <g>
      <path d={topShape(d)} fill="#fdfdfd" />
      <Sleeves color="#39405c" long />
      {/* ジャケット本体（前開き） */}
      <path
        d={`M ${CX - 32},202
            C ${CX - 46},208 ${CX - d.bust - 2},${BODY.bust - 22} ${CX - d.bust - 2},${BODY.bust}
            C ${CX - d.bust - 2},${BODY.bust + 22} ${CX - d.waist - 2},${BODY.waist - 14} ${CX - d.waist - 2},${BODY.waist + 10}
            L ${CX - 12},${BODY.waist + 10}
            L ${CX - 16},${BODY.bust - 6}
            Z`}
        fill="#39405c"
      />
      <path
        d={`M ${CX + 32},202
            C ${CX + 46},208 ${CX + d.bust + 2},${BODY.bust - 22} ${CX + d.bust + 2},${BODY.bust}
            C ${CX + d.bust + 2},${BODY.bust + 22} ${CX + d.waist + 2},${BODY.waist - 14} ${CX + d.waist + 2},${BODY.waist + 10}
            L ${CX + 12},${BODY.waist + 10}
            L ${CX + 16},${BODY.bust - 6}
            Z`}
        fill="#39405c"
      />
      {/* 襟 */}
      <path d={`M ${CX - 30},202 L ${CX - 16},${BODY.bust - 6} L ${CX - 4},${BODY.bust - 20} Z`} fill="#4a5273" />
      <path d={`M ${CX + 30},202 L ${CX + 16},${BODY.bust - 6} L ${CX + 4},${BODY.bust - 20} Z`} fill="#4a5273" />
      {/* リボンタイ */}
      <path d={`M ${CX},${BODY.bust - 22} l -16,-7 l 3,15 l 13,3 Z`} fill="#c8404f" />
      <path d={`M ${CX},${BODY.bust - 22} l 16,-7 l -3,15 l -13,3 Z`} fill="#c8404f" />
      <circle cx={CX} cy={BODY.bust - 20} r={3.4} fill="#8f2833" />
      {/* チェックスカート */}
      <path d={skirt(d, BODY.waist + 4, BODY.crotch + 58, 24)} fill="#8a4450" />
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
  hoodie: ({ d }) => (
    <g>
      {/* フード */}
      <path
        d={`M ${CX - 40},214 C ${CX - 34},188 ${CX + 34},188 ${CX + 40},214
            C ${CX + 26},226 ${CX - 26},226 ${CX - 40},214 Z`}
        fill="#d9a8c4"
      />
      <Sleeves color="#e8bcd6" long width={26} />
      <path d={topShape(d, 200, BODY.crotch + 24, 8)} fill="#e8bcd6" />
      {/* 前ポケット */}
      <path
        d={`M ${CX - 30},${BODY.waist + 18} L ${CX + 30},${BODY.waist + 18}
            L ${CX + 26},${BODY.crotch + 12} L ${CX - 26},${BODY.crotch + 12} Z`}
        fill="#d9a8c4"
      />
      {/* 紐 */}
      <g stroke="#fdf6fa" strokeWidth={3} strokeLinecap="round" fill="none">
        <path d={`M ${CX - 8},220 L ${CX - 11},${BODY.bust + 6}`} />
        <path d={`M ${CX + 8},220 L ${CX + 11},${BODY.bust + 6}`} />
      </g>
      {/* 裾のリブ */}
      <rect x={CX - d.waist - 10} y={BODY.crotch + 16} width={(d.waist + 10) * 2} height={9} rx={4} fill="#c996b4" />
      {/* ショートパンツ */}
      <path
        d={`M ${CX - d.hip},${BODY.crotch + 6} L ${CX + d.hip},${BODY.crotch + 6}
            L ${CX + d.hip - 2},${BODY.crotch + 46} L ${CX + 4},${BODY.crotch + 40}
            L ${CX - 4},${BODY.crotch + 40} L ${CX - d.hip + 2},${BODY.crotch + 46} Z`}
        fill="#6d7a99"
      />
    </g>
  ),

  /* ------------------------------ ワンピース ------------------------------ */
  onepiece: ({ d }) => (
    <g>
      <Sleeves color="#f5f0e4" long={false} width={20} />
      <path d={topShape(d, 200, BODY.waist)} fill="#f5f0e4" />
      {/* 襟もと */}
      <path d={`M ${CX - 20},202 C ${CX - 10},226 ${CX + 10},226 ${CX + 20},202`} fill="none" stroke="#ded4bf" strokeWidth={2.4} />
      {/* ウエストリボン */}
      <rect x={CX - d.waist - 3} y={BODY.waist - 8} width={(d.waist + 3) * 2} height={11} fill="#c98fa6" />
      <path d={`M ${CX + d.waist - 4},${BODY.waist - 4} l 16,-8 l -3,16 Z`} fill="#c98fa6" />
      {/* フレアスカート */}
      <path d={skirt(d, BODY.waist + 2, BODY.knee - 16, 34)} fill="#f5f0e4" />
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
  suit: ({ d }) => (
    <g>
      <path d={topShape(d)} fill="#2e2e35" />
      <Sleeves color="#9aa3ad" long />
      <path
        d={`M ${CX - 32},202
            C ${CX - 46},208 ${CX - d.bust - 2},${BODY.bust - 22} ${CX - d.bust - 2},${BODY.bust}
            C ${CX - d.bust - 2},${BODY.bust + 22} ${CX - d.waist - 2},${BODY.waist - 14} ${CX - d.waist - 2},${BODY.waist + 6}
            L ${CX - 14},${BODY.waist + 6}
            L ${CX - 20},${BODY.bust - 8} Z`}
        fill="#9aa3ad"
      />
      <path
        d={`M ${CX + 32},202
            C ${CX + 46},208 ${CX + d.bust + 2},${BODY.bust - 22} ${CX + d.bust + 2},${BODY.bust}
            C ${CX + d.bust + 2},${BODY.bust + 22} ${CX + d.waist + 2},${BODY.waist - 14} ${CX + d.waist + 2},${BODY.waist + 6}
            L ${CX + 14},${BODY.waist + 6}
            L ${CX + 20},${BODY.bust - 8} Z`}
        fill="#9aa3ad"
      />
      <path d={`M ${CX - 30},202 L ${CX - 20},${BODY.bust - 8} L ${CX - 6},${BODY.bust - 24} Z`} fill="#aeb6c0" />
      <path d={`M ${CX + 30},202 L ${CX + 20},${BODY.bust - 8} L ${CX + 6},${BODY.bust - 24} Z`} fill="#aeb6c0" />
      {/* タイトスカート */}
      <path
        d={`M ${CX - d.waist - 2},${BODY.waist + 2}
            L ${CX + d.waist + 2},${BODY.waist + 2}
            C ${CX + d.hip + 3},${BODY.hip} ${CX + d.hip + 1},${BODY.crotch + 40} ${CX + d.hip - 2},${BODY.crotch + 54}
            L ${CX - d.hip + 2},${BODY.crotch + 54}
            C ${CX - d.hip - 1},${BODY.crotch + 40} ${CX - d.hip - 3},${BODY.hip} ${CX - d.waist - 2},${BODY.waist + 2} Z`}
        fill="#9aa3ad"
      />
      <path d={`M ${CX + 10},${BODY.crotch + 20} L ${CX + 10},${BODY.crotch + 54}`} stroke="#7e8791" strokeWidth={1.6} />
    </g>
  ),

  /* ----------------------------- ルームウェア ----------------------------- */
  roomwear: ({ d }) => (
    <g>
      {/* キャミ */}
      <path d={topShape(d, 226, BODY.waist + 14, 0)} fill="#cfe4f5" />
      <g stroke="#cfe4f5" strokeWidth={3} fill="none" strokeLinecap="round">
        <path d={`M ${CX - 20},228 L ${CX - 12},${BODY.neckTop + 30}`} />
        <path d={`M ${CX + 20},228 L ${CX + 12},${BODY.neckTop + 30}`} />
      </g>
      <path d={`M ${CX - 22},232 C ${CX - 10},246 ${CX + 10},246 ${CX + 22},232`} fill="none" stroke="#eaf4fc" strokeWidth={2.4} />
      {/* ショートパンツ */}
      <path
        d={`M ${CX - d.hip},${BODY.hip + 4} L ${CX + d.hip},${BODY.hip + 4}
            L ${CX + d.hip - 3},${BODY.crotch + 34} L ${CX + 4},${BODY.crotch + 28}
            L ${CX - 4},${BODY.crotch + 28} L ${CX - d.hip + 3},${BODY.crotch + 34} Z`}
        fill="#cfe4f5"
      />
      {/* もこもこカーディガン */}
      <Sleeves color="#f2e6cf" long width={30} />
      <path
        d={`M ${CX - 34},200
            C ${CX - 50},208 ${CX - d.bust - 8},${BODY.bust - 20} ${CX - d.bust - 8},${BODY.bust + 6}
            C ${CX - d.bust - 8},${BODY.bust + 40} ${CX - d.waist - 10},${BODY.waist + 10} ${CX - d.waist - 12},${BODY.crotch + 20}
            L ${CX - 10},${BODY.crotch + 20}
            L ${CX - 14},${BODY.bust - 4} Z`}
        fill="#f2e6cf"
      />
      <path
        d={`M ${CX + 34},200
            C ${CX + 50},208 ${CX + d.bust + 8},${BODY.bust - 20} ${CX + d.bust + 8},${BODY.bust + 6}
            C ${CX + d.bust + 8},${BODY.bust + 40} ${CX + d.waist + 10},${BODY.waist + 10} ${CX + d.waist + 12},${BODY.crotch + 20}
            L ${CX + 10},${BODY.crotch + 20}
            L ${CX + 14},${BODY.bust - 4} Z`}
        fill="#f2e6cf"
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
  knit: ({ d }) => (
    <g>
      <Sleeves color="#d8b8a0" long width={26} />
      <path d={topShape(d, 198, BODY.crotch + 26, 9)} fill="#d8b8a0" />
      {/* 襟のリブ */}
      <path d={`M ${CX - 26},202 C ${CX - 14},222 ${CX + 14},222 ${CX + 26},202`} fill="none" stroke="#c2a086" strokeWidth={7} strokeLinecap="round" />
      {/* 編み目 */}
      <g stroke="#c2a086" strokeWidth={1.2} opacity={0.6}>
        {[-30, -18, -6, 6, 18, 30].map((o) => (
          <path key={o} d={`M ${CX + o},${BODY.bust - 10} L ${CX + o},${BODY.crotch + 20}`} />
        ))}
      </g>
      <rect x={CX - d.waist - 11} y={BODY.crotch + 18} width={(d.waist + 11) * 2} height={11} rx={5} fill="#c2a086" />
    </g>
  ),

  /* -------------------------------- 浴衣 -------------------------------- */
  yukata: ({ d }) => (
    <g>
      <Sleeves color="#4a6fa8" long={false} width={30} />
      {/* たもと */}
      <path d={`M ${CX - d.bust - 12},${BODY.bust - 4} l -12,58 l 26,6 l 4,-58 Z`} fill="#4a6fa8" />
      <path d={`M ${CX + d.bust + 12},${BODY.bust - 4} l 12,58 l -26,6 l -4,-58 Z`} fill="#4a6fa8" />
      {/* 身頃 */}
      <path d={topShape(d, 200, BODY.waist + 4, 4)} fill="#5d84be" />
      {/* 打ち合わせ */}
      <path d={`M ${CX - 30},200 L ${CX + 6},${BODY.waist + 4} L ${CX - d.waist - 4},${BODY.waist + 4} Z`} fill="#4a6fa8" />
      <path d={`M ${CX - 30},200 L ${CX + 8},${BODY.bust + 4} L ${CX + 2},${BODY.bust + 12} L ${CX - 36},204 Z`} fill="#f0f2f7" />
      <path d={`M ${CX + 30},200 L ${CX - 4},${BODY.bust + 8} L ${CX + 2},${BODY.bust + 16} L ${CX + 36},204 Z`} fill="#f7f9fc" />
      {/* 帯 */}
      <rect x={CX - d.waist - 5} y={BODY.waist - 10} width={(d.waist + 5) * 2} height={26} fill="#d9536a" />
      <rect x={CX - d.waist - 5} y={BODY.waist - 2} width={(d.waist + 5) * 2} height={5} fill="#f0c26a" />
      <path d={`M ${CX + d.waist},${BODY.waist - 6} l 20,-10 l -4,20 l 16,6 l -22,4 Z`} fill="#e0687d" />
      {/* 裾 */}
      <path
        d={`M ${CX - d.waist - 5},${BODY.waist + 14}
            L ${CX + d.waist + 5},${BODY.waist + 14}
            C ${CX + d.hip + 6},${BODY.hip + 40} ${CX + d.hip + 2},${BODY.knee + 30} ${CX + d.hip - 4},${BODY.knee + 54}
            L ${CX - d.hip + 4},${BODY.knee + 54}
            C ${CX - d.hip - 2},${BODY.knee + 30} ${CX - d.hip - 6},${BODY.hip + 40} ${CX - d.waist - 5},${BODY.waist + 14} Z`}
        fill="#5d84be"
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
      <path d={topShape(d, 228, BODY.waist + 16, 0)} fill="#f7eef2" />
      <g stroke="#f7eef2" strokeWidth={3} fill="none" strokeLinecap="round">
        <path d={`M ${CX - 20},230 L ${CX - 12},${BODY.neckTop + 32}`} />
        <path d={`M ${CX + 20},230 L ${CX + 12},${BODY.neckTop + 32}`} />
      </g>
      <path d={`M ${CX - 24},234 C ${CX - 12},250 ${CX + 12},250 ${CX + 24},234`} fill="none" stroke="#e6d2da" strokeWidth={2.6} />
      {/* デニムショートパンツ */}
      <path
        d={`M ${CX - d.hip - 1},${BODY.hip}
            L ${CX + d.hip + 1},${BODY.hip}
            L ${CX + d.hip - 2},${BODY.crotch + 40} L ${CX + 4},${BODY.crotch + 34}
            L ${CX - 4},${BODY.crotch + 34} L ${CX - d.hip + 2},${BODY.crotch + 40} Z`}
        fill="#5f7ba3"
      />
      <path d={`M ${CX - d.hip - 1},${BODY.hip + 8} L ${CX + d.hip + 1},${BODY.hip + 8}`} stroke="#405672" strokeWidth={2} />
      <g stroke="#e0c98a" strokeWidth={1} opacity={0.7} fill="none">
        <path d={`M ${CX - d.hip + 6},${BODY.crotch + 36} L ${CX - 6},${BODY.crotch + 30}`} />
        <path d={`M ${CX + d.hip - 6},${BODY.crotch + 36} L ${CX + 6},${BODY.crotch + 30}`} />
      </g>
    </g>
  ),
};

export function Outfit({ variant, d, skin }: { variant: string; d: FigureDims; skin: ColorOption }) {
  const render = OUTFITS[variant] ?? OUTFITS.sailor;
  return <g>{render({ d, skin })}</g>;
}
