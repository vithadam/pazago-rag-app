import { mastra } from "@/mastra";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const agent = mastra.getAgent("berkshireAgent");

    const result = await agent.stream(
      messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      { maxSteps: 5 }
    );

    // Return stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Cast result to any to access properties safely
          const resultAny = result as any;
          const text = resultAny.text || resultAny.output || resultAny.message || JSON.stringify(result);
          
          controller.enqueue(
            `0:${JSON.stringify({ type: "text_delta", delta: text })}\n`
          );
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}