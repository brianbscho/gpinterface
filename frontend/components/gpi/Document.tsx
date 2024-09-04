import CopyButton from "@/components/buttons/CopyButton";
import DocumentTry, { BodyType } from "./DocumentTry";
import { Badge } from "@/components/ui";
import { cn } from "@/utils/css";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { Fragment, ReactNode } from "react";
import { CircleAlert } from "lucide-react";

type TitleProps = { title: string; description: string };
function Title({ title, description }: TitleProps) {
  return (
    <div>
      <div className="flex gap-3 items-center mb-1">
        <Badge variant="tag">{title}</Badge>
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

type DocumentProps = { gpi?: GpiGetResponse; className?: string };
export default function Document({ gpi, className }: DocumentProps) {
  const documents: {
    title: string;
    description: string;
    method: "GET" | "POST";
    path: string;
    body: BodyType;
  }[] = [
    {
      title: "Chat Completion",
      description:
        "Send a message that will be added to the end of a predefined messages and receive an response for one-time chat interactions. Ideal for isolated queries without session persistence.",
      method: "POST",
      path: "/chat/completion",
      body: {
        gpiHashId: { value: gpi?.hashId ?? "", type: "const" },
        content: { value: "", type: "variable" },
      },
    },
    {
      title: "Create Session",
      description:
        "Initialize a new session and receive a hashed session ID, enabling users to maintain a continuous conversation.",
      method: "POST",
      path: "/session",
      body: { gpiHashId: { value: gpi?.hashId ?? "", type: "const" } },
    },
    {
      title: "Session Completion",
      description:
        "Submit query within an active session, where it will be appended to the end of existing messages, to receive response that will be stored within the session, allowing ongoing dialogue.",
      method: "POST",
      path: "/session/completion",
      body: {
        sessionHashId: { value: "", type: "variable" },
        content: { value: "", type: "variable" },
      },
    },
    {
      title: "Retrieve Session Messages",
      description:
        "Retrieve the entire message history from a specific session.",
      method: "GET",
      path: "/session/{sessionHashId}/messages",
      body: {},
    },
  ];

  if (!gpi) return null;
  return (
    <div
      className={cn(
        "md:pl-[9.5rem] px-3 pb-3 w-full h-full overflow-y-auto flex flex-col gap-7",
        className
      )}
    >
      <div>
        <Badge variant="tag">Info</Badge>
      </div>
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
      <div className="flex items-center bg-destructive rounded-md px-1 py-2 gap-3">
        <CircleAlert className="text-primary w-5 h-5" />
        <div className="text-primary text-xs">
          This may become unavailable or have its functionality modified by the
          author at any time. To ensure secure access, please make a copy.
        </div>
      </div>
      {documents.map((doc) => {
        const { title, description, ...props } = doc;
        return (
          <Fragment key={title}>
            <Title title={title} description={description} {...props} />
            <DocumentTry {...props} />
          </Fragment>
        );
      })}
    </div>
  );
}
