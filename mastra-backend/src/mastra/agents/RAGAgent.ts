import { openai } from "@ai-sdk/openai";
import { Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { PgVector } from "@mastra/pg";
import { MDocument, createGraphRAGTool } from "@mastra/rag";
import { embedMany } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { PinoLogger } from "@mastra/loggers";

// Create standalone instances to avoid circular dependency
const logger = new PinoLogger({
  name: "RAGAgent",
  level: "debug",
});

const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING || "postgresql://postgres:gtnv98b@localhost:5432/ragdb",
});

const llamachat = createOpenAICompatible({
  name: "llamachat",
  baseURL: "http://localhost:1234/v1",
});

const llamaembedding = createOpenAICompatible({
  name: "llamaembedding",
  baseURL: "http://localhost:8082/v1",
});

const graphRagTool = createGraphRAGTool({
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: llamaembedding.textEmbeddingModel("Qwen3-Embedding-0.6B-Q8_0.gguf"),
  graphOptions: {
    dimension: 1024,
    threshold: 0.7,
  },
});

export const ragAgent = new Agent({
  name: "GraphRAG Agent",
  instructions: `You are a helpful assistant that answers questions based on the provided context. Format your answers as follows:
 
1. DIRECT FACTS: List only the directly stated facts from the text relevant to the question (2-3 bullet points)
2. CONNECTIONS MADE: List the relationships you found between different parts of the text (2-3 bullet points)
3. CONCLUSION: One sentence summary that ties everything together
 
Keep each section brief and focus on the most important points.
 
Important: When asked to answer a question, please base your answer only on the context provided in the tool. 
If the context doesn't contain enough information to fully answer the question, please state that explicitly.`,
  model: llamachat("c4ai-command-r7b-12-2024"),
  tools: {
    graphRagTool,
  },
});

export const mastra = new Mastra({
  agents: { ragAgent },
  vectors: { pgVector },
});

export const agent = mastra.getAgent("ragAgent");
