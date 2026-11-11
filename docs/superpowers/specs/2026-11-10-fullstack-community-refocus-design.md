# 社区全栈项目重定位设计（方案 A：Express + NestJS + Next.js）

- 日期：2026-11-10
- 状态：待 review
- 目标岗位：全栈工程师（Node + React/Next），兼顾 Node 后端
- 时间预算：2–3 个月
- 现有资产：Express 公共 API、Prisma 6.19.3、MySQL 8、Zod、Pino、Day 1–2 基础设施

---

## 1. 背景与目标

当前项目是一个 Express + Prisma 的社区后端骨架，已经覆盖配置、日志、错误和 Prisma 领域模型，但距离“能演示、能部署、能讲清架构取舍”的全栈作品还有明显差距。

这次重定位的目标：

1. **补齐全栈交付**：Next.js 前台 + Express 公共 API + NestJS 管理/BFF，形成完整可演示产品。
2. **补齐市场高频信号**：NestJS、Redis、RabbitMQ、OpenAPI、OpenTelemetry、Docker/K8s、测试。
3. **保留既有资产**：不重写 Express 公共 API；NestJS 只做管理/BFF，约占后端代码 1/3。
4. **保持可迭代**：先用模块化单体跑通，再按真实边界拆管理服务；不为了简历堆微服务。

**非目标**：全面迁移 NestJS、GraphQL、MongoDB、同时维护多套 ORM、Service Mesh、生产级多集群 K8s。

---

## 2. 市场差距与优先级

| 能力 | 市场要求 | 当前 | 优先级 |
|---|---|---|---|
| Next.js 全栈前端 | React/Next、SSR、API 联调 | 无 | P0 |
| NestJS 管理/BFF | NestJS、DI、Guard、Swagger | 无 | P1（M2） |
| Redis | 缓存、限流、SSE Pub/Sub | 无 | P0 |
| JWT/Cookie/CORS/Helmet | 认证与基础安全 | 只有 argon2 | P0 |
| OpenAPI | Swagger/契约共享 | 无 | P0 |
| 测试 | Vitest/Supertest/Playwright/Testcontainers | 无 | P0/P1 |
| Dockerfile/CI | 多阶段构建、GitHub Actions | 只有 compose | P0 |
| RabbitMQ | 跨服务事件总线 | 无 | P1 |
| OpenTelemetry/Prometheus/Grafana/Sentry | 可观测性 | 只有 Pino | P1 |
| K8s/Helm | 部署清单、探针、HPA | 无 | P1/P2 |
| Meilisearch | 搜索 | 无 | P2 |
| AI/RAG | LLM 流式、内容审核 | 无 | P2 |

> NestJS 市场信号很强，但执行上放在 P1/M2：先用 P0 把全栈产品跑通，再用 NestJS 补企业工程信号。如果目标改为纯后端，可把 NestJS 提到 M1，并缩小前端范围。

**优先级原则**：P0 先保证“能演示的全栈产品”；P1 补企业工程信号；P2 做差异化，可裁剪。

## 2.1 技术选型决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 公共 API 框架 | 保留 Express 5 | 现有资产可用；面试可讲“为什么不全用 NestJS” |
| 管理/BFF 框架 | 新增 NestJS 12 | 模块/DI/Guard/Swagger 覆盖企业 JD 高频要求 |
| ORM | 保留 Prisma 6.19.3 | 现代、类型安全；不引入第二套 ORM |
| 数据库 | 保留 MySQL 8 | 国内 JD 覆盖足够；PostgreSQL 差异作为面试知识补 |
| 缓存/限流/SSE | 新增 ioredis | Redis 是后端 JD 高频项 |
| 事件/任务 | 保留 BullMQ + 新增 RabbitMQ | BullMQ 做任务，RabbitMQ 做跨服务事件 |
| API 文档 | 新增 OpenAPI/Swagger | 契约共享、前端生成 client |
| 可观测性 | 新增 OpenTelemetry/Prometheus/Grafana/Sentry | 从“能跑”到“能排障” |
| 前端 | 新增 Next.js App Router | 全栈岗位核心要求，复用前端优势 |
| 测试 | 新增 Vitest/Supertest/Playwright/Testcontainers | 单元/集成/E2E 都有证据 |
| 部署 | Docker + GitHub Actions + K8s/Helm | 覆盖 Docker/K8s/CI 高频要求 |
| 搜索 | 新增 Meilisearch（P2） | 比 Elasticsearch 轻，演示搜索闭环 |
| AI | LLM 流式/RAG（P2） | 差异化加分，不阻塞主线 |
| 明确不引入 | TypeORM、GraphQL、MongoDB、Service Mesh | 避免多套 ORM/协议/基础设施稀释项目故事 |

