"use client";

import { Button } from "@radix-ui/themes";
import { Dispatch, SetStateAction } from "react";

export default function Public({
  useIsPublic,
}: {
  useIsPublic: [boolean, Dispatch<SetStateAction<boolean>>];
}) {
  const [isPublic, setIsPublic] = useIsPublic;

  return (
    <Button
      onClick={() => setIsPublic((prev) => !prev)}
      variant={isPublic ? "soft" : "outline"}
    >
      {isPublic ? "Public" : "Private"}
    </Button>
  );
}
