"use client";

import useUserStore from "@/store/user";
import callApi from "@/util/callApi";
import { Post as PostType } from "gpinterface-shared/type";
import { useCallback } from "react";
import TextPrompt from "../../../components/prompt/TextPrompt";
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
import ImagePrompt from "../../../components/prompt/ImagePrompt";
import UserRequiredButton from "@/components/general/buttons/UserRequiredButton";
import { Bookmark, Heart } from "lucide-react";
import { Button, Separator } from "@/components/ui";

export default function Post({
  post,
  setPost,
}: {
  post: PostType;
  setPost: (p: PostType) => void;
}) {
  const { user } = useUserStore();

  const onClickLike = useCallback(async () => {
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
  }, [post, setPost]);
  const onClickBookmark = useCallback(async () => {
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
  }, [post, setPost]);

  return (
    <div className="py-1 border-b">
      <div className="py-1 flex gap-3 justify-end items-center text-sm">
        <UserRequiredButton onClick={onClickBookmark}>
          <div className="cursor-pointer">
            <Bookmark fill={post.isBookmarked ? "#FFF" : "#000"} />
          </div>
        </UserRequiredButton>
        <UserRequiredButton onClick={onClickLike}>
          <div className="flex gap-3 items-center cursor-pointer">
            <Heart fill={post.isLiked ? "#FFF" : "#000"} />
            <div>{post.likes} likes</div>
          </div>
        </UserRequiredButton>
      </div>
      <div className="mt-3 whitespace-pre-line">{post.post}</div>
      <div className="py-1 flex gap-3 justify-end items-center text-sm">
        {post.user && post.user.hashId === user?.hashId && (
          <Button asChild>
            <Link href={`/post/edit/${post.hashId}`}>edit</Link>
          </Button>
        )}
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
      {post.textPrompts.map((t) => (
        <div key={t.hashId} className="mt-3 w-full overflow-x-auto">
          <TextPrompt textPrompt={t} />
        </div>
      ))}
      {post.imagePrompts.map((i) => (
        <div key={i.hashId} className="mt-3 w-full overflow-x-auto">
          <ImagePrompt imagePrompt={i} />
        </div>
      ))}
    </div>
  );
}
