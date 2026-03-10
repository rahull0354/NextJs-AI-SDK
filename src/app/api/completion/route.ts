import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    const { text } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      prompt: prompt,
    });

    return Response.json({ text });
  } catch (error) {
    console.error("Error generating text:", error);
    return Response.json({ error: "Failed to generate text" }, { status: 500 });
  }
}
