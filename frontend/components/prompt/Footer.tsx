"use client";

import Title from "../thread/Title";
import { Button } from "../ui";
import { Checkbox } from "../ui/checkbox";

export default function Footer({
  useIsPublic,
  onClickCancel,
  onClickCreate,
  createText = "Create",
  loading,
}: {
  useIsPublic: [boolean, (i: boolean) => void, boolean];
  onClickCancel?: () => void;
  onClickCreate: () => void;
  createText?: string;
  loading: boolean;
}) {
  const [isPublic, setIsPublic, isEditable] = useIsPublic;

  return (
    <div className="w-full">
      {isEditable && (
        <div className="flex gap-3 md:gap-7">
          <div className="flex gap-3 items-center w-32">
            <Title>Public</Title>
            <Checkbox
              checked={isPublic}
              onCheckedChange={(c) =>
                typeof c === "boolean" ? setIsPublic(c) : undefined
              }
            />
          </div>
          <div className="text-xs md:leading-10 md:text-sm">
            AI content can only be edited when it is set to private; public
            prompt cannot be modified.
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3">
        {onClickCancel !== undefined && (
          <div>
            <Button variant="outline" onClick={onClickCancel} loading={loading}>
              Cancel
            </Button>
          </div>
        )}
        <div>
          <Button onClick={onClickCreate} loading={loading}>
            {createText}
          </Button>
        </div>
      </div>
    </div>
  );
}
