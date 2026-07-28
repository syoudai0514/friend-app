import { readdir } from "node:fs/promises";
import path from "node:path";

/**
 * public/ に置かれた画像を探して一覧を返す。
 *
 *   public/characters/<キャラID>/<衣装ID>.png  … 立ち絵（背景透過）
 *   public/characters/<キャラID>/default.png   … 衣装別の画像が無いときの立ち絵
 *   public/backgrounds/<背景ID>.jpg            … 背景
 *
 * ファイルを置いてリロードするだけで反映されるように、
 * ビルド時ではなくリクエストのたびにディレクトリを読む。
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);
const PUBLIC_DIR = path.join(process.cwd(), "public");

export interface AssetManifest {
  /** キャラID → 衣装ID → 画像のURL */
  characters: Record<string, Record<string, string>>;
  /** 背景ID → 画像のURL */
  backgrounds: Record<string, string>;
}

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

  return Response.json(manifest, { headers: { "Cache-Control": "no-store" } });
}
