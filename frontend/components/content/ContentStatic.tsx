type ContentStaticProps = {
  role: string;
  content: string;
  model?: { name: string } | null;
  isModified?: boolean;
};
export default function ContentStatic({ ...props }: ContentStaticProps) {
  const { role, model, isModified, content } = props;
  return (
    <>
      <div className="flex items-center gap-1">
        <div className="text-sm pt-2">
          {role !== "assistant" ? role : !model ? "assistant" : model.name}
        </div>
        {isModified === true && (
          <div className="ml-1 text-xs self-start">*answer modified</div>
        )}
      </div>
      <div className="relative">
        <div className="whitespace-pre-wrap px-3 py-2 text-base border rounded-md bg-neutral-700">
          <div className="min-h-6 text-neutral-300 text-sm">{content}</div>
        </div>
      </div>
    </>
  );
}
