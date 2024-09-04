import { Badge, CardContent, CardDescription } from "./ui";

type ContentStaticProps = {
  role: string;
  content: string;
  model?: { name: string } | null;
  isModified?: boolean;
};
export default function ContentStatic({ ...props }: ContentStaticProps) {
  const { role, model, isModified, content } = props;
  return (
    <CardContent className="p-0">
      <div className="flex items-center gap-1">
        {role !== "assistant" && <Badge variant="tag">{role}</Badge>}
        {role === "assistant" && (
          <Badge variant="tag">{!model ? "assistant" : model.name}</Badge>
        )}
        {isModified === true && (
          <div className="ml-1 text-xs self-start">*answer modified</div>
        )}
      </div>
      <CardDescription>
        <div className="relative mt-3">
          <div className="whitespace-pre-wrap px-3 py-2 text-base border rounded-md">
            <div className="min-h-6">{content}</div>
          </div>
        </div>
      </CardDescription>
    </CardContent>
  );
}
