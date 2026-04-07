# 广告投放分析平台 MVP Mart 规格

## 1. 文档目的

本文件定义广告投放分析平台 MVP 的展示层数据集市（mart）规格，回答以下问题：

- 页面到底消费哪些数据集
- 每个 mart 的粒度是什么
- 每个 mart 的字段、主键、上游依赖和派生逻辑是什么
- 如何与未来的 dbt Semantic Layer 对齐

本文件是数据库层与前端接口层之间的中间契约，主要衔接：
- [PRD.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/PRD.md)
- [metric_dictionary.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/metric_dictionary.md)
- [page_spec.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/page_spec.md)
- [Database/database_design.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/Database/database_design.md)

## 2. 设计原则

- mart 面向页面消费，不直接暴露底层事实表细节
- 所有派生指标统一在 mart 层或其上游 SQL 模型中计算
- 每个 mart 必须有明确主键和唯一粒度
- 同一指标在不同 mart 中公式保持一致
- 命名和字段设计尽量与未来 dbt Semantic Layer 对齐

## 3. 语义层对齐说明

当前仓库不是一个完整 dbt 项目，因此本文件不直接提供可执行的 semantic model YAML。  
但设计时采用了 `building-dbt-semantic-layer` 的思路，先定义：

- **Entities**
  - `account`
  - `audience_segment`
  - `placement`
  - `creative`
  - `experiment`
- **Time Dimension**
  - `calendar_date`
- **Base Measures**
  - `impressions`
  - `clicks`
  - `spend`
  - `payment_conversions`
  - `payment_revenue`
- **Derived Metrics**
  - `ctr`
  - `cpc`
  - `cpm`
  - `payment_cvr`
  - `cpa`
  - `payment_roi`

未来如果迁移到 dbt Core 1.12+，建议使用 latest spec，将 `fct_ad_performance_daily` 暴露为主 semantic model，再在 mart 模型上做页面级聚合。

## 4. 上游输入模型

所有 mart 的上游统一来自以下对象：

- `fct_ad_performance_daily`
- `dim_date`
- `dim_audience_segment`
- `dim_placement`
- `dim_creative`
- `dim_experiment`
- `bridge_experiment_variant`
- `dim_simulation_stage`
- `dim_simulation_scenario`

## 5. Mart 总览

MVP 推荐保留 4 个逻辑 mart：

| Mart | 作用 | 页面 |
| --- | --- | --- |
| `mart_account_overview_period` | 账户级总览与时间趋势 | 总览页 |
| `mart_dimension_breakdown_period` | 分维拆解与下钻 | 分维诊断页 |
| `mart_experiment_result_period` | 实验组结果聚合 | A/B 测试页 |
| `mart_anomaly_signal_period` | 异常摘要与诊断提示 | 总览页、分维诊断页 |

注：
- 前 3 个是必须的
- 第 4 个是强烈推荐的规则引擎输入层

## 6. Mart 详细规格

## 6.1 `mart_account_overview_period`

### 6.1.1 目标

为总览页提供账户级的：
- 核心指标卡片
- 趋势图
- 周同比 / 月同比

### 6.1.2 粒度

`account_id × scenario_id × time_grain × period_key`

其中：
- `time_grain ∈ {day, week, month}`
- `period_key` 在不同粒度下分别对应 `date_key / week_key / month_key`

### 6.1.3 主键

`(account_id, scenario_id, time_grain, period_key)`

### 6.1.4 输出字段

标识字段：
- `account_id`
- `scenario_id`
- `time_grain`
- `period_key`
- `period_start_date`
- `period_end_date`
- `simulation_stage_id`  
  仅在 `time_grain = day` 时强约束有值，周/月视角可为空或取主阶段标签

原子度量：
- `impressions`
- `clicks`
- `spend`
- `payment_conversions`
- `payment_revenue`

派生指标：
- `ctr`
- `cpc`
- `cpm`
- `payment_cvr`
- `cpa`
- `payment_roi`

对比字段：
- `previous_period_impressions`
- `previous_period_clicks`
- `previous_period_spend`
- `previous_period_payment_conversions`
- `previous_period_payment_revenue`
- `wow_change_rate`
- `mom_change_rate`

### 6.1.5 核心公式

- `ctr = clicks / impressions`
- `cpc = spend / clicks`
- `cpm = spend / impressions * 1000`
- `payment_cvr = payment_conversions / clicks`
- `cpa = spend / payment_conversions`
- `payment_roi = payment_revenue / spend`

所有除法均使用 `nullif(denominator, 0)`。

### 6.1.6 页面消费方式

- 总览页卡片区直接使用最新一期记录
- 趋势图区使用同一账户、同一场景、同一粒度下的时间序列
- 周同比 / 月同比由 mart 直接提供，避免前端重复计算

## 6.2 `mart_dimension_breakdown_period`

### 6.2.1 目标

为分维诊断页提供统一的长表结构，支持：
- 人群
- 资源位
- 创意

### 6.2.2 粒度

`account_id × scenario_id × time_grain × period_key × dimension_type × dimension_id`

### 6.2.3 主键

`(account_id, scenario_id, time_grain, period_key, dimension_type, dimension_id)`

### 6.2.4 输出字段

