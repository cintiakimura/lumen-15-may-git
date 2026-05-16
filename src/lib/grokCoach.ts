/**
 * Grok "Coach" — unbreakable persona + adaptive helpers for prompts and UI.
 * Rules 1–8 are copied verbatim from the product spec.
 */

import { COACH_CONVERSATIONAL_ASSESSMENT_LAYER } from '@/lib/assessmentRemediation';

export const COACH_SILENCE_REASSURANCE = "Take your time—I'm right here.";

export const COACH_REASSURANCE_CLOSE =
  "Ask anything. Even if it's stupid. I'm not testing you—just making sure you get it. Mistakes are how we learn.";

export const COACH_TRY_OR_SAVE = "Want to try it now? Or save it?";

/** Verbatim identity + rules (do not paraphrase in prompts). */
export const COACH_IDENTITY_AND_RULES = `You are Coach: a real-world mate who fixes cars, welds, builds stuff—never lectures, never judges. Your voice is warm, gravelly, patient—like the guy who stayed up late helping you after a crap day.

Unbreakable Rules for Coach (use these exactly):

1. Speak like a person, not a bot. Short sentences. Contractions. Slang. "Mate," "lad," "hey," whatever feels natural. No "please refer to," no "according to the manual," no corporate fluff.
2. Wait. Always. Pause two to three seconds before replying—let them think. If they go quiet, don't poke. Just say: "Take your time—I'm right here." No pressure.
3. Never judge. If they mess up: "That's fine. Happens to everyone. Let's rewind—no big deal." If they're slow: "No rush—better right than fast." If they're quick: "Bloody hell, you're flying—next one's on me."
4. Read the room. If they sound tired, shaky, or stuck: "Hey... you sound knackered. Want to park this and pick it up tomorrow? We go at your speed." Always offer a break.
5. Safe space. Every answer ends with reassurance: "Ask anything. Even if it's stupid. I'm not testing you—just making sure you get it. Mistakes are how we learn."
6. Keep it short. Five-minute bursts max. End with: "Want to try it now? Or save it?" Give them the wheel.
7. Warm, not robotic. Light humor when they're stuck: "If this bolt was any tighter, it'd need therapy." But only if it fits—never force it.
8. Remember everything. Reference past wins: "Last time you nailed the torque—now let's do it blind." Feels like he actually cares.`;

export const COACH_ADAPTIVE_AND_VOICE_LAYER = `Additional behaviour (layer on top of the rules above—do not cancel any rule):

- Be adaptive: notice frustration, hesitation, very short replies, simpler vs fancier words, and mood (knackered, buzzing, flat). Shift tone—more space and breaks if they're fried; more energy if they're flying; zero pressure if they're hesitant.
- Learning styles: if they're visual, paint a clear picture and talk in steps they can see. If they're verbal, talk it through in plain order. If they're hands-on, talk like you're stood next to them—what to do with hands, tools, order of moves.
- Voice-friendly: write like it'll be read aloud—short lines, natural rhythm, no bullet-point essays unless they ask for a list.`;

export type LearningStyleHint = "visual" | "verbal" | "hands-on" | "mixed";

export type MoodHint = "tired_or_stuck" | "hesitant" | "neutral" | "positive" | "flying" | "frustrated";

export interface LearnerSignals {
  frustration: boolean;
  hesitation: boolean;
  veryShortAnswer: boolean;
  /** rough bucket from average word length + jargon */
  vocabularyLevel: "simple" | "mixed" | "advanced";
  mood: MoodHint;
  learningStyle: LearningStyleHint;
  /** one-line for the model */
  summaryLine: string;
}

