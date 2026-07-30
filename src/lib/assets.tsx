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
import type { AssetManifest, PartImage } from "@/lib/asset-types";
import type { FaceAnchor } from "@/lib/face-anchors";

/** 中身のある一覧かどうか */
function hasCharacters(m: AssetManifest | null | undefined): m is AssetManifest {
  return !!m && Object.keys(m.characters ?? {}).length > 0;
}

/** 重ねて描く立ち絵ひと組。共通キャンバスの中の座標で返す */
export interface LayeredArt {
  canvas: { w: number; h: number };
  /** 下から順に重ねる */
  layers: PartImage[];
  /** 顔の位置。キャンバスに対する割合（0〜1）で返すので、表示の大きさに依らない */
  face: FaceAnchor | null;
  /** この絵がとっているポーズ。分からないときは null */
  pose: string | null;
}

interface AssetValue {
  /**
   * この衣装の立ち絵。無ければ null（＝SVGで描く）。
   * 表情を渡すと `<衣装>@<表情>.png` を優先して探す。
   */
  characterSrc: (personaId: string, outfitId: string, expression?: string) => string | null;
  /**
   * 体と頭を重ねて作る立ち絵。パーツが揃っていないときは null。
   * 1枚絵より優先して使う（頭だけ差し替えれば全衣装に効くため）
   */
  layeredArt: (personaId: string, outfitId: string, hairId: string) => LayeredArt | null;
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
      layeredArt: (personaId, outfitId, hairId) => {
        const parts = manifest.parts?.[personaId];
        const body = parts?.body[outfitId];
        if (!parts || !body) return null;
        // 指定された髪型が無ければ、持っている頭のどれかを使う。
        // 頭が1つも無いときは体だけを出す（首から下だけになるのは避けたいので null）
        const head = parts.head[hairId] ?? Object.values(parts.head)[0];
        if (!head) return null;
        // 首の位置を体側に合わせて頭をずらす。
        // どのパーツも同じ縮尺で切り出してあるので、動かすのは位置だけでよい
        const dx = body.neckX - head.neckX;
        const dy = body.neckY - head.neckY;
        const shifted: PartImage = { ...head, x: head.x + dx, y: head.y + dy };
        const { w, h } = parts.canvas;
        // 顔の目印も頭と同じだけずらしてから、キャンバスに対する割合に直す
        const face = head.face
          ? {
              eyeY: (head.face.eyeY + dy) / h,
              headX: (head.face.headX + dx) / w,
              cheekDX: head.face.cheekDX / w,
              cheekY: (head.face.cheekY + dy) / h,
              markDX: head.face.markDX / w,
              markY: (head.face.markY + dy) / h,
            }
          : null;
        return { canvas: parts.canvas, layers: [body, shifted], face, pose: body.pose ?? null };
      },
      backgroundSrc: (sceneId) => manifest.backgrounds[sceneId] ?? null,
      outfitsWithArt: (personaId) =>
        new Set([
          ...Object.keys(manifest.characters[personaId] ?? {}),
          ...Object.keys(manifest.parts?.[personaId]?.body ?? {}),
        ]),
    }),
    [manifest],
  );

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
}

export function useAssets(): AssetValue {
  return (
    useContext(AssetContext) ?? {
      characterSrc: () => null,
      layeredArt: () => null,
      backgroundSrc: () => null,
      outfitsWithArt: () => new Set<string>(),
    }
  );
}
