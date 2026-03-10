import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { messages } = body;
    console.log("Messages:", messages);

    if (!Array.isArray(messages)) {
      throw new Error("Messages must be an array");
    }

    const result = streamText({
      model: groq("openai/gpt-oss-120b"),
      messages: messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response(JSON.stringify({ error: String(error), message: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
