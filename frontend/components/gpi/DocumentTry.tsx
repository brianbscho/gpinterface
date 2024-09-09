"use client";

import { CirclePlay } from "lucide-react";
import IconTextButton from "../buttons/IconTextButton";
import { Input } from "../ui";
import { FormEvent, useCallback, useMemo, useState } from "react";
import callApi from "@/utils/callApi";

function handleSpecialCharacters(match: string, p1: string) {
  switch (p1) {
    case "n":
      return "\n";
    case "t":
      return "\t";
    case "r":
      return "\r";
    case "b":
      return "\b";
    case "f":
      return "\f";
    case "a":
      return "a"; // Note: '\a' (alert) is not a standard escape sequence in JavaScript.
    case '"':
      return '"';
    case "'":
      return "'";
    case "\\":
      return "\\";
    default:
      return match; // This case is redundant as all cases are handled
  }
}

export type BodyType = {
  [key: string]: { value: string; type: "const" | "variable" };
};
type Props = {
  description: string;
  method: "POST" | "GET";
  path: string;
  body: BodyType;
};
export default function DocumentTry({
  method,
  path,
  body,
  description,
}: Props) {
  const [data, setData] = useState(body);
  const keys = useMemo(() => Object.keys(data), [data]);
  const variableKeys = useMemo(
    () => keys.filter((key) => data[key].type === "variable"),
    [data, keys]
  );

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
        ...(keys.length > 0 && {
          body: keys.reduce((acc: { [key: string]: string }, curr) => {
            acc[curr] = data[curr].value;
            return acc;
          }, {}),
        }),
        showError: true,
      });
      if (response) {
        setResponse(JSON.stringify(response, null, 2));
      }
      setLoading(false);
    },
    [method, path, param, data, keys]
  );

  return (
    <div className="whitespace-pre-wrap text-neutral-300 text-xs md:text-sm mt-3">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-start gap-3">
          <div className="flex-1 flex flex-col gap-3">
            <div className="text-sm font-light">{description}</div>
            {variableKeys.map((key, index) => (
              <Input
                key={key}
                placeholder={key}
                className="w-full h-8 border-neutral-500"
                value={data[key].value}
                onChange={(e) =>
                  setData((prev) => {
                    const _data = { ...prev };
                    _data[key] = {
                      value: e.target.value,
                      type: "variable",
                    };
                    return _data;
                  })
                }
                disabled={loading}
              />
            ))}
            {path
              .split(/({[^}]+})/)
              .filter((p) => p.includes("{"))
              .map((p) => (
                <Input
                  key={p}
                  className="w-full py-0 h-8 border-neutral-500"
                  placeholder={p}
                  value={param}
                  onChange={(e) => setParam(e.currentTarget.value)}
                  disabled={loading}
                />
              ))}
            <IconTextButton
              Icon={CirclePlay}
              text="Run"
              responsive
              disabled={
                keys.some((key) => !data[key].value) ||
                (paramRequired && param === "")
              }
              type="submit"
              loading={loading}
              className="self-end"
            />
          </div>
          <div className="w-[26rem] max-w-full flex flex-col gap-3">
            <div className="text-foreground font-bold text-sm">Request</div>
            <div className="bg-neutral-700 rounded-md p-3">
              <div className="whitespace-pre-wrap break-all items-center">
                {`curl -X ${method} ${
                  process.env.NEXT_PUBLIC_CHAT_ENDPOINT
                }${path
                  .split(/({[^}]+})/)
                  .map((p) => (p.includes("{") ? param || p : p))
                  .join("")} \\`}
              </div>
              <div>
                {`\t-H "Authorization: Bearer`}
                <span className="italic font-bold text-theme">
                  {"{API_KEY}"}
                </span>
                &quot; \
              </div>
              <div>{`\t-H "Content-Type: application/json" \\`}</div>
              {keys.length > 0 && (
                <div>{`\t-d '{${keys
                  .map((key) => `"${key}": "${data[key].value}"`)
                  .join(", ")}}'`}</div>
              )}
            </div>
            {response.length > 0 && (
              <div>
                <div className="text-foreground font-bold">Response</div>
                <div className="mt-3 whitespace-pre-wrap bg-neutral-700 rounded-md p-3">
                  {response.replace(/\\(.)/g, handleSpecialCharacters)}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
