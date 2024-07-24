"use client";

import { useRouter } from "next/navigation";
import UserRequiredButton from "./UserRequiredButton";
import { Button } from "@/components/ui";

export default function ThreadCreate() {
  const router = useRouter();

  return (
    <UserRequiredButton onClick={() => router.push("/thread/create")}>
      <Button>Create</Button>
    </UserRequiredButton>
  );
}
