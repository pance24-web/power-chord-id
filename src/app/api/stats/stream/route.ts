import { checkRateLimit, getClientKey, rateLimitResponse } from '@/lib/rateLimit';
import { getAllServerStats, getSubscribers } from '@/lib/serverStats';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const result = checkRateLimit(`stats-stream:${getClientKey(request)}`, 10, 60_000);
  if (!result.allowed) return rateLimitResponse(result.retryAfter);

  const subscribers = getSubscribers();
  let clientSender: ((payload: string) => void) | undefined;
  let keepAliveInterval: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      clientSender = (payload: string) => {
        try { controller.enqueue(encoder.encode(payload)); }
        catch { if (clientSender) subscribers.delete(clientSender); }
      };
      subscribers.add(clientSender);
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'sync', allStats: await getAllServerStats() })}\n\n`));
      keepAliveInterval = setInterval(() => {
        try { controller.enqueue(encoder.encode(': ping\n\n')); }
        catch { if (keepAliveInterval) clearInterval(keepAliveInterval); if (clientSender) subscribers.delete(clientSender); }
      }, 15000);
    },
    cancel() {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (clientSender) subscribers.delete(clientSender);
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
