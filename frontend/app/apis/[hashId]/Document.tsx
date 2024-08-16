import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

type Props = { apiHashId: string };
export default function Document({ apiHashId }: Props) {
  return (
    <div className="w-full h-full overflow-y-auto p-3">
      <Card className="w-full mb-3">
        <CardHeader>
          <CardTitle>Chat Completion</CardTitle>
          <CardDescription>
            Send a message and receive an response for one-time chat
            interactions. Ideal for isolated queries without session
            persistence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
            <Button disabled>POST</Button>
            <div className="text-sm">
              {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/chat/completion
            </div>
            <Button disabled>Header</Button>
            <div className="text-sm">{`Authorization: Bearer {GPINTERFACE_API_KEY}`}</div>
            <Button disabled>Body</Button>
            <div className="text-sm">{`{apiHashId: "${apiHashId}", message: string}`}</div>
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
            <Button disabled>Header</Button>
            <div className="text-sm">{`Authorization: Bearer {GPINTERFACE_API_KEY}`}</div>
            <Button disabled>Body</Button>
            <div className="text-sm">{`{apiHashId: "${apiHashId}"}`}</div>
            <Button disabled>Response</Button>
            <div className="text-sm">{`{hashId: string}`}</div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full mb-3">
        <CardHeader>
          <CardTitle>Session Completion</CardTitle>
          <CardDescription>
            Submit query within an active session to receive response that will
            be stored within the session, allowing ongoing dialogue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
            <Button disabled>POST</Button>
            <div className="text-sm">
              {process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session/completion
            </div>
            <Button disabled>Header</Button>
            <div className="text-sm">{`Authorization: Bearer {GPINTERFACE_API_KEY}`}</div>
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
              {`${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/session/{sessionId}/messages`}
            </div>
            <Button disabled>Header</Button>
            <div className="text-sm">{`Authorization: Bearer {GPINTERFACE_API_KEY}`}</div>
            <Button disabled>Query Parameter</Button>
            <div className="text-sm">{`{sessionId: "SESSION_ID"}`}</div>
            <Button disabled>Response</Button>
            <div className="text-sm">{`{ messages: {role: string; content: string;}[] }`}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
