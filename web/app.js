const app = document.getElementById("app");
const statusEl = document.getElementById("data-status");
const applyFilterBtn = document.getElementById("apply-filter");

const filters = {
  granularity: document.getElementById("granularity"),
  dateFrom: document.getElementById("date-from"),
  dateTo: document.getElementById("date-to"),
};

const diagnosisState = {
  dimensionType: "placement",
  sortBy: "spend",
  sortOrder: "desc",
  selectedDimensionId: null,
};

const DATA_CONFIG = {
  overviewSummary: {
    file: "overview_summary.json",
    apiPath: "/api/v1/overview/summary",
  },
  overviewTrend: {
    file: "overview_trend_day.json",
    apiPath: "/api/v1/overview/trend",
  },
  diagnosisBreakdown: {
    file: "diagnosis_breakdown_placement.json",
    apiPath: "/api/v1/diagnosis/breakdown",
  },
  diagnosisTrend: {
    file: "diagnosis_trend_audience_2.json",
    apiPath: "/api/v1/diagnosis/trend",
  },
  experiments: {
    file: "experiments.json",
    apiPath: "/api/v1/experiments",
  },
  experimentSummary: {
    file: "experiment_1_summary.json",
    apiPath: "/api/v1/experiments/1/summary",
  },
  experimentTrend: {
    file: "experiment_1_trend_day.json",
    apiPath: "/api/v1/experiments/1/trend",
  },
};

