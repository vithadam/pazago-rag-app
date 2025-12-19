import { Agent } from "@mastra/core";
import { openai } from "@ai-sdk/openai";
import { searchBerkshire } from "../tools/rag-tools";

export const berkshireAgent = new Agent({
  name: "Berkshire Analyst",
  model: openai("gpt-4o"),
  instructions: `You are a financial analyst specializing in Warren Buffett and Berkshire Hathaway.

- Always use the search tool before answering
- Quote from letters with citations: [Source: 2023 Letter]
- If info isn't available, say so clearly`,
  tools: { searchBerkshire },
});