"use client";

import Post from "./Post";
import callApi from "@/util/callApi";
import { useCallback, useState } from "react";
import { Post as PostType } from "gpinterface-shared/type";
import { PostsGetResponse } from "gpinterface-shared/type/post";
import { useRouter } from "next/navigation";
import List from "@/components/List";

export default function Posts({
  isPublic,
  baseUrl,
}: {
  isPublic: boolean;
  baseUrl: string;
}) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const setPost = useCallback(
    (i: number) => (p: PostType) =>
      setPosts((prev) => {
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
        setPosts((prev) => [...prev, ...response.posts]);
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
      {posts.map((t, i) => (
        <Post
          key={t.hashId}
          isPublic={isPublic}
          post={t}
          setPost={setPost(i)}
        />
      ))}
    </List>
  );
}
