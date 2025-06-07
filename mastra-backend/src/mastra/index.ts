import { Mastra } from "@mastra/core";
import { PgVector } from "@mastra/pg";
import { ragAgent } from "./agents/RAGAgent";
import { VectorStoreAgent } from "./agents/VectorStoreAgent";
import { PinoLogger } from "@mastra/loggers";
import { registerCopilotKit } from "@mastra/agui";
import { OtelConfig } from "@mastra/core/telemetry";

import "dotenv/config";

const otelConfig: OtelConfig = {
    serviceName: "my-app",
    enabled: true,
    sampling: {
      type: "ratio",
      probability: 0.5,
    },
    export: {
      type: "otlp",
      endpoint: "http://localhost:4318", // SigNoz local endpoint
      headers: {
        Authorization: "Bearer YOUR_TOKEN_HERE", // Replace with your actual authorization token if needed
      },
   },
};

export const mastra = new Mastra({
  agents: { ragAgent, VectorStoreAgent },
  vectors: {
    pgvector: new PgVector({
      connectionString: process.env.POSTGRES_CONNECTION_STRING || "postgresql://postgres:gtnv98b@localhost:5432/ragdb",
    }),
  },
  server: {
    port: 3000,
    cors: {
      origin: "*", // Adjust as needed for your CORS policy
      allowMethods: ["GET", "POST", "PUT", "DELETE"],
      allowHeaders: ["Content-Type", "Authorization", "X-User-ID"],
      exposeHeaders: ['Content-Length', 'X-Requested-With'],
      credentials: false
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

mastra.setTelemetry(otelConfig);
mastra.setLogger({
  logger: new PinoLogger({
    name: "Mastra",
    level: "debug",
  })
});

const RAGtools = await ragAgent.getTools();
console.log(Object.keys(RAGtools));
const vectorStoreTools = await VectorStoreAgent.getTools();
console.log(Object.keys(vectorStoreTools));
