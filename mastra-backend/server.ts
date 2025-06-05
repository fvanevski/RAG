import { createHonoServer } from '@mastra/core';
import { serve } from 'hono/node-server';
import { mastra } from './src/mastra/index';

const port = Number(process.env.PORT) || 8000;

async function startServer() {
  const app = await createHonoServer(mastra, { isDev: true });
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Mastra backend listening on port ${port}`);
  });
}

startServer();
