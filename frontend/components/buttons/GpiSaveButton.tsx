"use client";

import IconTextButton from "@/components/buttons/IconTextButton";
import { useToast } from "@/components/ui";
import useModelStore from "@/store/model";
import callApi from "@/utils/callApi";
import { getApiConfig } from "@/utils/model";
import { Static } from "@sinclair/typebox";
import { ChatGetResponse } from "gpinterface-shared/type/chat";
import {
  GpiUpdateResponse,
  GpiUpdateSchema,
} from "gpinterface-shared/type/gpi";
import { Save } from "lucide-react";
import { useCallback } from "react";

type GpiType = ChatGetResponse["gpis"][0] | undefined;
type Props = { useGpi: [GpiType, (gpi: GpiType) => void] };
export default function GpiSaveButton({ useGpi }: Props) {
  const [gpi, setGpi] = useGpi;

  const { toast } = useToast();
  const [config, model] = useModelStore((state) => [state.config, state.model]);
  const onClickSave = useCallback(async () => {
    if (!model || !gpi?.hashId) return;

    const response = await callApi<
      GpiUpdateResponse,
      Static<typeof GpiUpdateSchema>
    >({
      endpoint: `/gpi/${gpi.hashId}`,
      method: "PUT",
      body: { modelHashId: model.hashId, config: getApiConfig(model, config) },
      showError: true,
    });
    if (response) {
      toast({ title: "Saved!", duration: 1000 });
      setGpi(response);
    }
  }, [gpi?.hashId, model, config, toast, setGpi]);

  return (
    <IconTextButton
      className="w-full md:w-28"
      Icon={Save}
      text="Save"
      onClick={onClickSave}
      responsive
      disabled={!gpi}
    />
  );
}
