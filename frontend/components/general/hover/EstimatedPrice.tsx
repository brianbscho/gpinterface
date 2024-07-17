import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { HoverCard } from "@radix-ui/themes";

export default function EstimatedPrice() {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger>
        <div className="flex items-start text-nowrap">
          <div>Estimated Price</div>
          <QuestionMarkCircledIcon />
        </div>
      </HoverCard.Trigger>
      <HoverCard.Content>
        Why estimated? because costs vary based on the specific inputs and
        outputs, which affect resource consumption.
      </HoverCard.Content>
    </HoverCard.Root>
  );
}
