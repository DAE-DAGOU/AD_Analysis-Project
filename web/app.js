const app = document.getElementById("app");
const statusEl = document.getElementById("data-status");
const applyFilterBtn = document.getElementById("apply-filter");

const fallbackFiles = {
  overviewSummary: "../project/mock_api/v1/overview_summary.json",
  overviewTrend: "../project/mock_api/v1/overview_trend_day.json",
  diagnosisBreakdown: "../project/mock_api/v1/diagnosis_breakdown_placement.json",
  diagnosisTrend: "../project/mock_api/v1/diagnosis_trend_audience_2.json",
  experiments: "../project/mock_api/v1/experiments.json",
  experimentSummary: "../project/mock_api/v1/experiment_1_summary.json",
  experimentTrend: "../project/mock_api/v1/experiment_1_trend_day.json",
};

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

async function readJson(path) {
  const resp = await fetch(path);
  if (!resp.ok) {
    throw new Error(`failed to fetch ${path}`);
  }
  return resp.json();
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

async function renderOverview() {
  const [summary, trend] = await Promise.all([
    readJson(fallbackFiles.overviewSummary),
    readJson(fallbackFiles.overviewTrend),
  ]);
  const m = summary.metrics;
  const c = summary.comparison;

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

  const trendRows = trend.series
    .map(
      (s) => `
      <tr>
        <td>${s.period_start_date}</td>
        <td>${s.simulation_stage_code}</td>
        <td>${formatNumber(s.metrics.spend)}</td>
        <td>${formatNumber(s.metrics.payment_conversions)}</td>
        <td>${formatDecimal(s.metrics.payment_roi, 4)}</td>
      </tr>
    `
    )
    .join("");

  app.innerHTML = `
    <section class="panel">
      <h2>账户总览</h2>
      <p>${currentFilterText()}</p>
      <div class="hint">周同比：${formatPercent(c.wow_change_rate)} | 月同比：${formatPercent(c.mom_change_rate)}</div>
    </section>
    <section class="panel">
      <h2>核心指标卡</h2>
      <div class="cards">
        ${cardsHtml}
      </div>
    </section>
    <section class="panel">
      <h2>阶段趋势（按天）</h2>
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>阶段</th>
            <th>花费</th>
            <th>支付转化量</th>
            <th>支付ROI</th>
          </tr>
        </thead>
        <tbody>
          ${trendRows}
        </tbody>
      </table>
    </section>
    <section class="panel">
      <h2>异常摘要</h2>
      <p>${summary.anomaly_summary.signal_title}</p>
      <div class="hint">${summary.anomaly_summary.signal_message}</div>
      <button id="jump-diagnosis" type="button">查看分维诊断</button>
    </section>
  `;

  document.getElementById("jump-diagnosis")?.addEventListener("click", () => {
    window.location.hash = "#/diagnosis";
  });
}

async function renderDiagnosis() {
  const [payload, trend] = await Promise.all([
    readJson(fallbackFiles.diagnosisBreakdown),
    readJson(fallbackFiles.diagnosisTrend),
  ]);
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
      <div class="hint">当前 mock 重点演示资源位诊断；人群/创意将复用同一交互框架接入对应数据。</div>
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
    readJson(fallbackFiles.experiments),
    readJson(fallbackFiles.experimentSummary),
    readJson(fallbackFiles.experimentTrend),
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
        结论：${recommendScale ? "Test 在核心效率指标上优于 Control，建议进入放量候选。"
    : "Test 尚未稳定优于 Control，建议继续观察或迭代素材。"}
      </div>
    </section>
  `;
}

async function renderRoute() {
  const route = getRouteName();
  setActiveTab(route);
  statusEl.textContent = "数据状态：加载中...";

  try {
    if (route === "overview") await renderOverview();
    if (route === "diagnosis") await renderDiagnosis();
    if (route === "experiments") await renderExperiments();
    statusEl.textContent = "数据状态：mock 文件读取成功";
  } catch (err) {
    app.innerHTML = `
      <section class="panel">
        <h2>加载失败</h2>
        <p>${String(err.message || err)}</p>
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
