"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { validateEmail, validatePassword } from "gpinterface-shared/string";
import callApi from "@/utils/callApi";
import useUserStore from "@/store/user";
import {
  UserCreateSchema,
  UserGetMeResponse,
  UserGoogleSchema,
} from "gpinterface-shared/type/user";
import { Static } from "@sinclair/typebox";
import {
  Input,
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
  Separator,
} from "@/components/ui";
import {
  Lock,
  Mail,
  UserRound,
  UserRoundCheck,
  UserRoundPlus,
} from "lucide-react";
import { Checkbox } from "@/components/ui";
import IconTextButton from "@/components/buttons/IconTextButton";
import GoogleLoginButton from "./GoogleLoginButton";
import { useGoogleLogin } from "@react-oauth/google";
import GithubLoginButton from "./GithubLoginButton";

export default function Page() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const loginDisabled = useMemo(
    () => email === "" || password === "",
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
      if (response) {
        setUser(response.user);
      } else {
        setLoading(false);
      }
    },
    [email, name, password, isLogin, setUser]
  );
  const onClickGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const { access_token } = tokenResponse;
      const response = await callApi<
        UserGetMeResponse,
        Static<typeof UserGoogleSchema>
      >({
        endpoint: "/user/google",
        method: "POST",
        body: { access_token },
        showError: true,
      });
      if (response) {
        setUser(response.user);
      } else {
        setLoading(false);
      }
    },
  });

  const githubOauthEndpoint = useMemo(() => {
    const clientId = encodeURIComponent(
      process.env.NEXT_PUBLIC_GITHUB_OAUTH_CLIENT_ID ?? ""
    );
    const redirectUri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_HOSTNAME}/login/github`
    );
    const scope = encodeURIComponent("scope=read:user,user:email");

    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  }, []);

  return (
    <div className="w-full max-w-sm px-3">
      <div className="mt-20 w-full">
        <GoogleLoginButton onClick={onClickGoogleLogin} />
      </div>
      {!!githubOauthEndpoint && (
        <div className="mt-3 w-full">
          <a href={githubOauthEndpoint}>
            <GithubLoginButton />
          </a>
        </div>
      )}
      <div className="my-12 flex items-center gap-3">
        <div className="flex-1">
          <Separator className="bg-theme" />
        </div>
        <div>OR</div>
        <div className="flex-1">
          <Separator className="bg-theme" />
        </div>
      </div>
      <Tabs
        className="w-full mt-12"
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
              <IconTextButton
                className="w-full"
                disabled={loginDisabled}
                type="submit"
                loading={loading}
                text="Login"
                Icon={UserRoundCheck}
                size="large"
              />
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
                    href="https://www.termsfeed.com/live/0ce4dbce-17c2-4551-89c9-eb14fe206b71"
                    target="_blank"
                    className="underline"
                  >
                    privacy policy
                  </a>
                  &nbsp;and&nbsp;
                  <a href="/terms" target="_blank" className="underline">
                    terms and conditions
                  </a>
                </label>
              </div>
              <div className="mt-3"></div>
              <IconTextButton
                className="w-full"
                disabled={signupDisabled}
                type="submit"
                loading={loading}
                text="Sign up"
                Icon={UserRoundPlus}
                size="large"
              />
            </TabsContent>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
