import SelectModel from "./SelectModel";
import Model from "./Model";

export default function Config() {
  return (
    <div className="h-full overflow-hidden w-[28rem] relative">
      <div className="absolute top-3 left-3">
        <SelectModel />
      </div>
      <div className="h-full overflow-y-auto pl-12 pr-3">
        <Model />
      </div>
    </div>
  );
}
