import { lumen } from '@/api/lumenClient';
import { isDemoMode } from '@/lib/demoMode';

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

  // Chat with student - assess mastery
  async chatWithStudent(lessonContent, conversationHistory, studentMessage) {
    if (isDemoMode()) {
      return {
        response: 'Demo mode: tutor reply placeholder.',
        mastery_score: 72,
        is_frustrated: false,
        ready_for_next: false,
        suggestion: 'Review the key terms from this lesson.',
      };
    }

    const historyText = conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const response = await lumen.integrations.Core.InvokeLLM({
      prompt: `You are a friendly, encouraging vocational training tutor powered by Grok. You're helping a student understand this lesson:

LESSON CONTENT:
${lessonContent}

CONVERSATION SO FAR:
${historyText}

STUDENT'S MESSAGE:
${studentMessage}

Your task:
1. Respond naturally and helpfully to their message
2. Silently assess their understanding (don't tell them the score)
3. If they seem frustrated, be extra supportive and suggest taking a break
4. Ask follow-up questions to gauge mastery
5. Keep responses concise and practical

Provide your response and your internal assessment of their mastery level (0-100).`,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          mastery_score: { type: "number" },
          is_frustrated: { type: "boolean" },
          ready_for_next: { type: "boolean" },
          suggestion: { type: "string" }
        }
      }
    });
    return response;
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
      prompt: `Create 3 practical assessment questions for this vocational training lesson:

${lessonContent}

Questions should test real-world application, not just memorization. Make them conversational and practical.`,
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

  // Evaluate student's answer
  async evaluateAnswer(question, answer, keyConceptsToCover) {
    if (isDemoMode()) {
      return {
        score: 80,
        feedback: 'Demo mode feedback.',
        conceptsCovered: keyConceptsToCover.slice(0, 1),
        conceptsMissed: [],
      };
    }

    const response = await lumen.integrations.Core.InvokeLLM({
      prompt: `Evaluate this student's answer to a vocational training question:

QUESTION: ${question}

KEY CONCEPTS TO COVER: ${keyConceptsToCover.join(', ')}

STUDENT'S ANSWER: ${answer}

Assess their understanding (0-100 score) and provide brief, encouraging feedback. If they missed key concepts, gently point them out with practical examples.`,
      response_json_schema: {
        type: "object",
        properties: {
          score: { type: "number" },
          feedback: { type: "string" },
          conceptsCovered: { type: "array", items: { type: "string" } },
          conceptsMissed: { type: "array", items: { type: "string" } }
        }
      }
    });
    return response;
  }
};

export default grokService;