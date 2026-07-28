import type { ColorOption } from "@/lib/types";
import { FACE } from "./geometry";
import { hi, ink, mix, shade1 } from "./palette";

const CXF = FACE.left + 50;

/* ============================================================================
 *  目
 *  アニメ塗りの定石にそって、下から順に
 *  白目 → 虹彩のグラデ → 反射光 → 瞳孔 → 虹彩の輪郭 → まぶたの落ち影
 *  → ハイライト → 上まつげ（塗りつぶし）→ 目尻のまつげ → 二重線 → 下まつげ
 *  の順で重ねている。
 * ========================================================================== */

interface EyeShape {
  /** 白目の輪郭 */
  sclera: string;
  /** 上まつげ（線ではなく面で描く。ここが絵の印象をいちばん左右する） */
  lash: string;
  /** 二重のライン */
  crease?: string;
  /** 下まつげ */
  lower?: string;
  /** 目尻のまつげ */
  spikes?: string[];
  /** 瞳の縦の潰れ具合 */
  irisY?: number;
  /** 瞳の縦位置 */
  irisDy?: number;
  /** 上まぶたで隠す高さ */
  lidCover?: number;
  /** 閉じ目のときはこの曲線だけ描く */
  closedArc?: string;
}

const EYE_SHAPES: Record<string, EyeShape> = {
  round: {
    sclera: "M -16,0 C -15,-13 -7,-19 2,-19 C 12,-19 17,-11 17,1 C 17,12 9,18 0,18 C -9,18 -16,11 -16,0 Z",
    lash: `M -17,-2 C -16,-16 -7,-23 3,-23 C 13,-23 20,-16 23,-8
           L 18,-6 C 15,-13 11,-17 3,-17 C -6,-17 -13,-11 -14,-1 Z`,
    crease: "M -12,-10 C -8,-18 5,-21 15,-15",
    lower: "M -12,11 C -6,17 8,17 15,8",
    spikes: [
      "M 18,-8 C 22,-13 26,-16 29,-18 C 26,-14 23,-10 21,-5 Z",
      "M 11,-16 C 14,-21 17,-24 19,-26 C 17,-22 15,-19 14,-15 Z",
    ],
  },
  droopy: {
    sclera: "M -16,-3 C -15,-14 -7,-19 2,-19 C 12,-19 17,-10 16,4 C 15,14 7,19 -2,18 C -11,17 -16,9 -16,-3 Z",
    lash: `M -17,-5 C -16,-17 -7,-23 3,-23 C 14,-23 21,-13 21,3
           L 16,3 C 16,-11 11,-17 3,-17 C -6,-17 -13,-12 -14,-4 Z`,
    crease: "M -12,-12 C -8,-19 5,-21 15,-13",
    lower: "M -12,9 C -6,16 6,18 14,11",
    spikes: [
      "M 18,-2 C 23,-5 27,-7 30,-8 C 26,-5 23,-1 21,3 Z",
      "M 13,-14 C 16,-19 19,-22 21,-24 C 19,-20 17,-17 16,-13 Z",
    ],
    irisY: 0.97,
    irisDy: 1,
  },
  sharp: {
    sclera: "M -16,3 C -15,-9 -7,-16 2,-16 C 13,-16 18,-11 18,-4 C 18,9 9,18 0,18 C -9,18 -16,12 -16,3 Z",
    lash: `M -17,1 C -16,-13 -7,-20 3,-20 C 15,-20 22,-14 25,-7
           L 20,-5 C 17,-12 12,-15 3,-15 C -6,-15 -13,-9 -14,2 Z`,
    crease: "M -12,-7 C -8,-16 6,-20 17,-13",
    lower: "M -12,12 C -6,17 8,16 16,6",
    spikes: [
      "M 20,-6 C 25,-12 29,-16 32,-19 C 28,-14 25,-10 23,-4 Z",
      "M 12,-14 C 16,-20 19,-23 21,-25 C 19,-21 17,-18 16,-13 Z",
    ],
    irisY: 0.95,
  },
  half: {
    sclera: "M -16,0 C -15,-13 -7,-19 2,-19 C 12,-19 17,-11 17,1 C 17,12 9,18 0,18 C -9,18 -16,11 -16,0 Z",
    lash: `M -17,-1 C -16,-10 -7,-15 3,-15 C 13,-15 20,-10 23,-4
           L 18,-2 C 15,-7 11,-10 3,-10 C -6,-10 -13,-6 -14,0 Z`,
    lower: "M -12,11 C -6,17 8,17 15,8",
    spikes: ["M 19,-3 C 23,-7 27,-10 30,-12 C 26,-8 23,-5 21,-1 Z"],
    lidCover: 9,
    irisY: 0.8,
    irisDy: 2,
  },
  sleepy: {
    sclera: "M -16,0 C -15,-12 -7,-17 2,-17 C 12,-17 17,-10 17,1 C 17,11 9,17 0,17 C -9,17 -16,10 -16,0 Z",
    lash: `M -17,-2 C -16,-13 -7,-19 3,-19 C 13,-19 20,-13 22,-6
           L 17,-4 C 14,-10 11,-13 3,-13 C -6,-13 -13,-8 -14,-1 Z`,
    crease: "M -11,-9 C -7,-15 5,-17 14,-12",
    lower: "M -12,10 C -6,16 8,16 15,7",
    lidCover: 5,
    irisY: 0.9,
    irisDy: 1,
  },
  closed: {
    sclera: "",
    lash: "",
    closedArc: "M -15,4 C -9,-11 9,-11 15,3",
    spikes: [
      "M 14,1 C 19,-3 23,-5 26,-6 C 22,-3 19,1 17,5 Z",
      "M 6,-8 C 9,-13 12,-15 14,-16 C 12,-12 11,-9 10,-5 Z",
    ],
  },
  /* まばたき用。にっこり目と違って、まぶたが素直に下りた形にする。
     カタログには出さず、内部でだけ使う */
  blink: {
    sclera: "",
    lash: "",
    closedArc: "M -15,-2 C -9,6 9,6 16,-3",
    spikes: [
      "M 15,-4 C 20,-7 24,-9 27,-10 C 23,-7 20,-3 18,1 Z",
      "M 7,1 C 10,-3 13,-5 15,-6 C 13,-2 12,1 11,4 Z",
    ],
  },
};

