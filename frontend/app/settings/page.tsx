"use client";

import useUserStore from "@/store/user";
import callApi from "@/util/callApi";
import {
  AlertDialog,
  Button,
  Card,
  DataList,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Password from "@/components/general/dialogs/Password";
import { CopyIcon, PersonIcon, TrashIcon } from "@radix-ui/react-icons";
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

export default function Page() {
  const { user, setUser } = useUserStore();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  const [saveButtonText, setSaveButtonText] = useState("Save");
  useEffect(() => {
    if (!user) return;

    setName(user.name);
    setBio(user.bio);
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
      body: { name, bio },
      showError: true,
    });
    if (response) {
      setUser(response.user);
      setSaveButtonText("Saved!");
      setTimeout(() => {
        setSaveButtonText("Save");
      }, 1000);
    }
  }, [nameValid, setUser, name, bio]);

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
      <DataList.Root>
        <DataList.Item style={{ height: "2rem", alignItems: "center" }}>
          <DataList.Label>Email</DataList.Label>
          <DataList.Value>{user.email}</DataList.Value>
        </DataList.Item>
        <DataList.Item style={{ height: "2rem" }}>
          <DataList.Label>Username</DataList.Label>
          <DataList.Value>
            <TextField.Root
              type="text"
              size="3"
              placeholder="Please type your username (no space)"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
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
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Bio</DataList.Label>
          <DataList.Value>
            <TextArea
              value={bio}
              className="flex-1 h-40"
              onChange={(e) => setBio(e.currentTarget.value)}
            ></TextArea>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>API Keys</DataList.Label>
          <DataList.Value>
            <div>
              <table className="mb-3">
                {apiKeys.map((k) => (
                  <tr key={k.hashId}>
                    <td>{k.key}</td>
                    <td className="pl-3">
                      <Button
                        variant="outline"
                        size="1"
                        onClick={() => onClickApiKeyTrash(k.hashId)}
                      >
                        <TrashIcon />
                      </Button>
                    </td>
                  </tr>
                ))}
              </table>
              <Button size="1" onClick={onClickGetApiKey}>
                Get API Key
              </Button>
            </div>
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
      <div className="my-3 text-xs flex justify-end">
        <a href="mailto:brian.b.cho@bookquilt.com">Customer Support</a>
      </div>
      <div className="w-full flex justify-end gap-3 mt-4">
        <Password />
        <Button onClick={onClickSave}>{saveButtonText}</Button>
      </div>
      <div className="self-end">
        <Button onClick={onClickDelete} color="crimson" variant="outline">
          Delete account
        </Button>
      </div>
      <AlertDialog.Root open={newKey.length > 0}>
        <AlertDialog.Trigger>
          <div></div>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Title>API Key</AlertDialog.Title>
          <AlertDialog.Description>
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
                    variant="soft"
                    size="1"
                    onClick={() => navigator.clipboard.writeText(newKey)}
                  >
                    <CopyIcon />
                  </Button>
                </div>
              </Card>
            </div>
          </AlertDialog.Description>
          <AlertDialog.Action>
            <div className="w-full flex justify-end mt-3">
              <div>
                <Button onClick={() => setNewKey("")}>Confirm</Button>
              </div>
            </div>
          </AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
}
