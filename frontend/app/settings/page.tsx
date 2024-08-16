"use client";

import useUserStore from "@/store/user";
import callApi from "@/utils/callApi";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Copy, Mail, Trash2, UserRound } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  Button,
  Card,
  Input,
} from "@/components/ui";

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
    <div className="w-full max-w-7xl flex flex-col gap-3 px-3">
      <table className="mt-3">
        <tbody className="align-middle">
          <tr className="h-10">
            <td className="text-muted-foreground text-sm">Email</td>
            <td className="text-sm">{user.email}</td>
          </tr>
          <tr>
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
          <tr className="align-top">
            <td className="text-muted-foreground text-sm">
              <div className="h-10 flex items-center">API Keys</div>
            </td>
            <td>
              <div>
                <div>
                  <table>
                    {apiKeys.map((k) => (
                      <tr
                        key={k.hashId}
                        className="h-[3.25rem] first:h-10 align-middle"
                      >
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
                  Your daily usage is limited by $1.
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="text-muted-foreground text-sm">
              <div className="h-10 flex items-center">Customer support</div>
            </td>
            <td>
              <div className="text-sm flex items-center gap-1">
                <a href="mailto:brian.b.cho@bookquilt.com">Send email</a>
                <span>
                  <Mail />
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="text-muted-foreground text-sm">
              <div className="h-10 flex items-center">Password</div>
            </td>
            <td>
              <UpdatePassword />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="w-full flex flex-col items-end gap-3">
        <Button onClick={onClickSave}>{saveButtonText}</Button>
        <Button onClick={onClickDelete} variant="destructive">
          Delete account
        </Button>
      </div>
      <AlertDialog open={newKey.length > 0}>
        <AlertDialogContent className="max-w-fit">
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
                <div className="flex items-center">
                  <div className="text-xs px-3">{newKey}</div>
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
          <AlertDialogFooter>
            <div className="w-full flex justify-end mt-3">
              <div>
                <Button onClick={() => setNewKey("")}>Confirm</Button>
              </div>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
