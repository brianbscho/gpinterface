"use client";

import { Copy, CircleEllipsis, LinkIcon, FileCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useToast,
} from "../ui";
import IconButton from "../buttons/IconButton";
import { useCallback, useState } from "react";
import callApi from "@/utils/callApi";
import { GpiCreateResponse } from "gpinterface-shared/type/gpi";
import Link from "next/link";
import useUserStore from "@/store/user";
import { useRouter } from "next/navigation";

type Props = { gpi: { hashId: string; userHashId: string | null } };
export default function GpiDropdown({ gpi }: Props) {
  const { toast } = useToast();
  const onClickShare = useCallback(() => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_HOSTNAME}/gpis/${gpi.hashId}`
    );
    toast({ title: "Link copied!", duration: 1000 });
  }, [gpi.hashId, toast]);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onClickCopy = useCallback(async () => {
    setLoading(true);
    const response = await callApi<GpiCreateResponse>({
      endpoint: `/users/gpis/${gpi.hashId}/copy`,
      method: "POST",
      body: {},
      showError: true,
    });
    if (response) {
      router.push(`/profile/gpis/${response.hashId}/edit`);
    } else {
      setLoading(false);
    }
  }, [gpi.hashId, router]);
  const userHashId = useUserStore((state) => state.user?.hashId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton Icon={CircleEllipsis} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto px-1">
        {userHashId === gpi.userHashId && (
          <DropdownMenuItem>
            <Link href={`/profile/gpis/${gpi.hashId}/edit`}>
              <div className="flex gap-3">
                <FileCog className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Edit</span>
              </div>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="gap-3" onClick={onClickShare}>
          <LinkIcon className="h-3 w-3 md:h-4 md:w-4" />
          <span className="text-xs md:text-sm">Share</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-3"
          onClick={onClickCopy}
          disabled={loading}
        >
          <Copy className="h-3 w-3 md:h-4 md:w-4" />
          <span className="text-xs md:text-sm">Make copy</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
