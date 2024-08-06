"use client";

import useUserStore from "@/store/user";
import callApi from "@/utils/callApi";
import { Post as PostType } from "gpinterface-shared/type";
import { useCallback } from "react";
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
import UserRequiredButton from "@/components/general/buttons/UserRequiredButton";
import { Bookmark, Heart } from "lucide-react";
import { Button } from "@/components/ui";

export default function Footer({
  post,
  setPost,
}: {
  post: PostType;
  setPost: (p: PostType) => void;
}) {
  const user = useUserStore((state) => state.user);

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
    <div className="py-3 flex gap-3 items-center text-xs md:text-sm">
      <UserRequiredButton onClick={onClickBookmark}>
        <div className="cursor-pointer">
          <Bookmark fill={post.isBookmarked ? "#FFF" : "#000"} />
        </div>
      </UserRequiredButton>
      <UserRequiredButton onClick={onClickLike}>
        <div className="flex gap-1 items-center cursor-pointer">
          <Heart fill={post.isLiked ? "#FFF" : "#000"} />
          <div>{post.likes} likes</div>
        </div>
      </UserRequiredButton>
      <div className="flex-1" />
      {post.user && post.user.hashId === user?.hashId && (
        <Button asChild>
          <Link
            href={`/post/edit/${post.hashId}`}
            className="h-7 text-xs md:text-sm"
          >
            edit
          </Link>
        </Button>
      )}
      <div className="font-bold">
        {post.user ? (
          <Link href={`/user/${post.user.hashId}`}>{post.user.name}</Link>
        ) : (
          <div>unknown</div>
        )}
      </div>
      <div>{post.createdAt}</div>
    </div>
  );
}
