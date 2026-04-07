# 广告投放分析平台 MVP 验证计划

## 1. 文档目的

本文件定义广告投放分析平台 MVP 在 demo 制作前和制作过程中的验证方案，确保：

- 指标口径正确
- mart 聚合正确
- API 返回结构稳定
- 页面交互符合设计
- 模拟数据与业务阶段一致

本文件参考了 `adding-dbt-unit-test` 的思路，将验证拆成：
- 文档一致性检查
- 数据层检查
- mart 层检查
- 接口层检查
- 页面层检查
- dbt 风格单元测试设计

## 2. 验证范围

纳入验证的核心对象：

- [PRD.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/PRD.md)
- [metric_dictionary.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/metric_dictionary.md)
- [simulation_rules.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/simulation_rules.md)
- [page_spec.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/page_spec.md)
- [mart_spec.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/mart_spec.md)
- [api_contract.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/api_contract.md)
- [Database/schema.sql](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/Database/schema.sql)
- [Database/sample_fct_ad_performance_daily.csv](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/Database/sample_fct_ad_performance_daily.csv)

## 3. 验证层级

## 3.1 文档一致性验证

### 目标

确保产品、指标、数据库、页面、接口之间的定义一致。

### 必检项

- 核心目标始终是 `支付转化`
- 核心维度始终是 `人群 / 资源位 / 创意`
- 核心时间粒度始终支持 `日 / 周 / 月`
- 核心指标始终使用同一套公式
- A/B 测试对象始终是创意
- 页面模块始终是 `总览 / 分维诊断 / A/B 测试`

### 通过标准

- 无一处文档把支付目标改成留资、下载或注册
- 无一处文档把分维诊断改成地域、设备优先
- 无一处文档对 `payment_cvr / cpa / payment_roi` 使用冲突公式

## 3.2 数据层验证

### 目标

确保事实数据满足数据库约束和业务约束。

### 必检项

- 主键唯一：`account_id + date_key + audience_segment_id + placement_id + creative_id + scenario_id`
- `clicks <= impressions`
- `payment_conversions <= clicks`
- 所有金额与计数字段均为非负
- 样例数据中的维表 id 都有对应主数据

### 通过标准

- 样例数据导入时无主键冲突
- 样例数据导入时无外键缺失
- 所有 check 规则可通过

## 3.3 Mart 层验证

### 目标

确保页面消费的聚合结果正确。

### 必检项

- `mart_account_overview_period` 的比例类指标均来自汇总后重算
- `mart_dimension_breakdown_period` 的 share 和 delta 正确
- `mart_experiment_result_period` 的 Control / Test 归属正确
- `mart_anomaly_signal_period` 的信号与基础指标变化一致

### 通过标准

- 账户级结果与事实表手工汇总一致
- 分维结果之和能回到账户级原子度量
- 实验结果只包含实验期内、实验组内的创意数据

## 3.4 接口层验证

### 目标

确保 mock API 或真实 API 与前端约定一致。

### 必检项

- 所有接口字段名使用 `snake_case`
- 所有空值使用 `null`
- 所有比率类字段返回小数，不返回字符串百分号
- 枚举值与 API 契约一致

### 通过标准

- 前端无需读取底层 CSV
- 任意接口返回都可直接映射到对应页面模块

## 3.5 页面层验证

### 目标

确保页面交互与产品流程一致。

### 必检项

- 总览页支持日 / 周 / 月切换
- 总览页可进入分维诊断页
- 分维诊断页支持 3 个维度切换
- 分维诊断页支持排序
- A/B 测试页能展示 Control / Test 对比

### 通过标准

- 用户可在 3 次点击以内完成 `整体效果 -> 异常指标 -> 异常原因`
- 页面无因空值导致的结构错乱

## 4. dbt 风格单元测试设计

当前仓库不是可直接执行的 dbt 项目，因此以下内容是 `dbt unit test reference plan`，用于后续如果将 mart SQL 迁移到 dbt 时直接落测试。

### 4.1 重点测试模型

- `mart_account_overview_period`
- `mart_dimension_breakdown_period`
- `mart_experiment_result_period`

### 4.2 重点测试场景

1. `mart_account_overview_period`  
验证账户级汇总时，比例指标是汇总后重算，而不是对行级比率取平均。

2. `mart_dimension_breakdown_period`  
验证某一维度值的 `payment_roi` 与 `payment_cvr` 计算正确，且相对账户均值 delta 正确。

3. `mart_experiment_result_period`  
验证 `bridge_experiment_variant` 能正确区分 control / test，并只聚合实验期内数据。

