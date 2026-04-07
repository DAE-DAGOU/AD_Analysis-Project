\set ON_ERROR_STOP on

-- Usage:
-- psql "$DATABASE_URL" -f project/Database/validate_data.sql

WITH checks AS (
  SELECT
    'row_count_fact'::text AS check_name,
    CASE WHEN COUNT(*) = 93 THEN 'PASS' ELSE 'FAIL' END AS result,
    COUNT(*)::text AS detail
  FROM fct_ad_performance_daily

  UNION ALL

  SELECT
    'pk_uniqueness_fact',
    CASE
      WHEN COUNT(*) = COUNT(DISTINCT (account_id, date_key, audience_segment_id, placement_id, creative_id, scenario_id))
      THEN 'PASS'
      ELSE 'FAIL'
    END,
    COUNT(*)::text
  FROM fct_ad_performance_daily

  UNION ALL

  SELECT
    'clicks_lte_impressions',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
    COUNT(*)::text
  FROM fct_ad_performance_daily
  WHERE clicks > impressions

  UNION ALL

  SELECT
    'conversions_lte_clicks',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
    COUNT(*)::text
  FROM fct_ad_performance_daily
  WHERE payment_conversions > clicks

  UNION ALL

  SELECT
    'non_negative_metrics',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
    COUNT(*)::text
  FROM fct_ad_performance_daily
  WHERE impressions < 0
     OR clicks < 0
     OR spend < 0
     OR payment_conversions < 0
     OR payment_revenue < 0

  UNION ALL

  SELECT
    'experiment_control_test_exists',
    CASE WHEN COUNT(DISTINCT experiment_group) = 2 THEN 'PASS' ELSE 'FAIL' END,
    STRING_AGG(DISTINCT experiment_group, ',')
  FROM bridge_experiment_variant
)
SELECT check_name, result, detail
FROM checks
ORDER BY check_name;

SELECT
  simulation_stage_id,
  COUNT(*) AS row_count
FROM fct_ad_performance_daily
GROUP BY simulation_stage_id
ORDER BY simulation_stage_id;
