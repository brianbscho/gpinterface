import ModelSelect from "../selects/ModelSelect";
import Model from "./Model";

export default function Provider() {
  return (
    <div className="h-full overflow-hidden w-full md:w-[32rem]">
      <div className="absolute top-3 left-3 z-30">
        <ModelSelect />
      </div>
      <div className="h-full overflow-y-auto pr-3">
        <Model />
      </div>
    </div>
  );
}
