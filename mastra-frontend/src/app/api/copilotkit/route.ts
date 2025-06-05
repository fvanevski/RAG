// Import the HttpAgent for making HTTP requests to the backend
import { HttpAgent } from "@ag-ui/client";

// Import CopilotKit runtime components for setting up the API endpoint
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";

// Import NextRequest type for handling Next.js API requests
import { NextRequest } from "next/server";

// Create a new HttpAgent instance that connects to the Mastra backend
// The backend URL can be configured with the `MASTRA_BACKEND_URL` environment variable
// and defaults to the local development address.
const RAGAgentQuery = new HttpAgent({
  url: process.env.MASTRA_BACKEND_URL ?? "http://127.0.0.1:8000/mastra",
});

// Initialize the CopilotKit runtime with our research agent
const runtime = new CopilotRuntime({
  agents: {
    RAGAgentQuery, // Register the research agent with the runtime
  },
});

/**
 * Define the POST handler for the API endpoint
 * This function handles incoming POST requests to the /api/copilotkit endpoint
 */
export const POST = async (req: NextRequest) => {
  // Configure the CopilotKit endpoint for the Next.js app router
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime, // Use the runtime with our research agent
    serviceAdapter: new ExperimentalEmptyAdapter(), // Use the experimental adapter
    endpoint: "/api/copilotkit", // Define the API endpoint path
  });

  // Process the incoming request with the CopilotKit handler
  return handleRequest(req);
};
