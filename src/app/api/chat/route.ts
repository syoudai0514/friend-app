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

  let stream: AsyncGenerator<{ text?: string }>;
  try {
    stream = await ai.models.generateContentStream({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents,
      config: {
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
      },
    });
  } catch (e) {
    return errorStream(friendlyError(e));
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
        controller.enqueue(encoder.encode(friendlyError(e)));
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

/** Gemini のエラーをキャラが困っている風の日本語に変換する */
function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);

  if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
    return "（無料枠の上限に届いちゃったみたい。少し時間をおいてから、もう一度話しかけてね）";
  }
  if (/401|403|API key|PERMISSION_DENIED|UNAUTHENTICATED/i.test(msg)) {
    return "（APIキーが正しくないみたい。Google AI Studio で発行したキーを .env.local に入れ直してね）";
  }
  if (/404|NOT_FOUND|not found/i.test(msg)) {
    return "（モデル名が見つからなかった。GEMINI_MODEL の設定を確認してね）";
  }
  if (/SAFETY|blocked/i.test(msg)) {
    return "……ごめん、その話はうまく返せなさそう。ほかのこと話そ？";
  }
  return "（うまく繋がらなかったみたい。少しだけ待ってから、もう一度送ってみて）";
}
