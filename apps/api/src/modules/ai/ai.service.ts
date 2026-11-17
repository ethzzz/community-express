import { config } from '../../common/config.ts';

function mockReply(message: string) {
  const text = message.toLowerCase();
  if (text.includes('发帖') || text.includes('帖子')) {
    return '新帖默认是 pending，管理员审核通过后才会进入关注流。写清背景和你已经试过的步骤，会更容易得到有效回复。';
  }
  if (text.includes('搜索')) {
    return '搜索优先使用 Meilisearch，未配置索引时会降级到 MySQL 的已发布帖子过滤。';
  }
  return '我是围炉助手。当前没有配置模型 Key，所以返回的是本地 fallback；接入 OPENAI_API_KEY 后会自动切换为真实模型。';
}

function split(text: string) {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += 2) {
    chunks.push(text.slice(index, index + 2));
  }
  return chunks;
}

async function* mockStream(message: string) {
  for (const chunk of split(mockReply(message))) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    yield chunk;
  }
}

async function* openAiStream(message: string, signal: AbortSignal) {
  const response = await fetch(`${config.OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.OPENAI_MODEL,
      stream: true,
      messages: [
        {
          role: 'system',
          content: '你是围炉社区助手，回答简洁、具体，优先给出可执行步骤。',
        },
        { role: 'user', content: message },
      ],
    }),
    signal,
  });
  if (!response.ok || !response.body) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const data = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const token = data.choices?.[0]?.delta?.content;
        if (token) yield token;
      } catch {
        // 忽略不完整的 SSE 行
      }
    }
  }
}

export function streamChat(message: string, signal: AbortSignal) {
  return config.OPENAI_API_KEY
    ? openAiStream(message, signal)
    : mockStream(message);
}
