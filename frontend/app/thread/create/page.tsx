"use client";

import callApi from "@/util/callApi";
import { Button } from "@radix-ui/themes";
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
import Public from "@/components/general/checkbox/Public";
import { TextPromptSchema } from "gpinterface-shared/type/textPrompt";
import Radio, { modals } from "@/components/general/inputs/Radio";
import CreateImagePrompt from "@/components/prompt/CreateImagePrompt";
import { ImagePromptSchema } from "gpinterface-shared/type/imagePrompt";

export default function Page() {
  const [title, setTitle] = useState("");
  const [post, setPost] = useState("");
  const [provider, setProvider] = useState(modals[0]);
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

  const onClickCancel = useCallback(() => router.back(), [router]);

  return (
    <div className="w-full max-w-7xl px-3 flex flex-col gap-7 py-7">
      <div className="w-full">
        <input
          className="w-full focus:outline-none border-b p-1"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="title of the thread"
        />
      </div>
      <div className="w-full">
        <textarea
          className="w-full focus:outline-none border rounded p-1 resize-none h-80"
          value={post}
          onChange={(e) => setPost(e.currentTarget.value)}
          placeholder="contents of the post"
        />
      </div>
      <Radio.Provider useProvider={[provider, setProvider]} loading={loading} />
      {!!user && (
        <div className="flex items-center gap-3">
          <Public useIsPublic={[isPublic, setIsPublic]} />
          <div className="text-sm">
            AI content can only be edited when it is set to private; public
            content cannot be modified.
          </div>
        </div>
      )}
      {provider === modals[0] && (
        <div className="flex justify-end gap-3 pb-3">
          <div>
            <Button variant="soft" onClick={onClickCancel}>
              Cancel
            </Button>
          </div>
          <div>
            <Button onClick={onClickCreate} loading={loading}>
              Create Thread
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
