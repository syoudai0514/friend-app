"use client";

import { Avatar } from "@/components/avatar/Avatar";
import { useAssets } from "@/lib/assets";
import type { Crop, Look } from "@/lib/types";

/** 立ち絵の写真が使える切り抜き。顔パーツのサムネイルはSVGのまま */
const PHOTO_CROPS: Crop[] = ["full", "preview", "bust"];

/**
 * キャラの立ち絵。
 * public/characters/<キャラID>/<衣装ID>.png があればそれを使い、
 * 無ければ従来どおりSVGで描く。
 */
export function CharacterArt({
  look,
  personaId,
  crop = "full",
  className = "",
}: {
  look: Look;
  personaId: string;
  crop?: Crop;
  className?: string;
}) {
  const { characterSrc } = useAssets();
  const src = PHOTO_CROPS.includes(crop) ? characterSrc(personaId, look.outfit) : null;

  if (!src) {
    return <Avatar look={look} crop={crop} className={className} />;
  }

  // bust（服のサムネ）は上半身が見たいので上寄せで切る。
  // それ以外は全身を収めて足元を揃える。
  const fit =
    crop === "bust" ? "object-cover object-top" : "object-contain object-bottom";

  return (
    // eslint-disable-next-line @next/next/no-img-element -- 利用者が後から置く画像なので寸法が不定
    <img
      src={src}
      alt=""
      className={`${className} ${fit}`}
      draggable={false}
    />
  );
}
