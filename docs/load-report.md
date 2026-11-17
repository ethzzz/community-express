# 压测报告：读接口基线

- 日期：2026-11-18
- 阶段：后端 18（压测、回滚、ADR）
- 工具：autocannon 9.0.0（`pnpm dlx autocannon`）

## 一、环境

| 项 | 值 |
| --- | --- |
| 机器 | Windows 10/11，本地开发机 |
| API | Node 24 + tsx watch（开发模式，非生产构建） |
| 数据库 | 本地 MySQL 8.0（127.0.0.1:3306） |
| Redis | Docker Desktop，redis:7（127.0.0.1:6379） |
| 数据量 | 13 用户 / 14 帖子 / 12 关注关系 / 21 通知 |
| 并发 | 50 连接 |
| 鉴权 | 预登录 `user@test.com`，复用 access token |

> 说明：这是**基线测试**，不是容量规划。数据量小、单机同进程竞争 CPU，绝对 QPS 只用于横向对比和找瓶颈。

## 二、场景与结果

### 场景 A：关注流（鉴权 + JOIN + 游标分页）

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Admin123!ChangeMe"}' | jq -r .accessToken)

pnpm dlx autocannon -c 50 -d 15 \\
  -H "Authorization: Bearer $TOKEN" \\
  http://127.0.0.1:3000/api/v1/feed
```

| 指标 | 结果 |
| --- | --- |
| 总请求 | 25,000（15.02s） |
| 平均吞吐 | 1,680 req/s |
| 延迟 P50 | 28 ms |
| 延迟 P97.5 | 42 ms |
| 延迟 P99 | 51 ms |
| 最大延迟 | 61 ms |
| 错误率 | 0 |

### 场景 B：公开帖子列表（无鉴权 + 分页）

```bash
pnpm dlx autocannon -c 50 -d 10 "http://127.0.0.1:3000/api/v1/posts?limit=10"
```

| 指标 | 结果 |
| --- | --- |
| 总请求 | 18,000（10.02s） |
| 平均吞吐 | 1,790 req/s |
| 延迟 P50 | 29 ms |
| 延迟 P97.5 | 49 ms |
| 延迟 P99 | 56 ms |
| 最大延迟 | 103 ms |
| 错误率 | 0 |

## 三、观察

1. 两个场景的 P97.5 都在 50 ms 内，**应用层不是当前瓶颈**；请求主要耗时在 MySQL 查询与 JSON 序列化。
2. 关注流的 QPS 略低于公开列表，符合预期：前者多一次 `follows` JOIN 与游标条件。
3. 开发模式（tsx watch + 源码转换）本身有额外开销，生产构建的基线应更高；本报告不与生产数字混用。
4. 观察到的尾部延迟（P99 vs P50 差距约 2 倍）来自单进程事件循环与本地 MySQL 的偶发抖动，而非慢查询。

## 四、瓶颈判断

- 当前数据量下，索引（`follows(follower_id, followee_id)`、`posts(author_id, created_at, id)`）已足够；
- 若数据量上升，优先看：MySQL 连接数、`EXPLAIN` 是否走索引、feed JOIN 的扫描行数；
- 进程 CPU 饱和时再横向扩容 API；单机压测无法区分这两者，需要在 Compose/K8s 多副本下复测。

## 五、本轮只做的一个优化

**没有做代码优化**，只补齐了基线测量与回滚路径。理由：当前指标没有暴露明确的慢点，先加优化属于猜测；把测量方法固化下来，下一轮扩容后可直接对比。

## 六、下一轮计划

1. 在 `docker compose` 三副本 API 下复测，区分应用与数据库瓶颈；
2. 造 10 万帖子/1 万关注关系后复测 feed，记录 `EXPLAIN`；
3. 打开 MySQL 慢查询日志，确认是否存在超过 100 ms 的语句；
4. 若 feed 成为瓶颈，按 ADR-003 的触发条件评估混合 fan-out。

## 七、回滚 Runbook

### 代码回滚（Compose）

```bash
git revert <bad-commit> --no-edit
docker compose -f infra/docker/docker-compose.yml up --build -d
curl -i http://127.0.0.1:8080/api/v1/posts?limit=1
```

### 镜像/Helm 回滚

```bash
helm history community -n community
helm rollback community <REVISION> -n community
kubectl rollout status deploy/community-api -n community
```

### 数据库

- 迁移遵循 expand/contract：先加列/表并保持旧代码兼容，确认新版本稳定后再删旧结构；
- 禁止在同一个 Release 中“加列 + 删列”；
- 回滚前先确认目标版本的 Prisma schema 与当前库兼容。

### 验收标准

- 5 分钟内回到上一版本；
- `/health`、`/ready` 返回 200；
- 登录、发帖、feed 三条主链路手工验证通过。
