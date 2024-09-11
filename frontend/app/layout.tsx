import "./lucide.css";
import "./globals.css";

import type { Metadata } from "next";
import Head from "@/components/Head";
import Body from "@/components/Body";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
  title: "gpinterface | create API for your prompts",
  description:
    "Instantly deploy your generative prompts with our easy-to-use interface, enabling seamless integration to multiple LLMs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_KEY ?? ""}
    >
      <html lang="en" className="h-full w-full">
        <Head />
        <Body>{children}</Body>
      </html>
    </GoogleOAuthProvider>
  );
}