> NestJS 12 已支持 ESM、Vitest + SWC、Zod 直连，和现有 TS/Zod 方向契合；但 `nest-cli` 对 TS 7 的 programmatic API 支持仍需 spike 验证。若不兼容，`admin-api` 单独用 SWC 或 TS 5.9，`apps/api` 继续 TS 7。

---

## 3. 总体架构

```text
                    ┌──────────────────────┐
                    │  apps/web (Next.js)  │
                    │  社区前台 + 管理后台  │
                    └──────────┬───────────┘
                               │ HTTPS
                    ┌──────────▼───────────┐
                    │  Ingress / Nginx     │
                    └──────┬────────┬──────┘
                           │        │
              ┌────────────▼──┐  ┌──▼────────────────┐
              │ apps/api      │  │ apps/admin-api    │
              │ Express 5     │  │ NestJS 12         │
              │ 公共社区 API   │  │ 管理/BFF          │
              └───┬───┬───┬───┘  └───┬───────────┬───┘
                  │   │   │          │           │
              ┌───▼┐ ┌▼──┐ ┌▼────┐ ┌▼─────┐ ┌───▼────┐
              │MySQL│ │Redis│ │RabbitMQ│ │MySQL │ │RabbitMQ│
              │核心 │ │缓存 │ │事件   │ │治理  │ │消费    │
              └────┘ └────┘ └──────┘ └──────┘ └────────┘
```

- **公共 API**：面向社区用户，负责认证、内容、关系、feed、通知。
- **管理/BFF**：面向运营/审核，负责审核、举报、用户管理、审计、Dashboard。
- **Web**：只调 API，不直接连库；公共页面调 Express，管理页面调 NestJS。
- **事件**：公共 API 的业务事务写 Outbox，worker 发布到 RabbitMQ；管理端/搜索/通知消费。
- **可观测**：两个 API 接 OpenTelemetry，trace 通过 HTTP 和 RabbitMQ header 传播。

---

## 4. Monorepo 目录与迁移

```text
community/
  apps/
    api/
      src/
      prisma/
      tests/
      package.json
      tsconfig.json
    admin-api/
      src/
        modules/
        common/
      prisma/
      test/
      package.json
      tsconfig.json
    web/
      app/
      components/
      lib/
      package.json
      next.config.ts
  packages/
    shared/
      src/
        contracts/
        events/
        errors/
        types/
  infra/
    docker/
      docker-compose.yml
    k8s/
      helm/
    otel/
      collector-config.yaml
  docs/
    adr/
    superpowers/specs/
  pnpm-workspace.yaml
  package.json
```

### 迁移策略

1. `git mv` 现有 `src/`、`../../../apps/api/prisma`、`tsconfig.json`、`package.json` 到 `apps/api/`，保留历史。
2. 根 `package.json` 只保留 workspace 脚本和共享 devDependencies。
3. `pnpm-workspace.yaml` 增加 `packages: [apps/*, packages/*]`。
4. 现有 `../../../infra/docker/docker-compose.yml` 移到 `infra/docker/`，路径和 volume 同步调整。
5. 迁移完成标准：`pnpm -r typecheck`、`pnpm -r build`、`apps/api` 的 `/health` 全部通过。

> 迁移是 P0 的第一步，先做“搬家不改业务”，再叠新功能，避免同时改目录和逻辑。

---

## 5. 服务边界与数据归属

