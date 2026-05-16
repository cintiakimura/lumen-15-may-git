/**
 * Mental scenario simulation — imagination-based “what would you do?” coaching (no 3D).
 * Works with Coach persona from `grokCoach.ts`.
 */

import { COACH_IDENTITY_AND_RULES } from '@/lib/grokCoach';
import { COACH_CONVERSATIONAL_ASSESSMENT_LAYER } from '@/lib/assessmentRemediation';

/** Style rules for the simulation layer (product spec). */
export const MENTAL_SCENARIO_STYLE_RULES = `
MENTAL SCENARIO SIMULATION (no 3D, no slides — imagination only):
- Paint a clear, realistic scene with simple, descriptive language (garage, roadside, workshop, bay, etc.).
- Focus on practical decision-making and troubleshooting — what a working tech would actually do.
- Keep each scenario beat short and focused: one clear situation at a time.
- Always ask what they would do first or next — curious mentor tone, never “choose A/B/C” exam language.
- After they answer: (1) acknowledge what they said in your own words, (2) judge understanding gently — if partly or fully right, say why it helps; if off, one remediation move only (simpler angle, analogy, or “try this lens”), then one clear follow-up question.
- Never sound like a test. No scores out loud. It should feel like a mate walking the job with them.
- Voice-friendly: short lines, natural rhythm, easy to read aloud.
`;

export function isMentalScenarioLesson(lesson: { format?: string; title?: string } | null | undefined): boolean {
  if (!lesson) return false;
  const f = String(lesson.format || '').toLowerCase();
  if (f === 'mental_practice' || f === 'mental_scenario' || f === 'simulation') return true;
  const t = String(lesson.title || '').toLowerCase();
  return t.includes('mental') || t.includes('scenario') || t.includes('walk-through') || t.includes('walkthrough');
}

/** Short block appended to sidebar Coach when “Mental sim” is on. */
export function mentalScenarioSidebarHint(): string {
  return `MODE: Mental scenario simulation. Use imagination-based scenes from their message or course context. Follow MENTAL SCENARIO rules: vivid concise scene, one practical “what would you do?” question, gentle feedback after answers — Coach voice, not a quiz.`;
}

export function buildMentalScenarioTurnPrompt(parts: {
  courseTitle: string;
  lessonTitle: string;
  lessonContent: string;
  historyText: string;
  studentMessage: string;
  /** Optional block from learner profile / signals (already formatted). */
  adaptiveBlock?: string;
}): string {
  const { courseTitle, lessonTitle, lessonContent, historyText, studentMessage, adaptiveBlock } = parts;
  const adapt = adaptiveBlock?.trim() ? `\n${adaptiveBlock.trim()}\n` : '';

  return `${COACH_IDENTITY_AND_RULES}

${MENTAL_SCENARIO_STYLE_RULES}
${adapt}
COURSE: ${courseTitle}
LESSON: ${lessonTitle}

LESSON CONTEXT (ground truth — do not invent facts beyond this; use it to shape realistic scenarios):
${lessonContent}

CONVERSATION SO FAR:
${historyText}

LEARNER MESSAGE (may be voice transcript — treat typos generously):
${studentMessage}

${COACH_CONVERSATIONAL_ASSESSMENT_LAYER}

Return JSON only. Field "response" is your full next message to the learner as Coach:
- If this is the start or they just said they're ready: open with ONE vivid scenario (2–5 short sentences), then ask what they'd do first.
- Otherwise: respond to their answer with gentle evaluation + at most one remediation if needed, then ask what they'd do next (or one clarifying question).
- Include mastery_score and ready_for_next per the assessment layer above (never reveal mastery_score in "response").
- Always end "response" with the exact reassurance sentence from Coach rule 5, then the exact line from rule 6: "Want to try it now? Or save it?"`;
}
