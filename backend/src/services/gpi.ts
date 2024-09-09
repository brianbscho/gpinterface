import { Prisma, PrismaClient } from "@prisma/client";
import { getDataWithHashId, getTypedContent } from "../util/prisma";
import { ChatContent } from "gpinterface-shared/type/chat-content";
import { compareObjects } from "../util";

export async function createGpiEntry(
  gpiDelegate: Prisma.GpiDelegate,
  gpi: {
    userHashId: string;
    config: Prisma.JsonValue;
    description: string;
    isPublic: boolean;
    systemMessage: string;
    modelHashId: string;
    chatContents: {
      config: Prisma.JsonValue;
      modelHashId: string | null;
      role: string;
      content: string;
    }[];
  }
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const newGpi = await gpiDelegate.create({
        data: getDataWithHashId(
          {
            ...gpi,
            config: gpi.config ?? Prisma.JsonNull,
            chatContents: {
              createMany: {
                data: gpi.chatContents.map((c) =>
                  getDataWithHashId(getTypedContent(c))
                ),
              },
            },
          },
          32
        ),
        select: { hashId: true },
      });

      return newGpi;
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}

export async function copyGpiEntry(
  prisma: PrismaClient,
  hashId: string,
  userHashId: string
) {
  const gpi = await prisma.gpi.findFirst({
    where: { hashId, OR: [{ userHashId }, { isPublic: true }] },
    select: {
      config: true,
      description: true,
      modelHashId: true,
      isPublic: true,
      systemMessage: true,
      chatContents: {
        select: { role: true, content: true, config: true, modelHashId: true },
        where: { isDeployed: true },
      },
    },
  });

  if (!gpi) {
    throw "no gpi";
  }

  const newGpi = await createGpiEntry(prisma.gpi, { userHashId, ...gpi });

  return newGpi;
}

export function getIsEditing(
  chatContents: (Omit<ChatContent, "config"> & {
    isDeployed: boolean;
    config: any;
  })[]
) {
  const deployedContents = [...chatContents].filter((c) => c.isDeployed);
  const editingContents = [...chatContents].filter((c) => !c.isDeployed);

  const i =
    deployedContents.length !== editingContents.length ||
    !deployedContents.reduce((acc, curr, index) => {
      const {
        config: dConfig,
        model: dModel,
        history: dH,
        hashId: dI,
        ...dc
      } = curr;
      const {
        config: eConfig,
        model: eModel,
        history: eH,
        hashId: eI,
        ...ec
      } = editingContents[index];

      return (
        acc &&
        compareObjects(dConfig, eConfig) &&
        compareObjects(dModel, eModel) &&
        compareObjects(dc, ec)
      );
    }, true);
  return i;
}
