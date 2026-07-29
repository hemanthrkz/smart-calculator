/**
 * Math Intelligence Studio - Equation Solver Module
 * Step-by-step algebra solver for Linear, Quadratic & 2x2 Systems
 */

window.EquationSolver = {
  activeTab: 'quadratic',

  init() {
    window.EventBus.on('mount-module-equation_solver', container => {
      this.renderUI(container);
    });
  },

  renderUI(container) {
    container.innerHTML = `
      <div class="module-container">
        <div class="tabs-header">
          <div class="sub-tab ${this.activeTab === 'quadratic' ? 'active' : ''}" data-tab="quadratic">Quadratic (ax² + bx + c = 0)</div>
          <div class="sub-tab ${this.activeTab === 'linear' ? 'active' : ''}" data-tab="linear">Linear (ax + b = c)</div>
          <div class="sub-tab ${this.activeTab === 'system' ? 'active' : ''}" data-tab="system">2x2 System</div>
        </div>

        <div id="eq-solver-form-area"></div>

        <div class="calc-steps-container" id="eq-steps-output" style="flex:1;"></div>
      </div>
    `;

    container.querySelectorAll('.sub-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.getAttribute('data-tab');
        this.renderForm(container);
      });
    });

    this.renderForm(container);
  },

  renderForm(container) {
    const formArea = container.querySelector('#eq-solver-form-area');
    if (!formArea) return;

    if (this.activeTab === 'quadratic') {
      formArea.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:10px;">
          <div class="input-group">
            <label class="input-label">a (x²)</label>
            <input type="number" id="eq-a" class="studio-input" value="1">
          </div>
          <div class="input-group">
            <label class="input-label">b (x)</label>
            <input type="number" id="eq-b" class="studio-input" value="-5">
          </div>
          <div class="input-group">
            <label class="input-label">c (const)</label>
            <input type="number" id="eq-c" class="studio-input" value="6">
          </div>
        </div>
        <button class="studio-btn" id="solve-quad-btn" style="width:100%;">Solve Quadratic Equation</button>
      `;

      formArea.querySelector('#solve-quad-btn').addEventListener('click', () => {
        const a = parseFloat(container.querySelector('#eq-a').value) || 0;
        const b = parseFloat(container.querySelector('#eq-b').value) || 0;
        const c = parseFloat(container.querySelector('#eq-c').value) || 0;
        this.solveQuadratic(a, b, c);
      });

      this.solveQuadratic(1, -5, 6);

    } else if (this.activeTab === 'linear') {
      formArea.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:10px;">
          <div class="input-group">
            <label class="input-label">a (coeff)</label>
            <input type="number" id="lin-a" class="studio-input" value="3">
          </div>
          <div class="input-group">
            <label class="input-label">b (const)</label>
            <input type="number" id="lin-b" class="studio-input" value="9">
          </div>
          <div class="input-group">
            <label class="input-label">c (rhs)</label>
            <input type="number" id="lin-c" class="studio-input" value="24">
          </div>
        </div>
        <button class="studio-btn" id="solve-lin-btn" style="width:100%;">Solve Linear Equation</button>
      `;

      formArea.querySelector('#solve-lin-btn').addEventListener('click', () => {
        const a = parseFloat(container.querySelector('#lin-a').value) || 0;
        const b = parseFloat(container.querySelector('#lin-b').value) || 0;
        const c = parseFloat(container.querySelector('#lin-c').value) || 0;
        this.solveLinear(a, b, c);
      });

      this.solveLinear(3, 9, 24);

    } else {
      formArea.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;">
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
            <input type="number" id="sys-a1" class="studio-input" placeholder="a1" value="2">
            <input type="number" id="sys-b1" class="studio-input" placeholder="b1" value="3">
            <input type="number" id="sys-c1" class="studio-input" placeholder="c1" value="13">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
            <input type="number" id="sys-a2" class="studio-input" placeholder="a2" value="1">
            <input type="number" id="sys-b2" class="studio-input" placeholder="b2" value="-1">
            <input type="number" id="sys-c2" class="studio-input" placeholder="c2" value="4">
          </div>
        </div>
        <button class="studio-btn" id="solve-sys-btn" style="width:100%;">Solve 2x2 Linear System</button>
      `;

      formArea.querySelector('#solve-sys-btn').addEventListener('click', () => {
        const a1 = parseFloat(container.querySelector('#sys-a1').value) || 0;
        const b1 = parseFloat(container.querySelector('#sys-b1').value) || 0;
        const c1 = parseFloat(container.querySelector('#sys-c1').value) || 0;
        const a2 = parseFloat(container.querySelector('#sys-a2').value) || 0;
        const b2 = parseFloat(container.querySelector('#sys-b2').value) || 0;
        const c2 = parseFloat(container.querySelector('#sys-c2').value) || 0;
        this.solveSystem(a1, b1, c1, a2, b2, c2);
      });

      this.solveSystem(2, 3, 13, 1, -1, 4);
    }
  },

  solveQuadratic(a, b, c) {
    const steps = [];
    steps.push({ label: 'Given Equation', val: `${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0` });

    if (a === 0) {
      steps.push({ label: 'Degenerate Case', val: 'a = 0 implies linear equation' });
      this.renderSteps(steps);
      return;
    }

    const disc = b * b - 4 * a * c;
    steps.push({ label: 'Discriminant (Δ = b² - 4ac)', val: `Δ = (${b})² - 4(${a})(${c}) = ${disc}` });

    if (disc > 0) {
      const x1 = (-b + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b - Math.sqrt(disc)) / (2 * a);
      steps.push({ label: 'Two Real Roots Formula', val: 'x = (-b ± √Δ) / 2a' });
      steps.push({ label: 'Root 1 (x₁)', val: x1.toFixed(4) });
      steps.push({ label: 'Root 2 (x₂)', val: x2.toFixed(4) });
    } else if (disc === 0) {
      const x = -b / (2 * a);
      steps.push({ label: 'One Repeated Root', val: `x = ${x.toFixed(4)}` });
    } else {
      const real = (-b / (2 * a)).toFixed(4);
      const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
      steps.push({ label: 'Complex Roots', val: `x = ${real} ± ${imag}i` });
    }

    this.renderSteps(steps);
  },

  solveLinear(a, b, c) {
    const steps = [];
    steps.push({ label: 'Given Equation', val: `${a}x + ${b} = ${c}` });
    steps.push({ label: 'Step 1: Subtract Constant', val: `${a}x = ${c} - ${b} = ${c - b}` });

    if (a === 0) {
      steps.push({ label: 'Error', val: 'Coefficient a cannot be zero.' });
    } else {
      const x = (c - b) / a;
      steps.push({ label: 'Step 2: Divide by a', val: `x = ${c - b} / ${a} = ${x}` });
      steps.push({ label: 'Final Solution', val: `x = ${x}` });
    }

    this.renderSteps(steps);
  },

  solveSystem(a1, b1, c1, a2, b2, c2) {
    const steps = [];
    steps.push({ label: 'System', val: `[1] ${a1}x + ${b1}y = ${c1}  |  [2] ${a2}x + ${b2}y = ${c2}` });

    const det = a1 * b2 - a2 * b1;
    steps.push({ label: 'Determinant D', val: `D = (${a1}·${b2}) - (${a2}·${b1}) = ${det}` });

    if (det === 0) {
      steps.push({ label: 'Result', val: 'No unique solution (parallel or identical lines).' });
    } else {
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      steps.push({ label: "Cramer's Rule x", val: `x = Dx / D = ${x}` });
      steps.push({ label: "Cramer's Rule y", val: `y = Dy / D = ${y}` });
      steps.push({ label: 'Verified Solution', val: `x = ${x}, y = ${y}` });
    }

    this.renderSteps(steps);
  },

  renderSteps(steps) {
    const area = document.getElementById('eq-steps-output');
    if (!area) return;
    area.innerHTML = '';
    steps.forEach(st => {
      const card = document.createElement('div');
      card.className = 'step-card';
      card.innerHTML = `
        <span class="step-label">${st.label}</span>
        <span class="step-val" style="color:var(--accent-cyan); font-size:14px;">${st.val}</span>
      `;
      area.appendChild(card);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.EquationSolver.init();
});
