import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { vectorizeTool } from "../tools/vectorize";
import { Agent } from "@mastra/core/agent";
import { PinoLogger } from "@mastra/loggers";

// Create a standalone logger to avoid circular dependency
const logger = new PinoLogger({
  name: "VectorStoreAgent",
  level: "debug",
});

const llamachat = createOpenAICompatible({
  name: "llamachat",
  baseURL: "http://localhost:8083/v1",
});
logger.info("llamachat initialized");

export const VectorStoreAgent = new Agent({
  name: "VectorStoreAgent",
  instructions: "This agent vectorizes text chunks and stores them in a vector store. It can fetch documents from a URL or use raw text input. The agent will create embeddings for the text chunks and store them in a PostgreSQL vector store.",
  model: llamachat("mistral-small-24b-instruct-2501"),
  tools: {
    vectorizeTool,
  },
});
