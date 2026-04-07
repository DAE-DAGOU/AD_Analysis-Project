# Mock API v1

本目录提供与 `project/api_contract.md` 对齐的 mock API 响应样例。

配套本地服务脚本位于：
- `project/mock_api/server.py`

## 文件清单

- `overview_summary.json`
- `overview_trend_day.json`
- `diagnosis_breakdown_placement.json`
- `diagnosis_trend_audience_2.json`
- `experiments.json`
- `experiment_1_summary.json`
- `experiment_1_trend_day.json`

## 说明

- 数据来源于 `project/Database/sample_fct_ad_performance_daily.csv` 的 21 天样例
- 字段命名遵循 `snake_case`
- 空值统一使用 `null`

## 本地联调启动

在仓库根目录执行：

```bash
python3 project/mock_api/server.py
```

默认监听 `http://127.0.0.1:18080`。

## 已映射接口

- `GET /health`
- `GET /api/v1/overview/summary`
- `GET /api/v1/overview/trend`
- `GET /api/v1/diagnosis/breakdown`
- `GET /api/v1/diagnosis/trend`
- `GET /api/v1/experiments`
- `GET /api/v1/experiments/1/summary`
- `GET /api/v1/experiments/1/trend`
