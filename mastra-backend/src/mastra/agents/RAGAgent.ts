import { createOpenAI, openai } from "@ai-sdk/openai";
import { ollama } from 'ollama-ai-provider';
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { Agent } from "@mastra/core/agent";
import { createGraphRAGTool } from "@mastra/rag";
import { vectorizeTool } from '../tools/vectorize';

const vllm0 = createOpenAICompatible({
  name: "vllm0",
  baseURL: "http://localhost:8081/v1", // Adjust to your Ollama server URL
});

const graphRagTool = createGraphRAGTool({
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: vllm0.textEmbeddingModel("bge-large"),
  // model: ollama.embedding("bge-large"),
  // model: openai.embedding("text-embedding-3-small"),
  graphOptions: {
    dimension: 1024, // BGE-large has 1024 dimensions
    threshold: 0.7,
  },
});

const lmstudio = createOpenAICompatible({
   name: "lmstudio",
   baseURL: "http://localhost:1234/v1",
});

export const RAGAgentQuery = new Agent({
  name: "GraphRAG Agent for Querying",
  instructions: `You are a helpful assistant that answers questions based on the provided context. Format your answers as follows:
 
1. DIRECT FACTS: List only the directly stated facts from the text relevant to the question (2-3 bullet points)
2. CONNECTIONS MADE: List the relationships you found between different parts of the text (2-3 bullet points)
3. CONCLUSION: One sentence summary that ties everything together
 
Keep each section brief and focus on the most important points.
 
Important: When asked to answer a question, please base your answer only on the context provided in the tool. 
If the context doesn't contain enough information to fully answer the question, please state that explicitly.`,
  model: lmstudio("c4ai-command-r7b-12-2024"),
  tools: {
    graphRagTool,
    vectorizeTool,
  },
})
