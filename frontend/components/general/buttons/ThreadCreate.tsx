import { Button } from "@radix-ui/themes";
import Link from "../links/Link";

export default function ThreadCreate() {
  return (
    <Button asChild>
      <Link href="/thread/create">Create</Link>
    </Button>
  );
}
