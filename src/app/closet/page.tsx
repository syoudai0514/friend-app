"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/avatar/Avatar";
import { Scene } from "@/components/avatar/Scene";
import { CharacterArt } from "@/components/CharacterArt";
import { RarityBadge } from "@/components/ui";
import {
  CLOSET_TABS,
  EYE_COLORS,
  HAIR,
  HAIR_COLORS,
  MAKEUP,
  OUTFIT,
  SCENE,
  SKIN,
} from "@/lib/catalog";
import { useAssets } from "@/lib/assets";
import { useStore } from "@/lib/store";
import type { ColorOption, Crop, Look, PartOption } from "@/lib/types";

const TAB_ICONS: Record<string, string> = {
  outfit: "👕",
  hair: "💇",
  accessory: "🎀",
  parts: "👤",
  scene: "🖼",
};

function isColorOption(o: PartOption | ColorOption): o is ColorOption {
  return "value" in o;
}

/** ランダムな見た目を作る（🎲ボタン用） */
function randomLook(current: Look): Look {
  const pick = <T extends { id: string }>(list: T[]) =>
    list[Math.floor(Math.random() * list.length)].id;
  return {
    ...current,
    hair: pick(HAIR),
    hairColor: pick(HAIR_COLORS),
    eyeColor: pick(EYE_COLORS),
    makeup: pick(MAKEUP),
    outfit: pick(OUTFIT),
    skin: pick(SKIN),
    scene: pick(SCENE),
  };
}

