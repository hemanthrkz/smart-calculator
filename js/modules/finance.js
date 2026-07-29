/**
 * Math Intelligence Studio - Finance Studio
 * 9 Financial Calculators & Investment Growth Visualizer with SVG Charts
 */

window.FinanceStudio = {
  activeTool: 'compound',

  init() {
    window.EventBus.on('mount-module-finance', container => {
      this.renderUI(container);
    });
  },

  renderUI(container) {
    container.innerHTML = `
      <div class="module-container">
        <!-- Financial Tools Sub-tabs -->
        <div class="tabs-header">
          <div class="sub-tab ${this.activeTool === 'compound' ? 'active' : ''}" data-tool="compound">Compound</div>
          <div class="sub-tab ${this.activeTool === 'sip' ? 'active' : ''}" data-tool="sip">SIP</div>
          <div class="sub-tab ${this.activeTool === 'emi' ? 'active' : ''}" data-tool="emi">EMI / Loan</div>
          <div class="sub-tab ${this.activeTool === 'retirement' ? 'active' : ''}" data-tool="retirement">Retirement</div>
          <div class="sub-tab ${this.activeTool === 'inflation' ? 'active' : ''}" data-tool="inflation">Inflation</div>
          <div class="sub-tab ${this.activeTool === 'currency' ? 'active' : ''}" data-tool="currency">Currency</div>
          <div class="sub-tab ${this.activeTool === 'tax' ? 'active' : ''}" data-tool="tax">Tax</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; height:100%;">
          <!-- Form Inputs -->
          <div id="finance-inputs-area" class="glass-card"></div>

          <!-- Visual Chart & Results -->
          <div class="glass-card" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div id="finance-results-area"></div>
            <div id="finance-chart-area" style="height:140px; width:100%;"></div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.sub-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTool = tab.getAttribute('data-tool');
        this.renderToolForm(container);
      });
    });

    this.renderToolForm(container);
  },

  renderToolForm(container) {
    const inputsArea = container.querySelector('#finance-inputs-area');
    if (!inputsArea) return;

    if (this.activeTool === 'compound') {
      inputsArea.innerHTML = `
        <div class="card-header">COMPOUND INTEREST CALCULATOR</div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Principal Amount ($)</label>
          <input type="number" id="fin-p" class="studio-input" value="10000">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Annual Interest Rate (%)</label>
          <input type="number" id="fin-r" class="studio-input" value="8">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Time Horizon (Years)</label>
          <input type="number" id="fin-t" class="studio-input" value="10">
        </div>
      `;

      const compute = () => {
        const p = parseFloat(container.querySelector('#fin-p').value) || 0;
        const r = parseFloat(container.querySelector('#fin-r').value) || 0;
        const t = parseFloat(container.querySelector('#fin-t').value) || 0;

        const total = p * ((1 + r / 100) ** t);
        const interest = total - p;

        this.renderResults(p, interest, total);
      };

      container.querySelectorAll('.studio-input').forEach(inp => inp.addEventListener('input', compute));
      compute();

    } else if (this.activeTool === 'sip') {
      inputsArea.innerHTML = `
        <div class="card-header">SIP (SYSTEMATIC INVESTMENT PLAN)</div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Monthly Investment ($)</label>
          <input type="number" id="sip-m" class="studio-input" value="500">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Expected Return Rate (%)</label>
          <input type="number" id="sip-r" class="studio-input" value="12">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Tenure (Years)</label>
          <input type="number" id="sip-t" class="studio-input" value="15">
        </div>
      `;

      const compute = () => {
        const m = parseFloat(container.querySelector('#sip-m').value) || 0;
        const r = parseFloat(container.querySelector('#sip-r').value) || 0;
        const t = parseFloat(container.querySelector('#sip-t').value) || 0;

        const months = t * 12;
        const i = r / 12 / 100;
        const totalInvested = m * months;
        const totalVal = m * (((1 + i) ** months - 1) / i) * (1 + i);
        const returns = totalVal - totalInvested;

        this.renderResults(totalInvested, returns, totalVal);
      };

      container.querySelectorAll('.studio-input').forEach(inp => inp.addEventListener('input', compute));
      compute();

    } else if (this.activeTool === 'emi') {
      inputsArea.innerHTML = `
        <div class="card-header">LOAN EMI CALCULATOR</div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Loan Amount ($)</label>
          <input type="number" id="emi-p" class="studio-input" value="250000">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Interest Rate (% p.a)</label>
          <input type="number" id="emi-r" class="studio-input" value="7.5">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Loan Tenure (Years)</label>
          <input type="number" id="emi-t" class="studio-input" value="20">
        </div>
      `;

      const compute = () => {
        const p = parseFloat(container.querySelector('#emi-p').value) || 0;
        const r = parseFloat(container.querySelector('#emi-r').value) || 0;
        const t = parseFloat(container.querySelector('#emi-t').value) || 0;

        const rMonthly = r / 12 / 100;
        const n = t * 12;
        const emi = (p * rMonthly * ((1 + rMonthly) ** n)) / (((1 + rMonthly) ** n) - 1);
        const totalPayable = emi * n;
        const totalInterest = totalPayable - p;

        this.renderResults(p, totalInterest, totalPayable, `Monthly EMI: $${Math.round(emi).toLocaleString()}`);
      };

      container.querySelectorAll('.studio-input').forEach(inp => inp.addEventListener('input', compute));
      compute();

    } else {
      // Inflation & General Tax Fallback
      inputsArea.innerHTML = `
        <div class="card-header">INFLATION ADJUSTER</div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Current Cost ($)</label>
          <input type="number" id="inf-c" class="studio-input" value="1000">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Inflation Rate (%)</label>
          <input type="number" id="inf-r" class="studio-input" value="5">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Years in Future</label>
          <input type="number" id="inf-t" class="studio-input" value="10">
        </div>
      `;

      const compute = () => {
        const c = parseFloat(container.querySelector('#inf-c').value) || 0;
        const r = parseFloat(container.querySelector('#inf-r').value) || 0;
        const t = parseFloat(container.querySelector('#inf-t').value) || 0;

        const futureVal = c * ((1 + r / 100) ** t);
        const diff = futureVal - c;

        this.renderResults(c, diff, futureVal, 'Future Value');
      };

      container.querySelectorAll('.studio-input').forEach(inp => inp.addEventListener('input', compute));
      compute();
    }
  },

  renderResults(principal, interest, total, customLabel = null) {
    const resultsArea = document.getElementById('finance-results-area');
    const chartArea = document.getElementById('finance-chart-area');
    if (!resultsArea) return;

    resultsArea.innerHTML = `
      <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">${customLabel || 'Total Projected Wealth'}</div>
      <div class="hero-num" style="font-size:26px;">$${Math.round(total).toLocaleString()}</div>
      <div style="display:flex; justify-content:space-between; margin-top:12px; font-size:12px;">
        <span style="color:var(--accent-cyan);">Invested: $${Math.round(principal).toLocaleString()}</span>
        <span style="color:var(--accent-green);">Profit/Interest: $${Math.round(interest).toLocaleString()}</span>
      </div>
    `;

    // Render SVG Donut Chart
    const pPct = total > 0 ? (principal / total) * 100 : 50;
    const iPct = 100 - pPct;

    if (chartArea) {
      chartArea.innerHTML = `
        <svg viewBox="0 0 100 100" style="width:100%; height:100%;">
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="14" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--accent-cyan)" stroke-width="14"
            stroke-dasharray="${pPct * 2.2} 220" stroke-dashoffset="0" transform="rotate(-90 50 50)" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--accent-green)" stroke-width="14"
            stroke-dasharray="${iPct * 2.2} 220" stroke-dashoffset="-${pPct * 2.2}" transform="rotate(-90 50 50)" />
        </svg>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.FinanceStudio.init();
});
