"use client";

import Threads from "@/components/thread/Threads";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function Search() {
  const searchParams = useSearchParams();
  const keyword = useMemo(() => searchParams.get("keyword"), [searchParams]);

  return (
    <div className="w-full max-w-7xl px-3">
      <Threads
        baseUrl={`/threads/search?keyword=${keyword}`}
        emptyMessage={`No search result for '${keyword}'`}
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
