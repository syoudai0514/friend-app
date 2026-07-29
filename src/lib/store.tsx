"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEFAULT_LOOK } from "./catalog";
import { DEFAULT_PERSONA, PRESETS } from "./personas";
import type { AppState, ChatMessage, Look, Persona } from "./types";

const STORAGE_KEY = "friend-app:v1";

/** 覚えておく要点は増えすぎないよう、直近のものだけ残す */
const MAX_MEMORIES = 40;

const INITIAL: AppState = {
  onboarded: false,
  userName: "あなた",
  persona: DEFAULT_PERSONA,
  look: DEFAULT_LOOK,
  affection: 0,
  messages: [],
  memories: [],
};

/** 保存済みデータに欠けたキーがあっても壊れないようにする。エクスポートしたJSONの読み込みにも使う */
export function reconcile(saved: unknown): AppState {
  if (!saved || typeof saved !== "object") return INITIAL;
  const s = saved as Partial<AppState>;
  return {
    onboarded: s.onboarded === true,
    userName: typeof s.userName === "string" && s.userName ? s.userName : INITIAL.userName,
    persona: { ...DEFAULT_PERSONA, ...(s.persona ?? {}) } as Persona,
    look: { ...DEFAULT_LOOK, ...(s.look ?? {}) } as Look,
    affection: typeof s.affection === "number" ? s.affection : 0,
    messages: Array.isArray(s.messages) ? (s.messages as ChatMessage[]) : [],
    memories: Array.isArray(s.memories) ? s.memories.filter((m) => typeof m === "string") : [],
  };
}

interface StoreValue {
  state: AppState;
  /** localStorage からの読み込みが終わったか */
  ready: boolean;
  update: (patch: Partial<AppState>) => void;
  setLook: (patch: Partial<Look>) => void;
  setPersona: (patch: Partial<Persona>) => void;
  addMessage: (m: ChatMessage) => void;
  /** 直近の model メッセージを置き換える（ストリーミング用） */
  replaceLastModel: (text: string) => void;
  gainAffection: (n: number) => void;
  /** 会話から覚えた要点を1つ追加する。増えすぎたら古いものから消える */
  addMemory: (text: string) => void;
  /** 覚えた要点を1つ消す */
  removeMemory: (index: number) => void;
  applyPreset: (presetId: string) => void;
  clearMessages: () => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

/** localStorage から読み込む。サーバー側では実行されない */
function loadState(): AppState {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? reconcile(JSON.parse(raw)) : INITIAL;
  } catch {
    // 壊れたデータは無視して初期値のまま進む
    return INITIAL;
  }
}

/* ハイドレーションが済んだかを知るための最小限のストア。
   サーバーでは false、クライアントに渡ったあとは true を返す。 */
const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function AppStateProvider({ children }: { children: ReactNode }) {
  // 初回描画で localStorage を読む。サーバーとの描画のズレは
  // ready が false のあいだ各画面が待つことで防いでいる
  const [state, setState] = useState<AppState>(loadState);
  const ready = useSyncExternalStore(neverChanges, onClient, onServer);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 容量超過などは黙って諦める（会話は続けられる）
    }
  }, [state, ready]);

  const update = useCallback((patch: Partial<AppState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const setLook = useCallback((patch: Partial<Look>) => {
    setState((s) => ({ ...s, look: { ...s.look, ...patch } }));
  }, []);

  const setPersona = useCallback((patch: Partial<Persona>) => {
    setState((s) => ({ ...s, persona: { ...s.persona, ...patch } }));
  }, []);

  const addMessage = useCallback((m: ChatMessage) => {
    setState((s) => ({ ...s, messages: [...s.messages, m] }));
  }, []);

  const replaceLastModel = useCallback((text: string) => {
    setState((s) => {
      const messages = [...s.messages];
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "model") {
          messages[i] = { ...messages[i], text };
          break;
        }
      }
      return { ...s, messages };
    });
  }, []);

  const gainAffection = useCallback((n: number) => {
    setState((s) => ({ ...s, affection: s.affection + n }));
  }, []);

  const addMemory = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState((s) => {
      // 同じ内容の覚え直しで無限に増えないようにする
      const rest = s.memories.filter((m) => m !== trimmed);
      const memories = [...rest, trimmed].slice(-MAX_MEMORIES);
      return { ...s, memories };
    });
  }, []);

  const removeMemory = useCallback((index: number) => {
    setState((s) => ({ ...s, memories: s.memories.filter((_, i) => i !== index) }));
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find((p) => p.persona.id === presetId);
    if (!preset) return;
    setState((s) => ({
      ...s,
      persona: preset.persona,
      look: preset.look,
      messages: [],
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState((s) => ({ ...s, messages: [] }));
  }, []);

  const resetAll = useCallback(() => {
    setState(INITIAL);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      ready,
      update,
      setLook,
      setPersona,
      addMessage,
      replaceLastModel,
      gainAffection,
      addMemory,
      removeMemory,
      applyPreset,
      clearMessages,
      resetAll,
    }),
    [
      state,
      ready,
      update,
      setLook,
      setPersona,
      addMessage,
      replaceLastModel,
      gainAffection,
      addMemory,
      removeMemory,
      applyPreset,
      clearMessages,
      resetAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore は AppStateProvider の中でしか使えません");
  return ctx;
}
