import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  type Content,
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
  const requestedModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const generationConfig = {
    systemInstruction: buildSystemInstruction({ persona, userName, affection, look }),
    temperature: 1.05,
    topP: 0.95,
    maxOutputTokens: 400,
    // 雑談に思考トークンは要らない。無料枠の節約と応答速度のため切る
    thinkingConfig: { thinkingBudget: 0 },
    safetySettings: [
      HarmCategory.HARM_CATEGORY_HARASSMENT,
      HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    ].map((category) => ({ category, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH })),
  };

  let stream: AsyncGenerator<{ text?: string }>;
  try {
    stream = await ai.models.generateContentStream({
      model: requestedModel,
      contents,
      config: generationConfig,
    });
  } catch (e) {
    // モデル名が見つからないときは、このAPIキーで実際に使えるモデルを探して
    // 一度だけ自動で肩代わりする。GEMINI_MODEL が古い/間違っている場合の保険
    if (isModelNotFound(e)) {
      const fallbackModel = await findFallbackModel(ai, requestedModel);
      if (fallbackModel) {
        try {
          stream = await ai.models.generateContentStream({
            model: fallbackModel,
            contents,
            config: generationConfig,
          });
        } catch (e2) {
          return errorStream(await friendlyError(e2, ai, requestedModel));
        }
      } else {
        return errorStream(await friendlyError(e, ai, requestedModel));
      }
    } else {
      return errorStream(await friendlyError(e, ai, requestedModel));
    }
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = 0;
      try {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            sent += text.length;
            controller.enqueue(encoder.encode(text));
          }
        }
        if (sent === 0) {
          controller.enqueue(
            encoder.encode("……ごめん、今ちょっとうまく言葉が出てこなかった。もう一回言ってくれる？"),
          );
        }
      } catch (e) {
        controller.enqueue(encoder.encode(await friendlyError(e, ai, requestedModel)));
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
  return /404|NOT_FOUND|not found/i.test(msg);
}

/**
 * このAPIキーで実際に generateContent が使えるモデルを探す。
 * 「flash」を含むものを優先し、リクエストしたものと同じ名前は除く
 * （それは今まさに失敗したモデルなので）
 */
async function findFallbackModel(
  ai: GoogleGenAI,
  excludeModel: string,
): Promise<string | null> {
  try {
    const names = await listUsableModelNames(ai);
    const candidates = names.filter((n) => n !== excludeModel);
    return (
      candidates.find((n) => n.includes("flash") && !n.includes("lite")) ??
      candidates.find((n) => n.includes("flash")) ??
      candidates[0] ??
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
async function friendlyError(e: unknown, ai: GoogleGenAI, requestedModel: string): Promise<string> {
  const msg = e instanceof Error ? e.message : String(e);

  if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
    return "（無料枠の上限に届いちゃったみたい。少し時間をおいてから、もう一度話しかけてね）";
  }
  if (/401|403|API key|PERMISSION_DENIED|UNAUTHENTICATED/i.test(msg)) {
    return "（APIキーが正しくないみたい。Google AI Studio で発行したキーを .env.local に入れ直してね）";
  }
  if (/404|NOT_FOUND|not found/i.test(msg)) {
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
  return "（うまく繋がらなかったみたい。少しだけ待ってから、もう一度送ってみて）";
}
