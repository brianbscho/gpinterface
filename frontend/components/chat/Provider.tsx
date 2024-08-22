import SelectModel from "./SelectModel";
import Model from "./Model";

export default function Provider() {
  return (
    <div className="h-full overflow-hidden w-[32rem]">
      <div className="absolute top-3 left-3">
        <SelectModel />
      </div>
      <div className="h-full overflow-y-auto pr-3">
        <Model />
      </div>
    </div>
  );
}
