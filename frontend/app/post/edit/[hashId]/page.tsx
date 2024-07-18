"use client";

import callApi from "@/util/callApi";
import { Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ThreadCreateResponse,
  ThreadUpdateSchema,
} from "gpinterface-shared/type/thread";
import { Static } from "@sinclair/typebox";
import {
  PostCreateResponse,
  PostGetResponse,
  PostUpdateSchema,
} from "gpinterface-shared/type/post";
import CreateTextPrompt from "@/components/prompt/CreateTextPrompt";
import useLinkConfirmMessage from "@/hooks/useLinkConfirmMessage";
import {
  TextPromptDeleteSchema,
  TextPromptSchema,
  TextPromptUpdateResponse,
  TextPromptUpdateSchema,
} from "gpinterface-shared/type/textPrompt";
import Radio, { modals } from "@/components/general/inputs/Radio";
import CreateImagePrompt from "@/components/prompt/CreateImagePrompt";
import {
  ImagePromptSchema,
  ImagePromptUpdateResponse,
  ImagePromptUpdateSchema,
} from "gpinterface-shared/type/imagePrompt";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  const [title, setTitle] = useState("");
  const [post, setPost] = useState("");
  const [modal, setModal] = useState(modals[0]);

  const router = useRouter();
  const [responsePost, setResponsePost] = useState<PostGetResponse>();
  useEffect(() => {
    const callPostApi = async () => {
      const response = await callApi<PostGetResponse>({
        endpoint: `/post/${hashId}`,
        showError: true,
      });
      if (response) {
        setResponsePost(response);
      } else {
        router.push("/");
      }
    };
    callPostApi();
  }, [hashId, router]);
  useEffect(() => {
    if (!responsePost) return;

    setTitle(responsePost.thread.title);
    setPost(responsePost.post.post);
  }, [responsePost]);

  const [loading, setLoading] = useState(false);
  const getOnClick = useCallback(
    function <T extends any[]>(
      callApi: (...args: T) => Promise<{ hashId: string } | undefined>
    ): (...args: T) => Promise<{ hashId: string } | undefined> {
      return async (...args: T): Promise<{ hashId: string } | undefined> => {
        if (!responsePost) {
          return;
        } else if (title.trim().length === 0) {
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
    [responsePost, title, post, router]
  );

  const callPostSave = useCallback(async () => {
    if (!responsePost) return;
    const responds = await Promise.all([
      callApi<ThreadCreateResponse, Static<typeof ThreadUpdateSchema>>({
        endpoint: "/thread",
        method: "PUT",
        body: { hashId: responsePost.thread.hashId, title },
        showError: true,
      }),
      callApi<PostCreateResponse, Static<typeof PostUpdateSchema>>({
        endpoint: "/post",
        method: "PUT",
        body: { hashId: responsePost.post.hashId, post },
        showError: true,
      }),
      responsePost.post.textPrompts.length > 0
        ? callApi<
            TextPromptUpdateResponse,
            Static<typeof TextPromptDeleteSchema>
          >({
            endpoint: "/text/prompt",
            method: "DELETE",
            body: { hashId: responsePost.post.textPrompts[0].hashId },
          })
        : null,
    ]);
    return responds[0];
  }, [responsePost, title, post]);
  const callTextPromptPostSave = useCallback(
    async (textPrompt: Static<typeof TextPromptSchema>) => {
      if (!responsePost) return;
      const responds = await Promise.all([
        callApi<ThreadCreateResponse, Static<typeof ThreadUpdateSchema>>({
          endpoint: "/thread",
          method: "PUT",
          body: { hashId: responsePost.thread.hashId, title },
          showError: true,
        }),
        callApi<PostCreateResponse, Static<typeof PostUpdateSchema>>({
          endpoint: "/post",
          method: "PUT",
          body: { hashId: responsePost.post.hashId, post },
          showError: true,
        }),
        callApi<
          TextPromptUpdateResponse,
          Static<typeof TextPromptUpdateSchema>
        >({
          endpoint: "/text/prompt",
          method: "PUT",
          body: {
            postHashId: responsePost.post.hashId,
            hashId: responsePost.post.textPrompts[0]?.hashId,
            ...textPrompt,
          },
        }),
      ]);
      setLoading(false);
      return responds[0];
    },
    [responsePost, title, post]
  );
  const callImagePromptPostSave = useCallback(
    async (imagePrompt: Static<typeof ImagePromptSchema>) => {
      if (!responsePost) return;
      const responds = await Promise.all([
        callApi<ThreadCreateResponse, Static<typeof ThreadUpdateSchema>>({
          endpoint: "/thread",
          method: "PUT",
          body: { hashId: responsePost.thread.hashId, title },
          showError: true,
        }),
        callApi<PostCreateResponse, Static<typeof PostUpdateSchema>>({
          endpoint: "/post",
          method: "PUT",
          body: { hashId: responsePost.post.hashId, post },
          showError: true,
        }),
        callApi<
          ImagePromptUpdateResponse,
          Static<typeof ImagePromptUpdateSchema>
        >({
          endpoint: "/image/prompt",
          method: "PUT",
          body: {
            postHashId: responsePost.post.hashId,
            hashId: responsePost.post.imagePrompts[0]?.hashId,
            ...imagePrompt,
          },
        }),
      ]);
      setLoading(false);
      return responds[0];
    },
    [responsePost, title, post]
  );
  const onClickSave = getOnClick(callPostSave);
  const onClickTextPromptSave = getOnClick(callTextPromptPostSave);
  const onClickImagePromptSave = getOnClick(callImagePromptPostSave);

  useLinkConfirmMessage(title.length > 0 || post.length > 0);

  if (!responsePost) return null;
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
      <Radio.Provider useProvider={[modal, setModal]} loading={loading} />
      {modal === modals[0] && (
        <div className="flex justify-end pb-3">
          <div>
            <Button onClick={onClickSave} loading={loading}>
              Save
            </Button>
          </div>
        </div>
      )}
      {modal === modals[1] && (
        <CreateTextPrompt
          callCreate={onClickTextPromptSave}
          useLoading={[loading, setLoading]}
          responsePost={responsePost}
        />
      )}
      {modal === modals[2] && (
        <CreateImagePrompt
          callCreate={onClickImagePromptSave}
          useLoading={[loading, setLoading]}
          responsePost={responsePost}
        />
      )}
    </div>
  );
}
