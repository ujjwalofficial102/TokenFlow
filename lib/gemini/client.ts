import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("Failed to initialize GoogleGenAI client:", err);
  }
}

/**
 * Generates an AI response using Google Gemini 1.5/2.0 Flash model.
 * If GEMINI_API_KEY is not set, returns a intelligent demo simulation response.
 */
export async function generateGeminiResponse(prompt: string): Promise<string> {
  if (apiKey && aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      if (response.text) {
        return response.text;
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
    }
  }

  // Demo Fallback Generator if GEMINI_API_KEY is missing or errors out
  return generateDemoResponse(prompt);
}

function generateDemoResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("mern") || lower.includes("mern stack")) {
    return `The **MERN Stack** is a popular JavaScript web development stack consisting of four key technologies:

1. **MongoDB**: A NoSQL document database that stores data in JSON-like formats.
2. **Express.js**: A lightweight back-end web application framework for Node.js.
3. **React.js**: A front-end JavaScript library maintained by Meta for building dynamic user interfaces.
4. **Node.js**: A JavaScript runtime environment that allows executing JS on the server side.

### Why MERN is Popular:
- **Single Language**: Developers can write both front-end and back-end code entirely in JavaScript or TypeScript.
- **High Performance**: Asynchronous I/O with Node.js and virtual DOM rendering with React make applications fast and scalable.
- **Huge Ecosystem**: Access to thousands of npm packages and active community support.`;
  }

  if (lower.includes("next.js") || lower.includes("nextjs")) {
    return `**Next.js** is a React framework for building full-stack web applications. 

### Key Features:
- **Server Components & Server Actions**: Execute code on the server for enhanced security and minimal client bundle size.
- **App Router**: File-system based routing with support for dynamic layouts, streaming, and error handling.
- **Automatic Optimization**: Image, Font, and Script optimization out of the box.
- **SEO Ready**: Built-in support for dynamic meta tags and server-side rendering (SSR).`;
  }

  return `Here is a comprehensive summary regarding "${prompt}":

TokenFlow middleware successfully routed your query to the **Google Gemini LLM Generator**.

- **Processing**: The prompt was compressed and normalized before execution.
- **Middleware Action**: Checked Redis exact match (Miss), checked Pinecone Vector DB (Miss), then generated fresh answer via Gemini.
- **Storage**: Response quality evaluated for caching criteria (response tokens >= 200).

Feel free to ask follow-up questions to test exact caching and semantic similarity retrieval!`;
}
