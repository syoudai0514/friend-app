"use client";

import Link from "next/link";
import { useState } from "react";
import { AffectionGauge, SideMenu, Stage } from "@/components/ui";
import { idleLine } from "@/lib/prompt";
import { useStore } from "@/lib/store";

const MENU = [
  { href: "/closet", icon: "👗", label: "クローゼット", accent: true },
  { href: "/characters", icon: "💞", label: "キャラ" },
  { href: "/chat", icon: "💬", label: "トーク" },
  { href: "/settings", icon: "⚙️", label: "せってい" },
];

export default function Home() {
  const { state, ready, update } = useStore();
  const [nameInput, setNameInput] = useState("");
  // ↻ を押すたびに次のセリフへ。好感度を起点にすることで、
  // 開くたびに違うセリフから始まる
  const [step, setStep] = useState(0);
  const line = idleLine(state.persona, state.userName, state.affection + step);

  if (!ready) {
    return <div className="flex-1 bg-[#12121a]" />;
  }

  /* ------------------------- 初回の名前入力 ------------------------- */
  if (!state.onboarded) {
    const submit = () => {
      const name = nameInput.trim();
      update({ userName: name || "あなた", onboarded: true });
    };
    return (
      <Stage look={state.look} dim={0.45}>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-7">
          <div className="w-full rounded-3xl bg-white/95 p-6 shadow-2xl">
            <h1 className="text-center text-[19px] font-bold text-[#2b2b33]">はじめまして</h1>
            <p className="mt-3 text-center text-[13px] leading-relaxed text-[#5c5c6b]">
              {state.persona.name}はあなたを
              <br />
              なんて呼べばいい？
            </p>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="なまえ"
              maxLength={12}
              autoFocus
              className="mt-5 w-full rounded-full border-2 border-[#ffd0de] bg-white px-5 py-3
                         text-center text-[16px] text-[#2b2b33] outline-none focus:border-pink-cta"
            />
            <p className="mt-2 text-center text-[11px] text-[#9a9aa8]">
              あとから「せってい」で変えられます
            </p>
            <button onClick={submit} className="cta mt-5">
              はじめる
            </button>
          </div>
        </div>
      </Stage>
    );
  }

  /* ----------------------------- ホーム ----------------------------- */
  return (
    <Stage look={state.look}>
      {/* 上部 */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <AffectionGauge affection={state.affection} />
        <Link
          href="/settings"
          className="grid h-11 w-11 place-items-center rounded-full bg-blue-menu
                     shadow-[0_2px_8px_rgba(0,0,0,.3)] active:scale-90"
          aria-label="メニュー"
        >
          <span className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-[17px] rounded bg-white" />
            <span className="block h-[2px] w-[17px] rounded bg-white" />
            <span className="block h-[2px] w-[17px] rounded bg-white" />
          </span>
        </Link>
      </div>

      <SideMenu items={MENU} />

      {/* 下部のセリフ＋CTA */}
      <div className="absolute inset-x-0 bottom-0 p-3 pb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="name-tag">{state.persona.name}</span>
          <button
            onClick={() => setStep((s) => s + 1)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/85 text-[15px]
                       text-[#5c5c6b] shadow-[0_2px_6px_rgba(0,0,0,.2)] active:scale-90"
            aria-label="セリフを変える"
          >
            ↻
          </button>
        </div>

        <div key={line} className="bubble animate-rise min-h-[76px]">
          {line}
        </div>

        <Link href="/chat" className="mt-3 block">
          <span className="cta block">{state.persona.name}に話しかける</span>
        </Link>
      </div>
    </Stage>
  );
}
