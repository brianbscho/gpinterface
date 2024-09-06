import { CircleChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui";
import IconTextButton from "./IconTextButton";
import ModelSelect from "../selects/ModelSelect";
import ModelResetButton from "./ModelResetButton";
import Model from "../Model";
import GpiSaveButton from "./GpiSaveButton";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { Dispatch, SetStateAction } from "react";

type GpiType = GpiGetResponse | undefined;
type Props = {
  className?: string;
  disabled?: boolean;
  useGpi: [GpiType, Dispatch<SetStateAction<GpiType>>];
};
export default function ModelSheetButton({
  className,
  disabled,
  useGpi,
}: Props) {
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
        <div className="w-full h-full overflow-y-auto relative">
          {!disabled && (
            <div className="w-full sticky top-0 p-3 z-30 grid grid-cols-2 gap-3 bg-background">
              <ModelSelect />
              <ModelResetButton />
              <GpiSaveButton useGpi={useGpi} />
            </div>
          )}
          <Model
            className={`p-3${disabled ? " pl-3 md:pl-3" : ""}`}
            disabled={disabled}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
