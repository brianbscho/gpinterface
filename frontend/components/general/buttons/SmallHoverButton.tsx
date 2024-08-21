import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui";

type Props = { children: React.ReactNode; message: string };
export default function SmallHoverButton({ children, message }: Props) {
  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="h-6">{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className="text-sm w-auto px-3 py-1 border">
        {message}
      </HoverCardContent>
    </HoverCard>
  );
}
