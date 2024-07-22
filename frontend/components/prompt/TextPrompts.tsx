"use client";

import TextPrompt from "./TextPrompt";
import callApi from "@/util/callApi";
import { Fragment, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import List from "@/components/List";
import {
  TextPromptBookmark,
  TextPromptBookmarksGetResponse,
} from "gpinterface-shared/type/textPrompt";
import Link from "next/link";

export default function TextPrompts() {
  const [textPrompts, setTextPrompts] = useState<TextPromptBookmark[]>([]);
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const router = useRouter();
  const callTextBookmarksApi = useCallback(async () => {
    const response = await callApi<TextPromptBookmarksGetResponse>({
      endpoint: `/text/prompt/bookmarks?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      if (response.textPrompts.length > 0) {
        setTextPrompts((prev) => [...prev, ...response.textPrompts]);
      } else {
        setSpinnerHidden(true);
      }
    } else {
      router.push("/");
    }
  }, [lastHashId, router]);

  return (
    <List
      callApi={callTextBookmarksApi}
      emptyMessage="No bookmarked text prompt"
      elements={textPrompts}
      spinnerHidden={spinnerHidden}
      useLastHashId={[lastHashId, setLastHashId]}
    >
      {textPrompts.map((p) => (
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
          <TextPrompt textPrompt={p.textPrompt} />
        </Fragment>
      ))}
    </List>
  );
}
