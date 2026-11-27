"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  Circle,
  Loader2,
  Play,
  RotateCcw,
  ShieldAlert,
  Square,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { allMockExams, basicExams, intermediateExams } from "@/data/mock";
import type { LevelId, Question } from "@/types";

type StepStatus = "pending" | "running" | "done" | "error";

interface BotStep {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

interface BotLog {
  id: number;
  time: string;
  level: "info" | "success" | "warn" | "error";
  message: string;
}

const INITIAL_STEPS: BotStep[] = [
  { id: "reset", label: "1. Khởi tạo từ Cơ bản (chỉ mở basic)", status: "pending" },
  { id: "basic-1", label: "2. Làm đề Cơ bản #1 (đạt ≥ 60%)", status: "pending" },
  { id: "basic-2", label: "3. Làm đề Cơ bản #2 (đạt ≥ 60%)", status: "pending" },
  { id: "basic-test", label: "4. Thi Vượt Cấp Cơ bản → Mở Trung cấp", status: "pending" },
  { id: "inter-1", label: "5. Làm đề Trung cấp #1 (đạt ≥ 60%)", status: "pending" },
  { id: "inter-2", label: "6. Làm đề Trung cấp #2 (đạt ≥ 60%)", status: "pending" },
  { id: "inter-test", label: "7. Thi Vượt Cấp Trung cấp → Mở Nâng cao", status: "pending" },
  { id: "verify-adv", label: "8. Truy cập cấp độ Nâng cao", status: "pending" },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setNativeInputValue(
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string,
  win: Window
): void {
  const proto =
    el.tagName === "TEXTAREA"
      ? (win as unknown as typeof globalThis).HTMLTextAreaElement.prototype
      : (win as unknown as typeof globalThis).HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  if (descriptor?.set) {
    descriptor.set.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function readUnlockedLevelsFromStorage(): LevelId[] {
  try {
    const raw = localStorage.getItem("hanyu:v2");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { profile?: { unlockedLevels?: LevelId[] } };
    return parsed?.profile?.unlockedLevels ?? [];
  } catch {
    return [];
  }
}

export default function BotRunnerPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stopRequestedRef = useRef(false);
  const logIdRef = useRef(1);

  const [running, setRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(120);
  const [resetBeforeRun, setResetBeforeRun] = useState(true);
  const [steps, setSteps] = useState<BotStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [finalOutcome, setFinalOutcome] = useState<"idle" | "passed" | "failed">("idle");
  const [unlockedLevels, setUnlockedLevels] = useState<LevelId[]>([]);

  const questionById = useMemo(() => {
    const map = new Map<string, Question>();
    for (const exam of allMockExams) {
      for (const q of exam.questions) {
        map.set(q.id, q);
      }
    }
    return map;
  }, []);

  useEffect(() => {
    setUnlockedLevels(readUnlockedLevelsFromStorage());
  }, []);

  const addLog = useCallback((level: BotLog["level"], message: string) => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    setLogs((prev) => [
      { id: logIdRef.current++, time, level, message },
      ...prev.slice(0, 149),
    ]);
  }, []);

  const updateStep = useCallback((id: string, status: StepStatus, detail?: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, status, detail } : step))
    );
  }, []);

  const waitUntil = useCallback(
    async <T,>(
      fn: () => T | null | undefined | false,
      timeoutMs = 15000,
      intervalMs = 80
    ): Promise<T> => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (stopRequestedRef.current) throw new Error("BOT_STOPPED");
        const res = fn();
        if (res) return res;
        await sleep(intervalMs);
      }
      throw new Error("Hết thời gian chờ giao diện phản hồi.");
    },
    []
  );

  const navigateIframe = useCallback(
    async (path: string) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) throw new Error("Không tìm thấy khung trình duyệt.");
      iframe.contentWindow.location.assign(path);
      await sleep(250);
      await waitUntil(() => {
        const doc = iframe.contentDocument;
        const ready = doc?.readyState === "complete";
        const currentPath = iframe.contentWindow?.location.pathname;
        return ready && currentPath === path.split("?")[0] ? true : false;
      }, 15000);
      await sleep(250);
    },
    [waitUntil]
  );

  const findButtonByText = (doc: Document, text: string): HTMLButtonElement | null => {
    const target = text.trim().toLowerCase();
    const buttons = Array.from(doc.querySelectorAll("button"));
    return (
      buttons.find((btn) => !btn.disabled && btn.textContent?.trim().toLowerCase().includes(target)) ??
      null
    );
  };

  const answerCurrentQuestionInDom = useCallback(
    async (doc: Document, win: Window) => {
      const card = await waitUntil(
        () => doc.querySelector<HTMLElement>("[data-question-id]"),
        10000
      );
      const qId = card.getAttribute("data-question-id") || "";
      const question = questionById.get(qId);
      if (!question) {
        addLog("warn", `Không tìm thấy dữ liệu cho câu ${qId}, bỏ qua.`);
        return;
      }

      if (question.type === "hanzi_write") {
        addLog("warn", `Câu ${qId} là viết chữ Hán (canvas) — bot bỏ qua.`);
        return;
      }

      // 1. Check if typing input/textarea is active (WordOrder/FillInBlank at HSK 3-6, ShortTranslate)
      const textInput = card.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        'input[type="text"], input:not([type]), textarea'
      );
      if (textInput) {
        const answerStr = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.join("")
          : typeof question.correctAnswer === "string"
          ? question.correctAnswer
          : "";
        setNativeInputValue(textInput, answerStr, win);
        await sleep(speedMs);
        return;
      }

      // 2. Multiple choice / pinyin_choice / listen_choice / fill_in_blank (options mode)
      if (
        question.type === "multiple_choice" ||
        question.type === "pinyin_choice" ||
        question.type === "listen_choice" ||
        question.type === "fill_in_blank"
      ) {
        const expected = String(question.correctAnswer).trim();
        const buttons = Array.from(card.querySelectorAll("button")).filter(
          (btn) => !btn.disabled
        );
        const match =
          buttons.find((btn) => {
            const spans = Array.from(btn.querySelectorAll("span"));
            // Option text is usually in the last span (after A/B/C/D badge)
            const lastText = spans[spans.length - 1]?.textContent?.trim();
            return lastText === expected || btn.textContent?.trim() === expected;
          }) ??
          buttons.find((btn) => btn.textContent?.includes(expected));

        if (match) {
          match.click();
        } else {
          addLog("warn", `Không khớp nút đáp án "${expected}" cho ${qId}`);
        }
        await sleep(speedMs);
        return;
      }

      // 3. Word order / listen_word_order (tiles mode)
      if (question.type === "word_order" || question.type === "listen_word_order") {
        const expectedTiles = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : question.tiles ?? [];
        for (const tileText of expectedTiles) {
          if (stopRequestedRef.current) throw new Error("BOT_STOPPED");
          const buttons = Array.from(card.querySelectorAll("button")).filter(
            (btn) => !btn.disabled
          );
          const tileBtn = buttons.find((btn) => btn.textContent?.trim() === tileText.trim());
          if (tileBtn) {
            tileBtn.click();
            await sleep(Math.min(60, speedMs));
          }
        }
        await sleep(speedMs);
        return;
      }

      // 4. Matching
      if (question.type === "matching" && question.pairs) {
        for (const pair of question.pairs) {
          if (stopRequestedRef.current) throw new Error("BOT_STOPPED");
          const buttons = Array.from(card.querySelectorAll("button"));
          const leftBtn = buttons.find(
            (btn) => !btn.disabled && btn.textContent?.includes(pair.left)
          );
          if (leftBtn) {
            leftBtn.click();
            await sleep(Math.min(50, speedMs));
          }
          const rightButtons = Array.from(card.querySelectorAll("button"));
          const rightBtn = rightButtons.find(
            (btn) => !btn.disabled && btn.textContent?.includes(pair.right)
          );
          if (rightBtn) {
            rightBtn.click();
            await sleep(Math.min(60, speedMs));
          }
        }
        await sleep(speedMs);
      }
    },
    [addLog, questionById, speedMs, waitUntil]
  );

  const runPracticeExamInIframe = useCallback(
    async (examId: string, label: string) => {
      addLog("info", `Mở đề ${label}: /practice/${examId}`);
      await navigateIframe(`/practice/${examId}`);

      const iframe = iframeRef.current!;
      const doc = iframe.contentDocument!;
      const win = iframe.contentWindow!;

      // Wait until quiz card mounts
      await waitUntil(() => doc.querySelector("[data-question-id]"), 15000);

      for (let guard = 0; guard < 50; guard++) {
        if (stopRequestedRef.current) throw new Error("BOT_STOPPED");
        await answerCurrentQuestionInDom(doc, win);

        const nextBtn = findButtonByText(doc, "Câu tiếp theo");
        if (nextBtn) {
          nextBtn.click();
          await sleep(speedMs);
          continue;
        }

        const submitBtn = findButtonByText(doc, "NỘP BÀI");
        if (submitBtn) {
          submitBtn.click();
          await sleep(180);
          const confirmBtn = findButtonByText(doc, "Vẫn nộp bài");
          if (confirmBtn) confirmBtn.click();
          break;
        }

        throw new Error("Không tìm thấy nút Câu tiếp theo hoặc NỘP BÀI.");
      }

      // Wait for result route
      await waitUntil(
        () => iframe.contentWindow?.location.pathname.includes("/result/") ? true : false,
        15000
      );
      await sleep(300);

      const raw = localStorage.getItem("hanyu:v2");
      const parsed = raw ? JSON.parse(raw) : null;
      const latestScore = parsed?.attempts?.[0]?.score ?? 0;
      addLog("success", `Nộp xong ${label} — Điểm: ${latestScore}%`);
      return latestScore as number;
    },
    [addLog, answerCurrentQuestionInDom, navigateIframe, speedMs, waitUntil]
  );

  const runLevelTestInIframe = useCallback(
    async (levelId: "basic" | "intermediate", label: string) => {
      addLog("info", `Mở bài thi lên cấp: /level-test/${levelId}`);
      await navigateIframe(`/level-test/${levelId}`);

      const iframe = iframeRef.current!;
      const doc = iframe.contentDocument!;
      const win = iframe.contentWindow!;

      await waitUntil(() => doc.querySelector("[data-question-id]"), 15000);

      for (let guard = 0; guard < 60; guard++) {
        if (stopRequestedRef.current) throw new Error("BOT_STOPPED");
        await answerCurrentQuestionInDom(doc, win);

        const nextBtn = findButtonByText(doc, "Câu tiếp theo");
        if (nextBtn) {
          nextBtn.click();
          await sleep(speedMs);
          continue;
        }

        const submitBtn = findButtonByText(doc, "NỘP BÀI THI LÊN CẤP");
        if (submitBtn) {
          submitBtn.click();
          break;
        }

        throw new Error("Không tìm thấy nút Câu tiếp theo hoặc NỘP BÀI THI LÊN CẤP.");
      }

      // Wait for level test result screen
      await waitUntil(() => {
        const text = doc.body.textContent || "";
        return text.includes("CHÚC MỪNG BẠN ĐÃ LÊN CẤP") || text.includes("CHƯA ĐẠT ĐIỂM YÊU CẦU")
          ? true
          : false;
      }, 15000);

      await sleep(300);
      const levelsNow = readUnlockedLevelsFromStorage();
      setUnlockedLevels(levelsNow);
      const raw = localStorage.getItem("hanyu:v2");
      const parsed = raw ? JSON.parse(raw) : null;
      const latestScore = parsed?.attempts?.[0]?.score ?? 0;
      addLog(
        "success",
        `Hoàn thành thi lên cấp ${label} (${latestScore}%). Đã mở khóa: [${levelsNow.join(", ")}]`
      );
      return { score: latestScore as number, unlocked: levelsNow };
    },
    [addLog, answerCurrentQuestionInDom, navigateIframe, speedMs, waitUntil]
  );

  const handleStartBot = async () => {
    if (running) return;
    stopRequestedRef.current = false;
    setRunning(true);
    setFinalOutcome("idle");
    setLogs([]);
    setSteps(INITIAL_STEPS);

    try {
      // Step 1: Reset localStorage if enabled
      updateStep("reset", "running");
      if (resetBeforeRun) {
        localStorage.removeItem("hanyu:v2");
        localStorage.removeItem("hanyu:v1");
        Object.keys(localStorage)
          .filter((k) => k.startsWith("hanyu:quiz_draft"))
          .forEach((k) => localStorage.removeItem(k));
        addLog("info", "Đã reset dữ liệu về mặc định (chỉ mở khóa Cơ bản).");
      }
      await navigateIframe("/");
      const initialUnlocked = readUnlockedLevelsFromStorage();
      setUnlockedLevels(initialUnlocked);
      updateStep("reset", "done", `Mở khóa: ${initialUnlocked.join(", ") || "basic"}`);

      // Step 2 & 3: 2 Basic exams
      const bExam1 = basicExams[0];
      const bExam2 = basicExams[1];
      updateStep("basic-1", "running");
      const s1 = await runPracticeExamInIframe(bExam1.id, bExam1.title);
      updateStep("basic-1", s1 >= 60 ? "done" : "error", `${s1}%`);

      updateStep("basic-2", "running");
      const s2 = await runPracticeExamInIframe(bExam2.id, bExam2.title);
      updateStep("basic-2", s2 >= 60 ? "done" : "error", `${s2}%`);

      // Step 4: Basic level test -> Intermediate
      updateStep("basic-test", "running");
      const basicTestRes = await runLevelTestInIframe("basic", "Cơ bản");
      if (!basicTestRes.unlocked.includes("intermediate")) {
        updateStep("basic-test", "error", `${basicTestRes.score}% (chưa mở Trung cấp)`);
        throw new Error("Chưa mở khóa được cấp Trung cấp.");
      }
      updateStep("basic-test", "done", `${basicTestRes.score}% → Đã mở Trung cấp`);

      // Step 5 & 6: 2 Intermediate exams
      const iExam1 = intermediateExams[0];
      const iExam2 = intermediateExams[1];
      updateStep("inter-1", "running");
      const s3 = await runPracticeExamInIframe(iExam1.id, iExam1.title);
      updateStep("inter-1", s3 >= 60 ? "done" : "error", `${s3}%`);

      updateStep("inter-2", "running");
      const s4 = await runPracticeExamInIframe(iExam2.id, iExam2.title);
      updateStep("inter-2", s4 >= 60 ? "done" : "error", `${s4}%`);

      // Step 7: Intermediate level test -> Advanced
      updateStep("inter-test", "running");
      const interTestRes = await runLevelTestInIframe("intermediate", "Trung cấp");
      if (!interTestRes.unlocked.includes("advanced")) {
        updateStep("inter-test", "error", `${interTestRes.score}% (chưa mở Nâng cao)`);
        throw new Error("Chưa mở khóa được cấp Nâng cao.");
      }
      updateStep("inter-test", "done", `${interTestRes.score}% → Đã mở Nâng cao`);

      // Step 8: Navigate to Advanced level page & verify not locked
      updateStep("verify-adv", "running");
      await navigateIframe("/levels/advanced");
      const advBody = await waitUntil(() => {
        const text = iframeRef.current?.contentDocument?.body.textContent || "";
        return text.includes("Cấp độ: Nâng cao") || text.includes("Cấp độ này đang bị khóa")
          ? text
          : false;
      }, 10000);
      if (advBody.includes("Cấp độ này đang bị khóa") || !advBody.includes("Cấp độ: Nâng cao")) {
        updateStep("verify-adv", "error", "Trang Nâng cao vẫn bị khóa");
        throw new Error("Không thể truy cập trang Nâng cao.");
      }
      updateStep("verify-adv", "done", "Truy cập thành công!");
      setFinalOutcome("passed");
      addLog("success", "🎉 BOT ĐÃ LEO THÀNH CÔNG TỪ CƠ BẢN LÊN NÂNG CAO!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      if (msg === "BOT_STOPPED") {
        addLog("warn", "Người dùng đã dừng Bot.");
      } else {
        addLog("error", `Bot thất bại: ${msg}`);
        setFinalOutcome("failed");
      }
    } finally {
      setRunning(false);
    }
  };

  const handleStopBot = () => {
    stopRequestedRef.current = true;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-parchment-300 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-celadon-100 border border-celadon-200 text-celadon flex items-center justify-center shrink-0">
            <Bot size={26} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-ink">
              Bot Tự Động Kiểm Tra Leo Cấp (Cơ bản → Nâng cao)
            </h1>
            <p className="text-sm text-ink-light mt-0.5">
              Bot chạy trực tiếp trên giao diện trình duyệt thật bên dưới: tự làm đề, nộp bài, thi vượt cấp và kiểm chứng mở khóa cấp Nâng cao.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            disabled={running}
            className="px-3 py-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs font-bold text-ink"
            aria-label="Tốc độ bot"
          >
            <option value={40}>Siêu nhanh (40ms)</option>
            <option value={120}>Nhanh (120ms)</option>
            <option value={400}>Vừa phải (400ms)</option>
          </select>

          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-parchment-100 border border-parchment-300 text-xs font-semibold text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={resetBeforeRun}
              onChange={(e) => setResetBeforeRun(e.target.checked)}
              disabled={running}
            />
            Reset về Cơ bản
          </label>

          {!running ? (
            <button
              type="button"
              onClick={handleStartBot}
              className="px-5 py-2.5 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm flex items-center gap-2 shadow-soft"
            >
              <Play size={16} />
              Chạy Bot ngay
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopBot}
              className="px-5 py-2.5 rounded-2xl bg-vermillion hover:bg-vermillion-deep text-white font-bold text-sm flex items-center gap-2 shadow-soft"
            >
              <Square size={15} />
              Dừng Bot
            </button>
          )}
        </div>
      </div>

      {/* Outcome Banner */}
      {finalOutcome === "passed" && (
        <div className="bg-celadon-50 border-2 border-celadon-200 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trophy size={28} className="text-celadon shrink-0" />
            <div>
              <h2 className="text-lg font-black text-celadon-dark">
                XÁC NHẬN: Lên được Nâng cao!
              </h2>
              <p className="text-sm text-ink-light">
                Bot đã vượt qua 2 đề Cơ bản + Thi lên cấp Cơ bản + 2 đề Trung cấp + Thi lên cấp Trung cấp và truy cập thành công kho đề Nâng cao.
              </p>
            </div>
          </div>
          <Link
            href="/levels/advanced"
            className="px-4 py-2.5 rounded-xl bg-celadon text-white font-bold text-sm flex items-center gap-1.5"
          >
            Mở trang Nâng cao <ExternalLink size={15} />
          </Link>
        </div>
      )}

      {finalOutcome === "failed" && (
        <div className="bg-vermillion-light border-2 border-vermillion-soft rounded-3xl p-5 flex items-center gap-3">
          <ShieldAlert size={26} className="text-vermillion-deep shrink-0" />
          <div>
            <h2 className="text-lg font-black text-vermillion-deep">
              Bot chưa lên được Nâng cao
            </h2>
            <p className="text-sm text-ink-light">
              Xem chi tiết ở danh sách bước và nhật ký bên dưới để biết bước nào bị chặn.
            </p>
          </div>
        </div>
      )}

      {/* Main Split View: Steps + Logs on Left, Live Browser Iframe on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-5">
          {/* Steps */}
          <div className="bg-white rounded-3xl p-5 border border-parchment-300 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-ink text-base">Tiến trình leo cấp</h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-parchment-100 border border-parchment-300 text-ink-light">
                Đã mở: {unlockedLevels.join(", ") || "basic"}
              </span>
            </div>

            <div className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm ${
                    step.status === "done"
                      ? "bg-celadon-50 border-celadon-200 text-celadon-dark"
                      : step.status === "running"
                      ? "bg-gilt-light border-gilt-soft text-gilt-deep font-bold"
                      : step.status === "error"
                      ? "bg-vermillion-light border-vermillion-soft text-vermillion-deep"
                      : "bg-parchment-50 border-parchment-200 text-ink-light"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {step.status === "done" && <CheckCircle2 size={16} className="shrink-0" />}
                    {step.status === "running" && <Loader2 size={16} className="shrink-0 animate-spin" />}
                    {step.status === "error" && <ShieldAlert size={16} className="shrink-0" />}
                    {step.status === "pending" && <Circle size={15} className="shrink-0 opacity-40" />}
                    <span className="truncate">{step.label}</span>
                  </div>
                  {step.detail && (
                    <span className="text-[11px] font-bold shrink-0">{step.detail}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Logs */}
          <div className="bg-ink text-parchment-50 rounded-3xl p-4 border border-parchment-300 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-parchment-300">
              <span>Nhật ký chạy Bot ({logs.length})</span>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="flex items-center gap-1 hover:text-white"
              >
                <RotateCcw size={12} /> Xóa log
              </button>
            </div>
            <div className="h-64 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
              {logs.length === 0 ? (
                <p className="text-parchment-400 italic">
                  Nhấn &quot;Chạy Bot ngay&quot; để bắt đầu kiểm tra...
                </p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="leading-relaxed">
                    <span className="text-parchment-400">[{log.time}] </span>
                    <span
                      className={
                        log.level === "success"
                          ? "text-emerald-300 font-bold"
                          : log.level === "warn"
                          ? "text-amber-300"
                          : log.level === "error"
                          ? "text-rose-300 font-bold"
                          : "text-parchment-100"
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Browser Viewport */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-parchment-300 shadow-soft overflow-hidden">
          <div className="px-4 py-2.5 bg-parchment-100 border-b border-parchment-300 flex items-center justify-between text-xs font-bold text-ink-light">
            <span>Trình duyệt thực tế (Live UI)</span>
            <span className="text-[11px] font-mono opacity-75">same-origin iframe</span>
          </div>
          <iframe
            ref={iframeRef}
            src="/"
            title="Hanyu Bot Live Browser"
            className="w-full h-[680px] bg-parchment-50"
          />
        </div>
      </div>
    </div>
  );
}
