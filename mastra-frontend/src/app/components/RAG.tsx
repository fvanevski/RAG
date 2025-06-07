'use client';

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { useRef } from "react";
import { RAGAgentState } from "@/lib/types";
import ReactMarkdown from "react-markdown";

function RAG() {
  // Reference to track if RAG request is in progress
  const isRAGInProgress = useRef(false); // Connect to the RAG agent's state using CopilotKit's useCoAgent hook
  const { state, stop: stopRAGAgent } = useCoAgent<RAGAgentState>({
    name: "ragAgent",
    initialState: {
      status: "initializing",
      currentStep: "RAGAgent_analysis",
      processingStage: "starting",
      query: "",
      answer: "",
    },
  });

  // Implement useCoAgentStateRender hook
  useCoAgentStateRender({
    name: "ragAgent",
    handler: ({ nodeName }) => {
      // Handle completion when the RAG agent finishes
      if (nodeName === "__end__" || state?.status === "completed") {
        setTimeout(() => {
          isRAGInProgress.current = false;
          stopRAGAgent();
        }, 1000);
      }
    },
    render: ({ status }) => {
      if (status === "inProgress") {
        isRAGInProgress.current = true;
        return (
          <div className="RAG-in-progress bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <p className="font-medium text-gray-800">
                Getting RAG information...
              </p>
            </div>

            <div className="status-container mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-sm font-medium text-gray-700">
                  {getStatusText()}
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (status === "complete") {
        isRAGInProgress.current = false;
        return null;
      }

      return null;
    },
  });

  // Helper function to format the status for display
  const getStatusText = () => {
    switch (state?.processingStage) {
      case "starting":
        return "Initializing graph RAG request...";
      case "analyzing_query":
        return "Analyzing your query...";
      case "retrieving_graph_context":
        return "Retrieving relevant graph context...";
      case "retrieving_documents":
        return "Retrieving relevant documents...";
      case "generating_answer":
        return "Generating answer from knowledge graph...";
      case "finished":
        return "Answer ready";
      case "error_occurred":
        return "Error occurred while processing query";
      default:
        return "Processing knowledge graph query...";
    }
  };

  // When there's an error, show error state
  if (state?.status === "error") {
    return (
      <div className="flex flex-col gap-4 h-full max-w-4xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm w-full">
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-red-600">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h3 className="text-lg font-semibold text-red-800">
              Graph RAG Error
            </h3>
          </div>

          <p className="text-red-700 mb-4">
            {state.error ||
              "Unable to retrieve graph information. Please try again."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show answer if available
  if (state?.answer) {
    return (
      <div className="flex flex-col gap-4 h-full max-w-4xl mt-4 mx-auto">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">RAG Agent Answer</h3>
            <div className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
              Status: {state.status}
            </div>
          </div>
          {/* Query */}
          {state?.query && (
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Query:</span> {state.query}
            </div>
          )}
          {/* Graph Context */}
          {state?.graphContext && (
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Graph Context:</span> {state.graphContext}
            </div>
          )}
          {/* Relevant Nodes */}
          {state?.relevantNodes && state.relevantNodes.length > 0 && (
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Relevant Nodes:</span> {state.relevantNodes.join(", ")}
            </div>
          )}
          {/* Relevant Edges */}
          {state?.relevantEdges && state.relevantEdges.length > 0 && (
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Relevant Edges:</span> {state.relevantEdges.join(", ")}
            </div>
          )}
          {/* Relevant Chunks */}
          {state?.relevantChunks && state.relevantChunks.length > 0 && (
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Relevant Chunks:</span> {state.relevantChunks.join(", ")}
            </div>
          )}
          {/* Answer */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed rag-answer">
              <ReactMarkdown>{state.answer}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If graph request is in progress, show loading state
  if (
    state?.status &&
    state.status !== "completed" &&
    (isRAGInProgress.current || state.status === "processing")
  ) {
    return (
      <div className="flex flex-col gap-4 h-full max-w-4xl mt-4 mx-auto">
        <div className="p-6 bg-white border rounded-lg shadow-sm w-full">
          <h3 className="text-xl font-semibold mb-4">
            Processing Graph RAG Query
          </h3>

          <div className="status-container mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-800">{getStatusText()}</div>
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            </div>
          </div>

          {/* Processing Stages */}
          <div className="space-y-2 mb-6">
            {[
              { stage: "analyzing_request", label: "Analyzing Request" },
              {
                stage: "fetching_weather_data",
                label: "Retrieving Graph Data",
              },
              { stage: "formatting_response", label: "Formatting Response" },
            ].map(({ stage, label }) => {
              const isActive = state?.processingStage === stage;
              const isCompleted =
                getStageOrder(state?.processingStage || "") >
                getStageOrder(stage);

              return (
                <div key={stage} className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500"
                        : isActive
                        ? "bg-blue-500"
                        : "bg-gray-200"
                    }`}>
                    {isCompleted && (
                      <svg
                        className="w-2 h-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isCompleted || isActive
                        ? "text-gray-800"
                        : "text-gray-500"
                    }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default state when not processing and no results yet
  return (
    <div className="flex flex-col gap-4 h-full max-w-4xl mt-4 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Graph RAG Assistant</h3>
          <div className="text-sm px-3 py-1 bg-gray-100 rounded-full">
            Ready
          </div>
        </div>
        <div className="text-gray-600 mb-4">
          <p>
            Ask me questions about your knowledge graph and I&apos;ll return
            answers with relevant context.
          </p>
        </div>{" "}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-800 mb-2">Examples:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• &quot;How is Alice connected to Bob?&quot;</li>
            <li>• &quot;List documents related to Project X&quot;</li>
            <li>• &quot;Show relationships for node 42&quot;</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Helper function to determine stage order for progress tracking
  function getStageOrder(stage: string): number {
    const stages = [
      "starting",
      "analyzing_request",
      "fetching_weather_data",
      "formatting_response",
      "finished",
    ];
    return stages.indexOf(stage);
  }
}

export default RAG;
