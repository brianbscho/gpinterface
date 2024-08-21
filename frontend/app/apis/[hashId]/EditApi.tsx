"use client";

import { Button, useToast } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import useContentStore from "@/store/content";
import callApi from "@/utils/callApi";
import { getApiConfig } from "@/utils/model";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Static } from "@sinclair/typebox";
import {
  ApiCreateResponse,
  ApiGetResponse,
  ApiUpdateSchema,
} from "gpinterface-shared/type/api";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

type ApiType = ApiGetResponse | undefined;
type Props = { useApi: [api: ApiType, Dispatch<SetStateAction<ApiType>>] };
export default function EditApi({ useApi }: Props) {
  const [api, setApi] = useApi;

  const { toast } = useToast();
  const [config, model] = useContentStore((state) => [
    state.config,
    state.model,
  ]);
  const onCheckedChange = useCallback(
    async (c: CheckedState) => {
      if (!api?.hashId || typeof c !== "boolean") return;

      const response = await callApi<
        ApiCreateResponse,
        Static<typeof ApiUpdateSchema>
      >({
        endpoint: `/api/${api.hashId}`,
        method: "PUT",
        body: { isPublic: c },
        showError: true,
      });
      if (response) {
        toast({ title: "Saved!", duration: 1000 });
        setApi((prev) => (!prev ? prev : { ...prev, isPublic: c }));
      }
    },
    [api?.hashId, toast, setApi]
  );
  const onClickDefault = useCallback(async () => {
    if (!model || !api?.hashId) return;

    const response = await callApi<
      ApiCreateResponse,
      Static<typeof ApiUpdateSchema>
    >({
      endpoint: `/api/${api.hashId}`,
      method: "PUT",
      body: { modelHashId: model.hashId, config: getApiConfig(model, config) },
      showError: true,
    });
    if (response) {
      toast({ title: "Saved!", duration: 1000 });
      setApi((prev) =>
        !prev ? prev : { ...prev, modelHashId: model.hashId, config }
      );
    }
  }, [api?.hashId, model, config, toast, setApi]);

  return (
    <>
      <div className="py-2 pl-3 flex items-center gap-3">
        <Checkbox
          id="is_public"
          checked={api?.isPublic}
          onCheckedChange={onCheckedChange}
        />
        <label htmlFor="is_public" className="text-sm">
          Is this public API?
        </label>
      </div>
      <Button
        className="w-full rounded-none"
        variant="outline"
        onClick={onClickDefault}
      >
        Save model
      </Button>
    </>
  );
}
