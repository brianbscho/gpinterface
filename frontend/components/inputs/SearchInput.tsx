"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { Button, Input } from "../ui";
import { SearchIcon } from "lucide-react";

function _SearchInput() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();
  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!keyword) return;

      router.push(`/gpis/search?keyword=${keyword}`);
    },
    [keyword, router]
  );

  const searchParams = useSearchParams();
  useEffect(() => {
    const _keyword = searchParams.get("keyword") ?? "";
    setKeyword(_keyword);
  }, [searchParams]);

  return (
    <form className="w-full" onSubmit={onSubmit}>
      <div className="w-full relative">
        <Input
          type="text"
          placeholder="Search"
          value={keyword}
          onChange={(e) => setKeyword(e.currentTarget.value)}
          Icon={SearchIcon}
          className="h-6 md:h-8"
        />
        <Button
          type="submit"
          className="absolute right-0 top-0 h-6 w-6 md:h-8 md:w-8 p-0"
        >
          <SearchIcon className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}

export default function SearchInput() {
  return (
    <Suspense>
      <_SearchInput />
    </Suspense>
  );
}
