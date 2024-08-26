import CopyButton from "@/components/buttons/CopyButton";
import { Badge } from "@/components/ui";
import useModelStore from "@/store/model";
import { getApiConfig } from "@/utils/model";
import { stringify } from "@/utils/string";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { ReactNode } from "react";

type TitlePropt = { title: string; description: string };
function Title({ title, description }: TitlePropt) {
  return (
    <div>
      <Badge variant="tag">{title}</Badge>
      <div className="text-neutral-400">{description}</div>
    </div>
  );
}

type ElementProp = { title: string; children: ReactNode };
function Element({ title, children }: ElementProp) {
  return (
    <div>
      <div className="font-bold text-neutral-100">{title}</div>
      <div className="text-sm text-neutral-400">{children}</div>
    </div>
  );
}

const Authentication = ({ userHashId }: { userHashId: string | null }) => {
  if (!userHashId) return null;
  return (
    <Element title="Header">
      {`Authorization: Bearer {YOUR_GPINTERFACE_API_KEY}`}
    </Element>
  );
};

export default function Document({ api }: { api?: GpiGetResponse }) {
  const models = useModelStore((state) => state.models);
  const model = models.find((m) => m.hashId === api?.modelHashId);
  if (!api || !model) return null;

  return (
    <div className="md:pl-[9.5rem] px-3 pb-3 w-full h-full overflow-y-auto flex flex-col gap-7">
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
        <CopyButton
          text={`${process.env.NEXT_PUBLIC_HOSTNAME}/apis/${api.hashId}`}
        />
      </Element>
      <Title
        title="Chat Completion"
        description="Send a message that will be added to the end of a predefined messages
          and receive an response for one-time chat interactions. Ideal for
          isolated queries without session persistence."
      />
      <Element title="POST">
        {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/chat/completion
      </Element>
      <Authentication userHashId={api.userHashId} />
      <Element title="Body">
        {`{apiHashId: "${api.hashId}", message: string}`}
      </Element>
      <Element title="Response">{`{content: string}`}</Element>
      <Title
        title="Create Session"
        description="Initialize a new session and receive a hashed session ID, enabling
          users to maintain a continuous conversation."
      />
      <Element title="POST">
        {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session
      </Element>
      <Authentication userHashId={api.userHashId} />
      <Element title="Body">
        <div>{`{apiHashId: "${api.hashId}"}`}</div>
      </Element>
      <Element title="Response">{`{hashId: "SESSION_ID"}`}</Element>
      <Title
        title="Session Completion"
        description="Submit query within an active session, where it will be appended to
          the end of existing messages, to receive response that will be stored
          within the session, allowing ongoing dialogue."
      />
      <Element title="POST">
        {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session/completion
      </Element>
      <Authentication userHashId={api.userHashId} />
      <Element title="Body">
        <div>{`{sessionHashId: "SESSION_ID", message: string}`}</div>
      </Element>
      <Element title="Response">{`{content: string}`}</Element>
      <Title
        title="Retrieve Session Messages"
        description="Retrieve the entire message history from a specific session."
      />
      <Element title="GET">
        {`${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session/{sessionHashId}/messages`}
      </Element>
      <Authentication userHashId={api.userHashId} />
      <Element title="Query Parameter">
        {`{sessionHashId: "SESSION_ID"}`}
      </Element>
      <Element title="Response">
        {`{ messages: {role: string; content: string;}[] }`}
      </Element>
    </div>
  );
}
