# 麻将迷门店复购增长系统｜AI 开发总规则

## 1. 项目定位
本项目是“麻将迷门店复购增长系统”，不是赌博结算系统。
系统目标是帮助社区棋牌室提升：
- 会员沉淀
- 熟人圈活跃
- 预约转化
- 战绩海报传播
- 卡券复购
- 活动转化
- 老板经营看板

## 2. 技术栈
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Server Component 优先
- Service Layer 统一封装数据库访问

## 3. 合规边界
禁止开发以下能力：
- 现金输赢
- 玩家间结算
- 欠款记录
- 代收代付
- 抽水
- 赌资统计
- 现金排行榜
- 现金奖池

禁止在业务代码中出现以下字段或业务词：
- cash
- gambling
- debt
- settlement
- loan
- commission
- rake
- 抽水
- 赌资
- 欠款
- 输赢金额
- 现金结算

允许出现：
- entertainment_score
- rank
- game_count
- visit_count
- coupon
- reservation
- membership
- referral
- campaign

## 4. 开发方式
每次只完成一个阶段。
不要一次性开发完整系统。
不要修改与当前阶段无关的文件。
每次完成后必须运行：

npm run lint
npm run build

如果存在合规扫描脚本，还必须运行：

npm run compliance:check

## 5. 目录约定
- 页面：src/app
- 组件：src/components
- 服务层：src/lib/services
- Supabase 客户端：src/lib/supabase
- 类型：src/types/domain
- 数据库 migration：supabase/migrations
- 文档：docs
- 脚本：scripts

## 6. 输出要求
每次任务完成后必须输出：
1. 修改了哪些文件
2. 新增了哪些能力
3. 执行了哪些命令
4. lint 是否通过
5. build 是否通过
6. 是否触碰合规边界
7. 下一步建议
