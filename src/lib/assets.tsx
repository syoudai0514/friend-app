"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AssetManifest } from "@/app/api/assets/route";

const EMPTY: AssetManifest = { characters: {}, backgrounds: {} };

interface AssetValue {
  /** この衣装の立ち絵。無ければ null（＝SVGで描く） */
  characterSrc: (personaId: string, outfitId: string) => string | null;
  /** この背景の画像。無ければ null（＝CSSで描く） */
  backgroundSrc: (sceneId: string) => string | null;
  /** 立ち絵が用意されている衣装ID。クローゼットのバッジに使う */
  outfitsWithArt: (personaId: string) => Set<string>;
}

const AssetContext = createContext<AssetValue | null>(null);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [manifest, setManifest] = useState<AssetManifest>(EMPTY);

  useEffect(() => {
    let alive = true;
    fetch("/api/assets")
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then((m: AssetManifest) => {
        if (alive) setManifest(m ?? EMPTY);
      })
      .catch(() => {
        // 画像が無くてもSVGで動くので、失敗しても黙って進む
      });
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<AssetValue>(
    () => ({
      characterSrc: (personaId, outfitId) => {
        const folder = manifest.characters[personaId];
        if (!folder) return null;
        return folder[outfitId] ?? folder.default ?? null;
      },
      backgroundSrc: (sceneId) => manifest.backgrounds[sceneId] ?? null,
      outfitsWithArt: (personaId) => new Set(Object.keys(manifest.characters[personaId] ?? {})),
    }),
    [manifest],
  );

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
}

export function useAssets(): AssetValue {
  return (
    useContext(AssetContext) ?? {
      characterSrc: () => null,
      backgroundSrc: () => null,
      outfitsWithArt: () => new Set<string>(),
    }
  );
}
