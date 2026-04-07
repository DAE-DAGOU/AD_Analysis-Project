# 广告投放分析平台 MVP 敏捷开发执行文档（Git 并行开发版）

## 1. 文档目标

这份文档把“做出完整网页”拆成可并行推进的最小交付步骤，目标是：
- 交付完整 3 页面 Demo（总览 / 分维诊断 / A/B 测试）
- 在 Git 下并行开发，减少互相阻塞
- 每一步都可验证、可回退、可合并

## 2. V1 范围冻结（先定边界，再并行）

本轮 V1 固定：
- 核心用户：广告投放运营/优化师
- 核心目标：支付转化监控 + 异常归因
- 核心维度：人群 / 资源位 / 创意
- 时间视角：日 / 周 / 月（含周同比、月同比）
- 数据来源：模拟数据（非真实线上数据）

范围依据：
- [PRD.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/PRD.md)
- [page_spec.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/page_spec.md)
- [metric_dictionary.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/metric_dictionary.md)
- [simulation_rules.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/simulation_rules.md)
- [api_contract.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/api_contract.md)
- [validation_plan.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/validation_plan.md)

## 3. Git 并行开发规则（V1）

## 3.1 分支模型

- `main`：只放“可演示稳定版本”
- `develop`：日常集成分支
- `feature/*`：并行功能分支
- `hotfix/*`：仅修紧急问题

## 3.2 分支命名规范

- `feature/data-step1-base`
- `feature/data-step2-mart`
- `feature/api-step3-contract`
- `feature/ui-step4-shell`
- `feature/ui-step5-overview`
- `feature/ui-step6-diagnosis`
- `feature/ui-step7-experiment`

## 3.3 提交与合并规范

- 每个分支只做一个主题，不混改
- 提交信息格式：`type(scope): summary`
- 推荐 `type`：`feat` / `fix` / `docs` / `refactor`
- 合并目标：`feature/* -> develop`，封版时 `develop -> main`
- 合并方式：优先 `squash merge`，保持历史清晰

## 3.4 合并门禁（必须同时满足）

- 代码可运行
- 指标口径无冲突
- 接口字段符合 `api_contract.md`
- 页面行为符合 `page_spec.md`
- 本步骤验收项全部通过

## 4. 并行任务拆分（3 条工作线）

Lane A（数据线）：
- 负责数据库、聚合查询、指标重算
- 关键产出：可复现的 overview / diagnosis / experiment 数据结果

Lane B（接口线）：
- 负责 API 契约落地、mock 返回、字段稳定性
- 关键产出：前端可直接消费的接口响应

Lane C（前端线）：
- 负责路由骨架、3 个页面、交互链路
- 关键产出：可演示的页面闭环

说明：
- 如果你目前一个人开发，也照样用 3 条 Lane 的分支方式推进。  
- 这样做的价值是：即使串行开发，也能控制改动范围并降低回滚成本。

## 5. 并行迭代路线图（从 0 到完整网页）

## Step 0：初始化 Git 工作流（30 分钟）

- 目标：建立并行开发底座
- 动作：
  - 建立 `main` 与 `develop`
  - 创建首批 `feature/*` 分支
  - 写清每个分支的职责
- 验收：
  - 任何任务都能映射到唯一分支
  - 团队知道“改哪里、合到哪”

## Step 1：数据底座先跑通（60 分钟，Lane A）

- 输入：`Database/schema.sql`、`Database/seed_dimensions.sql`、`Database/sample_fct_ad_performance_daily.csv`
- 动作：
  - 建库、导数
  - 执行主键/外键/业务约束校验
- 验收：
  - 主键唯一
  - `clicks <= impressions`
  - `payment_conversions <= clicks`

## Sprint A：三线并行（每条线 45-90 分钟）

Step A1（Lane A，数据聚合）：
- 输入：`metric_dictionary.md`、`mart_spec.md`
- 动作：完成账户级、分维级、实验级聚合查询
- 验收：比率类指标全部“汇总后重算”

Step A2（Lane B，接口契约）：
- 输入：`api_contract.md`、`mock_api/v1/*.json`
- 动作：落地 mock 接口结构并对齐字段
- 验收：`snake_case`、`null` 约定、枚举值全部一致

Step A3（Lane C，页面骨架）：
- 输入：`page_spec.md`
- 动作：完成 3 页面路由、基础筛选区、跨页导航
- 验收：总览 -> 诊断 -> A/B 跳转可用

## Gate 1：第一次集成（30 分钟）

- 把 Step A1/A2/A3 合并到 `develop`
- 解决冲突后做一次端到端冒烟
- 通过后进入下一轮并行

## Sprint B：页面闭环并行（每条线 45-90 分钟）

Step B1（Lane C，总代码主线）：
- 总览页：卡片、趋势、异常摘要
- 验收：支持日/周/月切换，可从摘要进入诊断页

Step B2（Lane C 或协作分支）：
- 分维诊断页：维度 tab、表格排序、趋势详情、诊断结论
- 验收：可解释“谁在带量、谁在拖效”

Step B3（Lane C 或协作分支）：
- A/B 页：实验概览、Control/Test 对比、结论区
- 验收：能清楚表达 Test 是否优于 Control

## Gate 2：封版前集成（45 分钟）

- 合并 Sprint B 全部分支到 `develop`
- 按 `validation_plan.md` 做联调
- 修复口径、字段、交互断点

## Step 8：发布 V1（30 分钟）

- `develop` 打 tag（例如 `v1.0-demo`）
- 合并到 `main`
- 固化演示脚本和版本说明

## 6. Git 最小操作清单（非技术背景可照抄）

```bash
git checkout develop
git pull
git checkout -b feature/ui-step5-overview

# 开发并提交
git add .
git commit -m "feat(ui): finish overview cards and trend"
git push -u origin feature/ui-step5-overview
```

每天开始前同步：

```bash
git checkout develop
git pull
git checkout feature/ui-step5-overview
git rebase develop
```

## 7. 今晚与明天节奏（并行版）

今晚：
- 完成 Step 0、Step 1、Sprint A、Gate 1
- 至少产出“可跳转页面骨架 + 可用 mock 接口”

明天：
- 完成 Sprint B、Gate 2、Step 8
- 形成可演示封版版本

## 8. 风险与止损机制

高风险：
- 多分支并行导致冲突累计
- 指标在不同分支被重复定义
- 页面先跑、数据后补，导致返工

止损：
- 每天固定 1 次 `develop` 同步
- 任何口径冲突，以 `metric_dictionary.md` 为唯一标准
- 单分支卡住超过 20 分钟，先提交最小可运行版本再继续

## 9. V1 总验收（Definition of Done）

以下全部满足才算完成：
- `main` 上有可运行、可演示版本
- 3 个页面可访问、可交互
- 指标口径、接口字段、页面行为均与文档一致
- `validation_plan.md` 的关键检查通过

## 10. 你每轮只做的 3 件事

1. 只开启一个目标分支，完成一个最小闭环。  
2. 完成后先验收，再发起合并，不跳步。  
3. 每天至少一次把分支和 `develop` 对齐，避免最后大冲突。
