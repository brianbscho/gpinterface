"use client";

import IconTextButton from "@/components/buttons/IconTextButton";
import { useToast } from "@/components/ui";
import callApi from "@/utils/callApi";
import { Static } from "@sinclair/typebox";
import {
  GpiCreateResponse,
  GpiGetResponse,
  GpiUpdateSchema,
} from "gpinterface-shared/type/gpi";
import { CircleCheck, Circle } from "lucide-react";
import { Dispatch, SetStateAction, useCallback } from "react";

type GpiType = GpiGetResponse | undefined;
type Props = { useGpi: [gpi: GpiType, Dispatch<SetStateAction<GpiType>>] };
export default function GpiPublicButton({ useGpi }: Props) {
  const [gpi, setGpi] = useGpi;

  const { toast } = useToast();
  const onCheckedChange = useCallback(async () => {
    if (!gpi?.hashId) return;

    const isPublic = !gpi?.isPublic;
    const response = await callApi<
      GpiCreateResponse,
      Static<typeof GpiUpdateSchema>
    >({
      endpoint: `/gpi/${gpi.hashId}`,
      method: "PUT",
      body: { isPublic },
      showError: true,
    });
    if (response) {
      toast({ title: "Saved!", duration: 1000 });
      setGpi((prev) => (!prev ? prev : { ...prev, isPublic }));
    }
  }, [gpi?.hashId, gpi?.isPublic, toast, setGpi]);

  return (
    <IconTextButton
      className="w-full md:w-32"
      Icon={!gpi?.isPublic ? Circle : CircleCheck}
      text="Public"
      onClick={onCheckedChange}
      responsive
    />
  );
}
