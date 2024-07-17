import callApi from "@/util/callApi";
import { Metadata } from "next";
import Thread from "./Thread";
import { cache } from "react";
import { ThreadGetResponse } from "gpinterface-shared/type/thread";

const getThread = cache(async (hashId: string) => {
  const response = await callApi<ThreadGetResponse>({
    endpoint: `/thread/${hashId}`,
  });
  return response;
});

export async function generateMetadata({
  params,
}: {
  params: { hashId: string };
}): Promise<Metadata> {
  const { hashId } = params;
  const response = await getThread(hashId);
  if (response) {
    return { title: `GPInterface - ${response.thread.title}` };
  }
  return { title: "GPInterface" };
}

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;

  return <Thread hashId={hashId} />;
}
