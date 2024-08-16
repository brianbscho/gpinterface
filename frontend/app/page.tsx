import Chats from "@/components/chat/Chats";
import Provider from "@/components/chat/Provider";

export default function Page() {
  return (
    <div className="w-full flex-1 grid grid-cols-[1fr_auto] overflow-hidden">
      <Chats />
      <Provider />
    </div>
  );
}
