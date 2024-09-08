"use client";

import { CircleCheck, Circle, StepForward } from "lucide-react";
import { Badge, Dialog, DialogContent, DialogTrigger, Input } from "../ui";
import { FormEvent, useCallback, useState } from "react";
import callApi from "@/utils/callApi";
import { Static } from "@sinclair/typebox";
import {
  GpiCreateResponse,
  GpiDeploySchema,
} from "gpinterface-shared/type/gpi";
import { useRouter } from "next/navigation";
import { getApiConfig } from "@/utils/model";
import IconTextButton from "./IconTextButton";
import useModelStore from "@/store/model";
import { stringify } from "@/utils/string";
import ContentStatic from "../content/ContentStatic";
import { ChatContent } from "gpinterface-shared/type/chat-content";

type Props = { gpiHashId: string; chatContents: ChatContent[] };
export default function GpiDeployButton({ gpiHashId, chatContents }: Props) {
  const [open, setOpen] = useState(false);

  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState("");
  const [model, config] = useModelStore((state) => [state.model, state.config]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!model) return;
      setLoading(true);
      const response = await callApi<
        GpiCreateResponse,
        Static<typeof GpiDeploySchema>
      >({
        endpoint: `/users/gpis/${gpiHashId}/deploy`,
        method: "POST",
        body: {
          description,
          modelHashId: model.hashId,
          config: getApiConfig(model, config),
          isPublic,
        },
        showError: true,
      });

      if (response) {
        router.push("/gpis/user");
      } else {
        setLoading(false);
      }
    },
    [description, isPublic, config, model, router, gpiHashId]
  );

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : setOpen}>
      <DialogTrigger asChild>
        <IconTextButton Icon={StepForward} text="Deploy" responsive />
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl w-11/12 max-h-screen overflow-y-auto gap-3 p-3"
        close
      >
        <div className="w-full pb-1 border-b-2 border-theme">
          <Badge variant="tag" className="h-6">
            Deploy
          </Badge>
        </div>
        <div className="flex flex-col gap-12 mb-12">
          <div>
            <div className="text-foreground font-bold text-sm">Model</div>
            <div>
              <Badge variant="tag">{model?.name}</Badge>
              <div className="mt-2">
                <div className="bg-neutral-700 rounded-md p-2 inline-block whitespace-pre-line text-neutral-300 text-xs">
                  {Object.keys(config).length > 0
                    ? stringify(config)
                    : "Default config"}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-foreground font-bold text-sm">Chat</div>
            <div className="grid md:grid-cols-[auto_1fr] gap-1 md:gap-3 items-start">
              {chatContents.map((c) => (
                <ContentStatic key={c.hashId} {...c} />
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <Input
            autoFocus
            className="w-full"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            disabled={loading}
          />
        </form>
        <div className="w-full flex justify-end items-center gap-3 mt-3">
          <IconTextButton
            className="w-28"
            Icon={!isPublic ? Circle : CircleCheck}
            text={isPublic ? "Public" : "Private"}
            onClick={() => setIsPublic((prev) => !prev)}
            loading={loading}
            responsive
          />
          <IconTextButton
            onClick={onSubmit}
            disabled={description === ""}
            loading={loading}
            text="Deploy"
            Icon={StepForward}
            responsive
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
