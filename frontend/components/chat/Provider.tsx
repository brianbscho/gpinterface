import SelectModel from "./SelectModel";
import Model from "./Model";

export default function Config() {
  return (
    <div className="h-full px-3 pb-3 overflow-y-auto w-96">
      <SelectModel />
      <Model />
    </div>
  );
}
