"use client";

import { ReactNode, useCallback, useState } from "react";
import Login from "../dialogs/Login";
import useUserStore from "@/store/user";

export default function LoginRequiredButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const [loginOpen, setLoginOpen] = useState(false);

  const onClickUserRequired = useCallback(() => {
    if (isLoggedOut) {
      setLoginOpen(true);
      return;
    }

    if (onClick) {
      onClick();
    }
  }, [onClick, isLoggedOut]);

  return (
    <>
      <div onClick={onClickUserRequired}>{children}</div>
      <Login open={loginOpen} onClickLogin={() => setLoginOpen(false)} />
    </>
  );
}
