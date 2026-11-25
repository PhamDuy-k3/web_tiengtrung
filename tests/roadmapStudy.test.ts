import { describe, expect, it } from "vitest";
import { generateAssessmentRoadmap } from "@/lib/assessmentEngine";
import { buildRoadmapLessonPlan } from "@/lib/roadmapStudy";

describe("roadmapStudy", () => {
  it("builds foundational flashcards, grammar guides, and practice questions for HSK 0 week 1", () => {
    const roadmap = generateAssessmentRoadmap({
      verified_level: 0,
      target_level: 3,
      daily_minutes: 30,
    });

    const firstLesson = roadmap.weeks[0].lessons[0];
    const plan = buildRoadmapLessonPlan(roadmap, firstLesson.id);

    expect(plan).not.toBeNull();
    expect(plan!.hskLevel).toBe(1);
    expect(plan!.studyCards.length).toBeGreaterThanOrEqual(5);
    expect(plan!.grammarGuides.length).toBeGreaterThanOrEqual(1);
    expect(plan!.practiceQuestions.length).toBe(5);
    expect(plan!.nextLesson?.id).toBe(roadmap.weeks[0].lessons[1].id);
  });

  it("builds an 8-question test plan for test-type roadmap lessons and handles remedial/intermediate levels", () => {
    const roadmap = generateAssessmentRoadmap({
      verified_level: 2,
      target_level: 5,
      daily_minutes: 45,
      weak_points: ["Cú pháp câu chữ 把"],
      weak_skills: ["grammar"],
    });

    const allLessons = roadmap.weeks.flatMap((week) => week.lessons);
    const remedialLesson = allLessons.find((lesson) => lesson.type === "remedial");
    const testLesson = allLessons.find((lesson) => lesson.type === "test");

    expect(remedialLesson).toBeDefined();
    expect(testLesson).toBeDefined();

    const remedialPlan = buildRoadmapLessonPlan(roadmap, remedialLesson!.id);
    expect(remedialPlan).not.toBeNull();
    expect(remedialPlan!.studyCards.length).toBeGreaterThanOrEqual(5);
    expect(remedialPlan!.practiceQuestions.length).toBeGreaterThanOrEqual(5);

    const testPlan = buildRoadmapLessonPlan(roadmap, testLesson!.id);
    expect(testPlan).not.toBeNull();
    expect(testPlan!.practiceQuestions.length).toBe(8);
  });

  it("returns null when lessonId does not exist in the roadmap", () => {
    const roadmap = generateAssessmentRoadmap({ verified_level: 1, target_level: 2 });
    expect(buildRoadmapLessonPlan(roadmap, "nonexistent-lesson-id")).toBeNull();
  });
});
