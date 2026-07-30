import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * public/ に置かれた画像を探して、その一覧をソースコードとして書き出す。
 *
 * 実行時にフォルダを読む方式だと、Vercel のようなサーバーレス環境で
 * public/ が関数から見えず、立ち絵が出ないことがある。
 * ビルド前にここで一覧を固めてしまえば、どこに置いても確実に表示できる。
 *
 * 画像そのものは今までどおり public/ から静的配信されるので、
 * ここで書き出すのは「どのファイルがあるか」だけ。
 */

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_FILE = path.join(ROOT, "src", "lib", "asset-manifest.ts");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);

async function imagesIn(relDir) {
  try {
    const entries = await readdir(path.join(PUBLIC_DIR, relDir), { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && IMAGE_EXT.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name)
      .sort();
  } catch {
    // フォルダが無いのは正常（画像を置いていないだけ）
    return [];
  }
}

/** ファイル名から拡張子を取った部分を、そのままIDとして使う */
function idOf(fileName) {
  return path.basename(fileName, path.extname(fileName)).toLowerCase();
}

/**
 * 重ねて作る立ち絵を拾う。
 *
 * public/characters/<キャラ>/parts/<体 or 頭>/<ID>.png と、
 * その並べ方を書いた parts/anchors.json が揃っているときだけ有効になる。
 * anchors.json はパーツを切り出したときに一緒に作られる。
 */
async function partsOf(charName) {
  const dir = path.join("characters", charName, "parts");
  let anchors;
  try {
    anchors = JSON.parse(await readFile(path.join(PUBLIC_DIR, dir, "anchors.json"), "utf8"));
  } catch {
    // anchors.json が無いキャラは1枚絵のまま。これは正常
    return null;
  }
  if (!anchors?.canvas) return null;

  const slots = {};
  for (const slot of ["body", "head"]) {
    const entries = {};
    for (const file of await imagesIn(path.join(dir, slot))) {
      const id = idOf(file);
      const a = anchors[slot]?.[id];
      // 置く場所が分からない画像は重ねようがないので飛ばす
      if (!a) continue;
      entries[id] = {
        src: `/characters/${encodeURIComponent(charName)}/parts/${slot}/${encodeURIComponent(file)}`,
        w: a.w,
        h: a.h,
        x: a.x,
        y: a.y,
        neckX: a.neckX,
        neckY: a.neckY,
        ...(a.face ? { face: a.face } : {}),
        ...(a.pose ? { pose: a.pose } : {}),
      };
    }
    slots[slot] = entries;
  }
  if (Object.keys(slots.body).length === 0) return null;
  return { canvas: anchors.canvas, ...slots };
}

async function build() {
  const characters = {};
  const parts = {};
  try {
    const dirs = await readdir(path.join(PUBLIC_DIR, "characters"), { withFileTypes: true });
    for (const dir of dirs.sort((a, b) => a.name.localeCompare(b.name))) {
      if (!dir.isDirectory()) continue;
      const layered = await partsOf(dir.name);
      if (layered) parts[dir.name] = layered;
      const files = await imagesIn(path.join("characters", dir.name));
      if (files.length === 0) continue;
      characters[dir.name] = Object.fromEntries(
        files.map((f) => [
          idOf(f),
          `/characters/${encodeURIComponent(dir.name)}/${encodeURIComponent(f)}`,
        ]),
      );
    }
  } catch {
    // characters フォルダ自体が無い場合もそのまま進む
  }

  const backgrounds = {};
  for (const f of await imagesIn("backgrounds")) {
    backgrounds[idOf(f)] = `/backgrounds/${encodeURIComponent(f)}`;
  }

  return { characters, backgrounds, parts };
}

const manifest = await build();

const source = `// このファイルは自動生成されています。直接編集しないでください。
// 生成元: scripts/generate-asset-manifest.mjs（npm run dev / build の前に走ります）
//
// public/ に画像を足したら、開発サーバーを立て直すか
// \`node scripts/generate-asset-manifest.mjs\` を実行すると更新されます。
import type { AssetManifest } from "./asset-types";

export const BUILT_IN_ASSETS: AssetManifest = ${JSON.stringify(manifest, null, 2)};
`;

await writeFile(OUT_FILE, source, "utf8");

const charCount = Object.values(manifest.characters).reduce(
  (n, files) => n + Object.keys(files).length,
  0,
);
const partCount = Object.values(manifest.parts).reduce(
  (n, p) => n + Object.keys(p.body).length + Object.keys(p.head).length,
  0,
);
console.log(
  `asset manifest: 立ち絵 ${charCount}枚 / パーツ ${partCount}枚 / ` +
    `背景 ${Object.keys(manifest.backgrounds).length}枚 -> src/lib/asset-manifest.ts`,
);
