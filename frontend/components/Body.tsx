import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Menus from "./general/dropdowns/Menus";
import Link from "./general/links/Link";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export default function Body({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body className={inter.className}>
      <ThemeProvider attribute="class">
        <main className="h-screen flex flex-col items-center min-h-0 overflow-hidden">
          <div className="sticky top-0 left-0 w-full z-20 shrink-0 bg-background">
            <div className="w-full border-b h-16">
              <div className="w-full h-full px-3 flex gap-3 items-center">
                <Link href="/" className="font-bold text-lg">
                  <picture>
                    <img
                      src="/logo_black.png"
                      alt="logo"
                      height="27"
                      width="117"
                      className="block dark:hidden h-7 w-auto"
                    />
                  </picture>
                  <picture>
                    <img
                      src="/logo_white.png"
                      alt="logo"
                      className="hidden dark:block h-7 w-auto"
                    />
                  </picture>
                </Link>
                <div className="flex-1"></div>
                <Menus />
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
