"use client";

import useUserStore from "@/store/user";
import callApi from "@/utils/callApi";
import { FormEvent, useCallback, useEffect, useState } from "react";
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
import { validatePassword } from "gpinterface-shared/string";

export default function UpdatePassword() {
  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const [open, setOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOldPassword("");
    setNewPassword("");
    setNewPasswordRepeat("");
    setPasswordMsg("");
    setLoading(false);
  }, [open]);
  useEffect(() => {
    if (validatePassword(newPassword)) setPasswordMsg("");
  }, [newPassword]);
  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validatePassword(newPassword)) {
        setPasswordMsg(
          "Please ensure your password meets the required criteria."
        );
        return;
      }
      if (newPassword !== newPasswordRepeat) {
        setPasswordMsg("Passwords don't match.");
        return;
      }
      setLoading(true);
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
        setOpen(false);
      }
      setLoading(false);
    },
    [oldPassword, newPassword, newPasswordRepeat]
  );

  if (isLoggedOut) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Password update</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <table>
            <tr>
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
            <tr>
              <td>New password</td>
              <td>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.currentTarget.value)}
                ></Input>
              </td>
            </tr>
            <tr>
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
          <div className="mt-1 text-xs h-4 text-rose-500">{passwordMsg}</div>
          <div className="text-xs mt-1">
            at least 8 characters long, at least one uppercase letter, at least
            one lowercase letter, and at least one digit
          </div>
          <div className="w-full flex justify-end gap-3 mt-7">
            <DialogClose>
              <Button loading={loading} variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              loading={loading}
              type="submit"
              disabled={[oldPassword, newPassword, newPasswordRepeat].some(
                (p) => p === ""
              )}
            >
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
