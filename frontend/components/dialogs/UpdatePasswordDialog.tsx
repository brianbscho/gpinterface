"use client";

import callApi from "@/utils/callApi";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  UserGetMeResponse,
  UserUpdatePasswordSchema,
} from "gpinterface-shared/type/user";
import { Static } from "@sinclair/typebox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Input,
  Separator,
} from "@/components/ui";
import { validatePassword } from "gpinterface-shared/string";
import IconTextButton from "../buttons/IconTextButton";
import { X, Lock, Check } from "lucide-react";

export default function UpdatePassword() {
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
        endpoint: "/users/password",
        method: "PATCH",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <IconTextButton
          responsive
          Icon={Lock}
          text="P/W update"
          className="w-32 md:w-44"
        />
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>Current password</div>
            <div>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.currentTarget.value)}
              ></Input>
            </div>
            <Separator
              orientation="horizontal"
              className="my-3 col-span-2 bg-theme"
            />
            <div>New password</div>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
            ></Input>
            <div>New password Repeat</div>
            <Input
              type="password"
              value={newPasswordRepeat}
              onChange={(e) => setNewPasswordRepeat(e.currentTarget.value)}
            ></Input>
          </div>
          <div className="mt-1 text-xs h-4 text-rose-500">{passwordMsg}</div>
          <div className="text-xs mt-1">
            at least 8 characters long, at least one uppercase letter, at least
            one lowercase letter, and at least one digit
          </div>
          <div className="w-full flex justify-end gap-3 mt-7 h-6">
            <DialogClose>
              <IconTextButton
                responsive
                Icon={X}
                text="Cancel"
                type="button"
                className="w-28"
              />
            </DialogClose>
            <IconTextButton
              responsive
              Icon={Check}
              text="Update"
              type="submit"
              disabled={[oldPassword, newPassword, newPasswordRepeat].some(
                (p) => p === ""
              )}
              loading={loading}
              className="w-28"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
