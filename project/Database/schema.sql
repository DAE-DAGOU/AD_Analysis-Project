CREATE TABLE dim_account (
  account_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_code VARCHAR(64) NOT NULL UNIQUE,
  account_name VARCHAR(128) NOT NULL,
  account_status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (account_status IN ('active', 'inactive', 'archived'))
);

CREATE TABLE dim_date (
  date_key INTEGER PRIMARY KEY,
  calendar_date DATE NOT NULL UNIQUE,
  week_key INTEGER NOT NULL,
  week_start_date DATE NOT NULL,
  month_key INTEGER NOT NULL,
  month_start_date DATE NOT NULL,
  day_of_week SMALLINT NOT NULL,
  is_week_start BOOLEAN NOT NULL DEFAULT FALSE,
  is_month_start BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (day_of_week BETWEEN 1 AND 7)
);

CREATE INDEX idx_dim_date_week_key ON dim_date (week_key);
CREATE INDEX idx_dim_date_month_key ON dim_date (month_key);

CREATE TABLE dim_audience_segment (
  audience_segment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  audience_segment_code VARCHAR(64) NOT NULL UNIQUE,
  audience_segment_name VARCHAR(64) NOT NULL,
  traffic_scale_level VARCHAR(16) NOT NULL,
  conversion_quality_level VARCHAR(16) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (traffic_scale_level IN ('low', 'medium', 'high')),
  CHECK (conversion_quality_level IN ('low', 'medium', 'high', 'very_high'))
);

CREATE TABLE dim_placement (
  placement_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  placement_code VARCHAR(64) NOT NULL UNIQUE,
  placement_name VARCHAR(64) NOT NULL,
  placement_type VARCHAR(32) NOT NULL,
  traffic_capacity_level VARCHAR(16) NOT NULL,
  click_attraction_level VARCHAR(16) NOT NULL,
  conversion_quality_level VARCHAR(16) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (placement_type IN ('feed')),
  CHECK (traffic_capacity_level IN ('low', 'medium', 'high')),
  CHECK (click_attraction_level IN ('low', 'medium', 'high')),
  CHECK (conversion_quality_level IN ('low', 'medium', 'high'))
);

CREATE TABLE dim_creative (
  creative_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  creative_code VARCHAR(64) NOT NULL UNIQUE,
  creative_name VARCHAR(64) NOT NULL,
  creative_role VARCHAR(32) NOT NULL,
  is_test_variant BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (creative_role IN ('baseline', 'support', 'test'))
);

CREATE TABLE dim_simulation_scenario (
  scenario_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scenario_code VARCHAR(64) NOT NULL UNIQUE,
  scenario_name VARCHAR(128) NOT NULL,
  objective_type VARCHAR(32) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (objective_type IN ('payment_conversion'))
);