const EMBEDDED_MOCK = {
  overviewSummary: {
    account_id: 1,
    scenario_id: 1,
    granularity: "week",
    period: {
      date_from: "2026-04-01",
      date_to: "2026-04-21",
      period_key: "202616",
    },
    metrics: {
      impressions: 1209780,
      clicks: 45517,
      spend: 58125.27,
      payment_conversions: 2311,
      payment_revenue: 215460.0,
      ctr: 0.0376,
      cpc: 1.277,
      cpm: 48.0461,
      payment_cvr: 0.0508,
      cpa: 25.1516,
      payment_roi: 3.7068,
    },
    comparison: {
      wow_change_rate: 0.067,
      mom_change_rate: null,
    },
    anomaly_summary: {
      signal_level: "warning",
      signal_title: "扩量后投产走弱后进入修复",
      signal_message:
        "扩量阶段新闻信息流与宽泛人群消耗占比提升导致支付效率承压，测试修复期创意 Test 带动支付转化率与支付ROI 回升。",
      suggested_dimension_type: "placement",
    },
  },
  overviewTrend: {
    account_id: 1,
    scenario_id: 1,
    granularity: "day",
    series: [
      { period_key: "20260401", period_start_date: "2026-04-01", simulation_stage_code: "baseline_period", metrics: { spend: 1689.84, payment_conversions: 77, payment_roi: 4.4087 } },
      { period_key: "20260402", period_start_date: "2026-04-02", simulation_stage_code: "baseline_period", metrics: { spend: 1730.4, payment_conversions: 80, payment_roi: 4.473 } },
      { period_key: "20260403", period_start_date: "2026-04-03", simulation_stage_code: "baseline_period", metrics: { spend: 1769.44, payment_conversions: 82, payment_roi: 4.4816 } },
      { period_key: "20260404", period_start_date: "2026-04-04", simulation_stage_code: "baseline_period", metrics: { spend: 1748.96, payment_conversions: 81, payment_roi: 4.4884 } },
      { period_key: "20260405", period_start_date: "2026-04-05", simulation_stage_code: "baseline_period", metrics: { spend: 2135.36, payment_conversions: 93, payment_roi: 4.1314 } },
      { period_key: "20260406", period_start_date: "2026-04-06", simulation_stage_code: "baseline_period", metrics: { spend: 1810.52, payment_conversions: 83, payment_roi: 4.4186 } },
      { period_key: "20260407", period_start_date: "2026-04-07", simulation_stage_code: "baseline_period", metrics: { spend: 2162.79, payment_conversions: 94, payment_roi: 4.1169 } },
      { period_key: "20260408", period_start_date: "2026-04-08", simulation_stage_code: "scale_up_start", metrics: { spend: 2571.6, payment_conversions: 100, payment_roi: 3.6701 } },
      { period_key: "20260409", period_start_date: "2026-04-09", simulation_stage_code: "scale_up_start", metrics: { spend: 2605.84, payment_conversions: 100, payment_roi: 3.6111 } },
      { period_key: "20260410", period_start_date: "2026-04-10", simulation_stage_code: "scale_up_start", metrics: { spend: 2579.67, payment_conversions: 100, payment_roi: 3.6478 } },
      { period_key: "20260411", period_start_date: "2026-04-11", simulation_stage_code: "scale_up_imbalance", metrics: { spend: 2804.0, payment_conversions: 96, payment_roi: 3.2168 } },
      { period_key: "20260412", period_start_date: "2026-04-12", simulation_stage_code: "scale_up_imbalance", metrics: { spend: 2860.12, payment_conversions: 99, payment_roi: 3.2558 } },
      { period_key: "20260413", period_start_date: "2026-04-13", simulation_stage_code: "scale_up_imbalance", metrics: { spend: 2815.35, payment_conversions: 95, payment_roi: 3.1648 } },
      { period_key: "20260414", period_start_date: "2026-04-14", simulation_stage_code: "scale_up_imbalance", metrics: { spend: 2867.55, payment_conversions: 99, payment_roi: 3.2369 } },
      { period_key: "20260415", period_start_date: "2026-04-15", simulation_stage_code: "ab_test_recovery", metrics: { spend: 3583.16, payment_conversions: 143, payment_roi: 3.6443 } },
      { period_key: "20260416", period_start_date: "2026-04-16", simulation_stage_code: "ab_test_recovery", metrics: { spend: 3564.68, payment_conversions: 141, payment_roi: 3.6121 } },
      { period_key: "20260417", period_start_date: "2026-04-17", simulation_stage_code: "ab_test_recovery", metrics: { spend: 3643.04, payment_conversions: 144, payment_roi: 3.6 } },
      { period_key: "20260418", period_start_date: "2026-04-18", simulation_stage_code: "ab_test_recovery", metrics: { spend: 3741.66, payment_conversions: 149, payment_roi: 3.6273 } },
      { period_key: "20260419", period_start_date: "2026-04-19", simulation_stage_code: "ab_test_recovery", metrics: { spend: 3723.03, payment_conversions: 148, payment_roi: 3.6186 } },
      { period_key: "20260420", period_start_date: "2026-04-20", simulation_stage_code: "ab_test_recovery", metrics: { spend: 3821.98, payment_conversions: 152, payment_roi: 3.6162 } },
      { period_key: "20260421", period_start_date: "2026-04-21", simulation_stage_code: "ab_test_recovery", metrics: { spend: 3896.28, payment_conversions: 155, payment_roi: 3.6106 } },
    ],
  },
  diagnosisBreakdown: {
    account_id: 1,
    scenario_id: 1,
    granularity: "week",
    dimension_type: "placement",
    rows: [
      {
        dimension_id: 2,
        dimension_code: "news_feed",
        dimension_name: "腾讯新闻信息流",
        impressions: 569020,
        clicks: 19076,
        spend: 23146.41,
        payment_conversions: 711,
        payment_revenue: 57294.0,
        ctr: 0.0335,
        payment_cvr: 0.0373,
        cpa: 32.5547,
        payment_roi: 2.4753,
        spend_share: 0.3982,
        vs_account_avg_payment_roi_delta: -1.2315,
      },
      {
        dimension_id: 1,
        dimension_code: "moments_feed",
        dimension_name: "朋友圈信息流",
        impressions: 361500,
        clicks: 14741,
        spend: 22540.33,
        payment_conversions: 1227,
        payment_revenue: 127360.0,
        ctr: 0.0408,
        payment_cvr: 0.0832,
        cpa: 18.3703,
        payment_roi: 5.6503,
        spend_share: 0.3878,
        vs_account_avg_payment_roi_delta: 1.9435,
      },
      {
        dimension_id: 3,
        dimension_code: "video_feed",
        dimension_name: "腾讯视频信息流",
        impressions: 279260,
        clicks: 11700,
        spend: 12438.53,
        payment_conversions: 373,
        payment_revenue: 30806.0,
        ctr: 0.0419,
        payment_cvr: 0.0319,
        cpa: 33.3473,
        payment_roi: 2.4767,
        spend_share: 0.214,
        vs_account_avg_payment_roi_delta: -1.2302,
      },
    ],
  },
  diagnosisTrend: {
    account_id: 1,
    scenario_id: 1,
    dimension_type: "audience",
    dimension_id: 2,
    dimension_name: "宽泛人群",
    series: [
      { period_key: "20260415", period_start_date: "2026-04-15", metrics: { spend: 1617.89, payment_cvr: 0.0346, payment_roi: 2.7388 } },
      { period_key: "20260416", period_start_date: "2026-04-16", metrics: { spend: 1603.62, payment_cvr: 0.0345, payment_roi: 2.7212 } },
      { period_key: "20260417", period_start_date: "2026-04-17", metrics: { spend: 1632.33, payment_cvr: 0.0342, payment_roi: 2.7044 } },
      { period_key: "20260418", period_start_date: "2026-04-18", metrics: { spend: 1680.16, payment_cvr: 0.0348, payment_roi: 2.7421 } },
      { period_key: "20260419", period_start_date: "2026-04-19", metrics: { spend: 1669.45, payment_cvr: 0.0347, payment_roi: 2.7353 } },
      { period_key: "20260420", period_start_date: "2026-04-20", metrics: { spend: 1711.22, payment_cvr: 0.0349, payment_roi: 2.7486 } },
      { period_key: "20260421", period_start_date: "2026-04-21", metrics: { spend: 1730.67, payment_cvr: 0.0351, payment_roi: 2.7598 } },
    ],
    diagnosis: {
      signal_level: "warning",
      signal_message: "宽泛人群近一周承担了更多消耗，但支付转化率显著低于账户均值。",
    },
  },
  experiments: {
    items: [
      {
        experiment_id: 1,
        experiment_code: "exp_creative_recovery_001",
        experiment_name: "创意修复实验001",
        status: "completed",
        start_date: "2026-04-15",
        end_date: "2026-04-21",
      },
    ],
  },
  experimentSummary: {
    experiment_id: 1,
    experiment_name: "创意修复实验001",
    objective: "验证新创意是否改善支付转化率与支付ROI",
    status: "completed",
    groups: [
      { experiment_group: "control", metrics: { ctr: 0.0332, payment_cvr: 0.0361, cpa: 33.7741, payment_roi: 2.3687 } },
      { experiment_group: "test", metrics: { ctr: 0.0406, payment_cvr: 0.0437, cpa: 25.0778, payment_roi: 3.3274 } },
    ],
    comparison: {
      delta_ctr_vs_control: 0.0074,
      delta_payment_cvr_vs_control: 0.0076,
      delta_cpa_vs_control: -8.6963,
      delta_payment_roi_vs_control: 0.9587,
    },
  },
  experimentTrend: {
    experiment_id: 1,
    granularity: "day",
    series: [
      { experiment_group: "control", period_key: "20260415", metrics: { spend: 1016.26, payment_cvr: 0.036, payment_roi: 2.3616 } },
      { experiment_group: "test", period_key: "20260415", metrics: { spend: 804.21, payment_cvr: 0.0437, payment_roi: 3.32 } },
      { experiment_group: "control", period_key: "20260416", metrics: { spend: 1007.72, payment_cvr: 0.0363, payment_roi: 2.3816 } },
      { experiment_group: "test", period_key: "20260416", metrics: { spend: 812.97, payment_cvr: 0.0432, payment_roi: 3.2843 } },
      { experiment_group: "control", period_key: "20260417", metrics: { spend: 1026.02, payment_cvr: 0.0357, payment_roi: 2.3391 } },
      { experiment_group: "test", period_key: "20260417", metrics: { spend: 855.6, payment_cvr: 0.0436, payment_roi: 3.3158 } },
      { experiment_group: "control", period_key: "20260418", metrics: { spend: 1045.54, payment_cvr: 0.0362, payment_roi: 2.372 } },
      { experiment_group: "test", period_key: "20260418", metrics: { spend: 898.38, payment_cvr: 0.044, payment_roi: 3.3438 } },
      { experiment_group: "control", period_key: "20260419", metrics: { spend: 1037.0, payment_cvr: 0.0365, payment_roi: 2.3915 } },
      { experiment_group: "test", period_key: "20260419", metrics: { spend: 906.99, payment_cvr: 0.0435, payment_roi: 3.3121 } },
      { experiment_group: "control", period_key: "20260420", metrics: { spend: 1055.3, payment_cvr: 0.0358, payment_roi: 2.35 } },
      { experiment_group: "test", period_key: "20260420", metrics: { spend: 949.77, payment_cvr: 0.0439, payment_roi: 3.3387 } },
      { experiment_group: "control", period_key: "20260421", metrics: { spend: 1073.6, payment_cvr: 0.0364, payment_roi: 2.3845 } },
      { experiment_group: "test", period_key: "20260421", metrics: { spend: 991.38, payment_cvr: 0.0442, payment_roi: 3.367 } },
    ],
  },
};

