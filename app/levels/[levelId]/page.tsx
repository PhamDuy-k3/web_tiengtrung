"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Dice5,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Trophy,
  Timer,
  Shuffle,
  Target,
  RotateCcw,
  ListChecks,
} from "lucide-react";
import { repository } from "@/services";
import { Level, LevelId, Topic, Exam, LevelProgressInfo, QuestionType } from "@/types";
import type { SrsReviewItem } from "@/types/srs";
import { CustomSelect } from "@/components/ui/CustomSelect";

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "word_order", label: "Sắp xếp câu" },
  { value: "multiple_choice", label: "Trắc nghiệm" },
  { value: "fill_in_blank", label: "Điền từ" },
  { value: "matching", label: "Nối cặp" },
  { value: "listen_choice", label: "Nghe chọn đáp án" },
  { value: "listen_word_order", label: "Nghe xếp câu" },
  { value: "pinyin_choice", label: "Chọn Pinyin" },
  { value: "short_translate", label: "Dịch câu ngắn" },
];

export default function LevelDetailPage() {
  const params = useParams();
  const levelId = (params.levelId as LevelId) || "basic";

  const [level, setLevel] = useState<Level | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicExams, setTopicExams] = useState<Record<string, Exam[]>>({});
  const [progress, setProgress] = useState<Record<string, { bestScore: number; attempts: number }>>({});
  const [levelProg, setLevelProg] = useState<LevelProgressInfo | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [dueItems, setDueItems] = useState<SrsReviewItem[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>("multiple_choice");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [lvl, profile] = await Promise.all([
          repository.getLevel(levelId),
          repository.getProfile(),
        ]);
        setLevel(lvl);
        setIsUnlocked(profile.unlockedLevels.includes(levelId));

        const tps = await repository.getTopics(levelId);
        setTopics(tps);

        const exMap: Record<string, Exam[]> = {};
        for (const t of tps) {
          exMap[t.id] = await repository.getExams(t.id);
        }
        setTopicExams(exMap);

        const progMap = await repository.getProgress();
        setProgress(progMap);

        const lp = await repository.getLevelProgress(levelId);
        setLevelProg(lp);

        const [lessons, due] = await Promise.all([
          repository.getCompletedLessons(),
          repository.getDueSrsItems(),
        ]);
        setCompletedLessons(lessons);
        setDueItems(due);
      } catch (e) {
        console.error("Lỗi tải trang cấp độ:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [levelId]);

  useEffect(() => {
    const refreshLearningProgress = () => {
      Promise.all([repository.getCompletedLessons(), repository.getDueSrsItems()])
        .then(([lessons, due]) => {
          setCompletedLessons(lessons);
          setDueItems(due);
        })
        .catch((error: unknown) => console.error("Lỗi tải tiến độ học:", error));
    };
    window.addEventListener("focus", refreshLearningProgress);
    return () => window.removeEventListener("focus", refreshLearningProgress);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-charcoal/60">
        <div className="animate-spin w-8 h-8 border-4 border-coral border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang tải kho đề cấp độ...
      </div>
    );
  }

  if (!level) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold">Không tìm thấy cấp độ này</h2>
        <Link href="/" className="text-coral underline mt-2 inline-block">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-parchment-200 border border-parchment-300 text-ink-light flex items-center justify-center mx-auto">
          <Lock size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink">
          Cấp độ {level.name} đang bị khóa
        </h1>
        <p className="text-sm text-ink-light leading-relaxed">
          Bạn cần vượt qua bài kiểm tra lên cấp của cấp độ trước (đạt ≥ 80%) hoặc đạt trình độ tương ứng qua bài kiểm tra xếp lớp để mở khóa cấp độ này.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-ink font-bold text-sm transition-colors"
          >
            Quay về trang chủ
          </Link>
          <Link
            href="/placement-test"
            className="px-5 py-2.5 rounded-xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm transition-colors"
          >
            Làm bài kiểm tra xếp lớp
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Top back navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/60 hover:text-coral transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Level Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-coral/10 text-coral border border-coral/20">
              {level.hskSpan}
            </span>
            <span className="text-xs font-bold text-charcoal/50">{level.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-charcoal">
            Cấp độ: {level.name}
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 max-w-2xl leading-relaxed">
            {level.description}
          </p>
        </div>

        {/* Quick Action: Random Exam from this Level */}
        <div className="shrink-0">
          <Link
            href={`/practice/random-exam-${level.id}`}
            className="px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2 shadow-duo-honey active:translate-y-1 transition-all"
          >
            <Dice5 size={20} />
            <span>Luyện đề ngẫu nhiên (12 câu)</span>
          </Link>
        </div>
      </div>

      {/* Level Test Status / Unlock Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-50 to-cream-100 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="text-amber-600" size={20} />
            <h2 className="font-bold text-lg text-charcoal">Bài kiểm tra lên cấp</h2>
          </div>
          {levelProg?.hasPassedLevelTest ? (
            <p className="text-sm text-mint-dark font-bold">
              ✓ Bạn đã xuất sắc hoàn thành bài kiểm tra lên cấp của trình độ này!
            </p>
          ) : levelProg?.canTakeLevelTest ? (
            <p className="text-sm text-coral-dark font-bold">
              🎉 Bạn đã làm đủ {levelProg.qualifyingExams}/{levelProg.totalExams} đề đạt từ 60% trở lên! Bài thi lên cấp đã sẵn sàng mở khóa.
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-charcoal/70">
              Tiến độ mở khóa: Đã đạt {levelProg?.qualifyingExams || 0}/{Math.ceil((levelProg?.totalExams || 16) * 0.7)} đề yêu cầu (còn thiếu{" "}
              <strong className="text-coral">{levelProg?.examsNeededForTest || 0} đề</strong> nữa).
            </p>
          )}
        </div>

        {levelProg?.canTakeLevelTest || levelProg?.hasPassedLevelTest ? (
          <Link
            href={`/level-test/${level.id}`}
            className="px-5 py-3 rounded-2xl font-bold text-sm shrink-0 flex items-center gap-2 transition-all bg-coral hover:bg-coral-dark text-white shadow-duo-coral"
          >
            <span>
              {levelProg.hasPassedLevelTest
                ? "Làm lại bài thi lên cấp"
                : "Làm bài thi lên cấp ngay!"}
            </span>
            <ArrowRight size={16} />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="px-5 py-3 rounded-2xl font-bold text-sm shrink-0 flex items-center gap-2 bg-white/80 text-charcoal/50 border border-amber-200 cursor-not-allowed"
          >
            <Lock size={15} />
            <span>Cần thêm {levelProg?.examsNeededForTest || 0} đề để mở khóa</span>
          </button>
        )}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-charcoal">Chọn chế độ luyện</h2>
          <p className="text-sm text-charcoal/60">Luyện có phản hồi, thi thử có giờ, luyện nhanh, ôn SRS hoặc tập trung vào một dạng câu.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <ModeCard href="#topic-paths" icon={<BookOpen size={20} />} title="Luyện tập" detail="Phản hồi và giải thích ngay sau mỗi câu" tone="mint" />
          <ModeCard href={`/practice/random-exam-${level.id}?mode=exam`} icon={<Timer size={20} />} title="Thi thử" detail="12 câu tổng hợp, có đồng hồ, xem điểm cuối bài" tone="coral" />
          <ModeCard href={`/practice/random-exam-${level.id}?mode=quick`} icon={<Shuffle size={20} />} title="Luyện nhanh" detail="8 câu trộn, phản hồi tức thì" tone="amber" />
          <ModeCard href="/review" icon={<RotateCcw size={20} />} title="Ôn lỗi sai" detail="Ôn câu hỏi và từ vựng đến hạn theo SRS" tone="purple" />
          <div className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-black text-sm text-charcoal"><Target size={20} className="text-coral" />Theo dạng bài</div>
            <p className="text-xs text-charcoal/60">Tập trung luyện một dạng câu hỏi.</p>
            <CustomSelect
              ariaLabel="Chọn dạng bài"
              size="sm"
              value={selectedQuestionType}
              onChange={(val) => setSelectedQuestionType(val)}
              options={QUESTION_TYPE_OPTIONS}
            />
            <Link href={`/practice/type-practice-${level.id}-${selectedQuestionType}?mode=type`} className="inline-flex items-center gap-1 text-xs font-bold text-coral hover:text-coral-dark">
              Bắt đầu luyện <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* TOPICS & EXAMS LIST */}
      <div id="topic-paths" className="space-y-10 scroll-mt-24">
        {topics.map((topic) => {
          const exams = topicExams[topic.id] || [];
          const practiceOne = exams[0];
          const practiceTwo = exams[1];
          const topicTest = exams.length > 2 ? exams[exams.length - 1] : undefined;
          const lessonDone = completedLessons.includes(topic.id);
          const practiceOneDone = !!practiceOne && (progress[practiceOne.id]?.attempts ?? 0) > 0;
          const practiceTwoDone = !!practiceTwo && (progress[practiceTwo.id]?.attempts ?? 0) > 0;
          const topicDueCount = dueItems.filter((item) => item.kind === "question"
            ? item.question.topicId === topic.id
            : item.vocabulary.topicId === topic.id).length;
          const reviewDone = practiceTwoDone && topicDueCount === 0;
          const reviewUnlocked = practiceTwoDone;
          const testUnlocked = practiceTwoDone && reviewDone;
          const topicTestDone = !!topicTest && (progress[topicTest.id]?.attempts ?? 0) > 0;

          return (
            <div key={topic.id} className="space-y-4">
              {/* Topic Header */}
              <div className="flex items-center gap-3 border-b border-cream-300 pb-2">
                <span className="text-2xl sm:text-3xl">{topic.icon}</span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-charcoal">
                    {topic.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-charcoal/60">
                    {topic.description} ({exams.length} đề thi)
                  </p>
                </div>
              </div>

              <Link
                href={`/learn/${topic.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mint/10 border border-mint/30 text-mint-dark font-bold text-sm hover:bg-mint/20 transition-colors"
              >
                <BookOpen size={16} />
                Học từ vựng
                <ArrowRight size={15} />
              </Link>

              <section aria-label={`Lộ trình ${topic.name}`} className="rounded-2xl border border-cream-300 bg-cream-50 p-4 space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-black text-charcoal"><ListChecks size={17} className="text-coral" />Lộ trình chủ đề</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  <PathStep title="1 · Bài học" done={lessonDone} href={`/learn/${topic.id}`} enabled icon={<BookOpen size={16} />} action={lessonDone ? "Xem lại" : "Bắt đầu"} />
                  <PathStep title="2 · Luyện 1" done={practiceOneDone} href={practiceOne ? `/practice/${practiceOne.id}?mode=practice` : undefined} enabled={(lessonDone || practiceOneDone) && !!practiceOne} icon={<ArrowRight size={16} />} action={practiceOneDone ? "Luyện lại" : "Mở bài"} />
                  <PathStep title="3 · Luyện 2" done={practiceTwoDone} href={practiceTwo ? `/practice/${practiceTwo.id}?mode=practice` : undefined} enabled={(practiceOneDone || practiceTwoDone) && !!practiceTwo} icon={<ArrowRight size={16} />} action={practiceTwoDone ? "Luyện lại" : "Mở bài"} />
                  <PathStep title="4 · Ôn SRS" done={reviewDone} href={`/review?topicId=${topic.id}&returnTo=${encodeURIComponent(`/levels/${level.id}`)}`} enabled={reviewUnlocked && !reviewDone} icon={<RotateCcw size={16} />} action={reviewDone ? "Không có mục đến hạn" : `${topicDueCount} mục đến hạn`} />
                  <PathStep title="5 · Kiểm tra chủ đề" done={topicTestDone} href={topicTest ? `/practice/${topicTest.id}?mode=exam` : undefined} enabled={(testUnlocked || topicTestDone) && !!topicTest} icon={<Trophy size={16} />} action="Thi thử" />
                </div>
                {!topicTest && <p className="text-xs text-charcoal/60">Chủ đề này chưa có đề kiểm tra riêng để làm bước cuối.</p>}
              </section>

              {/* Exams Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {exams.map((exam, idx) => {
                  const p = progress[exam.id];
                  const hasDone = p && p.attempts > 0;
                  const isHigh = p && p.bestScore >= 80;
                  const previousExam = exams[idx - 1];
                  const previousStepDone = idx === 0
                    ? lessonDone
                    : !!previousExam && (progress[previousExam.id]?.attempts ?? 0) > 0;
                  const isFinalTopicTest = topicTest?.id === exam.id;
                  const canOpenExam = previousStepDone && (!isFinalTopicTest || testUnlocked || (progress[exam.id]?.attempts ?? 0) > 0);

                  return (
                    <div
                      key={exam.id}
                      className="bg-white rounded-3xl p-5 border-2 border-cream-300 hover:border-amber-300 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Status Tag */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-charcoal/40">
                            Đề {idx + 1}
                          </span>
                          {hasDone ? (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                                isHigh
                                  ? "bg-mint-light text-mint-dark"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Điểm cao: {p.bestScore}%
                            </span>
                          ) : (
                            <span className="text-charcoal/40 bg-cream-200 px-2 py-0.5 rounded-full">
                              Chưa làm
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-base text-charcoal line-clamp-1">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-charcoal/60 line-clamp-2 leading-relaxed">
                          {exam.description}
                        </p>
                        <div className="text-[11px] text-charcoal/50 font-medium">
                          {exam.questions.length} câu hỏi • Có âm thanh phát âm
                        </div>
                      </div>

                      <div className="pt-4">
                        {canOpenExam ? (
                          <Link
                            href={`/practice/${exam.id}?mode=${isFinalTopicTest ? "exam" : "practice"}`}
                            className="w-full py-2.5 rounded-xl bg-coral/10 hover:bg-coral text-coral hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-coral/30 hover:border-coral"
                          >
                            <span>{hasDone ? "Luyện lại đề" : "Bắt đầu làm bài"}</span>
                            <ArrowRight size={14} />
                          </Link>
                        ) : (
                          <button type="button" disabled className="w-full py-2.5 rounded-xl bg-cream-100 text-charcoal/40 font-bold text-xs flex items-center justify-center gap-1.5 border border-cream-300 cursor-not-allowed">
                            <Lock size={14} />
                            <span>{isFinalTopicTest ? "Hoàn thành ôn SRS để mở" : "Hoàn thành bước trước để mở"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModeCard({
  href,
  icon,
  title,
  detail,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  tone: "mint" | "coral" | "amber" | "purple";
}) {
  const tones = {
    mint: "border-mint/30 bg-mint-light/50 text-mint-dark",
    coral: "border-coral/30 bg-coral/5 text-coral-dark",
    amber: "border-amber-300 bg-amber-50 text-amber-800",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
  };
  return (
    <Link href={href} className={`rounded-2xl border p-4 shadow-sm hover:-translate-y-0.5 transition-transform ${tones[tone]}`}>
      <div className="flex items-center gap-2 font-black text-sm">{icon}{title}</div>
      <p className="mt-2 text-xs leading-relaxed text-charcoal/70">{detail}</p>
    </Link>
  );
}

function PathStep({
  title,
  done,
  href,
  enabled,
  icon,
  action,
}: {
  title: string;
  done: boolean;
  href?: string;
  enabled: boolean;
  icon: React.ReactNode;
  action: string;
}) {
  const className = `min-h-28 rounded-xl border p-3 flex flex-col justify-between ${done ? "border-mint/40 bg-mint-light/60" : enabled ? "border-coral/30 bg-white" : "border-cream-300 bg-cream-100 text-charcoal/45"}`;
  const content = (
    <>
      <span className="text-xs font-black">{title}</span>
      <span className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${done ? "text-mint-dark" : enabled ? "text-coral" : "text-charcoal/40"}`}>
        {!enabled && !done ? <Lock size={13} /> : icon}
        {done ? "Hoàn tất" : action}
      </span>
    </>
  );
  return enabled && href
    ? <Link href={href} className={`${className} hover:border-coral/50 transition-colors`}>{content}</Link>
    : <div aria-disabled="true" className={className}>{content}</div>;
}
