# 麻将迷门店复购增长系统｜阶段总结

## 已完成阶段

### v0.1.0-mvp-data-readonly（已完成，已打 tag）
1. 官网首页已完成
2. 老板后台真实数据只读接入已完成
3. 玩家端真实数据只读接入已完成
4. Supabase schema 已创建（16 张表）
5. Supabase 测试数据已写入
6. Service 层已建立（11 个 service）
7. 合规扫描脚本已建立
8. Git tag 已创建：v0.1.0-mvp-data-readonly

#### 已接入老板端页面
- /admin/dashboard
- /admin/memberships
- /admin/reservations
- /admin/circles
- /admin/coupons
- /admin/campaigns

#### 已接入玩家端页面
- /player
- /player/circles
- /player/coupons
- /player/reservations/new
- /player/games/new
- /player/results/test

---

### v0.2.0-demo-operational-loop（已完成，已打 tag）
1. 创建预约草稿（Server Action + redirect 模式）
2. 创建牌局草稿
3. 添加 4 名参与玩家（从圈子自动选取）
4. 保存娱乐积分结果（entertainment_score + rank + is_mvp）
5. 自动生成战绩海报记录（result_card）
6. 玩家查看真实战绩海报（/player/results/[id]）
7. 玩家领取卡券（claimCouponForUser，防重复领取）
8. 老板核销卡券（redeemCouponRedemption，状态校验）
9. 统一操作成功/失败提示（OperationMessage 组件）

#### 技术说明
- 所有写操作统一使用 Server Actions + redirect + searchParams 传递结果
- 不使用 useState 或客户端状态管理
- OperationMessage 组件统一处理 success / error / warning / info 四种提示

---

### v0.3.0-growth-loop（已完成，已打 tag）
1. 战绩海报分享计数（incrementResultCardShareCount Server Action）
2. 玩家活动报名（signUpForCampaign，防重复报名）
3. 熟人圈邀请好友（inviteUserToCircle，防重复邀请）
4. 老板端邀请记录查看（/admin/referrals）
5. 管理端活动参与者到店标记（markParticipantArrivedAction）
6. 数据联动：圈子邀请成功后自动向被邀请人发放卡券

#### 新增页面
- /player/campaigns（玩家报名页）
- /admin/referrals（邀请记录管理页）

#### 技术说明
- 数据联动在 Server Action 层编排，非关键路径失败不阻断主流程
- 自动发券使用门店首个 active 卡券，结果通过 searchParams 回显

---

## 当前注意事项
1. 开发库 RLS 已临时关闭，正式上线前必须重新启用
2. 当前不做登录、不做权限、不做支付、不做正式多门店隔离
3. 所有页面使用硬编码 store_id / user_id 作为演示占位

## 当前验收命令
每次开发后必须执行：

npm run compliance:check
npm run lint
npm run build

## 下一阶段方向
v0.4.0：数据统计深化 + 玩家端数据回显（我的卡券、我的预约、我的活动报名）。
