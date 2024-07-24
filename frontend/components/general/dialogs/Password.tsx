"use client";

import useUserStore from "@/store/user";
import callApi from "@/util/callApi";
import { useCallback, useEffect, useState } from "react";
import {
  UserGetMeResponse,
  UserUpdatePasswordSchema,
} from "gpinterface-shared/type/user";
import { Static } from "@sinclair/typebox";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Input,
  Separator,
} from "@/components/ui";

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Password update</Button>
      </DialogTrigger>
      <DialogContent>
        <table>
          <tr style={{ height: "2rem" }}>
            <td>Current password</td>
            <td>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.currentTarget.value)}
              ></Input>
            </td>
          </tr>
          <Separator orientation="horizontal" className="my-3" />
          <tr style={{ height: "2rem" }}>
            <td>New password</td>
            <td>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
              ></Input>
            </td>
          </tr>
          <tr style={{ height: "2rem" }}>
            <td>New password Repeat</td>
            <td>
              <Input
                type="password"
                value={newPasswordRepeat}
                onChange={(e) => setNewPasswordRepeat(e.currentTarget.value)}
              ></Input>
            </td>
          </tr>
        </table>
        <div className="w-full flex justify-end gap-3 mt-7">
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose>
            <Button onClick={onClickUpdate}>Update</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
