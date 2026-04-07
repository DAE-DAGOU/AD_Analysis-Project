# 广告投放分析平台 MVP API 契约

## 1. 文档目的

本文件定义前端页面与数据层之间的接口契约，保证：

- 前端 demo 即使先使用 mock data，也能与未来后端接口保持一致
- 字段命名、空值约定、时间粒度、排序和筛选逻辑统一
- 页面开发不直接依赖底层数据库结构

本文件直接衔接：
- [page_spec.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/page_spec.md)
- [mart_spec.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/mart_spec.md)
- [metric_dictionary.md](/Users/sunjialu/Library/Mobile%20Documents/com~apple~CloudDocs/Project/Resume/project/metric_dictionary.md)

## 2. 总体约定

### 2.1 基础约定

- API 风格：REST-like JSON
- 版本前缀：`/api/v1`
- 字段命名：`snake_case`
- 时间粒度枚举：`day` / `week` / `month`
- 维度类型枚举：`audience` / `placement` / `creative`
- 排序字段枚举：`spend` / `payment_roi` / `cpa` / `payment_conversions`
- 排序方式枚举：`asc` / `desc`

### 2.2 空值约定

- 后端 / mock 层返回 `null`
- 前端统一渲染为 `--`
- 不使用字符串 `"--"` 作为接口返回值

### 2.3 数值约定

- 计数类字段：整数
- 金额类字段：number，保留 2 位小数
- 比率类字段：number，返回小数值而非百分号字符串  
  例如 `0.0435` 代表 `4.35%`
- 倍数类字段：number  
  例如 `2.45` 代表 `支付ROI = 2.45`

## 3. 通用请求参数

适用于多数接口：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `account_id` | number | 是 | 当前账户 |
| `scenario_id` | number | 否 | 模拟场景，默认 `1` |
| `granularity` | string | 是 | `day / week / month` |
| `date_from` | string | 是 | 起始日期，格式 `YYYY-MM-DD` |
| `date_to` | string | 是 | 结束日期，格式 `YYYY-MM-DD` |

## 4. 接口定义

## 4.1 `GET /api/v1/overview/summary`

### 目标

返回总览页卡片区和异常摘要所需的账户级当前周期结果。

### 请求参数

- `account_id`
- `scenario_id`
- `granularity`
- `date_from`
- `date_to`

### 响应字段

```json
{
  "account_id": 1,
  "scenario_id": 1,
  "granularity": "week",
  "period": {
    "date_from": "2026-04-01",
    "date_to": "2026-04-21",
    "period_key": "202616"
  },
  "metrics": {
    "impressions": 1209780,
    "clicks": 45517,
    "spend": 58125.27,
    "payment_conversions": 2311,
    "payment_revenue": 215460.00,
    "ctr": 0.0376,
    "cpc": 1.2770,
    "cpm": 48.0461,
    "payment_cvr": 0.0508,
    "cpa": 25.1516,
    "payment_roi": 3.7068
  },
  "comparison": {
    "wow_change_rate": 0.0670,
    "mom_change_rate": null
  },
  "anomaly_summary": {
    "signal_level": "warning",
    "signal_title": "扩量后投产走弱后进入修复",
    "signal_message": "扩量阶段新闻信息流与宽泛人群消耗占比提升导致支付效率承压，测试修复期创意 Test 带动支付转化率与支付ROI 回升。",
    "suggested_dimension_type": "placement"
  }
}
```

## 4.2 `GET /api/v1/overview/trend`

### 目标

返回总览页趋势图所需序列。

### 请求参数

- `account_id`
- `scenario_id`
- `granularity`
- `date_from`
- `date_to`

### 响应字段

```json
{
  "account_id": 1,
  "scenario_id": 1,
  "granularity": "day",
  "series": [
    {
      "period_key": "20260401",
      "period_start_date": "2026-04-01",
      "simulation_stage_code": "baseline_period",
      "metrics": {
        "spend": 1684.80,
        "payment_conversions": 80,
        "payment_roi": 4.5904
      }
    }
  ]
}
```

## 4.3 `GET /api/v1/diagnosis/breakdown`

### 目标

返回分维诊断页主表。

### 请求参数

- `account_id`
- `scenario_id`
- `granularity`
- `date_from`
- `date_to`
- `dimension_type`
- `sort_by`
- `sort_order`

### 响应字段

