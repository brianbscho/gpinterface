"use client";

import { Button } from "@/components/ui";
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
      variant={isPublic ? "secondary" : "outline"}
      className="w-24"
    >
      {isPublic ? "Public" : "Private"}
    </Button>
  );
}
