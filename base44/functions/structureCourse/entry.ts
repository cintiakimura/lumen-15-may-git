import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripLinks = (content) => {
  if (!content) return '';
  return content
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/www\.[^\s]+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
};

const stripTrackers = (code) => {
  if (!code) return '';
  return code
    .replace(/fbq\([^)]*\)/g, '')
    .replace(/window\.clarity[^;]*/g, '')
    .replace(/gtag\([^)]*\)/g, '')
    .replace(/googletag[^;]*/g, '')
    .replace(/navigator\.sendBeacon\([^)]*\)/g, '')
    .replace(/fetch\([^)]*clarity[^)]*\)/g, '')
    .replace(/fetch\([^)]*fbevents[^)]*\)/g, '')
    .replace(/fetch\([^)]*collect[^)]*\)/g, '');
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, title } = await req.json();

    if (!content || !title) {
      return Response.json({ error: 'Content and title required' }, { status: 400 });
    }

    const cleanContent = stripLinks(stripTrackers(content));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert course designer for Lumen Academy, specializing in micro-learning for vocational training.

Transform the following content into a structured course using these guidelines:
- Create 5-8 micro-lessons (5 minutes each)
- Each lesson must have: id, title, format, content, duration
- Formats: "audio" (podcast-style), "visual" (slides/infographic), "video" (demonstration), "chat" (AI conversation), "mental" (mental practice)
- Content should be clear, actionable, and beginner-friendly
- Focus on practical skills and real-world application

Course Title: ${title}

Content:
${cleanContent}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "lessons": [
    {
      "id": "l1",
      "title": "Lesson title",
      "format": "audio|visual|video|chat|mental",
      "content": "Detailed lesson content...",
      "duration": 5
    }
  ]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          lessons: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                format: { type: "string" },
                content: { type: "string" },
                duration: { type: "number" }
              },
              required: ["id", "title", "format", "content", "duration"]
            }
          }
        },
        required: ["lessons"]
      }
    });

    return Response.json({ 
      success: true,
      lessons: result.lessons 
    });

  } catch (error) {
    console.error('Structure course error:', error);
    return Response.json({ 
      error: error.message || 'Failed to structure course' 
    }, { status: 500 });
  }
});