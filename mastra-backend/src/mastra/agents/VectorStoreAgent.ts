import { embedMany } from "ai";
import { mastra } from "../index";
import { Agent } from "@mastra/core/agent";
import { createDocumentChunkerTool, MDocument } from "@mastra/rag";
import { createTool } from "@mastra/core/tools";
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
    let technicalDoc: MDocument;
    if (context.documentText) {
      technicalDoc = new MDocument({
        text: context.documentText,
        metadata: {
          type: "technical",
          version: "1.0",
        },
      });
    } else {
      const response = await fetch(context.documentURL!);
      const HTML = await response.text();
      technicalDoc = new MDocument({
        text: HTML,
        metadata: {
          type: "technical",
          version: "1.0",
        },
      });
    }
    
    const chunker = createDocumentChunkerTool({
      doc: technicalDoc,
      params: {
        strategy: "recursive",
        size: 1024, // Larger chunks
        overlap: 100, // More overlap
        separator: "\n\n", // Split on double newlines
      },
    });
     
    const { chunks } = await chunker.execute();
     
    // Process the chunks
    chunks.forEach((chunk, index) => {
      console.log(`Chunk ${index + 1} length: ${chunk.content.length}`);
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

const lmstudio = createOpenAICompatible({
   name: "lmstudio",
   baseURL: "http://localhost:1234/v1",
});

export const VectorStoreAgent = new Agent ({
  name: "VectorStoreAgent",
  instructions: "This agent vectorizes text chunks and stores them in a vector store. It can fetch documents from a URL or use raw text input. The agent will create embeddings for the text chunks and store them in a PostgreSQL vector store.",
  model: lmstudio("c4ai-command-r7b-12-2024"),
  tools: {
    vectorizeTool,
  },
});