function Eye({
  shape,
  eye,
  lash,
  skin,
  uid,
}: {
  shape: EyeShape;
  eye: ColorOption;
  lash: string;
  skin: ColorOption;
  uid: string;
}) {
  if (shape.closedArc) {
    return (
      <g>
        <path d={shape.closedArc} fill="none" stroke={lash} strokeWidth={4.6} strokeLinecap="round" />
        {shape.spikes?.map((d, i) => (
          <path key={i} d={d} fill={lash} />
        ))}
      </g>
    );
  }

  const sy = shape.irisY ?? 1;
  const dy = shape.irisDy ?? 0;
  const clip = `sc-${uid}`;
  const iris = `ir-${uid}`;
  const white = `wh-${uid}`;
  const pupil = mix(eye.dark, "#241a2b", 0.6);

  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <path d={shape.sclera} />
        </clipPath>
        <linearGradient id={white} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mix("#ffffff", eye.value, 0.16)} />
          <stop offset="55%" stopColor="#fdfcff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={iris} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mix(eye.dark, "#1e1526", 0.35)} />
          <stop offset="38%" stopColor={eye.dark} />
          <stop offset="70%" stopColor={eye.value} />
          <stop offset="100%" stopColor={hi(eye.light, 0.35)} />
        </linearGradient>
      </defs>

      <path d={shape.sclera} fill={`url(#${white})`} />

      <g clipPath={`url(#${clip})`}>
        {/* 虹彩 */}
        <ellipse cx={0} cy={dy} rx={11.5} ry={14 * sy} fill={`url(#${iris})`} />
        {/* 下側の反射光 */}
        <ellipse cx={0} cy={dy + 7 * sy} rx={8} ry={5 * sy} fill={hi(eye.light, 0.45)} opacity={0.9} />
        <ellipse cx={0} cy={dy + 9 * sy} rx={4.5} ry={2.6 * sy} fill="#ffffff" opacity={0.55} />
        {/* 瞳孔 */}
        <ellipse cx={0} cy={dy} rx={4.8} ry={6.8 * sy} fill={pupil} />
        {/* 虹彩の輪郭 */}
        <ellipse
          cx={0}
          cy={dy}
          rx={11.5}
          ry={14 * sy}
          fill="none"
          stroke={mix(eye.dark, "#2a1b30", 0.45)}
          strokeWidth={1.7}
        />
        {/* まぶたの落ち影 */}
        <path d="M -19,-22 L 19,-22 L 19,-5 C 11,-12 -11,-12 -19,-5 Z" fill="#2a1b26" opacity={0.22} />
        {/* じと目・ねむたげのまぶた */}
        {shape.lidCover ? (
          <g>
            <rect x={-19} y={-24} width={38} height={24 - (19 - shape.lidCover)} fill={skin.value} />
            <rect
              x={-19}
              y={-24 + (24 - (19 - shape.lidCover)) - 3}
              width={38}
              height={3}
              fill={shade1(skin.value)}
              opacity={0.6}
            />
          </g>
        ) : null}
        {/* ハイライト */}
        <circle cx={-5.5} cy={dy - 7 * sy} r={4.4} fill="#ffffff" />
        <circle cx={5.5} cy={dy + 5 * sy} r={2.3} fill="#ffffff" opacity={0.9} />
        <circle cx={7} cy={dy - 9 * sy} r={1.4} fill="#ffffff" opacity={0.75} />
      </g>

      {/* 二重 */}
      {shape.crease && (
        <path
          d={shape.crease}
          fill="none"
          stroke={mix(lash, skin.value, 0.35)}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.6}
        />
      )}

      {/* 上まつげ */}
      <path d={shape.lash} fill={lash} />
      {shape.spikes?.map((d, i) => (
        <path key={i} d={d} fill={lash} />
      ))}

      {/* 下まつげ */}
      {shape.lower && (
        <path
          d={shape.lower}
          fill="none"
          stroke={mix(lash, skin.value, 0.25)}
          strokeWidth={1.9}
          strokeLinecap="round"
          opacity={0.8}
        />
      )}
    </g>
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
  const lash = mix(lashColor, "#33202e", 0.55);
  return (
    <g>
      <g transform={`translate(${CXF + FACE.eyeDx}, ${FACE.eyeY})`}>
        <Eye shape={shape} eye={eye} lash={lash} skin={skin} uid={`${uid}r`} />
      </g>
      <g transform={`translate(${CXF - FACE.eyeDx}, ${FACE.eyeY}) scale(-1,1)`}>
        <Eye shape={shape} eye={eye} lash={lash} skin={skin} uid={`${uid}l`} />
      </g>
    </g>
  );
}

