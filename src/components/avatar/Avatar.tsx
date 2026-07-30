import { EYE_COLOR_MAP, HAIR_COLOR_MAP, SKIN_MAP, color } from "@/lib/catalog";
import { EXPRESSIONS, type Expression } from "@/lib/expressions";
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
  footPos,
  groundPos,
  handPos,
  kneePos,
  poseById,
  thighPath,
  torsoPath,
} from "./geometry";
import { HairBack, HairFront } from "./hair";
import { Outfit } from "./outfits";
import { hi, ink, mix, shade1, shade2 } from "./palette";

const LIMB_WIDTH: Record<string, { arm: number; thigh: number; calf: number }> = {
  slim: { arm: 15, thigh: 27, calf: 18 },
  normal: { arm: 17, thigh: 30, calf: 20 },
  rich: { arm: 18, thigh: 33, calf: 22 },
};

export function Avatar({
  look,
  crop = "full",
  className = "",
  expression = "normal",
  blink = false,
  mouthOpen = false,
}: {
  look: Look;
  crop?: Crop;
  className?: string;
  /** 表情。目・口・まゆげ・頬をまとめて差し替える */
  expression?: Expression;
  /** まばたき中は目を閉じる */
  blink?: boolean;
  /** しゃべっている最中は口を開ける */
  mouthOpen?: boolean;
}) {
  const hair = color(HAIR_COLOR_MAP, look.hairColor, "blonde");
  const eye = color(EYE_COLOR_MAP, look.eyeColor, "sky");
  const skin = color(SKIN_MAP, look.skin, "fair");
  const d = figureDims(look.figure);
  const limb = LIMB_WIDTH[look.figure] ?? LIMB_WIDTH.normal;
  // 手足の配置はポーズが決める。胴と腰は動かないので、どの服とも組み合わせられる
  const pose = poseById(look.pose);
  const ground = groundPos(pose);
  // 首の付け根を軸に頭を傾ける。髪も同じ変換に乗るので一緒に傾く
  const headTransform = `${HEAD_TRANSFORM} rotate(${pose.headTilt},150,168)`;

  // 表情でベースの顔を上書きし、そのうえに まばたき／口の動き を重ねる
  const ex = EXPRESSIONS[expression] ?? {};
  const eyesId = blink ? "blink" : (ex.eyes ?? look.eyes);
  const mouthId = mouthOpen ? "open" : (ex.mouth ?? look.mouth);
  const browsId = ex.brows ?? look.brows;
  const makeupId = ex.makeup ?? look.makeup;

  /** 同じ見た目なら同じID、違う見た目なら違うID。
   *  1ページに複数のアバターを並べたときの defs 衝突を防ぐ */
  const uid = `${eyesId}${look.eyeColor}${makeupId}${look.skin}${look.figure}`;

  const skinInk = ink(skin.value, 0.3);
  const sh1 = shade1(skin.value);
  const sh2 = shade2(skin.value);
  const skinG = `skin-${uid}`;
  const foreheadG = `fh-${uid}`;
  const faceClip = `faceclip-${uid}`;
  const groundG = `ground-${uid}`;

  /** 手足は「太い線画 → 上から肌色」の二度描きで輪郭をつける */
  const limbs = (stroke: string, grow: number) => (
    <g fill="none" strokeLinecap="round" stroke={stroke}>
      <path d={thighPath(-1, pose)} strokeWidth={limb.thigh + grow} />
      <path d={thighPath(1, pose)} strokeWidth={limb.thigh + grow} />
      <path d={calfPath(-1, pose)} strokeWidth={limb.calf + grow} />
      <path d={calfPath(1, pose)} strokeWidth={limb.calf + grow} />
      <path d={armPath(-1, pose)} strokeWidth={limb.arm + grow} />
      <path d={armPath(1, pose)} strokeWidth={limb.arm + grow} />
    </g>
  );

  return (
    <svg
      viewBox={CROPS[crop] ?? CROPS.full}
      preserveAspectRatio="xMidYMax meet"
      className={className}
      role="img"
      aria-label="キャラクター"
    >
      <defs>
        <linearGradient id={skinG} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={sh1} />
          <stop offset="22%" stopColor={skin.value} />
          <stop offset="70%" stopColor={hi(skin.value, 0.18)} />
          <stop offset="100%" stopColor={sh1} />
        </linearGradient>
        <linearGradient id={foreheadG} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sh2} stopOpacity={0.55} />
          <stop offset="55%" stopColor={sh1} stopOpacity={0.28} />
          <stop offset="100%" stopColor={sh1} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={groundG}>
          <stop offset="0%" stopColor="#000000" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </radialGradient>
        <clipPath id={faceClip}>
          <path d={FACE_PATH} />
        </clipPath>
      </defs>

      {/* 接地影。これがあるだけで背景から浮かなくなる */}
      <ellipse cx={ground.x} cy={ground.y} rx={ground.rx} ry={13} fill={`url(#${groundG})`} />

      {/* 後ろ髪（頭の座標系） */}
      <g transform={headTransform}>
        <HairBack variant={look.hair} color={hair} />
      </g>

      {/* 手足：線画 → 肌 */}
      {limbs(skinInk, 2.6)}
      {limbs(skin.value, 0)}
      {/* 手足の陰（内側） */}
      <g fill="none" strokeLinecap="round" stroke={sh1} opacity={0.55}>
        <path d={thighPath(-1, pose)} strokeWidth={limb.thigh * 0.34} transform={`translate(${limb.thigh * 0.3},0)`} />
        <path d={thighPath(1, pose)} strokeWidth={limb.thigh * 0.34} transform={`translate(${-limb.thigh * 0.3},0)`} />
        <path d={calfPath(-1, pose)} strokeWidth={limb.calf * 0.34} transform={`translate(${limb.calf * 0.3},0)`} />
        <path d={calfPath(1, pose)} strokeWidth={limb.calf * 0.34} transform={`translate(${-limb.calf * 0.3},0)`} />
        <path d={armPath(-1, pose)} strokeWidth={limb.arm * 0.32} transform={`translate(${-limb.arm * 0.3},0)`} />
        <path d={armPath(1, pose)} strokeWidth={limb.arm * 0.32} transform={`translate(${limb.arm * 0.3},0)`} />
      </g>
      {/* 膝のあたりのハイライト */}
      <g fill={hi(skin.value, 0.4)} opacity={0.5}>
        {[-1, 1].map((side) => {
          const k = kneePos(side, pose);
          return <ellipse key={side} cx={k.x - side * 3} cy={k.y - 24} rx={4} ry={16} />;
        })}
      </g>
      {/* 手 */}
      {[-1, 1].map((side) => {
        const h = handPos(side, pose);
        return (
          <g key={side} transform={`translate(${h.x},${h.y}) rotate(${h.angle}) scale(${side},1)`}>
            <path
              d="M -6.5,-9 C -8.5,-3 -8,6 -4,10.5 C 0,13.5 6,11.5 7,4.5 C 8,-2.5 6.5,-8.5 4.5,-10.5 Z"
              fill={skin.value}
              stroke={skinInk}
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            <g stroke={sh1} fill="none" strokeWidth={1} opacity={0.7} strokeLinecap="round">
              <path d="M -2.5,-3 C -2.5,3 -1.5,7 -0.5,9.5" />
              <path d="M 1.5,-4 C 1.5,2 2.5,6 3.5,8.5" />
            </g>
          </g>
        );
      })}

      {/* 足 */}
      <g stroke={skinInk} strokeWidth={1.5}>
        {[-1, 1].map((side) => {
          const f = footPos(side, pose);
          return (
            <ellipse
              key={side}
              cx={f.x}
              cy={f.y}
              rx={10}
              ry={6.5}
              fill={skin.value}
              transform={`rotate(${f.angle} ${f.x} ${f.y})`}
            />
          );
        })}
      </g>

      {/* 首 */}
      <path
        d={`M ${CX - 12},${BODY.neckTop} L ${CX - 13},${BODY.shoulder} L ${CX + 13},${BODY.shoulder} L ${CX + 12},${BODY.neckTop} Z`}
        fill={skin.value}
        stroke={skinInk}
        strokeWidth={1.4}
      />
      {/* 顎の落ち影 */}
      <path
        d={`M ${CX - 13},${BODY.neckTop - 2}
            C ${CX - 7},${BODY.neckTop + 10} ${CX + 7},${BODY.neckTop + 10} ${CX + 13},${BODY.neckTop - 2}
            L ${CX + 13},${BODY.neckTop + 7}
            C ${CX + 7},${BODY.neckTop + 17} ${CX - 7},${BODY.neckTop + 17} ${CX - 13},${BODY.neckTop + 7} Z`}
        fill={sh2}
        opacity={0.6}
      />

      {/* 胴 */}
      <path d={torsoPath(d)} fill={`url(#${skinG})`} stroke={skinInk} strokeWidth={1.6} strokeLinejoin="round" />

      {/* 体の陰影 */}
      <g>
        {/* 鎖骨 */}
        <g fill="none" stroke={sh1} strokeWidth={1.8} strokeLinecap="round" opacity={0.65}>
          <path d={`M ${CX - 24},${BODY.shoulder + 6} C ${CX - 17},${BODY.shoulder + 12} ${CX - 8},${BODY.shoulder + 13} ${CX - 4},${BODY.shoulder + 11}`} />
          <path d={`M ${CX + 24},${BODY.shoulder + 6} C ${CX + 17},${BODY.shoulder + 12} ${CX + 8},${BODY.shoulder + 13} ${CX + 4},${BODY.shoulder + 11}`} />
        </g>
        {/* 胸の下の影 */}
        <g fill={sh1} opacity={0.6}>
          <path
            d={`M ${CX - d.bust + 7},${BODY.bust - 10}
                C ${CX - d.bust + 9},${BODY.bust + 14} ${CX - 16},${BODY.bust + 22} ${CX - 5},${BODY.bust + 4}
                C ${CX - 14},${BODY.bust + 16} ${CX - d.bust + 14},${BODY.bust + 10} ${CX - d.bust + 7},${BODY.bust - 10} Z`}
          />
          <path
            d={`M ${CX + d.bust - 7},${BODY.bust - 10}
                C ${CX + d.bust - 9},${BODY.bust + 14} ${CX + 16},${BODY.bust + 22} ${CX + 5},${BODY.bust + 4}
                C ${CX + 14},${BODY.bust + 16} ${CX + d.bust - 14},${BODY.bust + 10} ${CX + d.bust - 7},${BODY.bust - 10} Z`}
          />
        </g>
        {/* 脇腹 */}
        <g fill={sh1} opacity={0.45}>
          <path
            d={`M ${CX - d.waist - 1},${BODY.waist - 22} C ${CX - d.waist - 1},${BODY.waist} ${CX - d.hip + 2},${BODY.hip - 12} ${CX - d.hip + 1},${BODY.hip + 6}
                C ${CX - d.hip + 7},${BODY.hip - 10} ${CX - d.waist + 4},${BODY.waist} ${CX - d.waist + 4},${BODY.waist - 20} Z`}
          />
          <path
            d={`M ${CX + d.waist + 1},${BODY.waist - 22} C ${CX + d.waist + 1},${BODY.waist} ${CX + d.hip - 2},${BODY.hip - 12} ${CX + d.hip - 1},${BODY.hip + 6}
                C ${CX + d.hip - 7},${BODY.hip - 10} ${CX + d.waist - 4},${BODY.waist} ${CX + d.waist - 4},${BODY.waist - 20} Z`}
          />
        </g>
        {/* おへそ */}
        <path
          d={`M ${CX},${BODY.waist + 1} C ${CX + 2},${BODY.waist + 3} ${CX + 1.6},${BODY.waist + 6} ${CX - 0.6},${BODY.waist + 6.5}`}
          fill="none"
          stroke={sh2}
          strokeWidth={1.7}
          strokeLinecap="round"
          opacity={0.55}
        />
      </g>

      {/* 服。袖は腕の曲線から作られるので、どのポーズでも腕に沿う */}
      <Outfit variant={look.outfit} d={d} skin={skin} pose={pose} />

      {/* 頭（顔の座標系） */}
      <g transform={headTransform}>
        {/* 耳 */}
        <g stroke={skinInk} strokeWidth={1.4}>
          <ellipse cx={101} cy={112} rx={7} ry={12} fill={skin.value} />
          <ellipse cx={199} cy={112} rx={7} ry={12} fill={skin.value} />
        </g>

        {/* 顔 */}
        <path d={FACE_PATH} fill={skin.value} stroke={skinInk} strokeWidth={1.6} strokeLinejoin="round" />
        <g clipPath={`url(#${faceClip})`}>
          {/* 前髪の落ち影 */}
          <rect x={96} y={26} width={108} height={62} fill={`url(#${foreheadG})`} />
          {/* 頬から顎にかけての陰 */}
          <path d="M 101,84 C 100,108 106,130 115,148 L 104,150 C 98,128 96,104 97,84 Z" fill={sh1} opacity={0.22} />
          <path d="M 199,84 C 200,108 194,130 185,148 L 196,150 C 202,128 204,104 203,84 Z" fill={sh1} opacity={0.22} />
        </g>
        <Earrings variant={look.earrings} />

        <Makeup variant={makeupId} uid={uid} />
        <Brows variant={browsId} color={hair.dark} />
        <Eyes variant={eyesId} eye={eye} lashColor={hair.dark} skin={skin} uid={uid} />
        <Nose variant={look.nose} skin={skin} />
        <Mouth variant={mouthId} />
        <Glasses variant={look.glasses} />

        <HairFront variant={look.hair} color={hair} />
        <HeadAccessory variant={look.headAcc} hair={hair} />
      </g>

      {/* 全体の縁の光（リムライト）。背景から浮き上がって見える */}
      <g fill="none" stroke={mix("#ffffff", skin.value, 0.35)} strokeWidth={2} opacity={0.3} strokeLinecap="round">
        <path d={armPath(1, pose)} transform={`translate(${limb.arm * 0.36},0)`} strokeWidth={limb.arm * 0.24} />
        <path d={calfPath(1, pose)} transform={`translate(${limb.calf * 0.34},0)`} strokeWidth={limb.calf * 0.22} />
      </g>
    </svg>
  );
}
