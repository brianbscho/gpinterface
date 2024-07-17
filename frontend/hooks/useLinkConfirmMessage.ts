import useLinkStore from "@/store/link";
import { useEffect } from "react";

export default function useLinkConfirmMessage(change: boolean) {
  const { setConfirmMessage } = useLinkStore();
  useEffect(() => {
    if (change) {
      setConfirmMessage(
        "You have unsaved changes. If you leave this page, your changes will be lost. Are you sure you want to leave?"
      );
    } else {
      setConfirmMessage(undefined);
    }
    return () => {
      setConfirmMessage(undefined);
    };
  }, [change, setConfirmMessage]);
}
