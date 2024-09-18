import ChatCreateButton from "@/components/buttons/ChatCreateButton";
import { Button } from "@/components/ui";
import Link from "next/link";
import GpiDemo from "@/components/gpi/GpiDemo";

export default function Page() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-3 py-12">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-12">
            With <span className="text-theme">gpinterface</span>, you can easily
            create API for your prompts.
          </h2>
          <div className="relative mb-12">
            <div
              className="absolute inset-0 z-10"
              style={{
                backgroundImage: `linear-gradient(to bottom, 
              rgba(0,0,0,0) 0%,
              rgba(0,0,0,0) 80%,
              hsl(var(--background)) 100%
          )`,
              }}
            ></div>
            <picture>
              <img
                src="/chat.png"
                alt="gpinterface create capture"
                className="w-full rounded-lg mb-8"
              />
            </picture>
          </div>
          <ChatCreateButton />
        </section>
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-12">
            Prompt deployment has never been easier!
          </h2>
          <div className="relative">
            <div
              className="absolute inset-0 z-10"
              style={{
                backgroundImage: `linear-gradient(to bottom, 
              rgba(0,0,0,0) 0%,
              rgba(0,0,0,0) 80%,
              hsl(var(--background)) 100%
          )`,
              }}
            ></div>
            <picture>
              <img
                src="/deployment.png"
                alt="gpinterface deployment capture"
                className="w-full rounded-lg mb-8"
              />
            </picture>
          </div>
        </section>
        <div className="mx-auto text-center mb-12">
          <Button
            className="text-2xl font-bold bg-theme p-7 hover:bg-theme/80"
            asChild
          >
            <Link href="/gpis">Check all prompts</Link>
          </Button>
        </div>
        <section className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Simple Deployment 🪄</h3>
            <p>
              Deploy your configured prompts, creating accessible endpoints
              instantly.
            </p>
          </div>
          <div className="p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">
              Easy Prompt Testing 😌
            </h3>
            <p>
              Utilize a web interface to test prompts with various
              configurations effortlessly.
            </p>
          </div>
          <div className="p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">
              Support for Multiple LLMs 🤖
            </h3>
            <p>
              Seamlessly integrate and use different Large Language Models to
              ensure your application is versatile and robust.
            </p>
          </div>
        </section>
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">
            Try it yourself 🤗
          </h2>
          <GpiDemo />
        </section>
        <div className="mx-auto text-center">
          <ChatCreateButton />
        </div>
      </div>
    </div>
  );
}
