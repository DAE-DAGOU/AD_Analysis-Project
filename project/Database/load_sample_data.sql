\set ON_ERROR_STOP on

-- Usage (run from repo root):
-- psql "$DATABASE_URL" -f project/Database/schema.sql
-- psql "$DATABASE_URL" -f project/Database/load_sample_data.sql

BEGIN;

TRUNCATE TABLE bridge_experiment_variant CASCADE;
TRUNCATE TABLE dim_experiment CASCADE;
TRUNCATE TABLE fct_ad_performance_daily CASCADE;
TRUNCATE TABLE dim_simulation_stage CASCADE;
TRUNCATE TABLE dim_simulation_scenario CASCADE;
TRUNCATE TABLE dim_creative CASCADE;
TRUNCATE TABLE dim_placement CASCADE;
TRUNCATE TABLE dim_audience_segment CASCADE;
TRUNCATE TABLE dim_date CASCADE;
TRUNCATE TABLE dim_account CASCADE;

\i project/Database/seed_dimensions.sql

\copy fct_ad_performance_daily (
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
)
FROM 'project/Database/sample_fct_ad_performance_daily.csv'
WITH (FORMAT csv, HEADER true);

COMMIT;
