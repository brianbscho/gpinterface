import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  useToast,
} from "@/components/ui";
import useContentStore from "@/store/content";
import { getApiConfig } from "@/utils/model";
import { stringify } from "@/utils/string";
import { ApiGetResponse } from "gpinterface-shared/type/api";
import { Copy } from "lucide-react";

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
    <>
      <Button disabled>Header</Button>
      <div className="text-sm">{`Authorization: Bearer {YOUR_GPINTERFACE_API_KEY}`}</div>
    </>
  );
};

export default function Document({ api }: { api?: ApiGetResponse }) {
  const models = useContentStore((state) => state.models);
  const model = models.find((m) => m.hashId === api?.modelHashId);
  if (!api) return null;

  return (
    <div className="w-full h-full overflow-y-auto p-3">
      {!!model && (
        <Card className="w-full mb-3">
          <CardHeader>
            <CardTitle>Info</CardTitle>
            <CardDescription>{model.name}</CardDescription>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap">
            <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
              <div className="col-span-2">
                {stringify(getApiConfig(model, api.config))}
              </div>
              <Button disabled>{api.isPublic ? "Public" : "Private"}</Button>
              <div className="text-sm">
                {api.isPublic
                  ? "Accessible by anyone for testing and calling. Only the owner has editing privileges."
                  : "Only the owner can access, test, edit, and call this API."}
              </div>
              <Button disabled>Share</Button>
              <CopyUrl
                url={`${process.env.NEXT_PUBLIC_HOSTNAME}/apis/${api.hashId}`}
              />
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="w-full mb-3">
        <CardHeader>
          <CardTitle>Chat Completion</CardTitle>
          <CardDescription>
            Send a message that will be added to the end of a predefined
            messages and receive an response for one-time chat interactions.
            Ideal for isolated queries without session persistence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
            <Button disabled>POST</Button>
            <div className="text-sm">
              {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/chat/completion
            </div>
            <Authentication userHashId={api.userHashId} />
            <Button disabled>Body</Button>
            <div className="text-sm">{`{apiHashId: "${api.hashId}", message: string}`}</div>
            <Button disabled>Response</Button>
            <div className="text-sm">{`{content: string}`}</div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full mb-3">
        <CardHeader>
          <CardTitle>Create Session</CardTitle>
          <CardDescription>
            Initialize a new session and receive a hashed session ID, enabling
            users to maintain a continuous conversation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
            <Button disabled>POST</Button>
            <div className="text-sm">
              {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session
            </div>
            <Authentication userHashId={api.userHashId} />
            <Button disabled>Body</Button>
            <div className="text-sm">{`{apiHashId: "${api.hashId}"}`}</div>
            <Button disabled>Response</Button>
            <div className="text-sm">{`{hashId: "SESSION_ID"}`}</div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full mb-3">
        <CardHeader>
          <CardTitle>Session Completion</CardTitle>
          <CardDescription>
            Submit query within an active session, where it will be appended to
            the end of existing messages, to receive response that will be
            stored within the session, allowing ongoing dialogue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
            <Button disabled>POST</Button>
            <div className="text-sm">
              {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session/completion
            </div>
            <Authentication userHashId={api.userHashId} />
            <Button disabled>Body</Button>
            <div className="text-sm">{`{sessionHashId: "SESSION_ID", message: string}`}</div>
            <Button disabled>Response</Button>
            <div className="text-sm">{`{content: string}`}</div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full mb-3">
        <CardHeader>
          <CardTitle>Retrieve Session Messages</CardTitle>
          <CardDescription>
            Retrieve the entire message history from a specific session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
            <Button disabled>GET</Button>
            <div className="text-sm">
              {`${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session/{sessionHashId}/messages`}
            </div>
            <Authentication userHashId={api.userHashId} />
            <Button disabled>Query Parameter</Button>
            <div className="text-sm">{`{sessionHashId: "SESSION_ID"}`}</div>
            <Button disabled>Response</Button>
            <div className="text-sm">{`{ messages: {role: string; content: string;}[] }`}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
