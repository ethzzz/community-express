import { AiChat } from '@/components/ai-chat';

export default function AssistantPage() {
  return (
    <main className="mx-auto max-w-3xl py-8 sm:py-10">
      <section className="mb-6 border-b border-[var(--line)] pb-7">
        <p className="eyebrow">Assistant</p>
        <h1 className="font-display mt-2 text-4xl font-semibold">AI 助手</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          把问题说清楚，助手会流式回答。AI 失败时，登录、feed 和发帖仍然可用。
        </p>
      </section>
      <AiChat />
    </main>
  );
}
