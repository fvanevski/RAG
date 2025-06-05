import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";
import { registerCopilotKit } from "@mastra/agui";

import { PgVector } from "@mastra/pg";
import "dotenv/config";
import { RAGAgentQuery } from "./agents/RAGAgent";
import { VectorStoreAgent } from "./agents/VectorStoreAgent";

export const mastra = new Mastra({
  agents: { RAGAgentQuery, VectorStoreAgent },
  vectors: { 
    pgVector: new PgVector({
      connectionString: process.env.POSTGRES_CONNECTION_STRING!,
    })
  },
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
        resourceId: "App",
        setContext: (c, runtimeContext) => {
          runtimeContext.set("user-id", c.req.header("X-User-ID"));
        },
      }),
    ],
  },
});

// vectorizeTool is exposed by VectorStoreAgent (see ./agents/VectorStoreAgent.ts)
