import { embedMany } from "ai";
import { pgVector } from "../vectorStore";
import { Agent } from "@mastra/core/agent";
import { createDocumentChunkerTool, MDocument } from "@mastra/rag";
import { createTool } from "@mastra/core/tools";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { PinoLogger } from "@mastra/loggers";
import { z } from "zod";

const logger = new PinoLogger({
      name: "Mastra",
      level: "debug",
    });

logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message");

const vllm0 = createOpenAICompatible({
  name: "vllm0",
  baseURL: "http://localhost:8081/v1",
});

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

    logger.debug("Executing vectorizeTool");

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
    logger.debug("Document fetched or provided", {
      length: technicalDoc.text.length,
      metadata: technicalDoc.metadata,
    });

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
      logger.debug(`Chunk ${index + 1} length: ${chunk.content.length}`);
    });

    try {
    const { embeddings } = await embedMany({
      model: vllm0.textEmbeddingModel("BAAI/bge-large-en-v1.5"),
        // model: openai.embedding("text-embedding-3-small"),
        values: chunks.map((chunk) => chunk.text),
    });

    logger.debug("Embeddings generated", {
      count: embeddings.length,
    });
  } catch (error) {
    logger.error("Error generating embeddings", { error });
    throw error;
  }
  try {
    // Use PostgreSQL vector store

    const vectorStore = pgVector;
    // Create the shared "embeddings" index if it doesn't exist
    try {
      await vectorStore.createIndex({
        indexName: "embeddings",
        dimension: 1024, // BGE-large has 1024 dimensions
      });
      logger.info("Embeddings index ready");
    } catch (error) {
      // Index might already exist, check if error is expected
      if (error instanceof Error && error.message.includes("already exists")) {
        logger.info("Using existing embeddings index");
      } else {
        // Re-throw unexpected errors
        logger.error("Error creating embeddings index", { error }); 
        throw error;
      }
    }
try {
  // Upsert vectors into the shared "embeddings" index
    await vectorStore.upsert({
        indexName: "embeddings",
        vectors: embeddings,
        metadata: chunks?.map((chunk: any) => ({
            text: chunk.text,
        })),
    });
    logger.info("Vectors upserted");

    return {
      chunkLength: chunks.length,
    };
    } catch (error) {
    logger.error("Error upserting vectors", { error });
    throw error;
  }
  },
});

logger.info("VectorStoreAgent initialized");
const lmstudio = createOpenAICompatible({
   name: "lmstudio",
   baseURL: "http://localhost:1234/v1",
});
logger.info("lmstudio initialized");
export const VectorStoreAgent = new Agent({
  name: "VectorStoreAgent",
  instructions: "This agent vectorizes text chunks and stores them in a vector store. It can fetch documents from a URL or use raw text input. The agent will create embeddings for the text chunks and store them in a PostgreSQL vector store.",
  model: lmstudio("c4ai-command-r7b-12-2024"),
  tools: {
    vectorizeTool, 
  },
});
logger.info("VectorStoreAgent created");
// Export the agent for use in other parts of the application
export default VectorStoreAgent;
// This agent can be used in the Mastra framework to handle vectorization tasks.
