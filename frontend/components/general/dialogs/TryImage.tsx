import { ImagePrompt } from "gpinterface-shared/type";
import { Button, Dialog, DialogContent, DialogTrigger } from "@/components/ui";
import RunImagePrompt from "@/components/prompt/RunImagePrompt";

export default function TryImage({
  imagePrompt,
}: {
  imagePrompt: ImagePrompt;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Try</Button>
      </DialogTrigger>
      <DialogContent close className="w-11/12 max-w-4xl">
        <div className="h-[70vh] w-full overflow-y-auto mt-7 mb-3">
          <RunImagePrompt imagePrompt={imagePrompt} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
