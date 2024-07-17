import Threads from "@/components/thread/Threads";

export default function Page() {
  return (
    <div className="w-full max-w-7xl px-3">
      <Threads baseUrl="/threads?" />
    </div>
  );
}
