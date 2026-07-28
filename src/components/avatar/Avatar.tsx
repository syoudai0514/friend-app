import { EYE_COLOR_MAP, HAIR_COLOR_MAP, SKIN_MAP, color } from "@/lib/catalog";
import type { Crop, Look } from "@/lib/types";
import { HeadAccessory } from "./accessories";
import { Brows, Earrings, Eyes, Glasses, Makeup, Mouth, Nose } from "./face";
import {
  BODY,
  CROPS,
  CX,
  FACE_PATH,
  HEAD_TRANSFORM,
  armPath,
  calfPath,
  figureDims,
  thighPath,
  torsoPath,
} from "./geometry";
import { HairBack, HairFront } from "./hair";
import { Outfit } from "./outfits";

const LIMB_WIDTH: Record<string, { arm: number; thigh: number; calf: number }> = {
  slim: { arm: 15, thigh: 27, calf: 18 },
  normal: { arm: 17, thigh: 30, calf: 20 },
  rich: { arm: 18, thigh: 33, calf: 22 },
};

export function Avatar({
  look,
  crop = "full",
  className = "",
}: {
  look: Look;
  crop?: Crop;
  className?: string;
}) {
  const hair = color(HAIR_COLOR_MAP, look.hairColor, "blonde");
  const eye = color(EYE_COLOR_MAP, look.eyeColor, "sky");
  const skin = color(SKIN_MAP, look.skin, "fair");
  const d = figureDims(look.figure);
  const limb = LIMB_WIDTH[look.figure] ?? LIMB_WIDTH.normal;

  /** 同じ見た目なら同じID、違う見た目なら違うID。
   *  1ページに複数のアバターを並べたときの defs 衝突を防ぐ */
  const uid = `${look.eyes}${look.eyeColor}${look.makeup}${look.skin}`;

  return (
    <svg
      viewBox={CROPS[crop] ?? CROPS.full}
      preserveAspectRatio="xMidYMax meet"
      className={className}
      role="img"
      aria-label="キャラクター"
    >
      {/* 後ろ髪（頭の座標系） */}
      <g transform={HEAD_TRANSFORM}>
        <HairBack variant={look.hair} color={hair} />
      </g>

      {/* 脚 */}
      <g fill="none" strokeLinecap="round" stroke={skin.value}>
        <path d={thighPath(-1)} strokeWidth={limb.thigh} />
        <path d={thighPath(1)} strokeWidth={limb.thigh} />
        <path d={calfPath(-1)} strokeWidth={limb.calf} />
        <path d={calfPath(1)} strokeWidth={limb.calf} />
      </g>
      <ellipse cx={CX - 21} cy={BODY.ankle + 6} rx={10} ry={6.5} fill={skin.value} />
      <ellipse cx={CX + 21} cy={BODY.ankle + 6} rx={10} ry={6.5} fill={skin.value} />

      {/* 腕 */}
      <g fill="none" strokeLinecap="round" stroke={skin.value}>
        <path d={armPath(-1)} strokeWidth={limb.arm} />
        <path d={armPath(1)} strokeWidth={limb.arm} />
      </g>

      {/* 首 */}
      <path
        d={`M ${CX - 12},${BODY.neckTop} L ${CX - 13},${BODY.shoulder} L ${CX + 13},${BODY.shoulder} L ${CX + 12},${BODY.neckTop} Z`}
        fill={skin.value}
      />
      <path
        d={`M ${CX - 12},${BODY.neckTop}
            C ${CX - 7},${BODY.neckTop + 9} ${CX + 7},${BODY.neckTop + 9} ${CX + 12},${BODY.neckTop}
            L ${CX + 12},${BODY.neckTop + 5}
            C ${CX + 7},${BODY.neckTop + 14} ${CX - 7},${BODY.neckTop + 14} ${CX - 12},${BODY.neckTop + 5} Z`}
        fill={skin.dark}
        opacity={0.45}
      />

      {/* 胴 */}
      <path d={torsoPath(d)} fill={skin.value} />
      {/* 体の陰影 */}
      <g fill="none" stroke={skin.dark} strokeLinecap="round" opacity={0.32}>
        <path
          d={`M ${CX - d.bust + 9},${BODY.bust - 8} C ${CX - d.bust + 11},${BODY.bust + 12} ${CX - 18},${BODY.bust + 18} ${CX - 7},${BODY.bust + 4}`}
          strokeWidth={2.2}
        />
        <path
          d={`M ${CX + d.bust - 9},${BODY.bust - 8} C ${CX + d.bust - 11},${BODY.bust + 12} ${CX + 18},${BODY.bust + 18} ${CX + 7},${BODY.bust + 4}`}
          strokeWidth={2.2}
        />
      </g>
      <ellipse cx={CX} cy={BODY.waist + 4} rx={1.8} ry={3} fill={skin.dark} opacity={0.4} />

      {/* 服 */}
      <Outfit variant={look.outfit} d={d} skin={skin} />

      {/* 頭（顔の座標系） */}
      <g transform={HEAD_TRANSFORM}>
        <ellipse cx={100} cy={112} rx={7} ry={12} fill={skin.value} />
        <ellipse cx={200} cy={112} rx={7} ry={12} fill={skin.value} />

        <path d={FACE_PATH} fill={skin.value} />
        <Earrings variant={look.earrings} />

        <Makeup variant={look.makeup} uid={uid} />
        <Brows variant={look.brows} color={hair.dark} />
        <Eyes variant={look.eyes} eye={eye} lashColor={hair.dark} skin={skin} uid={uid} />
        <Nose variant={look.nose} skin={skin} />
        <Mouth variant={look.mouth} />
        <Glasses variant={look.glasses} />

        <HairFront variant={look.hair} color={hair} />
        <HeadAccessory variant={look.headAcc} hair={hair} />
      </g>
    </svg>
  );
}
