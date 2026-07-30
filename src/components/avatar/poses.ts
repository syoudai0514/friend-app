/**
 * ポーズ。手足の位置だけを差し替える。
 *
 * 胴・腰・スカートは BODY の固定値で描かれているので、ポーズが変えるのは
 * 腕・手・脚・足だけにしてある。こうすると
 * 「どの衣装 × どのポーズ」でも破綻せずに組み合わせられる。
 * 袖は腕の曲線を途中で切って作るので（geometry の sleevePath）、
 * 服側を1つも書き換えずに新しいポーズへ追従する。
 *
 * 座標は Avatar と同じ 300×640 の世界。
 * dx は中心（CX）からの符号つきの横ずれで、左半身が負・右半身が正。
 * 左右で違う形のポーズ（頬に手を当てるなど）も書けるように、
 * side を掛ける方式ではなく符号込みの実数で持たせている。
 */

import { BODY } from "./geometry-base";

/** 手足の関節ひとつぶん */
export interface Pt {
  /** 中心からの横ずれ（左が負） */
  dx: number;
  y: number;
}

/** 腕1本。肩から手首までの3次ベジェ */
export interface Arm {
  /** 肩の付け根 */
  from: Pt;
  c1: Pt;
  c2: Pt;
  /** 手首 */
  to: Pt;
  /** 手の傾き（度）。0 で下向き */
  handAngle: number;
}

/** 脚1本。腿と脛をつなげて描く */
export interface Leg {
  hip: Pt;
  thighC1: Pt;
  thighC2: Pt;
  knee: Pt;
  calfC1: Pt;
  calfC2: Pt;
  ankle: Pt;
  /** つま先の開き（度） */
  footAngle: number;
}

export interface Pose {
  arms: { left: Arm; right: Arm };
  legs: { left: Leg; right: Leg };
  /** 頭の傾き（度）。少し傾けるだけで表情がつく */
  headTilt: number;
}

/** 右半身の形から左半身を作る（左右対称のポーズ用） */
function mirrorArm(a: Arm): Arm {
  return {
    from: { dx: -a.from.dx, y: a.from.y },
    c1: { dx: -a.c1.dx, y: a.c1.y },
    c2: { dx: -a.c2.dx, y: a.c2.y },
    to: { dx: -a.to.dx, y: a.to.y },
    handAngle: -a.handAngle,
  };
}

function mirrorLeg(l: Leg): Leg {
  return {
    hip: { dx: -l.hip.dx, y: l.hip.y },
    thighC1: { dx: -l.thighC1.dx, y: l.thighC1.y },
    thighC2: { dx: -l.thighC2.dx, y: l.thighC2.y },
    knee: { dx: -l.knee.dx, y: l.knee.y },
    calfC1: { dx: -l.calfC1.dx, y: l.calfC1.y },
    calfC2: { dx: -l.calfC2.dx, y: l.calfC2.y },
    ankle: { dx: -l.ankle.dx, y: l.ankle.y },
    footAngle: -l.footAngle,
  };
}

/** 左右対称のポーズを、右半身ぶんの記述だけから組み立てる */
function symmetric(arm: Arm, leg: Leg, headTilt = 0): Pose {
  return {
    arms: { right: arm, left: mirrorArm(arm) },
    legs: { right: leg, left: mirrorLeg(leg) },
    headTilt,
  };
}

/* ------------------------------ 脚のかたち ------------------------------ */

/** まっすぐ立つ。基準になる脚 */
const LEG_STRAIGHT: Leg = {
  hip: { dx: 22, y: BODY.crotch - 4 },
  thighC1: { dx: 25, y: BODY.crotch + 44 },
  thighC2: { dx: 24, y: BODY.knee - 30 },
  knee: { dx: 23, y: BODY.knee },
  calfC1: { dx: 22, y: BODY.knee + 40 },
  calfC2: { dx: 21, y: BODY.ankle - 26 },
  ankle: { dx: 21, y: BODY.ankle },
  footAngle: 0,
};

/** 脚をそろえて内股ぎみに。足先がほぼくっつく */
const LEG_TOGETHER: Leg = {
  hip: { dx: 22, y: BODY.crotch - 4 },
  thighC1: { dx: 24, y: BODY.crotch + 44 },
  thighC2: { dx: 20, y: BODY.knee - 30 },
  knee: { dx: 18, y: BODY.knee },
  calfC1: { dx: 16, y: BODY.knee + 40 },
  calfC2: { dx: 11, y: BODY.ankle - 26 },
  ankle: { dx: 9, y: BODY.ankle },
  footAngle: 6,
};

/** 片脚をもう片方の前に流す。立ち絵でよくある崩した立ち方 */
const LEG_CROSS_FRONT: Leg = {
  hip: { dx: 22, y: BODY.crotch - 4 },
  thighC1: { dx: 24, y: BODY.crotch + 44 },
  thighC2: { dx: 16, y: BODY.knee - 30 },
  knee: { dx: 12, y: BODY.knee + 4 },
  calfC1: { dx: 6, y: BODY.knee + 44 },
  calfC2: { dx: -6, y: BODY.ankle - 24 },
  ankle: { dx: -10, y: BODY.ankle + 2 },
  footAngle: 14,
};

const LEG_CROSS_BACK: Leg = {
  hip: { dx: -22, y: BODY.crotch - 4 },
  thighC1: { dx: -25, y: BODY.crotch + 44 },
  thighC2: { dx: -22, y: BODY.knee - 30 },
  knee: { dx: -20, y: BODY.knee },
  calfC1: { dx: -18, y: BODY.knee + 40 },
  calfC2: { dx: -14, y: BODY.ankle - 26 },
  ankle: { dx: -12, y: BODY.ankle },
  footAngle: -8,
};

