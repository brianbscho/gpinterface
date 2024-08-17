"use client";

import callApi from "@/utils/callApi";
import { useCallback, useEffect, useState } from "react";
import useUserStore from "@/store/user";
import Link from "next/link";
import { NotificationsGetResponse } from "gpinterface-shared/type/notification";
import List from "@/components/List";
import { Bell, ChevronRight } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

type NotificationsType = NotificationsGetResponse["notifications"];
export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationsType>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const { user, setUserProperty } = useUserStore();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setNotifications(undefined);
    setLastHashId("");
    setSpinnerHidden(false);
    setUserProperty({ notification: false });
  }, [open, setUserProperty]);

  const callNotificationsApi = useCallback(async () => {
    const response = await callApi<NotificationsGetResponse>({
      endpoint: `/notifications?lastHashId=${lastHashId}`,
    });
    if (response) {
      setNotifications((prev) => [...(prev ?? []), ...response.notifications]);
      if (response.notifications.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  const onClickClear = useCallback(async () => {
    const _confirm = confirm(
      "Are you sure you want to clear all the notifications?"
    );
    if (!_confirm) return;

    const response = await callApi<{ notifications: NotificationsType }>({
      endpoint: "/notifications",
      method: "DELETE",
    });
    if (response) {
      setNotifications(response.notifications);
    }
  }, []);

  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          {user.notification && (
            <div className="absolute -top-1 -right-1 rounded-full bg-yellow-300 h-2 w-2 z-10"></div>
          )}
          <Button>
            <Bell />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="w-full" close>
        <DialogTitle>Notifications</DialogTitle>
        <div className="h-[70vh] overflow-y-auto">
          <List
            callApi={callNotificationsApi}
            emptyMessage="No notification yet"
            elements={notifications}
            spinnerHidden={spinnerHidden}
            useLastHashId={[lastHashId, setLastHashId]}
          >
            {notifications?.map((n, index) => (
              <div key={n.createdAt + index} className="w-full text-sm">
                <Link href={n.url} onClick={() => setOpen(false)}>
                  <div className="flex w-full items-center gap-3 py-3 border-t">
                    <div>{n.message}</div>
                    <div className="flex-1"></div>
                    <ChevronRight />
                  </div>
                </Link>
              </div>
            ))}
          </List>
        </div>
        <div>
          <Button onClick={onClickClear}>Clear Notifications</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