export default function ClosetPage() {
  const router = useRouter();
  const { state, ready, setLook } = useStore();
  const { outfitsWithArt, characterSrc } = useAssets();

  // 何も触っていないうちは保存済みの見た目をそのまま映す。
  // 一度でも触ったら edited が下書きになる（localStorage の読み込み待ちも兼ねる）
  const [edited, setEdited] = useState<Look | null>(null);
  const draft = edited ?? state.look;
  const setDraft = setEdited;

  const [tabId, setTabId] = useState(CLOSET_TABS[0].id);
  const [subIndex, setSubIndex] = useState(0);

  const tab = CLOSET_TABS.find((t) => t.id === tabId) ?? CLOSET_TABS[0];
  const sub = tab.subTabs[Math.min(subIndex, tab.subTabs.length - 1)];

  const dirty = useMemo(
    () => edited !== null && JSON.stringify(edited) !== JSON.stringify(state.look),
    [edited, state.look],
  );

  if (!ready) return <div className="flex-1 bg-[#12121a]" />;

  const artOutfits = outfitsWithArt(state.persona.id);
  // 立ち絵の写真を使っているあいだは、髪や顔のパーツは絵に焼き付いているので反映されない
  const usingPhoto = characterSrc(state.persona.id, draft.outfit) !== null;
  const photoLocksTab = usingPhoto && ["hair", "accessory", "parts"].includes(tabId);

  const save = () => {
    setLook(draft);
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col">
      {/* ------------------------------ プレビュー ------------------------------ */}
      <div className="relative flex-1 overflow-hidden">
        <Scene id={draft.scene} blur={3} />
        <CharacterArt
          look={draft}
          personaId={state.persona.id}
          crop="preview"
          className="absolute inset-0 h-full w-full"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <button
            onClick={() => router.push("/")}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/92 text-[19px]
                       font-bold text-[#5c5c6b] shadow-[0_2px_8px_rgba(0,0,0,.28)] active:scale-90"
            aria-label="閉じる"
          >
            ✕
          </button>
          <button
            onClick={save}
            className="rounded-full bg-gradient-to-b from-[#ff8fb2] to-pink-cta-deep px-7 py-2.5
                       text-[15px] font-bold text-white shadow-[0_3px_10px_rgba(240,68,124,.45)]
                       transition active:scale-95"
          >
            保存する
          </button>
        </div>

        <div className="absolute right-3 bottom-4 flex flex-col gap-2.5">
          <button
            onClick={() => setDraft(randomLook(draft))}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/92 text-[19px]
                       shadow-[0_2px_8px_rgba(0,0,0,.28)] active:scale-90"
            aria-label="ランダム"
          >
            🎲
          </button>
          <button
            onClick={() => setEdited(null)}
            disabled={!dirty}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/92 text-[19px]
                       text-[#5c5c6b] shadow-[0_2px_8px_rgba(0,0,0,.28)] transition
                       active:scale-90 disabled:opacity-40"
            aria-label="やり直す"
          >
            ↺
          </button>
        </div>
      </div>

      {/* ------------------------------ 選択パネル ------------------------------ */}
      <div className="h-[46%] shrink-0 bg-white">
        {/* メインタブ */}
        <div className="flex border-b border-[#e8e8ef]">
          {CLOSET_TABS.map((t) => {
            const active = t.id === tabId;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTabId(t.id);
                  setSubIndex(0);
                }}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px]
                            font-bold transition ${
                              active ? "text-blue-menu" : "text-[#a0a0b0]"
                            }`}
              >
                <span className={`text-[19px] ${active ? "" : "grayscale opacity-60"}`}>
                  {TAB_ICONS[t.id]}
                </span>
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-blue-menu" />
                )}
              </button>
            );
          })}
        </div>

        {/* サブタブ */}
        {tab.subTabs.length > 1 && (
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto bg-[#f6f7fa] px-3 py-2">
            {tab.subTabs.map((s, i) => {
              const active = i === Math.min(subIndex, tab.subTabs.length - 1);
              return (
                <button
                  key={s.key}
                  onClick={() => setSubIndex(i)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-bold transition ${
                    active ? "bg-blue-menu text-white shadow-sm" : "text-[#7a7a8c]"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}

        {photoLocksTab && (
          <p className="bg-[#fff4e5] px-3 py-1.5 text-[11px] leading-snug text-[#8a6a3a]">
            いまの衣装は用意した立ち絵を使っているので、ここの変更は見た目に反映されません。
          </p>
        )}

        {/* アイテム一覧 */}
        <div
          className={`no-scrollbar overflow-y-auto px-2.5 py-2.5 ${
            photoLocksTab ? "h-[calc(100%-124px)]" : "h-[calc(100%-96px)]"
          }`}
        >
          <div className="grid grid-cols-5 gap-2">
            {sub.options.map((opt) => {
              const selected = draft[sub.key] === opt.id;
              const preview: Look = { ...draft, [sub.key]: opt.id };
              return (
                <button
                  key={opt.id}
                  onClick={() => setDraft(preview)}
                  title={opt.name}
                  className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-b
                              from-[#eef6fd] to-[#d9e9f7] transition active:scale-95 ${
                                selected ? "border-pink-cta" : "border-transparent"
                              }`}
                >
                  <div className="relative aspect-square w-full">
                    {sub.crop === "scene" ? (
                      <Scene id={opt.id} />
                    ) : isColorOption(opt) && sub.key === "skin" ? (
                      <Avatar look={preview} crop="face" className="absolute inset-0 h-full w-full" />
                    ) : isColorOption(opt) && sub.key === "hairColor" ? (
                      <Avatar look={preview} crop="head" className="absolute inset-0 h-full w-full" />
                    ) : isColorOption(opt) ? (
                      <Avatar look={preview} crop="face" className="absolute inset-0 h-full w-full" />
                    ) : (
                      <CharacterArt
                        look={preview}
                        personaId={state.persona.id}
                        crop={sub.crop as Crop}
                        className="absolute inset-0 h-full w-full"
                      />
                    )}
                  </div>
                  {!isColorOption(opt) && (
                    <span className="absolute top-0.5 right-1">
                      <RarityBadge rarity={opt.rarity} />
                    </span>
                  )}
                  {/* 用意した立ち絵がある衣装には印をつける */}
                  {sub.key === "outfit" && artOutfits.has(opt.id) && (
                    <span
                      className="absolute top-0.5 left-1 text-[10px]"
                      title="用意した立ち絵を使います"
                    >
                      📷
                    </span>
                  )}
                  <span
                    className="absolute inset-x-0 bottom-0 truncate bg-black/45 px-1 py-[2px]
                               text-[9px] font-bold text-white"
                  >
                    {opt.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
