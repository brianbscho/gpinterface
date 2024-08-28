"use client";

import callApi from "@/utils/callApi";
import { useCallback, useState } from "react";
import { GpisGetResponse } from "gpinterface-shared/type/gpi";
import List from "../List";
import Gpi from "./Gpi";
import useProviderTypes from "@/hooks/useProviderTypes";
import { Dialog, DialogClose, DialogContent, DialogDescription } from "../ui";
import IconTextButton from "../buttons/IconTextButton";
import { Loader2, X } from "lucide-react";

type TextBodyType = { [key: string]: string };
type TestDialogProps = {
  useTestBody: [TextBodyType, (testBody: TextBodyType) => void];
  useTestResponse: [string, (testResponse: string) => void];
};
function TestDialog({ useTestBody, useTestResponse }: TestDialogProps) {
  const [testBody, setTestBody] = useTestBody;
  const [testResponse, setTestResponse] = useTestResponse;
  return (
    <Dialog
      open={Object.keys(testBody).length > 0}
      onOpenChange={(open) => {
        if (!open) {
          setTestBody({});
          setTestResponse("");
        }
      }}
    >
      <DialogContent className="max-w-3xl w-11/12">
        <DialogDescription className="whitespace-pre-wrap text-neutral-400 text-xs md:text-base">
          <div className="w-full h-[70vh] overflow-y-auto">
            <div className="text-foreground text-base">Request</div>
            <div className="mt-3">
              {`curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/chat/completion \\`}
            </div>
            <div>
              {`\t-H "Authorization: Bearer `}
              <span className="italic bold text-foreground">{"{API_KEY}"}</span>
              &quot; \
            </div>
            <div>{`\t-H "Content-Type: application/json" \\`}</div>
            <div>{`\t-d '${JSON.stringify(testBody)
              .replace(":", ": ")
              .replace(",", ", ")}'`}</div>
            <div className="mt-7">
              <div className="text-foreground text-base">Response</div>
              {testResponse === "" ? (
                <Loader2 className="animate-spin mx-auto mt-3" />
              ) : (
                <div className="mt-3 whitespace-pre-wrap">
                  {testResponse.replace(/\\n/g, "\n")}
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 w-full flex justify-end gap-3">
            <DialogClose asChild>
              <IconTextButton
                Icon={X}
                text="Close"
                className="w-20 md:w-24"
                responsive
              />
            </DialogClose>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export default function Gpis() {
  const [gpis, setGpis] = useState<GpisGetResponse["gpis"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callGpisApi = useCallback(async () => {
    const response = await callApi<GpisGetResponse>({
      endpoint: `/gpis?lastHashId=${lastHashId}`,
    });
    if (response) {
      setGpis((prev) => [...(prev ?? []), ...response.gpis]);
      if (response.gpis.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  useProviderTypes();

  const [testBody, setTestBody] = useState<{ [key: string]: string }>({});
  const [testResponse, setTestResponse] = useState("");

  return (
    <div className="w-full h-full overflow-hidden relative">
      <div className="h-full w-full overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 p-3">
          <List
            callApi={callGpisApi}
            emptyMessage="Start your chat!"
            elements={gpis}
            spinnerHidden={spinnerHidden}
            useLastHashId={[lastHashId, setLastHashId]}
          >
            {gpis?.map((gpi) => (
              <Gpi
                key={gpi.hashId}
                gpi={gpi}
                setTestBody={setTestBody}
                setTestResponse={setTestResponse}
              />
            ))}
          </List>
        </div>
      </div>
      <TestDialog
        useTestBody={[testBody, setTestBody]}
        useTestResponse={[testResponse, setTestResponse]}
      />
    </div>
  );
}
