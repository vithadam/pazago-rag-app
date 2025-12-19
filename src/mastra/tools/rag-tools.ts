import { createTool } from "@mastra/core";
import { z } from "zod";
import { searchDocuments } from "@/lib/vector-store";

export const searchBerkshire = createTool({
  id: "search-berkshire",
  description: "Search Berkshire Hathaway shareholder letters",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
  }),
  execute: async ({ context }) => {
    const results = await searchDocuments(context.query, 5);
    return results.map((r) => ({
      content: r.content,
      source: r.source,
      year: r.year,
      score: r.score,
    }));
  },
});