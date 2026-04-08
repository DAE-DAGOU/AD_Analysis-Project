# Web Shell (Step 4)

本目录是广告投放分析平台 MVP 的前端骨架版本，对应 `feature/ui-step4-shell`。

## 当前能力

- 三页面路由：
  - `#/overview`
  - `#/diagnosis`
  - `#/experiments`
- 统一筛选区：
  - 粒度（日/周/月）
  - 起止日期
- 跨页导航可用
- 页面可读取 `project/mock_api/v1` 的本地 JSON
- 当 JSON 路径不可用时，自动回退到内置 mock 数据（不再直接报加载失败）
- 总览页按三段式展示：核心总览指标 -> 多维度拆分 -> 异动归因

## 启动方式

在仓库根目录执行：

```bash
python3 -m http.server 8080
```

打开：

`http://127.0.0.1:8080/web/`

## 后续分支承接

- `feature/ui-step5-overview`：补全总览指标卡和趋势模块
- `feature/ui-step6-diagnosis`：补全维度切换、排序、趋势联动
- `feature/ui-step7-experiment`：补全 Control/Test 对比和实验结论
