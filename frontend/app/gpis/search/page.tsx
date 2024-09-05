"use client";

import Gpis from "@/components/gpi/Gpis";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function Component() {
  const searchParams = useSearchParams();
  const keyword = useMemo(() => searchParams.get("keyword"), [searchParams]);

  return (
    <Gpis
      baseUrl={`/gpis/search?keyword=${keyword}`}
      emptyMessage="No results :("
    />
  );
}

export default function Page() {
  return (
    <Suspense>
      <Component />
    </Suspense>
  );
}