const dataSourceTrace = new Set();

function formatNumber(value) {
  if (value === null || value === undefined) return "--";
  if (typeof value !== "number") return String(value);
  return value.toLocaleString("zh-CN");
}

function formatPercent(value) {
  if (value === null || value === undefined) return "--";
  return `${(value * 100).toFixed(2)}%`;
}

function formatDecimal(value, digits = 2) {
  if (value === null || value === undefined) return "--";
  return value.toFixed(digits);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function toStatusText() {
  if (!dataSourceTrace.size) {
    return "数据状态：未加载";
  }
  const sources = [...dataSourceTrace].join(" + ");
  return `数据状态：已加载（${sources}）`;
}

async function fetchJson(url) {
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) {
    throw new Error(`failed to fetch ${url}`);
  }
  return resp.json();
}

async function readData(key) {
  const cfg = DATA_CONFIG[key];
  if (!cfg) {
    throw new Error(`unknown data key: ${key}`);
  }

  const candidates = [
    `../project/mock_api/v1/${cfg.file}`,
    `/project/mock_api/v1/${cfg.file}`,
    `./mock_api/v1/${cfg.file}`,
    `./v1/${cfg.file}`,
    `http://127.0.0.1:18080${cfg.apiPath}`,
  ];

  for (const url of candidates) {
    try {
      const payload = await fetchJson(url);
      if (url.startsWith("http://127.0.0.1:18080")) {
        dataSourceTrace.add("mock-api");
      } else {
        dataSourceTrace.add("json-file");
      }
      return payload;
    } catch (err) {
      // Try next candidate.
    }
  }

  if (EMBEDDED_MOCK[key]) {
    dataSourceTrace.add("embedded");
    return deepClone(EMBEDDED_MOCK[key]);
  }

  throw new Error(`no available data source for ${key}`);
}

