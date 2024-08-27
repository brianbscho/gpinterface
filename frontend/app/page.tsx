import Gpis from "@/components/Gpis";

export default function Page() {
  return (
    <div className="w-full flex-1 grid grid-cols-[1fr_auto] overflow-hidden">
      <Gpis />
    </div>
  );
}
