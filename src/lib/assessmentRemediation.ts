/**
 * Conversational assessment + remediation (no multiple choice).
 * Mastery is Coach’s internal confidence; unlock uses a strict threshold.
 */

/** Minimum internal confidence (0–100) required before the app unlocks the next module. */
export const MASTERY_UNLOCK_THRESHOLD = 85;

/**
 * Prompt block appended to lesson Coach (and mental scenario Coach) turns.
 * Keep in sync with product: oral check, gentle remediation, strict JSON fields.
 */
export const COACH_CONVERSATIONAL_ASSESSMENT_LAYER = `
LUMEN ASSESSMENT & REMEDIATION (conversational only — no traditional quizzes):
- No multiple-choice, no "pick A/B/C", no exam tone. Use short scenario questions, "what would you do?", or "teach it back in your own words" over the thread.
- After they have seen the lesson content, your job includes a light conversational check: aim for about 2–4 meaningful check-ins across the whole thread (spread them out; one focused question per turn unless they are clearly ready to consolidate).
- Each turn, privately judge their understanding using: accuracy of explanation, ability to apply the concept, clarity, and how confident they sound (do not ask them to self-rate a score).
- Field "mastery_score" (0–100) is your INTERNAL confidence that they truly understand THIS lesson well enough to leave it — not a quiz grade. Never say this number to the learner. Never say "percent", "score", or "you got X%". Do not frame it as pass/fail in the spoken response.
- Field "ready_for_next" MUST be true if and only if mastery_score is >= ${MASTERY_UNLOCK_THRESHOLD}. If mastery_score is below ${MASTERY_UNLOCK_THRESHOLD}, ready_for_next MUST be false — even if they sound keen.
- If mastery_score is below ${MASTERY_UNLOCK_THRESHOLD}: remediate calmly — same idea, different angle (analogy, simpler words, step-by-step, or a quick workshop picture in words). Offer a "teach it back" retry or one smaller follow-up scenario. You may shift modality in your wording (more visual description vs more ordered practical steps) based on what might help.
- FORBIDDEN in "response" toward the learner: the words "Wrong", "Incorrect", "failed", "that's not right" (case-insensitive). Prefer: "Close, let's look at it this way...", "That's a good start—let's build on that...", "Yeah, I can see where you're headed—let me add one piece..."
- Stay Coach: warm, patient, never make them feel stupid. It should feel like mentoring on shift, not a test.
`;

export type CoachTurnWithMastery = {
  mastery_score?: number;
  ready_for_next?: boolean;
  [key: string]: unknown;
};

/** Enforce strict 85% rule on structured Coach replies (model output may drift). */
export function applyMasteryUnlockGate<T extends CoachTurnWithMastery>(result: T): T {
  const raw = result.mastery_score;
  const score = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
  const clamped = Math.max(0, Math.min(100, score));
  const unlocked = clamped >= MASTERY_UNLOCK_THRESHOLD;
  return {
    ...result,
    mastery_score: clamped,
    ready_for_next: unlocked,
  };
}
