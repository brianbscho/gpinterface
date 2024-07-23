"use client";

import callApi from "@/util/callApi";
import { Button, Dialog } from "@radix-ui/themes";
import { useCallback, useEffect, useState } from "react";
import { Notification } from "gpinterface-shared/type";
import {
  BellIcon,
  Cross2Icon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import useUserStore from "@/store/user";
import Link from "next/link";
import { NotificationsGetResponse } from "gpinterface-shared/type/notification";
import List from "@/components/List";

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
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <div className="relative">
          {user.notification && (
            <div className="absolute -top-1 -right-1 rounded-full bg-yellow-300 h-2 w-2 z-10"></div>
          )}
          <Button>
            <BellIcon />
          </Button>
        </div>
      </Dialog.Trigger>
      <Dialog.Content width="100%">
        <div className="h-[70vh] overflow-y-auto">
          <div className="flex items-start gap-3">
            <Dialog.Title
              style={{ backgroundColor: "var(--color-panel-solid)" }}
              className="first:mt-0 mt-12 sticky top-0 z-10"
            >
              Notifications
            </Dialog.Title>
            <div className="flex-1"></div>
            <Button onClick={onClickClear} size="1">
              Clear Notifications
            </Button>
            <Dialog.Close>
              <Button
                size="1"
                style={{ width: "1.5rem", height: "1.5rem", padding: 0 }}
                className="focus:outline-none"
              >
                <Cross2Icon />
              </Button>
            </Dialog.Close>
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
                    <DoubleArrowRightIcon />
                  </div>
                </Link>
              </div>
            ))}
          </List>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
