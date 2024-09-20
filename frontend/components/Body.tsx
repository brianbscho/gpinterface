import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import MenusDropdown from "./dropdowns/MenusDropdown";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import ChatCreateButton from "./buttons/ChatCreateButton";
import LoginDialog from "./dialogs/LoginDialog";

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
              <div className="w-full p-3 flex gap-1 items-center">
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
                <ChatCreateButton isIcon />
                <MenusDropdown />
              </div>
            </div>
          </div>
          <div className="w-full flex-1 overflow-hidden">{children}</div>
          <LoginDialog />
        </main>
        <Toaster />
      </ThemeProvider>
    </body>
  );
}
