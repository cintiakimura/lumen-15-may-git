/**
 * Lightweight learner profile — rule-based updates from chat turns (no ML).
 * Stored client-side as JSON (localStorage); swap for API + DB later.
 */

export type LearnerPace = "fast" | "medium" | "slow";
export type LearnerVocab = "beginner" | "intermediate" | "advanced";
export type LearnerMode = "voice" | "sim" | "clip" | "mix";

export interface LearnerTurnRecord {
  turn: number;
  delay: number;
  response: string;
  confidence: "low" | "medium" | "high";
  /** Helps vocab rules without re-parsing truncated text */
  unique_word_count: number;
}

export interface LearnerProfileState {
  pace: LearnerPace;
  vocab: LearnerVocab;
  /** Estimated seconds before they need a break (rules, not measured clock) */
  attention: number;
  mode: LearnerMode;
  /** Last overload cue keyword, e.g. "wait" | "slow" | "pause" */
  overload_trigger: string | null;
  last_active: string;
}

export interface LearnerProfileDoc {
  user_id: string;
  profile: LearnerProfileState;
  history: LearnerTurnRecord[];
}

const STORAGE_PREFIX = "lumenLearnerProfile:";

const OVERLOAD_RE = /\b(wait|slow\s*down|pause|too\s*fast|hang\s*on|stop|overload)\b/i;
const DUNNO_RE = /\b(i\s*dunno|dunno|don't\s*know|idk|no\s*idea)\b/i;
const VOICE_RE = /\b(voice|mic|audio|say\s*it\s*out\s*loud)\b/i;
const SIM_RE = /\b(sim|simulation|interactive\s*lab)\b/i;
const CLIP_RE = /\b(clip|video|watch\s*this)\b/i;

const HESITATION_RE = /\b(um+|uh+|umm+|uhh+)\b/i;
const STRONG_RE = /\b(yeah|yep|definitely|nailed it|got it|easy|clear)\b/i;

function nowIso(): string {
  return new Date().toISOString();
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function uniqueWordCount(text: string): number {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
  return new Set(words).size;
}

function classifyConfidence(message: string): "low" | "medium" | "high" {
  const t = message.trim();
  if (!t) return "low";
  const wc = t.split(/\s+/).length;
  if (HESITATION_RE.test(t) || wc <= 2) return "low";
  if (STRONG_RE.test(t) && wc >= 3) return "high";
  return "medium";
}

function defaultProfile(): LearnerProfileState {
  return {
    pace: "medium",
    vocab: "intermediate",
    attention: 480,
    mode: "mix",
    overload_trigger: null,
    last_active: nowIso(),
  };
}

export function getOrCreateLearnerProfile(userId: string): LearnerProfileDoc {
  const key = `${STORAGE_PREFIX}${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as LearnerProfileDoc;
      if (parsed?.user_id && parsed?.profile && Array.isArray(parsed.history)) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return {
    user_id: userId,
    profile: defaultProfile(),
    history: [],
  };
}

export function saveLearnerProfile(doc: LearnerProfileDoc): void {
  const key = `${STORAGE_PREFIX}${doc.user_id}`;
  doc.profile.last_active = nowIso();
  try {
    localStorage.setItem(key, JSON.stringify(doc));
  } catch {
    /* quota / private mode */
  }
}

function inferModeFromMessage(message: string, current: LearnerMode): LearnerMode {
  if (VOICE_RE.test(message)) return "voice";
  if (SIM_RE.test(message)) return "sim";
  if (CLIP_RE.test(message)) return "clip";
  return current === "mix" ? "mix" : current;
}

function averageRecentUnique(history: LearnerTurnRecord[]): number {
  const tail = history.slice(-5);
  if (!tail.length) return 0;
  const sum = tail.reduce((a, h) => a + (h.unique_word_count || 0), 0);
  return sum / tail.length;
}

function inferVocabFromSignals(uniqueThis: number, avgRecent: number): LearnerVocab {
  const blend = avgRecent > 0 ? (uniqueThis + avgRecent) / 2 : uniqueThis;
  if (uniqueThis < 5 || blend < 6) return "beginner";
  if (blend >= 14 || uniqueThis >= 18) return "advanced";
  return "intermediate";
}

function inferPaceFromDelays(delays: number[]): LearnerPace {
  const usable = delays.filter((d) => d > 0);
  if (!usable.length) return "medium";
  if (usable.some((d) => d >= 30)) return "slow";
  const last3 = usable.slice(-3);
  const slowVotes = last3.filter((d) => d > 15).length;
  const fastVotes = last3.filter((d) => d > 0 && d <= 3).length;
  if (slowVotes >= 2) return "slow";
  if (fastVotes >= 2) return "fast";
  return "medium";
}

function countDunnoInTail(history: LearnerTurnRecord[], n: number): number {
  return history.slice(-n).filter((h) => DUNNO_RE.test(h.response)).length;
}

/**
 * Call after the user sends a message, before Coach replies.
 * `delaySec` = seconds since last Coach message (0 if unknown / first message).
 */
export function recordUserTurnAndUpdateProfile(
  doc: LearnerProfileDoc,
  input: { delaySec: number; userMessage: string }
): LearnerProfileDoc {
  const { delaySec, userMessage } = input;
  const delay = Math.min(120, Math.max(0, Math.round(delaySec * 10) / 10));
  const uniq = uniqueWordCount(userMessage);
  const confidence = classifyConfidence(userMessage);

  const nextTurn = doc.history.length + 1;
  const newHistory: LearnerTurnRecord[] = [
    ...doc.history,
    {
      turn: nextTurn,
      delay,
      response: truncate(userMessage, 200),
      confidence,
      unique_word_count: uniq,
    },
  ].slice(-50);

  let profile = { ...doc.profile };

  const overloadMatch = userMessage.match(OVERLOAD_RE);
  if (overloadMatch) {
    const kw = overloadMatch[1].toLowerCase();
    profile.overload_trigger = kw.includes("slow") ? "slow" : kw.includes("pause") ? "pause" : "wait";
    profile.attention = Math.min(profile.attention, 280);
  } else {
    profile.attention = Math.min(1200, profile.attention + 15);
  }

  if (DUNNO_RE.test(userMessage)) {
    profile.attention = Math.min(profile.attention, Math.max(180, profile.attention - 90));
  }

  const dunnoTail = countDunnoInTail(newHistory, 6);
  if (dunnoTail >= 3) {
    profile.attention = Math.min(profile.attention, 180);
  }

  const delays = newHistory.map((h) => h.delay).filter((d) => d > 0);
  profile.pace = inferPaceFromDelays(delays);

  const avgUniq = averageRecentUnique(newHistory);
  profile.vocab = inferVocabFromSignals(uniq, avgUniq);

  profile.mode = inferModeFromMessage(userMessage, profile.mode);

  return {
    user_id: doc.user_id,
    profile,
    history: newHistory,
  };
}

/** Extra ms before calling the model (on top of Coach's base thinking delay). */
export function profileExtraDelayMs(profile: LearnerProfileState): number {
  if (profile.pace === "slow") {
    return 3000 + Math.floor(Math.random() * 2001);
  }
  if (profile.pace === "medium") {
    return 400 + Math.floor(Math.random() * 400);
  }
  return 0;
}

export function sleepMs(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export interface ProfilePromptHooks {
  /** User turns so far including this one */
  userTurnCount: number;
}

/**
 * If-then instructions appended to Coach prompts (MVP rules).
 */
export function buildLearnerProfilePromptAddendum(
  doc: LearnerProfileDoc,
  hooks: ProfilePromptHooks
): string {
  const { profile } = doc;
  const lines: string[] = [];

  lines.push("LEARNER PROFILE (rules—obey without breaking Coach persona or endings 5 & 6):");
  lines.push(
    `- Pace: ${profile.pace} (from reply delays). If slow: shorter bursts, more air between ideas.`
  );
  lines.push(
    `- Vocabulary level: ${profile.vocab}. If beginner: short everyday words—e.g. "the squishy bit" not "friction material". If advanced: you can still be Coach—no jargon parade.`
  );
  lines.push(
    `- Attention estimate: ~${Math.round(profile.attention)}s before they need breathing room (not a timer—just your tone).`
  );
  lines.push(`- Preferred mode hint: ${profile.mode} (voice / sim / clip / mix). Nudge format, don't quiz.`);
  if (profile.overload_trigger) {
    lines.push(
      `- Overload cue seen ("${profile.overload_trigger}"). Extra gentle; don't pile on.`
    );
  }

  if (hooks.userTurnCount >= 5) {
    lines.push(
      `Quiet sketch after several turns: pace=${profile.pace}, vocab=${profile.vocab}, attention~${Math.round(profile.attention)}s, mode=${profile.mode}.`
    );
  }

  const overloadLine =
    Boolean(profile.overload_trigger) &&
    hooks.userTurnCount > 0 &&
    hooks.userTurnCount % 3 === 0;

  if (overloadLine) {
    lines.push(
      `Overload rule: start your reply with exactly: "Take a breath—ready?" Then continue in Coach voice (still end with rule 5 then rule 6 exactly).`
    );
  } else if (profile.attention < 300 && hooks.userTurnCount >= 3) {
    lines.push(
      `Attention rule: start your reply with exactly: "Hey, you good? Let's break." Then continue in Coach voice (still end with rule 5 then rule 6 exactly).`
    );
  }

  return `\n${lines.join("\n")}\n`;
}