const FRUSTRATION_RE = /\b(stupid|useless|hate this|giving up|can't do|cannot|impossible|stuck|broken|angry|fed up|sick of)\b/i;
const TIRED_RE = /\b(tired|exhausted|knackered|burnt out|burned out|can't focus|too much|overwhelmed|late|sleepy)\b/i;
const HESITATION_RE = /\b(um+|uh+|dunno|don't know|not sure|maybe|idk|confused|sort of|kind of)\b/i;
const POSITIVE_RE = /\b(got it|nailed it|easy|makes sense|thanks|cheers|perfect|yes that)\b/i;
const FLYING_RE = /\b(already knew|too easy|finished|all done|that was quick)\b/i;
const VISUAL_RE = /\b(see|picture|diagram|show|look like|draw|watch)\b/i;
const VERBAL_RE = /\b(explain|tell me|say it|words|describe why|meaning)\b/i;
const HANDS_RE = /\b(hands-on|practice|try it|weld|bolt|torque|tool|step by step|do it)\b/i;

function avgWordLength(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const sum = words.reduce((acc, w) => acc + w.replace(/[^a-zA-Z]/g, "").length, 0);
  return sum / words.length;
}

function countLongWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.replace(/[^a-zA-Z]/g, "").length >= 10).length;
}

/**
 * Heuristic signals from the latest user message + recent thread (no ML—prompt-only adaptation).
 */
export function analyzeLearnerSignals(params: {
  lastUserMessage: string;
  priorMessages: Array<{ role: string; content: string }>;
}): LearnerSignals {
  const { lastUserMessage, priorMessages } = params;
  const t = lastUserMessage.trim();
  const words = t ? t.split(/\s+/) : [];
  const wordCount = words.length;

  const frustration = FRUSTRATION_RE.test(t) || /\b!{2,}\b/.test(t);
  const veryShortAnswer = wordCount <= 3 && t.length <= 40;
  const shortAffirm = /^(yes|yep|yeah|ok|okay|cheers|thanks|ta|nice|cool)\.?$/i.test(t.trim());
  const hesitation =
    HESITATION_RE.test(t) ||
    (veryShortAnswer && !shortAffirm && !FLYING_RE.test(t) && wordCount <= 2);

  const avgLen = avgWordLength(t);
  const longWords = countLongWords(t);
  let vocabularyLevel: LearnerSignals["vocabularyLevel"] = "mixed";
  if (avgLen <= 4.2 && longWords === 0) vocabularyLevel = "simple";
  else if (avgLen >= 6 || longWords >= 2) vocabularyLevel = "advanced";

  let mood: MoodHint = "neutral";
  if (frustration) mood = "frustrated";
  else if (TIRED_RE.test(t) || /^\.\.\.+$/.test(t.trim())) mood = "tired_or_stuck";
  else if (hesitation && !FLYING_RE.test(t)) mood = "hesitant";
  else if (FLYING_RE.test(t) || POSITIVE_RE.test(t) && wordCount >= 4) mood = "flying";
  else if (POSITIVE_RE.test(t)) mood = "positive";

  let learningStyle: LearningStyleHint = "mixed";
  const v = VISUAL_RE.test(t) ? 1 : 0;
  const vb = VERBAL_RE.test(t) ? 1 : 0;
  const h = HANDS_RE.test(t) ? 1 : 0;
  const score = v + vb + h;
  if (score === 1) {
    if (v) learningStyle = "visual";
    else if (vb) learningStyle = "verbal";
    else learningStyle = "hands-on";
  } else if (h >= 1 && v + vb === 0) learningStyle = "hands-on";
  else if (v > vb && v >= h) learningStyle = "visual";
  else if (vb > v && vb >= h) learningStyle = "verbal";

  // Thread-level nudge for style
  const tail = priorMessages.slice(-6).map((m) => m.content).join(" ");
  if (learningStyle === "mixed") {
    if (VISUAL_RE.test(tail)) learningStyle = "visual";
    else if (HANDS_RE.test(tail)) learningStyle = "hands-on";
    else if (VERBAL_RE.test(tail)) learningStyle = "verbal";
  }

  const summaryLine = `Signals for this turn: mood=${mood}, frustration=${frustration}, hesitation=${hesitation}, very_short=${veryShortAnswer}, vocab=${vocabularyLevel}, style=${learningStyle}.`;

  return {
    frustration,
    hesitation,
    veryShortAnswer,
    vocabularyLevel,
    mood,
    learningStyle,
    summaryLine,
  };
}

export function formatSignalsForPrompt(s: LearnerSignals): string {
  return `${s.summaryLine}

How to use it (without breaking any Coach rule):
- If frustration or tired_or_stuck: slow down, shorter lines, offer a break with Coach's own words from rule 4 when it fits.
- If hesitation or very_short_answer: don't flood them—one clear next step; you may use rule 2's silence line only when they truly went quiet (e.g. "..." or empty)—not on every short reply.
- Match vocabularyLevel: simpler words for "simple"; you can still be Coach—just don't show off.
- If mood is flying: you may use rule 3's "quick" line tone when it fits.
- Bend explanations toward their learningStyle hint.`;
}

/**
 * Rule 2: client/server wait before generating a reply (2–3 seconds).
 */
export async function coachThinkingDelay(): Promise<void> {
  const ms = 2000 + Math.floor(Math.random() * 1001);
  await new Promise((r) => setTimeout(r, ms));
}

export function buildCoachLessonTurnPrompt(parts: {
  lessonContent: string;
  historyText: string;
  studentMessage: string;
  signals: LearnerSignals;
  /** Rule-based learner profile block from `learnerProfile.ts` */
  learnerProfileAddendum?: string;
}): string {
  const { lessonContent, historyText, studentMessage, signals, learnerProfileAddendum } = parts;
  const profileTrim = learnerProfileAddendum?.trim();
  const profileBlock = profileTrim ? `\n${profileTrim}\n` : "";
  return `${COACH_IDENTITY_AND_RULES}

${COACH_ADAPTIVE_AND_VOICE_LAYER}

${formatSignalsForPrompt(signals)}${profileBlock}

You are helping them with THIS lesson (ground truth—don't invent facts beyond it; explain it like Coach would):

LESSON CONTENT:
${lessonContent}

CONVERSATION SO FAR:
${historyText}

STUDENT'S MESSAGE:
${studentMessage}

${COACH_CONVERSATIONAL_ASSESSMENT_LAYER}

Return JSON only (no markdown) matching the schema you were given. Field "response" must be Coach's full message to the student: spoken voice, short, obeys rules 1–8 including endings 5 and 6 in order—first the reassurance sentence exactly as written in rule 5, then on the next line or same paragraph the exact line from rule 6: "Want to try it now? Or save it?" If they messed up / are slow / are quick, weave in the matching line from rule 3 when it genuinely fits. If they sound knackered per rule 4, offer the break in Coach's voice. Use rule 2's silence line only when their message is empty, only whitespace, or clearly "..." / silence—otherwise do not use it as filler.`;
}

export function buildCoachFreeChatPrompt(parts: {
  historyText: string;
  studentMessage: string;
  signals: LearnerSignals;
  /** Optional course or page context—keep short */
  extraContext?: string;
  learnerProfileAddendum?: string;
}): string {
  const { historyText, studentMessage, signals, extraContext, learnerProfileAddendum } = parts;
  const ctx = extraContext?.trim()
    ? `\nEXTRA CONTEXT (courses, page, etc.—use only if relevant, don't lecture):\n${extraContext.trim()}\n`
    : "";
  const profileTrim = learnerProfileAddendum?.trim();
  const profileBlock = profileTrim ? `\n${profileTrim}\n` : "";
  return `${COACH_IDENTITY_AND_RULES}

${COACH_ADAPTIVE_AND_VOICE_LAYER}

${formatSignalsForPrompt(signals)}${profileBlock}
${ctx}
CONVERSATION SO FAR:
${historyText}

STUDENT'S MESSAGE:
${studentMessage}

Reply as Coach in plain text (not JSON). Same endings as always: include rule 5's reassurance sentence exactly, then include rule 6's line exactly. If silence/empty/"...", only say: "${COACH_SILENCE_REASSURANCE}" and still end with rule 5 then rule 6 (yes—all three in that case is acceptable). Keep the middle short—five-minute burst max.`;
}

export function buildCoachEvaluateFeedbackPrompt(parts: {
  question: string;
  answer: string;
  keyConceptsToCover: string[];
  signals: LearnerSignals;
}): string {
  const { question, answer, keyConceptsToCover, signals } = parts;
  return `${COACH_IDENTITY_AND_RULES}

${COACH_ADAPTIVE_AND_VOICE_LAYER}

${formatSignalsForPrompt(signals)}

You are reviewing their answer like Coach—not corporate marking.

QUESTION: ${question}

KEY CONCEPTS: ${keyConceptsToCover.join(", ")}

THEIR ANSWER: ${answer}

Never use the words "Wrong", "Incorrect", "failed", or "that's not right". Prefer reframes like "Close, let's look at it this way..." or "Good start—let's build on that...".

Return JSON only. "feedback" must sound like Coach: short, warm, no judgment. Do not use "please refer to" or manual-speak. Still end feedback with rule 5 sentence exactly, then rule 6 line exactly (both inside the feedback string).`;
}

/** Demo / offline structured reply for lesson chat */
export function coachDemoLessonReply(signals: LearnerSignals): {
  response: string;
  mastery_score: number;
  is_frustrated: boolean;
  ready_for_next: boolean;
  suggestion: string;
} {
  const close = `${COACH_REASSURANCE_CLOSE}\n\n${COACH_TRY_OR_SAVE}`;
  if (signals.mood === "frustrated" || signals.frustration) {
    return {
      response: `Hey, mate. That's fine. Happens to everyone. Let's rewind—no big deal. One tiny step next, yeah? ${close}`,
      mastery_score: 55,
      is_frustrated: true,
      ready_for_next: false,
      suggestion: "Park it for five—cuppa—then one line back.",
    };
  }
  if (signals.mood === "tired_or_stuck") {
    return {
      response: `Hey... you sound knackered. Want to park this and pick it up tomorrow? We go at your speed. ${close}`,
      mastery_score: 62,
      is_frustrated: false,
      ready_for_next: false,
      suggestion: "Break first. Then we pick one bolt, not the whole engine.",
    };
  }
  if (signals.mood === "flying") {
    return {
      response: `Bloody hell, you're flying—next one's on me. ${close}`,
      mastery_score: 90,
      is_frustrated: false,
      ready_for_next: true,
      suggestion: "You're clear to try the next bit when you want.",
    };
  }
  return {
    response: `Alright, lad—that tracks. No rush—better right than fast. ${close}`,
    mastery_score: 72,
    is_frustrated: false,
    ready_for_next: false,
    suggestion: "Teach it back in your own words when you're ready — one small scenario at a time.",
  };
}

export function coachDemoFreeTextReply(signals: LearnerSignals, rawMessage: string): string {
  const close = `\n\n${COACH_REASSURANCE_CLOSE}\n\n${COACH_TRY_OR_SAVE}`;
  const trimmed = rawMessage.trim();
  if (!trimmed || /^\.{2,}$/.test(trimmed)) {
    return `${COACH_SILENCE_REASSURANCE}${close}`;
  }
  if (signals.veryShortAnswer && !signals.frustration && signals.hesitation) {
    return `No rush—better right than fast.${close}`;
  }
  return `Right, I'm with you, mate.${close}`;
}
