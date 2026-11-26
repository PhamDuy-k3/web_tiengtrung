"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Mic,
  MicOff,
  RotateCcw,
  Square,
  Volume2,
} from "lucide-react";
import { AudioButton } from "@/features/quiz";
import { speechService } from "@/lib/speech";
import { soundService } from "@/lib/sound";
import {
  evaluatePronunciation,
  type CharPronunciationDetail,
  type PronunciationEvaluation,
} from "@/lib/pronunciation";

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
}

interface SpeechRecognitionResultEventLike {
  results: ArrayLike<{
    isFinal?: boolean;
    0?: { transcript?: string };
  }>;
}

function createSpeechRecognition(): BrowserSpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function getMicErrorMessage(code?: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Chưa được cấp quyền Micro. Hãy cho phép quyền Micro trên thanh địa chỉ trình duyệt rồi thử lại.";
    case "audio-capture":
      return "Không tìm thấy thiết bị Micro. Hãy kiểm tra tai nghe hoặc micro của máy.";
    case "no-speech":
      return "Chưa nghe rõ giọng đọc. Hãy nhấn mở mic và đọc to, rõ ràng hơn một chút.";
    case "network":
      return "Lỗi kết nối dịch vụ nhận dạng giọng nói. Hãy kiểm tra mạng hoặc dùng Chrome / Edge / Safari.";
    default:
      return "Không nhận dạng được giọng nói lần này. Vui lòng thử đọc lại nhé.";
  }
}

function getScoreStyle(score: number): {
  badge: string;
  ring: string;
  label: string;
} {
  if (score >= 85) {
    return {
      badge: "bg-celadon-100 text-celadon-dark border-celadon-300",
      ring: "text-celadon-dark",
      label: "Chuẩn xác",
    };
  }
  if (score >= 60) {
    return {
      badge: "bg-gilt-light text-gilt-deep border-gilt-soft",
      ring: "text-gilt-deep",
      label: "Khá tốt — cần chỉnh nhẹ",
    };
  }
  return {
    badge: "bg-vermillion-light text-vermillion-deep border-vermillion-soft",
    ring: "text-vermillion-deep",
    label: "Cần luyện lại",
  };
}

function getCharChipStyle(item: CharPronunciationDetail): string {
  switch (item.status) {
    case "correct":
      return "bg-celadon-50 border-celadon-300 text-celadon-dark";
    case "tone_error":
      return "bg-gilt-light border-gilt-dark text-gilt-deep";
    case "wrong":
    case "missing":
      return "bg-vermillion-light border-vermillion text-vermillion-deep";
  }
}

export interface VoicePronunciationCheckerProps {
  targetText: string;
  targetPinyin?: string;
  compact?: boolean;
  onEvaluated?: (evaluation: PronunciationEvaluation) => void;
}

