/**
 * Math Intelligence Studio - Formula Explorer Engine
 * Searchable library across Math, Physics, Engineering, Stats & Finance with live calculators
 */

window.FormulaExplorer = {
  library: [
    {
      id: 'pythagoras',
      name: 'Pythagorean Theorem',
      category: 'Math',
      equation: 'a² + b² = c²',
      explanation: 'Relates the lengths of the legs of a right triangle to its hypotenuse.',
      vars: [
        { key: 'a', name: 'Leg a', default: 3 },
        { key: 'b', name: 'Leg b', default: 4 }
      ],
      calc: v => Math.sqrt(v.a * v.a + v.b * v.b),
      resultName: 'Hypotenuse (c)'
    },
    {
      id: 'einstein_energy',
      name: 'Mass-Energy Equivalence',
      category: 'Physics',
      equation: 'E = m · c²',
      explanation: 'Calculates relativistic energy from mass where c = 3 × 10⁸ m/s.',
      vars: [
        { key: 'm', name: 'Mass (kg)', default: 1 }
      ],
      calc: v => v.m * (299792458 ** 2),
      resultName: 'Energy (Joules)'
    },
    {
      id: 'ohmlaw',
      name: "Ohm's Law",
      category: 'Engineering',
      equation: 'V = I · R',
      explanation: 'Calculates electrical voltage from current (Amperes) and resistance (Ohms).',
      vars: [
        { key: 'i', name: 'Current (I)', default: 2 },
        { key: 'r', name: 'Resistance (R)', default: 10 }
      ],
      calc: v => v.i * v.r,
      resultName: 'Voltage (V)'
    },
    {
      id: 'kinetic_energy',
      name: 'Kinetic Energy',
      category: 'Physics',
      equation: 'KE = ½ · m · v²',
      explanation: 'Energy possessed by an object due to its motion.',
      vars: [
        { key: 'm', name: 'Mass (kg)', default: 10 },
        { key: 'v', name: 'Velocity (m/s)', default: 5 }
      ],
      calc: v => 0.5 * v.m * (v.v ** 2),
      resultName: 'Kinetic Energy (J)'
    },
    {
      id: 'compound_growth',
      name: 'Compound Growth',
      category: 'Finance',
      equation: 'A = P (1 + r/n)^(nt)',
      explanation: 'Accumulated amount from principal P over time t with compounding frequency n.',
      vars: [
        { key: 'p', name: 'Principal ($)', default: 1000 },
        { key: 'r', name: 'Rate (%)', default: 7 },
        { key: 't', name: 'Years', default: 5 }
      ],
      calc: v => v.p * ((1 + v.r / 100) ** v.t),
      resultName: 'Final Amount ($)'
    },
    {
      id: 'zscore',
      name: 'Z-Score (Statistics)',
      category: 'Statistics',
      equation: 'Z = (X - μ) / σ',
      explanation: 'Measures how many standard deviations a raw score is from the population mean.',
      vars: [
        { key: 'x', name: 'Value (X)', default: 85 },
        { key: 'mu', name: 'Mean (μ)', default: 70 },
        { key: 'sigma', name: 'Std Dev (σ)', default: 10 }
      ],
      calc: v => (v.x - v.mu) / v.sigma,
      resultName: 'Z-Score'
    }
  ],
  selectedFormula: null,

  init() {
    window.EventBus.on('mount-module-formulas', container => {
      this.selectedFormula = this.library[0];
      this.renderUI(container);
    });
  },

  renderUI(container) {
    container.innerHTML = `
      <div class="module-container">
        <div class="formula-search-bar">
          <input type="text" id="formula-search-input" class="studio-input" placeholder="🔍 Search Math, Physics, Finance, Stats formulas...">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; height:100%;">
          <!-- Left: Library Grid -->
          <div class="formula-grid" id="formula-list-container"></div>

          <!-- Right: Interactive Formula Calculator -->
          <div class="glass-card" id="formula-detail-area"></div>
        </div>
      </div>
    `;

    const listArea = container.querySelector('#formula-list-container');
    const searchInput = container.querySelector('#formula-search-input');

    searchInput.addEventListener('input', e => {
      this.renderList(listArea, e.target.value.toLowerCase());
    });

    this.renderList(listArea, '');
    this.renderDetail(container.querySelector('#formula-detail-area'));
  },

  renderList(container, query) {
    container.innerHTML = '';
    const filtered = this.library.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.category.toLowerCase().includes(query) ||
      f.equation.toLowerCase().includes(query)
    );

    filtered.forEach(f => {
      const card = document.createElement('div');
      card.className = 'formula-card';
      card.innerHTML = `
        <div class="formula-cat">${f.category}</div>
        <div class="formula-name">${f.name}</div>
        <div class="formula-eq">${f.equation}</div>
      `;
      card.addEventListener('click', () => {
        this.selectedFormula = f;
        this.renderDetail(document.getElementById('formula-detail-area'));
      });
      container.appendChild(card);
    });
  },

  renderDetail(container) {
    if (!container || !this.selectedFormula) return;
    const f = this.selectedFormula;

    let inputsHTML = '';
    f.vars.forEach(v => {
      inputsHTML += `
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">${v.name}</label>
          <input type="number" class="studio-input f-input" data-var="${v.key}" value="${v.default}">
        </div>
      `;
    });

    container.innerHTML = `
      <div class="card-header">
        <span>${f.category.toUpperCase()} FORMULA</span>
        <span style="color:var(--accent-gold); font-family:var(--font-mono);">${f.equation}</span>
      </div>
      <h4 style="color:#fff; font-size:16px; margin-bottom:6px;">${f.name}</h4>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px; line-height:1.4;">${f.explanation}</p>

      <div style="display:flex; flex-direction:column; gap:6px;">
        ${inputsHTML}
      </div>

      <div class="result-hero" style="margin-top:14px;">
        <div class="input-label">${f.resultName}</div>
        <div class="hero-num" id="f-calc-output">0</div>
      </div>
    `;

    const compute = () => {
      const vals = {};
      container.querySelectorAll('.f-input').forEach(inp => {
        const k = inp.getAttribute('data-var');
        vals[k] = parseFloat(inp.value) || 0;
      });
      const res = f.calc(vals);
      container.querySelector('#f-calc-output').innerText = (Math.round(res * 1000) / 1000).toLocaleString();
    };

    container.querySelectorAll('.f-input').forEach(inp => {
      inp.addEventListener('input', compute);
    });

    compute();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.FormulaExplorer.init();
});
