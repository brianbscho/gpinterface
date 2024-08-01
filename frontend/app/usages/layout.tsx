import { Tabs, TabsList, TabsTrigger } from "@/components/ui";
import Link from "next/link";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="w-full max-w-7xl flex flex-col px-3">
      <Tabs defaultValue="text" className="sticky top-16">
        <div className="flex items-center gap-3 bg-background py-3">
          <div className="text-lg font-bold">Usages</div>
          <TabsList>
            <TabsTrigger value="text" asChild>
              <Link href="/usages?value=text">Text</Link>
            </TabsTrigger>
            <TabsTrigger value="image">
              <Link href="/usages?value=image">Image</Link>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
      {children}
    </div>
  );
}
