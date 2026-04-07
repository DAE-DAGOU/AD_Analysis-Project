INSERT INTO dim_account (account_id, account_code, account_name, account_status)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'acct_demo_001', '电商效果广告演示账户', 'active');

INSERT INTO dim_date (
  date_key, calendar_date, week_key, week_start_date, month_key, month_start_date,
  day_of_week, is_week_start, is_month_start
)
VALUES
  (20260401, DATE '2026-04-01', 202614, DATE '2026-03-30', 202604, DATE '2026-04-01', 3, FALSE, TRUE),
  (20260402, DATE '2026-04-02', 202614, DATE '2026-03-30', 202604, DATE '2026-04-01', 4, FALSE, FALSE),
  (20260403, DATE '2026-04-03', 202614, DATE '2026-03-30', 202604, DATE '2026-04-01', 5, FALSE, FALSE),
  (20260404, DATE '2026-04-04', 202614, DATE '2026-03-30', 202604, DATE '2026-04-01', 6, FALSE, FALSE),
  (20260405, DATE '2026-04-05', 202614, DATE '2026-03-30', 202604, DATE '2026-04-01', 7, FALSE, FALSE),
  (20260406, DATE '2026-04-06', 202615, DATE '2026-04-06', 202604, DATE '2026-04-01', 1, TRUE, FALSE),
  (20260407, DATE '2026-04-07', 202615, DATE '2026-04-06', 202604, DATE '2026-04-01', 2, FALSE, FALSE),
  (20260408, DATE '2026-04-08', 202615, DATE '2026-04-06', 202604, DATE '2026-04-01', 3, FALSE, FALSE),
  (20260409, DATE '2026-04-09', 202615, DATE '2026-04-06', 202604, DATE '2026-04-01', 4, FALSE, FALSE),
  (20260410, DATE '2026-04-10', 202615, DATE '2026-04-06', 202604, DATE '2026-04-01', 5, FALSE, FALSE),
  (20260411, DATE '2026-04-11', 202615, DATE '2026-04-06', 202604, DATE '2026-04-01', 6, FALSE, FALSE),
  (20260412, DATE '2026-04-12', 202615, DATE '2026-04-06', 202604, DATE '2026-04-01', 7, FALSE, FALSE),
  (20260413, DATE '2026-04-13', 202616, DATE '2026-04-13', 202604, DATE '2026-04-01', 1, TRUE, FALSE),
  (20260414, DATE '2026-04-14', 202616, DATE '2026-04-13', 202604, DATE '2026-04-01', 2, FALSE, FALSE),
  (20260415, DATE '2026-04-15', 202616, DATE '2026-04-13', 202604, DATE '2026-04-01', 3, FALSE, FALSE),
  (20260416, DATE '2026-04-16', 202616, DATE '2026-04-13', 202604, DATE '2026-04-01', 4, FALSE, FALSE),
  (20260417, DATE '2026-04-17', 202616, DATE '2026-04-13', 202604, DATE '2026-04-01', 5, FALSE, FALSE),
  (20260418, DATE '2026-04-18', 202616, DATE '2026-04-13', 202604, DATE '2026-04-01', 6, FALSE, FALSE),
  (20260419, DATE '2026-04-19', 202616, DATE '2026-04-13', 202604, DATE '2026-04-01', 7, FALSE, FALSE),
  (20260420, DATE '2026-04-20', 202617, DATE '2026-04-20', 202604, DATE '2026-04-01', 1, TRUE, FALSE),
  (20260421, DATE '2026-04-21', 202617, DATE '2026-04-20', 202604, DATE '2026-04-01', 2, FALSE, FALSE);

INSERT INTO dim_audience_segment (
  audience_segment_id, audience_segment_code, audience_segment_name,
  traffic_scale_level, conversion_quality_level, is_active
)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'core_audience', '核心人群', 'medium', 'high', TRUE),
  (2, 'broad_audience', '宽泛人群', 'high', 'low', TRUE),
  (3, 'retargeting_audience', '再营销人群', 'low', 'very_high', TRUE);

INSERT INTO dim_placement (
  placement_id, placement_code, placement_name, placement_type,
  traffic_capacity_level, click_attraction_level, conversion_quality_level, is_active
)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'moments_feed', '朋友圈信息流', 'feed', 'medium', 'medium', 'high', TRUE),
  (2, 'news_feed', '腾讯新闻信息流', 'feed', 'high', 'medium', 'low', TRUE),
  (3, 'video_feed', '腾讯视频信息流', 'feed', 'medium', 'high', 'medium', TRUE);

INSERT INTO dim_creative (
  creative_id, creative_code, creative_name, creative_role, is_test_variant, is_active
)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'creative_a', '创意A', 'baseline', FALSE, TRUE),
  (2, 'creative_b', '创意B', 'support', FALSE, TRUE),
  (3, 'creative_test', '创意Test', 'test', TRUE, TRUE);

INSERT INTO dim_simulation_scenario (
  scenario_id, scenario_code, scenario_name, objective_type, description, is_active
)
OVERRIDING SYSTEM VALUE
VALUES
  (
    1,
    'budget_expansion_efficiency_drop',
    '预算扩量后投产下滑修复',
    'payment_conversion',
    '模拟预算扩量后宽泛人群与新闻信息流占比提升，导致支付转化率下滑，再通过创意实验修复效率的场景。',
    TRUE
  );

INSERT INTO dim_simulation_stage (
  simulation_stage_id, stage_code, stage_name, stage_order, stage_description
)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'baseline_period', '基线稳定期', 1, '账户结构稳定，建立正常参考线。'),
  (2, 'scale_up_start', '扩量启动期', 2, '预算提升，宽泛人群和可扩量资源位占比上升。'),
  (3, 'scale_up_imbalance', '扩量失衡期', 3, '扩量结构失衡，旧创意疲劳，支付效率下滑。'),
  (4, 'ab_test_recovery', '测试修复期', 4, '通过创意A/B测试验证优化方向，逐步修复投产表现。');

INSERT INTO dim_experiment (
  experiment_id, experiment_code, account_id, scenario_id, experiment_name,
  experiment_type, objective, status, start_date_key, end_date_key
)
OVERRIDING SYSTEM VALUE
VALUES
  (
    1,
    'exp_creative_recovery_001',
    1,
    1,
    '创意修复实验001',
    'creative_ab_test',
    '验证新创意是否改善支付转化率与支付ROI',
    'completed',
    20260415,
    20260421
  );

INSERT INTO bridge_experiment_variant (experiment_id, creative_id, experiment_group)
VALUES
  (1, 1, 'control'),
  (1, 3, 'test');
