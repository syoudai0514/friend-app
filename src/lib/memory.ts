/**
 * 会話の中で「覚えておくべきこと」を、返事の末尾に付く隠しタグから取り出す。
 *
 * 例: "今日ラーメン食べたんだ〜！おいしかった！[memory: ラーメンが好き]"
 * のように、本文のあとに付けてもらう。ユーザーには見せず、
 * 次回以降の会話で参考にできるよう別に保存する。
 *
 * 表情タグ（先頭）と違って、こちらは末尾に付くうえ中身が自由な長さの文章になる。
 * ストリーミング中に閉じ括弧が来るまで、書きかけのタグをそのまま画面に
 * 出さないよう保留する
 */

const KEYWORD = "memory:";
const MEMORY_TAG = /[[［]memory:\s*([^\]］]*)[\]］]\s*$/i;

function lastOpenBracketIndex(text: string): number {
  return Math.max(text.lastIndexOf("["), text.lastIndexOf("［"));
}

export interface MemorySplit {
  /** タグを取り除いた本文 */
  body: string;
  /** このターンで新しく覚えた内容。無い・まだ書きかけのときは null */
  learned: string | null;
}

export function splitMemory(text: string): MemorySplit {
  const complete = MEMORY_TAG.exec(text);
  if (complete) {
    return {
      body: text.slice(0, complete.index).trimEnd(),
      learned: complete[1].trim() || null,
    };
  }

  // 末尾の "[" 以降が "[memory:" になり得る途中の形なら、
  // 閉じ括弧が来るまで本文として出さずに保留する
  const openIdx = lastOpenBracketIndex(text);
  if (openIdx !== -1) {
    const tail = text.slice(openIdx + 1).toLowerCase();
    const stillTypingKeyword = KEYWORD.startsWith(tail);
    const pastKeyword = tail.startsWith(KEYWORD);
    if (stillTypingKeyword || pastKeyword) {
      return { body: text.slice(0, openIdx).trimEnd(), learned: null };
    }
  }

  return { body: text, learned: null };
}
