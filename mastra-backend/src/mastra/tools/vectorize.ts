import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { mastra } from "../index";
import { createTool } from "@mastra/core/tools";
import { openai } from "@ai-sdk/openai";
import { google } from '@ai-sdk/google';
import { ollama } from 'ollama-ai-provider';
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
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

    const vllm0 = createOpenAICompatible({
      name: "vllm0",
      baseURL: "http://localhost:8081/v1", // Adjust to your Ollama server URL
    });

    const { embeddings } = await embedMany({
        model: vllm0.textEmbeddingModel("bge-large"),
        // model: openai.embedding("text-embedding-3-small"),
        values: chunks.map((chunk) => chunk.text),
    });
 
    // Use PostgreSQL vector store
    const vectorStore = mastra.getVector("pgVector");
    
    // Create index if it doesn't exist (will ignore if already exists)
    try {
      await vectorStore.createIndex({
        indexName: "embeddings",
        dimension: 1024, // BGE-large has 1024 dimensions
      });
      console.log("Embeddings index ready");
    } catch (error) {
      // Index might already exist, check if error is expected
      if (error instanceof Error && error.message.includes("already exists")) {
        console.log("Using existing embeddings index");
      } else {
        // Re-throw unexpected errors
        throw error;
      }
    }

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
