import { lumen } from '@/api/lumenClient';
import { isDemoMode } from '@/lib/demoMode';
import {
  analyzeLearnerSignals,
  buildCoachLessonTurnPrompt,
  buildCoachFreeChatPrompt,
  buildCoachEvaluateFeedbackPrompt,
  coachThinkingDelay,
  coachDemoLessonReply,
  coachDemoFreeTextReply,
  formatSignalsForPrompt,
  COACH_REASSURANCE_CLOSE,
  COACH_TRY_OR_SAVE,
} from '@/lib/grokCoach';
import {
  buildLearnerProfilePromptAddendum,
  profileExtraDelayMs,
  sleepMs,
} from '@/lib/learnerProfile';
import {
  buildMentalScenarioTurnPrompt,
  mentalScenarioSidebarHint,
} from '@/lib/mentalScenario';
import { applyMasteryUnlockGate } from '@/lib/assessmentRemediation';

export const grokService = {
  // Structure course content into lessons using Lumen Academy method
  async structureCourse(rawContent, courseTitle) {
    if (isDemoMode()) {
      return {
        course_title: courseTitle,
        description: 'Demo mode: structured outline preview.',
        lessons: [
          {
            id: 'l1',
            title: 'Demo concept',
            format: 'theory',
            content: 'Placeholder lesson content.',
            duration: 5,
            keyPoints: ['Demo key point'],
          },
        ],
        summary: 'Demo mode summary.',
      };
    }

    const response = await lumen.integrations.Core.InvokeLLM({
      prompt: `You are an expert instructional designer using the Lumen Academy method for vocational training.

Transform the following content into a structured micro-learning course following these STRICT rules:

1. Divide into 5–12 short modules (lessons) — each ~5 minutes maximum
2. Lesson types (assign one per lesson):
   - theory (spoken summary / podcast-style script — casual, conversational)
   - visual (infographic or slide bullets + describe 1 key image/diagram)
   - video (short 3–5 min video concept — describe what video should show)
   - chat (interactive questions or quick reflection prompts)
   - mental_practice (ONLY in final lesson: guided imagination scenario)
3. Respect original content: do not add new facts. Rephrase for clarity only.
4. Keep language simple, practical, vocational.
5. Final module should end with strong mental practice.

Course Title: ${courseTitle}

Raw Content:
${rawContent}

Return structured course following the format.`,
      response_json_schema: {
        type: "object",
        properties: {
          course_title: { type: "string" },
          description: { type: "string" },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                module_title: { type: "string" },
                lessons: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      lesson_title: { type: "string" },
                      type: { type: "string", enum: ["theory", "visual", "video", "chat", "mental_practice"] },
                      content_summary: { type: "string" },
                      suggested_output: { type: "string" }
                    }
                  }
                },
                final_mental_practice: { type: "boolean" }
              }
            }
          },
          cert_note: { type: "string" }
        }
      }
    });
    
    // Convert to app format
    const lessons = [];
    let lessonId = 1;
    
    response.modules?.forEach((module, moduleIdx) => {
      module.lessons?.forEach((lesson, lessonIdx) => {
        lessons.push({
          id: `l${lessonId++}`,
          title: lesson.lesson_title,
          format: lesson.type,
          content: lesson.content_summary,
          duration: 5,
          keyPoints: [lesson.suggested_output]
        });
      });
    });
    
    return {
      course_title: response.course_title || courseTitle,
      description: response.description,
      lessons: lessons,
      summary: response.description
    };
  },

  /**
   * Lesson-scoped Coach (Grok) — persona + adaptive layer from `src/lib/grokCoach.ts`.
   */
  async chatWithStudent(lessonContent, conversationHistory, studentMessage, opts = {}) {
    const { learnerProfileDoc = null } = opts;
    const prior = Array.isArray(conversationHistory) ? conversationHistory : [];
    const signals = analyzeLearnerSignals({
      lastUserMessage: studentMessage,
      priorMessages: prior,
    });

    if (isDemoMode()) {
      return applyMasteryUnlockGate(coachDemoLessonReply(signals));
    }

    if (learnerProfileDoc) {
      await sleepMs(profileExtraDelayMs(learnerProfileDoc.profile));
    }

    const historyText = prior.map((m) => `${m.role}: ${m.content}`).join('\n');
    await coachThinkingDelay();

    const userTurns = learnerProfileDoc?.history?.length ?? 0;
    const learnerProfileAddendum = learnerProfileDoc
      ? buildLearnerProfilePromptAddendum(learnerProfileDoc, { userTurnCount: userTurns })
      : undefined;

    const prompt = buildCoachLessonTurnPrompt({
      lessonContent,
      historyText,
      studentMessage,
      signals,
      learnerProfileAddendum,
    });

    const response = await lumen.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          mastery_score: { type: "number" },
          is_frustrated: { type: "boolean" },
          ready_for_next: { type: "boolean" },
          suggestion: { type: "string" },
        },
      },
    });
    return applyMasteryUnlockGate(response);
  },

  /**
   * Mental scenario simulation — same JSON shape as lesson chat, Coach + imagination rules.
   */
  async mentalScenarioTurn(lessonContent, conversationHistory, studentMessage, opts = {}) {
    const {
      learnerProfileDoc = null,
      courseTitle = 'Course',
      lessonTitle = 'Lesson',
    } = opts;
    const prior = Array.isArray(conversationHistory) ? conversationHistory : [];
    const signals = analyzeLearnerSignals({
      lastUserMessage: studentMessage,
      priorMessages: prior,
    });

    if (isDemoMode()) {
      return applyMasteryUnlockGate(coachDemoLessonReply(signals));
    }

    if (learnerProfileDoc) {
      await sleepMs(profileExtraDelayMs(learnerProfileDoc.profile));
    }

    const historyText = prior.map((m) => `${m.role}: ${m.content}`).join('\n');
    await coachThinkingDelay();

    const userTurns = learnerProfileDoc?.history?.length ?? 0;
    const learnerProfileAddendum = learnerProfileDoc
      ? buildLearnerProfilePromptAddendum(learnerProfileDoc, { userTurnCount: userTurns })
      : undefined;

    const adaptiveBlock = [
      formatSignalsForPrompt(signals),
      learnerProfileAddendum,
    ]
      .filter(Boolean)
      .join('\n');

    const prompt = buildMentalScenarioTurnPrompt({
      courseTitle,
      lessonTitle,
      lessonContent,
      historyText,
      studentMessage,
      adaptiveBlock: adaptiveBlock || undefined,
    });

    const response = await lumen.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          response: { type: 'string' },
          mastery_score: { type: 'number' },
          is_frustrated: { type: 'boolean' },
          ready_for_next: { type: 'boolean' },
          suggestion: { type: 'string' },
        },
      },
    });
    return applyMasteryUnlockGate(response);
  },

  /**
   * Global sidebar Coach — same rules, no lesson body unless you pass `extraContext`.
   */
  async coachFreeChat(conversationHistory, studentMessage, extraContext = '', opts = {}) {
    const { learnerProfileDoc = null, mentalSimulation = false } = opts;
    const prior = Array.isArray(conversationHistory) ? conversationHistory : [];
    const signals = analyzeLearnerSignals({
      lastUserMessage: studentMessage,
      priorMessages: prior,
    });

    if (isDemoMode()) {
      return coachDemoFreeTextReply(signals, studentMessage);
    }

    if (learnerProfileDoc) {
      await sleepMs(profileExtraDelayMs(learnerProfileDoc.profile));
    }

    const historyText = prior.map((m) => `${m.role}: ${m.content}`).join('\n');
    await coachThinkingDelay();

    const userTurns = learnerProfileDoc?.history?.length ?? 0;
    const learnerProfileAddendum = learnerProfileDoc
      ? buildLearnerProfilePromptAddendum(learnerProfileDoc, { userTurnCount: userTurns })
      : undefined;

    const mergedContext = [extraContext?.trim(), mentalSimulation ? mentalScenarioSidebarHint() : '']
      .filter(Boolean)
      .join('\n\n');

    const prompt = buildCoachFreeChatPrompt({
      historyText,
      studentMessage,
      signals,
      extraContext: mergedContext || undefined,
      learnerProfileAddendum,
    });

    const response = await lumen.integrations.Core.InvokeLLM({ prompt });
    return typeof response === 'string' ? response : JSON.stringify(response);
  },

  // Generate mastery assessment questions
  async generateAssessment(lessonContent) {
    if (isDemoMode()) {
      return {
        questions: [
          {
            question: 'Demo: what is one takeaway from this lesson?',
            hint: 'Keep it practical.',
            keyConceptsToCover: ['basics'],
          },
        ],
      };
    }

    const response = await lumen.integrations.Core.InvokeLLM({
      prompt: `Create exactly 3 conversational assessment prompts for this vocational training lesson (for oral / chat use — NOT multiple choice, no A/B/C options).

${lessonContent}

Each item must be usable as a spoken scenario or "teach it back" style check. Prefer "what would you do if…" or "explain to a mate how…". Hints should suggest how to answer without giving the full solution.`,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                hint: { type: "string" },
                keyConceptsToCover: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });
    return response;
  },

  // Evaluate student's answer (Coach voice in feedback text)
  async evaluateAnswer(question, answer, keyConceptsToCover) {
    const signals = analyzeLearnerSignals({
      lastUserMessage: answer,
      priorMessages: [],
    });

    if (isDemoMode()) {
      return {
        score: 80,
        feedback: `Demo mode, mate—I'd dig into this properly when live.\n\n${COACH_REASSURANCE_CLOSE}\n\n${COACH_TRY_OR_SAVE}`,
        conceptsCovered: keyConceptsToCover.slice(0, 1),
        conceptsMissed: [],
      };
    }

    await coachThinkingDelay();

    const prompt = buildCoachEvaluateFeedbackPrompt({
      question,
      answer,
      keyConceptsToCover,
      signals,
    });

    const response = await lumen.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          score: { type: "number" },
          feedback: { type: "string" },
          conceptsCovered: { type: "array", items: { type: "string" } },
          conceptsMissed: { type: "array", items: { type: "string" } },
        },
      },
    });
    return response;
  }
};

export default grokService;