4. 空值边界  
验证分母为 0 时，模型输出为 `null` 而不是报错或返回非法值。

### 4.3 参考 unit test YAML 示例

以下示例是 reference，不是当前仓库可直接运行的文件。

```yaml
unit_tests:
  - name: test_mart_account_overview_recomputes_ratios_after_aggregation
    model: mart_account_overview_period
    given:
      - input: ref('fct_ad_performance_daily')
        rows:
          - {
              account_id: 1,
              date_key: 20260401,
              audience_segment_id: 1,
              placement_id: 1,
              creative_id: 1,
              scenario_id: 1,
              simulation_stage_id: 1,
              impressions: 1000,
              clicks: 50,
              spend: 100,
              payment_conversions: 5,
              payment_revenue: 300
            }
          - {
              account_id: 1,
              date_key: 20260401,
              audience_segment_id: 2,
              placement_id: 2,
              creative_id: 1,
              scenario_id: 1,
              simulation_stage_id: 1,
              impressions: 500,
              clicks: 10,
              spend: 40,
              payment_conversions: 1,
              payment_revenue: 60
            }
      - input: ref('dim_date')
        rows:
          - {
              date_key: 20260401,
              calendar_date: 2026-04-01,
              week_key: 202614,
              month_key: 202604
            }
    expect:
      rows:
        - {
            account_id: 1,
            time_grain: day,
            period_key: 20260401,
            impressions: 1500,
            clicks: 60,
            spend: 140,
            payment_conversions: 6,
            payment_revenue: 360,
            ctr: 0.04,
            payment_cvr: 0.10,
            cpa: 23.3333333333,
            payment_roi: 2.5714285714
          }
```

```yaml
unit_tests:
  - name: test_mart_experiment_result_groups_control_and_test_correctly
    model: mart_experiment_result_period
    given:
      - input: ref('dim_experiment')
        rows:
          - {
              experiment_id: 1,
              account_id: 1,
              start_date_key: 20260406,
              end_date_key: 20260407,
              experiment_name: 创意修复实验001
            }
      - input: ref('bridge_experiment_variant')
        rows:
          - {experiment_id: 1, creative_id: 1, experiment_group: control}
          - {experiment_id: 1, creative_id: 3, experiment_group: test}
      - input: ref('fct_ad_performance_daily')
        rows:
          - {
              account_id: 1,
              date_key: 20260406,
              audience_segment_id: 2,
              placement_id: 2,
              creative_id: 1,
              scenario_id: 1,
              simulation_stage_id: 3,
              impressions: 28000,
              clicks: 840,
              spend: 1008,
              payment_conversions: 20,
              payment_revenue: 1600
            }
          - {
              account_id: 1,
              date_key: 20260406,
              audience_segment_id: 2,
              placement_id: 2,
              creative_id: 3,
              scenario_id: 1,
              simulation_stage_id: 4,
              impressions: 6000,
              clicks: 252,
              spend: 302.4,
              payment_conversions: 10,
              payment_revenue: 900
            }
    expect:
      rows:
        - {
            experiment_id: 1,
            experiment_group: control,
            impressions: 28000,
            clicks: 840,
            spend: 1008,
            payment_conversions: 20,
            payment_revenue: 1600
          }
        - {
            experiment_id: 1,
            experiment_group: test,
            impressions: 6000,
            clicks: 252,
            spend: 302.4,
            payment_conversions: 10,
            payment_revenue: 900
          }
```

## 5. 手工验证清单

在 demo 开发前，至少完成以下手工校验：

- [ ] 总览页指标与 mart 输出一一对应
- [ ] 分维表各维度的原子度量可汇总回账户级
- [ ] `payment_roi`、`payment_cvr`、`cpa` 的公式在所有文档中一致
- [ ] A/B 测试页只展示实验期内的 Control / Test 数据
- [ ] API 字段名与 mart 字段名一致或有明确映射
- [ ] 前端空值显示策略与接口空值策略一致

## 6. 当前已识别并需收口的风险

- 当前仓库并非真实 dbt 项目，无法直接执行 `dbt parse`、`dbt test`、`dbt sl validate`
- `mart_anomaly_signal_period` 尚未落到实际 SQL，只在规格层定义

## 7. Demo 前 Go / No-Go 标准

Go：
- 文档无核心定义冲突
- 样例数据可导入 schema
- mart 逻辑可解释
- API 契约可支撑页面实现
- 页面路径清晰

No-Go：
- 同一指标在文档中有冲突公式
- 页面需要的字段无法从 mart 获得
- A/B 测试组归属无法稳定映射
- 样例数据无法体现主线异常与修复逻辑
