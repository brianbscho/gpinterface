"use client";

import IconTextButton from "@/components/buttons/IconTextButton";
import callApi from "@/utils/callApi";
import { Static } from "@sinclair/typebox";
import { GpiCreateResponse } from "gpinterface-shared/type/gpi";
import { Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { ParamSchema } from "gpinterface-shared/type";
import { useRouter } from "next/navigation";
import { Button } from "../ui";

export default function GpiCopyButton({ gpiHashId }: { gpiHashId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const onClick = useCallback(async () => {
    setLoading(true);
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
      router.push("/gpis/user");
    } else {
      setLoading(false);
    }
  }, [gpiHashId, router]);

  return (
    <div>
      <div className="hidden md:block">
        <IconTextButton
          className="w-32"
          onClick={onClick}
          Icon={Copy}
          text="Make copy"
          loading={loading}
        />
      </div>
      <div className="block md:hidden h-6">
        <Button className="p-1 h-6 w-6" onClick={onClick}>
          <Copy />
        </Button>
      </div>
    </div>
  );
}
