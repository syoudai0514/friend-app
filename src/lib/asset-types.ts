/** public/ に置かれた画像の一覧 */
export interface AssetManifest {
  /** キャラID → 衣装ID → 画像のURL */
  characters: Record<string, Record<string, string>>;
  /** 背景ID → 画像のURL */
  backgrounds: Record<string, string>;
}
