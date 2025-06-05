import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";
import { registerCopilotKit } from "@mastra/agui";

import "dotenv/config";
import { pgVector } from "./vectorStore";
import { RAGAgentQuery } from "./agents/RAGAgent";
import { VectorStoreAgent } from "./agents/VectorStoreAgent";

export const mastra = new Mastra({
  agents: { RAGAgentQuery, VectorStoreAgent },
  vectors: {
    pgVector,
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "debug",
  }),
telemetry: {
    serviceName: "my-app",
    enabled: true,
    sampling: {
      type: "always_on",
    },
    export: {
      type: "otlp",
      endpoint: "http://localhost:4318", // SigNoz local endpoint
    },
  },
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
