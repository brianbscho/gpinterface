import { Post as PostType } from "gpinterface-shared/type";
import TextPrompt from "../prompt/TextPrompt";
import ImagePrompt from "../prompt/ImagePrompt";
import Footer from "./Footer";

export default function Post({
  post,
  setPost,
}: {
  post: PostType;
  setPost: (p: PostType) => void;
}) {
  return (
    <div className="border-b mb-24">
      <div className="mt-3 whitespace-pre-line">{post.post}</div>
      {post.textPrompts.map((t) => (
        <div key={t.hashId} className="mt-3 w-full overflow-x-auto">
          <TextPrompt textPrompt={t} />
        </div>
      ))}
      {post.imagePrompts.map((i) => (
        <div key={i.hashId} className="mt-3 w-full overflow-x-auto">
          <ImagePrompt imagePrompt={i} />
        </div>
      ))}
      <Footer post={post} setPost={setPost} />
    </div>
  );
}
