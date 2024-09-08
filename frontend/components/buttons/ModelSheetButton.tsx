import { CircleChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui";
import IconTextButton from "./IconTextButton";
import ModelPanel from "../ModelPanel";

type Props = { className?: string };
export default function ModelSheetButton({ className }: Props) {
  return (
    <Sheet>
      <SheetTrigger className={className} asChild>
        <IconTextButton
          Icon={CircleChevronLeft}
          text="Model"
          size="small"
          className="md:w-32"
          responsive
        />
      </SheetTrigger>
      <SheetContent className="p-0">
        <ModelPanel />
      </SheetContent>
    </Sheet>
  );
}
