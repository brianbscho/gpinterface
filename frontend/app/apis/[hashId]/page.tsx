import Api from "@/components/api/Api";
import Provider from "@/components/chat/Provider";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  return (
    <div className="w-full flex-1 grid grid-cols-[1fr_auto] gap-3 overflow-hidden">
      <Api hashId={hashId} />
      <Provider />
    </div>
  );
}
