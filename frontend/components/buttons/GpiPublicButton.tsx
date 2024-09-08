"use client";

import IconTextButton from "@/components/buttons/IconTextButton";
import { useToast } from "@/components/ui";
import callApi from "@/utils/callApi";
import { Static } from "@sinclair/typebox";
import {
  GpiUpdateResponse,
  GpiUpdateSchema,
} from "gpinterface-shared/type/gpi";
import { CircleCheck, Circle } from "lucide-react";
import { useCallback } from "react";

type Props = {
  gpiHashId: string;
  usePublic: [boolean, (isPublic: boolean) => void];
};
export default function GpiPublicButton({ gpiHashId, usePublic }: Props) {
  const [isPublic, setIsPublic] = usePublic;

  const { toast } = useToast();
  const onCheckedChange = useCallback(async () => {
    const response = await callApi<
      GpiUpdateResponse,
      Static<typeof GpiUpdateSchema>
    >({
      endpoint: `/users/gpis/${gpiHashId}`,
      method: "PATCH",
      body: { isPublic },
      showError: true,
    });
    if (response) {
      toast({ title: "Saved!", duration: 1000 });
      setIsPublic(response.isPublic);
    }
  }, [gpiHashId, isPublic, toast, setIsPublic]);

  return (
    <IconTextButton
      className="w-full md:w-auto"
      Icon={isPublic ? Circle : CircleCheck}
      text="Public"
      onClick={onCheckedChange}
      responsive
    />
  );
}
