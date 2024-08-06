"use client";

import { useRouter } from "next/navigation";
import LoginRequiredButton from "./LoginRequiredButton";
import { Button } from "@/components/ui";

export default function Create() {
  const router = useRouter();

  return (
    <LoginRequiredButton onClick={() => router.push("/thread/create")}>
      <Button>Create</Button>
    </LoginRequiredButton>
  );
}
