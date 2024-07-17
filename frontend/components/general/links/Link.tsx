"use client";

import { AnchorHTMLAttributes } from "react";
import NextLink, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import useLinkStore from "@/store/link";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps;

export default function Link({ ...props }: Props) {
  const router = useRouter();
  const { confirmMessage } = useLinkStore();

  return (
    <NextLink
      {...props}
      onClick={(e) => {
        if (props.onClick) {
          props.onClick(e);
        }
        if (!confirmMessage) return;

        e.preventDefault();

        const _confirm = confirm(confirmMessage);
        if (!_confirm) return;

        router.push(props.href.toString());
      }}
    />
  );
}
