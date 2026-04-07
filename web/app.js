const app = document.getElementById("app");
const statusEl = document.getElementById("data-status");
const applyFilterBtn = document.getElementById("apply-filter");

const fallbackFiles = {
  overviewSummary: "../project/mock_api/v1/overview_summary.json",
  diagnosisBreakdown: "../project/mock_api/v1/diagnosis_breakdown_placement.json",
  experiments: "../project/mock_api/v1/experiments.json",
};

const filters = {
  granularity: document.getElementById("granularity"),
  dateFrom: document.getElementById("date-from"),
  dateTo: document.getElementById("date-to"),
};

function formatNumber(value) {
  if (value === null || value === undefined) return "--";
  if (typeof value !== "number") return String(value);
  return value.toLocaleString("zh-CN");
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
  const payload = await readJson(fallbackFiles.overviewSummary);
  const m = payload.metrics;

  app.innerHTML = `
    <section class="panel">
      <h2>账户总览</h2>
      <p>${currentFilterText()}</p>
    </section>
    <section class="panel">
      <h2>核心指标卡</h2>
      <div class="cards">
        <div class="card"><div class="label">曝光量</div><div class="value">${formatNumber(m.impressions)}</div></div>
        <div class="card"><div class="label">点击量</div><div class="value">${formatNumber(m.clicks)}</div></div>
        <div class="card"><div class="label">花费</div><div class="value">${formatNumber(m.spend)}</div></div>
        <div class="card"><div class="label">支付转化量</div><div class="value">${formatNumber(m.payment_conversions)}</div></div>
        <div class="card"><div class="label">支付金额</div><div class="value">${formatNumber(m.payment_revenue)}</div></div>
        <div class="card"><div class="label">支付ROI</div><div class="value">${formatNumber(m.payment_roi)}</div></div>
      </div>
      <div class="hint">${payload.anomaly_summary.signal_message}</div>
    </section>
  `;
}

async function renderDiagnosis() {
  const payload = await readJson(fallbackFiles.diagnosisBreakdown);
  const rows = payload.rows || [];

  const tableRows = rows
    .slice(0, 5)
    .map(
      (r) => `
      <tr>
        <td>${r.dimension_name}</td>
        <td>${formatNumber(r.spend)}</td>
        <td>${formatNumber(r.payment_conversions)}</td>
        <td>${formatNumber(r.payment_roi)}</td>
      </tr>
    `
    )
    .join("");

  app.innerHTML = `
    <section class="panel">
      <h2>分维诊断（资源位）</h2>
      <p>${currentFilterText()}</p>
    </section>
    <section class="panel">
      <h2>Top 维度表现</h2>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>花费</th>
            <th>支付转化量</th>
            <th>支付ROI</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div class="hint">下一步：在 Step 6 分支补维度切换、趋势图和诊断结论联动。</div>
    </section>
  `;
}

async function renderExperiments() {
  const payload = await readJson(fallbackFiles.experiments);
  const item = payload.items?.[0];

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
      <div class="hint">下一步：在 Step 7 分支补 Control/Test 对比结果卡与趋势。</div>
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
