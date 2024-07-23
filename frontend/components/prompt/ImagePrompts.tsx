"use client";

import ImagePrompt from "./ImagePrompt";
import callApi from "@/util/callApi";
import { Fragment, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import List from "@/components/List";
import {
  ImagePromptBookmark,
  ImagePromptBookmarksGetResponse,
} from "gpinterface-shared/type/imagePrompt";
import Link from "next/link";

export default function ImagePrompts() {
  const [imagePrompts, setImagePrompts] = useState<ImagePromptBookmark[]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const router = useRouter();
  const callImageBookmarksApi = useCallback(async () => {
    const response = await callApi<ImagePromptBookmarksGetResponse>({
      endpoint: `/image/prompt/bookmarks?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      if (response.imagePrompts.length > 0) {
        setImagePrompts((prev) => [...(prev ?? []), ...response.imagePrompts]);
      } else {
        setSpinnerHidden(true);
      }
    } else {
      router.push("/");
    }
  }, [lastHashId, router]);

  return (
    <List
      callApi={callImageBookmarksApi}
      emptyMessage="No bookmarked image prompt"
      elements={imagePrompts}
      spinnerHidden={spinnerHidden}
      useLastHashId={[lastHashId, setLastHashId]}
    >
      {imagePrompts?.map((p) => (
        <Fragment key={p.hashId}>
          <div className="font-bold text-sm mt-3 border-t">
            {p.post.user ? (
              <Link href={`/user/${p.post.user.hashId}`}>
                {p.post.user.name}
              </Link>
            ) : (
              <div>unknown</div>
            )}
          </div>
          <ImagePrompt imagePrompt={p.imagePrompt} />
        </Fragment>
      ))}
    </List>
  );
}