/** 脚を開いて立つ */
const LEG_APART: Leg = {
  hip: { dx: 22, y: BODY.crotch - 4 },
  thighC1: { dx: 28, y: BODY.crotch + 44 },
  thighC2: { dx: 32, y: BODY.knee - 30 },
  knee: { dx: 33, y: BODY.knee },
  calfC1: { dx: 34, y: BODY.knee + 40 },
  calfC2: { dx: 35, y: BODY.ankle - 26 },
  ankle: { dx: 35, y: BODY.ankle },
  footAngle: -8,
};

/* ------------------------------ 腕のかたち ------------------------------ */

/** 自然に下ろした腕 */
const ARM_NATURAL: Arm = {
  from: { dx: 34, y: BODY.shoulder + 2 },
  c1: { dx: 58, y: BODY.bust + 6 },
  c2: { dx: 67, y: BODY.waist + 14 },
  to: { dx: 66, y: BODY.crotch },
  handAngle: 0,
};

/** 体側にぴったり寄せた腕 */
const ARM_DOWN: Arm = {
  from: { dx: 34, y: BODY.shoulder + 2 },
  c1: { dx: 50, y: BODY.bust + 6 },
  c2: { dx: 54, y: BODY.waist + 18 },
  to: { dx: 53, y: BODY.crotch + 12 },
  handAngle: -2,
};

/** 手のひらを見せて軽く開いた腕 */
const ARM_OUT: Arm = {
  from: { dx: 34, y: BODY.shoulder + 2 },
  c1: { dx: 64, y: BODY.bust + 4 },
  c2: { dx: 84, y: BODY.waist + 16 },
  to: { dx: 88, y: BODY.crotch - 8 },
  handAngle: 16,
};

/** 頬に指を添える（右腕） */
const ARM_TO_CHEEK: Arm = {
  from: { dx: 34, y: BODY.shoulder + 2 },
  c1: { dx: 64, y: BODY.bust - 2 },
  c2: { dx: 56, y: BODY.neckTop + 18 },
  to: { dx: 27, y: 132 },
  handAngle: -150,
};

/** お腹の前で軽く支える（左腕）。頬に手を当てるポーズの相方 */
const ARM_ACROSS: Arm = {
  from: { dx: -34, y: BODY.shoulder + 2 },
  c1: { dx: -60, y: BODY.bust + 10 },
  c2: { dx: -46, y: BODY.waist + 26 },
  to: { dx: 4, y: BODY.waist + 22 },
  handAngle: 78,
};

/** 腰に手を当てる（右腕） */
const ARM_ON_HIP: Arm = {
  from: { dx: 34, y: BODY.shoulder + 2 },
  c1: { dx: 66, y: BODY.bust + 10 },
  c2: { dx: 62, y: BODY.waist + 40 },
  to: { dx: 38, y: BODY.hip - 2 },
  handAngle: 62,
};

/** 手を上げて振る（右腕） */
const ARM_WAVE: Arm = {
  from: { dx: 34, y: BODY.shoulder + 2 },
  c1: { dx: 68, y: BODY.bust - 6 },
  c2: { dx: 78, y: BODY.neckTop - 22 },
  to: { dx: 62, y: 72 },
  handAngle: -178,
};

/** 背中に回した腕 */
const ARM_BEHIND: Arm = {
  from: { dx: 34, y: BODY.shoulder + 2 },
  c1: { dx: 52, y: BODY.bust + 12 },
  c2: { dx: 44, y: BODY.waist + 34 },
  to: { dx: 18, y: BODY.hip + 10 },
  handAngle: 40,
};

/* -------------------------------- ポーズ -------------------------------- */

export const POSES: Record<string, Pose> = {
  /** 基準の立ち姿。今までのアバターと同じ形 */
  natural: symmetric(ARM_NATURAL, LEG_STRAIGHT),

  /** 手のひらを見せて迎えるように立つ */
  armsout: symmetric(ARM_OUT, LEG_TOGETHER, -2),

  /** 腕を体側にそろえた、かしこまった立ち方 */
  armsdown: symmetric(ARM_DOWN, LEG_TOGETHER, 0),

  /** 脚を開いて堂々と立つ */
  apart: symmetric(ARM_NATURAL, LEG_APART, 0),

  /** 頬に指を添えて小首をかしげる */
  touchcheek: {
    arms: { right: ARM_TO_CHEEK, left: ARM_ACROSS },
    legs: { right: LEG_CROSS_FRONT, left: LEG_CROSS_BACK },
    headTilt: -6,
  },

  /** 片手を腰に当てて、もう片方は自然に下ろす */
  handhip: {
    arms: { right: ARM_ON_HIP, left: mirrorArm(ARM_NATURAL) },
    legs: { right: LEG_STRAIGHT, left: mirrorLeg(LEG_APART) },
    headTilt: 4,
  },

  /** 手を上げて呼びかける */
  wave: {
    arms: { right: ARM_WAVE, left: mirrorArm(ARM_DOWN) },
    legs: { right: LEG_TOGETHER, left: mirrorLeg(LEG_TOGETHER) },
    headTilt: -5,
  },

  /** 両手を後ろに回して、少し照れたように立つ */
  behind: {
    arms: { right: ARM_BEHIND, left: mirrorArm(ARM_BEHIND) },
    legs: { right: LEG_CROSS_FRONT, left: LEG_CROSS_BACK },
    headTilt: 7,
  },
};

export const DEFAULT_POSE_ID = "natural";

export function poseById(id: string | undefined): Pose {
  return POSES[id ?? ""] ?? POSES[DEFAULT_POSE_ID];
}
