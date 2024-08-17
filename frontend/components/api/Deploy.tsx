"use client";

import { CornerDownLeft } from "lucide-react";
import { Button, Dialog, DialogContent, DialogHeader, Input } from "../ui";
import { FormEvent, useCallback, useState } from "react";
import callApi from "@/utils/callApi";
import { Static } from "@sinclair/typebox";
import useContentStore from "@/store/content";
import {
  ApiCreateResponse,
  ApiCreateSchema,
} from "gpinterface-shared/type/api";
import LoginRequiredButton from "../general/buttons/LoginRequiredButton";
import { useRouter } from "next/navigation";
import { getApiConfig } from "@/utils/model";

export default function Deploy({ chatHashId }: { chatHashId: string }) {
  const [open, setOpen] = useState(false);

  const [description, setDescription] = useState("");
  const [model, config] = useContentStore((state) => [
    state.model,
    state.config,
  ]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!model) return;
      setLoading(true);
      const response = await callApi<
        ApiCreateResponse,
        Static<typeof ApiCreateSchema>
      >({
        endpoint: "/api",
        method: "POST",
        body: {
          description,
          chatHashId,
          modelHashId: model.hashId,
          config: getApiConfig(model, config),
        },
        showError: true,
      });

      if (response) {
        router.push(`apis/${response.hashId}`);
      } else {
        setLoading(false);
      }
    },
    [config, description, model, chatHashId, router]
  );

  return (
    <div>
      <LoginRequiredButton onClick={() => setOpen(true)}>
        <Button variant="default" className="w-full">
          Deploy
        </Button>
      </LoginRequiredButton>
      <Dialog open={open} onOpenChange={loading ? undefined : setOpen}>
        <DialogContent className="max-w-full w-11/12">
          <DialogHeader>Deploy API</DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="w-full my-12 flex gap-3">
              <Input
                className="flex-1 bg-secondary"
                placeholder="API description"
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
    </div>
  );
}
