import { Inter } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import { ThemeProvider } from "next-themes";
import Login from "./general/buttons/Login";
import CreateThread from "./general/buttons/CreateThread";
import Menus from "./general/dropdowns/Menus";
import Link from "./general/links/Link";
import Search from "./general/inputs/Search";

const inter = Inter({ subsets: ["latin"] });

export default function Body({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body className={inter.className}>
      <ThemeProvider attribute="class">
        <Theme>
          <main className="h-screen flex flex-col items-center min-h-0 overflow-y-auto">
            <div
              style={{ backgroundColor: "var(--color-background)" }}
              className="sticky top-0 left-0 w-full h-16 z-20 shrink-0 border-b"
            >
              <div className="w-full max-w-7xl h-full mx-auto px-3 flex gap-3 items-center">
                <Link href="/" className="font-bold text-lg">
                  GPInterface ⌨️
                </Link>
                <div className="flex-1">
                  <Search />
                </div>
                <CreateThread />
                <Menus />
                <Login />
              </div>
            </div>
            {children}
          </main>
        </Theme>
      </ThemeProvider>
    </body>
  );
}
