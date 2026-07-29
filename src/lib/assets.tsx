"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BUILT_IN_ASSETS } from "@/lib/asset-manifest";
import type { AssetManifest } from "@/lib/asset-types";

/** 中身のある一覧かどうか */
function hasCharacters(m: AssetManifest | null | undefined): m is AssetManifest {
  return !!m && Object.keys(m.characters ?? {}).length > 0;
}

interface AssetValue {
  /**
   * この衣装の立ち絵。無ければ null（＝SVGで描く）。
   * 表情を渡すと `<衣装>@<表情>.png` を優先して探す。
   */
  characterSrc: (personaId: string, outfitId: string, expression?: string) => string | null;
  /** この背景の画像。無ければ null（＝CSSで描く） */
  backgroundSrc: (sceneId: string) => string | null;
  /** 立ち絵が用意されている衣装ID。クローゼットのバッジに使う */
  outfitsWithArt: (personaId: string) => Set<string>;
}

const AssetContext = createContext<AssetValue | null>(null);

export function AssetProvider({ children }: { children: ReactNode }) {
  // ビルド時に作った一覧を最初から持っておく。
  // これだけで立ち絵は出るので、通信が失敗しても絵が消えない
  const [manifest, setManifest] = useState<AssetManifest>(BUILT_IN_ASSETS);

  useEffect(() => {
    let alive = true;
    // 開発中に画像を足したときは、こちらが拾って即座に反映される。
    // 中身が取れなかったときはビルド時の一覧をそのまま使う
    fetch("/api/assets")
      .then((r) => (r.ok ? r.json() : null))
      .then((m: AssetManifest | null) => {
        if (alive && hasCharacters(m)) setManifest(m);
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
      characterSrc: (personaId, outfitId, expression) => {
        const folder = manifest.characters[personaId];
        if (!folder) return null;
        // 表情つきを先に探し、無ければ素の立ち絵に落とす
        const candidates =
          expression && expression !== "normal"
            ? [`${outfitId}@${expression}`, outfitId, `default@${expression}`, "default"]
            : [outfitId, "default"];
        for (const key of candidates) {
          const src = folder[key.toLowerCase()];
          if (src) return src;
        }
        return null;
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
