type ChatBody = {
  message?: string;
};

function buildReply(message: string) {
  const text = message.toLowerCase();

  if (text.includes('发帖') || text.includes('帖子') || text.includes('post')) {
    return `可以按这个顺序试：

1. 打开「写点什么」，先写清背景和你已经试过的步骤。
2. 新帖默认是 pending，管理员审核通过后才会进入关注流。
3. 如果发帖后没看到，先确认帖子状态，而不是反复提交。

当前是演示模式；接入真实模型后，这里会替换成基于社区内容的回答。`;
  }

  if (text.includes('搜索') || text.includes('search')) {
    return `搜索会先尝试后端的 /api/v1/search/posts；如果接口还没上线，会降级到已发布帖子做本地过滤。

所以现在你输入关键词也能看到结果，只是数据量和排序能力有限。`;
  }

  return `我是围炉的演示助手。现在还没有接真实模型，但交互链路是完整的：前端流式读取、可停止、失败有 fallback。

你可以问我「怎么发帖」「搜索怎么工作」，或者直接说说你正在做什么。`;
}

function encode(text: string) {
  return new TextEncoder().encode(text);
}

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_AI_ENABLED === 'false') {
    return new Response('AI assistant is disabled', { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as ChatBody;
  const message = body.message?.trim();
  if (!message) {
    return new Response('message is required', { status: 400 });
  }

  const answer = buildReply(message);
  let timer: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      let offset = 0;
      timer = setInterval(() => {
        controller.enqueue(encode(answer.slice(offset, offset + 2)));
        offset += 2;
        if (offset >= answer.length) {
          if (timer) clearInterval(timer);
          controller.close();
        }
      }, 24);
    },
    cancel() {
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
