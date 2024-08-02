import { TextPrompt } from "gpinterface-shared/type";
import { Button, Dialog, DialogContent, DialogTrigger } from "@/components/ui";
import RunTextPrompt from "@/components/prompt/RunTextPrompt";

export default function TryText({ textPrompt }: { textPrompt: TextPrompt }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Try</Button>
      </DialogTrigger>
      <DialogContent close className="w-11/12 max-w-4xl">
        <div className="h-[70vh] w-full overflow-y-auto mt-7 mb-3">
          <RunTextPrompt textPrompt={textPrompt} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
