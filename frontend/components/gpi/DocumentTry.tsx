"use client";

import { CirclePlay } from "lucide-react";
import IconTextButton from "../buttons/IconTextButton";
import { Input } from "../ui";
import { FormEvent, Fragment, useCallback, useMemo, useState } from "react";
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
type Props = { method: "POST" | "GET"; path: string; body: BodyType };
export default function DocumentTry({ method, path, body }: Props) {
  const [data, setData] = useState(body);
  const keys = useMemo(() => Object.keys(data), [data]);
  const constKeys = useMemo(
    () => keys.filter((key) => data[key].type === "const"),
    [data, keys]
  );
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
    <div className="whitespace-pre-wrap text-neutral-400 text-xs md:text-sm">
      <form onSubmit={onSubmit}>
        <div className="text-foreground font-bold">Request</div>
        <div className="w-full grid grid-cols-[auto_1fr] items-center mb-3 gap-3">
          {variableKeys.map((key, index) => (
            <Fragment key={key}>
              <div>{key}</div>
              <Input
                placeholder={key}
                className="w-full pt-1 h-auto border-primary focus:border-transparent"
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
              />
            </Fragment>
          ))}
          {path
            .split(/({[^}]+})/)
            .filter((p) => p.includes("{"))
            .map((p) => (
              <Fragment key={p}>
                <div>{p}</div>
                <Input
                  className="w-36 py-0 h-6 border-primary focus:border-transparent"
                  placeholder={p}
                  value={param}
                  onChange={(e) => setParam(e.currentTarget.value)}
                />
              </Fragment>
            ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center">
          <div>{`curl -X ${method} `}</div>
          <div>{`${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}`}</div>
          {path
            .split(/({[^}]+})/)
            .map((p) =>
              p.includes("{") ? (
                <div key={p}>{param || p}</div>
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
        {keys.length > 0 && (
          <div>{`\t-d '{${keys
            .map((key) => `"${key}": "${data[key].value}"`)
            .join(", ")}}'`}</div>
        )}
        <div className="w-full flex justify-end">
          <IconTextButton
            Icon={CirclePlay}
            text="Run"
            className="w-20 md:w-24"
            responsive
            disabled={
              keys.some((key) => !data[key].value) ||
              (paramRequired && param === "") ||
              loading
            }
            type="submit"
            loading={loading}
          />
        </div>
        {response.length > 0 && (
          <div className="mt-7">
            <div className="text-foreground font-bold">Response</div>
            <div className="mt-3 whitespace-pre-wrap">
              {response.replace(/\\(.)/g, handleSpecialCharacters)}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
