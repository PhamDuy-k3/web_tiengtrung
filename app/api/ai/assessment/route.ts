import { NextRequest, NextResponse } from "next/server";
import {
  generateAssessmentTest,
  evaluateAssessmentTest,
  generateAssessmentRoadmap,
} from "@/lib/assessmentEngine";

/**
 * AI Assessment & Roadmap API Endpoint
 * Accepts: { mode: "generate_test" | "evaluate_test" | "generate_roadmap", ...params }
 * Returns: Clean JSON as per strict user specifications
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = body.mode;

    // ==================== MODE = "generate_test" ====================
    if (mode === "generate_test") {
      const result = generateAssessmentTest({
        questions_per_level: body.questions_per_level,
        max_level: body.max_level,
        script: body.script,
        hsk_system: body.hsk_system,
      });
      return NextResponse.json(result);
    }

    // ==================== MODE = "evaluate_test" ====================
    if (mode === "evaluate_test") {
      const testQuestions = body.test_questions || [];
      const userAnswers = body.user_answers || {};
      const result = evaluateAssessmentTest(testQuestions, userAnswers);
      return NextResponse.json(result);
    }

    // ==================== MODE = "generate_roadmap" ====================
    if (mode === "generate_roadmap") {
      const result = generateAssessmentRoadmap({
        verified_level: body.verified_level,
        target_level: body.target_level,
        daily_minutes: body.daily_minutes,
        weak_points: body.weak_points,
        weak_skills: body.weak_skills,
      });
      return NextResponse.json(result);
    }

    // Invalid or missing mode
    return NextResponse.json(
      {
        error: "Invalid or missing 'mode'. Supported modes: 'generate_test', 'evaluate_test', 'generate_roadmap'",
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Lỗi xử lý yêu cầu đánh giá & lộ trình",
        detail: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