```json
{
  "account_id": 1,
  "scenario_id": 1,
  "granularity": "week",
  "dimension_type": "placement",
  "rows": [
    {
      "dimension_id": 2,
      "dimension_code": "news_feed",
      "dimension_name": "腾讯新闻信息流",
      "impressions": 120700,
      "clicks": 3944,
      "spend": 4651.20,
      "payment_conversions": 153,
      "payment_revenue": 12720.00,
      "ctr": 0.0327,
      "payment_cvr": 0.0388,
      "cpa": 30.4000,
      "payment_roi": 2.7343,
      "spend_share": 0.4610,
      "vs_account_avg_payment_roi_delta": -1.5831
    }
  ]
}
```

## 4.4 `GET /api/v1/diagnosis/trend`

### 目标

返回分维诊断页某个维度值的趋势详情。

### 请求参数

- `account_id`
- `scenario_id`
- `granularity`
- `date_from`
- `date_to`
- `dimension_type`
- `dimension_id`

### 响应字段

```json
{
  "account_id": 1,
  "scenario_id": 1,
  "dimension_type": "audience",
  "dimension_id": 2,
  "dimension_name": "宽泛人群",
  "series": [
    {
      "period_key": "20260404",
      "period_start_date": "2026-04-04",
      "metrics": {
        "spend": 1654.40,
        "payment_cvr": 0.0302,
        "payment_roi": 2.0793
      }
    }
  ],
  "diagnosis": {
    "signal_level": "warning",
    "signal_message": "宽泛人群近一周承担了更多消耗，但支付转化率显著低于账户均值。"
  }
}
```

## 4.5 `GET /api/v1/experiments`

### 目标

返回实验列表或当前默认实验。

### 请求参数

- `account_id`
- `scenario_id`

### 响应字段

```json
{
  "items": [
    {
      "experiment_id": 1,
      "experiment_code": "exp_creative_recovery_001",
      "experiment_name": "创意修复实验001",
      "status": "completed",
      "start_date": "2026-04-15",
      "end_date": "2026-04-21"
    }
  ]
}
```

## 4.6 `GET /api/v1/experiments/{experiment_id}/summary`

### 目标

返回 A/B 测试页的实验概览和实验期聚合结果。

### 响应字段

```json
{
  "experiment_id": 1,
  "experiment_name": "创意修复实验001",
  "objective": "验证新创意是否改善支付转化率与支付ROI",
  "status": "completed",
  "scope": {
    "audience_segment": "broad_audience",
    "placements": ["news_feed", "video_feed"],
    "date_from": "2026-04-15",
    "date_to": "2026-04-21"
  },
  "groups": [
    {
      "experiment_group": "control",
      "metrics": {
        "ctr": 0.0332,
        "payment_cvr": 0.0361,
        "cpa": 33.7741,
        "payment_roi": 2.3687
      }
    },
    {
      "experiment_group": "test",
      "metrics": {
        "ctr": 0.0406,
        "payment_cvr": 0.0437,
        "cpa": 25.0778,
        "payment_roi": 3.3274
      }
    }
  ],
  "comparison": {
    "delta_ctr_vs_control": 0.0074,
    "delta_payment_cvr_vs_control": 0.0076,
    "delta_cpa_vs_control": -8.6963,
    "delta_payment_roi_vs_control": 0.9587
  }
}
```

## 4.7 `GET /api/v1/experiments/{experiment_id}/trend`

### 目标

返回 Control / Test 的时间序列，用于实验趋势图。

### 响应字段

```json
{
  "experiment_id": 1,
  "granularity": "day",
  "series": [
    {
      "experiment_group": "control",
      "period_key": "20260415",
      "metrics": {
        "spend": 1016.26,
        "payment_cvr": 0.0360,
        "payment_roi": 2.3616
      }
    }
  ]
}
```

## 5. 错误码与状态约定

### 5.1 HTTP 状态

- `200`：成功
- `400`：参数非法
- `404`：请求对象不存在
- `422`：参数合法但业务不可计算
- `500`：服务内部错误

### 5.2 错误响应格式

```json
{
  "error_code": "INVALID_GRANULARITY",
  "message": "granularity must be one of: day, week, month"
}
```

## 6. Mock API 约定

在 demo 首期没有真实后端时，允许使用本地 JSON 文件或 mock server 模拟以上接口。  
要求：

- 路由结构与字段结构不变
- 前端只能依赖契约，不依赖底层 CSV 或 SQL
- 后续替换为真实 API 时，不修改前端页面字段访问方式

## 7. 非目标范围

- 不提供写接口
- 不提供认证接口
- 不提供导出接口
- 不提供实验创建、编辑、删除接口
- 不提供实时流式更新能力
