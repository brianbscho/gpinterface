import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui";

type Props = { children: React.ReactNode; message: string };
export default function TooltipButton({ children, message }: Props) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="flex">{children}</div>
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
