"use client";

import useUserStore from "@/store/user";
import callApi from "@/util/callApi";
import {
  BookmarkFilledIcon,
  BookmarkIcon,
  HeartFilledIcon,
  HeartIcon,
} from "@radix-ui/react-icons";
import { Button, Separator, Tooltip } from "@radix-ui/themes";
import { Post as PostType } from "gpinterface-shared/type";
import { useCallback, useState } from "react";
import Login from "@/components/general/dialogs/Login";
import TextPrompt from "./TextPrompt";
import {
  LikeUpdateResponse,
  LikeUpdateSchema,
} from "gpinterface-shared/type/like";
import {
  BookmarkUpdateResponse,
  BookmarkUpdateSchema,
} from "gpinterface-shared/type/bookmark";
import { Static } from "@sinclair/typebox";
import Link from "@/components/general/links/Link";
import {
  PostCopySchema,
  PostCreateResponse,
} from "gpinterface-shared/type/post";
import ImagePrompt from "./ImagePrompt";

export default function Post({
  post,
  setPost,
}: {
  post: PostType;
  setPost: (p: PostType) => void;
}) {
  const { user } = useUserStore();
  const [loginOpen, setLoginOpen] = useState(false);

  const onClickLike = useCallback(async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    const response = await callApi<
      LikeUpdateResponse,
      Static<typeof LikeUpdateSchema>
    >({
      endpoint: "/like",
      method: "PUT",
      body: { postHashId: post.hashId, isLiked: !post.isLiked },
      showError: true,
    });
    setPost({ ...post, ...response });
  }, [user, post, setPost]);
  const onClickBookmark = useCallback(async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    const response = await callApi<
      BookmarkUpdateResponse,
      Static<typeof BookmarkUpdateSchema>
    >({
      endpoint: "/bookmark",
      method: "PUT",
      body: { postHashId: post.hashId, isBookmarked: !post.isBookmarked },
      showError: true,
    });
    setPost({ ...post, ...response });
  }, [user, post, setPost]);
  const [copyText, setCopyText] = useState("Make private copy");
  const onClickCopy = useCallback(async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    const response = await callApi<
      PostCreateResponse,
      Static<typeof PostCopySchema>
    >({
      method: "POST",
      endpoint: "/post/copy",
      body: { hashId: post.hashId },
      showError: true,
    });
    if (response) {
      setCopyText("copied!");
      setTimeout(() => {
        setCopyText("Make private copy");
      }, 1000);
    }
  }, [user, post.hashId]);

  return (
    <div className="py-1 border-b">
      <div className="py-12 whitespace-pre-line">{post.post}</div>
      {post.textPrompts
        .filter((t) => t.examples.length > 0)
        .map((t) => (
          <div key={t.hashId} className="pl-12 mt-3">
            <TextPrompt textPrompt={t} />
          </div>
        ))}
      {post.imagePrompts.map((i) => (
        <div key={i.hashId} className="pl-12 mt-3">
          <ImagePrompt imagePrompt={i} />
        </div>
      ))}
      <div className="py-1 flex gap-3 justify-end items-center text-sm">
        <div>
          {post.user && post.user.hashId === user?.hashId && (
            <Button size="1" asChild>
              <Link href={`/post/edit/${post.hashId}`}>edit</Link>
            </Button>
          )}
        </div>
        {(post.textPrompts.length > 0 || post.imagePrompts.length > 0) && (
          <div>
            <Tooltip content="Make a private copy to edit it" delayDuration={0}>
              <Button size="1" onClick={onClickCopy}>
                {copyText}
              </Button>
            </Tooltip>
          </div>
        )}
        <div
          className="flex gap-3 cursor-pointer items-center"
          onClick={onClickBookmark}
        >
          {post.isBookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
        </div>
        <div
          className="flex gap-3 cursor-pointer items-center"
          onClick={onClickLike}
        >
          {post.isLiked ? <HeartFilledIcon /> : <HeartIcon />}
          <div>{post.likes} likes</div>
        </div>
        <Separator orientation="vertical" />
        <div className="font-bold">
          {post.user ? (
            <Link href={`/user/${post.user.hashId}`}>{post.user.name}</Link>
          ) : (
            <div>unknown</div>
          )}
        </div>
        <Separator orientation="vertical" />
        <div>{post.createdAt}</div>
      </div>
      <Login open={loginOpen} onClickLogin={() => setLoginOpen(false)} />
    </div>
  );
}
