"use client";

import { ThickChevronRightIcon } from "@radix-ui/themes";
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from "react";

interface CollapsibleProps {
  title?: string;
  children: ReactNode;
  onClick?: () => void;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  children,
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (isOpen) {
      content.style.height = "auto";
    } else {
      content.style.height = "0";
    }
  }, [isOpen]);
  const toggle = useCallback(() => {
    if (onClick) {
      onClick();
    }
    setIsOpen((prev) => !prev);
  }, [onClick]);

  const chevronStyle = useMemo(() => {
    const style: React.CSSProperties = {
      transition: "transform 0.1s ease-in-out",
    };
    if (isOpen) {
      style.transform = "rotate(90deg)";
    }
    return style;
  }, [isOpen]);

  return (
    <>
      <button onClick={toggle} className="w-full">
        <div className="flex flex-row items-start gap-3 text-left w-full">
          <ThickChevronRightIcon className="w-3 h-6" style={chevronStyle} />
          <div className={`flex-1 font-bold${isOpen ? "" : " truncate"}`}>
            {title ? title : isOpen ? "Hide" : "Show"}
          </div>
        </div>
      </button>
      <div
        ref={contentRef}
        style={{ transition: "height 0.1s", height: 0 }}
        className="overflow-hidden"
      >
        {children}
      </div>
    </>
  );
};

export default Collapsible;
