import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { buildSystemPrompt, CHAT_LEVELS, ChatLevel } from "@/lib/chatPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-5-5";
const MAX_TURNS = 40; // keep the last N messages
const MAX_CHARS = 2000; // per message

// Created lazily so a missing key surfaces as a readable error instead of a build failure
let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

function sanitizeMessages(raw: unknown): Anthropic.Beta.BetaMessageParam[] | null {
  if (!Array.isArray(raw)) return null;
  const cleaned: IncomingMessage[] = raw
    .filter(
      (m): m is IncomingMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    .slice(-MAX_TURNS);

  // The conversation must start with a user turn and end with one
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") return null;
  return cleaned;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
  }

  const messages = sanitizeMessages(body?.messages);
  if (!messages) {
    return Response.json({ error: "Cần ít nhất một tin nhắn của người học." }, { status: 400 });
  }
  const level: ChatLevel = CHAT_LEVELS.some((l) => l.id === body?.level) ? body.level : "basic";
  const scenario = typeof body?.scenario === "string" ? body.scenario : "free";

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json(
      { error: "Máy chủ chưa cấu hình ANTHROPIC_API_KEY trong .env.local." },
      { status: 500 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const claudeStream = getClient().beta.messages.stream(
          {
            model: MODEL,
            max_tokens: 4000,
            // Casual chat: low effort keeps replies fast; thinking can't be turned off on this model
            output_config: { effort: "low" },
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            cache_control: { type: "ephemeral" },
            system: buildSystemPrompt(level, scenario),
            messages,
          },
          { signal: req.signal }
        );

        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        const final = await claudeStream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("<err>Xin lỗi, mình không thể trả lời tin nhắn này. Hãy thử nói chuyện khác nhé.</err>")
          );
        }
      } catch (error) {
        let msg = "Không kết nối được tới máy chủ AI. Vui lòng thử lại.";
        if (error instanceof Anthropic.AuthenticationError) msg = "API key không hợp lệ.";
        else if (error instanceof Anthropic.RateLimitError) msg = "Đang quá tải, đợi vài giây rồi thử lại nhé.";
        else if (error instanceof Anthropic.APIUserAbortError) msg = "";
        else if (error instanceof Anthropic.APIError) msg = `Lỗi AI (${error.status ?? "?"}). Vui lòng thử lại.`;
        if (msg) {
          console.error("[api/chat]", error);
          controller.enqueue(encoder.encode(`<err>${msg}</err>`));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
