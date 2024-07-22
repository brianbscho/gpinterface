"use client";

import { ReactNode, useCallback, useState } from "react";
import Login from "../dialogs/Login";
import useUserStore from "@/store/user";

export default function UserRequiredButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  const { user } = useUserStore();
  const [loginOpen, setLoginOpen] = useState(false);

  const onClickUserRequired = useCallback(() => {
    if (!user) {
      setLoginOpen(true);
      return;
    }

    if (onClick) {
      onClick();
    }
  }, [onClick, user]);

  return (
    <>
      <div onClick={onClickUserRequired}>{children}</div>
      <Login open={loginOpen} onClickLogin={() => setLoginOpen(false)} />
    </>
  );
}
