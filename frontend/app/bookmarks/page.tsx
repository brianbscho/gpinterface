"use client";

import callApi from "@/util/callApi";
import { Suspense, useCallback, useMemo, useState } from "react";
import { Post as PostType } from "gpinterface-shared/type";
import { useRouter, useSearchParams } from "next/navigation";
import List from "@/components/List";
import Post from "@/components/post/Post";
import { BookmarksGetResponse } from "gpinterface-shared/type/bookmark";
import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { FileText, SquareTerminal } from "lucide-react";
import RunTextPrompt from "@/components/prompt/RunTextPrompt";
import Footer from "@/components/post/Footer";
import RunImagePrompt from "@/components/prompt/RunImagePrompt";

type BookmarkType = { hashId: string; post: PostType };
function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);
  const searchParams = useSearchParams();
  const queryType = useMemo(
    () => searchParams.get("type") ?? "",
    [searchParams]
  );

  const setPost = useCallback(
    (i: number) => (p: PostType) =>
      setBookmarks((prev) => {
        if (!prev) return prev;

        const newPosts = [...prev];
        newPosts[i].post = p;
        return newPosts;
      }),
    []
  );

  const router = useRouter();
  const callPostsApi = useCallback(async () => {
    const response = await callApi<BookmarksGetResponse>({
      endpoint: `/bookmarks?lastHashId=${lastHashId}&type=${queryType}`,
      showError: true,
    });
    if (response) {
      if (response.bookmarks.length > 0) {
        setBookmarks((prev) => [...(prev ?? []), ...response.bookmarks]);
      } else {
        setSpinnerHidden(true);
      }
    } else {
      router.push("/");
    }
  }, [lastHashId, queryType, router]);
  const onValueChange = useCallback(
    (v: string) => {
      router.push(`/bookmarks?type=${v}`);
      setLastHashId("");
      setBookmarks(undefined);
    },
    [router]
  );

  return (
    <div className="w-full max-w-7xl px-3">
      <div className="flex items-center gap-3 my-3">
        <div className="text-lg font-bold">Bookmarks</div>
        <Tabs value={queryType} onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="post">
              <FileText className="mr-1" />
              Post
            </TabsTrigger>
            <TabsTrigger value="prompt">
              <SquareTerminal className="mr-1" />
              Prompt
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <List
        callApi={callPostsApi}
        emptyMessage="No Posts"
        elements={bookmarks}
        spinnerHidden={spinnerHidden}
        useLastHashId={[lastHashId, setLastHashId]}
      >
        {bookmarks?.map((b, i) =>
          queryType === "prompt" ? (
            <div key={b.hashId} className="border-b mb-24">
              <div className="font-bold">
                {b.post.textPrompts.length > 0
                  ? "Text"
                  : b.post.imagePrompts.length > 0
                  ? "Image"
                  : ""}
              </div>
              <Card>
                <CardContent className="p-3 overflow-x-auto">
                  {b.post.textPrompts.length > 0 ? (
                    <RunTextPrompt
                      textPrompt={b.post.textPrompts[0]}
                      showDetail
                      showDefault
                    />
                  ) : b.post.imagePrompts.length > 0 ? (
                    <RunImagePrompt
                      imagePrompt={b.post.imagePrompts[0]}
                      showDetail
                      showDefault
                    />
                  ) : null}
                </CardContent>
              </Card>
              <Footer post={b.post} setPost={setPost(i)} />
            </div>
          ) : (
            <Post key={b.hashId} post={b.post} setPost={setPost(i)} />
          )
        )}
      </List>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Bookmarks />
    </Suspense>
  );
}
