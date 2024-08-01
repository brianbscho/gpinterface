import Title from "@/components/thread/Title";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui";
import { HelpCircle } from "lucide-react";

export default function EstimatedPrice() {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger>
        <div className="flex items-start">
          <Title>Estimated Price</Title>
          <HelpCircle />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="text-sm">
        Why estimated? because costs vary based on the specific inputs and
        outputs, which affect resource consumption.
      </HoverCardContent>
    </HoverCard>
  );
}
