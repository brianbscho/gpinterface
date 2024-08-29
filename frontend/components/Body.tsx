import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import MenusDropdown from "./dropdowns/MenusDropdown";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "./ui";
import { CirclePlus } from "lucide-react";
import SearchInput from "./inputs/SearchInput";

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
                <div className="flex-1">
                  <div className="hidden md:block w-full">
                    <SearchInput />
                  </div>
                </div>
                <Link href="/chats">
                  <Button
                    className="bg-background p-0 pl-6 md:pl-8 h-6 md:h-8 w-24 md:w-28 border border-primary box-border relative"
                    variant="icon"
                  >
                    <div className="h-6 md:h-8 w-6 md:w-8 p-1 md:p-1.5 rounded-md absolute -top-px -left-px bg-primary text-primary-foreground">
                      <CirclePlus className="h-4 md:h-5 w-4 md:w-5" />
                    </div>
                    <div className="w-full text-xs md:text-sm">New chat</div>
                  </Button>
                </Link>
                <MenusDropdown />
              </div>
              <div className="md:hidden px-3 pb-3">
                <SearchInput />
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
