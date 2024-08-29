"use client";

import callApi from "@/utils/callApi";
import { useCallback, useEffect, useState } from "react";
import { GpisGetResponse } from "gpinterface-shared/type/gpi";
import List from "../List";
import Gpi, { TestDataType } from "./Gpi";
import useProviderTypes from "@/hooks/useProviderTypes";
import {
  Badge,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
} from "../ui";
import IconTextButton from "../buttons/IconTextButton";
import { Loader2, X } from "lucide-react";

type TestDialogProps = {
  useTestData: [TestDataType, (testData: TestDataType) => void];
  useTestOpen: [boolean, (open: boolean) => void];
};
function TestDialog({ useTestData, useTestOpen }: TestDialogProps) {
  const [testData, setTestData] = useTestData;
  const [open, setOpen] = useTestOpen;
  useEffect(() => {
    if (!open) {
      setTestData(undefined);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-7xl w-11/12">
        <DialogDescription className="w-full whitespace-pre-wrap text-neutral-400 text-xs md:text-base">
          <div className="w-full h-[70vh] overflow-y-auto">
            <div className="mt-3">
              <div className="text-foreground text-xl">Response</div>
              {!testData ? (
                <Loader2 className="animate-spin mx-auto mt-3 h-7 w-7" />
              ) : (
                <div className="mt-3 w-full whitespace-pre-wrap">
                  {testData.content.replace(/\\n/g, "\n")}
                </div>
              )}
            </div>
            <div className="text-foreground text-xl mt-12">Request</div>
            {!testData ? (
              <Loader2 className="animate-spin mx-auto mt-3 h-7 w-7" />
            ) : (
              <div className="flex flex-col md:flex-row gap-3 items-start">
                <div>
                  <div className="text-foreground font-bold mt-3">
                    1. Chat completion
                  </div>
                  <div>
                    {`curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/chat/completion \\`}
                  </div>
                  <div>
                    {`\t-H "Authorization: Bearer `}
                    <span className="italic bold text-foreground">
                      {"{API_KEY}"}
                    </span>
                    &quot; \
                  </div>
                  <div>{`\t-H "Content-Type: application/json" \\`}</div>
                  <div>{`\t-d '${JSON.stringify({
                    gpiHashId: testData.gpiHashId,
                    content: testData.userContent,
                  })
                    .replace(":", ": ")
                    .replace(",", ", ")}'`}</div>
                </div>
                <Badge className="self-center">OR</Badge>
                <div>
                  <div className="text-foreground font-bold mt-3">
                    2. Session completion
                  </div>
                  <div>
                    {`curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session/completion \\`}
                  </div>
                  <div>
                    {`\t-H "Authorization: Bearer `}
                    <span className="italic bold text-foreground">
                      {"{API_KEY}"}
                    </span>
                    &quot; \
                  </div>
                  <div>{`\t-H "Content-Type: application/json" \\`}</div>
                  <div>{`\t-d '${JSON.stringify({
                    sessionHashId: testData.sessionHashId,
                    content: testData.userContent,
                  })
                    .replace(":", ": ")
                    .replace(",", ", ")}'`}</div>
                </div>
              </div>
            )}
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

  const [testData, setTestData] = useState<TestDataType>();
  const [testOpen, setTestOpen] = useState(false);

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
                setTestData={setTestData}
                setTestOpen={setTestOpen}
              />
            ))}
          </List>
        </div>
      </div>
      <TestDialog
        useTestData={[testData, setTestData]}
        useTestOpen={[testOpen, setTestOpen]}
      />
    </div>
  );
}