function getRouteName() {
  const hash = window.location.hash || "#/overview";
  const route = hash.replace("#/", "");
  if (["overview", "diagnosis", "experiments"].includes(route)) return route;
  return "overview";
}

function setActiveTab(routeName) {
  document.querySelectorAll(".tabs a").forEach((el) => {
    if (el.dataset.route === routeName) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

function currentFilterText() {
  return `粒度: ${filters.granularity.value} | 时间: ${filters.dateFrom.value} ~ ${filters.dateTo.value}`;
}

function toStageName(stageCode) {
  const stageMap = {
    baseline_period: "基线稳定期",
    scale_up_start: "扩量启动期",
    scale_up_imbalance: "扩量失衡期",
    ab_test_recovery: "测试修复期",
  };
  return stageMap[stageCode] || stageCode;
}

async function renderOverview() {
  const [summary, trend, breakdown] = await Promise.all([
    readData("overviewSummary"),
    readData("overviewTrend"),
    readData("diagnosisBreakdown"),
  ]);

  const m = summary.metrics;
  const c = summary.comparison;
  const stageStats = {};
  let worstDay = null;

  for (const row of trend.series || []) {
    if (!stageStats[row.simulation_stage_code]) {
      stageStats[row.simulation_stage_code] = { spend: 0, conversions: 0 };
    }
    stageStats[row.simulation_stage_code].spend += row.metrics.spend || 0;
    stageStats[row.simulation_stage_code].conversions += row.metrics.payment_conversions || 0;
    if (!worstDay || (row.metrics.payment_roi ?? Number.POSITIVE_INFINITY) < worstDay.metrics.payment_roi) {
      worstDay = row;
    }
  }

  const metricItems = [
    { label: "曝光量", value: formatNumber(m.impressions) },
    { label: "点击量", value: formatNumber(m.clicks) },
    { label: "点击率", value: formatPercent(m.ctr) },
    { label: "花费", value: formatNumber(m.spend) },
    { label: "点击均价", value: formatDecimal(m.cpc, 3) },
    { label: "千次曝光成本", value: formatDecimal(m.cpm, 2) },
    { label: "支付转化量", value: formatNumber(m.payment_conversions) },
    { label: "支付转化率", value: formatPercent(m.payment_cvr) },
    { label: "转化成本", value: formatDecimal(m.cpa, 2) },
    { label: "支付金额", value: formatNumber(m.payment_revenue) },
    { label: "支付ROI", value: formatDecimal(m.payment_roi, 4) },
  ];

  const cardsHtml = metricItems
    .map(
      (item) => `
      <div class="card">
        <div class="label">${item.label}</div>
        <div class="value">${item.value}</div>
      </div>
    `
    )
    .join("");

  const breakdownRows = (breakdown.rows || [])
    .slice()
    .sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0))
    .map(
      (row) => `
      <tr>
        <td>${row.dimension_name}</td>
        <td>${formatNumber(row.spend)}</td>
        <td>${formatPercent(row.spend_share)}</td>
        <td>${formatPercent(row.payment_cvr)}</td>
        <td>${formatDecimal(row.payment_roi, 4)}</td>
      </tr>
    `
    )
    .join("");

  const insightItems = Object.entries(stageStats)
    .sort((a, b) => b[1].spend - a[1].spend)
    .map(
      ([stageCode, data]) => `
      <div class="insight-item">
        <strong>${toStageName(stageCode)}</strong>
        <span>花费 ${formatNumber(data.spend)}，支付转化量 ${formatNumber(data.conversions)}</span>
      </div>
    `
    )
    .join("");

  app.innerHTML = `
    <section class="panel">
      <h2>核心总览指标</h2>
      <p>${currentFilterText()}</p>
      <div class="section-note">周同比：${formatPercent(c.wow_change_rate)} | 月同比：${formatPercent(c.mom_change_rate)}</div>
      <div class="cards">
        ${cardsHtml}
      </div>
    </section>

    <section class="panel">
      <h2>多维度拆分（资源位）</h2>
      <div class="section-note">当前按花费降序展示维度结构，支持快速识别“谁在带量、谁在拖效”。</div>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>花费</th>
            <th>花费占比</th>
            <th>支付转化率</th>
            <th>支付ROI</th>
          </tr>
        </thead>
        <tbody>
          ${breakdownRows}
        </tbody>
      </table>
      <button id="jump-diagnosis" type="button">查看完整分维诊断</button>
    </section>

    <section class="panel">
      <h2>异动归因</h2>
      <div class="section-note">${summary.anomaly_summary.signal_title}</div>
      <div class="insight-list">
        ${insightItems}
      </div>
      <div class="hint">${summary.anomaly_summary.signal_message}</div>
      <div class="section-note">
        最低 ROI 日：${worstDay?.period_start_date ?? "--"}（${formatDecimal(worstDay?.metrics?.payment_roi, 4)}）
      </div>
    </section>
  `;

  document.getElementById("jump-diagnosis")?.addEventListener("click", () => {
    window.location.hash = "#/diagnosis";
  });
}

async function renderDiagnosis() {
  const [payload, trend] = await Promise.all([readData("diagnosisBreakdown"), readData("diagnosisTrend")]);
  const rows = payload.rows || [];
  const sortFactor = diagnosisState.sortOrder === "asc" ? 1 : -1;
  const sortedRows = rows
    .slice()
    .sort((a, b) => {
      const av = a[diagnosisState.sortBy] ?? 0;
      const bv = b[diagnosisState.sortBy] ?? 0;
      if (av === bv) return 0;
      return av > bv ? sortFactor : -sortFactor;
    });

  if (!diagnosisState.selectedDimensionId && sortedRows[0]) {
    diagnosisState.selectedDimensionId = sortedRows[0].dimension_id;
  }

  const tableRows = sortedRows
    .slice(0, 10)
    .map(
      (r) => `
      <tr>
        <td>${r.dimension_name}${r.dimension_id === diagnosisState.selectedDimensionId ? "（已选中）" : ""}</td>
        <td>${formatNumber(r.spend)}</td>
        <td>${formatNumber(r.payment_conversions)}</td>
        <td>${formatDecimal(r.payment_roi, 4)}</td>
        <td><button class="ghost-btn" data-row-id="${r.dimension_id}" type="button">查看趋势</button></td>
      </tr>
    `
    )
    .join("");

  const trendRows = (trend.series || [])
    .map(
      (s) => `
      <tr>
        <td>${s.period_start_date}</td>
        <td>${formatNumber(s.metrics.spend)}</td>
        <td>${formatPercent(s.metrics.payment_cvr)}</td>
        <td>${formatDecimal(s.metrics.payment_roi, 4)}</td>
      </tr>
    `
    )
    .join("");

  app.innerHTML = `
    <section class="panel">
      <h2>分维诊断</h2>
      <p>${currentFilterText()}</p>
      <div class="mini-tabs">
        <button class="${diagnosisState.dimensionType === "audience" ? "active" : ""}" data-dimension="audience" type="button">人群</button>
        <button class="${diagnosisState.dimensionType === "placement" ? "active" : ""}" data-dimension="placement" type="button">资源位</button>
        <button class="${diagnosisState.dimensionType === "creative" ? "active" : ""}" data-dimension="creative" type="button">创意</button>
      </div>
      <div class="hint">当前 mock 重点演示资源位诊断；人群/创意复用同一交互框架。</div>
    </section>
    <section class="panel">
      <h2>维度表现表</h2>
      <div class="sort-row">
        <label>
          排序字段
          <select id="diagnosis-sort-by">
            <option value="spend" ${diagnosisState.sortBy === "spend" ? "selected" : ""}>花费</option>
            <option value="payment_roi" ${diagnosisState.sortBy === "payment_roi" ? "selected" : ""}>支付ROI</option>
            <option value="payment_conversions" ${diagnosisState.sortBy === "payment_conversions" ? "selected" : ""}>支付转化量</option>
            <option value="cpa" ${diagnosisState.sortBy === "cpa" ? "selected" : ""}>转化成本</option>
          </select>
        </label>
        <label>
          排序方式
          <select id="diagnosis-sort-order">
            <option value="desc" ${diagnosisState.sortOrder === "desc" ? "selected" : ""}>降序</option>
            <option value="asc" ${diagnosisState.sortOrder === "asc" ? "selected" : ""}>升序</option>
          </select>
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>花费</th>
            <th>支付转化量</th>
            <th>支付ROI</th>
            <th>趋势</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </section>
    <section class="panel">
      <h2>维度趋势详情</h2>
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>花费</th>
            <th>支付转化率</th>
            <th>支付ROI</th>
          </tr>
        </thead>
        <tbody>
          ${trendRows}
        </tbody>
      </table>
      <div class="hint">${trend.diagnosis?.signal_message ?? "暂无诊断结论"}</div>
    </section>
  `;

  document.querySelectorAll(".mini-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      diagnosisState.dimensionType = btn.dataset.dimension;
      renderDiagnosis();
    });
  });

  document.getElementById("diagnosis-sort-by")?.addEventListener("change", (e) => {
    diagnosisState.sortBy = e.target.value;
    renderDiagnosis();
  });

  document.getElementById("diagnosis-sort-order")?.addEventListener("change", (e) => {
    diagnosisState.sortOrder = e.target.value;
    renderDiagnosis();
  });

  document.querySelectorAll("button[data-row-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      diagnosisState.selectedDimensionId = Number(btn.dataset.rowId);
      renderDiagnosis();
    });
  });
}

