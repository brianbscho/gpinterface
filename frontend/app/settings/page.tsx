"use client";

import useUserStore from "@/store/user";
import callApi from "@/utils/callApi";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import UpdatePassword from "@/components/general/dialogs/UpdatePassword";
import {
  UserGetMeResponse,
  UserUpdateSchema,
} from "gpinterface-shared/type/user";
import {
  ApiKeyCreateResponse,
  ApiKeyDeleteResponse,
  ApiKeyDeleteSchema,
  ApiKeysGetResponse,
} from "gpinterface-shared/type/apiKey";
import { Static } from "@sinclair/typebox";
import {
  Check,
  CircleX,
  Copy,
  KeyRound,
  Mail,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  Card,
  Input,
} from "@/components/ui";
import MenuButton from "@/components/general/buttons/MenuButton";

export default function Page() {
  const { user, setUser } = useUserStore();

  const [name, setName] = useState("");
  const [apiKeys, setApiKeys] = useState<ApiKeysGetResponse["apiKeys"]>([]);

  const [saveButtonText, setSaveButtonText] = useState("Save");
  useEffect(() => {
    if (!user) return;

    setName(user.name);
  }, [user]);
  const nameValid = useMemo(
    () => /^[a-zA-Z0-9-_~!@#$^&*()+=]+$/.test(name),
    [name]
  );
  const onClickSave = useCallback(async () => {
    if (!nameValid) {
      alert("Please ensure your username meets the required criteria.");
      return;
    }
    const response = await callApi<
      UserGetMeResponse,
      Static<typeof UserUpdateSchema>
    >({
      endpoint: "/user",
      method: "PUT",
      body: { name },
      showError: true,
    });
    if (response) {
      setUser(response.user);
      setSaveButtonText("Saved!");
      setTimeout(() => {
        setSaveButtonText("Save");
      }, 1000);
    }
  }, [nameValid, setUser, name]);

  const router = useRouter();
  const onClickDelete = useCallback(async () => {
    const _confirm = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!_confirm) return;

    await callApi({
      endpoint: "/user",
      method: "DELETE",
      showError: true,
    });
    setUser(undefined);
    router.push("/");
  }, [router, setUser]);

  useEffect(() => {
    const callApiKeysApi = async () => {
      const response = await callApi<ApiKeysGetResponse>({
        endpoint: "/api/keys",
      });
      if (response) {
        setApiKeys(response.apiKeys);
      }
    };
    callApiKeysApi();
  }, []);
  const [newKey, setNewKey] = useState("");
  const onClickGetApiKey = useCallback(async () => {
    const response = await callApi<ApiKeyCreateResponse>({
      endpoint: "/api/key",
      method: "POST",
      body: {},
      showError: true,
    });
    if (response) {
      const { apiKey } = response;
      setNewKey(apiKey.key);
      setApiKeys((prev) => [
        ...prev,
        {
          hashId: apiKey.hashId,
          key: `${apiKey.key.slice(0, 2)}...${apiKey.key.slice(-4)}`,
        },
      ]);
    }
  }, []);

  const onClickApiKeyTrash = useCallback(async (hashId: string) => {
    const _confirm = confirm(
      "Are you sure you want to delete this API key? This action cannot be undone and may cause connected services to stop functioning."
    );
    if (!_confirm) return;

    const response = await callApi<
      ApiKeyDeleteResponse,
      Static<typeof ApiKeyDeleteSchema>
    >({
      endpoint: "/api/key",
      method: "DELETE",
      body: { hashId },
      showError: true,
    });
    if (response) {
      setApiKeys((prev) => prev.filter((p) => p.hashId !== response.hashId));
    }
  }, []);

  if (!user) return null;
  return (
    <div className="flex flex-col gap-3 px-3">
      <div className="mt-3 grid grid-cols-[auto_auto_1fr] gap-3 items-center text-sm">
        <div className="font-bold">Email</div>
        <div className="text-neutral-400 col-span-2">{user.email}</div>
        <div className="font-bold">Username</div>
        <div>
          <Input
            type="text"
            placeholder="Please type your username (no space)"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            Icon={UserRound}
          ></Input>
        </div>
        <div>
          <MenuButton
            onClick={onClickSave}
            disabled={name.length > 0 && !nameValid}
            Icon={Save}
            text={saveButtonText}
            className="w-44"
          />
        </div>
        <div></div>
        <div className="col-span-2">
          {name.length > 0 && !nameValid && (
            <div className="text-xs min-h-4 mt-1 mb-3 text-rose-500">
              You can use only alphanumeric characters and -_,~!@#$^&*()+=
              special characters.
            </div>
          )}
        </div>
        <div className="font-bold">API Keys</div>
        {apiKeys.map((k) => (
          <Fragment key={k.hashId}>
            <div className="text-neutral-400">{k.key}</div>
            <MenuButton
              onClick={() => onClickApiKeyTrash(k.hashId)}
              Icon={Trash2}
              text="Delete"
              className="w-44"
            />
            <div></div>
          </Fragment>
        ))}
        <div className="col-span-2">
          <MenuButton
            onClick={onClickGetApiKey}
            Icon={KeyRound}
            text="Create API Key"
            className="w-44"
          />
        </div>
        <div className="font-bold">Customer support</div>
        <div className="text-neutral-400 flex items-center gap-1 underline col-span-2">
          <a href="mailto:brian.b.cho@bookquilt.com">
            <MenuButton Icon={Mail} text="Send email" className="w-44" />
          </a>
        </div>
        <div className="font-bold">Password</div>
        <div className="col-span-2">
          <UpdatePassword />
        </div>
        <div className="col-span-2"></div>
        <MenuButton
          Icon={CircleX}
          text="Delete account"
          onClick={onClickDelete}
          className="w-44"
          variant="icon_destructive"
        />
      </div>
      <AlertDialog open={newKey.length > 0}>
        <AlertDialogContent className="max-w-fit">
          <AlertDialogTitle>API Key</AlertDialogTitle>
          <AlertDialogDescription>
            <div>
              <div>
                <span className="text-rose-500">Important: </span>
                <span>
                  Your API key is displayed below. Please copy it{" "}
                  <span className="text-rose-500">now</span> and store it
                  <span className="text-rose-500"> securely</span>, as you will
                  not be able to see it again.
                </span>
              </div>
              <Card className="mt-3 p-3">
                <div className="flex items-center gap-3">
                  <div className="text-sm">{newKey}</div>
                  <MenuButton
                    Icon={Copy}
                    text="Copy"
                    onClick={() => navigator.clipboard.writeText(newKey)}
                    className="w-24"
                  />
                </div>
              </Card>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <div className="w-full flex justify-end mt-3">
              <div>
                <MenuButton
                  Icon={Check}
                  text="Confirm"
                  onClick={() => setNewKey("")}
                  className="w-28"
                />
              </div>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
