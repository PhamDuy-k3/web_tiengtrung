"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, Volume2, Turtle, RotateCcw, Square, Lightbulb, Settings2 } from "lucide-react";
import { speechService } from "@/lib/speech";
import { CHAT_LEVELS, CHAT_SCENARIOS, ChatLevel } from "@/lib/chatPrompt";

// ============================================================================
// Types & helpers
// ============================================================================

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  /** For assistant turns: the raw tagged text (<zh>…</zh><py>…</py>…) */
  content: string;
  error?: boolean;
}

interface ParsedReply {
  zh: string;
  py: string;
  vi: string;
  fix: string;
  err: string;
}

interface ChatSettings {
  level: ChatLevel;
  scenario: string;
  showPinyin: boolean;
  showVietnamese: boolean;
  autoSpeak: boolean;
}

const STORAGE_KEY = "hanyu:chat:v1";
const DEFAULT_SETTINGS: ChatSettings = {
  level: "basic",
  scenario: "free",
  showPinyin: true,
  showVietnamese: false,
  autoSpeak: true,
};

/** Tolerant to partial (still-streaming) text: an unclosed tag takes everything after it. */
function parseReply(raw: string): ParsedReply {
  const pick = (tag: string) => {
    const m = raw.match(new RegExp(`<${tag}>([\\s\\S]*?)(?:</${tag}>|$)`));
    return m ? m[1].replace(/<\/?[a-z]*$/i, "").trim() : "";
  };
  const parsed = { zh: pick("zh"), py: pick("py"), vi: pick("vi"), fix: pick("fix"), err: pick("err") };
  // Model ignored the format: show the raw text as Chinese
  if (!parsed.zh && !parsed.err && !/<[a-z]/i.test(raw)) parsed.zh = raw.trim();
  return parsed;
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function loadSaved(): { settings: ChatSettings; messages: ChatMessage[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        messages: Array.isArray(parsed.messages) ? parsed.messages.filter((m: ChatMessage) => !m.error) : [],
      };
    }
  } catch {
    // storage unavailable or corrupted
  }
  return { settings: DEFAULT_SETTINGS, messages: [] };
}

// Minimal typing for the (prefixed) Web Speech recognition API
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: any) => void) | null;
};
function createRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return Ctor ? (new Ctor() as Recognition) : null;
}

// ============================================================================
// Page
// ============================================================================

