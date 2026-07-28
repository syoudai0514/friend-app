"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/avatar/Avatar";
import { Scene } from "@/components/avatar/Scene";
import { AFFECTION_LEVELS, affectionLevel, affectionProgress } from "@/lib/catalog";
import type { Look } from "@/lib/types";

/** 背景シーン＋立ち絵。子要素はその上に重なる */
export function Stage({
  look,
  children,
  dim = 0,
}: {
  look: Look;
  children?: ReactNode;
  dim?: number;
}) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <Scene id={look.scene} blur={3} />
      <Avatar look={look} className="absolute inset-0 h-full w-full" />
      {dim > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: dim }} />
      )}
      {children}
    </div>
  );
}

/** 左上の好感度ゲージ */
export function AffectionGauge({ affection }: { affection: number }) {
  const level = affectionLevel(affection);
  const progress = affectionProgress(affection);
  const isMax = level.level === AFFECTION_LEVELS.length;

  return (
    <div className="counter-pill">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-b from-[#ff8fb2] to-pink-cta-deep text-[12px]">
        ♥
      </span>
      <span className="tabular-nums">{affection}</span>
      <span className="relative h-[9px] w-[58px] overflow-hidden rounded-full bg-white/25">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff9ec0] to-pink-cta-deep transition-[width] duration-500"
          style={{ width: `${Math.min(100, Math.max(4, progress * 100))}%` }}
        />
      </span>
      <span className="text-[10px] font-bold whitespace-nowrap opacity-90">
        {isMax ? "MAX" : `Lv.${level.level}`}
      </span>
    </div>
  );
}

/** 右側の縦並びメニュー */
export function SideMenu({
  items,
}: {
  items: { href: string; icon: string; label: string; accent?: boolean }[];
}) {
  return (
    <nav className="absolute top-16 right-2 flex flex-col gap-2.5">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`menu-btn ${it.accent ? "menu-btn-accent" : ""}`}
        >
          <span className="text-[17px] leading-none">{it.icon}</span>
          <span className="mt-0.5 leading-none">{it.label}</span>
        </Link>
      ))}
    </nav>
  );
}

/** 左上の戻るボタン */
export function BackButton({ href = "/", label = "◀" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="grid h-11 w-11 place-items-center rounded-full bg-white/92 text-[18px]
                 font-bold text-[#3a3f52] shadow-[0_2px_8px_rgba(0,0,0,.28)] active:scale-90"
      aria-label="戻る"
    >
      {label}
    </Link>
  );
}

/** レアリティのバッジ */
export function RarityBadge({ rarity }: { rarity: string }) {
  return (
    <span className={`rarity-${rarity} text-[11px] font-black italic`}>{rarity}</span>
  );
}

/** 読み込み中の三点リーダー */
export function Dots() {
  return (
    <span className="inline-flex gap-1 align-middle">
      <span className="dot h-1.5 w-1.5 rounded-full bg-current" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-current" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}
