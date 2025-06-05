import { NextRequest, NextResponse } from 'next/server';

// Proxy requests to the Mastra backend
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get the backend URL from environment variables or use default
    const backendUrl = process.env.MASTRA_BACKEND_URL ?? "http://127.0.0.1:4111";
    
    // Forward the request to the Mastra backend using the correct endpoint format
    const response = await fetch(`${backendUrl}/api/agents/RAGAgentQuery/tools/vectorize/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error proxying request to Mastra backend:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
