import { ChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui";
import IconTextButton from "./IconTextButton";
import ModelSelect from "../selects/ModelSelect";
import ModelResetButton from "./ModelResetButton";
import Model from "../Model";
import EditGpiButtons from "./EditGpiButtons";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { Dispatch, SetStateAction } from "react";

type GpiType = GpiGetResponse | undefined;
type Props = {
  className?: string;
  editable?: boolean;
  disabled?: boolean;
  useGpi?: [gpi: GpiType, Dispatch<SetStateAction<GpiType>>];
};
export default function ModelSheetButton({
  className,
  editable,
  disabled,
  useGpi,
}: Props) {
  return (
    <Sheet>
      <SheetTrigger className={className} asChild>
        <IconTextButton
          Icon={ChevronLeft}
          text="Models"
          size="small"
          className="w-24"
        />
      </SheetTrigger>
      <SheetContent className="p-0">
        <div className="w-full h-full overflow-y-auto relative">
          {!disabled && (
            <div className="w-full sticky top-0 p-3 z-30 grid grid-cols-2 gap-3 bg-background">
              <ModelSelect />
              <ModelResetButton />
              {editable === true && useGpi && (
                <EditGpiButtons useGpi={useGpi} />
              )}
            </div>
          )}
          <Model className="p-3" disabled={disabled} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