export const VoicePronunciationChecker: React.FC<VoicePronunciationCheckerProps> = ({
  targetText,
  targetPinyin,
  compact = false,
  onEvaluated,
}) => {
  const [micSupported, setMicSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<PronunciationEvaluation | null>(null);
  const [manualInput, setManualInput] = useState("");

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const latestTranscriptRef = useRef("");
  const userStoppedRef = useRef(false);

  useEffect(() => {
    setMicSupported(!!createSpeechRecognition());
    return () => {
      try {
        recognitionRef.current?.abort?.();
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  useEffect(() => {
    // Reset state whenever the target prompt changes
    userStoppedRef.current = true;
    try {
      recognitionRef.current?.abort?.();
      recognitionRef.current?.stop();
    } catch {}
    recognitionRef.current = null;
    latestTranscriptRef.current = "";
    setListening(false);
    setInterimTranscript("");
    setErrorMsg(null);
    setEvaluation(null);
    setManualInput("");
  }, [targetText]);

  const scoreAndDisplay = (spokenText: string) => {
    const trimmed = spokenText.trim();
    if (!trimmed) {
      setErrorMsg("Chưa ghi nhận được giọng nói. Hãy mở mic và đọc rõ hơn nhé.");
      return;
    }

    const result = evaluatePronunciation({
      targetText,
      targetPinyin,
      spokenText: trimmed,
    });

    setEvaluation(result);
    if (result.score >= 80) {
      soundService.playSuccess();
    } else if (result.score < 50) {
      soundService.playError();
    }
    onEvaluated?.(result);
  };

  const stopListening = () => {
    userStoppedRef.current = true;
    try {
      recognitionRef.current?.stop();
    } catch {}
  };

  const startListening = () => {
    if (listening) {
      stopListening();
      return;
    }

    const rec = createSpeechRecognition();
    if (!rec) {
      setMicSupported(false);
      setErrorMsg("Trình duyệt hiện tại chưa hỗ trợ nhận dạng giọng nói Web Speech API. Vui lòng dùng Chrome, Edge hoặc Safari.");
      return;
    }

    speechService.stop();
    setErrorMsg(null);
    setEvaluation(null);
    setInterimTranscript("");
    latestTranscriptRef.current = "";
    userStoppedRef.current = false;

    rec.lang = "zh-CN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i]?.[0]?.transcript || "";
      }
      latestTranscriptRef.current = combined.trim();
      setInterimTranscript(combined.trim());
    };

    rec.onerror = (event) => {
      if (event?.error === "aborted" && userStoppedRef.current) return;
      setListening(false);
      recognitionRef.current = null;
      setErrorMsg(getMicErrorMessage(event?.error));
    };

    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      const transcript = latestTranscriptRef.current;
      if (transcript) {
        scoreAndDisplay(transcript);
      } else if (!userStoppedRef.current) {
        setErrorMsg("Chưa nghe thấy từ nào. Hãy bấm Micro và đọc to, rõ từng âm tiết.");
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
      recognitionRef.current = null;
      setErrorMsg("Không thể khởi động Micro lúc này. Vui lòng thử lại.");
    }
  };

  const scoreStyle = evaluation ? getScoreStyle(evaluation.score) : null;

  return (
    <div
      className={`rounded-2xl border border-parchment-300 bg-parchment-50/70 ${
        compact ? "p-4 space-y-3" : "p-5 sm:p-6 space-y-5"
      }`}
    >
      {/* Mic Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={startListening}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 rounded-2xl font-bold transition-all shadow-sm ${
              compact ? "px-4 py-2.5 text-xs sm:text-sm" : "px-6 py-3.5 text-sm sm:text-base"
            } ${
              listening
                ? "bg-vermillion text-white animate-pulse shadow-glow-red"
                : "bg-gradient-to-r from-celadon to-celadon-500 hover:from-celadon-500 hover:to-celadon-600 text-white"
            }`}
          >
            {listening ? (
              <>
                <Square size={compact ? 15 : 18} className="fill-current" />
                <span>Đang nghe… (Bấm để dừng)</span>
              </>
            ) : (
              <>
                <Mic size={compact ? 16 : 20} />
                <span>{evaluation ? "Đọc lại bằng Micro" : "Mở Mic & Đọc theo"}</span>
              </>
            )}
          </button>

          {evaluation && !listening && (
            <button
              type="button"
              onClick={() => {
                setEvaluation(null);
                setInterimTranscript("");
                setErrorMsg(null);
              }}
              aria-label="Xóa kết quả chấm giọng nói"
              title="Thử lại"
              className="p-2.5 rounded-xl border border-parchment-300 bg-white hover:bg-parchment-100 text-ink-light"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>

        <div className="text-[11px] sm:text-xs font-semibold text-ink-light flex items-center gap-1.5">
          {micSupported ? (
            <>
              <Volume2 size={14} className="text-celadon shrink-0" />
              <span>Nhận dạng tiếng Trung (zh-CN)</span>
            </>
          ) : (
            <>
              <MicOff size={14} className="text-vermillion shrink-0" />
              <span>Trình duyệt chưa hỗ trợ Micro</span>
            </>
          )}
        </div>
      </div>

      {/* Live listening waveform / interim transcript */}
      {listening && (
        <div className="rounded-xl bg-white border border-celadon-200 px-4 py-3 text-center space-y-1">
          <div className="text-xs font-bold text-celadon-dark uppercase tracking-wider">
            Hãy đọc rõ to tiếng Trung…
          </div>
          <div className="font-chinese text-xl font-bold text-ink min-h-[28px]">
            {interimTranscript || "…"}
          </div>
        </div>
      )}

      {/* Mic fallback input when browser does not support Web Speech Recognition */}
      {!micSupported && (
        <div className="rounded-xl bg-white border border-parchment-300 p-3 space-y-2">
          <p className="text-xs text-ink-light">
            Trình duyệt này chưa hỗ trợ ghi âm tiếng Trung trực tiếp (khuyên dùng Chrome / Edge / Safari). Bạn vẫn có thể dán chữ Hán vừa đọc để test bộ chấm lỗi:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Nhập chữ Hán bạn đọc..."
              className="flex-1 rounded-xl border border-parchment-300 px-3 py-2 text-sm font-chinese"
            />
            <button
              type="button"
              onClick={() => scoreAndDisplay(manualInput)}
              disabled={!manualInput.trim()}
              className="px-4 py-2 rounded-xl bg-celadon text-white text-xs font-bold disabled:opacity-40"
            >
              Chấm thử
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl bg-vermillion-light border border-vermillion-soft px-4 py-3 text-xs sm:text-sm text-vermillion-deep flex items-start gap-2"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && scoreStyle && (
        <div className="rounded-2xl bg-white border border-parchment-300 p-4 sm:p-5 space-y-4">
          {/* Score Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-parchment-200 pb-3">
            <div className="flex items-center gap-3">
              <div className={`text-3xl sm:text-4xl font-black leading-none ${scoreStyle.ring}`}>
                {evaluation.score}%
              </div>
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreStyle.badge}`}>
                  {evaluation.score >= 85 && <CheckCircle2 size={12} />}
                  {scoreStyle.label}
                </span>
                <div className="text-xs text-ink-light mt-1">
                  Đọc đúng <strong>{evaluation.matchedCount}/{evaluation.totalChars}</strong> chữ
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="text-ink-light">Hệ thống nghe được:</div>
              <div className="font-chinese text-base font-bold text-ink">
                {evaluation.spokenText}
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-ink">
            {evaluation.overallFeedback}
          </p>

          {/* Character-by-character breakdown */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-light">
              Chi tiết từng chữ:
            </div>
            <div className="flex flex-wrap gap-2">
              {evaluation.charDetails.map((item) => (
                <div
                  key={`${item.index}-${item.targetChar}`}
                  className={`rounded-xl border-2 px-3 py-2 text-center min-w-[60px] ${getCharChipStyle(item)}`}
                >
                  <div className="font-chinese text-xl font-black leading-tight">
                    {item.targetChar}
                  </div>
                  {item.targetPinyin && (
                    <div className="text-[11px] font-bold opacity-85">{item.targetPinyin}</div>
                  )}
                  <div className="text-[10px] font-bold uppercase mt-0.5">
                    {item.status === "correct"
                      ? "Đúng"
                      : item.status === "tone_error"
                      ? "Sai thanh"
                      : item.status === "missing"
                      ? "Thiếu"
                      : `Nghe: ${item.spokenChar ?? "?"}`}
                  </div>
                </div>
              ))}
            </div>

            {evaluation.extraChars.length > 0 && (
              <p className="text-xs text-vermillion-deep pt-1">
                Đọc dư so với đề bài: <strong className="font-chinese">{evaluation.extraChars.join(" ")}</strong>
              </p>
            )}
          </div>

          {/* Wrong word / character coaching */}
          {evaluation.wrongItems.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-parchment-200">
              <div className="text-xs font-black uppercase tracking-wider text-vermillion-deep">
                Từ sai &amp; Cách đọc cho đúng:
              </div>
              {evaluation.wrongItems.map((item) => (
                <div
                  key={`fix-${item.index}-${item.targetChar}`}
                  className="rounded-xl bg-parchment-50 border border-parchment-300 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-chinese text-lg font-black text-vermillion-deep">
                        {item.targetChar}
                      </span>
                      {item.targetPinyin && (
                        <span className="px-2 py-0.5 rounded-full bg-white border border-parchment-300 text-xs font-bold text-ink">
                          {item.targetPinyin}
                        </span>
                      )}
                    </div>
                    {item.issueSummary && (
                      <p className="text-xs font-semibold text-vermillion-deep">
                        {item.issueSummary}
                      </p>
                    )}
                    {item.howToPronounce && (
                      <p className="text-xs text-ink-light leading-relaxed">
                        💡 <strong>Cách đọc đúng:</strong> {item.howToPronounce}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <AudioButton text={item.targetChar} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
