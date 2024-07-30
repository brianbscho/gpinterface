import { Metadata } from "next";
import Bookmarks from "./bookmarks";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "gpinterface - bookmarks" };
}

export default function Page() {
  return <Bookmarks />;
}
