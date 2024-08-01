"use client";

import { Loader } from "lucide-react";
import { useEffect, useRef } from "react";

export default function List({
  callApi,
  emptyMessage,
  elements,
  children,
  spinnerHidden,
  useLastHashId,
}: {
  callApi: () => Promise<void>;
  emptyMessage: string;
  elements: { hashId: string }[] | undefined;
  children: React.ReactNode;
  spinnerHidden: boolean;
  useLastHashId: [string, (h: string) => void];
}) {
  const [lastHashId, setLastHashId] = useLastHashId;
  useEffect(() => {
    callApi();
  }, [callApi]);

  const spinnerRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const current = spinnerRef.current;
    if (!current || !elements || elements.length === 0) return;

    const lastElement = elements[elements.length - 1];
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.length > 0 && entries[0].isIntersecting) {
          if (lastHashId !== lastElement.hashId) {
            setLastHashId(lastElement.hashId);
          }
        }
      },
      { root: null }
    );

    observer.observe(current);

    return () => observer.unobserve(current);
  }, [lastHashId, setLastHashId, elements]);

  if (!elements) return null;
  if (elements.length === 0)
    return <div className="w-full text-center my-12">{emptyMessage}</div>;
  return (
    <>
      {children}
      {!spinnerHidden && <Loader ref={spinnerRef} className="mx-auto my-12" />}
    </>
  );
}
