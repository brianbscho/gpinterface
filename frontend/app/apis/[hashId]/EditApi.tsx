"use client";

import IconTextButton from "@/components/buttons/IconTextButton";
import { useToast } from "@/components/ui";
import useModelStore from "@/store/model";
import callApi from "@/utils/callApi";
import { getApiConfig } from "@/utils/model";
import { Static } from "@sinclair/typebox";
import {
  ApiCreateResponse,
  ApiGetResponse,
  ApiUpdateSchema,
} from "gpinterface-shared/type/api";
import { CheckCircle2, Circle, Save } from "lucide-react";
import { Dispatch, SetStateAction, useCallback } from "react";

type ApiType = ApiGetResponse | undefined;
type Props = { useApi: [api: ApiType, Dispatch<SetStateAction<ApiType>>] };
export default function EditApi({ useApi }: Props) {
  const [api, setApi] = useApi;

  const { toast } = useToast();
  const [config, model] = useModelStore((state) => [state.config, state.model]);
  const onCheckedChange = useCallback(
    async (c: boolean) => {
      if (!api?.hashId) return;

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
      <div className="h-8">
        <IconTextButton
          className="w-28"
          Icon={!api?.isPublic ? Circle : CheckCircle2}
          text="Public"
          onClick={() => onCheckedChange(!api?.isPublic)}
        />
      </div>
      <div>
        <IconTextButton
          className="w-28 mt-3"
          Icon={Save}
          text="Save"
          onClick={onClickDefault}
        />
      </div>
    </>
  );
}
