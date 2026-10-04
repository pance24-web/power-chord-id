import {
  getAllServerStats,
  getSubscribers,
} from '@/lib/serverStats';

export const dynamic = 'force-dynamic';

export async function GET() {
  const subscribers = getSubscribers();
  let clientSender: ((payload: string) => void) | null = null;
  let keepAliveInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      clientSender = (payload: string) => {
        try {
          controller.enqueue(encoder.encode(payload));
        } catch (e) {
          // Client disconnected
          if (clientSender) subscribers.delete(clientSender);
        }
      };

      subscribers.add(clientSender);

      // Send initial full sync event
      const initialPayload = `data: ${JSON.stringify({
        type: 'sync',
        allStats: getAllServerStats(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initialPayload));

      // Periodic ping every 15s to keep connection alive through proxies
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          if (clientSender) subscribers.delete(clientSender);
        }
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
