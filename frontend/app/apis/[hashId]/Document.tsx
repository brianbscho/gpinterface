import { Badge, useToast } from "@/components/ui";
import useContentStore from "@/store/content";
import { getApiConfig } from "@/utils/model";
import { stringify } from "@/utils/string";
import { ApiGetResponse } from "gpinterface-shared/type/api";
import { Copy } from "lucide-react";
import { ReactNode } from "react";

type ElementProp = { title: string; children: ReactNode };
function Element({ title, children }: ElementProp) {
  return (
    <div>
      <div className="font-bold">{title}</div>
      <div className="text-neutral-500">{children}</div>
    </div>
  );
}

const CopyUrl = ({ url }: { url: string }) => {
  const { toast } = useToast();

  return (
    <div
      className="flex items-center text-sm underline gap-1 cursor-pointer"
      onClick={() => {
        navigator.clipboard.writeText(`${url}`);
        toast({ title: "Copied!", duration: 1000 });
      }}
    >
      {`${url}`}
      <Copy />
    </div>
  );
};

const Authentication = ({ userHashId }: { userHashId: string | null }) => {
  if (!userHashId) return null;
  return (
    <Element title="Header">
      {`Authorization: Bearer {YOUR_GPINTERFACE_API_KEY}`}
    </Element>
  );
};

export default function Document({ api }: { api?: ApiGetResponse }) {
  const models = useContentStore((state) => state.models);
  const model = models.find((m) => m.hashId === api?.modelHashId);
  if (!api) return null;

  return (
    <div className="w-full h-full overflow-y-auto pl-[8.5rem] p-3 flex flex-col gap-7 text-sm">
      {!!model && (
        <>
          <div>
            <Badge variant="tag">Info</Badge>
            <div className="font-bold">{model.name}</div>
          </div>
          <Element title="Model config">
            {Object.keys(api.config).length === 0
              ? "Default"
              : stringify(getApiConfig(model, api.config))}
          </Element>
          <Element title={api.isPublic ? "Public" : "Private"}>
            {api.isPublic
              ? "Accessible by anyone for testing and calling. Only the owner has editing privileges."
              : "Only the owner can access, test, edit, and call this API."}
          </Element>
          <Element title="Share">
            <CopyUrl
              url={`${process.env.NEXT_PUBLIC_HOSTNAME}/apis/${api.hashId}`}
            />
          </Element>
        </>
      )}
      <div>
        <Badge variant="tag">Chat Completion</Badge>
        <div className="text-neutral-500">
          Send a message that will be added to the end of a predefined messages
          and receive an response for one-time chat interactions. Ideal for
          isolated queries without session persistence.
        </div>
      </div>
      <Element title="POST">
        {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/chat/completion
      </Element>
      <Authentication userHashId={api.userHashId} />
      <Element title="Body">{`{apiHashId: "${api.hashId}", message: string}`}</Element>
      <Element title="Response">{`{content: string}`}</Element>
      <div>
        <Badge variant="tag">Create Session</Badge>
        <div className="text-neutral-500">
          Initialize a new session and receive a hashed session ID, enabling
          users to maintain a continuous conversation.
        </div>
      </div>
      <Element title="POST">
        {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session
      </Element>
      <Authentication userHashId={api.userHashId} />
      <Element title="Body">
        <div className="text-sm">{`{apiHashId: "${api.hashId}"}`}</div>
      </Element>
      <Element title="Response">{`{hashId: "SESSION_ID"}`}</Element>
      <div>
        <Badge variant="tag">Session Completion</Badge>
        <div className="text-neutral-500">
          Submit query within an active session, where it will be appended to
          the end of existing messages, to receive response that will be stored
          within the session, allowing ongoing dialogue.
        </div>
      </div>
      <Element title="POST">
        {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session/completion
      </Element>
      <Authentication userHashId={api.userHashId} />
      <Element title="Body">
        <div className="text-sm">{`{sessionHashId: "SESSION_ID", message: string}`}</div>
      </Element>
      <Element title="Response">{`{content: string}`}</Element>
      <div>
        <Badge variant="tag">Retrieve Session Messages</Badge>
        <div className="text-neutral-500">
          Retrieve the entire message history from a specific session.
        </div>
      </div>
      <Element title="GET">
        {`${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session/{sessionHashId}/messages`}
      </Element>
      <Authentication userHashId={api.userHashId} />
      <Element title="Query Parameter">
        <div className="text-sm">{`{sessionHashId: "SESSION_ID"}`}</div>
      </Element>
      <Element title="Response">{`{ messages: {role: string; content: string;}[] }`}</Element>
    </div>
  );
}
