"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";

const nullRenderPathname = ["/", "/search"];
function Component() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();
  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!keyword) return;

      router.push(`/search?keyword=${keyword}`);
    },
    [keyword, router]
  );

  const searchParams = useSearchParams();
  useEffect(() => {
    const _keyword = searchParams.get("keyword") ?? "";
    setKeyword(_keyword);
  }, [searchParams]);

  const pathname = usePathname();
  if (!nullRenderPathname.includes(pathname)) return null;
  return (
    <div className="w-full max-w-7xl mx-auto h-16 flex items-center px-3">
      <form className="w-full" onSubmit={onSubmit}>
        <div className="w-full flex items-center gap-3">
          <Input
            placeholder="Search"
            className="flex-1"
            name="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.currentTarget.value)}
            Icon={SearchIcon}
          />
          <Button type="submit">Search</Button>
        </div>
      </form>
    </div>
  );
}

export default function Search() {
  return (
    <Suspense>
      <Component />
    </Suspense>
  );
}
