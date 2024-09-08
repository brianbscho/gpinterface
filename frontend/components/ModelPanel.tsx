import Model from "./Model";
import ModelSelect from "./selects/ModelSelect";
import ModelResetButton from "./buttons/ModelResetButton";
import { cn } from "@/utils/css";

type Props = { className?: string };
export default function ModelPanel({ className }: Props) {
  return (
    <div className={cn("h-full w-full relative overflow-hidden", className)}>
      <div className="w-full md:w-auto md:absolute top-0 left-0 p-3 z-30 grid grid-cols-2 md:flex md:flex-col gap-1 md:gap-3 bg-background">
        <ModelSelect />
        <ModelResetButton />
      </div>
      <Model className="p-3 pt-0 md:pt-3 h-full overflow-y-auto" />
    </div>
  );
}
