"use client";

import Post from "../../../components/post/Post";
import callApi from "@/utils/callApi";
import { useCallback, useState } from "react";
import { Post as PostType } from "gpinterface-shared/type";
import { PostsGetResponse } from "gpinterface-shared/type/post";
import { useRouter } from "next/navigation";
import List from "@/components/List";

export default function Posts({ baseUrl }: { baseUrl: string }) {
  const [posts, setPosts] = useState<PostType[]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const setPost = useCallback(
    (i: number) => (p: PostType) =>
      setPosts((prev) => {
        if (!prev) return prev;

        const newPosts = [...prev];
        newPosts[i] = p;
        return newPosts;
      }),
    []
  );

  const router = useRouter();
  const callPostsApi = useCallback(async () => {
    const response = await callApi<PostsGetResponse>({
      endpoint: `${baseUrl}?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      if (response.posts.length > 0) {
        setPosts((prev) => [...(prev ?? []), ...response.posts]);
      } else {
        setSpinnerHidden(true);
      }
    } else {
      router.push("/");
    }
  }, [baseUrl, lastHashId, router]);

  return (
    <List
      callApi={callPostsApi}
      emptyMessage="No Posts"
      elements={posts}
      spinnerHidden={spinnerHidden}
      useLastHashId={[lastHashId, setLastHashId]}
    >
      {posts?.map((t, i) => (
        <Post key={t.hashId} post={t} setPost={setPost(i)} />
      ))}
    </List>
  );
}
