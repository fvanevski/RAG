import "@copilotkit/react-ui/styles.css";
import React, { ReactNode } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import "dotenv/config";
// This file sets up the CopilotKit layout for the Next.js application.
// It initializes the CopilotKit with the public API key and the agent to use.
// If you're using Copilot Cloud, you don't need to set the runtime URL.

// Where CopilotKit will proxy requests to. If you're using Copilot Cloud, this environment variable will be empty.
// const runtimeUrl = process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL;
// When using Copilot Cloud, all we need is the publicApiKey.
const publicApiKey = process.env.NEXT_PUBLIC_COPILOT_API_KEY;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <CopilotKit publicApiKey={publicApiKey} // The public API key for Copilot Cloud
      agent="RAGAgent" // The name of the agent to use
      showDevConsole={false} // Show the dev console for debugging
    >
      {children}
    </CopilotKit>
  );
}