CREATE TABLE dim_simulation_stage (
  simulation_stage_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  stage_code VARCHAR(64) NOT NULL UNIQUE,
  stage_name VARCHAR(64) NOT NULL,
  stage_order SMALLINT NOT NULL UNIQUE,
  stage_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dim_experiment (
  experiment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  experiment_code VARCHAR(64) NOT NULL UNIQUE,
  account_id BIGINT NOT NULL,
  scenario_id BIGINT NOT NULL,
  experiment_name VARCHAR(128) NOT NULL,
  experiment_type VARCHAR(32) NOT NULL,
  objective VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  start_date_key INTEGER NOT NULL,
  end_date_key INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (account_id) REFERENCES dim_account(account_id) ON DELETE RESTRICT,
  FOREIGN KEY (scenario_id) REFERENCES dim_simulation_scenario(scenario_id) ON DELETE RESTRICT,
  FOREIGN KEY (start_date_key) REFERENCES dim_date(date_key) ON DELETE RESTRICT,
  FOREIGN KEY (end_date_key) REFERENCES dim_date(date_key) ON DELETE RESTRICT,
  CHECK (experiment_type IN ('creative_ab_test')),
  CHECK (status IN ('draft', 'running', 'completed')),
  CHECK (start_date_key <= end_date_key)
);

CREATE INDEX idx_dim_experiment_account ON dim_experiment (account_id);
CREATE INDEX idx_dim_experiment_status ON dim_experiment (status);

CREATE TABLE bridge_experiment_variant (
  experiment_id BIGINT NOT NULL,
  creative_id BIGINT NOT NULL,
  experiment_group VARCHAR(16) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (experiment_id, creative_id),
  FOREIGN KEY (experiment_id) REFERENCES dim_experiment(experiment_id) ON DELETE CASCADE,
  FOREIGN KEY (creative_id) REFERENCES dim_creative(creative_id) ON DELETE RESTRICT,
  CHECK (experiment_group IN ('control', 'test'))
);

CREATE INDEX idx_bridge_experiment_group ON bridge_experiment_variant (experiment_id, experiment_group);
CREATE UNIQUE INDEX uq_bridge_experiment_group_creative
  ON bridge_experiment_variant (experiment_id, experiment_group, creative_id);

CREATE TABLE fct_ad_performance_daily (
  account_id BIGINT NOT NULL,
  date_key INTEGER NOT NULL,
  audience_segment_id BIGINT NOT NULL,
  placement_id BIGINT NOT NULL,
  creative_id BIGINT NOT NULL,
  scenario_id BIGINT NOT NULL,
  simulation_stage_id BIGINT NOT NULL,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  spend DECIMAL(18,2) NOT NULL DEFAULT 0,
  payment_conversions BIGINT NOT NULL DEFAULT 0,
  payment_revenue DECIMAL(18,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (
    account_id,
    date_key,
    audience_segment_id,
    placement_id,
    creative_id,
    scenario_id
  ),
  FOREIGN KEY (account_id) REFERENCES dim_account(account_id) ON DELETE RESTRICT,
  FOREIGN KEY (date_key) REFERENCES dim_date(date_key) ON DELETE RESTRICT,
  FOREIGN KEY (audience_segment_id) REFERENCES dim_audience_segment(audience_segment_id) ON DELETE RESTRICT,
  FOREIGN KEY (placement_id) REFERENCES dim_placement(placement_id) ON DELETE RESTRICT,
  FOREIGN KEY (creative_id) REFERENCES dim_creative(creative_id) ON DELETE RESTRICT,
  FOREIGN KEY (scenario_id) REFERENCES dim_simulation_scenario(scenario_id) ON DELETE RESTRICT,
  FOREIGN KEY (simulation_stage_id) REFERENCES dim_simulation_stage(simulation_stage_id) ON DELETE RESTRICT,
  CHECK (impressions >= 0),
  CHECK (clicks >= 0),
  CHECK (spend >= 0),
  CHECK (payment_conversions >= 0),
  CHECK (payment_revenue >= 0),
  CHECK (clicks <= impressions),
  CHECK (payment_conversions <= clicks)
);

CREATE INDEX idx_fct_perf_date ON fct_ad_performance_daily (date_key);
CREATE INDEX idx_fct_perf_account_date ON fct_ad_performance_daily (account_id, date_key);
CREATE INDEX idx_fct_perf_account_stage ON fct_ad_performance_daily (account_id, simulation_stage_id, date_key);
CREATE INDEX idx_fct_perf_audience ON fct_ad_performance_daily (audience_segment_id, date_key);
CREATE INDEX idx_fct_perf_placement ON fct_ad_performance_daily (placement_id, date_key);
CREATE INDEX idx_fct_perf_creative ON fct_ad_performance_daily (creative_id, date_key);
CREATE INDEX idx_fct_perf_scenario ON fct_ad_performance_daily (scenario_id, date_key);

CREATE OR REPLACE VIEW mart_account_overview AS
SELECT
  f.account_id,
  d.date_key,
  d.calendar_date,
  d.week_key,
  d.month_key,
  f.scenario_id,
  f.simulation_stage_id,
  SUM(f.impressions) AS impressions,
  SUM(f.clicks) AS clicks,
  SUM(f.spend) AS spend,
  SUM(f.payment_conversions) AS payment_conversions,
  SUM(f.payment_revenue) AS payment_revenue,
  SUM(f.clicks)::DECIMAL / NULLIF(SUM(f.impressions), 0) AS ctr,
  SUM(f.spend) / NULLIF(SUM(f.clicks), 0) AS cpc,
  SUM(f.spend) / NULLIF(SUM(f.impressions), 0) * 1000 AS cpm,
  SUM(f.payment_conversions)::DECIMAL / NULLIF(SUM(f.clicks), 0) AS payment_cvr,
  SUM(f.spend) / NULLIF(SUM(f.payment_conversions), 0) AS cpa,
  SUM(f.payment_revenue) / NULLIF(SUM(f.spend), 0) AS payment_roi
FROM fct_ad_performance_daily f
JOIN dim_date d ON d.date_key = f.date_key
GROUP BY
  f.account_id, d.date_key, d.calendar_date, d.week_key, d.month_key,
  f.scenario_id, f.simulation_stage_id;

CREATE OR REPLACE VIEW mart_dimension_breakdown AS
SELECT
  f.account_id,
  d.date_key,
  d.week_key,
  d.month_key,
  f.scenario_id,
  'audience'::VARCHAR(32) AS dimension_type,
  a.audience_segment_id::BIGINT AS dimension_id,
  a.audience_segment_name::VARCHAR(128) AS dimension_name,
  SUM(f.impressions) AS impressions,
  SUM(f.clicks) AS clicks,
  SUM(f.spend) AS spend,
  SUM(f.payment_conversions) AS payment_conversions,
  SUM(f.payment_revenue) AS payment_revenue,
  SUM(f.clicks)::DECIMAL / NULLIF(SUM(f.impressions), 0) AS ctr,
  SUM(f.payment_conversions)::DECIMAL / NULLIF(SUM(f.clicks), 0) AS payment_cvr,
  SUM(f.spend) / NULLIF(SUM(f.payment_conversions), 0) AS cpa,
  SUM(f.payment_revenue) / NULLIF(SUM(f.spend), 0) AS payment_roi
FROM fct_ad_performance_daily f
JOIN dim_date d ON d.date_key = f.date_key
JOIN dim_audience_segment a ON a.audience_segment_id = f.audience_segment_id
GROUP BY
  f.account_id, d.date_key, d.week_key, d.month_key, f.scenario_id,
  a.audience_segment_id, a.audience_segment_name

UNION ALL

SELECT
  f.account_id,
  d.date_key,
  d.week_key,
  d.month_key,
  f.scenario_id,
  'placement'::VARCHAR(32) AS dimension_type,
  p.placement_id::BIGINT AS dimension_id,
  p.placement_name::VARCHAR(128) AS dimension_name,
  SUM(f.impressions) AS impressions,
  SUM(f.clicks) AS clicks,
  SUM(f.spend) AS spend,
  SUM(f.payment_conversions) AS payment_conversions,
  SUM(f.payment_revenue) AS payment_revenue,
  SUM(f.clicks)::DECIMAL / NULLIF(SUM(f.impressions), 0) AS ctr,
  SUM(f.payment_conversions)::DECIMAL / NULLIF(SUM(f.clicks), 0) AS payment_cvr,
  SUM(f.spend) / NULLIF(SUM(f.payment_conversions), 0) AS cpa,
  SUM(f.payment_revenue) / NULLIF(SUM(f.spend), 0) AS payment_roi
FROM fct_ad_performance_daily f
JOIN dim_date d ON d.date_key = f.date_key
JOIN dim_placement p ON p.placement_id = f.placement_id
GROUP BY
  f.account_id, d.date_key, d.week_key, d.month_key, f.scenario_id,
  p.placement_id, p.placement_name

UNION ALL

SELECT
  f.account_id,
  d.date_key,
  d.week_key,
  d.month_key,
  f.scenario_id,
  'creative'::VARCHAR(32) AS dimension_type,
  c.creative_id::BIGINT AS dimension_id,
  c.creative_name::VARCHAR(128) AS dimension_name,
  SUM(f.impressions) AS impressions,
  SUM(f.clicks) AS clicks,
  SUM(f.spend) AS spend,
  SUM(f.payment_conversions) AS payment_conversions,
  SUM(f.payment_revenue) AS payment_revenue,
  SUM(f.clicks)::DECIMAL / NULLIF(SUM(f.impressions), 0) AS ctr,
  SUM(f.payment_conversions)::DECIMAL / NULLIF(SUM(f.clicks), 0) AS payment_cvr,
  SUM(f.spend) / NULLIF(SUM(f.payment_conversions), 0) AS cpa,
  SUM(f.payment_revenue) / NULLIF(SUM(f.spend), 0) AS payment_roi
FROM fct_ad_performance_daily f
JOIN dim_date d ON d.date_key = f.date_key
JOIN dim_creative c ON c.creative_id = f.creative_id
GROUP BY
  f.account_id, d.date_key, d.week_key, d.month_key, f.scenario_id,
  c.creative_id, c.creative_name;

CREATE OR REPLACE VIEW mart_experiment_result AS
SELECT
  e.experiment_id,
  e.experiment_name,
  bev.experiment_group,
  f.account_id,
  f.date_key,
  SUM(f.impressions) AS impressions,
  SUM(f.clicks) AS clicks,
  SUM(f.spend) AS spend,
  SUM(f.payment_conversions) AS payment_conversions,
  SUM(f.payment_revenue) AS payment_revenue,
  SUM(f.clicks)::DECIMAL / NULLIF(SUM(f.impressions), 0) AS ctr,
  SUM(f.payment_conversions)::DECIMAL / NULLIF(SUM(f.clicks), 0) AS payment_cvr,
  SUM(f.spend) / NULLIF(SUM(f.payment_conversions), 0) AS cpa,
  SUM(f.payment_revenue) / NULLIF(SUM(f.spend), 0) AS payment_roi
FROM dim_experiment e
JOIN bridge_experiment_variant bev
  ON bev.experiment_id = e.experiment_id
JOIN fct_ad_performance_daily f
  ON f.creative_id = bev.creative_id
 AND f.account_id = e.account_id
 AND f.date_key BETWEEN e.start_date_key AND e.end_date_key
GROUP BY
  e.experiment_id, e.experiment_name, bev.experiment_group,
  f.account_id, f.date_key;

