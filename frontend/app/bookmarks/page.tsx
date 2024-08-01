"use client";

import Threads from "@/components/thread/Threads";
import useUserStore from "@/store/user";
import Login from "@/components/general/dialogs/Login";

export default function Bookmarks() {
  const { user } = useUserStore();

  if (!user) {
    return <Login open />;
  }
  return (
    <div className="w-full max-w-7xl px-3">
      <Threads baseUrl={`/threads/bookmarks?`} />
    </div>
  );
}