/* ============================================================================
 *  まゆげ（線ではなく、先が細くなる面で描く）
 * ========================================================================== */

const BROW_SHAPES: Record<string, string> = {
  soft: "M -12,2 C -7,-2 5,-3 12,1 L 11,4.2 C 5,0.8 -6,1.8 -11,5.2 Z",
  arch: "M -12,3 C -7,-5 5,-5 12,1 L 10,4 C 4,-1 -6,-1 -11,6 Z",
  sharp: "M -12,4 C -6,-1 5,-4 12,-4 L 12,-0.6 C 5,-0.6 -5,2.2 -11,7 Z",
  droopy: "M -12,-3 C -6,-3 5,2 12,5 L 11,8 C 4,5 -6,0.4 -11,0.4 Z",
  thick: "M -12,1 C -7,-4 5,-5 12,0 L 10,5.6 C 4,1.4 -6,2.4 -11,6.4 Z",
};

export function Brows({ variant, color }: { variant: string; color: string }) {
  const d = BROW_SHAPES[variant] ?? BROW_SHAPES.soft;
  const c = mix(color, "#3a2836", 0.35);
  return (
    <g fill={c} opacity={0.92}>
      <path d={d} transform={`translate(${CXF + 24}, ${FACE.browY})`} />
      <path d={d} transform={`translate(${CXF - 24}, ${FACE.browY}) scale(-1,1)`} />
    </g>
  );
}

