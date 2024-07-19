import "@radix-ui/themes/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import Head from "@/components/Head";
import Body from "@/components/Body";

export const metadata: Metadata = {
  title: "gpinterface",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full w-full">
      <Head />
      <Body>{children}</Body>
    </html>
  );
}
