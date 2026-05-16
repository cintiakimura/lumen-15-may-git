import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import {
  analyzeLearnerSignals,
  buildCoachLessonTurnPrompt,
  coachThinkingDelay,
} from '../../src/lib/grokCoach.ts';
import { applyMasteryUnlockGate } from '../../src/lib/assessmentRemediation.ts';

Deno.serve(async (req) => {
  try {
    const lumen = createClientFromRequest(req);
    const user = await lumen.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonContent, messageHistory, userMessage } = await req.json();

    if (!lessonContent || !userMessage) {
      return Response.json({ error: 'Lesson content and message required' }, { status: 400 });
    }

    const history = Array.isArray(messageHistory) ? messageHistory : [];
    const signals = analyzeLearnerSignals({
      lastUserMessage: userMessage,
      priorMessages: history,
    });

    const conversationContext = history.map((m) => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`).join('\n');

    await coachThinkingDelay();

    const prompt = buildCoachLessonTurnPrompt({
      lessonContent,
      historyText: conversationContext,
      studentMessage: userMessage,
      signals,
    });

    const result = await lumen.integrations.Core.InvokeLLM({
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

    return Response.json(applyMasteryUnlockGate(result));
  } catch (error) {
    console.error('Chat error:', error);
    return Response.json(
      {
        error: error.message || 'Chat failed',
        response: "Had a hiccup there, mate—say it again when you're ready.",
        mastery_score: 0,
        is_frustrated: false,
      },
      { status: 200 }
    );
  }
});
