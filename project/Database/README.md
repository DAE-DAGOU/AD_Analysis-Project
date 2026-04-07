# Database

本目录集中存放广告投放分析平台 MVP 的数据库相关产物。

## 文件说明

- `database_design.md`
  - 标准化数据库设计文档
- `schema.sql`
  - PostgreSQL 建表与视图脚本
- `seed_dimensions.sql`
  - 维表与实验主数据种子脚本
- `sample_fct_ad_performance_daily.csv`
  - 核心事实表样例数据（21 天主叙事窗口）

## 推荐使用顺序

1. 执行 `schema.sql`
2. 执行 `seed_dimensions.sql`
3. 导入 `sample_fct_ad_performance_daily.csv` 到 `fct_ad_performance_daily`

## 事实表导入字段顺序

```text
account_id,
date_key,
audience_segment_id,
placement_id,
creative_id,
scenario_id,
simulation_stage_id,
impressions,
clicks,
spend,
payment_conversions,
payment_revenue
```

## 说明

- 当前 schema 以 PostgreSQL 为目标数据库
- 当前样例数据用于验证页面逻辑与指标口径，不代表真实投放账户
- 当前样例数据覆盖 21 天，可直接支撑基线稳定、扩量失衡、测试修复的阶段演示
- 指标口径和页面逻辑仍以 `project` 目录中的产品文档为准
