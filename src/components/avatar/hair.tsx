import type { ReactNode } from "react";
import type { ColorOption } from "@/lib/types";
import { hi, ink, mix } from "./palette";

/**
 * 髪型。頭の後ろに描く back と、顔に重ねる前髪に分かれている。
 * 顔の輪郭は x 101〜199 / y 30〜178 なので、髪はその少し外側を通る。
 *
 * 前髪は「本体のパス」を持たせて、艶・毛流れ・陰をすべてそのパスで
 * クリップしている。こうしないと線が顔にはみ出す。
 */

interface HairDef {
  back: (c: ColorOption, g: string) => ReactNode;
  /** 前髪の本体。クリップ範囲も兼ねる */
  bangsPath: string;
  /** アホ毛など、前髪の外にはみ出して描くもの */
  extras?: (c: ColorOption, g: string) => ReactNode;
  /** 毛流れ */
  strands?: string[];
}

/**
 * 顔まわりを縁取る髪。両サイドが顎のあたりで細く尖るので、
 * 頬の横に髪の毛先が落ちて見える。sideY で毛先の長さを決める。
 */
function frame(sideY: number): string {
  return `M 150,16 C 104,16 88,52 88,104
          C 88,142 96,170 104,${sideY}
          C 112,${sideY + 12} 124,${sideY - 4} 121,${sideY - 20}
          C 112,${sideY - 44} 108,132 110,102
          C 110,62 126,32 150,32
          C 174,32 190,62 190,102
          C 192,132 188,${sideY - 44} 179,${sideY - 20}
          C 176,${sideY - 4} 188,${sideY + 12} 196,${sideY}
          C 204,170 212,142 212,104
          C 212,52 196,16 150,16 Z`;
}

const BLOB_SHORT = frame(184);

