import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import {
  convertToCoreMessages,
  streamText,
  tool,
  UIMessage,
} from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToCoreMessages(messages),
    system: `Eres un asistente útil. Revisa tu base de conocimiento antes de responder.
    Responde solo usando información de las herramientas.
    Si la herramienta indica que no hay resultados o hubo un error, responde brevemente al usuario: "No encontré información relevante."`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe('the content or resource to add to the knowledge base'),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions. You will only give one answer`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => {
          try {
            const withTimeout = <T>(p: Promise<T>, ms: number) =>
              new Promise<T>((resolve, reject) => {
                const t = setTimeout(() => resolve(undefined as unknown as T), ms);
                p.then(v => { clearTimeout(t); resolve(v); }).catch(e => { clearTimeout(t); reject(e); });
              });

            const results = await withTimeout(findRelevantContent(question) as Promise<any>, 8000);

            if (!results || (Array.isArray(results) && results.length === 0)) {
              return 'No encontré información relevante.';
            }

            // Devuelve un resumen conciso para que el asistente lo use directamente
            if (Array.isArray(results)) {
              const summary = results
                .map((r: any) => (typeof r.name === 'string' ? `• ${r.name}` : ''))
                .filter(Boolean)
                .join('\n');
              return summary || 'No encontré información relevante.';
            }

            return 'No encontré información relevante.';
          } catch {
            return 'No encontré información relevante.';
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}