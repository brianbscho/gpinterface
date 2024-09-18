"use client";

import { useCallback, useState } from "react";
import callApi from "@/utils/callApi";
import useUserStore from "@/store/user";
import { CirclePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import IconButton from "./IconButton";
import {
  GpiCreateResponse,
  GpiCreateSchema,
} from "gpinterface-shared/type/gpi";
import { Static } from "@sinclair/typebox";
import useModelStore from "@/store/model";
import useProviderTypes from "@/hooks/useProviderTypes";
import useLoginStore from "@/store/login";
import { Button } from "../ui";

export default function ChatCreateButton({
  isIcon = false,
}: {
  isIcon?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const isLoggedOut = useUserStore((state) => !state.user);
  const setOpen = useLoginStore((state) => state.setOpen);
  const router = useRouter();

  useProviderTypes();
  const [modelHashId, config] = useModelStore((state) => [
    state.modelHashId,
    state.config,
  ]);

  const onClick = useCallback(async () => {
    if (!modelHashId) return;
    if (isLoggedOut) {
      setOpen(true);
      return;
    }

    setLoading(true);
    const response = await callApi<
      GpiCreateResponse,
      Static<typeof GpiCreateSchema>
    >({
      endpoint: "/users/gpis",
      method: "POST",
      body: { modelHashId, config },
      showError: true,
    });
    if (response) {
      router.push(`/profile/gpis/${response.hashId}/edit`);
    }
    setLoading(false);
  }, [isLoggedOut, router, modelHashId, config, setOpen]);

  if (isIcon) {
    return (
      <IconButton
        Icon={CirclePlus}
        loading={loading}
        onClick={onClick}
        responsive
      />
    );
  }

  return (
    <Button
      loading={loading}
      onClick={onClick}
      className="text-2xl font-bold bg-theme p-7 hover:bg-theme/80"
    >
      Create your prompt
    </Button>
  );
}
