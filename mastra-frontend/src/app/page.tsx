import Link from "next/link";
import Footer from "@/components/Footer";
import RAG from './components/RAG';

import { useState } from 'react';
export default function Home() {
  const [docURL, setDocURL] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleURLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus('Indexing URL...');
    const res = await fetch(`/api/agents/RAGAgent/tools/vectorize/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentURL: docURL }),
    });
    const data = await res.json();
    setUploadStatus(res.ok ? `Indexed ${data.chunkLength} chunks` : `Error: ${data.error}`);
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploadStatus('Indexing file content...');
    const text = await file.text();
    const res = await fetch(`/api/agents/RAGAgent/tools/vectorize/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentText: text }),
    });
    const data = await res.json();
    setUploadStatus(res.ok ? `Indexed ${data.chunkLength} chunks` : `Error: ${data.error}`);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:mx-0">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                  Intelligent Graph RAG
                  <span className="block text-blue-600">Assistant</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 sm:mt-8 sm:text-xl">
                  Experience the future of Graph RAG knowledgebase for domain-specific querying and retrieval with our AI-powered
                  assistant.
                </p>
                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/copilotkit"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors">
                      Try Graph RAG
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="#features"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-colors">
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                  <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Graph RAG Assistant
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-500">Live</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              What do you want to learn about today?
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              Feed me some documentation and i'll be an expert advisor!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Powerful Features
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need for intelligent knowledge retrieval and domain-specific querying
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-md">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Dynamic updating
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Get real-time updates on your knowledgebase with automatic indexing
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-md">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Smart Querying
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  AI-powered document retrieval and semantic search for accurate answers
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-md">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Natural Conversation
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Chat naturally about any topic in multiple languages
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  About Mastra Graph RAG
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Built with cutting-edge AI technology and powered by
                  CopilotKit, our Graph RAG assistant provides intelligent,
                  conversational insights that adapt to your needs.
                </p>
                <div className="mt-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        Powered by Mastra Framework
                      </h4>
                      <p className="mt-1 text-base text-gray-600">
                        Built on the robust Mastra agent framework for reliable
                        AI interactions
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        Enhanced with CopilotKit
                      </h4>
                      <p className="mt-1 text-base text-gray-600">
                        Seamless AI integration for natural conversation
                        experiences
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="aspect-w-16 aspect-h-9 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg">
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-white opacity-80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Document Ingestion Section */}
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Documents to Knowledge Base</h2>
            <form onSubmit={handleURLSubmit} className="flex space-x-2 mb-4">
              <input
                type="url"
                required
                placeholder="Document URL"
                value={docURL}
                onChange={e => setDocURL(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-md"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Index URL</button>
            </form>
            <form onSubmit={handleFileSubmit} className="flex items-center space-x-2 mb-4">
              <input type="file" accept=".txt,.md,.pdf" onChange={e => setFile(e.target.files?.[0]||null)} className="flex-1" />
              <button type="submit" disabled={!file} className="px-4 py-2 bg-green-600 text-white rounded-md">Upload File</button>
            </form>
            {uploadStatus && <p className="text-sm text-gray-700">{uploadStatus}</p>}
          </div>
        </section>

        {/* RAG Chat Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <RAG />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600">
          <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to experience intelligent RAG?
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Start chatting with our AI RAG assistant today
              </p>
              <div className="mt-8">
                <Link
                  href="/copilotkit"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors">
                  Get Started Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
