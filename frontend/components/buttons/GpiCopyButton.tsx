"use client";

import IconTextButton from "@/components/buttons/IconTextButton";
import callApi from "@/utils/callApi";
import { Static } from "@sinclair/typebox";
import { GpiCreateResponse } from "gpinterface-shared/type/gpi";
import { Copy } from "lucide-react";
import { useCallback } from "react";
import { ParamSchema } from "gpinterface-shared/type";
import { useRouter } from "next/navigation";

export default function GpiCopyButton({ gpiHashId }: { gpiHashId: string }) {
  const router = useRouter();
  const onClick = useCallback(async () => {
    const response = await callApi<
      GpiCreateResponse,
      Static<typeof ParamSchema>
    >({
      endpoint: `/gpi/copy`,
      method: "POST",
      body: { hashId: gpiHashId },
      showError: true,
    });
    if (response) {
      router.push(`/gpis/${response.hashId}`);
    }
  }, [gpiHashId]);

  return (
    <IconTextButton
      className="w-full md:w-32"
      onClick={onClick}
      Icon={Copy}
      text="Make copy"
      responsive
    />
  );
}
