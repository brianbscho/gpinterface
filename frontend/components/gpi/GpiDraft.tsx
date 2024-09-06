import IconTextButton from "../buttons/IconTextButton";
import { CircleX, FileCog } from "lucide-react";
import Link from "next/link";
import ContentStatic from "@/components/content/ContentStatic";
import { Badge } from "../ui";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";

type Props = { gpi: GpiGetResponse };
export default function GpiDraft({ gpi }: Props) {
  return (
    <div className="w-full border border-theme rounded-md px-3 pt-3">
      <Badge variant="tag">Draft</Badge>
      <div className="sticky top-0 rounded-md w-full py-3 grid grid-cols-3 md:flex gap-3 bg-background z-30">
        <div className="flex-1 md:flex-initial md:w-32">
          <Link href={`/gpis/${gpi.hashId}/edit`}>
            <IconTextButton
              className="w-full md:w-32"
              Icon={FileCog}
              text="Edit"
              responsive
            />
          </Link>
        </div>
        <div className="flex-1 md:flex-initial md:w-32">
          <IconTextButton
            className="w-full md:w-32"
            Icon={CircleX}
            variant="icon_destructive"
            text="Delete"
            responsive
          />
        </div>
      </div>
      <div className="w-full">
        <div className="flex flex-col gap-3 mb-3">
          {gpi.systemMessage.length > 0 && (
            <ContentStatic role="system" content={gpi.systemMessage} />
          )}
          {gpi.contents.map((content) => (
            <ContentStatic key={content.hashId} {...content} />
          ))}
        </div>
      </div>
    </div>
  );
}
