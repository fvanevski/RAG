// Define the RAG agent state type

// Graph RAG agent state type
interface RAGAgentState {
  status: "initializing" | "processing" | "completed" | "error";
  currentStep: string;
  processingStage:
    | "starting"
    | "analyzing_query"
    | "retrieving_graph_context"
    | "retrieving_documents"
    | "generating_answer"
    | "finished"
    | "error_occurred";
  query?: string; // The user query
  graphContext?: string; // Graph context or summary
  relevantNodes?: string[]; // IDs or names of relevant nodes
  relevantEdges?: string[]; // IDs or descriptions of relevant edges
  relevantChunks?: string[]; // Relevant document chunks
  answer?: string; // The final answer from the agent
  error?: string;
}

export type { RAGAgentState };