/* ============================================================================
 *  鼻
 * ========================================================================== */

export function Nose({ variant, skin }: { variant: string; skin: ColorOption }) {
  if (variant === "none") return null;
  const c = ink(skin.value, 0.35);

  if (variant === "line") {
    return (
      <g>
        <path
          d={`M ${CXF + 1},${FACE.noseY - 7} C ${CXF + 1.5},${FACE.noseY - 2} ${CXF + 1},${FACE.noseY + 1} ${CXF - 1},${FACE.noseY + 2}`}
          fill="none"
          stroke={c}
          strokeWidth={1.7}
          strokeLinecap="round"
          opacity={0.75}
        />
        <ellipse cx={CXF + 1} cy={FACE.noseY - 4} rx={3} ry={4} fill="#ffffff" opacity={0.28} />
      </g>
    );
  }

  return (
    <g>
      <path
        d={`M ${CXF - 1.6},${FACE.noseY - 3} C ${CXF + 1},${FACE.noseY - 1} ${CXF + 1.4},${FACE.noseY + 2} ${CXF - 1},${FACE.noseY + 2.6} Z`}
        fill={c}
        opacity={0.7}
      />
      <ellipse cx={CXF + 0.5} cy={FACE.noseY - 5} rx={3} ry={3.6} fill="#ffffff" opacity={0.25} />
    </g>
  );
}

/* ============================================================================
 *  口
 * ========================================================================== */

export function Mouth({ variant }: { variant: string }) {
  const y = FACE.mouthY;
  const x = CXF;
  const line = "#c05a76";
  const inner = "#a83a56";
  const tongue = "#ef8fa6";

  switch (variant) {
    case "open":
      return (
        <g transform={`translate(${x},${y})`}>
          <path d="M -9.5,-2 C -4,-4.4 4,-4.4 9.5,-2 C 8.5,7.5 4,12.5 0,12.5 C -4,12.5 -8.5,7.5 -9.5,-2 Z" fill={inner} />
          <path d="M -6,5 C -3,3 3,3 6,5 C 5,10.5 3,11.5 0,11.5 C -3,11.5 -5,10.5 -6,5 Z" fill={tongue} />
          <path d="M -9.5,-2 C -4,-4.4 4,-4.4 9.5,-2" fill="none" stroke={line} strokeWidth={1.7} strokeLinecap="round" />
          <ellipse cx={-2} cy={-3.4} rx={3} ry={1} fill="#ffffff" opacity={0.45} />
        </g>
      );
    case "cat":
      return (
        <path
          d={`M ${x - 9},${y + 1} C ${x - 6},${y - 4.5} ${x - 3},${y - 4.5} ${x},${y}
              C ${x + 3},${y - 4.5} ${x + 6},${y - 4.5} ${x + 9},${y + 1}`}
          fill="none"
          stroke={line}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      );
    case "pout":
      return (
        <g>
          <ellipse cx={x} cy={y + 1} rx={4.4} ry={5.2} fill={mix(line, inner, 0.4)} />
          <ellipse cx={x - 1} cy={y - 0.5} rx={1.8} ry={1.6} fill="#ffffff" opacity={0.4} />
        </g>
      );
    case "calm":
      return (
        <path
          d={`M ${x - 7.5},${y} C ${x - 3},${y + 1.8} ${x + 3},${y + 1.8} ${x + 7.5},${y}`}
          fill="none"
          stroke={line}
          strokeWidth={2.3}
          strokeLinecap="round"
        />
      );
    case "surprised":
      return (
        <g>
          <ellipse cx={x} cy={y + 1} rx={5.2} ry={7.2} fill={inner} />
          <ellipse cx={x} cy={y + 4.5} rx={3.2} ry={3.4} fill={tongue} />
          <ellipse cx={x - 1.5} cy={y - 3} rx={2.2} ry={1.2} fill="#ffffff" opacity={0.4} />
        </g>
      );
    case "smile":
    default:
      return (
        <g>
          <path
            d={`M ${x - 8.5},${y - 1.5} C ${x - 4},${y + 5} ${x + 4},${y + 5} ${x + 8.5},${y - 1.5}`}
            fill="none"
            stroke={line}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <path
            d={`M ${x - 5},${y + 2.6} C ${x - 2},${y + 4.6} ${x + 2},${y + 4.6} ${x + 5},${y + 2.6}`}
            fill="none"
            stroke={tongue}
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0.6}
          />
        </g>
      );
  }
}

