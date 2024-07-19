import { Button } from "@radix-ui/themes";
import Link from "../links/Link";

export default function Create() {
  return (
    <Button asChild>
      <Link href="/thread/create">Write</Link>
    </Button>
  );
}