async function renderExperiments() {
  const [listPayload, summary, trend] = await Promise.all([
    readData("experiments"),
    readData("experimentSummary"),
    readData("experimentTrend"),
  ]);
  const item = listPayload.items?.[0];
  const control = summary.groups?.find((g) => g.experiment_group === "control");
  const test = summary.groups?.find((g) => g.experiment_group === "test");

  const dailyMap = new Map();
  (trend.series || []).forEach((row) => {
    const key = row.period_key;
    if (!dailyMap.has(key)) {
      dailyMap.set(key, { period_key: key });
    }
    dailyMap.get(key)[row.experiment_group] = row.metrics;
  });
  const dailyRows = [...dailyMap.values()]
    .sort((a, b) => a.period_key.localeCompare(b.period_key))
    .map((row) => {
      const date = `${row.period_key.slice(0, 4)}-${row.period_key.slice(4, 6)}-${row.period_key.slice(6, 8)}`;
      return `
      <tr>
        <td>${date}</td>
        <td>${formatPercent(row.control?.payment_cvr)}</td>
        <td>${formatPercent(row.test?.payment_cvr)}</td>
        <td>${formatDecimal(row.control?.payment_roi, 4)}</td>
        <td>${formatDecimal(row.test?.payment_roi, 4)}</td>
      </tr>
    `;
    })
    .join("");

  const recommendScale = (summary.comparison?.delta_payment_roi_vs_control ?? 0) > 0;

  app.innerHTML = `
    <section class="panel">
      <h2>A/B 测试预留区</h2>
      <p>${currentFilterText()}</p>
    </section>
    <section class="panel">
      <h2>实验概览</h2>
      <div class="cards">
        <div class="card"><div class="label">实验名称</div><div class="value">${item?.experiment_name ?? "--"}</div></div>
        <div class="card"><div class="label">状态</div><div class="value">${item?.status ?? "--"}</div></div>
        <div class="card"><div class="label">时间范围</div><div class="value">${item?.start_date ?? "--"} ~ ${item?.end_date ?? "--"}</div></div>
      </div>
      <div class="hint">目标：${summary.objective ?? "--"}</div>
    </section>
    <section class="panel">
      <h2>Control / Test 核心结果对比</h2>
      <table>
        <thead>
          <tr>
            <th>指标</th>
            <th>Control</th>
            <th>Test</th>
            <th>差异（Test - Control）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CTR</td>
            <td>${formatPercent(control?.metrics.ctr)}</td>
            <td>${formatPercent(test?.metrics.ctr)}</td>
            <td>${formatPercent(summary.comparison?.delta_ctr_vs_control)}</td>
          </tr>
          <tr>
            <td>支付转化率</td>
            <td>${formatPercent(control?.metrics.payment_cvr)}</td>
            <td>${formatPercent(test?.metrics.payment_cvr)}</td>
            <td>${formatPercent(summary.comparison?.delta_payment_cvr_vs_control)}</td>
          </tr>
          <tr>
            <td>转化成本</td>
            <td>${formatDecimal(control?.metrics.cpa, 4)}</td>
            <td>${formatDecimal(test?.metrics.cpa, 4)}</td>
            <td>${formatDecimal(summary.comparison?.delta_cpa_vs_control, 4)}</td>
          </tr>
          <tr>
            <td>支付ROI</td>
            <td>${formatDecimal(control?.metrics.payment_roi, 4)}</td>
            <td>${formatDecimal(test?.metrics.payment_roi, 4)}</td>
            <td>${formatDecimal(summary.comparison?.delta_payment_roi_vs_control, 4)}</td>
          </tr>
        </tbody>
      </table>
    </section>
    <section class="panel">
      <h2>实验期日趋势</h2>
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>Control 支付转化率</th>
            <th>Test 支付转化率</th>
            <th>Control ROI</th>
            <th>Test ROI</th>
          </tr>
        </thead>
        <tbody>
          ${dailyRows}
        </tbody>
      </table>
      <div class="hint">
        结论：${
          recommendScale
            ? "Test 在核心效率指标上优于 Control，建议进入放量候选。"
            : "Test 尚未稳定优于 Control，建议继续观察或迭代素材。"
        }
      </div>
    </section>
  `;
}

async function renderRoute() {
  const route = getRouteName();
  setActiveTab(route);
  dataSourceTrace.clear();
  statusEl.textContent = "数据状态：加载中...";

  try {
    if (route === "overview") await renderOverview();
    if (route === "diagnosis") await renderDiagnosis();
    if (route === "experiments") await renderExperiments();
    statusEl.textContent = toStatusText();
  } catch (err) {
    app.innerHTML = `
      <section class="panel">
        <h2>加载失败</h2>
        <p>${String(err.message || err)}</p>
        <p>建议先用本地服务打开：python3 -m http.server 8080，然后访问 /web/。</p>
      </section>
    `;
    statusEl.textContent = "数据状态：加载失败";
  }
}

applyFilterBtn.addEventListener("click", () => {
  renderRoute();
});

window.addEventListener("hashchange", renderRoute);

if (!window.location.hash) {
  window.location.hash = "#/overview";
}
renderRoute();
