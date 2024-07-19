"use client";

import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { Button, Tabs, TextField } from "@radix-ui/themes";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { validateEmail, validatePassword } from "gpinterface-shared/string";
import callApi from "@/util/callApi";
import TermsAndConditions from "@/components/general/dialogs/TermsAndConditions";
import useUserStore from "@/store/user";
import {
  UserCreateSchema,
  UserGetMeResponse,
} from "gpinterface-shared/type/user";
import { Static } from "@sinclair/typebox";

export default function Page() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const loginDisabled = useMemo(
    () => email.length === 0 || password.length === 0,
    [email, password]
  );
  const nameValid = useMemo(
    () => /^[a-zA-Z0-9-_~!@#$^&*()+=]+$/.test(name),
    [name]
  );
  const signupDisabled = useMemo(
    () => loginDisabled || !agree || !nameValid,
    [loginDisabled, agree, nameValid]
  );

  const [emailMsg, setEmailMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  useEffect(() => {
    if (validateEmail(email)) setEmailMsg("");
  }, [email]);
  useEffect(() => {
    if (validatePassword(password)) setPasswordMsg("");
  }, [password]);

  const { setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validateEmail(email)) {
        setEmailMsg("Please check your email address.");
        return;
      }
      if (!validatePassword(password)) {
        setPasswordMsg(
          "Please ensure your password meets the required criteria."
        );
        return;
      }
      setLoading(true);
      const endpoint = `/user/${isLogin ? "login" : "signup"}`;
      const response = await callApi<
        UserGetMeResponse,
        Static<typeof UserCreateSchema>
      >({
        endpoint,
        method: "POST",
        body: { email, password, name },
        showError: true,
      });
      setUser(response?.user);
      setLoading(false);
    },
    [email, name, password, isLogin, setUser]
  );
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl px-7">
      <Tabs.Root
        defaultValue="login"
        onValueChange={(e) => setIsLogin(e === "login")}
      >
        <Tabs.List>
          <Tabs.Trigger value="login">Login</Tabs.Trigger>
          <Tabs.Trigger value="signup">Sign up</Tabs.Trigger>
        </Tabs.List>
        <form onSubmit={onSubmit} noValidate>
          <div className="mt-12">
            <Tabs.Content value="signup">
              <TextField.Root
                type="text"
                size="3"
                placeholder="Please type your username (no space)"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                disabled={loading}
              >
                <TextField.Slot>
                  <PersonIcon />
                </TextField.Slot>
              </TextField.Root>
              <div className="text-xs min-h-4 mt-1 mb-3 text-rose-500">
                {name.length > 0 &&
                  !nameValid &&
                  "You can use only alphanumeric characters and -_,~!@#$^&*()+= special characters."}
              </div>
            </Tabs.Content>
            <TextField.Root
              type="email"
              size="3"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              disabled={loading}
            >
              <TextField.Slot>
                <EnvelopeClosedIcon />
              </TextField.Slot>
            </TextField.Root>
            <div className="mt-1 text-xs h-4 text-rose-500">{emailMsg}</div>
            <TextField.Root
              type="password"
              size="3"
              placeholder="Please use secure password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="mt-3"
              disabled={loading}
            >
              <TextField.Slot>
                <LockClosedIcon />
              </TextField.Slot>
            </TextField.Root>
            <div className="mt-1 text-xs h-4 text-rose-500">{passwordMsg}</div>
          </div>
          <div>
            <Tabs.Content value="login" className="mt-12">
              <Button
                style={{ width: "100%" }}
                size="4"
                disabled={loginDisabled}
                type="submit"
                loading={loading}
              >
                Login
              </Button>
            </Tabs.Content>
            <Tabs.Content value="signup">
              <div className="text-xs mt-1">
                at least 8 characters long, at least one uppercase letter, at
                least one lowercase letter, and at least one digit
              </div>
              <div className="flex items-center gap-3 mt-12">
                <input
                  id="agree"
                  type="checkbox"
                  className="w-4 h-4"
                  value=""
                  checked={agree}
                  onChange={(e) => setAgree(e.currentTarget.checked)}
                  disabled={loading}
                />
                <label htmlFor="agree" className="text-xs">
                  I agree to the&nbsp;
                  <a
                    href="https://www.termsfeed.com/live/83ff1e0b-62b1-47f1-9b34-8d8630a71da0"
                    target="_blank"
                    className="underline"
                  >
                    privacy policy
                  </a>
                  &nbsp;and&nbsp;
                  <a
                    href="/#"
                    target="_blank"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsOpen(true);
                    }}
                    className="underline"
                  >
                    terms and conditions
                  </a>
                </label>
              </div>
              <div className="mt-3"></div>
              <Button
                style={{ width: "100%" }}
                size="4"
                disabled={signupDisabled}
                type="submit"
                loading={loading}
              >
                Sign up
              </Button>
            </Tabs.Content>
          </div>
        </form>
      </Tabs.Root>
      <TermsAndConditions useOpen={[termsOpen, setTermsOpen]} />
    </div>
  );
}
