"use client";

import Gpis from "@/components/gpi/Gpis";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function Search() {
  const searchParams = useSearchParams();
  const keyword = useMemo(() => searchParams.get("keyword"), [searchParams]);

  return (
    <div className="w-full flex-1 overflow-hidden">
      <Gpis
        baseUrl={`/gpis/search?keyword=${keyword}`}
        emptyMessage="No results :("
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Search />
    </Suspense>
  );
}
