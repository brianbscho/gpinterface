import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui";
import { HelpCircle } from "lucide-react";

export default function EstimatedPrice() {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger>
        <div className="flex items-start">
          <div>Estimated Price</div>
          <HelpCircle />
        </div>
      </HoverCardTrigger>
      <HoverCardContent>
        Why estimated? because costs vary based on the specific inputs and
        outputs, which affect resource consumption.
      </HoverCardContent>
    </HoverCard>
  );
}
