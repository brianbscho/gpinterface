import Chats from "@/components/chat/Chats";
import ModelPanel from "@/components/ModelPanel";
import ModelSelect from "@/components/selects/ModelSelect";
import ModelResetButton from "@/components/buttons/ModelResetButton";

export default function Page() {
  return (
    <div className="w-full flex-1 grid grid-cols-[1fr_auto] overflow-hidden">
      <Chats />
      <ModelPanel>
        <ModelSelect />
        <ModelResetButton />
      </ModelPanel>
    </div>
  );
}
