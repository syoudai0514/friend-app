import type { ColorOption } from "@/lib/types";
import { FACE } from "./geometry";

/* ------------------------------- 目 ------------------------------- */

interface EyeShape {
  /** 白目の輪郭 */
  sclera: string;
  /** 上まつげ */
  lash: string;
  /** 瞳の縦倍率 */
  irisY?: number;
  /** 瞳の横オフセット */
  irisDx?: number;
  /** 閉じ目なら曲線だけ描く */
  closedArc?: string;
  /** 上まぶたで隠す量（じと目・ねむたげ用） */
  lidCover?: number;
}

const EYE_SHAPES: Record<string, EyeShape> = {
  round: {
    sclera: "M -14,1 C -13,-11 -6,-17 1,-17 C 10,-17 16,-9 16,2 C 16,12 8,17 0,17 C -8,17 -14,11 -14,1 Z",
    lash: "M -15,-1 C -13,-13 -5,-19 2,-19 C 12,-19 17,-10 18,1",
  },
  droopy: {
    sclera: "M -14,-2 C -13,-12 -6,-17 1,-17 C 10,-17 16,-8 15,5 C 14,14 7,18 -1,17 C -9,16 -14,9 -14,-2 Z",
    lash: "M -15,-4 C -13,-14 -5,-19 2,-19 C 12,-19 18,-8 17,5",
    irisY: 0.96,
  },
  sharp: {
    sclera: "M -14,4 C -13,-8 -6,-15 1,-15 C 11,-15 17,-11 17,-4 C 17,8 9,17 0,17 C -8,17 -14,12 -14,4 Z",
    lash: "M -15,2 C -13,-10 -5,-17 2,-17 C 13,-17 19,-13 19,-6",
    irisY: 0.96,
  },
  half: {
    sclera: "M -14,1 C -13,-11 -6,-17 1,-17 C 10,-17 16,-9 16,2 C 16,12 8,17 0,17 C -8,17 -14,11 -14,1 Z",
    lash: "M -15,-1 C -13,-9 -5,-12 2,-12 C 12,-12 17,-6 18,1",
    lidCover: 8,
    irisY: 0.8,
  },
  sleepy: {
    sclera: "M -14,0 C -13,-10 -6,-15 1,-15 C 10,-15 16,-8 16,2 C 16,11 8,16 0,16 C -8,16 -14,10 -14,0 Z",
    lash: "M -15,-2 C -13,-11 -5,-15 2,-15 C 12,-15 17,-8 18,0",
    lidCover: 5,
    irisY: 0.88,
  },
  closed: {
    sclera: "",
    lash: "",
    closedArc: "M -14,4 C -9,-8 8,-8 14,3",
  },
};

function Eye({
  shape,
  eye,
  lashColor,
  skin,
  uid,
}: {
  shape: EyeShape;
  eye: ColorOption;
  lashColor: string;
  skin: ColorOption;
  uid: string;
}) {
  if (shape.closedArc) {
    return (
      <path
        d={shape.closedArc}
        fill="none"
        stroke={lashColor}
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  }

  const irisY = shape.irisY ?? 1;
  const dx = shape.irisDx ?? 0.5;
  const clipId = `eyeclip-${uid}`;
  const gradId = `iris-${uid}`;

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path d={shape.sclera} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={eye.dark} />
          <stop offset="55%" stopColor={eye.value} />
          <stop offset="100%" stopColor={eye.light} />
        </linearGradient>
      </defs>

      <path d={shape.sclera} fill="#fdfbff" />

      <g clipPath={`url(#${clipId})`}>
        {/* 虹彩 */}
        <ellipse cx={dx} cy={0} rx={10.5} ry={13 * irisY} fill={`url(#${gradId})`} />
        <ellipse cx={dx} cy={2} rx={7.5} ry={9 * irisY} fill={eye.value} opacity={0.55} />
        {/* 瞳孔 */}
        <ellipse cx={dx} cy={0} rx={4.4} ry={6.4 * irisY} fill="#2b2334" />
        {/* ハイライト */}
        <circle cx={dx - 4.5} cy={-6} r={3.6} fill="#ffffff" />
        <circle cx={dx + 4} cy={5.5} r={2} fill="#ffffff" opacity={0.75} />
        {/* 上まぶたの影 */}
        <path d="M -16,-18 L 16,-18 L 16,-9 C 8,-13 -8,-13 -16,-9 Z" fill="#000000" opacity={0.14} />
        {/* じと目・ねむたげのまぶた */}
        {shape.lidCover ? (
          <rect x={-18} y={-20} width={36} height={20 - (13 - shape.lidCover)} fill={skin.value} opacity={0.98} />
        ) : null}
      </g>

      <path d={shape.lash} fill="none" stroke={lashColor} strokeWidth={4.6} strokeLinecap="round" />
      {/* 下まぶた */}
      <path
        d="M -12,11 C -7,16 7,16 13,9"
        fill="none"
        stroke={lashColor}
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={0.65}
      />
    </>
  );
}

