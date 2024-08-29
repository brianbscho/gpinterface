import Gpis from "@/components/gpi/Gpis";

export default function Page() {
  return (
    <div className="w-full flex-1 overflow-hidden">
      <Gpis baseUrl="/gpis?" />
    </div>
  );
}
