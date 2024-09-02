# gpinterface (Generative Prompt Interface)

## What is gpinterface?

**With `gpinterface`, you can create endpoint for your prompt.**

## How does it work?

<details>
<summary>Show me how it works</summary>

`gpinterface` generates several endpoints at deploying your prompt:

1. one-time chat interactions
2. chat session creation
3. ongoing conversations within a session
4. conversation retrieval from a session

You can use those endpoints to create your own use case.

![text_correction_capture](./text_correction_capture.png)

</details>

## Features

It is a powerful tool designed to streamline the testing and deployment of generative prompts across multiple large language models (LLMs). With an easy-to-use web interface, `gpinterface` enables rapid configuration and experimentation.

- **Simple Deployment**: Deploy your configured prompts, creating accessible endpoints instantly.
- **Easy Prompt Testing**: Utilize a web interface to test prompts with various configurations effortlessly.
- **Support for Multiple LLMs**: Seamlessly integrate and use different Large Language Models to ensure your application is versatile and robust.

## Supported LLMs

`gpinterface` currently supports a variety of leading Large Language Models, including:

- AI21 Jamba
- Anthropic Claude
- Cohere Command
- Meta Llama
- Mistral AI Mistral
- OpenAI ChatGPT

This diverse support allows you to choose the best model for your specific needs and requirements.

Don't see your favorite model? Feel free to open [PR](https://github.com/brianbscho/gpinterface/pulls) or [contact me](mailto:brianbscho@gmail.com)!

## Demo

A live demo is available at [gpinterface.com](https://gpinterface.com).

Here are some specific examples of what `gpinterface` can do:

- Text Summarization: [Try it here](https://gpinterface.com/gpis/bPqvQH-6qPKdOY5XHMYiN)
- Translation: [Try it here](https://gpinterface.com/gpis/S1WYvoKdOllFrvST0Okzn)
- Text Correction: [Try it here](https://gpinterface.com/gpis/i1WqU74CIYHGfURPcVnR5)

## Develop

### Database

The application requires a PostgreSQL database. Start the database using Docker:

```bash
cd backend
docker-compose up -d
```

The backend utilizes [Prisma](https://www.prisma.io/orm) to manage the database schema and migrations. Execute the following commands at database initialization:

```bash
npm run prisma:migrate
```

To seed the database with initial data for each supported Large Language Model, run the following commands:

```bash
ts-node prisma/seed/ai21_labs.ts
ts-node prisma/seed/anthropic.ts
ts-node prisma/seed/cohere.ts
ts-node prisma/seed/meta.ts
ts-node prisma/seed/mistral.ts
ts-node prisma/seed/openai.ts
```

### Environment Variables

**Backend**

The backend requires the following environment variables to be set:

```bash
CLIENT_URL="http://localhost:3003"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres" # can be replaced with your DB endpoint
AI21_API_KEY="YOUR_AI21_API_KEY"
ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"
COHERE_API_KEY="YOUR_COHERE_API_KEY"
MISTRAL_API_KEY="YOUR_MISTRAL_API_KEY"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
AWS_ACCESS_KEY_ID="AWS_ACCESS_KEY" # for Bedrock, Meta Llama
AWS_SECRET_ACCESS_KEY="AWS_SECRET_KEY" # for Bedrock, Meta Llama
JWT_SECRET="SECURE_RANDOM_STRING"
COOKIE_SECRET="SECURE_RANDOM_STRING"
NODE_ENV="development" # for development logging
```

Ensure these variables are set in a `.env` file in the backend directory before starting the application.

**frontend**

The frontend application requires the following environment variables:

```bash
NEXT_PUBLIC_API_ENDPOINT="http://localhost:3000"
NEXT_PUBLIC_SERVICE_ENDPOINT="http://localhost:3000"
NEXT_PUBLIC_HOSTNAME="http://localhost:3003"
```

These should be configured to match the endpoints where the backend services are available, ensuring the frontend can communicate with the backend properly.

### Local Development

To run the application components separately for development purposes:

**Run Backend**

```bash
  cd backend && npm run dev
```

**Run Frontend**

```bash
  cd frontend && npm run dev
```

### Build

To build all components for production deployment, follow these steps sequentially

```bash
cd shared
npm run build
cd ../backend
npm run build
cd ../frontend
npm run build
```

### Running the Server

To start the server

**Run Backend**

```bash
  cd backend && npm run start
```

**Run Chat Server (API Server)**

```bash
  cd backend && npm run start:chat
```

**Run Frontend**

```bash
  cd frontend && npm run start
```
