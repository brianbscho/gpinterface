import CopyButton from "@/components/buttons/CopyButton";
import TryButton from "@/components/buttons/TryButton";
import { Badge } from "@/components/ui";
import useModelStore from "@/store/model";
import { getApiConfig } from "@/utils/model";
import { stringify } from "@/utils/string";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { ReactNode } from "react";

type TitleProps = {
  title: string;
  description: string;
  method: "GET" | "POST";
  path: string;
  body: { [key: string]: string | undefined };
  keys: string[];
};
function Title({ title, description, ...props }: TitleProps) {
  return (
    <div>
      <div className="flex gap-3 items-center mb-1">
        <Badge variant="tag">{title}</Badge>
        <TryButton title={title} {...props} />
      </div>
      <div className="text-neutral-400">{description}</div>
    </div>
  );
}

type ElementProps = { title: string; children: ReactNode };
function Element({ title, children }: ElementProps) {
  return (
    <div>
      <div className="font-bold text-neutral-100">{title}</div>
      <div className="text-sm text-neutral-400 text-wrap">{children}</div>
    </div>
  );
}

const Authentication = () => {
  return (
    <Element title="Header">
      {`Authorization: Bearer {YOUR_GPINTERFACE_API_KEY}`}
    </Element>
  );
};

type GpiProps = {
  title: string;
  description: string;
  method: "GET" | "POST";
  path: string;
  body: { [key: string]: string | undefined };
  keys: string[];
  response: string;
};
function Gpi({ title, description, response, ...props }: GpiProps) {
  const { method, path, body, keys } = props;

  return (
    <>
      <Title title={title} description={description} {...props} />
      <Element title={method}>
        {`${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}${path}`}
      </Element>
      <Authentication />
      {(Object.keys(body).length > 0 || keys.length > 0) && (
        <Element title="Body">
          {`{`}
          {Object.keys(body)
            .map((key) => `"${key}": "${body[key]}"`)
            .concat(keys.map((key) => `"${key}": "string"`))
            .join(", ")}
          {`}`}
        </Element>
      )}
      <Element title="Response">{response}</Element>
    </>
  );
}

export default function Document({ gpi }: { gpi?: GpiGetResponse }) {
  const models = useModelStore((state) => state.models);
  const model = models.find((m) => m.hashId === gpi?.modelHashId);
  const documents = [
    {
      title: "Chat Completion",
      description:
        "Send a message that will be added to the end of a predefined messages and receive an response for one-time chat interactions. Ideal for isolated queries without session persistence.",
      method: "POST" as const,
      path: "/chat/completion",
      body: { gpiHashId: gpi?.hashId ?? "" },
      keys: ["content"],
      response: "{content: string}",
    },
    {
      title: "Create Session",
      description:
        "Initialize a new session and receive a hashed session ID, enabling users to maintain a continuous conversation.",
      method: "POST" as const,
      path: "/session",
      body: { gpiHashId: gpi?.hashId ?? "" },
      keys: [],
      response: '{hashId: "SESSION_ID"}',
    },
    {
      title: "Session Completion",
      description:
        "Submit query within an active session, where it will be appended to the end of existing messages, to receive response that will be stored within the session, allowing ongoing dialogue.",
      method: "POST" as const,
      path: "/session/completion",
      body: {},
      keys: ["sessionHashId", "content"],
      response: "{content: string}",
    },
    {
      title: "Retrieve Session Messages",
      description:
        "Retrieve the entire message history from a specific session.",
      method: "GET" as const,
      path: "/session/{sessionHashId}/messages",
      body: {},
      keys: [],
      response: "{ messages: {role: string; content: string;}[] }",
    },
  ];
  if (!gpi || !model) return null;

  return (
    <div className="md:pl-[9.5rem] px-3 pb-3 w-full h-full overflow-y-auto flex flex-col gap-7">
      <div>
        <Badge variant="tag">Info</Badge>
        <div className="font-bold">{model.name}</div>
      </div>
      <Element title="Model config">
        {Object.keys(gpi.config).length === 0
          ? "Default"
          : stringify(getApiConfig(model, gpi.config))}
      </Element>
      <Element title={gpi.isPublic ? "Public" : "Private"}>
        {gpi.isPublic
          ? "Accessible by anyone for testing and calling. Only the owner has editing privileges."
          : "Only the owner can access, test, edit, and call this GPI."}
      </Element>
      <Element title="Share">
        <CopyButton
          text={`${process.env.NEXT_PUBLIC_HOSTNAME}/gpis/${gpi.hashId}`}
        />
      </Element>
      {documents.map((doc) => (
        <Gpi key={doc.path} {...doc} />
      ))}
    </div>
  );
}
