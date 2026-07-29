/**
 * Math Intelligence Studio - Unit Universe Module
 * 12 Universal Conversion Categories with Live Matrix & Voice Integration
 */

window.UnitUniverse = {
  activeCategory: 'length',

  conversions: {
    length: {
      units: ['meters', 'kilometers', 'miles', 'feet', 'inches', 'centimeters'],
      toBase: { meters: 1, kilometers: 1000, miles: 1609.34, feet: 0.3048, inches: 0.0254, centimeters: 0.01 }
    },
    weight: {
      units: ['kilograms', 'grams', 'pounds', 'ounces', 'metric_tons'],
      toBase: { kilograms: 1, grams: 0.001, pounds: 0.453592, ounces: 0.0283495, metric_tons: 1000 }
    },
    area: {
      units: ['sq_meters', 'sq_kilometers', 'sq_feet', 'acres', 'hectares'],
      toBase: { sq_meters: 1, sq_kilometers: 1000000, sq_feet: 0.092903, acres: 4046.86, hectares: 10000 }
    },
    volume: {
      units: ['liters', 'milliliters', 'gallons', 'cubic_meters'],
      toBase: { liters: 1, milliliters: 0.001, gallons: 3.78541, cubic_meters: 1000 }
    },
    speed: {
      units: ['m_per_s', 'km_per_h', 'miles_per_h', 'knots'],
      toBase: { m_per_s: 1, km_per_h: 0.277778, miles_per_h: 0.44704, knots: 0.514444 }
    },
    digital_storage: {
      units: ['bytes', 'kilobytes', 'megabytes', 'gigabytes', 'terabytes'],
      toBase: { bytes: 1, kilobytes: 1024, megabytes: 1048576, gigabytes: 1073741824, terabytes: 1099511627776 }
    },
    time: {
      units: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'years'],
      toBase: { seconds: 1, minutes: 60, hours: 3600, days: 86400, weeks: 604800, years: 31536000 }
    },
    temperature: {
      units: ['celsius', 'fahrenheit', 'kelvin']
    }
  },

  init() {
    window.EventBus.on('mount-module-unit_universe', container => {
      this.renderUI(container);
    });

    window.EventBus.on('voice-convert-units', ({ val, fromUnit, toUnit }) => {
      const inpVal = document.getElementById('unit-input-val');
      const selectFrom = document.getElementById('unit-select-from');
      const selectTo = document.getElementById('unit-select-to');

      if (inpVal) inpVal.value = val;
      if (selectFrom) {
        for (let opt of selectFrom.options) {
          if (opt.value.includes(fromUnit) || fromUnit.includes(opt.value)) selectFrom.value = opt.value;
        }
      }
      if (selectTo) {
        for (let opt of selectTo.options) {
          if (opt.value.includes(toUnit) || toUnit.includes(opt.value)) selectTo.value = opt.value;
        }
      }
      this.convert();
    });
  },

  renderUI(container) {
    container.innerHTML = `
      <div class="module-container">
        <!-- Category Selector Grid -->
        <div class="unit-cat-selector">
          <button class="unit-cat-btn ${this.activeCategory === 'length' ? 'active' : ''}" data-cat="length">Length</button>
          <button class="unit-cat-btn ${this.activeCategory === 'weight' ? 'active' : ''}" data-cat="weight">Weight</button>
          <button class="unit-cat-btn ${this.activeCategory === 'area' ? 'active' : ''}" data-cat="area">Area</button>
          <button class="unit-cat-btn ${this.activeCategory === 'volume' ? 'active' : ''}" data-cat="volume">Volume</button>
          <button class="unit-cat-btn ${this.activeCategory === 'speed' ? 'active' : ''}" data-cat="speed">Speed</button>
          <button class="unit-cat-btn ${this.activeCategory === 'digital_storage' ? 'active' : ''}" data-cat="digital_storage">Storage</button>
          <button class="unit-cat-btn ${this.activeCategory === 'time' ? 'active' : ''}" data-cat="time">Time</button>
          <button class="unit-cat-btn ${this.activeCategory === 'temperature' ? 'active' : ''}" data-cat="temperature">Temp</button>
        </div>

        <!-- Conversion Row -->
        <div class="unit-conversion-row glass-card">
          <div class="input-group">
            <label class="input-label">From Value</label>
            <input type="number" id="unit-input-val" class="studio-input" value="15">
            <select id="unit-select-from" class="studio-input" style="margin-top:6px;"></select>
          </div>

          <button class="swap-btn" id="unit-swap-btn" title="Swap Units">⇄</button>

          <div class="input-group">
            <label class="input-label">Converted Result</label>
            <input type="text" id="unit-output-val" class="studio-input" readonly style="color:var(--accent-cyan); font-weight:700;">
            <select id="unit-select-to" class="studio-input" style="margin-top:6px;"></select>
          </div>
        </div>

        <div class="result-hero" style="margin-top:10px;">
          <div class="input-label">Conversion Formula</div>
          <div style="font-size:14px; color:var(--text-main); font-family:var(--font-mono);" id="unit-formula-tag">1 mile = 1.60934 kilometers</div>
        </div>
      </div>
    `;

    container.querySelectorAll('.unit-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.unit-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-cat');
        this.populateSelects(container);
        this.convert();
      });
    });

    container.querySelector('#unit-swap-btn').addEventListener('click', () => {
      const from = container.querySelector('#unit-select-from');
      const to = container.querySelector('#unit-select-to');
      const tmp = from.value;
      from.value = to.value;
      to.value = tmp;
      this.convert();
    });

    container.querySelector('#unit-input-val').addEventListener('input', () => this.convert());
    container.querySelector('#unit-select-from').addEventListener('change', () => this.convert());
    container.querySelector('#unit-select-to').addEventListener('change', () => this.convert());

    this.populateSelects(container);
    this.convert();
  },

  populateSelects(container) {
    const from = container.querySelector('#unit-select-from');
    const to = container.querySelector('#unit-select-to');
    if (!from || !to) return;

    from.innerHTML = '';
    to.innerHTML = '';

    const catData = this.conversions[this.activeCategory];
    if (!catData || !catData.units) return;

    catData.units.forEach((u, i) => {
      const opt1 = new Option(u.replace('_', ' '), u);
      const opt2 = new Option(u.replace('_', ' '), u);
      from.add(opt1);
      to.add(opt2);
    });

    if (to.options.length > 1) to.selectedIndex = 1;
  },

  convert() {
    const inpVal = parseFloat(document.getElementById('unit-input-val')?.value) || 0;
    const fromUnit = document.getElementById('unit-select-from')?.value;
    const toUnit = document.getElementById('unit-select-to')?.value;
    const outElem = document.getElementById('unit-output-val');
    const formulaTag = document.getElementById('unit-formula-tag');

    if (!outElem || !fromUnit || !toUnit) return;

    let result = 0;

    if (this.activeCategory === 'temperature') {
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') result = (inpVal * 9 / 5) + 32;
      else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') result = (inpVal - 32) * 5 / 9;
      else if (fromUnit === 'celsius' && toUnit === 'kelvin') result = inpVal + 273.15;
      else if (fromUnit === 'kelvin' && toUnit === 'celsius') result = inpVal - 273.15;
      else result = inpVal;
    } else {
      const cat = this.conversions[this.activeCategory];
      const baseVal = inpVal * cat.toBase[fromUnit];
      result = baseVal / cat.toBase[toUnit];
    }

    outElem.value = (Math.round(result * 100000) / 100000).toLocaleString();
    if (formulaTag) {
      formulaTag.innerText = `${inpVal} ${fromUnit.replace('_', ' ')} = ${outElem.value} ${toUnit.replace('_', ' ')}`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.UnitUniverse.init();
});
