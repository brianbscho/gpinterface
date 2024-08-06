"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { validateEmail, validatePassword } from "gpinterface-shared/string";
import callApi from "@/utils/callApi";
import TermsAndConditions from "@/components/general/dialogs/TermsAndConditions";
import useUserStore from "@/store/user";
import {
  UserCreateSchema,
  UserGetMeResponse,
} from "gpinterface-shared/type/user";
import { Static } from "@sinclair/typebox";
import {
  Button,
  Input,
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
} from "@/components/ui";
import { Lock, Mail, UserRound } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

  const setUser = useUserStore((state) => state.setUser);
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
    <div className="w-full max-w-md px-3 mt-16">
      <Tabs
        className="w-full"
        defaultValue="login"
        onValueChange={(e) => setIsLogin(e === "login")}
      >
        <TabsList className="w-full">
          <TabsTrigger value="login" className="flex-1">
            Login
          </TabsTrigger>
          <TabsTrigger value="signup" className="flex-1">
            Sign up
          </TabsTrigger>
        </TabsList>
        <form onSubmit={onSubmit} noValidate>
          <div className="mt-12">
            <TabsContent value="signup">
              <Input
                type="text"
                placeholder="Please type your username (no space)"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                disabled={loading}
                Icon={UserRound}
              />
              <div className="text-xs min-h-4 mt-1 mb-3 text-rose-500">
                {name.length > 0 &&
                  !nameValid &&
                  "You can use only alphanumeric characters and -_,~!@#$^&*()+= special characters."}
              </div>
            </TabsContent>
            <Input
              type="email"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              disabled={loading}
              Icon={Mail}
            />
            <div className="mt-1 text-xs h-4 text-rose-500">{emailMsg}</div>
            <Input
              type="password"
              placeholder="Please use secure password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="mt-3"
              disabled={loading}
              Icon={Lock}
            />
            <div className="mt-1 text-xs h-4 text-rose-500">{passwordMsg}</div>
          </div>
          <div>
            <TabsContent value="login" className="mt-12">
              <Button
                className="w-full"
                disabled={loginDisabled}
                type="submit"
                loading={loading}
              >
                Login
              </Button>
            </TabsContent>
            <TabsContent value="signup">
              <div className="text-xs mt-1">
                at least 8 characters long, at least one uppercase letter, at
                least one lowercase letter, and at least one digit
              </div>
              <div className="flex items-center gap-3 mt-12">
                <Checkbox
                  id="agree"
                  className="w-4 h-4"
                  value=""
                  checked={agree}
                  onCheckedChange={(c) =>
                    typeof c === "boolean" ? setAgree(c) : undefined
                  }
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
                className="w-full"
                disabled={signupDisabled}
                type="submit"
                loading={loading}
              >
                Sign up
              </Button>
            </TabsContent>
          </div>
        </form>
      </Tabs>
      <TermsAndConditions useOpen={[termsOpen, setTermsOpen]} />
    </div>
  );
}
