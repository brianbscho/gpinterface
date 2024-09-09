"use client";

import { useCallback, useState } from "react";
import callApi from "@/utils/callApi";
import useUserStore from "@/store/user";
import LoginDialog from "../dialogs/LoginDialog";
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

export default function ChatCreateButton({
  className,
}: {
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const [open, setOpen] = useState(false);
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
  }, [isLoggedOut, router, modelHashId, config]);

  return (
    <div className={className}>
      <IconButton
        Icon={CirclePlus}
        loading={loading}
        onClick={onClick}
        responsive
      />
      <LoginDialog useOpen={[open, setOpen]} />
    </div>
  );
}
