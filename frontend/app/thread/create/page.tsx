"use client";

import callApi from "@/util/callApi";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ThreadCreateResponse,
  ThreadCreateSchema,
} from "gpinterface-shared/type/thread";
import { Static } from "@sinclair/typebox";
import useUserStore from "@/store/user";
import CreateTextPrompt from "@/components/prompt/CreateTextPrompt";
import useLinkConfirmMessage from "@/hooks/useLinkConfirmMessage";
import { TextPromptSchema } from "gpinterface-shared/type/textPrompt";
import { modals } from "@/components/general/inputs/Radio";
import CreateImagePrompt from "@/components/prompt/CreateImagePrompt";
import { ImagePromptSchema } from "gpinterface-shared/type/imagePrompt";
import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components/ui";
import Footer from "@/components/prompt/Footer";

export default function Page() {
  const [title, setTitle] = useState("");
  const [post, setPost] = useState("");
  const [modal, setModal] = useState(modals[0]);
  const [isPublic, setIsPublic] = useState(true);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getOnClick = useCallback(
    function <T extends any[]>(
      callApi: (...args: T) => Promise<{ hashId: string } | undefined>
    ): (...args: T) => Promise<{ hashId: string } | undefined> {
      return async (...args: T): Promise<{ hashId: string } | undefined> => {
        if (title.trim().length === 0) {
          alert("Please enter a title");
          return;
        } else if (post.trim().length === 0) {
          alert("Please write a post");
          return;
        }

        setLoading(true);
        const response = await callApi(...args);

        if (response) {
          router.push(`/thread/${response.hashId}`);
        }
        setLoading(false);
      };
    },
    [title, post, router]
  );

  const callThreadCreate = useCallback(async () => {
    const response = await callApi<
      ThreadCreateResponse,
      Static<typeof ThreadCreateSchema>
    >({
      endpoint: "/thread",
      method: "POST",
      body: {
        title,
        isPublic,
        posts: [{ post, textPrompts: [], imagePrompts: [] }],
      },
      showError: true,
    });
    return response;
  }, [title, post, isPublic]);
  const callTextPromptThreadCreate = useCallback(
    async (textPrompt: Static<typeof TextPromptSchema>) => {
      const response = await callApi<
        ThreadCreateResponse,
        Static<typeof ThreadCreateSchema>
      >({
        endpoint: "/thread",
        method: "POST",
        body: {
          title,
          isPublic,
          posts: [{ post, textPrompts: [textPrompt], imagePrompts: [] }],
        },
        showError: true,
      });
      return response;
    },
    [title, post, isPublic]
  );
  const callImagePromptThreadCreate = useCallback(
    async (imagePrompt: Static<typeof ImagePromptSchema>) => {
      const response = await callApi<
        ThreadCreateResponse,
        Static<typeof ThreadCreateSchema>
      >({
        endpoint: "/thread",
        method: "POST",
        body: {
          title,
          isPublic,
          posts: [{ post, textPrompts: [], imagePrompts: [imagePrompt] }],
        },
        showError: true,
      });
      return response;
    },
    [title, post, isPublic]
  );
  const onClickCreate = getOnClick(callThreadCreate);
  const onClickTextPromptCreate = getOnClick(callTextPromptThreadCreate);
  const onClickImagePromptCreate = getOnClick(callImagePromptThreadCreate);

  const { user } = useUserStore();
  useEffect(() => {
    setIsPublic(true);
  }, [user]);

  useLinkConfirmMessage(title.length > 0 || post.length > 0);

  return (
    <div className="w-full max-w-7xl flex flex-col gap-3 p-3">
      <div className="w-full">
        <Input
          className="w-full"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="title of the thread"
        />
      </div>
      <div className="w-full">
        <Textarea
          className="w-full h-80"
          value={post}
          onChange={(e) => setPost(e.currentTarget.value)}
          placeholder="contents of the post"
        />
      </div>
      <Tabs
        defaultValue={modals[0]}
        value={modal}
        onValueChange={(v) => setModal(v)}
        className="w-full"
      >
        <TabsList className="w-full">
          {modals.map((m) => (
            <TabsTrigger key={m} value={m} className="flex-1">
              {m}
            </TabsTrigger>
          ))}
        </TabsList>
        <Card className="mt-3">
          <CardContent className="p-3">
            <TabsContent value={modals[0]}>
              <Footer
                useIsPublic={[isPublic, setIsPublic, true]}
                onClickCreate={onClickCreate}
                loading={loading}
              />
            </TabsContent>
            <TabsContent value={modals[1]}>
              <CreateTextPrompt
                useIsPublic={[isPublic, setIsPublic]}
                callCreate={onClickTextPromptCreate}
                useLoading={[loading, setLoading]}
              />
            </TabsContent>
            <TabsContent value={modals[2]}>
              <CreateImagePrompt
                useIsPublic={[isPublic, setIsPublic]}
                callCreate={onClickImagePromptCreate}
                useLoading={[loading, setLoading]}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
