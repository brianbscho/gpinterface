import { ChevronLeft } from "lucide-react";
import { Button, Sheet, SheetContent, SheetTrigger } from "../ui";
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
  modelHashId?: string;
  isIcon?: boolean;
};
export default function ModelSheetButton({
  className,
  editable,
  disabled,
  useGpi,
  modelHashId,
  isIcon,
}: Props) {
  return (
    <Sheet>
      <SheetTrigger className={className} asChild>
        {isIcon ? (
          <Button variant="default" className="h-6 w-6 p-1 ">
            <ChevronLeft />
          </Button>
        ) : (
          <IconTextButton
            Icon={ChevronLeft}
            text="Model"
            size="small"
            className="w-full md:w-32"
            responsive
          />
        )}
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
          <Model
            className="p-3"
            disabled={disabled}
            modelHashId={modelHashId}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
