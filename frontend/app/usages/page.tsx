"use client";

import TextUsages from "./TextUsages";
import ImageUsages from "./ImageUsages";
import { Tabs, TabsContent } from "@/components/ui";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function Usages() {
  const searchParams = useSearchParams();
  const value = searchParams.get("value");

  return (
    <Tabs value={value ?? "text"}>
      <TabsContent value="text">
        <TextUsages />
      </TabsContent>
      <TabsContent value="image">
        <ImageUsages />
      </TabsContent>
    </Tabs>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Usages />
    </Suspense>
  );
}
