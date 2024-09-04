"use client";

import Link from "next/link";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui";

type Props = { title?: string; useOpen: [boolean, (open: boolean) => void] };
export default function LoginDialog({
  title = "Please log in first :)",
  useOpen,
}: Props) {
  const [open, setOpen] = useOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <div className="w-full flex justify-end">
          <DialogClose>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
