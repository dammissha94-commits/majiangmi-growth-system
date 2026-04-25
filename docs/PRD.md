# 麻将迷门店复购增长系统 PRD

## 一、产品定位
麻将迷门店复购增长系统，服务社区棋牌室。
不是记分工具，而是门店增长系统。

## 二、目标用户
### 1. 玩家
需求：
- 快速开局
- 记录娱乐积分
- 生成战绩海报
- 加入熟人圈
- 领取门店优惠券
- 预约下一局

### 2. 老板
需求：
- 看到今日预约
- 看到今日开局
- 看到新增会员
- 看到老客复购
- 看到活跃圈子
- 看到卡券核销
- 看到活动转化
- 看到空置时段
- 看到7天未到店用户

### 3. 麻将迷运营方
需求：
- 14天试点
- 门店复盘
- 活动模板
- 会员沉淀
- 门店复制
- 品牌改造

## 三、核心闭环
扫码入店
→ 加入门店会员
→ 创建/加入熟人圈
→ 预约包厢
→ 快速开局
→ 记录娱乐积分
→ 生成战绩海报
→ 分享邀请好友
→ 发放复购券
→ 再次预约
→ 老板后台复盘
→ 门店续费或升级

## 四、核心模块
1. stores 门店
2. rooms 包厢
3. users 用户
4. memberships 门店会员
5. circles 熟人圈
6. circle_members 圈子成员
7. reservations 预约
8. games 牌局
9. game_participants 牌局参与人
10. game_results 娱乐积分结果
11. result_cards 战绩海报
12. coupons 卡券
13. coupon_redemptions 卡券领取与核销
14. referrals 邀请关系
15. campaigns 活动
16. campaign_participants 活动参与
17. dashboard 老板经营看板

## 五、首版页面
### 玩家端
- /
- /player
- /player/circles
- /player/games/new
- /player/results/[id]
- /player/coupons
- /player/reservations/new

### 老板端
- /admin
- /admin/memberships
- /admin/circles
- /admin/reservations
- /admin/coupons
- /admin/campaigns
- /admin/dashboard

## 六、首版验收
1. 首页能访问
2. 玩家端页面能访问
3. 老板后台页面能访问
4. 数据库 migration 存在
5. service 层存在
6. npm run lint 通过
7. npm run build 通过
8. 不存在现金输赢、欠款、结算、抽水、赌资能力
