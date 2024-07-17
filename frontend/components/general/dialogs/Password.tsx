"use client";

import useUserStore from "@/store/user";
import callApi from "@/util/callApi";
import {
  Button,
  DataList,
  Dialog,
  Separator,
  TextField,
} from "@radix-ui/themes";
import { useCallback, useEffect, useState } from "react";
import {
  UserGetMeResponse,
  UserUpdatePasswordSchema,
} from "gpinterface-shared/type/user";
import { Static } from "@sinclair/typebox";

export default function Password() {
  const { user } = useUserStore();
  const [open, setOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");

  useEffect(() => {
    setOldPassword("");
    setNewPassword("");
    setNewPasswordRepeat("");
  }, [open]);
  const onClickUpdate = useCallback(async () => {
    const response = await callApi<
      UserGetMeResponse,
      Static<typeof UserUpdatePasswordSchema>
    >({
      endpoint: "/user/password",
      method: "PUT",
      body: { oldPassword, newPassword, newPasswordRepeat },
      showError: true,
    });
    if (response) {
      alert("Successfully updated the password!");
    }
  }, [oldPassword, newPassword, newPasswordRepeat]);

  if (!user) return null;
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button>Password update</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <DataList.Root>
          <DataList.Item style={{ height: "2rem" }}>
            <DataList.Label>Current password</DataList.Label>
            <DataList.Value>
              <TextField.Root
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.currentTarget.value)}
              ></TextField.Root>
            </DataList.Value>
          </DataList.Item>
          <Separator orientation="horizontal" size="4" className="my-3" />
          <DataList.Item style={{ height: "2rem" }}>
            <DataList.Label>New password</DataList.Label>
            <DataList.Value>
              <TextField.Root
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
              ></TextField.Root>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item style={{ height: "2rem" }}>
            <DataList.Label>New password Repeat</DataList.Label>
            <DataList.Value>
              <TextField.Root
                type="password"
                value={newPasswordRepeat}
                onChange={(e) => setNewPasswordRepeat(e.currentTarget.value)}
              ></TextField.Root>
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <div className="w-full flex justify-end gap-3 mt-7">
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={onClickUpdate}>Update</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
