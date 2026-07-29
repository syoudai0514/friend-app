import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  type Content,
  type GenerateContentConfig,
  type GenerateContentResponse,
} from "@google/genai";
import { buildSystemInstruction } from "@/lib/prompt";
import type { ChatMessage, Look, Persona } from "@/lib/types";

export const runtime = "nodejs";
/** 会話は毎回生成するのでキャッシュさせない */
export const dynamic = "force-dynamic";

/** 無料枠を使い切らないよう、送る履歴は直近だけに絞る */
const MAX_HISTORY = 24;

interface ChatRequest {
  messages: ChatMessage[];
  persona: Persona;
  userName: string;
  affection: number;
  look: Look;
}

function errorStream(message: string): Response {
  return new Response(message, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Chat-Error": "1" },
  });
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorStream(
      "（APIキーがまだ設定されていないみたい。.env.local に GEMINI_API_KEY を入れて、サーバーを再起動してね）",
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return errorStream("（メッセージをうまく読み取れませんでした）");
  }

  const { messages, persona, userName, affection, look } = body;
  if (!Array.isArray(messages) || !persona || !look) {
    return errorStream("（メッセージをうまく読み取れませんでした）");
  }

  const history = messages.slice(-MAX_HISTORY);
  const contents: Content[] = history
    .filter((m) => m.text?.trim())
    .map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

  if (contents.length === 0) {
    return errorStream("（何か話しかけてみて）");
  }

  const ai = new GoogleGenAI({ apiKey });
  // "-latest" エイリアスは裏で何に解決されるか分からず、指示への追従が弱い
  // モデルに当たることがあったため、素性のはっきりした固定モデルに戻す。
  // これが無ければ下の自動フォールバックが本当に使えるモデルを探しにいく
  const requestedModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const generationConfig: GenerateContentConfig = {
    systemInstruction: buildSystemInstruction({ persona, userName, affection, look }),
    temperature: 1.05,
    topP: 0.95,
    // thinkingConfig を外して再試行したモデルは、見えない思考トークンも
    // この上限を分け合って消費するらしく、400だと本文が出る前に尽きて
    // 「ウチは甘」のように文の途中で切れてしまった。多めに確保しておく
    maxOutputTokens: 1024,
    // 雑談に思考トークンは要らない。無料枠の節約と応答速度のため切る
    // （モデルによっては受け付けず400になるので、その場合は startStream 内で外す）
    thinkingConfig: { thinkingBudget: 0 },
    safetySettings: [
      HarmCategory.HARM_CATEGORY_HARASSMENT,
      HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    ].map((category) => ({ category, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH })),
  };

  let stream: AsyncGenerator<GenerateContentResponse>;
  // エラー文で「どのモデルが困っているか」を言えるように、実際に使ったモデル名を覚えておく
  let usedModel = requestedModel;
  try {
    stream = await startStream(ai, requestedModel, contents, generationConfig);
  } catch (e) {
    // モデル名が見つからないときは、このAPIキーで実際に使えるモデルを探して
    // 一度だけ自動で肩代わりする。GEMINI_MODEL が古い/間違っている場合の保険
    if (isModelNotFound(e)) {
      const fallbackModel = await findFallbackModel(ai, requestedModel);
      if (fallbackModel) {
        usedModel = fallbackModel;
        try {
          stream = await startStream(ai, fallbackModel, contents, generationConfig);
        } catch (e2) {
          return errorStream(await friendlyError(e2, ai, requestedModel, usedModel));
        }
      } else {
        return errorStream(await friendlyError(e, ai, requestedModel, usedModel));
      }
    } else {
      return errorStream(await friendlyError(e, ai, requestedModel, usedModel));
    }
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = 0;
      let finishReason: string | undefined;
      try {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            sent += text.length;
            controller.enqueue(encoder.encode(text));
          }
          finishReason = chunk.candidates?.[0]?.finishReason ?? finishReason;
        }
        if (sent === 0) {
          controller.enqueue(
            encoder.encode("……ごめん、今ちょっとうまく言葉が出てこなかった。もう一回言ってくれる？"),
          );
        } else if (finishReason === "MAX_TOKENS") {
          // 上限に届いて文の途中で切れたとき、切れたまま出さない
          controller.enqueue(encoder.encode("……"));
        }
      } catch (e) {
        controller.enqueue(encoder.encode(await friendlyError(e, ai, requestedModel, usedModel)));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function isModelNotFound(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  // 存在しないエイリアスは 404 ではなく 400 INVALID_ARGUMENT で返ってくることがあるので、
  // モデル名絡みっぽいエラーは広めに拾ってフォールバックへ回す
  return /404|NOT_FOUND|not found|400|INVALID_ARGUMENT/i.test(msg) && /model/i.test(msg);
}

function isInvalidArgument(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /400|INVALID_ARGUMENT/i.test(msg);
}

/**
 * モデルによっては thinkingConfig を受け付けず、モデル名とは無関係に
 * 400 invalid argument になることがある。そのときは thinkingConfig を外して
 * もう一度だけ試す（無料枠の節約より、まず返事が来ることを優先する）
 */
async function startStream(
  ai: GoogleGenAI,
  model: string,
  contents: Content[],
  config: GenerateContentConfig,
): Promise<AsyncGenerator<GenerateContentResponse>> {
  try {
    return await ai.models.generateContentStream({ model, contents, config });
  } catch (e) {
    if (isInvalidArgument(e) && config.thinkingConfig) {
      const rest: GenerateContentConfig = { ...config };
      delete rest.thinkingConfig;
      return await ai.models.generateContentStream({ model, contents, config: rest });
    }
    throw e;
  }
}

// 画像/音声/埋め込み専用など、雑談の返信には使えないモデル
const NOT_CHAT_MODEL = /embed|image|imagen|vision|audio|tts|veo|aqa|learnlm|native-audio|live/i;
// preview/exp/thinking 系は無料枠が極端に少ないことがあるので、最後の手段にする
const RISKY_QUOTA = /exp|preview|thinking/i;

/** モデル名から "gemini-3.5" のような世代番号を取り出す。古い世代は無料枠が
 *  先に削られていることがあるので、新しい世代を優先する材料にする */
function modelGeneration(name: string): number {
  const m = /gemini-(\d+(?:\.\d+)?)/.exec(name);
  return m ? parseFloat(m[1]) : -1;
}

/**
 * このAPIキーで実際に generateContent が使えるモデルを探す。
 * リクエストしたものと同じ名前は除く（それは今まさに失敗したモデルなので）。
 * 世代が新しいものほど優先し（古い世代は無料枠が減らされていることがある）、
 * 無料枠が厳しいpreview/exp系は他に選択肢が無いときだけ使う。
 * lite かどうかでは優先度を下げない（世代によっては lite の方が枠が広いこともある）
 */
async function findFallbackModel(
  ai: GoogleGenAI,
  excludeModel: string,
): Promise<string | null> {
  try {
    const names = await listUsableModelNames(ai);
    const candidates = names.filter((n) => n !== excludeModel);
    const safe = candidates.filter((n) => !NOT_CHAT_MODEL.test(n));
    // 全部が画像/音声系だった場合の保険として、除外前の一覧にも戻れるようにする
    const pool = safe.length > 0 ? safe : candidates;

    const byNewest = (a: string, b: string) => modelGeneration(b) - modelGeneration(a);
    const flash = pool.filter((n) => /flash/i.test(n)).sort(byNewest);
    const pro = pool.filter((n) => /pro/i.test(n)).sort(byNewest);

    return (
      flash.find((n) => !RISKY_QUOTA.test(n)) ??
      flash[0] ??
      pro.find((n) => !RISKY_QUOTA.test(n)) ??
      pro[0] ??
      pool[0] ??
      null
    );
  } catch {
    return null;
  }
}

/** generateContent に対応したモデル名（"models/" は外した形）の一覧 */
async function listUsableModelNames(ai: GoogleGenAI): Promise<string[]> {
  const names: string[] = [];
  const pager = await ai.models.list();
  for await (const model of pager) {
    if (!model.name || !model.supportedActions?.includes("generateContent")) continue;
    names.push(model.name.replace(/^models\//, ""));
  }
  return names;
}

/** Gemini のエラーをキャラが困っている風の日本語に変換する */
async function friendlyError(
  e: unknown,
  ai: GoogleGenAI,
  requestedModel: string,
  usedModel: string,
): Promise<string> {
  const msg = e instanceof Error ? e.message : String(e);
  // フォールバック先を使っていたときは、どのモデルの話かが分かるようにする
  const modelNote = usedModel !== requestedModel ? `（${usedModel} で）` : "";

  if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
    return `（無料枠の上限に届いちゃったみたい${modelNote}。少し時間をおいてから、もう一度話しかけてね）`;
  }
  if (/401|403|API key|PERMISSION_DENIED|UNAUTHENTICATED/i.test(msg)) {
    return "（APIキーが正しくないみたい。Google AI Studio で発行したキーを .env.local に入れ直してね）";
  }
  if (isModelNotFound(e)) {
    const names = await listUsableModelNames(ai).catch(() => []);
    const hint =
      names.length > 0
        ? `このAPIキーで使えそうなのは ${names.slice(0, 3).join(" / ")} など。`
        : "このAPIキーで使えるモデルが見つからなかった。";
    return `（「${requestedModel}」というモデルが見つからなかった。${hint} GEMINI_MODEL に設定してみてね）`;
  }
  if (/SAFETY|blocked/i.test(msg)) {
    return "……ごめん、その話はうまく返せなさそう。ほかのこと話そ？";
  }
  // ここに来るのは想定外のエラーなので、次に同じ状況になったときすぐ分かるよう
  // 元のエラーメッセージの先頭部分だけ添えておく
  const detail = msg.slice(0, 220).replace(/\s+/g, " ").trim();
  return `（うまく繋がらなかったみたい。少しだけ待ってから、もう一度送ってみて）\n[${detail}]`;
}
