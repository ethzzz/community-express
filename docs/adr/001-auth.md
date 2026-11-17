# ADR-001：JWT 双 Token + BFF HttpOnly Cookie

- 状态：已采纳
- 日期：2026-11-18
- 相关代码：`apps/api/src/modules/auth/`、`apps/api/src/modules/feed/`、`apps/web/src/lib/server-api.ts`

## 背景

社区需要同时支持浏览器会话、移动端/第三方调用，以及管理后台的权限校验。早期方案把 access token 放在 `localStorage`，出现了三个问题：

1. XSS 一旦成立，token 可被直接读走；
2. 前端每个请求都要手工拼 `Authorization`，逻辑分散；
3. 管理端需要根据权限渲染菜单，但 token 里只有用户 ID，前端还要额外请求一次权限。

## 决策

采用 **短生命周期 access token + 可吊销 refresh token** 的双 Token 方案，并在 Next.js 侧用 **BFF + HttpOnly Cookie** 托管会话：

- access token：JWT，HS256，24 小时有效期，载荷 `{ sub, roles, permissions }`；
- refresh token：48 字节随机串，仅存 SHA-256 哈希，7 天有效期，落库可吊销；
- 浏览器只持有 `access_token` / `refresh_token` 两个 HttpOnly、SameSite=Lax Cookie；
- Next.js Route Handler（`/api/...`）读取 Cookie 后转发到后端，浏览器 JS 接触不到 token；
- 角色与权限编码进 access token，前端守卫可直接解码 `access_token` 判断是否为管理员，无需额外请求。

生产环境（`NODE_ENV=production`）Cookie 需设置 `Secure`；HTTPS 由 Nginx/Ingress 终止。

## 代价

- 权限变更存在最长 24 小时的生效延迟；需要立即生效时必须吊销 refresh token 并等待 access token 过期，或引入 token 版本号/黑名单。
- 前端解码 JWT 只用于 UI 展示与路由守卫，**不能作为授权依据**；真正的授权仍在后端 guard 内完成。
- Cookie 方案要求前后端同站或正确配置 CORS + `credentials`，跨域部署需要额外处理。
- 单实例以外的 WebSocket/SSE 鉴权需要从 Cookie 或短期票据中取 token，不能依赖内存态。

## 为什么不选另一条路

- **Session + Redis 存储**：吊销最方便，但每次请求都要访问 Redis，且移动端/第三方调用需要额外适配 Cookie；当前规模收益不明显。
- **纯 access token、不做 refresh**：无法在用户登出、封禁后及时失效，安全性不足。
- **把权限实时查库**：每个请求多一次 JOIN，热点接口（feed）成本高；权限粒度目前稳定，编码进 token 足够。
- **localStorage + 手动 Header**：实现简单但把 XSS 风险放大，且管理端权限判断仍需二次请求。

## 后续演进

权限变更频繁或需要秒级生效时，增加 `tokenVersion` 字段并在 guard 中比对；或把权限改为网关注入的短期声明。
