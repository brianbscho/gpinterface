import ModelResetButton from "@/components/buttons/ModelResetButton";
import Chats from "@/components/chat/Chats";
import Model from "@/components/Model";
import ModelSelect from "@/components/selects/ModelSelect";

export default function Page() {
  return (
    <div className="w-full flex-1 grid grid-cols-[1fr_auto] overflow-hidden">
      <Chats />
      <div className="hidden md:block w-[32rem] h-full relative overflow-hidden">
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-3">
          <ModelSelect />
          <ModelResetButton />
        </div>
        <div className="h-full overflow-y-auto pr-3">
          <Model className="py-3" />
        </div>
      </div>
    </div>
  );
}
