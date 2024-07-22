"use client";

import Threads from "@/components/thread/Threads";
import useUserStore from "@/store/user";
import callApi from "@/util/callApi";
import { useEffect, useMemo, useState } from "react";
import { UserInfo } from "gpinterface-shared/type";
import { UserGetResponse } from "gpinterface-shared/type/user";
import { Tabs } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import TextPrompts from "@/components/prompt/TextPrompts";
import ImagePrompts from "@/components/prompt/ImagePrompts";

export default function User({ hashId }: { hashId: string }) {
  const router = useRouter();
  const [pageUser, setPageUser] = useState<UserInfo>();
  useEffect(() => {
    const callUserApi = async () => {
      const response = await callApi<UserGetResponse>({
        endpoint: `/user/${hashId}`,
        showError: true,
      });
      if (response) {
        setPageUser(response.user);
      } else {
        router.push("/");
      }
    };
    callUserApi();
  }, [hashId, router]);

  const { user } = useUserStore();
  const { name, bio } = useMemo(() => {
    if (!pageUser) return { name: "", bio: "" };
    return hashId === user?.hashId ? user : pageUser;
  }, [hashId, user, pageUser]);

  return (
    <div className="w-full max-w-7xl flex flex-col gap-3 px-3">
      <div className="text-xl font-bold mt-12">{name}</div>
      <div className="text-sm">{bio}</div>
      <Tabs.Root defaultValue="thread">
        <Tabs.List>
          <Tabs.Trigger value="thread">Threads</Tabs.Trigger>
          <Tabs.Trigger value="post">Posts</Tabs.Trigger>
          <Tabs.Trigger value="bookmark">Bookmarks</Tabs.Trigger>
          <Tabs.Trigger value="prompts">Bookmarked Prompts</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="thread">
          <Threads baseUrl={`/threads/user/${hashId}?type=thread`} />
        </Tabs.Content>
        <Tabs.Content value="post">
          <Threads baseUrl={`/threads/user/${hashId}?type=post`} />
        </Tabs.Content>
        <Tabs.Content value="bookmark">
          <Threads baseUrl={`/threads/user/${hashId}?type=bookmark`} />
        </Tabs.Content>
        <Tabs.Content value="prompts">
          <Tabs.Root defaultValue="text">
            <Tabs.List>
              <Tabs.Trigger value="text">Text</Tabs.Trigger>
              <Tabs.Trigger value="image">Image</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="text">
              <TextPrompts />
            </Tabs.Content>
            <Tabs.Content value="image">
              <ImagePrompts />
            </Tabs.Content>
          </Tabs.Root>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
