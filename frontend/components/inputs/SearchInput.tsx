"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { Input } from "../ui";
import { SearchIcon } from "lucide-react";
import IconButton from "../buttons/IconButton";

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
        <IconButton
          type="submit"
          className="absolute right-0.5 top-0.5 md:right-0.5 md:top-0.5 h-5 w-5 md:h-7 md:w-7 p-0.5 md:p-1"
          Icon={SearchIcon}
          responsive
        ></IconButton>
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
