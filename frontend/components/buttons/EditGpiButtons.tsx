"use client";

import IconTextButton from "@/components/buttons/IconTextButton";
import { useToast } from "@/components/ui";
import useModelStore from "@/store/model";
import callApi from "@/utils/callApi";
import { getApiConfig } from "@/utils/model";
import { Static } from "@sinclair/typebox";
import {
  GpiCreateResponse,
  GpiGetResponse,
  GpiUpdateSchema,
} from "gpinterface-shared/type/gpi";
import { CheckCircle2, Circle, Save } from "lucide-react";
import { Dispatch, SetStateAction, useCallback } from "react";

type GpiType = GpiGetResponse | undefined;
type Props = { useGpi: [gpi: GpiType, Dispatch<SetStateAction<GpiType>>] };
export default function EditGpiButtons({ useGpi }: Props) {
  const [gpi, setGpi] = useGpi;

  const { toast } = useToast();
  const [config, model] = useModelStore((state) => [state.config, state.model]);
  const onCheckedChange = useCallback(
    async (c: boolean) => {
      if (!gpi?.hashId) return;

      const response = await callApi<
        GpiCreateResponse,
        Static<typeof GpiUpdateSchema>
      >({
        endpoint: `/gpi/${gpi.hashId}`,
        method: "PUT",
        body: { isPublic: c },
        showError: true,
      });
      if (response) {
        toast({ title: "Saved!", duration: 1000 });
        setGpi((prev) => (!prev ? prev : { ...prev, isPublic: c }));
      }
    },
    [gpi?.hashId, toast, setGpi]
  );
  const onClickDefault = useCallback(async () => {
    if (!model || !gpi?.hashId) return;

    const response = await callApi<
      GpiCreateResponse,
      Static<typeof GpiUpdateSchema>
    >({
      endpoint: `/gpi/${gpi.hashId}`,
      method: "PUT",
      body: { modelHashId: model.hashId, config: getApiConfig(model, config) },
      showError: true,
    });
    if (response) {
      toast({ title: "Saved!", duration: 1000 });
      setGpi((prev) =>
        !prev ? prev : { ...prev, modelHashId: model.hashId, config }
      );
    }
  }, [gpi?.hashId, model, config, toast, setGpi]);

  return (
    <>
      <div className="flex-1 w-full">
        <IconTextButton
          className="w-full md:w-28"
          Icon={!gpi?.isPublic ? Circle : CheckCircle2}
          text="Public"
          onClick={() => onCheckedChange(!gpi?.isPublic)}
          responsive
        />
      </div>
      <div className="flex-1 w-full">
        <IconTextButton
          className="w-full md:w-28"
          Icon={Save}
          text="Save"
          onClick={onClickDefault}
          responsive
        />
      </div>
    </>
  );
}
