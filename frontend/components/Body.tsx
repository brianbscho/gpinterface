import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import MenusDropdown from "./dropdowns/MenusDropdown";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import { ShadcnButton } from "./ui";
import { Plus } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function Body({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body className={inter.className}>
      <ThemeProvider attribute="class" forcedTheme="dark">
        <main className="h-screen flex flex-col items-center min-h-0 overflow-hidden">
          <div className="sticky top-0 left-0 w-full z-20 shrink-0 bg-background">
            <div className="w-full border-b">
              <div className="w-full p-3 flex gap-3 items-center">
                <Link href="/" className="font-bold text-lg">
                  <div>
                    <picture>
                      <img
                        src="/logo.png"
                        alt="logo"
                        className="block h-6 md:h-8 w-auto"
                      />
                    </picture>
                  </div>
                </Link>
                <div className="flex-1"></div>
                <ShadcnButton asChild className="h-6 w-6 p-0 md:h-8 md:w-8">
                  <Link href="/chats">
                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                </ShadcnButton>
                <MenusDropdown />
              </div>
            </div>
          </div>
          {children}
        </main>
        <Toaster />
      </ThemeProvider>
    </body>
  );
}
