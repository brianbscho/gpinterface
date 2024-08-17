import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { ApiGetResponse } from "gpinterface-shared/type/api";

const Authentication = ({ userHashId }: { userHashId: string | null }) => {
  if (!userHashId) return null;
  return (
    <>
      <Button disabled>Header</Button>
      <div className="text-sm">{`Authorization: Bearer {YOUR_GPINTERFACE_API_KEY}`}</div>
    </>
  );
};

export default function Document({ api }: { api?: ApiGetResponse["api"] }) {
  if (!api) return null;

  return (
    <div className="w-full h-full overflow-y-auto p-3">
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
