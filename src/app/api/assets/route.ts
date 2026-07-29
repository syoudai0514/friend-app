import { readdir } from "node:fs/promises";
import path from "node:path";
import { BUILT_IN_ASSETS } from "@/lib/asset-manifest";
import type { AssetManifest } from "@/lib/asset-types";

/**
 * public/ に置かれた画像を探して一覧を返す。
 *
 *   public/characters/<キャラID>/<衣装ID>.png  … 立ち絵（背景透過）
 *   public/characters/<キャラID>/default.png   … 衣装別の画像が無いときの立ち絵
 *   public/backgrounds/<背景ID>.jpg            … 背景
 *
 * 開発中にファイルを置いてリロードするだけで反映されるよう、
 * リクエストのたびにディレクトリを読む。
 *
 * ただし本番（Vercelなどのサーバーレス）では public/ が関数から見えないことがある。
 * そのときのために、ビルド時に作った一覧を必ず土台にして返す。
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);
const PUBLIC_DIR = path.join(process.cwd(), "public");

async function imagesIn(relDir: string): Promise<string[]> {
  try {
    const entries = await readdir(path.join(PUBLIC_DIR, relDir), { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && IMAGE_EXT.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name);
  } catch {
    // フォルダが無いのは正常（画像を置いていないだけ）
    return [];
  }
}

/** ファイル名から拡張子を取った部分を、そのままIDとして使う */
function idOf(fileName: string): string {
  return path.basename(fileName, path.extname(fileName)).toLowerCase();
}

export async function GET() {
  const manifest: AssetManifest = { characters: {}, backgrounds: {} };

  try {
    const dirs = await readdir(path.join(PUBLIC_DIR, "characters"), { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;
      const files = await imagesIn(path.join("characters", dir.name));
      if (files.length === 0) continue;
      manifest.characters[dir.name] = Object.fromEntries(
        files.map((f) => [idOf(f), `/characters/${encodeURIComponent(dir.name)}/${encodeURIComponent(f)}`]),
      );
    }
  } catch {
    // characters フォルダ自体が無い場合もそのまま進む
  }

  for (const f of await imagesIn("backgrounds")) {
    manifest.backgrounds[idOf(f)] = `/backgrounds/${encodeURIComponent(f)}`;
  }

  // ビルド時の一覧を土台にし、実際に見つかったものを上から重ねる。
  // public/ が読めない環境でも、少なくともビルド時の分は必ず返る
  const merged: AssetManifest = {
    characters: { ...BUILT_IN_ASSETS.characters },
    backgrounds: { ...BUILT_IN_ASSETS.backgrounds, ...manifest.backgrounds },
  };
  for (const [personaId, files] of Object.entries(manifest.characters)) {
    merged.characters[personaId] = { ...merged.characters[personaId], ...files };
  }

  return Response.json(merged, { headers: { "Cache-Control": "no-store" } });
}
