import DocumentTry, { BodyType } from "./DocumentTry";
import { cn } from "@/utils/css";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { CircleAlert } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

type TitleProps = { title: string };
function Title({ title }: TitleProps) {
  return <div className="pb-1 text-left font-bold text-xl w-full">{title}</div>;
}

type DocumentProps = {
  gpi?: GpiGetResponse;
  className?: string;
  showWarning: boolean;
};
export default function Document({
  gpi,
  className,
  showWarning,
}: DocumentProps) {
  const documents: {
    title: string;
    description: string;
    method: "GET" | "POST";
    path: string;
    body: BodyType;
  }[] = [
    {
      title: "Chat completion",
      description:
        "Send a message and receive an response for one-time chat interactions. Ideal for isolated queries without session persistence.",
      method: "POST",
      path: `/chat/${gpi?.hashId ?? ""}/completion`,
      body: { content: { value: "", type: "variable" } },
    },
    {
      title: "Create session",
      description:
        "Initialize a new session and receive a hashed session ID, enabling users to maintain a continuous conversation.",
      method: "POST",
      path: "/session",
      body: { gpiHashId: { value: gpi?.hashId ?? "", type: "const" } },
    },
    {
      title: "Session completion",
      description:
        "Submit query within an active session, where it will be appended to the end of existing messages, allowing ongoing dialogue.",
      method: "POST",
      path: "/session/{sessionHashId}/completion",
      body: { content: { value: "", type: "variable" } },
    },
    {
      title: "Retrieve session messages",
      description:
        "Retrieve the entire message history from a specific session.",
      method: "GET",
      path: "/session/{sessionHashId}/messages",
      body: {},
    },
  ];

  if (!gpi) return null;
  return (
    <div className={cn("flex flex-col gap-12", className)}>
      {showWarning && (
        <div className="flex items-center bg-destructive rounded-md px-1 py-2 gap-3">
          <CircleAlert className="text-primary w-5 h-5 shrink-0" />
          <div className="text-primary text-xs">
            This may be modified by the author at any time. To ensure secure
            access, we recommend making a copy.
          </div>
        </div>
      )}
      <Accordion type="multiple">
        {documents.map((doc) => {
          const { title, ...props } = doc;
          return (
            <AccordionItem key={title} value={title}>
              <AccordionTrigger>
                <Title title={title} {...props} />
              </AccordionTrigger>
              <AccordionContent>
                <DocumentTry {...props} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