export default function ChatPage() {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved conversation once on the client
  useEffect(() => {
    const saved = loadSaved();
    setSettings(saved.settings);
    setMessages(saved.messages);
    setMicSupported(!!createRecognition());
    setHydrated(true);
    return () => {
      abortRef.current?.abort();
      speechService.stop();
    };
  }, []);

  // Persist (skip while a reply is still streaming)
  useEffect(() => {
    if (!hydrated || streaming) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, messages: messages.slice(-60) }));
    } catch {
      // ignore quota / private mode
    }
  }, [settings, messages, hydrated, streaming]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const scenario = CHAT_SCENARIOS.find((s) => s.id === settings.scenario) ?? CHAT_SCENARIOS[0];
  const level = CHAT_LEVELS.find((l) => l.id === settings.level) ?? CHAT_LEVELS[0];

  const updateSettings = (patch: Partial<ChatSettings>) => setSettings((s) => ({ ...s, ...patch }));

  const resetConversation = useCallback(() => {
    abortRef.current?.abort();
    speechService.stop();
    setMessages([]);
    setStreaming(false);
  }, []);

  const changeContext = (patch: Partial<ChatSettings>) => {
    if (messages.length && !window.confirm("Đổi cấp độ/tình huống sẽ bắt đầu cuộc trò chuyện mới. Tiếp tục?")) return;
    resetConversation();
    updateSettings(patch);
  };

  const sendMessage = useCallback(
    async (text: string, baseMessages?: ChatMessage[]) => {
      const content = text.trim();
      if (!content || streaming) return;

      recognitionRef.current?.stop();
      speechService.stop();

      const base = (baseMessages ?? messages).filter((m) => !m.error);
      const userMsg: ChatMessage = { id: newId(), role: "user", content };
      const botMsg: ChatMessage = { id: newId(), role: "assistant", content: "" };
      const history = [...base, userMsg];

      setMessages([...history, botMsg]);
      setInput("");
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      let raw = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level: settings.level,
            scenario: settings.scenario,
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `Lỗi máy chủ (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          raw += decoder.decode(value, { stream: true });
          const snapshot = raw;
          setMessages((prev) => prev.map((m) => (m.id === botMsg.id ? { ...m, content: snapshot } : m)));
        }

        const parsed = parseReply(raw);
        if (parsed.err || !parsed.zh) {
          setMessages((prev) =>
            prev.map((m) => (m.id === botMsg.id ? { ...m, content: raw || "<err>Không nhận được phản hồi.</err>", error: true } : m))
          );
        } else if (settings.autoSpeak) {
          speechService.speak(parsed.zh, 0.9);
        }
      } catch (e: any) {
        if (e?.name === "AbortError") {
          // Keep whatever arrived; drop the bubble if nothing did
          setMessages((prev) => prev.filter((m) => m.id !== botMsg.id || parseReply(m.content).zh));
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsg.id ? { ...m, content: `<err>${e?.message || "Đã có lỗi xảy ra."}</err>`, error: true } : m
            )
          );
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, settings, streaming]
  );

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = createRecognition();
    if (!rec) return;
    speechService.stop();
    rec.lang = "zh-CN";
    rec.interimResults = true;
    rec.continuous = false;
    const base = input ? input.trimEnd() + " " : "";
    rec.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      setInput(base + transcript);
    };
    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      inputRef.current?.focus();
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      recognitionRef.current = null;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't send while a Chinese IME is still composing characters
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Retry = resend the last user message
  const retryLast = () => {
    const lastUserIdx = [...messages].map((m) => m.role).lastIndexOf("user");
    if (lastUserIdx < 0) return;
    sendMessage(messages[lastUserIdx].content, messages.slice(0, lastUserIdx));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col h-[calc(100dvh-8rem)] md:h-[calc(100dvh-4rem)]">
      {/* ── Header ── */}
      <div className="py-3 sm:py-4 border-b border-parchment-300 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-ink flex items-center gap-2">
              <span className="font-chinese">聊天</span>
              <span className="text-base sm:text-lg font-bold text-ink-light">Trò chuyện</span>
            </h1>
            <p className="text-xs text-ink-light truncate">
              {scenario.emoji} {scenario.label} · {level.label} ({level.hsk})
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                showSettings ? "bg-celadon-100 text-celadon" : "bg-parchment-200 text-ink-light hover:bg-parchment-300"
              }`}
              aria-label="Cài đặt"
            >
              <Settings2 size={18} />
            </button>
            <button
              onClick={() => messages.length && window.confirm("Xóa cuộc trò chuyện hiện tại?") && resetConversation()}
              className="w-9 h-9 rounded-xl bg-parchment-200 text-ink-light hover:bg-parchment-300 flex items-center justify-center"
              aria-label="Cuộc trò chuyện mới"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="bg-white rounded-2xl border border-parchment-300 p-3 sm:p-4 space-y-3 animate-fade-up">
            <div>
              <div className="text-xs font-bold text-ink-light mb-1.5">Cấp độ</div>
              <div className="flex flex-wrap gap-2">
                {CHAT_LEVELS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => l.id !== settings.level && changeContext({ level: l.id })}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${
                      l.id === settings.level
                        ? "bg-celadon text-white border-celadon"
                        : "bg-parchment-50 border-parchment-300 text-ink-light hover:text-ink"
                    }`}
                  >
                    {l.label} <span className="opacity-70 text-xs">{l.hsk}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-ink-light mb-1.5">Tình huống</div>
              <div className="flex flex-wrap gap-2">
                {CHAT_SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => s.id !== settings.scenario && changeContext({ scenario: s.id })}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${
                      s.id === settings.scenario
                        ? "bg-celadon text-white border-celadon"
                        : "bg-parchment-50 border-parchment-300 text-ink-light hover:text-ink"
                    }`}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink">
              {(
                [
                  ["showPinyin", "Hiện Pinyin"],
                  ["showVietnamese", "Hiện nghĩa tiếng Việt"],
                  ["autoSpeak", "Tự đọc câu trả lời"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => updateSettings({ [key]: e.target.checked })}
                    className="w-4 h-4 accent-celadon"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {hydrated && messages.length === 0 && (
          <div className="text-center py-8 sm:py-12 space-y-4">
            <div className="text-5xl">{scenario.emoji}</div>
            <div>
              <h2 className="text-lg font-black text-ink">Bắt đầu trò chuyện bằng tiếng Trung</h2>
              <p className="text-sm text-ink-light mt-1 max-w-md mx-auto">
                Gõ hoặc bấm micro để nói. Bạn bè AI sẽ trả lời như người thật, và nhắc nhẹ khi bạn dùng sai.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {scenario.starters.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-4 py-2 rounded-2xl bg-white border border-parchment-300 font-chinese text-ink hover:border-celadon hover:text-celadon transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, idx) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-celadon text-white px-4 py-2.5 font-chinese text-[17px] leading-relaxed whitespace-pre-wrap break-words">
                {m.content}
              </div>
            </div>
          ) : (
            <BotBubble
              key={m.id}
              raw={m.content}
              showPinyin={settings.showPinyin}
              showVietnamese={settings.showVietnamese}
              isStreaming={streaming && idx === messages.length - 1}
              onRetry={m.error && idx === messages.length - 1 ? retryLast : undefined}
            />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Composer ── */}
      <div className="py-3 border-t border-parchment-300">
        <div className="flex items-end gap-2">
          {micSupported && (
            <button
              onClick={toggleMic}
              disabled={streaming}
              className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 ${
                listening
                  ? "bg-vermillion text-white animate-pulse"
                  : "bg-parchment-200 text-ink-light hover:bg-parchment-300 hover:text-ink"
              }`}
              aria-label={listening ? "Dừng ghi âm" : "Nói tiếng Trung"}
              title={listening ? "Dừng ghi âm" : "Nói tiếng Trung"}
            >
              {listening ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
          )}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={500}
            placeholder={listening ? "Đang nghe… hãy nói tiếng Trung" : "输入中文… (Enter để gửi)"}
            className="flex-1 resize-none max-h-32 min-h-[44px] rounded-2xl border border-parchment-300 bg-white px-4 py-2.5 font-chinese text-[16px] text-ink placeholder:text-ink-light/70 focus:outline-none focus:border-celadon focus:ring-2 focus:ring-celadon/20"
          />
          {streaming ? (
            <button
              onClick={() => abortRef.current?.abort()}
              className="shrink-0 w-11 h-11 rounded-2xl bg-ink text-white flex items-center justify-center"
              aria-label="Dừng"
            >
              <Square size={16} className="fill-white" />
            </button>
          ) : (
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="shrink-0 w-11 h-11 rounded-2xl bg-celadon text-white flex items-center justify-center shadow-soft hover:bg-celadon-500 disabled:opacity-40 disabled:shadow-none transition-all"
              aria-label="Gửi"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Bot message bubble
// ============================================================================

function BotBubble({
  raw,
  showPinyin,
  showVietnamese,
  isStreaming,
  onRetry,
}: {
  raw: string;
  showPinyin: boolean;
  showVietnamese: boolean;
  isStreaming: boolean;
  onRetry?: () => void;
}) {
  const r = parseReply(raw);
  const [revealPy, setRevealPy] = useState(false);
  const [revealVi, setRevealVi] = useState(false);

  if (r.err) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl bg-vermillion-light border border-vermillion-soft text-vermillion-deep px-4 py-2.5 text-sm space-y-2">
          <div>{r.err}</div>
          {onRetry && (
            <button onClick={onRetry} className="font-bold underline underline-offset-2">
              Thử lại
            </button>
          )}
        </div>
      </div>
    );
  }

  const pyVisible = showPinyin || revealPy;
  const viVisible = showVietnamese || revealVi;

  return (
    <div className="flex justify-start gap-2">
      <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-gilt to-gilt-dark flex items-center justify-center font-chinese text-white text-sm font-black mt-1">
        友
      </div>
      <div className="max-w-[85%] space-y-2 min-w-0">
        <div className="rounded-2xl rounded-tl-md bg-white border border-parchment-300 px-4 py-3 shadow-sm">
          {!r.zh && isStreaming ? (
            <div className="flex gap-1 py-1.5" aria-label="Đang trả lời">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-ink-light/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          ) : (
            <>
              <div className="font-chinese text-[19px] leading-relaxed text-ink break-words">{r.zh}</div>
              {pyVisible && r.py && <div className="text-sm text-celadon-600 mt-1 break-words">{r.py}</div>}
              {viVisible && r.vi && (
                <div className="text-sm text-ink-light mt-1.5 pt-1.5 border-t border-parchment-200 break-words">{r.vi}</div>
              )}
            </>
          )}
        </div>

        {r.zh && !isStreaming && (
          <div className="flex items-center gap-1 text-ink-light">
            <IconBtn label="Nghe" onClick={() => speechService.speak(r.zh, 0.9)}>
              <Volume2 size={15} />
            </IconBtn>
            <IconBtn label="Nghe chậm" onClick={() => speechService.speak(r.zh, 0.6)}>
              <Turtle size={15} />
            </IconBtn>
            {!showPinyin && r.py && (
              <TextBtn active={revealPy} onClick={() => setRevealPy((v) => !v)}>
                Pinyin
              </TextBtn>
            )}
            {!showVietnamese && r.vi && (
              <TextBtn active={revealVi} onClick={() => setRevealVi((v) => !v)}>
                Dịch
              </TextBtn>
            )}
          </div>
        )}

        {r.fix && !isStreaming && (
          <div className="rounded-2xl bg-gilt-light border border-gilt-soft px-3.5 py-2.5 text-sm text-ink flex gap-2">
            <Lightbulb size={16} className="text-gilt-dark shrink-0 mt-0.5" />
            <div className="min-w-0 break-words">
              <span className="font-bold text-gilt-deep">Góp ý: </span>
              <span className="font-chinese">{r.fix}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-parchment-200 hover:text-ink transition-colors"
    >
      {children}
    </button>
  );
}

function TextBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 h-7 rounded-lg text-xs font-bold transition-colors ${
        active ? "bg-celadon-100 text-celadon" : "hover:bg-parchment-200 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
