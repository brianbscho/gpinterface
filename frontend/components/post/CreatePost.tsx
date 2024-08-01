"use client";

import callApi from "@/util/callApi";
import { Thread } from "gpinterface-shared/type";
import { useCallback, useState } from "react";
import {
  PostCreateResponse,
  PostCreateSchema,
} from "gpinterface-shared/type/post";
import { Static } from "@sinclair/typebox";
import CreateTextPrompt from "../prompt/CreateTextPrompt";
import useLinkConfirmMessage from "@/hooks/useLinkConfirmMessage";
import { modals } from "../general/inputs/Radio";
import { TextPromptSchema } from "gpinterface-shared/type/textPrompt";
import CreateImagePrompt from "../prompt/CreateImagePrompt";
import { ImagePromptSchema } from "gpinterface-shared/type/imagePrompt";
import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "../ui";
import Footer from "../prompt/Footer";

export default function CreatePost({ thread }: { thread: Thread }) {
  const [post, setPost] = useState("");
  const [modal, setModal] = useState(modals[0]);

  const [loading, setLoading] = useState(false);
  const getOnClick = useCallback(
    function <T extends any[]>(
      callApi: (...args: T) => Promise<{ hashId: string } | undefined>
    ): (...args: T) => Promise<{ hashId: string } | undefined> {
      return async (...args: T): Promise<{ hashId: string } | undefined> => {
        if (post.trim().length === 0) {
          alert("Please write a post");
          return;
        }

        setLoading(true);
        const response = await callApi(...args);

        if (response) {
          location.reload();
        }
        setLoading(false);
      };
    },
    [post]
  );

  const callPostCreate = useCallback(async () => {
    const response = await callApi<
      PostCreateResponse,
      Static<typeof PostCreateSchema>
    >({
      endpoint: "/post",
      method: "POST",
      body: {
        post,
        textPrompts: [],
        imagePrompts: [],
        threadHashId: thread.hashId,
      },
      showError: true,
    });
    return response;
  }, [post, thread.hashId]);
  const callTextPromptPostCreate = useCallback(
    async (textPrompt: Static<typeof TextPromptSchema>) => {
      const response = await callApi<
        PostCreateResponse,
        Static<typeof PostCreateSchema>
      >({
        endpoint: "/post",
        method: "POST",
        body: {
          post,
          textPrompts: [textPrompt],
          imagePrompts: [],
          threadHashId: thread.hashId,
        },
        showError: true,
      });
      return response;
    },
    [post, thread.hashId]
  );
  const callImagePromptPostCreate = useCallback(
    async (imagePrompt: Static<typeof ImagePromptSchema>) => {
      const response = await callApi<
        PostCreateResponse,
        Static<typeof PostCreateSchema>
      >({
        endpoint: "/post",
        method: "POST",
        body: {
          post,
          textPrompts: [],
          imagePrompts: [imagePrompt],
          threadHashId: thread.hashId,
        },
        showError: true,
      });
      return response;
    },
    [post, thread.hashId]
  );
  const onClickCreate = getOnClick(callPostCreate);
  const onClickTextPromptCreate = getOnClick(callTextPromptPostCreate);
  const onClickImagePromptCreate = getOnClick(callImagePromptPostCreate);

  useLinkConfirmMessage(post.length > 0);

  return (
    <div className="w-full max-w-7xl px-3 flex flex-col gap-7 py-7">
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
                useIsPublic={[thread.isPublic, () => {}, false]}
                onClickCreate={onClickCreate}
                loading={loading}
              />
            </TabsContent>
            <TabsContent value={modals[1]}>
              <CreateTextPrompt
                useIsPublic={[thread.isPublic, () => {}]}
                callCreate={onClickTextPromptCreate}
                useLoading={[loading, setLoading]}
              />
            </TabsContent>
            <TabsContent value={modals[2]}>
              <CreateImagePrompt
                useIsPublic={[thread.isPublic, () => {}]}
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
