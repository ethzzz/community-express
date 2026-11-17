'use client';

import { useRef, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { SparkIcon } from '@/components/icons';

type Message = { role: 'user' | 'assistant'; content: string };

const suggestions = ['怎么发帖？', '搜索是怎么工作的？', '这个项目用了哪些技术？'];

export function AiChat() {
  const enabled = process.env.NEXT_PUBLIC_AI_ENABLED !== 'false';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  async function send(question?: string) {
    const message = (question ?? input).trim();
    if (!message || streaming) return;

    setInput('');
    setError('');
    setMessages((items) => [
      ...items,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
    setStreaming(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error('AI 暂时不可用');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let answer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;

          try {
            const data = JSON.parse(payload) as { token?: string };
            if (!data.token) continue;
            answer += data.token;
            setMessages((items) => {
              const next = [...items];
              next[next.length - 1] = { role: 'assistant', content: answer };
              return next;
            });
          } catch {
            // 忽略不完整的 SSE 行
          }
        }
      }
    } catch (chatError) {
      if ((chatError as Error).name !== 'AbortError') {
        setError('AI 暂时不可用，请稍后再试。');
        setMessages((items) => {
          const next = [...items];
          next[next.length - 1] = {
            role: 'assistant',
            content: '这次没有连上助手。主链路不受影响，可以稍后再试。',
          };
          return next;
        });
      }
    } finally {
      setStreaming(false);
      controllerRef.current = null;
    }
  }

  function stop() {
    controllerRef.current?.abort();
  }

  if (!enabled) {
    return (
      <div className="card px-6 py-14 text-center">
        <p className="font-display text-2xl font-semibold">AI 助手未开启</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          设置 NEXT_PUBLIC_AI_ENABLED=true 后重新启动前端即可。
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <div className="flex items-center gap-2">
          <SparkIcon className="h-4 w-4 text-[var(--accent)]" />
          <p className="text-sm font-semibold">围炉助手</p>
          <span className="chip ml-auto">演示模式</span>
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          当前使用本地流式回复；接入真实模型后只替换 BFF。
        </p>
      </div>

      <div className="min-h-[320px] space-y-4 px-5 py-5">
        {messages.length === 0 && (
          <div className="rounded-2xl bg-[var(--surface-2)] p-5">
            <p className="font-display text-xl font-semibold">想问点什么？</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              可以先试一个示例，看看流式输出和停止按钮。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button className="chip hover:border-[var(--line-strong)]" key={item} onClick={() => void send(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            key={`${message.role}-${index}`}
          >
            <Avatar name={message.role === 'user' ? '我' : 'AI'} size="sm" />
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${
                message.role === 'user'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-2)] text-[var(--ink-soft)]'
              }`}
            >
              {message.content || (streaming ? '正在想...' : '')}
            </div>
          </div>
        ))}
      </div>

      <form
        className="flex gap-2 border-t border-[var(--line)] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          className="field"
          onChange={(event) => setInput(event.target.value)}
          placeholder="问问围炉助手..."
          value={input}
        />
        {streaming ? (
          <button className="admin-danger shrink-0" onClick={stop} type="button">
            停止
          </button>
        ) : (
          <button className="btn-primary shrink-0" type="submit">
            发送
          </button>
        )}
      </form>
      {error && <p className="px-5 pb-4 text-xs text-red-600">{error}</p>}
    </div>
  );
}
