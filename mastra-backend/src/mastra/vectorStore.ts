import { PgVector } from "@mastra/pg";
import "dotenv/config";

export const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});

