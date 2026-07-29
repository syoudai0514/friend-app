"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BackButton } from "@/components/ui";
import { AFFECTION_LEVELS, affectionLevel } from "@/lib/catalog";
import { useStore } from "@/lib/store";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-bold text-[#4a4a5a]">{label}</span>
      {hint && <span className="mt-0.5 block text-[11px] text-[#9a9aa8]">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#dfe2ea] bg-white px-3.5 py-2.5 text-[15px] " +
  "text-[#2b2b33] outline-none focus:border-pink-cta";

export default function SettingsPage() {
  const router = useRouter();
  const { state, ready, update, setPersona, resetAll } = useStore();

  if (!ready) return <div className="flex-1 bg-[#12121a]" />;

  const level = affectionLevel(state.affection);
  const p = state.persona;

  return (
    <div className="flex h-full flex-col bg-[#f6f7fa]">
      <header className="safe-top flex items-center gap-3 bg-white px-3 pb-3 shadow-sm">
        <BackButton />
        <h1 className="text-[17px] font-bold text-[#2b2b33]">せってい</h1>
      </header>

      <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto p-4 pb-10">
        {/* ------------------------------ あなた ------------------------------ */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-[14px] font-bold text-[#2b2b33]">あなたのこと</h2>
          <Field label="呼ばれたい名前">
            <input
              className={inputClass}
              value={state.userName}
              maxLength={12}
              onChange={(e) => update({ userName: e.target.value })}
            />
          </Field>
          <div className="rounded-xl bg-[#fff4f8] px-3.5 py-2.5 text-[12px] text-[#8a6a76]">
            いまの呼ばれ方は「
            <strong className="text-pink-cta-deep">
              {state.userName}
              {p.honorific}
            </strong>
            」
          </div>
        </section>

        {/* ------------------------------ キャラ ------------------------------ */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-[#2b2b33]">キャラのこと</h2>
            <button
              onClick={() => router.push("/characters")}
              className="rounded-full bg-[#eef4fb] px-3 py-1.5 text-[12px] font-bold text-blue-menu"
            >
              別のキャラにする
            </button>
          </div>

          <Field label="名前">
            <input
              className={inputClass}
              value={p.name}
              maxLength={12}
              onChange={(e) => setPersona({ name: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="一人称">
              <input
                className={inputClass}
                value={p.firstPerson}
                maxLength={8}
                onChange={(e) => setPersona({ firstPerson: e.target.value })}
              />
            </Field>
            <Field label="あなたにつける敬称" hint="空なら呼び捨て">
              <input
                className={inputClass}
                value={p.honorific}
                maxLength={6}
                placeholder="さん / くん / ちゃん"
                onChange={(e) => setPersona({ honorific: e.target.value })}
              />
            </Field>
          </div>

          <Field label="口調" hint="どんな話し方をするか">
            <textarea
              className={`${inputClass} h-24 resize-none leading-relaxed`}
              value={p.speech}
              onChange={(e) => setPersona({ speech: e.target.value })}
            />
          </Field>

          <Field label="性格" hint="どんな人柄か、どう接してほしいか">
            <textarea
              className={`${inputClass} h-28 resize-none leading-relaxed`}
              value={p.personality}
              onChange={(e) => setPersona({ personality: e.target.value })}
            />
          </Field>

          <Field label="ホーム画面のセリフ" hint="1行に1つ。{user} はあなたの呼び方に変わります">
            <textarea
              className={`${inputClass} h-28 resize-none leading-relaxed`}
              value={p.idleLines.join("\n")}
              onChange={(e) =>
                setPersona({ idleLines: e.target.value.split("\n").filter((l) => l.trim()) })
              }
            />
          </Field>
        </section>

        {/* ------------------------------ 好感度 ------------------------------ */}
        <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-[14px] font-bold text-[#2b2b33]">ふたりの関係</h2>
          <p className="text-[13px] text-[#5c5c6b]">
            好感度 <strong className="text-pink-cta-deep">{state.affection}</strong>／Lv.
            {level.level}「{level.label}」
          </p>
          <p className="text-[11px] leading-relaxed text-[#9a9aa8]">
            話しかけるたびに1ずつ上がります。レベルが上がると距離感と話し方が変わります。
          </p>
          <ul className="space-y-1 pt-1">
            {AFFECTION_LEVELS.map((lv) => (
              <li
                key={lv.level}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] ${
                  lv.level === level.level
                    ? "bg-[#fff4f8] font-bold text-pink-cta-deep"
                    : state.affection >= lv.threshold
                      ? "text-[#5c5c6b]"
                      : "text-[#c0c0cc]"
                }`}
              >
                <span className="w-8 shrink-0 tabular-nums">Lv.{lv.level}</span>
                <span className="flex-1">{lv.label}</span>
                <span className="tabular-nums">{lv.threshold}〜</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------ その他 ------------------------------ */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-[14px] font-bold text-[#2b2b33]">データ</h2>
          <p className="text-[11px] leading-relaxed text-[#9a9aa8]">
            会話・見た目・好感度はすべてこの端末のブラウザにだけ保存されます。
            サーバーには残りません。
          </p>
          <button
            onClick={() => {
              if (confirm("すべてのデータを消して最初からやり直しますか？")) {
                resetAll();
                router.push("/");
              }
            }}
            className="w-full rounded-xl border border-[#f0c8d4] bg-white py-3 text-[14px]
                       font-bold text-[#d9536a] active:bg-[#fff4f8]"
          >
            すべてリセットする
          </button>
        </section>
      </div>
    </div>
  );
}
