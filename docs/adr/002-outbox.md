# ADR-002：事务性 Outbox + BullMQ 异步通知

- 状态：已采纳
- 日期：2026-11-18
- 相关代码：`apps/api/src/common/outbox.ts`、`apps/api/src/jobs/outbox.worker.ts`、`apps/api/src/jobs/notification.worker.ts`

## 背景

点赞、评论、关注都会产生通知。最初是在业务事务提交后直接调用通知服务，出现过两类问题：

1. 事务回滚了，但通知已经发出（脏通知）；
2. 事务提交了，但进程在发通知前崩溃，通知永久丢失。

社区的核心写路径（点赞、评论）对延迟敏感，不能因为通知失败而让主请求失败。

## 决策

采用 **事务性 Outbox**：

1. 业务写操作与 `outbox_events` 插入放在**同一个数据库事务**里，保证“业务成功 ⇔ 事件落库”；
2. 独立 worker 每秒轮询 `status = 'pending'` 的事件，用 `updateMany where status='pending'` 原子抢占为 `processing`，避免多实例重复消费；
3. 抢占成功后投递到 BullMQ `notificationQueue`，投递成功把事件标记为 `done`，失败标记 `failed` 并累加 `retryCount`；
4. 通知消费者（`notification.worker.ts`）负责真正写通知表，失败由 BullMQ 重试；
5. 进程优雅关闭时停止轮询定时器并 `notificationWorker.close()`。

事件表当前按 `id desc` 取 20 条，投递使用稳定的 `jobId = outbox-${id}`，重复投递会被队列去重。

## 代价

- 通知是**最终一致**的，延迟约 1 秒起；
- outbox 表会持续增长，需要定期归档/清理（按 `done` 且早于 N 天删除）；
- 轮询在空表时仍有固定开销；事件量大后需要改为 `LISTEN/NOTIFY`、CDC 或分区扫描；
- `failed` 事件目前只记录计数，没有自动重投的死信队列，需要人工或定时任务兜底。

## 为什么不选另一条路

- **直接同步发通知**：实现最简单，但无法同时保证不丢、不脏、不阻塞主请求。
- **先写业务再发 MQ，失败重试**：业务提交与发送之间仍有窗口，进程崩溃会丢事件。
- **纯 Redis Stream / Kafka**：可以做到，但引入新的持久化组件；当前 MySQL 已是事实源，outbox 复用事务最划算。
- **纯 BullMQ 定时扫描业务表**：需要为每种事件写扫描逻辑，且难以判断“哪些已经处理过”。

## 验收方式

- 点赞后 2 秒内被通知方可见；
- 人为杀掉 Redis 后重启，pending 事件仍能被投递；
- 事务回滚时 outbox 表无新增记录。
