"use client";

import { CircleCheck, Circle, CornerDownLeft, StepForward } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Input,
} from "../ui";
import { FormEvent, useCallback, useState } from "react";
import callApi from "@/utils/callApi";
import { Static } from "@sinclair/typebox";
import {
  GpiCreateResponse,
  GpiCreateSchema,
} from "gpinterface-shared/type/gpi";
import { useRouter } from "next/navigation";
import { getApiConfig } from "@/utils/model";
import IconTextButton from "./IconTextButton";
import useModelStore from "@/store/model";

export default function DeployButton({ chatHashId }: { chatHashId: string }) {
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
        Static<typeof GpiCreateSchema>
      >({
        endpoint: "/gpi",
        method: "POST",
        body: {
          description,
          chatHashId,
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
    [config, description, model, chatHashId, router, isPublic]
  );

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : setOpen}>
      <DialogTrigger asChild>
        <IconTextButton
          Icon={StepForward}
          text="Deploy"
          className="w-24 md:w-32"
          responsive
        />
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-11/12 gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="tag" className="h-6">
            Deploy
          </Badge>
          <div className="flex-1"></div>
          <IconTextButton
            className="w-24"
            Icon={!isPublic ? Circle : CircleCheck}
            text="Public"
            onClick={() => setIsPublic((prev) => !prev)}
            loading={loading}
            responsive
          />
        </div>
        <form onSubmit={onSubmit}>
          <div className="w-full flex gap-3">
            <Input
              autoFocus
              className="flex-1"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={description === ""}
              loading={loading}
            >
              <CornerDownLeft />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
