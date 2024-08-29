import { PrismaClient } from "@prisma/client";
import ai21LabsSeed from "./ai21_labs";
import anthropicSeed from "./anthropic";
import cohereSeed from "./cohere";
import metaSeed from "./meta";
import mistralSeed from "./mistral";
import openaiSeed from "./openai";

const prisma = new PrismaClient();

async function main() {
  await ai21LabsSeed();
  await anthropicSeed();
  await cohereSeed();
  await metaSeed();
  await mistralSeed();
  await openaiSeed();
}

main()
  .catch((e) => {
    console.error(e);
    // @ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
