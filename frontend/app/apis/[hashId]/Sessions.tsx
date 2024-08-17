"use client";

import callApi from "@/utils/callApi";
import { useCallback, useState } from "react";
import List from "@/components/List";
import { ApiSessionsGetResponse } from "gpinterface-shared/type/api";
import {
  Badge,
  CardContent,
  CardDescription,
  Dialog,
  DialogContent,
} from "@/components/ui";

export default function Sessions({ apiHashId }: { apiHashId: string }) {
  const [sessions, setSessions] =
    useState<ApiSessionsGetResponse["sessions"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callSessionsApi = useCallback(async () => {
    const response = await callApi<ApiSessionsGetResponse>({
      endpoint: `/api/${apiHashId}/sessions?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      setSessions((prev) => [...(prev ?? []), ...response.sessions]);
      if (response.sessions.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [apiHashId, lastHashId]);

  const [messages, setMessages] = useState<
    ApiSessionsGetResponse["sessions"][0]["messages"]
  >([]);

  return (
    <div className="w-full h-full overflow-y-auto">
      <List
        callApi={callSessionsApi}
        emptyMessage="No Sessions yet"
        elements={sessions}
        spinnerHidden={spinnerHidden}
        useLastHashId={[lastHashId, setLastHashId]}
      >
        {sessions?.map((session) => (
          <div
            key={session.hashId}
            className="w-full p-3 border-b cursor-pointer"
            onClick={() => setMessages(session.messages)}
          >
            <div className="text-xs mb-3">{session.createdAt}</div>
            {session.messages.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <Badge className="mb-1">
                    {session.messages[session.messages.length - 1].role}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    View all messages
                  </div>
                </div>
                <div className="truncate text-sm">
                  {session.messages[session.messages.length - 1].content}
                </div>
              </>
            )}
          </div>
        ))}
      </List>
      <Dialog
        open={messages.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setMessages([]);
          }
        }}
      >
        <DialogContent close className="w-11/12 max-w-4xl">
          <div className="h-[70vh] w-full overflow-y-auto mt-7 mb-3">
            {messages.map((content) => (
              <CardContent key={content.hashId} className="p-3">
                <Badge className="mb-3">{content.role}</Badge>
                <CardDescription>
                  <div className="relative">
                    <div className="whitespace-pre-wrap px-3 py-2 text-sm border rounded-md">
                      {content.content}
                    </div>
                  </div>
                </CardDescription>
              </CardContent>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
