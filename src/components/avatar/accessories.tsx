import type { ColorOption } from "@/lib/types";

/** 頭のアクセサリー。前髪より上のレイヤーに描かれる */
export function HeadAccessory({
  variant,
  hair,
}: {
  variant: string;
  hair: ColorOption;
}) {
  switch (variant) {
    /* --------------------------- ネコ耳ヘッドホン --------------------------- */
    case "catphones":
      return (
        <g>
          <defs>
            <linearGradient id="catear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bff0ff" />
              <stop offset="100%" stopColor="#5ab8e8" />
            </linearGradient>
          </defs>
          {/* ヘッドバンド */}
          <path
            d="M 96,104 C 96,44 122,20 150,20 C 178,20 204,44 204,104"
            fill="none"
            stroke="#f7f9fc"
            strokeWidth={9}
            strokeLinecap="round"
          />
          <path
            d="M 96,104 C 96,44 122,20 150,20 C 178,20 204,44 204,104"
            fill="none"
            stroke="#d9dfe8"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.6}
          />
          {/* ネコ耳 */}
          <path d="M 112,42 L 107,6 L 146,28 C 134,28 120,34 112,42 Z" fill="url(#catear)" stroke="#f7f9fc" strokeWidth={3} strokeLinejoin="round" />
          <path d="M 188,42 L 193,6 L 154,28 C 166,28 180,34 188,42 Z" fill="url(#catear)" stroke="#f7f9fc" strokeWidth={3} strokeLinejoin="round" />
          <path d="M 121,24 l 4,-3 l 4,7 l -5,2 Z" fill="#ffffff" />
          <path d="M 179,24 l -4,-3 l -4,7 l 5,2 Z" fill="#ffffff" />
          {/* イヤーカップ */}
          <g>
            <ellipse cx={97} cy={112} rx={13} ry={20} fill="#f7f9fc" />
            <ellipse cx={203} cy={112} rx={13} ry={20} fill="#f7f9fc" />
            <ellipse cx={97} cy={112} rx={8.5} ry={15} fill="#f296bc" />
            <ellipse cx={203} cy={112} rx={8.5} ry={15} fill="#f296bc" />
            <rect x={90} y={104} width={14} height={5} rx={2.5} fill="#6fd0ec" />
            <rect x={196} y={104} width={14} height={5} rx={2.5} fill="#6fd0ec" />
            <rect x={90} y={116} width={14} height={5} rx={2.5} fill="#6fd0ec" />
            <rect x={196} y={116} width={14} height={5} rx={2.5} fill="#6fd0ec" />
          </g>
        </g>
      );

    /* -------------------------------- リボン -------------------------------- */
    case "ribbon":
      return (
        <g transform="translate(191,42) rotate(14)">
          <path d="M 0,0 C -8,-16 -30,-18 -32,-4 C -34,10 -14,14 0,4 Z" fill="#e8607f" />
          <path d="M 0,0 C 8,-16 30,-18 32,-4 C 34,10 14,14 0,4 Z" fill="#e8607f" />
          <path d="M 0,0 C -6,-11 -22,-13 -24,-4 C -25,5 -12,8 0,2 Z" fill="#f28aa2" />
          <path d="M 0,0 C 6,-11 22,-13 24,-4 C 25,5 12,8 0,2 Z" fill="#f28aa2" />
          <ellipse cx={0} cy={1} rx={6} ry={7} fill="#cf4a68" />
        </g>
      );

    /* ------------------------------ カチューシャ ------------------------------ */
    case "hairband":
      return (
        <path
          d="M 97,102 C 97,46 122,22 150,22 C 178,22 203,46 203,102"
          fill="none"
          stroke="#3a3f52"
          strokeWidth={7}
          strokeLinecap="round"
        />
      );

    /* ------------------------------- 花かざり ------------------------------- */
    case "flower":
      return (
        <g transform="translate(190,50)">
          {[
            [0, 0, 11, "#fdfbff"],
            [-17, 8, 8, "#ffd9e4"],
            [15, 12, 7, "#ffd9e4"],
          ].map(([x, y, r, fill], i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx={0}
                  cy={-(r as number) * 0.7}
                  rx={(r as number) * 0.45}
                  ry={(r as number) * 0.75}
                  fill={fill as string}
                  transform={`rotate(${a})`}
                />
              ))}
              <circle cx={0} cy={0} r={(r as number) * 0.35} fill="#f5c451" />
            </g>
          ))}
          <path d="M -26,20 C -14,26 8,26 22,18" fill="none" stroke="#5f9c62" strokeWidth={2.4} strokeLinecap="round" />
        </g>
      );

    /* ------------------------------- けもみみ ------------------------------- */
    case "animalears":
      return (
        <g>
          <path d="M 112,44 C 104,16 110,0 124,4 C 138,8 144,24 142,40 C 132,38 120,40 112,44 Z" fill={hair.value} />
          <path d="M 188,44 C 196,16 190,0 176,4 C 162,8 156,24 158,40 C 168,38 180,40 188,44 Z" fill={hair.value} />
          <path d="M 118,38 C 113,20 116,10 124,12 C 132,15 135,26 134,36 Z" fill="#f7c9d8" />
          <path d="M 182,38 C 187,20 184,10 176,12 C 168,15 165,26 166,36 Z" fill="#f7c9d8" />
        </g>
      );

    default:
      return null;
  }
}