| 服务 | 拥有 | 不拥有 |
|---|---|---|
| `apps/api` | users、refresh_tokens、roles、permissions、user_roles、role_permissions、posts、comments、likes、follows、notifications、reports、outbox_events、idempotency_keys | moderation_records、admin_audit_logs |
| `apps/admin-api` | moderation_records、admin_audit_logs、processed_events | 核心用户/内容表、reports |
| `apps/web` | 无数据库 | — |

> `reports` 留在公共 API，因为用户在这里创建举报；管理端通过内部接口读取/处理。`moderation_records` 和 `admin_audit_logs` 归管理端；M2 开始时把 `moderation_records` 从核心 schema 迁到 admin schema，开发期可直接重建测试库。

### 跨服务调用

管理端需要读取/修改核心内容时，调用公共 API 的内部接口，不直接改核心表：

| 内部接口 | 用途 |
|---|---|
| `GET /internal/posts?status=` | 管理端帖子列表 |
| `GET /internal/posts/:id` | 帖子详情 |
| `POST /internal/posts/:id/status` | 审核通过/拒绝 |
| `GET /internal/users?query=` | 用户列表 |
| `GET /internal/users/:id` | 用户详情 |
| `POST /internal/users/:id/status` | 封禁/解封 |
| `GET /internal/reports?status=` | 举报列表 |
| `POST /internal/reports/:id/resolve` | 处理举报 |
| `GET /internal/auth/permissions` | 权限校验（可选，JWT 已带 permissions） |

**内部鉴权**：`X-Internal-Token` + 环境变量 `INTERNAL_API_TOKEN`，仅内网可达；后续可换 mTLS。不要把内部接口暴露到公网 Ingress。

**回退方案**：如果 M2 时间紧张，允许共享 MySQL，但必须保留 Prisma schema 边界和内部接口契约；不回退到“管理端直接 import 核心 repository”。

---

## 6. API 契约与认证

### 公共 API（Express）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/v1/auth/register` | 注册 |
| POST | `/api/v1/auth/login` | 登录 |
| POST | `/api/v1/auth/refresh` | 刷新 |
| POST | `/api/v1/auth/logout` | 登出 |
| GET/PATCH | `/api/v1/users/me` | 当前用户 |
| POST/DELETE | `/api/v1/users/:id/follow` | 关注/取关 |
| GET/POST | `/api/v1/posts` | 列表/发帖 |
| GET/DELETE | `/api/v1/posts/:id` | 详情/软删除 |
| GET/POST | `/api/v1/posts/:postId/comments` | 评论 |
| POST/DELETE | `/api/v1/posts/:postId/like` | 点赞 |
| GET | `/api/v1/feed` | 关注流 |
| GET/POST | `/api/v1/notifications`、`/read` | 通知 |
| GET | `/api/v1/notifications/stream` | SSE |
| POST | `/api/v1/reports` | 举报 |
| GET | `/health`、`/ready`、`/metrics` | 运维 |

### 管理 API（NestJS）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/v1/admin/dashboard/stats` | 待审核/举报/用户/帖子统计 |
| GET | `/api/v1/admin/posts?status=` | 帖子列表 |
| POST | `/api/v1/admin/posts/:id/approve` | 审核通过 |
| POST | `/api/v1/admin/posts/:id/reject` | 审核拒绝 |
| GET | `/api/v1/admin/comments?status=` | 评论列表 |
| POST | `/api/v1/admin/comments/:id/approve` | 评论通过 |
| POST | `/api/v1/admin/comments/:id/reject` | 评论拒绝 |
| GET | `/api/v1/admin/reports` | 举报列表 |
| POST | `/api/v1/admin/reports/:id/resolve` | 处理举报 |
| GET | `/api/v1/admin/users` | 用户列表 |
| POST | `/api/v1/admin/users/:id/ban` | 封禁 |
| POST | `/api/v1/admin/users/:id/unban` | 解封 |
| GET | `/api/v1/admin/audit-logs` | 审计日志 |
| GET | `/health`、`/ready`、`/metrics` | 运维 |

### 认证与 RBAC

