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
import { useRouter } from "next/navigation";
import callApi from "@/utils/callApi";
import { GpiCreateResponse } from "gpinterface-shared/type/gpi";
import useUserStore from "@/store/user";
import Link from "next/link";

export default function GpiDropdown({ gpiHashId }: { gpiHashId: string }) {
  const { toast } = useToast();
  const onClickShare = useCallback(() => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_HOSTNAME}/gpis/${gpiHashId}`
    );
    toast({ title: "Link copied!", duration: 1000 });
  }, [gpiHashId, toast]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const onClickCopy = useCallback(async () => {
    setLoading(true);
    const response = await callApi<GpiCreateResponse>({
      endpoint: `/users/gpis/${gpiHashId}/copy`,
      method: "POST",
      showError: true,
    });
    if (response) {
      router.push("/gpis/user");
    } else {
      setLoading(false);
    }
  }, [gpiHashId, router]);

  const userHashId = useUserStore((state) => state.user?.hashId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton Icon={CircleEllipsis} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto px-1">
        <DropdownMenuItem>
          <Link href={`/gpis/${gpiHashId}/edit`}>
            <div className="flex gap-3">
              <FileCog className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Edit</span>
            </div>
          </Link>
        </DropdownMenuItem>
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
