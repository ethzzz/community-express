# 毕业验收清单与 10 分钟演示

- 目标：用可复现的证据证明“这个项目能跑、能讲、能改”。
- 适用版本：后端 21 阶段 / 前端 15 阶段完成后的 `main`。

## 一、验收前置

```bash
pnpm install
pnpm --filter api exec prisma migrate deploy
pnpm --filter admin-api exec prisma migrate deploy --schema prisma/schema.prisma
pnpm -r typecheck
pnpm --filter api build
pnpm --filter admin-api build
pnpm --filter web build
```

本地依赖：MySQL 8（3306）、Redis（6379）、Node 22+、pnpm 12。

## 二、功能清单

### 公共 API（Express）

- [ ] 注册 / 登录 / 刷新 / 登出，Cookie 会话生效
- [ ] 发帖、编辑、删除；草稿与发布状态流转
- [ ] 点赞、评论、关注；计数与列表一致
- [ ] 关注流游标分页，无重复、无漏项
- [ ] 通知列表与未读数；点赞/评论/关注均能触达
- [ ] 搜索：Meilisearch 命中时返回 `source=meili`，未配置时降级 `source=mysql`
- [ ] AI 助手 SSE 流式返回，断流可中止
- [ ] `GET /health`、`GET /ready`、`GET /metrics` 正常
- [ ] `/docs` Swagger 可打开并完成一次 Try it out

### 管理端（NestJS + Web）

- [ ] 管理员登录后进入 `/admin`
- [ ] 待审帖子列表、通过/驳回，公共端状态同步
- [ ] 举报列表、处理举报
- [ ] 用户封禁/解封，被封禁用户登录返回 403
- [ ] 审计日志记录每一次管理操作
- [ ] 非管理员访问 `/admin` 被重定向，直连接口返回 403

### 基础设施

- [ ] `docker compose -f infra/docker/docker-compose.yml up --build -d` 全栈启动
- [ ] Nginx 8080 入口：页面、`/api/`、`/admin-api/` 均可达
- [ ] SSE 经 Nginx 不被缓冲（首 token 及时到达）
- [ ] `helm lint infra/k8s/helm/community` 通过
- [ ] `helm template` 可渲染；`helm upgrade --install` 后 Job 完成、Pod Ready
- [ ] 优雅关闭：`SIGTERM` 后停止接收新请求，worker 与连接池正常释放

### 质量

- [ ] `pnpm -r typecheck` 全绿
- [ ] `pnpm --filter api test` 全绿
- [ ] `pnpm test:e2e` 三条主链路通过（发帖、管理台、搜索+AI）
- [ ] 压测报告与 3 篇 ADR 存在且数据真实

## 三、10 分钟演示脚本

| 时间 | 动作 | 讲解重点 |
| --- | --- | --- |
| 0:00–1:00 | 打开首页，说明技术栈与仓库结构 | 为什么 Express 公共 API + NestJS 管理端 + Next.js BFF |
| 1:00–3:00 | 登录 → 发帖 → 点赞 → 评论 → 换账号看通知 | 业务闭环；Cookie 会话；outbox 最终一致 |
| 3:00–4:30 | 首页下拉两页 | 游标分页为什么不会重复；关注流 SQL |
| 4:30–5:30 | 搜索页输入关键词；打开 AI 助手 | Meilisearch 命中与降级；SSE 流式 |
| 5:30–7:00 | 进入 `/admin`，审核一篇帖子、处理一条举报、封禁一个用户 | NestJS guard/权限、内部接口、审计日志 |
| 7:00–8:30 | 展示 `/metrics`、`/health`、`/ready`，讲优雅关闭 | Prometheus 指标、K8s 探针与滚动更新 |
| 8:30–9:30 | 打开 `docs/load-report.md` 与 ADR | 瓶颈判断、回滚预案、为什么不做写扩散 |
| 9:30–10:00 | 讲一个已知不足与下一步 | 体现取舍与演进意识 |

## 四、常见追问与回答要点

1. **为什么不用微服务？**
   当前团队与流量下，模块化单体 + 独立管理端的收益最高；边界已在代码层按模块划分，后续可按热点拆分。
2. **通知为什么不用消息队列直接发？**
   业务事务与消息发送无法原子提交，outbox 把“是否该发”交给数据库事务，MQ 只负责投递。
3. **关注流为什么不做写扩散？**
   写放大与清理成本高；当前读路径有索引支撑，达到阈值再混合。
4. **token 泄露怎么办？**
   access token 24 小时过期，refresh token 可吊销；生产启用 Secure Cookie，权限校验始终在后端。
5. **如何回滚？**
   代码 `git revert` 或 `helm rollback`；数据库迁移遵循 expand/contract，先兼容再加约束。
6. **压测瓶颈在哪？**
   以 `docs/load-report.md` 的真实数据回答：看 P95、错误率、MySQL 连接数与慢查询，而不是凭感觉。

## 五、已知不足（主动说明）

- 搜索与 AI 依赖外部服务，未配置时走降级路径，效果有限；
- outbox `failed` 事件缺少自动死信重投；
- 通知只支持站内，未接入邮件/推送；
- 前端未做完整的国际化与无障碍审计；
- K8s values 默认明文 Secret，生产应接入 External Secrets。