- 公共 API 签发 access JWT（15m）+ refresh Cookie（httpOnly）。
- Access token 包含 `sub`、`roles`、`permissions`、`jti`、`exp`。
- 管理 API 用同一 `JWT_SECRET` 验签，`PermissionsGuard` 检查 `permissions`；不重复登录。
- Web 端：refresh Cookie 由浏览器持有；access token 放内存；Next.js route handler 为 SSR 转发 Cookie。
- CORS 只允许 `WEB_ORIGIN`；`helmet`、限流、请求体大小限制、CSRF 策略按 Cookie 模式配置。

---

## 7. 事件与异步链路

### 事件清单

| 事件 | 生产者 | 消费者 | 传输 | 用途 |
|---|---|---|---|---|
| `post.created` | api | admin-api | RabbitMQ | 审核队列/看板 |
| `post.published` | api | search-indexer | RabbitMQ | 搜索索引 |
| `report.created` | api | admin-api | RabbitMQ | 举报队列 |
| `comment.created` | api | notification | BullMQ | 站内通知 |
| `like.created` | api | notification | BullMQ | 站内通知 |
| `follow.created` | api | notification | BullMQ | 站内通知 |

### 传输

- 所有副作用事件先在业务事务内写 `outbox_events`；outbox worker 按事件类型路由：跨服务事件发 RabbitMQ，站内通知入 BullMQ。
- RabbitMQ exchange：`community.events`；BullMQ 继续负责站内通知、延迟任务和重试。
- M1 先只启用 BullMQ 路由；`post.created` / `post.published` / `report.created` 的 RabbitMQ 路由在 M2 接入后再开启，避免 P0 引入未使用的基础设施。
- 事件 envelope：

```json
{
  "id": "evt_...",
  "type": "post.created",
  "version": 1,
  "occurredAt": "2026-11-10T00:00:00.000Z",
  "traceId": "...",
  "payload": {}
}
```

- RabbitMQ 消费者建 `processed_events(event_id unique)` 做幂等；重复投递直接跳过。
- BullMQ 用 `jobId = outbox event id` + `notifications.event_id` 唯一键双重幂等。
- traceparent 写入 RabbitMQ message header，管理端/搜索消费者继续同一条 trace。

**为什么 RabbitMQ + BullMQ 并存**：RabbitMQ 解决跨服务事件分发，BullMQ 解决 Redis 任务队列/延迟/重试；语义不同，不强行二选一。

---

## 8. 前端架构（Next.js）

- App Router + React Server Components；交互密集区域用 Client Components。
- 页面：首页、登录/注册、feed、帖子详情、发帖、个人页、通知、管理后台。
- 数据：服务端首屏直取；客户端用 TanStack Query 做缓存、乐观更新和游标分页。
- 样式：Tailwind + shadcn/ui。
- API client：从 OpenAPI 生成（`openapi-typescript` 或 `orval`），避免手写类型漂移。
- 认证：登录后 access token 存内存；refresh 走 httpOnly Cookie；Next.js middleware 保护 `/admin` 和需要登录的页面。
- SSE：通知中心订阅 `/api/v1/notifications/stream`，断线重连。
- 管理后台：审核列表、举报处理、用户封禁、Dashboard 统计；调用 admin API。
- 错误/加载/空状态：每个列表页必须有；点赞/关注做乐观更新，失败回滚。

---

## 9. 可观测性

- **日志**：Pino，字段包含 `requestId`、`traceId`、`userId`、`route`、`status`、`durationMs`。
- **Trace**：OpenTelemetry SDK（api/admin），OTLP → Collector；HTTP 和 RabbitMQ 传播 W3C traceparent。
- **Metrics**：`prom-client`；HTTP 耗时、错误率、队列深度、outbox 延迟、DB 连接池、缓存命中率。
- **Dashboard**：Grafana；至少一张 API 延迟/错误率图、一张 outbox/队列积压图。
- **Error**：Sentry（api/admin/web），发布版本和环境标签。
- **Health**：`/health` 只表示进程存活；`/ready` 检查 MySQL/Redis/RabbitMQ。

---

## 10. 测试策略

