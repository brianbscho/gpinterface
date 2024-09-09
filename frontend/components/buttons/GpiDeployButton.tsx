"use client";

import { CircleCheck, Circle, StepForward, Save } from "lucide-react";
import { Badge, Dialog, DialogContent, DialogTrigger, Input } from "../ui";
import { FormEvent, useCallback, useMemo, useState } from "react";
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

type Props = {
  gpi: {
    hashId: string;
    chatContents: { hashId: string; role: string; content: string }[];
    description: string;
    isPublic: boolean;
    isDeployed: boolean;
  };
};
export default function GpiDeployButton({ gpi }: Props) {
  const [open, setOpen] = useState(false);

  const [isPublic, setIsPublic] = useState(gpi.isPublic);
  const [description, setDescription] = useState(gpi.description);
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
        endpoint: `/users/gpis/${gpi.hashId}${gpi.isDeployed ? "" : "/deploy"}`,
        method: gpi.isDeployed ? "PUT" : "POST",
        body: {
          description,
          modelHashId: model.hashId,
          config: getApiConfig(model, config),
          isPublic,
        },
        showError: true,
      });

      if (response) {
        router.push("/profile/gpis");
      } else {
        setLoading(false);
      }
    },
    [gpi.isDeployed, description, isPublic, config, model, router, gpi.hashId]
  );

  const text = useMemo(
    () => (gpi.isDeployed ? "Save" : "Deploy"),
    [gpi.isDeployed]
  );

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : setOpen}>
      <DialogTrigger asChild>
        <IconTextButton
          Icon={gpi.isDeployed ? Save : StepForward}
          text={text}
          responsive
        />
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl w-11/12 max-h-screen overflow-y-auto gap-3 p-3"
        close
      >
        <div className="w-full pb-1 border-b-2 border-theme">
          <Badge variant="tag" className="h-6">
            {text}
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
              {gpi.chatContents.map((c) => (
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
            Icon={gpi.isDeployed ? Save : StepForward}
            text={text}
            responsive
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