/* ============================================================================
 *  メイク
 * ========================================================================== */

const BLUSH: Record<string, number> = {
  none: 0,
  light: 0.28,
  cheek: 0.48,
  glossy: 0.36,
  hot: 0.7,
};

export function Makeup({ variant, uid }: { variant: string; uid: string }) {
  const op = BLUSH[variant] ?? 0;
  if (op === 0) return null;
  const y = FACE.cheekY;
  const x = CXF;
  const g = `blush-${uid}`;

  return (
    <g>
      <defs>
        <radialGradient id={g}>
          <stop offset="0%" stopColor="#ff6f92" stopOpacity={op} />
          <stop offset="60%" stopColor="#ff7d9c" stopOpacity={op * 0.55} />
          <stop offset="100%" stopColor="#ff7d9c" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x - FACE.cheekDx} cy={y} rx={16} ry={9.5} fill={`url(#${g})`} />
      <ellipse cx={x + FACE.cheekDx} cy={y} rx={16} ry={9.5} fill={`url(#${g})`} />

      {(variant === "cheek" || variant === "hot") && (
        <g stroke="#ff8fa8" strokeWidth={1.3} strokeLinecap="round" opacity={0.5}>
          <path d={`M ${x - 40},${y - 4} L ${x - 29},${y - 4}`} />
          <path d={`M ${x - 40},${y + 1} L ${x - 29},${y + 1}`} />
          <path d={`M ${x + 29},${y - 4} L ${x + 40},${y - 4}`} />
          <path d={`M ${x + 29},${y + 1} L ${x + 40},${y + 1}`} />
        </g>
      )}
      {variant === "glossy" && (
        <>
          <ellipse cx={x} cy={FACE.mouthY + 1} rx={4.5} ry={1.7} fill="#ffffff" opacity={0.55} />
          <ellipse cx={x + 13} cy={FACE.eyeY - 21} rx={8} ry={2.6} fill="#ffffff" opacity={0.3} />
          <ellipse cx={x - 13} cy={FACE.eyeY - 21} rx={8} ry={2.6} fill="#ffffff" opacity={0.3} />
        </>
      )}
    </g>
  );
}

/* ============================================================================
 *  めがね・ピアス
 * ========================================================================== */

