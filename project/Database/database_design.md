# 广告投放分析平台 MVP 标准化数据库设计

## 1. 设计定位

本设计用于提供一套可落地的 SQL 数据模型，直接支撑以下能力：

- 总览页：账户级日 / 周 / 月效果监控
- 分维诊断页：按人群、资源位、创意拆解异常
- A/B 测试页：按实验组对比 Control / Test
- 规则引擎：基于统一口径生成异常摘要和阶段解释

### 1.1 数据库类型

- 数据库类型：SQL
- 推荐实现：PostgreSQL 15+
- 建模风格：维度模型 + 规范化维表 + 单一核心事实表 + 页面级视图
- 场景定位：读多写少的分析型数据库

### 1.2 设计原则

- 先按业务域建模，不按页面临时堆表
- 原子事实入库，比例类指标统一在查询层计算
- 所有维度主数据显式建表，不把业务属性写死在前端
- 通过视图和 mart 层承接页面，而不是直接让前端拼复杂 SQL

## 2. 核心实体

- `dim_account`
- `dim_date`
- `dim_audience_segment`
- `dim_placement`
- `dim_creative`
- `dim_simulation_scenario`
- `dim_simulation_stage`
- `dim_experiment`
- `bridge_experiment_variant`
- `fct_ad_performance_daily`

## 3. 建模说明

### 3.1 核心事实粒度

`账户 × 日期 × 人群 × 资源位 × 创意 × 场景`

### 3.2 事实表只存原子度量

- `impressions`
- `clicks`
- `spend`
- `payment_conversions`
- `payment_revenue`

所有派生指标统一在查询层计算：

- `ctr = clicks / impressions`
- `cpc = spend / clicks`
- `cpm = spend / impressions * 1000`
- `payment_cvr = payment_conversions / clicks`
- `cpa = spend / payment_conversions`
- `payment_roi = payment_revenue / spend`

## 4. 表关系

```text
dim_account ------------------------+
dim_date ---------------------------+
dim_audience_segment ---------------+
dim_placement ----------------------+--> fct_ad_performance_daily
dim_creative -----------------------+
dim_simulation_scenario ------------+
dim_simulation_stage ---------------+

dim_experiment ---- bridge_experiment_variant ---- dim_creative
```

## 5. 页面与数据库关系

### 5.1 总览页

基于 `fct_ad_performance_daily` 按账户和时间聚合：

- 日视角：按 `date_key`
- 周视角：按 `week_key`
- 月视角：按 `month_key`

输出指标：

- 曝光量
- 点击量
- 花费
- 支付转化量
- 支付金额
- CTR
- CPC
- CPM
- 支付转化率
- CPA
- 支付ROI

### 5.2 分维诊断页

按某个维度聚合：

- 人群：`audience_segment_id`
- 资源位：`placement_id`
- 创意：`creative_id`

每行展示：

- 花费
- 点击率
- 支付转化率
- CPA
- 支付ROI

### 5.3 A/B 测试页

通过：

- `dim_experiment`
- `bridge_experiment_variant`
- `fct_ad_performance_daily`

聚合 Control 和 Test 的表现并计算：

- CTR
- 支付转化率
- CPA
- 支付ROI

## 6. 规则如何落地

### 6.1 模拟阶段规则

通过 `simulation_stage_id` 写入事实表，直接支撑：

- 趋势图阶段标记
- 阶段性解释
- 数据验证

### 6.2 实验规则

通过 `dim_experiment` 和 `bridge_experiment_variant` 显式管理：

- 当前实验
- Control / Test 分组
- 实验期取数

### 6.3 指标规则

数据库层只存原子度量，所有页面复用同一套派生公式，避免口径漂移。

## 7. 设计结论

这套 schema 的优点：

- 域模型完整
- 约束标准
- 页面可直接取数
- 指标口径安全
- 后续扩展新维度或真实数据源时无需推翻主模型

