# 麻将迷门店复购增长系统｜阶段总结

## 当前阶段
v0.1.0-mvp-data-readonly 已完成。

## 已完成内容
1. 官网首页已完成
2. 老板后台真实数据只读接入已完成
3. 玩家端真实数据只读接入已完成
4. Supabase schema 已创建
5. Supabase 测试数据已写入
6. Service 层已建立
7. 合规扫描脚本已建立
8. Git tag 已创建：v0.1.0-mvp-data-readonly

## 已接入老板端页面
- /admin/dashboard
- /admin/memberships
- /admin/reservations
- /admin/circles
- /admin/coupons
- /admin/campaigns

## 已接入玩家端页面
- /player
- /player/circles
- /player/coupons
- /player/reservations/new
- /player/games/new
- /player/results/test

## 当前注意事项
1. 当前大多数页面是只读展示
2. 开发库 RLS 已临时关闭
3. 正式上线前必须重新启用 RLS 并设计权限策略
4. 当前不做登录、不做权限、不做支付、不做正式多门店隔离

## 当前验收命令
每次开发后必须执行：

npm run compliance:check
npm run lint
npm run build

## 下一阶段方向
从只读展示系统升级为最小可操作业务闭环系统。
