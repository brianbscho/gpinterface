"use client";

import callApi from "@/util/callApi";
import { useCallback, useEffect, useState } from "react";
import { Notification } from "gpinterface-shared/type";
import useUserStore from "@/store/user";
import Link from "next/link";
import { NotificationsGetResponse } from "gpinterface-shared/type/notification";
import List from "@/components/List";
import { Bell, ChevronRight, X } from "lucide-react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>();
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
    }
    if (response?.notifications.length === 0) {
      setSpinnerHidden(true);
    }
  }, [lastHashId]);

  const onClickClear = useCallback(async () => {
    const _confirm = confirm(
      "Are you sure you want to clear all the notifications?"
    );
    if (!_confirm) return;

    const response = await callApi<{ notifications: Notification[] }>({
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
      <DialogTrigger>
        <div className="relative">
          {user.notification && (
            <div className="absolute -top-1 -right-1 rounded-full bg-yellow-300 h-2 w-2 z-10"></div>
          )}
          <Button>
            <Bell />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="w-full">
        <div className="h-[70vh] overflow-y-auto">
          <div className="flex items-start gap-3">
            <DialogTitle
              style={{ backgroundColor: "var(--color-panel-solid)" }}
              className="first:mt-0 mt-12 sticky top-0 z-10"
            >
              Notifications
            </DialogTitle>
            <div className="flex-1"></div>
            <Button onClick={onClickClear}>Clear Notifications</Button>
            <DialogClose>
              <Button
                style={{ width: "1.5rem", height: "1.5rem", padding: 0 }}
                className="focus:outline-none"
              >
                <X />
              </Button>
            </DialogClose>
          </div>
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
      </DialogContent>
    </Dialog>
  );
}
