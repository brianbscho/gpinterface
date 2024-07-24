import { HoverCard } from "@radix-ui/themes";
import { HelpCircle } from "lucide-react";

export default function EstimatedPrice() {
  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger>
        <div className="flex items-start">
          <div>Estimated Price</div>
          <HelpCircle />
        </div>
      </HoverCard.Trigger>
      <HoverCard.Content>
        Why estimated? because costs vary based on the specific inputs and
        outputs, which affect resource consumption.
      </HoverCard.Content>
    </HoverCard.Root>
  );
}