export function Eyes({
  variant,
  eye,
  lashColor,
  skin,
  uid,
}: {
  variant: string;
  eye: ColorOption;
  lashColor: string;
  skin: ColorOption;
  uid: string;
}) {
  const shape = EYE_SHAPES[variant] ?? EYE_SHAPES.round;
  const props = { shape, eye, lashColor, skin, uid };
  return (
    <g>
      <g transform={`translate(${FACE.left + 50 + FACE.eyeDx}, ${FACE.eyeY})`}>
        <Eye {...props} />
      </g>
      <g transform={`translate(${FACE.left + 50 - FACE.eyeDx}, ${FACE.eyeY}) scale(-1,1)`}>
        <Eye {...props} />
      </g>
    </g>
  );
}

/* ------------------------------ まゆげ ------------------------------ */

const BROW_SHAPES: Record<string, { d: string; w: number }> = {
  soft: { d: "M -11,2 C -6,-2 5,-3 11,0", w: 3.2 },
  arch: { d: "M -11,3 C -6,-5 5,-5 11,1", w: 3.2 },
  sharp: { d: "M -11,4 C -5,-1 5,-4 11,-4", w: 3.4 },
  droopy: { d: "M -11,-2 C -5,-2 5,2 11,5", w: 3.2 },
  thick: { d: "M -11,2 C -6,-3 5,-4 11,0", w: 5.4 },
};

export function Brows({ variant, color }: { variant: string; color: string }) {
  const s = BROW_SHAPES[variant] ?? BROW_SHAPES.soft;
  return (
    <g stroke={color} strokeWidth={s.w} strokeLinecap="round" fill="none" opacity={0.9}>
      <path d={s.d} transform={`translate(${FACE.left + 50 + 24}, ${FACE.browY})`} />
      <path d={s.d} transform={`translate(${FACE.left + 50 - 24}, ${FACE.browY}) scale(-1,1)`} />
    </g>
  );
}

/* -------------------------------- 鼻 -------------------------------- */

export function Nose({ variant, skin }: { variant: string; skin: ColorOption }) {
  if (variant === "none") return null;
  if (variant === "line") {
    return (
      <path
        d={`M ${FACE.left + 50},${FACE.noseY - 5} L ${FACE.left + 50},${FACE.noseY + 2}`}
        stroke={skin.dark}
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={0.7}
      />
    );
  }
  return (
    <ellipse
      cx={FACE.left + 50}
      cy={FACE.noseY}
      rx={1.9}
      ry={2.6}
      fill={skin.dark}
      opacity={0.6}
    />
  );
}

/* -------------------------------- 口 -------------------------------- */

export function Mouth({ variant }: { variant: string }) {
  const y = FACE.mouthY;
  const x = FACE.left + 50;
  const lip = "#d1607c";

  switch (variant) {
    case "open":
      return (
        <g transform={`translate(${x},${y})`}>
          <path d="M -9,-2 C -4,-4 4,-4 9,-2 C 8,7 4,12 0,12 C -4,12 -8,7 -9,-2 Z" fill="#b8455f" />
          <path d="M -6,5 C -3,3 3,3 6,5 C 5,10 3,11 0,11 C -3,11 -5,10 -6,5 Z" fill="#f08fa4" />
          <path d="M -9,-2 C -4,-4 4,-4 9,-2" fill="none" stroke={lip} strokeWidth={1.6} strokeLinecap="round" />
        </g>
      );
    case "cat":
      return (
        <path
          d={`M ${x - 9},${y + 1} C ${x - 6},${y - 4} ${x - 3},${y - 4} ${x},${y} C ${x + 3},${y - 4} ${x + 6},${y - 4} ${x + 9},${y + 1}`}
          fill="none"
          stroke={lip}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      );
    case "pout":
      return <ellipse cx={x} cy={y + 1} rx={4.2} ry={5} fill="#d9738c" />;
    case "calm":
      return (
        <path
          d={`M ${x - 7},${y} C ${x - 3},${y + 1.5} ${x + 3},${y + 1.5} ${x + 7},${y}`}
          fill="none"
          stroke={lip}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      );
    case "surprised":
      return (
        <g>
          <ellipse cx={x} cy={y + 1} rx={5} ry={7} fill="#b8455f" />
          <ellipse cx={x} cy={y + 4} rx={3} ry={3.4} fill="#f08fa4" />
        </g>
      );
    case "smile":
    default:
      return (
        <path
          d={`M ${x - 8},${y - 1} C ${x - 4},${y + 5} ${x + 4},${y + 5} ${x + 8},${y - 1}`}
          fill="none"
          stroke={lip}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      );
  }
}

/* ------------------------------ メイク ------------------------------ */

const BLUSH_OPACITY: Record<string, number> = {
  none: 0,
  light: 0.22,
  cheek: 0.4,
  glossy: 0.32,
  hot: 0.62,
};