export function Glasses({ variant }: { variant: string }) {
  if (variant === "none") return null;
  const x = CXF;
  const y = FACE.eyeY;
  const dx = FACE.eyeDx;

  if (variant === "heart") {
    const heart = (cx: number) =>
      `M ${cx},${y + 11} C ${cx - 17},${y - 2} ${cx - 15},${y - 15} ${cx - 6},${y - 15}
       C ${cx - 2},${y - 15} ${cx},${y - 11} ${cx},${y - 9}
       C ${cx},${y - 11} ${cx + 2},${y - 15} ${cx + 6},${y - 15}
       C ${cx + 15},${y - 15} ${cx + 17},${y - 2} ${cx},${y + 11} Z`;
    return (
      <g>
        <path d={heart(x - dx)} fill="#ff9ab5" opacity={0.68} stroke="#dd6688" strokeWidth={1.8} />
        <path d={heart(x + dx)} fill="#ff9ab5" opacity={0.68} stroke="#dd6688" strokeWidth={1.8} />
        <path d={`M ${x - 9},${y - 7} L ${x + 9},${y - 7}`} stroke="#dd6688" strokeWidth={2.2} />
        <ellipse cx={x - dx - 4} cy={y - 6} rx={4} ry={2.4} fill="#ffffff" opacity={0.55} transform={`rotate(-24 ${x - dx - 4} ${y - 6})`} />
        <ellipse cx={x + dx - 4} cy={y - 6} rx={4} ry={2.4} fill="#ffffff" opacity={0.55} transform={`rotate(-24 ${x + dx - 4} ${y - 6})`} />
      </g>
    );
  }

  const rx = variant === "round" ? 15.5 : 17.5;
  const ry = variant === "round" ? 15.5 : 12.5;
  const frame = "#4d4b5c";

  return (
    <g>
      <g fill="rgba(228,240,252,.2)" stroke={frame} strokeWidth={2.4} strokeLinejoin="round">
        {variant === "round" ? (
          <>
            <circle cx={x - dx} cy={y} r={rx} />
            <circle cx={x + dx} cy={y} r={rx} />
          </>
        ) : (
          <>
            <rect x={x - dx - rx} y={y - ry} width={rx * 2} height={ry * 2} rx={5.5} />
            <rect x={x + dx - rx} y={y - ry} width={rx * 2} height={ry * 2} rx={5.5} />
          </>
        )}
        <path d={`M ${x - dx + rx},${y - 1} L ${x + dx - rx},${y - 1}`} fill="none" />
        <path d={`M ${x - dx - rx},${y - 2} L ${FACE.left - 1},${y + 5}`} fill="none" />
        <path d={`M ${x + dx + rx},${y - 2} L ${FACE.right + 1},${y + 5}`} fill="none" />
      </g>
      {/* レンズの映り込み */}
      <g fill="#ffffff" opacity={0.35}>
        <ellipse cx={x - dx - 4} cy={y - 6} rx={5} ry={2.6} transform={`rotate(-26 ${x - dx - 4} ${y - 6})`} />
        <ellipse cx={x + dx - 4} cy={y - 6} rx={5} ry={2.6} transform={`rotate(-26 ${x + dx - 4} ${y - 6})`} />
      </g>
    </g>
  );
}

export function Earrings({ variant }: { variant: string }) {
  if (variant === "none") return null;
  const y = FACE.eyeY + 22;
  const lx = FACE.left + 3;
  const rx = FACE.right - 3;

  const one = (cx: number, key: string) => {
    switch (variant) {
      case "pearl":
        return (
          <g key={key}>
            <circle cx={cx} cy={y} r={3.6} fill="#fdf6ee" stroke="#d0bfa8" strokeWidth={0.8} />
            <circle cx={cx - 1.2} cy={y - 1.2} r={1.2} fill="#ffffff" />
          </g>
        );
      case "hoop":
        return (
          <g key={key}>
            <circle cx={cx} cy={y + 4} r={5.8} fill="none" stroke="#e0c060" strokeWidth={2} />
            <circle cx={cx} cy={y + 4} r={5.8} fill="none" stroke="#fff0b8" strokeWidth={0.8} opacity={0.7} />
          </g>
        );
      case "heart":
      default:
        return (
          <g key={key}>
            <path
              d={`M ${cx},${y + 6.5} C ${cx - 6.5},${y} ${cx - 5.5},${y - 5.5} ${cx - 2},${y - 5.5}
                  C ${cx - 0.5},${y - 5.5} ${cx},${y - 3.4} ${cx},${y - 2.2}
                  C ${cx},${y - 3.4} ${cx + 0.5},${y - 5.5} ${cx + 2},${y - 5.5}
                  C ${cx + 5.5},${y - 5.5} ${cx + 6.5},${y} ${cx},${y + 6.5} Z`}
              fill="#ef6f92"
            />
            <ellipse cx={cx - 2} cy={y - 2.4} rx={1.4} ry={0.9} fill="#ffffff" opacity={0.6} />
          </g>
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
