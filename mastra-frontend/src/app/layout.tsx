import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { CopilotKit } from "@copilotkit/react-core";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mastra Graph RAG AI Assistant",
  description:
    "Experience the future of Graph RAG with our AI-powered assistant. Get personalized insights, recommendations, and support for your graph-related tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicApiKey = process.env.NEXT_PUBLIC_COPILOT_API_KEY;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <CopilotKit
          publicApiKey={publicApiKey}
          agent="RAGAgentQuery"
          showDevConsole={false}>
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
