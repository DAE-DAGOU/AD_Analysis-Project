# 广告投放分析平台 MVP 敏捷开发执行文档（非技术背景版）

## 1. 文档目标

这份文档用于把“最终做出完整网页”拆成一系列最小可交付步骤。  
每一步都必须满足：`有可见结果`、`可验证`、`可回退`。

最终成品范围固定为 3 个页面：
- 总览
- 分维诊断
- A/B 测试预留区

## 2. 先固定边界（不再反复改方向）

本轮 V1 固定以下边界，确保敏捷推进不失控：
- 核心用户：广告投放运营/优化师
- 核心目标：支付转化监控 + 异常归因
- 核心维度：人群 / 资源位 / 创意
- 时间视角：日 / 周 / 月（含周同比、月同比）
- 数据来源：模拟数据（非真实线上数据）

边界来源文档：
- [PRD.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/PRD.md)
- [page_spec.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/page_spec.md)
- [metric_dictionary.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/metric_dictionary.md)
- [simulation_rules.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/simulation_rules.md)
- [api_contract.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/api_contract.md)
- [validation_plan.md](/Users/sunjialu/Library/Mobile Documents/com~apple~CloudDocs/Project/Resume/project/validation_plan.md)

## 3. 你只需要记住的敏捷规则

1. 一次只做一个“最小闭环”，不并行做多个大模块。  
2. 每完成一步就验收，未通过不进入下一步。  
3. 页面实现优先“能跑通”，再做视觉优化。  
4. 所有口径以指标字典为准，不在页面里临时改公式。  
5. 新增需求进入 V2 待办，不打断当前 V1。

## 4. 单步任务模板（每次都按这个执行）

每个任务卡必须写清 5 件事：
- 目标：这一步只解决一个问题
- 输入：依赖哪些现有文档/数据
- 动作：实际开发动作（最多 3-5 条）
- 产出：可以截图或直接运行验证的结果
- 验收：通过条件（DoD）

建议每步时长：`45-90 分钟`。  
如果超过 90 分钟还没闭环，立即拆小。

## 5. V1 迭代路线图（从 0 到完整网页）

## Step 0：冻结 V1 需求（30 分钟）

- 目标：防止做着做着范围膨胀
- 输入：PRD、page_spec
- 动作：
  - 确认只做 3 个页面
  - 确认不做投放创建、自动出价、权限系统
  - 确认“支付转化”为唯一核心目标
- 产出：V1 Scope 清单（可直接写在任务看板）
- 验收：团队对“做什么/不做什么”无歧义

## Step 1：数据层可跑通（60 分钟）

- 目标：让底层数据可被稳定读取
- 输入：`Database/schema.sql`、`Database/seed_dimensions.sql`、`Database/sample_fct_ad_performance_daily.csv`
- 动作：
  - 建好本地数据库结构
  - 导入维表和事实表样例数据
  - 执行基础约束检查（主键、外键、非负、链路约束）
- 产出：可查询的数据底座
- 验收：
  - 主键唯一
  - `clicks <= impressions`
  - `payment_conversions <= clicks`

## Step 2：指标计算可复现（60 分钟）

- 目标：确保公式在数据层可重复算出
- 输入：`metric_dictionary.md`、`mart_spec.md`
- 动作：
  - 建立账户级聚合查询（总览）
  - 建立分维聚合查询（诊断）
  - 建立实验组聚合查询（A/B）
- 产出：3 类聚合结果（对应 3 个页面）
- 验收：
  - `ctr/cpc/cpm/payment_cvr/cpa/payment_roi` 与字典一致
  - 比率类指标均为“汇总后重算”

## Step 3：接口层可消费（45-60 分钟）

- 目标：前端不直接读底表，只读统一接口
- 输入：`api_contract.md`、`mock_api/v1/*.json`
- 动作：
  - 按契约准备接口返回结构（先 mock）
  - 检查字段命名、空值、枚举是否符合约定
  - 逐个接口联调最小 happy path
- 产出：稳定接口层（至少 mock 可用）
- 验收：
  - 关键接口都能返回 200
  - 字段全部 `snake_case`
  - 空值统一 `null`

