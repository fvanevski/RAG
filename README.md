# Mastra Weather AI

This repository contains the backend and frontend for the Mastra Weather AI assistant.

## Environment Variables

The frontend reads `MASTRA_BACKEND_URL` to determine where the backend is running. If this variable is not set, the default `http://127.0.0.1:8000/mastra` is used.

Add this variable to `mastra-frontend/.env.local` when deploying or running locally.
