import callApi from "@/utils/callApi";
import { Metadata } from "next";
import User from "./user";
import { cache } from "react";
import { UserGetResponse } from "gpinterface-shared/type/user";

const getUser = cache(async (hashId: string) => {
  const response = await callApi<UserGetResponse>({
    endpoint: `/user/${hashId}`,
  });
  return response;
});

export async function generateMetadata({
  params,
}: {
  params: { hashId: string };
}): Promise<Metadata> {
  const { hashId } = params;
  const response = await getUser(hashId);
  if (response) {
    return { title: `gpinterface - ${response.user.name}` };
  }
  return { title: "gpinterface" };
}

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  return <User hashId={hashId} />;
}
