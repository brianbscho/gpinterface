"use client";

import { Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import UserRequiredButton from "./UserRequiredButton";

export default function ThreadCreate() {
  const router = useRouter();

  return (
    <UserRequiredButton onClick={() => router.push("/thread/create")}>
      <Button>Create</Button>
    </UserRequiredButton>
  );
}
