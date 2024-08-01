import { Textarea } from "@/components/ui";
import { KeyboardEvent, TextareaHTMLAttributes, useRef } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  useValue: [string, (v: string) => void];
};

function IndentTextarea({ useValue, ...props }: Props) {
  const [value, setValue] = useValue;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const current = textareaRef.current;
    if (!current) return;

    const { selectionStart, selectionEnd } = current;

    if (event.key === "Enter") {
      event.preventDefault();
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);

      const match = beforeCursor.match(/[\r\n]+([ \t]+)[^\r\n]*$/);
      const indentation = match ? match[1] : "";

      const newValue = beforeCursor + "\n" + indentation + afterCursor;
      setValue(newValue);

      setTimeout(() => {
        current.selectionStart = current.selectionEnd =
          selectionStart + indentation.length + 1;
      }, 0);
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      {...props}
      onKeyDown={handleKeyDown}
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
    />
  );
}

export default IndentTextarea;