| 层 | 工具 | 覆盖 |
|---|---|---|
| 单测 | Vitest / Nest testing | service 逻辑、权限、幂等 |
| 集成 | Supertest + Testcontainers | 路由 + MySQL/Redis/RabbitMQ |
| E2E | Playwright | 注册→登录→发帖→评论→点赞→feed；管理端审核/举报 |
| 契约 | OpenAPI schema 校验 | 请求/响应不漂移 |
| 压测 | k6 / autocannon | feed 读、点赞写、SSE 连接数 |

CI 必须跑：lint、typecheck、单测、集成测试、build；E2E 可在 PR 或 nightly 跑。

---

## 11. 部署与 CI/CD

### 本地

`infra/docker/docker-compose.yml` 起：mysql、redis、rabbitmq、meilisearch、api、admin-api、web、otel-collector、prometheus、grafana。

### CI

GitHub Actions：

- `pnpm install --frozen-lockfile`
- `pnpm -r lint` / `typecheck` / `test` / `build`
- Docker build（api/admin/web）
- OpenAPI diff 检查
- Playwright（可选）

### 生产

- K8s manifests / Helm：api、admin-api、web、worker；Ingress、HPA、readiness/liveness、ConfigMap/Secret。
- 数据库迁移作为 Job 执行，不放在应用启动时。
- 回滚：镜像 tag + `helm rollback` / `kubectl rollout undo`。
- 本地演示可用 k3d/kind；云上用 k3s 或托管 K8s，不做多集群。

---

## 12. 里程碑与验收

### 01–05（2026-11-10–11-24，约 2 周）：最小可演示

**范围**

- 从空目录初始化 monorepo、Express `/health`、配置/日志/错误、Prisma、认证、发帖/关注/feed。
- Next.js：登录/注册、feed、帖子详情、发帖、个人页。
- Docker Compose：MySQL/Redis；API/Web 本地跑。
- 本阶段不引入 NestJS/RabbitMQ/K8s；评论/点赞/通知不阻塞演示。

**验收**

- 空目录能起 `/health`；Prisma 迁移/seed 成功。
- 浏览器完成 注册 → 登录 → feed → 详情 → 发帖；刷新登录态不丢。
- 至少一条帖子在 feed 可见；Docker Compose 起 MySQL/Redis。
- **从 01–05 结束开始投递简历**，不等后续阶段。

### 06–10（11-24–12-08，约 2 周）：工程化补齐

**范围**

- 评论/点赞/关注/通知/SSE。
- JWT/refresh Cookie/CORS/Helmet；Redis 限流/缓存/SSE Pub/Sub；BullMQ 通知。
- OpenAPI（Express）；Swagger UI。
- Vitest + Supertest；Dockerfile；GitHub Actions。

**验收**

- 完整社区主链路；SSE 通知 1 秒内到达；断线可重连。
- `pnpm -r typecheck`、`test`、`build` 全绿；CI 绿。
- `docker compose up` 后 web/api/mysql/redis 都可用。

### 11–15（2026-12-08–2027-01-12，约 5 周）：企业工程信号

**范围**

- NestJS 管理/BFF：AuthGuard、PermissionsGuard、Pipe、Interceptor、ExceptionFilter、Swagger。
- 管理端：审核、举报、用户封禁、Dashboard、审计日志。
- RabbitMQ 跨服务事件 + 消费者幂等；BullMQ 已接入，补重试/积压监控。
- OpenTelemetry + Prometheus/Grafana + Sentry；trace 跨服务。
- Playwright E2E；Testcontainers 集成测试。

**验收**

- 管理端可审核帖子、处理举报、封禁用户，操作写入审计。
- 审核通过后 feed 出现，拒绝后不出现。
- 一条请求的 trace 能从 web/api 追到 admin-api/RabbitMQ 消费者。
- Grafana 有延迟/错误率/队列积压面板；Sentry 能收到错误。
- 集成/E2E 测试通过。

### 16–18（2027-01-12–01-29，约 2.5 周）：上线与压测

**范围**

- K8s/Helm + 本地 k3d 或云 k3s 部署；探针、HPA、Ingress。
- k6 压测；回滚演练；ADR；10 分钟演示。
- Meilisearch 和 AI 不在本阶段。

**验收**

