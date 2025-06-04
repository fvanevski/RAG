import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";
import { CopilotRuntime, copilotRuntimeNodeHttpEndpoint, ExperimentalEmptyAdapter } from "@copilotkit/runtime";
import { registerCopilotKit } from "@mastra/agui";

import { PgVector } from "@mastra/pg";
import "dotenv/config";
import { RAGAgentQuery } from "./agents/RAGAgent";
import { vectorizeTool } from "./tools/vectorize";
 
const serviceAdapter = new ExperimentalEmptyAdapter();

// Initialize Mastra instance
const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});

export const mastra = new Mastra({
  agents: { RAGAgentQuery },
  vectors: { pgVector },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  server: {
    cors: {
      origin: "*",
      allowMethods: ["*"],
      allowHeaders: ["*"],
    },
    apiRoutes: [
      registerCopilotKit({
        path: "/copilotkit",
        resourceId: "RAGAgent",
        setContext: (c, runtimeContext) => {
          runtimeContext.set("user-id", c.req.header("X-User-ID"));
        },
      }),
    ],
  },
});

// Note: vectorizeTool is already included in RAGAgentQuery.tools for agent tool execution
