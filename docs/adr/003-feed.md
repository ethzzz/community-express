# ADR-003：关注流 Fan-out on Read + 游标分页

- 状态：已采纳
- 日期：2026-11-18
- 相关代码：`apps/api/src/modules/feed/feed.repository.ts`、`apps/api/src/modules/feed/feed.routes.ts`

## 背景

首页需要展示“我关注的人发布的动态”，按时间倒序、支持无限下拉。候选方案有：

- 每页 `OFFSET/LIMIT` 直接查关注关系；
- 发帖时把动态写入每个粉丝的收件箱（fan-out on write）；
- 读时 JOIN 关注表（fan-out on read）。

社区当前用户量与关注量都不大，但要求分页稳定、不能因为新帖插入导致重复或漏项。

## 决策

采用 **fan-out on read + 复合游标分页**：

```sql
SELECT p.*, u.nickname, u.avatar_url
FROM posts p
JOIN follows f ON f.followee_id = p.author_id AND f.follower_id = ?
JOIN users u ON u.id = p.author_id
WHERE p.status = 'published'
  AND (p.created_at < ? OR (p.created_at = ? AND p.id < ?))
ORDER BY p.created_at DESC, p.id DESC
LIMIT ?;
```

- 游标由 `created_at` 与 `id` 组成（`cursor=<timestamp>_<id>`），解决同一秒多帖的排序抖动；
- 每页多取 1 条判断 `hasMore`，返回下一页游标；
- 依赖 `follows(follower_id, followee_id)`、`posts(author_id, created_at, id)` 与 `posts(status)` 索引；
- 时间统一由数据库写入，避免应用服务器时钟偏差。

## 代价

- 关注数很多时，单次查询的 JOIN 行数会上升；热点用户发帖会放大读压力。
- 无法做“关注流 + 推荐流”混合排序；后续需要独立推荐服务。
- 深度分页虽然稳定，但页码不可跳转（这是有意的取舍）。
- 取关后历史动态立即从流中消失，产品上需要接受。

## 为什么不选另一条路

- **OFFSET 分页**：新帖插入会导致翻页重复/漏项，深页 `OFFSET` 性能线性下降。
- **Fan-out on write（写扩散）**：读极快，但每个粉丝一份收件箱，写放大严重；大 V 发帖会阻塞，且需要处理粉丝删改、取关清理、存储膨胀。当前规模下运维复杂度高于收益。
- **只按时间全表查再内存过滤**：无法走索引，数据量上来后不可用。

## 演进触发条件

当 P95 读延迟或慢查询比例超过阈值（见 `docs/load-report.md`），再引入收件箱表做混合 fan-out：普通用户写扩散、大 V 读扩散。