export function Makeup({ variant, uid }: { variant: string; uid: string }) {
  const op = BLUSH_OPACITY[variant] ?? 0;
  if (op === 0) return null;
  const y = FACE.cheekY;
  const x = FACE.left + 50;
  const gradId = `blush-${uid}`;

  return (
    <g>
      <defs>
        <radialGradient id={gradId}>
          <stop offset="0%" stopColor="#ff7d9c" stopOpacity={op} />
          <stop offset="100%" stopColor="#ff7d9c" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x - FACE.cheekDx} cy={y} rx={15} ry={9} fill={`url(#${gradId})`} />
      <ellipse cx={x + FACE.cheekDx} cy={y} rx={15} ry={9} fill={`url(#${gradId})`} />
      {variant === "glossy" && (
        <>
          <ellipse cx={x} cy={FACE.mouthY + 1} rx={4} ry={1.6} fill="#ffffff" opacity={0.5} />
          <ellipse cx={x + 12} cy={FACE.eyeY - 20} rx={7} ry={2.4} fill="#ffffff" opacity={0.25} />
        </>
      )}
      {variant === "hot" && (
        <g stroke="#ff8ba5" strokeWidth={1.2} strokeLinecap="round" opacity={0.55}>
          <path d={`M ${x - 40},${y - 5} L ${x - 28},${y - 5}`} />
          <path d={`M ${x - 40},${y} L ${x - 28},${y}`} />
          <path d={`M ${x + 28},${y - 5} L ${x + 40},${y - 5}`} />
          <path d={`M ${x + 28},${y} L ${x + 40},${y}`} />
        </g>
      )}
    </g>
  );
}

/* ------------------------------ めがね ------------------------------ */

export function Glasses({ variant }: { variant: string }) {
  if (variant === "none") return null;
  const x = FACE.left + 50;
  const y = FACE.eyeY;
  const dx = FACE.eyeDx;

  if (variant === "heart") {
    const heart = (cx: number) =>
      `M ${cx},${y + 10} C ${cx - 16},${y - 2} ${cx - 14},${y - 14} ${cx - 6},${y - 14}
       C ${cx - 2},${y - 14} ${cx},${y - 10} ${cx},${y - 8}
       C ${cx},${y - 10} ${cx + 2},${y - 14} ${cx + 6},${y - 14}
       C ${cx + 14},${y - 14} ${cx + 16},${y - 2} ${cx},${y + 10} Z`;
    return (
      <g>
        <path d={heart(x - dx)} fill="#ff9ab5" opacity={0.72} stroke="#e0708f" strokeWidth={1.6} />
        <path d={heart(x + dx)} fill="#ff9ab5" opacity={0.72} stroke="#e0708f" strokeWidth={1.6} />
        <path d={`M ${x - 8},${y - 6} L ${x + 8},${y - 6}`} stroke="#e0708f" strokeWidth={2} />
      </g>
    );
  }

  const rx = variant === "round" ? 15 : 17;
  const ry = variant === "round" ? 15 : 12;
  const frame = "#5b5b6b";

  return (
    <g fill="rgba(255,255,255,.16)" stroke={frame} strokeWidth={2.2}>
      {variant === "round" ? (
        <>
          <circle cx={x - dx} cy={y} r={rx} />
          <circle cx={x + dx} cy={y} r={rx} />
        </>
      ) : (
        <>
          <rect x={x - dx - rx} y={y - ry} width={rx * 2} height={ry * 2} rx={5} />
          <rect x={x + dx - rx} y={y - ry} width={rx * 2} height={ry * 2} rx={5} />
        </>
      )}
      <path d={`M ${x - dx + rx},${y} L ${x + dx - rx},${y}`} />
      <path d={`M ${x - dx - rx},${y - 2} L ${FACE.left - 2},${y + 4}`} fill="none" />
      <path d={`M ${x + dx + rx},${y - 2} L ${FACE.right + 2},${y + 4}`} fill="none" />
    </g>
  );
}

/* ------------------------------ ピアス ------------------------------ */

export function Earrings({ variant }: { variant: string }) {
  if (variant === "none") return null;
  const y = FACE.eyeY + 22;
  const lx = FACE.left + 2;
  const rx = FACE.right - 2;

  const one = (cx: number, key: string) => {
    switch (variant) {
      case "pearl":
        return (
          <g key={key}>
            <circle cx={cx} cy={y} r={3.4} fill="#fdf6ee" stroke="#d9cbb8" strokeWidth={0.8} />
            <circle cx={cx - 1} cy={y - 1} r={1.1} fill="#ffffff" />
          </g>
        );
      case "hoop":
        return (
          <circle key={key} cx={cx} cy={y + 4} r={5.5} fill="none" stroke="#e0c060" strokeWidth={1.8} />
        );
      case "heart":
      default:
        return (
          <path
            key={key}
            d={`M ${cx},${y + 6} C ${cx - 6},${y} ${cx - 5},${y - 5} ${cx - 2},${y - 5}
                C ${cx - 0.5},${y - 5} ${cx},${y - 3} ${cx},${y - 2}
                C ${cx},${y - 3} ${cx + 0.5},${y - 5} ${cx + 2},${y - 5}
                C ${cx + 5},${y - 5} ${cx + 6},${y} ${cx},${y + 6} Z`}
            fill="#ef6f92"
          />
        );
    }
  };

  return (
    <g>
      {one(lx, "l")}
      {one(rx, "r")}
    </g>
  );
}