标识字段：
- `account_id`
- `scenario_id`
- `time_grain`
- `period_key`
- `dimension_type`  
  枚举：`audience` / `placement` / `creative`
- `dimension_id`
- `dimension_code`
- `dimension_name`

原子度量：
- `impressions`
- `clicks`
- `spend`
- `payment_conversions`
- `payment_revenue`

派生指标：
- `ctr`
- `payment_cvr`
- `cpa`
- `payment_roi`

诊断字段：
- `spend_share`
- `payment_conversion_share`
- `payment_revenue_share`
- `vs_account_avg_payment_cvr_delta`
- `vs_account_avg_payment_roi_delta`
- `vs_account_avg_cpa_delta`

### 6.2.5 上游逻辑

- 来自 `fct_ad_performance_daily`
- 通过 `UNION ALL` 或类似方式统一 3 个维度
- 所有 share 和 delta 都必须基于同周期账户级聚合结果计算

### 6.2.6 页面消费方式

- 分维表现表直接使用此 mart
- 默认按 `spend` 降序
- 排序切换按 `payment_roi / cpa / payment_conversions`
- 点击某一行后，再请求该维度值的趋势接口

## 6.3 `mart_experiment_result_period`

### 6.3.1 目标

为 A/B 测试页提供按实验组聚合的表现数据。

### 6.3.2 粒度

`experiment_id × experiment_group × time_grain × period_key`

### 6.3.3 主键

`(experiment_id, experiment_group, time_grain, period_key)`

### 6.3.4 输出字段

标识字段：
- `experiment_id`
- `experiment_name`
- `experiment_group`
- `time_grain`
- `period_key`
- `period_start_date`
- `period_end_date`

原子度量：
- `impressions`
- `clicks`
- `spend`
- `payment_conversions`
- `payment_revenue`

派生指标：
- `ctr`
- `payment_cvr`
- `cpa`
- `payment_roi`

对比字段：
- `delta_ctr_vs_control`
- `delta_payment_cvr_vs_control`
- `delta_cpa_vs_control`
- `delta_payment_roi_vs_control`

### 6.3.5 上游逻辑

- `dim_experiment` 定义实验期
- `bridge_experiment_variant` 定义创意到实验组的映射
- `fct_ad_performance_daily` 提供原子度量

### 6.3.6 页面消费方式

- 实验概览用 `dim_experiment`
- 核心结果对比卡和趋势用 `mart_experiment_result_period`
- A/B 结论区可直接消费 delta 字段或由规则层生成文案

## 6.4 `mart_anomaly_signal_period`

### 6.4.1 目标

为总览页异常摘要和分维诊断建议提供可解释的规则结果。

### 6.4.2 粒度

`account_id × scenario_id × time_grain × period_key × signal_code`

### 6.4.3 主键

`(account_id, scenario_id, time_grain, period_key, signal_code)`

### 6.4.4 输出字段

- `account_id`
- `scenario_id`
- `time_grain`
- `period_key`
- `signal_code`
- `signal_level`
- `signal_title`
- `signal_message`
- `suggested_dimension_type`
- `evidence_metric_name`
- `evidence_metric_value`
- `reference_metric_value`

### 6.4.5 推荐规则来源

- 来自 `mart_account_overview_period`
- 来自 `mart_dimension_breakdown_period`

示例规则：
- 若 `spend` 上升且 `payment_roi` 下降，则生成账户级异常信号
- 若 `news_feed` 的 `spend_share` 明显提升且 `payment_roi` 低于账户均值，则生成“优先查看资源位”的信号
- 若 `broad_audience` 的 `payment_cvr` 低于账户均值，则生成“优先查看人群”的信号

## 7. 与未来 dbt Semantic Layer 的映射

如果后续迁移到 dbt，建议按以下方式映射：

### 7.1 主 semantic model

- 模型：`fct_ad_performance_daily`
- Primary entity：`account`
- Time dimension：`calendar_date`
- Additional entities：
  - `audience_segment`
  - `placement`
  - `creative`
  - `scenario`
  - `simulation_stage`

### 7.2 Measures

- `sum_impressions`
- `sum_clicks`
- `sum_spend`
- `sum_payment_conversions`
- `sum_payment_revenue`

### 7.3 Metrics

- Simple
  - `impressions`
  - `clicks`
  - `spend`
  - `payment_conversions`
  - `payment_revenue`
- Ratio
  - `ctr`
  - `cpc`
  - `cpm`
  - `payment_cvr`
  - `cpa`
  - `payment_roi`

### 7.4 说明

当前仓库未配置 dbt project，因此本文件只提供 semantic-layer-ready 设计，不附可执行 YAML。

## 8. 非目标范围

- 不为每个页面单独复制宽表
- 不在 mart 中落地页面文案
- 不在 mart 中存不可追溯的手工比例值
- 不在当前阶段扩展地域、时段、设备等更多维度

## 9. 最终约定

- 页面层只能直接消费 mart 或 API，不直接连事实表
- 所有指标定义仍以 [metric_dictionary.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/metric_dictionary.md) 为准
- 所有 mart 的事实来源只能是 `fct_ad_performance_daily`
- `mart_account_overview_period`、`mart_dimension_breakdown_period`、`mart_experiment_result_period` 为 MVP 必做项

