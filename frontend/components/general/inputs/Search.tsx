"use client";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Button, TextField } from "@radix-ui/themes";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";

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

  return (
    <form className="w-full" onSubmit={onSubmit}>
      <div className="w-full my-3 flex items-center gap-3">
        <TextField.Root
          placeholder="Search"
          className="flex-1"
          name="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.currentTarget.value)}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
}

export default function Search() {
  return (
    <Suspense>
      <Component />
    </Suspense>
  );
}
