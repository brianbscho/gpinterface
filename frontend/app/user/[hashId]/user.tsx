"use client";

import Threads from "@/components/thread/Threads";
import useUserStore from "@/store/user";
import callApi from "@/util/callApi";
import { useEffect, useMemo, useState } from "react";
import { UserInfo } from "gpinterface-shared/type";
import { UserGetResponse } from "gpinterface-shared/type/user";
import { useRouter } from "next/navigation";
import TextPrompts from "@/components/prompt/TextPrompts";
import ImagePrompts from "@/components/prompt/ImagePrompts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

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
      <Tabs defaultValue="thread">
        <TabsList>
          <TabsTrigger value="thread">Threads</TabsTrigger>
          <TabsTrigger value="post">Posts</TabsTrigger>
          <TabsTrigger value="bookmark">Bookmarks</TabsTrigger>
          <TabsTrigger value="prompts">Bookmarked Prompts</TabsTrigger>
        </TabsList>
        <TabsContent value="thread">
          <Threads baseUrl={`/threads/user/${hashId}?type=thread`} />
        </TabsContent>
        <TabsContent value="post">
          <Threads baseUrl={`/threads/user/${hashId}?type=post`} />
        </TabsContent>
        <TabsContent value="bookmark">
          <Threads baseUrl={`/threads/user/${hashId}?type=bookmark`} />
        </TabsContent>
        <TabsContent value="prompts">
          <Tabs defaultValue="text">
            <TabsList>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <TextPrompts />
            </TabsContent>
            <TabsContent value="image">
              <ImagePrompts />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
