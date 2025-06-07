import { createTool } from "@mastra/core/tools";
import { MDocument } from "@mastra/rag";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
// import { LLamaCpp } from "../index.js
import { embedMany } from "ai";
import { z } from "zod";
import { PinoLogger } from "@mastra/loggers";
import { PgVector } from "@mastra/pg";

import "dotenv/config";

// Utility: fetch visible text from a URL using Playwright
async function fetchVisibleTextWithPlaywright(url: string): Promise<string> {
	const playwright = await import("playwright");
	const browser = await playwright.chromium.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: "networkidle" });
	// Remove script/style/noscript for cleaner text
	await page.evaluate(() => {
		Array.from(document.querySelectorAll("script, style, noscript")).forEach(
			(el) => el.remove()
		);
	});
	const text = await page.evaluate(() => document.body.innerText);
	await browser.close();
	return text;
}

export const vectorizeTool = createTool({
	id: "vectorize", // tool id used in endpoints
	description: "A tool to vectorize text chunks and store in a vector store.",
	inputSchema: z
		.object({
			documentURL: z
				.string()
				.optional()
				.describe("Document URL to fetch and vectorize."),
			documentText: z
				.string()
				.optional()
				.describe("Raw document text to vectorize."),
		})
		.refine((data) => data.documentURL || data.documentText, {
			message: "Either documentURL or documentText must be provided",
		}),
	outputSchema: z.object({
		chunkLength: z.number(),
	}),
	execute: async ({ context }) => {
		const logger = new PinoLogger({
			name: "VectorizeTool",
			level: "debug",
		});

		// Top-level log to trace repeated calls
		logger.info("VectorizeTool called", { url: context.documentURL });

		let Doc: string = ""; // Initialize Doc as an empty string
		let docType: "html" | "text" | "json" | "markdown" = "html"; // Default to HTML if not specified
		// Check if documentText is provided, otherwise fetch from documentURL
		if (context.documentText) {
			Doc = context.documentText;
			if (context.documentText.includes("<html>")) {
				docType = "html"; // Set type to HTML if text contains HTML tags
			} else if (
				context.documentText.startsWith("{") ||
				context.documentText.startsWith("[")
			) {
				docType = "json"; // Set type to JSON if text starts with { or [
			} else if (context.documentText.startsWith("#")) {
				docType = "markdown"; // Set type to Markdown if text starts with #
			} else {
				docType = "text"; // Default to text for plain text
			}
		} else if (context.documentURL) {
			if (docType === "html") {
				Doc = await fetchVisibleTextWithPlaywright(context.documentURL);
			} else {
				const response = await fetch(context.documentURL);
				if (!response.ok) {
					throw new Error(`Failed to fetch document: ${response.statusText}`);
				}
				Doc = await response.text();
			}
		}
		// Log the fetched content size and a snippet before creating MDocument
		if (context.documentURL) {
			logger.info("Fetched content from URL", {
				url: context.documentURL,
				fetchedLength: Doc.length,
				fetchedSnippet: Doc.slice(0, 300),
			});
		}

		// Create a new MDocument instance with the fetched or provided text
		// Use the full URL as the docId for uniqueness
		const docID = context.documentURL
			? context.documentURL
			: `document-${docType}-${Date.now()}`; // Generate a unique ID based on type and timestamp for text input

		const technicalDoc =
			docType === "html"
				? MDocument.fromHTML(Doc, { docId: docID })
				: docType === "json"
				? MDocument.fromJSON(Doc, { docId: docID })
				: docType === "markdown"
				? MDocument.fromMarkdown(Doc, { docId: docID })
				: docType === "text"
				? MDocument.fromText(Doc, { docId: docID })
				: undefined; // Default to undefined if no type matches
		// Check if MDocument instance is created successfully
		if (!technicalDoc) {
			logger.error("Failed to create MDocument instance", {
				url: context.documentURL,
			});
			throw new Error("MDocument creation failed");
		}
		logger.debug("MDocument created", {
			type: docType,
			length: Doc.includes("<html>") ? Doc.length : Doc.split(/\s+/).length,
			url: context.documentURL,
			textSnippet: Doc.slice(0, 100), // Log first 100 characters of the document
			// Log the first 100 characters of the document
		});
		// After creating MDocument, log the doc text length and a snippet for comparison
		const docs = technicalDoc.getDocs();
		const firstDocText = docs[0]?.text?.slice(0, 300);
		logger.info("MDocument first doc comparison", {
			mDocTextLength: docs[0]?.text?.length,
			firstDocText,
			metadata: docs[0]?.metadata,
			docsCount: docs.length,
		});
		const llamaChat = createOpenAICompatible({
			name: "llamachat",
			baseURL: "http://localhost:8083/v1",
		});

		// Define the chunking configuration based on the document type
		/* 		const chunkConfig =
			docType === "html"
				? {
						strategy: "html" as const,
						size: 1024,
						overlap: 100,
						headers: [
							["h1", "title"] as [string, string],
							["h2", "section"] as [string, string],
							["h3", "subsection"] as [string, string],
						],
						sections: [
							["article", "article"] as [string, string],
							["section", "section"] as [string, string],
							["div.content", "content"] as [string, string],
						],
						extract: {
							title: { llm: llama("mistral-small-24b-instruct-2501") },
							summary: { llm: llama("mistral-small-24b-instruct-2501") },
							keywords: { llm: llama("mistral-small-24b-instruct-2501") },
						},
				  }
				: docType === "json"
				? {
						strategy: "json" as const,
						size: 1024,
						overlap: 100,
						extract: {
							title: { llm: llama("mistral-small-24b-instruct-2501") },
							summary: { llm: llama("mistral-small-24b-instruct-2501") },
							keywords: true,
						},
				  }
				: docType === "markdown"
				? {
						strategy: "markdown" as const,
						size: 1024,
						overlap: 100,
						headers: [
							["#", "title"] as [string, string],
							["##", "section"] as [string, string],
						], // Markdown-specific option
						stripHeaders: true, // Markdown-specific option
						extract: {
							title: { llm: llama("mistral-small-24b-instruct-2501") },
							summary: { llm: llama("mistral-small-24b-instruct-2501") },
							keywords: { llm: llama("mistral-small-24b-instruct-2501") },
						},
				  }
				: docType === "text"
				? {
						strategy: "recursive" as const,
						size: 1024,
						overlap: 100,
						separator: "\n\n",
						extract: {
							title: { llm: llama("mistral-small-24b-instruct-2501") },
							summary: { llm: llama("mistral-small-24b-instruct-2501") },
							keywords: { llm: llama("mistral-small-24b-instruct-2501") },
						},
				  }
				: undefined;
 
		// check if chunkConfig is configured correctly
		logger.debug("Chunk configuration", {
			chunkConfig,
		});
*/ // Use a test chunk configuration for debugging
		const testchunkConfig = {
			strategy: "recursive" as const,
			size: 1024,
			overlap: 100,
			separator: "\n\n",
		};

		// Process the chunks
		const chunks = await technicalDoc.chunk(testchunkConfig);
		logger.debug("Document chunked", {
			count: chunks.length,
			firstChunkLength: chunks[0]?.text.length,
		});

		const { embeddings } = await embedMany({
			model: createOpenAICompatible({
				name: "embeddingModel",
				baseURL: "http://localhost:8082/v1",
			}).textEmbeddingModel("Qwen3-Embedding-0.6B-Q8_0.gguf"),
			values: chunks.map((chunk) => chunk.text),
		});

		logger.debug("Embeddings generated", {
			count: embeddings.length,
			firstEmbeddingLength: embeddings[0]?.length,
		});
		// Check if embeddings were generated
		if (embeddings.length === 0) {
			logger.warn("No embeddings generated, skipping upsert");
			return { chunkLength: chunks.length };
		}
		// Initialize the PgVector instance
		const pgVector = new PgVector({
			connectionString:
				process.env.POSTGRES_CONNECTION_STRING ||
				"postgresql://postgres:gtnv98b@localhost:5432/ragdb",
		});
		// Check if PgVector instance is created successfully
		if (!pgVector) {
			logger.error("Vector store not initialized");
			throw new Error("Vector store not initialized");
		} else {
			logger.debug("PgVector instance created", {
				connectionString:
					process.env.POSTGRES_CONNECTION_STRING ||
					"postgresql://postgres:gtnv98b@localhost:5432/ragdb",
			});
		}
		// Always attempt to create the index for embeddings (idempotent if already exists)
		logger.debug("Creating index for embeddings (if not exists)", {
			indexName: "embeddings",
			dimension: embeddings[0].length, // 1024 for Qwen3-Embedding-0.6B
		});
		await pgVector.createIndex({
			indexName: "embeddings",
			dimension: embeddings[0].length, // 1024 for Qwen3-Embedding-0.6B
			// Adjust dimension based on your embedding model
		});
		// Duplicate detection: only skip if a doc with the same docId exists
		const existingDoc = await pgVector.query({
			indexName: "embeddings",
			queryVector: embeddings[0],
			topK: 1,
			filter: {
				metadata: {
					docId: docID,
				},
			},
		});
		if (existingDoc.length > 0) {
			logger.warn("Document with same docId already exists, skipping upsert", {
				docId: docID,
			});
			return { chunkLength: chunks.length };
		}

		// Upsert the chunks into the vector store
		logger.debug("Upserting chunks into vector store", {
			chunkCount: chunks.length,
			docId: docID,
		});
		await pgVector.upsert({
			indexName: "embeddings",
			vectors: embeddings,
			metadata: chunks.map((chunk, index) => ({
				docId: docID,
				chunkId: `chunk-${index}`,
				text: chunk.text,
				// Add any other metadata you want to store
			})),
		});
		logger.info("Chunks upserted successfully", {
			chunkCount: chunks.length,
			docId: docID,
		});
		return { chunkLength: chunks.length };
	},
});
// Export the vectorize tool for use in agents or other parts of the application
export default vectorizeTool;
export { fetchVisibleTextWithPlaywright }; // Export utility function if needed elsewhere
