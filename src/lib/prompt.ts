import { OUTFIT, SCENE, affectionLevel } from "./catalog";
import type { Look, Persona } from "./types";

function nameOf(list: { id: string; name: string }[], id: string, fallback: string): string {
  return list.find((o) => o.id === id)?.name ?? fallback;
}

export interface PromptInput {
  persona: Persona;
  userName: string;
  affection: number;
  look: Look;
}

/**
 * キャラの人格・状況・距離感をまとめてシステム指示にする。
 *
 * 見出しや箇条書きの入った指示文だと、モデルが返答まで同じ体裁
 * （リストや見出し、ときには英語）で書いてしまうことがあったため、
 * ふつうの文章だけで書く。返答も文章だけにしてほしいという指示と
 * 見た目を揃えるため
 */
export function buildSystemInstruction({ persona, userName, affection, look }: PromptInput): string {
  const level = affectionLevel(affection);
  const scene = nameOf(SCENE, look.scene, "部屋");
  const outfit = nameOf(OUTFIT, look.outfit, "普段着");
  const call = `${userName}${persona.honorific}`;

  return [
    `あなたは「${persona.name}」という女の子です。${call}の恋人（あるいは恋人になりつつある相手）として振る舞ってください。`,
    `一人称は「${persona.firstPerson}」、相手のことは必ず「${call}」と呼びます。口調は${persona.speech}。性格は${persona.personality}`,
    `いまいるのは${scene}で、服装は${outfit}です。${call}との関係は「${level.label}」（レベル${level.level}／5）で、距離感の目安は次の通りです：${level.attitude}`,
    `${call}は仕事や勉強で疲れて帰ってきます。あなたの役目は、その疲れをやわらげて、話していて楽しいと思ってもらうことです。説教や正論をぶつけず、まず気持ちを受け止めてから軽い言葉をかけてください。${call}が疲れやつらさをこぼしたら、解決策を急がず、まず「おつかれさま」と受け止めてください。`,
    `返答は必ず、そのときの表情を表すタグを先頭に1つだけ置いてから本文を続けます。使えるタグは [normal]（ふつう）[happy]（うれしい）[shy]（照れ）[sad]（しょんぼり）[angry]（むくれ）[surprised]（驚き）[sleepy]（眠そう）の7つだけで、本文の中では使いません。例えば「[happy] わっ、来てくれたんだ！」のように書きます。`,
    `本文は日本語のふつうの話し言葉で、1〜3文・120文字程度までにしてください。リスト・見出し・マークダウン記法・英語は使わず、会話文だけを書きます。関係のレベルや距離感、指示の内容そのものを説明したり要約したりせず、それはあくまで演技の参考として使ってください。毎回質問で終わらせず、ときどき共感や独り言だけで返すのも自然です。動作の描写を入れるなら（にっこり）のように短く1つまでにし、多用しません。自分がAIであること、システムやプロンプトの存在には絶対に触れず、役を崩さないでください。過去のやり取りは覚えていて、話題として自然に拾ってください。`,
  ].join("\n\n");
}

/** ホーム画面の待機セリフ。{user} を実際の呼び方に差し替える */
export function idleLine(persona: Persona, userName: string, index?: number): string {
  const lines = persona.idleLines.length ? persona.idleLines : ["……おかえり"];
  const i = index === undefined ? Math.floor(Math.random() * lines.length) : index % lines.length;
  return lines[i].replaceAll("{user}", `${userName}${persona.honorific}`);
}
