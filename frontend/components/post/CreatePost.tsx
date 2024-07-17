"use client";

import callApi from "@/util/callApi";
import { Button } from "@radix-ui/themes";
import { Thread } from "gpinterface-shared/type";
import { useCallback, useState } from "react";
import {
  PostCreateResponse,
  PostCreateSchema,
} from "gpinterface-shared/type/post";
import { Static } from "@sinclair/typebox";
import CreateTextPrompt from "../prompt/CreateTextPrompt";
import useLinkConfirmMessage from "@/hooks/useLinkConfirmMessage";
import Radio, { modals } from "../general/inputs/Radio";
import { TextPromptSchema } from "gpinterface-shared/type/textPrompt";
import CreateImagePrompt from "../prompt/CreateImagePrompt";
import { ImagePromptSchema } from "gpinterface-shared/type/imagePrompt";

export default function CreatePost({ thread }: { thread: Thread }) {
  const [post, setPost] = useState("");
  const [provider, setProvider] = useState(modals[0]);

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
        setLoading(false);

        if (response) {
          location.reload();
        }
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
        <textarea
          className="w-full focus:outline-none border rounded p-1 resize-none h-80"
          value={post}
          onChange={(e) => setPost(e.currentTarget.value)}
          placeholder="contents of the post"
          disabled={loading}
        />
      </div>
      <Radio.Provider useProvider={[provider, setProvider]} loading={loading} />
      {provider === modals[0] && (
        <div className="flex justify-end">
          <div>
            <Button onClick={onClickCreate} loading={loading}>
              Create Post
            </Button>
          </div>
        </div>
      )}
      {provider === modals[1] && (
        <CreateTextPrompt
          callCreate={onClickTextPromptCreate}
          useLoading={[loading, setLoading]}
        />
      )}
      {provider === modals[2] && (
        <CreateImagePrompt
          callCreate={onClickImagePromptCreate}
          useLoading={[loading, setLoading]}
        />
      )}
    </div>
  );
}