## Step 4：前端骨架跑通（60 分钟）

- 目标：先有“能跳转的壳”，再填内容
- 输入：`page_spec.md`
- 动作：
  - 搭建 3 页面路由
  - 做统一筛选区（时间范围、粒度）
  - 完成页面间跳转链路
- 产出：可导航、可切换的页面骨架
- 验收：
  - 能从总览进入分维诊断
  - 能从分维诊断进入 A/B 区

## Step 5：总览页闭环（60-90 分钟）

- 目标：完成第一条“可讲故事”的闭环
- 输入：`overview_summary.json`、`overview_trend_day.json`
- 动作：
  - 渲染核心指标卡
  - 渲染趋势图
  - 渲染异常摘要并可跳转诊断页
- 产出：总览页可独立演示
- 验收：
  - 支持日/周/月视角切换
  - 核心指标与趋势一致
  - 异常摘要可引导下钻

## Step 6：分维诊断页闭环（60-90 分钟）

- 目标：完成“发现异常 -> 定位原因”
- 输入：`diagnosis_breakdown_placement.json`、`diagnosis_trend_audience_2.json`
- 动作：
  - 渲染维度 tab（人群/资源位/创意）
  - 渲染分维表格和排序
  - 渲染选中维度趋势与诊断说明
- 产出：诊断页可独立演示
- 验收：
  - 可定位“谁在带量、谁在拖效”
  - 从总览带参进入后状态正确

## Step 7：A/B 测试页闭环（45-60 分钟）

- 目标：完成“验证优化动作”的展示闭环
- 输入：`experiments.json`、`experiment_1_summary.json`、`experiment_1_trend_day.json`
- 动作：
  - 渲染实验概览
  - 渲染 Control/Test 核心结果对比
  - 渲染实验结论区
- 产出：A/B 页面可独立演示
- 验收：
  - 能清楚展示 Test 是否优于 Control
  - 可解释结果边界（只是 MVP 模拟验证）

## Step 8：联调回归与演示封版（60 分钟）

- 目标：形成可投递/可面试展示版本
- 输入：`validation_plan.md`
- 动作：
  - 按验证计划做全链路检查
  - 修复字段冲突、口径冲突、交互断点
  - 固化演示脚本（进入路径 + 关键讲点）
- 产出：V1 封版 Demo
- 验收：
  - `整体效果 -> 异常指标 -> 异常原因` 在 3 次点击内完成
  - 所有页面与契约字段一致
  - 无明显报错或空白页

## 6. 今晚与明天的执行节奏（建议）

今晚（优先“可投递可演示”）：
- 完成 Step 0 到 Step 5
- 至少保证总览页闭环可演示

明天（优先“完整性和可面试解释”）：
- 完成 Step 6 到 Step 8
- 打磨诊断逻辑、实验解释、讲稿

## 7. 高风险点与止损机制

高风险点：
- 指标口径被前端二次改写，导致页面与文档不一致
- 先堆 UI 再补数据，最后发现链路不通
- 一次做太多导致无法验收

止损机制：
- 任一步骤卡住 20 分钟以上，立即降级为“先 mock 通路”
- 任一模块出现口径争议，立即回到 `metric_dictionary.md`
- 任一页面无数据，先保证空态可读，再排查数据

## 8. Definition of Done（V1 总验收）

满足以下条件即视为“完整体网页 V1”：
- 3 个页面都可访问、可交互、可演示
- 所有核心指标公式与 `metric_dictionary.md` 一致
- 接口字段与 `api_contract.md` 一致
- 页面行为与 `page_spec.md` 一致
- 验证项按 `validation_plan.md` 通过

## 9. 你每轮只需要做的 3 个动作

1. 选定下一步（只选一个 Step，不并行）。  
2. 看该 Step 的输入文档，确认“本步目标”。  
3. 完成后按“验收标准”逐条打勾，再进入下一步。

这样推进，你不需要技术背景也能稳定产出：每次都拿到一个真实、可验证、可复用的增量结果。
