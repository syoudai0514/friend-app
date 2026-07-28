"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar/Avatar";
import { useAssets } from "@/lib/assets";
import type { Expression } from "@/lib/expressions";
import type { Crop, Look } from "@/lib/types";

/** 立ち絵の写真が使える切り抜き。顔パーツのサムネイルはSVGのまま */
const PHOTO_CROPS: Crop[] = ["full", "preview", "bust"];
/** 大きく映すときだけ動かす。サムネイルが揺れていると鬱陶しいので */
const MOTION_CROPS: Crop[] = ["full", "preview"];

/** まばたきの間隔（ミリ秒）。一定だと機械っぽいので毎回ばらす */
function nextBlinkDelay() {
  return 2600 + Math.random() * 3600;
}

/**
 * キャラの立ち絵。
 * public/characters/<キャラID>/<衣装ID>.png があればそれを使い、
 * 無ければSVGで描く。どちらでも呼吸と揺れは同じように付く。
 */
export function CharacterArt({
  look,
  personaId,
  crop = "full",
  className = "",
  expression = "normal",
  talking = false,
}: {
  look: Look;
  personaId: string;
  crop?: Crop;
  className?: string;
  /** 表情。SVGなら顔パーツを差し替え、写真なら表情差分の画像を探す */
  expression?: Expression;
  /** しゃべっている最中。口が動いて、話し始めに小さく弾む */
  talking?: boolean;
}) {
  const { characterSrc } = useAssets();
  const animate = MOTION_CROPS.includes(crop);

  const [blink, setBlink] = useState(false);
  const [mouthPhase, setMouthPhase] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ------------------------------ まばたき ------------------------------ */
  useEffect(() => {
    if (!animate) return;
    let alive = true;
    const schedule = () => {
      const t = setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        const close = setTimeout(() => {
          if (!alive) return;
          setBlink(false);
          schedule();
        }, 130);
        timers.current.push(close);
      }, nextBlinkDelay());
      timers.current.push(t);
    };
    schedule();
    return () => {
      alive = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [animate]);

  /* ------------------------------ 口の動き ------------------------------ */
  useEffect(() => {
    if (!animate || !talking) return;
    const id = setInterval(() => setMouthPhase((v) => !v), 170);
    return () => clearInterval(id);
  }, [animate, talking]);

  // しゃべっていないときは閉じた口。状態を戻す処理は要らない
  const mouthOpen = animate && talking && mouthPhase;

  const src = PHOTO_CROPS.includes(crop) ? characterSrc(personaId, look.outfit, expression) : null;

  const inner = src ? (
    // bust（服のサムネ）は上半身が見たいので上寄せで切る。
    // それ以外は全身を収めて足元を揃える
    // eslint-disable-next-line @next/next/no-img-element -- 利用者が後から置く画像なので寸法が不定
    <img
      src={src}
      alt=""
      draggable={false}
      className={`h-full w-full ${
        crop === "bust" ? "object-cover object-top" : "object-contain object-bottom"
      }`}
    />
  ) : (
    <Avatar
      look={look}
      crop={crop}
      className="h-full w-full"
      expression={expression}
      blink={blink}
      mouthOpen={mouthOpen}
    />
  );

  if (!animate) {
    return <div className={className}>{inner}</div>;
  }

  // 揺れ・呼吸・弾みは別々の入れ物に分ける。
  // ひとつの要素に重ねると transform が上書きし合ってしまう。
  // 弾みは key を変えて描き直させることでアニメを頭から流す
  return (
    <div className={className}>
      <div className="char-sway">
        <div className="char-breathe">
          <div key={talking ? "talk" : "idle"} className={talking ? "char-react" : ""}>
            {inner}
          </div>
        </div>
      </div>
    </div>
  );
}
