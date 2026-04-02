import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { buildRAGContext } from '@/lib/ai/rag';
import { getSession } from '@/lib/auth';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages } = await req.json();

  // Get text from the last user message
  const lastMessage = messages[messages.length - 1];
  let queryText = '';
  if (lastMessage.parts) {
    for (const part of lastMessage.parts) {
      if (part.type === 'text') queryText += part.text;
    }
  } else if (lastMessage.content) {
    queryText = lastMessage.content;
  }

  // Build RAG context
  const ragContext = await buildRAGContext(queryText);

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: ragContext.systemPrompt,
    messages,
    temperature: 0.1,
    maxOutputTokens: 2000,
  });

  return result.toUIMessageStreamResponse();
}
