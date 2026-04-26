# 麻将迷门店复购增长系统｜Vercel 部署准备

## 部署目标
将 Next.js 16 + Supabase 应用部署至 Vercel，对接生产 Supabase 项目。

## 前置条件
- [ ] Supabase 生产项目已创建（区别于开发库）
- [ ] 生产库已执行 `supabase/migrations/001_initial_schema.sql`
- [ ] 生产库已写入初始测试数据（或正式数据）
- [ ] 生产库 RLS 策略已按 `docs/RLS_STRATEGY.md` 配置
- [ ] Vercel 账号已创建，已连接 GitHub 仓库

## 所需环境变量

在 Vercel 项目设置 → Environment Variables 中配置：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 公开密钥 | `eyJhbGc...` |

> `NEXT_PUBLIC_` 前缀表示这两个变量会暴露给浏览器端，只能放非敏感公开密钥。
> 不要将 `service_role` 密钥放入 `NEXT_PUBLIC_` 变量。

## Vercel 构建配置

| 配置项 | 值 |
|--------|-----|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next`（自动检测） |
| Install Command | `npm install` |
| Node.js Version | 20.x |

无需手动配置 `output: 'standalone'`，Vercel 原生支持 Next.js App Router。

## 部署前检查清单

### 代码层面
- [ ] `npm run compliance:check` 通过
- [ ] `npm run lint` 通过（零 error，零 warning）
- [ ] `npm run build` 通过（本地构建无报错）
- [ ] `.env.local` 未提交至 Git（已在 `.gitignore` 中）
- [ ] 无硬编码 Supabase URL 或密钥（当前已确认：全部走环境变量）

### Supabase 层面
- [ ] 生产库 schema 与 `001_initial_schema.sql` 一致
- [ ] RLS 已按 `RLS_STRATEGY.md` 启用
- [ ] 生产库 anon key 权限与 RLS 策略匹配

### Vercel 层面
- [ ] 环境变量已在 Vercel 控制台配置（Production / Preview / Development 三个环境）
- [ ] 域名已配置（或使用 Vercel 默认域名）
- [ ] 首次部署后访问 `/` `/admin` `/player` 均正常

## 当前代码部署兼容性说明

### next.config.ts
```ts
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};
```
`turbopack` 配置只影响 `next dev`，不影响 `next build`（生产构建使用 webpack）。
Vercel 部署无需修改此配置。

### Supabase 客户端
- Server 端：`createSupabaseServerClient`（使用 cookies，适用于 Server Components 和 Server Actions）
- Client 端：`createSupabaseBrowserClient`（适用于 Client Components）
- 两者均从环境变量读取，部署时只需配置 Vercel 环境变量即可

### 环境变量缺失时的行为
当前代码中 `process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""`：
- 构建阶段：不报错（空字符串）
- 运行时：Supabase 客户端会请求失败，页面显示数据加载错误
- 结论：环境变量必须在 Vercel 中正确配置，否则运行时功能不可用

## 部署步骤

1. 确认本地 `npm run build` 通过
2. Push 代码至 GitHub main 分支
3. 在 Vercel 导入项目
4. 配置环境变量（Production 环境）
5. 触发部署
6. 部署完成后访问各页面验证
7. 检查 Vercel Functions 日志确认无运行时错误

## 注意事项
1. 不提交 `.env.local` 到 Git
2. 生产 Supabase 项目与开发库严格分离
3. 当前无登录系统，所有页面公开可访问，部署后注意链接保密
4. 正式上线前完成 `docs/RLS_STRATEGY.md` 中的 RLS 启用流程
