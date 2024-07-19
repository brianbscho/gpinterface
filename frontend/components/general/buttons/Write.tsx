import { Button } from "@radix-ui/themes";
import Link from "../links/Link";

export default function Write() {
  return (
    <Button asChild>
      <Link href="/thread/create">Write</Link>
    </Button>
  );
}
