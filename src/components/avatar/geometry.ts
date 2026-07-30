/**
 * アバターSVGの形。座標の定数は geometry-base、手足の配置は poses が持ち、
 * ここはその2つを組み合わせて実際のパス文字列を作る。
 *
 * 手足のパスはすべてポーズを受け取る。省略したときは今までと同じ立ち姿に
 * なるので、ポーズを知らない呼び出し側はそのままで動く。
 */

import { poseById, type Arm, type Leg, type Pose, type Pt } from "./poses";
import { BODY, CX, type FigureDims } from "./geometry-base";

export * from "./geometry-base";
export { POSES, DEFAULT_POSE_ID, poseById } from "./poses";
export type { Pose, Arm, Leg, Pt } from "./poses";

/** 立ち姿の基準。ポーズを渡されなかったときはこれになる */
const NEUTRAL = poseById(undefined);

function armFor(pose: Pose, side: number): Arm {
  return side < 0 ? pose.arms.left : pose.arms.right;
}

function legFor(pose: Pose, side: number): Leg {
  return side < 0 ? pose.legs.left : pose.legs.right;
}

/** 中心からのずれを実座標に直す */
function xy(p: Pt): [number, number] {
  return [CX + p.dx, p.y];
}

function curve(a: Pt, c1: Pt, c2: Pt, b: Pt): string {
  const [ax, ay] = xy(a);
  const [c1x, c1y] = xy(c1);
  const [c2x, c2y] = xy(c2);
  const [bx, by] = xy(b);
  return `M ${ax},${ay} C ${c1x},${c1y} ${c2x},${c2y} ${bx},${by}`;
}

/* -------------------------------- 胴体 -------------------------------- */

/** 胴体。体型に応じて幅が変わる。ポーズでは変わらない */
export function torsoPath({ bust, waist, hip }: FigureDims): string {
  // 上辺は首の幅ぶんしかない。そこから肩へなだらかに下る形にすると
  // 「箱に頭が乗っている」感じにならない
  return `
    M ${CX - 13},${BODY.shoulder - 13}
    C ${CX - 28},${BODY.shoulder - 10} ${CX - 40},${BODY.shoulder - 2} ${CX - 47},${BODY.shoulder + 14}
    C ${CX - bust + 2},${BODY.bust - 24} ${CX - bust},${BODY.bust - 16} ${CX - bust},${BODY.bust}
    C ${CX - bust},${BODY.bust + 22} ${CX - waist},${BODY.waist - 16} ${CX - waist},${BODY.waist}
    C ${CX - waist},${BODY.waist + 18} ${CX - hip},${BODY.hip - 12} ${CX - hip},${BODY.hip}
    C ${CX - hip},${BODY.hip + 16} ${CX - hip + 6},${BODY.crotch - 2} ${CX - hip + 16},${BODY.crotch}
    L ${CX + hip - 16},${BODY.crotch}
    C ${CX + hip - 6},${BODY.crotch - 2} ${CX + hip},${BODY.hip + 16} ${CX + hip},${BODY.hip}
    C ${CX + hip},${BODY.hip - 12} ${CX + waist},${BODY.waist + 18} ${CX + waist},${BODY.waist}
    C ${CX + waist},${BODY.waist - 16} ${CX + bust},${BODY.bust + 22} ${CX + bust},${BODY.bust}
    C ${CX + bust},${BODY.bust - 16} ${CX + bust - 2},${BODY.bust - 24} ${CX + 47},${BODY.shoulder + 14}
    C ${CX + 40},${BODY.shoulder - 2} ${CX + 28},${BODY.shoulder - 10} ${CX + 13},${BODY.shoulder - 13}
    Z`;
}

/* --------------------------------- 腕 --------------------------------- */

/**
 * 腕。side は -1（左）/ +1（右）。
 * 付け根を胴の内側から始めることで、胴に隠れて肩が自然につながる。
 */
export function armPath(side: number, pose: Pose = NEUTRAL): string {
  const a = armFor(pose, side);
  return curve(a.from, a.c1, a.c2, a.to);
}

/** 手の位置と向き（腕の先端） */
export function handPos(
  side: number,
  pose: Pose = NEUTRAL,
): { x: number; y: number; angle: number } {
  const a = armFor(pose, side);
  return { x: CX + a.to.dx, y: a.to.y + 4, angle: a.handAngle };
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { dx: a.dx + (b.dx - a.dx) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * 腕の曲線を途中で切って、袖の形を作る。
 *
 * 袖をポーズごとに手で描いていると、ポーズを足すたびに全部の服を
 * 直すことになる。腕の曲線そのものを分割して使えば、服側は何も
 * 知らないままどのポーズにも追従する。
 * （3次ベジェの分割＝ドゥ・カステリョのアルゴリズム）
 */
function splitArm(a: Arm, t: number): string {
  const p01 = lerp(a.from, a.c1, t);
  const p12 = lerp(a.c1, a.c2, t);
  const p23 = lerp(a.c2, a.to, t);
  const p012 = lerp(p01, p12, t);
  const p123 = lerp(p12, p23, t);
  const end = lerp(p012, p123, t);
  return curve(a.from, p01, p012, end);
}

/** 半袖の袖丈。腕の付け根から4割ほどのところで切る */
export function shortSleevePath(side: number, pose: Pose = NEUTRAL): string {
  return splitArm(armFor(pose, side), 0.42);
}

/** 七分袖など、好きな長さで切りたいとき */
export function sleevePath(side: number, length: number, pose: Pose = NEUTRAL): string {
  return splitArm(armFor(pose, side), Math.min(Math.max(length, 0.05), 1));
}

/* --------------------------------- 脚 --------------------------------- */

export function thighPath(side: number, pose: Pose = NEUTRAL): string {
  const l = legFor(pose, side);
  return curve(l.hip, l.thighC1, l.thighC2, l.knee);
}

export function calfPath(side: number, pose: Pose = NEUTRAL): string {
  const l = legFor(pose, side);
  // 膝で少し重ねて描くと、腿と脛のつなぎ目が出ない
  const knee: Pt = { dx: l.knee.dx, y: l.knee.y - 2 };
  return curve(knee, l.calfC1, l.calfC2, l.ankle);
}

/** 膝の位置（ハイライト用） */
export function kneePos(side: number, pose: Pose = NEUTRAL): { x: number; y: number } {
  const l = legFor(pose, side);
  return { x: CX + l.knee.dx, y: l.knee.y };
}

/** 足の位置と向き */
export function footPos(
  side: number,
  pose: Pose = NEUTRAL,
): { x: number; y: number; angle: number } {
  const l = legFor(pose, side);
  return { x: CX + l.ankle.dx, y: l.ankle.y + 6, angle: l.footAngle };
}

/** 接地影の中心。両足の真ん中に置くと、脚を組んでも影がずれない */
export function groundPos(pose: Pose = NEUTRAL): { x: number; y: number; rx: number } {
  const left = pose.legs.left.ankle;
  const right = pose.legs.right.ankle;
  const spread = Math.abs(right.dx - left.dx);
  return {
    x: CX + (left.dx + right.dx) / 2,
    y: Math.max(left.y, right.y) + 12,
    rx: 42 + spread * 0.5,
  };
}
