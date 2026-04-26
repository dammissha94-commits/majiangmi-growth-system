# 麻将迷门店复购增长系统｜RLS 权限策略

## 当前状态
开发库 RLS 已临时关闭（`ALTER TABLE ... DISABLE ROW LEVEL SECURITY`）。
正式上线前必须重新启用并配置以下策略。

## 何时启用
- v0.3.0 正式部署 Vercel 前启用
- 启用前必须在测试库验证所有 CRUD 路径不被误拦截
- 不在开发迭代过程中启用，避免破坏演示闭环

## 身份识别方案（无登录阶段）
当前阶段没有登录系统，所有请求使用 `anon key`。
RLS 策略暂时设置为：**所有表允许 anon 全量读写**（等同于关闭 RLS 的效果，但显式声明）。
后续引入登录时，替换为基于 `auth.uid()` 的精细策略。

## 各表策略规划

### 读写均开放（anon 全量访问）
适用于当前演示阶段的所有表：

| 表名 | 读 | 写 |
|------|----|----|
| stores | anon 全量 | anon 全量 |
| rooms | anon 全量 | anon 全量 |
| users | anon 全量 | anon 全量 |
| memberships | anon 全量 | anon 全量 |
| circles | anon 全量 | anon 全量 |
| circle_members | anon 全量 | anon 全量 |
| reservations | anon 全量 | anon 全量 |
| games | anon 全量 | anon 全量 |
| game_participants | anon 全量 | anon 全量 |
| game_results | anon 全量 | anon 全量 |
| result_cards | anon 全量 | anon 全量 |
| coupons | anon 全量 | anon 全量 |
| coupon_redemptions | anon 全量 | anon 全量 |
| referrals | anon 全量 | anon 全量 |
| campaigns | anon 全量 | anon 全量 |
| campaign_participants | anon 全量 | anon 全量 |

## 启用 RLS 的 SQL 模板（当前阶段）

```sql
-- 对所有表启用 RLS，并允许 anon 全量读写（演示阶段等效于关闭）
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON stores FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON rooms FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON users FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON memberships FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON circles FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON circle_members FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON reservations FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON games FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON game_participants FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON game_results FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE result_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON result_cards FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON coupons FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON coupon_redemptions FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON referrals FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON campaigns FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON campaign_participants FOR ALL TO anon USING (true) WITH CHECK (true);
```

## 后续精细化策略（引入登录后）
引入登录系统后，替换为以下方向：

- **玩家**：只能读写自己的 user_id 数据（game_results、coupon_redemptions、reservations）
- **老板**：通过 store_id 隔离，只能操作自己门店数据
- **多门店隔离**：通过 `store_id = auth.uid()` 或专属 owner 表关联

## 注意事项
1. 启用 RLS 前必须先在测试库执行并验证
2. 不在 `supabase/migrations` 以外的地方手动执行 SQL
3. 每次新增表，必须同步补充 RLS 策略
