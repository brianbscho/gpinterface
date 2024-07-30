"use client";

import useUserStore from "@/store/user";
import callApi from "@/util/callApi";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Password from "@/components/general/dialogs/Password";
import {
  UserGetMeResponse,
  UserUpdateSchema,
} from "gpinterface-shared/type/user";
import { ApiKey } from "gpinterface-shared/type";
import {
  ApiKeyCreateResponse,
  ApiKeyDeleteResponse,
  ApiKeyDeleteSchema,
  ApiKeysGetResponse,
} from "gpinterface-shared/type/apiKey";
import { Static } from "@sinclair/typebox";
import { Copy, Trash2, UserRound } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  Input,
} from "@/components/ui";

export default function Page() {
  const { user, setUser } = useUserStore();

  const [name, setName] = useState("");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

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
    <div className="w-full max-w-7xl flex flex-col gap-3 px-3">
      <table className="mt-3">
        <tbody className="align-top">
          <tr>
            <td className="text-muted-foreground text-sm">Email</td>
            <td className="text-sm">{user.email}</td>
          </tr>
          <tr className="align-middle">
            <td className="text-muted-foreground text-sm">Username</td>
            <td>
              <Input
                type="text"
                placeholder="Please type your username (no space)"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                Icon={UserRound}
              ></Input>
              {name.length > 0 && !nameValid && (
                <div className="text-xs min-h-4 mt-1 mb-3 text-rose-500">
                  You can use only alphanumeric characters and -_,~!@#$^&*()+=
                  special characters.
                </div>
              )}
            </td>
          </tr>
          <tr>
            <td className="text-muted-foreground text-sm">
              <div className="mt-1">API Keys</div>
            </td>
            <td>
              <div>
                <div>
                  <table>
                    {apiKeys.map((k) => (
                      <tr key={k.hashId}>
                        <td className="text-sm">{k.key}</td>
                        <td>
                          <Button
                            variant="outline"
                            onClick={() => onClickApiKeyTrash(k.hashId)}
                            className="p-0 h-7 w-7"
                          >
                            <Trash2 />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </table>
                  <Button onClick={onClickGetApiKey} className="mt-3">
                    Get API Key
                  </Button>
                </div>
                <div className="mt-3 text-sm">
                  <ul>
                    <li>
                      1. We are currently in the beta phase of our product
                      launch.
                    </li>
                    <li>
                      2. During this beta period, there will be no charges for
                      your use of the service.
                    </li>
                    <li>
                      3. As part of our beta testing phase, your daily usage is
                      capped at $1.
                    </li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="text-xs flex justify-end">
        <a href="mailto:brian.b.cho@bookquilt.com">Customer Support</a>
      </div>
      <div className="w-full flex justify-end gap-3">
        <Password />
        <Button onClick={onClickSave}>{saveButtonText}</Button>
      </div>
      <div className="self-end">
        <Button onClick={onClickDelete} variant="destructive">
          Delete account
        </Button>
      </div>
      <AlertDialog open={newKey.length > 0}>
        <AlertDialogTrigger>
          <div></div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>API Key</AlertDialogTitle>
          <AlertDialogDescription>
            <div>
              <div>
                <span className="text-rose-500">Important: </span>
                <span>
                  Your API key is displayed below. Please copy it now and store
                  it securely, as you will not be able to see it again.
                </span>
              </div>
              <Card className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="text-xs">{newKey}</div>
                  <Button
                    variant="secondary"
                    onClick={() => navigator.clipboard.writeText(newKey)}
                  >
                    <Copy />
                  </Button>
                </div>
              </Card>
            </div>
          </AlertDialogDescription>
          <AlertDialogAction>
            <div className="w-full flex justify-end mt-3">
              <div>
                <Button onClick={() => setNewKey("")}>Confirm</Button>
              </div>
            </div>
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
