"use client";

import { Play, X } from "lucide-react";
import IconTextButton from "./IconTextButton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  Input,
} from "../ui";
import { DialogDescription } from "@radix-ui/react-dialog";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import callApi from "@/utils/callApi";

type Props = {
  title: string;
  method: "POST" | "GET";
  path: string;
  body: { [key: string]: string | undefined };
  keys: string[];
};
export default function TryButton({ title, method, path, body, keys }: Props) {
  const [data, setData] = useState(body);
  useEffect(() => {
    setData((prev) => {
      const newData = { ...prev };
      keys.forEach((key) => {
        newData[key] = "";
      });
      return newData;
    });
  }, [keys]);

  const paramRequired = useMemo(() => path.includes("{"), [path]);
  const [param, setParam] = useState("");

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      setLoading(true);
      const endpoint = path
        .split(/({[^}]+})/)
        .map((p) => (p.includes("{") ? param : p))
        .join("");
      const response = await callApi({
        method,
        endpoint,
        ...(Object.keys(data).length > 0 && { body: data }),
        showError: true,
      });
      if (response) {
        setResponse(JSON.stringify(response, null, 2));
      }
      setLoading(false);
    },
    [method, path, param, data]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconTextButton Icon={Play} text="Try" size="small" className="w-16" />
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-11/12 overflow-y-auto">
        <DialogHeader>{title}</DialogHeader>
        <DialogDescription className="whitespace-pre-wrap text-neutral-400 text-xs md:text-base">
          <form onSubmit={onSubmit}>
            <div className="flex flex-wrap items-center">
              <div>{`curl -X ${method} `}</div>
              <div>{`${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}`}</div>
              {path.split(/({[^}]+})/).map((p) =>
                p.includes("{") ? (
                  <div key={p}>
                    <Input
                      className="w-36 py-0 h-6"
                      placeholder={p}
                      value={param}
                      onChange={(e) => setParam(e.currentTarget.value)}
                    />
                  </div>
                ) : (
                  <div key={p}>{p}</div>
                )
              )}
            </div>
            <div>
              {`\t-H "Authorization: Bearer `}
              <span className="italic bold text-foreground">{"{API_KEY}"}</span>
              &quot;
            </div>
            <div>{`\t-H "Content-Type: application/json"`}</div>
            {(Object.keys(body).length > 0 || keys.length > 0) && (
              <>
                <div className="flex flex-wrap items-start">
                  <div>{`\t-d '{${Object.keys(body).map(
                    (key) => `"${key}": "${body[key]}"`
                  )}${
                    Object.keys(body).length > 0 && keys.length > 0 ? ", " : ""
                  }${keys.length === 0 ? `}'` : ""}`}</div>
                </div>
                {keys.length > 0 && (
                  <div className="w-full">
                    <div className="w-full">
                      {keys.map((key, index) => (
                        <div
                          key={key}
                          className="w-full flex flex-wrap items-center mt-3 first:mt-0"
                        >
                          <div>{`\t\t\t"${key}": "`}</div>
                          <div className="flex-1">
                            <Input
                              placeholder={key}
                              className="w-full pt-1 h-auto"
                              value={data[key]}
                              onChange={(e) =>
                                setData((prev) => {
                                  const newData = { ...prev };
                                  newData[key] = e.currentTarget.value;
                                  return newData;
                                })
                              }
                            />
                          </div>
                          &quot;{index < keys.length - 1 ? "," : ""}
                        </div>
                      ))}
                      <div>{`\t\t}'`}</div>
                    </div>
                  </div>
                )}
              </>
            )}
            {response.length > 0 && (
              <div className="mt-7">
                <div className="text-foreground text-base text-center sm:text-left">
                  Response
                </div>
                <div className="mt-3 whitespace-pre-wrap">
                  {response.replace("\\n", "\n")}
                </div>
              </div>
            )}
            <div className="mt-3 w-full flex justify-end gap-3">
              <IconTextButton
                Icon={Play}
                text="Run"
                className="w-20 md:w-24"
                responsive
                disabled={
                  (Object.keys(data).length > 0 &&
                    Object.keys(data).some((key) => !data[key])) ||
                  (paramRequired && param === "")
                }
                type="submit"
                loading={loading}
              />
              <DialogClose asChild>
                <IconTextButton
                  Icon={X}
                  text="Close"
                  className="w-20 md:w-24"
                  responsive
                />
              </DialogClose>
            </div>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
