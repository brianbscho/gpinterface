import { ReactNode } from "react";
import Model from "./Model";

type Props = { topPadding?: boolean; children: ReactNode };
export default function ModelPanel({ topPadding = true, children }: Props) {
  return (
    <div className="hidden md:block w-[32rem] h-full relative overflow-hidden">
      <div
        className={`absolute ${
          topPadding ? "top-3" : "top-0"
        } left-3 z-30 flex flex-col gap-3`}
      >
        {children}
      </div>
      <div className="h-full overflow-y-auto pr-3">
        <Model className={topPadding ? "py-3" : "pb-3"} />
      </div>
    </div>
  );
}