- 一条命令部署到集群；`/health`、`/ready`、`/metrics` 正常。
- 有压测报告和 5 分钟回滚步骤。
- 能不看稿讲 10 分钟：需求→架构→取舍→演示→如果重来。

### 春节（2027-02-05–02-12）

不排重交付。做面试复盘、简历更新、博客整理；19–21 从春节后开始。

### 19–21（2027-02-20–03-10，约 3 周，可选）：差异化

**范围**

- Meilisearch 搜索；Outbox/RabbitMQ 同步索引。
- AI 助手/内容审核（可选）：LLM 流式 + RAG。

**验收**

- 搜索可用，索引延迟可接受。
- AI 演示可开关、可 fallback。
- 做不完不影响投递；金三银四前完成即可。

**裁剪线**：01–15 必须完成；16–18 保 K8s + 压测 + ADR；19–21 可砍。

### 求职节奏

| 时间 | 动作 |
|---|---|
| 2026-11-24 | 开始投递；简历写 01–05 demo + 阶段一 Express |
| 2026-12-08 | 01–10 完成，更新简历（全栈 + Redis/BullMQ/OpenAPI/CI） |
| 2026-12-08–2027-01-12 | 11–15 边做边面（NestJS/OTel/RabbitMQ） |
| 2027-01-29 | 16–18 收尾，春节前完成一轮投递 |
| 2027-02-05–02-12 | 春节暂停重交付，面试复盘 |
| 2027-02-20–03-10 | 19–21 加分，准备金三银四 |
| 2027-03–04 | 金三银四主战场 |

---

## 13. 风险与回退

| 风险 | 影响 | 缓解 |
|---|---|---|
| NestJS + TypeScript 7 / nest-cli 兼容性 | 构建/启动失败 | 先做 1 天 spike；用 SWC 或 admin-api 单独 TS 5.9；api 保持 TS 7 |
| Monorepo 迁移破坏现有 API | P0 延期 | 先 `git mv` 不改逻辑；每步跑 typecheck/build；保留根脚本 |
| 两套后端维护成本 | 迭代变慢 | NestJS 只做管理/BFF；共享契约；不复制公共 API |
| 管理端数据拆分复杂 | M2 延期 | 回退共享 MySQL，但保留 schema 边界和内部接口 |
| K8s 学习曲线 | P2 延期 | 本地 k3d + Helm，不做多集群；先 Docker Compose 保底 |
| AI 成本/不稳定 | 主线被拖累 | 放 P2 加分；默认 mock/本地模型，可关闭 |
| 时间不足 | 项目不完整 | 01–10 必须完成；11–15 保 NestJS + OTel；后续可裁剪 |

---

## 14. 非目标

- 不把公共 API 重写为 NestJS。
- 不同时维护 Prisma + TypeORM + Drizzle。
- 不引入 GraphQL、MongoDB、Service Mesh。
- 不做生产级多集群 K8s、跨云容灾。
- 不做完整支付/会员体系（可作为后续阶段）。
- 不做移动端 App。

---

## 15. 博客与文档影响

- 现有 6 篇 Express 系列保留为 **阶段一：Express 核心**，不重写。
- 新全栈工作作为 **阶段二：全栈企业化**，从 23 开始追加：
  - 23 总览：全栈架构与市场定位
  - 24 M1：Next.js 前台 + 公共 API 联调
  - 25 M2：NestJS 管理/BFF + RabbitMQ + 可观测性
  - 26 M3：K8s + 搜索 + AI + 压测
- 总览补一条“路线调整”说明，继续保持“编号只增不改、阶段只追加”。
- 每完成一个里程碑写一篇，不提前写未实现的内容。

---

## 16. 待确认项

1. K8s 演示环境：本地 k3d/kind，还是有云服务器/k3s？
2. AI 供应商与预算：OpenAI / Qwen / DeepSeek，还是先 mock？
3. 管理端是否复用同一套登录（推荐），还是单独管理员登录？
4. 是否需要把通知域也迁到 NestJS（当前建议不迁，保持 1/3 占比）。

> 这四项不阻塞 P0；可以在 M2/M3 开始前确认。
