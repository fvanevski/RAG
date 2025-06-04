"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import RAG from "../components/RAG";

export default function CopilotKitPage() {
  return (
    <main>
      <RAG />
      <CopilotSidebar
        clickOutsideToClose={true}
        defaultOpen={false}
        labels={{
          title: "Popup Assistant",
          initial:
            "Welcome to the Copilot Assistant! Ask me anything about the knowledgebase you uploaded.",
        }}
      />
    </main>
  );
}