const HAIR_DEFS: Record<string, HairDef> = {
  /* ------------------------------ ポニーテール ------------------------------ */
  ponytail: {
    back: (c, g) => (
      <g>
        <path
          d="M 196,50 C 236,58 252,102 244,152 C 238,188 222,208 202,220
             C 216,190 224,148 213,116 C 205,92 197,68 194,54 Z"
          fill={`url(#${g})`}
        />
        <path
          d="M 200,64 C 228,80 236,112 232,148 C 229,172 221,192 210,204
             C 220,172 220,134 212,110 C 206,94 202,78 200,64 Z"
          fill={c.dark}
          opacity={0.4}
          stroke="none"
        />
        <path
          d="M 205,74 C 220,90 226,110 224,132 C 218,112 212,92 204,80 Z"
          fill={hi(c.light, 0.35)}
          opacity={0.5}
          stroke="none"
        />
        <path d={frame(188)} fill={`url(#${g})`} />
        <ellipse cx={197} cy={57} rx={10} ry={7.5} fill={mix(c.dark, "#e8607f", 0.7)} />
      </g>
    ),
    bangsPath: `M 92,104 C 90,56 114,22 150,22 C 186,22 210,56 208,104
                C 206,90 201,80 194,73
                C 189,94 176,105 162,101
                C 156,92 152,82 150,71
                C 143,93 127,106 110,102
                C 102,99 96,99 92,104 Z`,
    extras: (c, g) => (
      <path d="M 144,26 C 146,4 166,-4 178,7 C 166,7 156,16 153,32 Z" fill={`url(#${g})`} />
    ),
    strands: [
      "M 150,30 C 142,50 134,70 128,90",
      "M 152,30 C 158,52 168,72 178,88",
      "M 148,34 C 147,54 147,72 148,90",
    ],
  },

  /* ------------------------------ ロング ------------------------------ */
  long: {
    back: (c, g) => (
      <g>
        <path
          d="M 150,16 C 104,16 88,52 88,104 C 86,170 82,250 79,330
             C 92,342 110,344 124,336 C 117,258 114,190 118,146
             L 182,146 C 186,190 183,258 176,336 C 190,344 208,342 221,330
             C 218,250 214,170 212,104 C 212,52 196,16 150,16 Z"
          fill={`url(#${g})`}
        />
        <path
          d="M 96,152 C 94,222 91,282 89,326 C 97,333 105,335 113,333 C 108,262 108,196 112,154 Z"
          fill={c.dark}
          opacity={0.3}
          stroke="none"
        />
        <path
          d="M 204,152 C 206,222 209,282 211,326 C 203,333 195,335 187,333 C 192,262 192,196 188,154 Z"
          fill={c.dark}
          opacity={0.3}
          stroke="none"
        />
        <g stroke={c.dark} strokeWidth={1.5} fill="none" opacity={0.35} strokeLinecap="round">
          <path d="M 102,152 C 99,220 97,280 96,320" />
          <path d="M 198,152 C 201,220 203,280 204,320" />
        </g>
      </g>
    ),
    bangsPath: `M 92,106 C 90,56 114,22 150,22 C 186,22 210,56 208,106
                C 205,88 198,74 187,66
                C 179,88 165,100 152,102
                L 148,102
                C 135,100 121,88 113,66
                C 102,74 95,88 92,106 Z`,
    strands: [
      "M 150,28 C 143,50 136,72 130,92",
      "M 150,28 C 157,50 164,72 170,92",
      "M 150,34 C 150,54 150,74 150,92",
    ],
  },

  /* -------------------------------- ボブ -------------------------------- */
  bob: {
    back: (c, g) => (
      <g>
        <path
          d="M 150,16 C 104,16 86,52 86,104 C 86,150 92,182 100,202
             C 108,212 118,208 116,196 C 110,176 106,146 106,110
             L 194,110 C 194,146 190,176 184,196 C 182,208 192,212 200,202
             C 208,182 214,150 214,104 C 214,52 196,16 150,16 Z"
          fill={`url(#${g})`}
        />
        <path
          d="M 94,150 C 96,178 100,196 106,204 C 112,206 116,204 116,198 C 108,182 102,166 100,148 Z"
          fill={c.dark}
          opacity={0.28}
          stroke="none"
        />
        <path
          d="M 206,150 C 204,178 200,196 194,204 C 188,206 184,204 184,198 C 192,182 198,166 200,148 Z"
          fill={c.dark}
          opacity={0.28}
          stroke="none"
        />
      </g>
    ),
    bangsPath: `M 96,100 C 94,54 118,22 150,22 C 182,22 206,54 204,100
                C 199,92 192,101 184,92 C 177,101 169,91 160,100
                C 152,91 144,101 136,92 C 128,101 120,91 112,100
                C 106,94 100,95 96,100 Z`,
    strands: ["M 150,26 C 142,48 136,70 132,90", "M 150,26 C 158,48 164,70 168,90"],
  },

  /* ------------------------------ ツインテール ------------------------------ */
  twin: {
    back: (c, g) => (
      <g>
        <path
          d="M 98,72 C 62,80 46,114 48,156 C 50,196 64,226 82,240
             C 72,206 70,164 80,132 C 88,106 96,88 98,72 Z"
          fill={`url(#${g})`}
        />
        <path
          d="M 202,72 C 238,80 254,114 252,156 C 250,196 236,226 218,240
             C 228,206 230,164 220,132 C 212,106 204,88 202,72 Z"
          fill={`url(#${g})`}
        />
        <path
          d="M 90,94 C 66,110 58,142 60,172 C 62,196 68,214 78,226 C 70,196 70,156 80,128 Z"
          fill={c.dark}
          opacity={0.32}
          stroke="none"
        />
        <path
          d="M 210,94 C 234,110 242,142 240,172 C 238,196 232,214 222,226 C 230,196 230,156 220,128 Z"
          fill={c.dark}
          opacity={0.32}
          stroke="none"
        />
        <path d={BLOB_SHORT} fill={`url(#${g})`} />
        <ellipse cx={99} cy={78} rx={10} ry={7.5} fill="#ef6f92" />
        <ellipse cx={201} cy={78} rx={10} ry={7.5} fill="#ef6f92" />
      </g>
    ),
    bangsPath: `M 92,104 C 90,56 114,22 150,22 C 186,22 210,56 208,104
                C 205,88 198,74 189,66
                C 183,90 170,101 156,99
                C 150,89 147,79 145,67
                C 136,90 120,103 105,102
                C 99,100 95,100 92,104 Z`,
    strands: ["M 150,28 C 141,50 133,72 127,92", "M 152,28 C 160,52 169,72 178,90"],
  },

  /* ------------------------------- お団子 ------------------------------- */
  bun: {
    back: (c, g) => (
      <g>
        <circle cx={104} cy={44} r={21} fill={`url(#${g})`} />
        <circle cx={196} cy={44} r={21} fill={`url(#${g})`} />
        <path d="M 92,38 C 94,28 104,23 114,26 C 104,28 96,32 92,44 Z" fill={hi(c.light, 0.35)} opacity={0.7} stroke="none" />
        <path d="M 208,38 C 206,28 196,23 186,26 C 196,28 204,32 208,44 Z" fill={hi(c.light, 0.35)} opacity={0.7} stroke="none" />
        <path d={BLOB_SHORT} fill={`url(#${g})`} />
      </g>
    ),
    bangsPath: `M 94,102 C 92,54 116,22 150,22 C 184,22 208,54 206,102
                C 201,86 193,73 182,66
                C 175,90 162,101 149,99
                C 141,89 137,78 135,65
                C 127,89 113,102 101,102
                C 98,101 96,101 94,102 Z`,
    strands: ["M 148,28 C 138,50 130,72 124,92", "M 152,28 C 162,50 172,70 180,88"],
  },

  /* ------------------------------- ショート ------------------------------- */
  short: {
    back: (c, g) => (
      <g>
        <path d={frame(178)} fill={`url(#${g})`} />
        <path d="M 92,98 C 90,126 94,150 100,168 L 110,170 C 102,148 98,122 98,98 Z" fill={c.dark} opacity={0.28} stroke="none" />
        <path d="M 208,98 C 210,126 206,150 200,168 L 190,170 C 198,148 202,122 202,98 Z" fill={c.dark} opacity={0.28} stroke="none" />
      </g>
    ),
    bangsPath: `M 94,100 C 92,54 116,22 150,22 C 184,22 208,54 206,100
                C 200,84 192,72 182,65
                C 178,85 166,96 152,93
                C 144,83 140,72 138,61
                C 130,83 116,99 102,100
                C 98,98 96,99 94,100 Z`,
    strands: ["M 150,26 C 140,48 132,70 126,90", "M 152,26 C 162,48 171,68 180,86"],
  },

  /* ------------------------------ サイドテール ------------------------------ */
  sidetail: {
    back: (c, g) => (
      <g>
        <path
          d="M 202,62 C 242,72 258,120 252,176 C 247,228 231,272 214,302
             C 220,258 220,202 210,162 C 204,126 202,90 202,62 Z"
          fill={`url(#${g})`}
        />
        <path
          d="M 210,84 C 234,108 240,150 236,190 C 233,220 225,250 216,272 C 223,232 223,180 214,144 Z"
          fill={c.dark}
          opacity={0.32}
          stroke="none"
        />
        <path d={frame(180)} fill={`url(#${g})`} />
        <ellipse cx={203} cy={70} rx={10} ry={7.5} fill={mix(c.dark, "#e8607f", 0.65)} />
      </g>
    ),
    bangsPath: `M 92,104 C 90,56 114,22 150,22 C 186,22 210,56 208,102
                C 200,82 188,68 172,62
                C 158,84 132,95 112,91
                C 101,94 94,98 92,104 Z`,
    strands: ["M 148,28 C 136,48 122,66 110,80", "M 154,28 C 164,48 176,64 190,74"],
  },

  /* ---------------------------- ゆるふわウェーブ ---------------------------- */
  wavy: {
    back: (c, g) => (
      <g>
        <path
          d="M 150,16 C 104,16 88,52 88,104 C 84,148 98,178 84,216
             C 98,242 76,270 88,306 C 100,322 120,324 136,316
             C 124,278 132,240 124,206 C 119,178 119,160 121,146
             L 179,146 C 181,160 181,178 176,206 C 168,240 176,278 164,316
             C 180,324 200,322 212,306 C 224,270 202,242 216,216
             C 202,178 216,148 212,104 C 212,52 196,16 150,16 Z"
          fill={`url(#${g})`}
        />
        <path
          d="M 98,152 C 94,188 106,210 96,242 C 106,264 92,284 100,306 C 106,312 112,314 118,312
             C 110,282 118,252 112,222 C 108,196 108,170 110,152 Z"
          fill={c.dark}
          opacity={0.28}
          stroke="none"
        />
        <path
          d="M 202,152 C 206,188 194,210 204,242 C 194,264 208,284 200,306 C 194,312 188,314 182,312
             C 190,282 182,252 188,222 C 192,196 192,170 190,152 Z"
          fill={c.dark}
          opacity={0.28}
          stroke="none"
        />
      </g>
    ),
    bangsPath: `M 92,104 C 90,56 114,22 150,22 C 186,22 210,56 208,104
                C 202,80 192,66 177,60
                C 160,82 132,93 110,88
                C 100,92 94,96 92,104 Z`,
    strands: ["M 148,28 C 134,46 118,62 106,74", "M 154,28 C 166,48 178,64 190,74"],
  },
};

