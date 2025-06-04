import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { mastra } from "../index";
import { createTool } from "@mastra/core/tools";
import { ollama } from 'ollama-ai-provider';
import { z } from "zod";

export const vectorizeTool = createTool ({
  id: "vectorize",  // tool id used in endpoints
  description: "A tool to vectorize text chunks and store in a vector store.",
  inputSchema: z.object({
    documentURL: z.string().optional().describe("Document URL to fetch and vectorize."),
    documentText: z.string().optional().describe("Raw document text to vectorize."),
  }).refine(data => data.documentURL || data.documentText, {
    message: 'Either documentURL or documentText must be provided',
  }),
  outputSchema: z.object({
    chunkLength: z.number(),
  }),

  execute: async ({ context }) => {
    let text: string;
    if (context.documentText) {
      text = context.documentText;
    } else {
      const response = await fetch(context.documentURL!);
      text = await response.text();
    }
    
    const doc = MDocument.fromText(text);
    const chunks = await doc.chunk({
        strategy: "recursive",
        size: 512,
        overlap: 50,
        separator: "\n",
    });

    const { embeddings } = await embedMany({
        model: ollama.embedding("bge-large"),
        values: chunks.map((chunk) => chunk.text),
    });
 
    const vectorStore = mastra.getVector("pgVector");
    await vectorStore.createIndex({
        indexName: "embeddings",
        dimension: 1024,
    });

    await vectorStore.upsert({
        indexName: "embeddings",
        vectors: embeddings,
        metadata: chunks?.map((chunk: any) => ({
            text: chunk.text,
        })),
    });
    
    return {
      chunkLength: chunks.length,
    };
  },
});
