import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonContent, messageHistory, userMessage } = await req.json();

    if (!lessonContent || !userMessage) {
      return Response.json({ error: 'Lesson content and message required' }, { status: 400 });
    }

    // Detect if user is tired/frustrated
    const isTired = /tired|exhausted|overwhelmed|confused|hard|difficult|too much/i.test(userMessage);

    // Build conversation context
    const conversationContext = messageHistory
      .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n');

    const prompt = `You are Grok, an empathetic AI tutor for Lumen Academy. Your goal is to assess student understanding and provide supportive guidance.

Lesson Content:
${lessonContent}

Conversation History:
${conversationContext}

Student's Latest Message: ${userMessage}

${isTired ? 'IMPORTANT: The student seems tired or frustrated. Keep your response SHORT (1-2 sentences), encouraging, and suggest taking a break if needed.\n' : ''}

Your task:
1. Respond naturally to the student's message
2. Assess their understanding (0-100 mastery score)
3. Ask thoughtful follow-up questions if mastery < 85
4. Be encouraging and supportive

Return ONLY valid JSON:
{
  "response": "Your supportive response...",
  "mastery_score": 75,
  "is_frustrated": ${isTired}
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          mastery_score: { type: "number" },
          is_frustrated: { type: "boolean" }
        },
        required: ["response", "mastery_score"]
      }
    });

    return Response.json(result);

  } catch (error) {
    console.error('Chat error:', error);
    return Response.json({ 
      error: error.message || 'Chat failed',
      response: "I had a small hiccup there. Could you try saying that again?",
      mastery_score: 0,
      is_frustrated: false
    }, { status: 200 }); // Return 200 with fallback message
  }
});