/** 髪色のグラデーション。上が明るく下が沈む */
function HairGradient({ c, id }: { c: ColorOption; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={hi(c.value, 0.24)} />
        <stop offset="42%" stopColor={c.value} />
        <stop offset="100%" stopColor={mix(c.value, c.dark, 0.75)} />
      </linearGradient>
    </defs>
  );
}

export function HairBack({ variant, color }: { variant: string; color: ColorOption }) {
  const def = HAIR_DEFS[variant] ?? HAIR_DEFS.ponytail;
  const g = `hairg-${color.id}`;
  return (
    <g stroke={ink(color.value, 0.5)} strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <HairGradient c={color} id={g} />
      {def.back(color, g)}
    </g>
  );
}

export function HairFront({ variant, color }: { variant: string; color: ColorOption }) {
  const def = HAIR_DEFS[variant] ?? HAIR_DEFS.ponytail;
  const g = `hairg-${color.id}`;
  const clip = `bangclip-${variant}-${color.id}`;
  const tipShade = `bangtip-${variant}-${color.id}`;
  const lineColor = ink(color.value, 0.5);

  return (
    <g stroke={lineColor} strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <clipPath id={clip}>
          <path d={def.bangsPath} />
        </clipPath>
        <linearGradient id={tipShade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mix(color.value, color.dark, 0.9)} stopOpacity={0} />
          <stop offset="100%" stopColor={mix(color.value, color.dark, 0.9)} stopOpacity={0.45} />
        </linearGradient>
      </defs>

      <path d={def.bangsPath} fill={`url(#${g})`} />

      {/* 艶・毛流れ・毛先の陰は、すべて前髪の内側に収める */}
      <g clipPath={`url(#${clip})`} stroke="none">
        {/* 天使の輪 */}
        <path
          d={`M 106,74 C 118,49 182,49 194,74
              C 189,71 185,80 180,72 C 175,63 170,79 164,69
              C 158,59 152,77 146,66 C 140,56 134,78 128,68
              C 123,60 118,77 112,70 C 110,68 108,72 106,74 Z`}
          fill={hi(color.light, 0.42)}
          opacity={0.85}
        />
        <path
          d="M 116,62 C 128,49 172,49 184,62 C 172,55 128,55 116,62 Z"
          fill="#ffffff"
          opacity={0.35}
        />
        {/* 毛先に向かって沈む陰 */}
        <rect x={84} y={72} width={132} height={56} fill={`url(#${tipShade})`} />
        {/* 毛流れ */}
        {def.strands && (
          <g stroke={mix(color.dark, lineColor, 0.5)} strokeWidth={1.4} fill="none" opacity={0.28}>
            {def.strands.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        )}
      </g>

      {def.extras?.(color, g)}
    </g>
  );
}
