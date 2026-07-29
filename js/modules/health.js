/**
 * Math Intelligence Studio - Health Analytics Module
 * Comprehensive health calculations: BMI, BMR, TDEE, Water, Protein & Macros
 */

window.HealthAnalytics = {
  init() {
    window.EventBus.on('mount-module-health', container => {
      this.renderUI(container);
    });
  },

  renderUI(container) {
    container.innerHTML = `
      <div class="module-container">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; height:100%;">
          <!-- Form Inputs -->
          <div class="glass-card" style="display:flex; flex-direction:column; gap:8px;">
            <div class="card-header">BIOMETRIC INPUTS</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="input-group">
                <label class="input-label">Age (Years)</label>
                <input type="number" id="h-age" class="studio-input" value="25">
              </div>
              <div class="input-group">
                <label class="input-label">Gender</label>
                <select id="h-gender" class="studio-input">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="input-group">
                <label class="input-label">Weight (kg)</label>
                <input type="number" id="h-weight" class="studio-input" value="70">
              </div>
              <div class="input-group">
                <label class="input-label">Height (cm)</label>
                <input type="number" id="h-height" class="studio-input" value="175">
              </div>
            </div>
            <div class="input-group">
              <label class="input-label">Activity Level</label>
              <select id="h-activity" class="studio-input">
                <option value="1.2">Sedentary (Little/no exercise)</option>
                <option value="1.375" selected>Lightly Active (1-3 days/wk)</option>
                <option value="1.55">Moderately Active (3-5 days/wk)</option>
                <option value="1.725">Very Active (6-7 days/wk)</option>
              </select>
            </div>
          </div>

          <!-- Calculated Metrics -->
          <div class="glass-card" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div class="card-header">HEALTH INTELLIGENCE METRICS</div>

            <div class="metric-grid">
              <div class="metric-box">
                <div class="input-label">BMI Score</div>
                <div class="metric-val" id="h-res-bmi">22.9</div>
                <div style="font-size:10px; color:var(--accent-green);" id="h-res-bmi-cat">Normal Weight</div>
              </div>
              <div class="metric-box">
                <div class="input-label">BMR (kcal)</div>
                <div class="metric-val" id="h-res-bmr">1,680</div>
              </div>
              <div class="metric-box">
                <div class="input-label">Daily Calories</div>
                <div class="metric-val" id="h-res-tdee">2,310</div>
              </div>
              <div class="metric-box">
                <div class="input-label">Water Intake</div>
                <div class="metric-val" id="h-res-water">2.45 L</div>
              </div>
              <div class="metric-box">
                <div class="input-label">Protein Target</div>
                <div class="metric-val" id="h-res-protein">140 g</div>
              </div>
              <div class="metric-box">
                <div class="input-label">Ideal Weight</div>
                <div class="metric-val" id="h-res-ideal">70.5 kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const compute = () => {
      const age = parseFloat(container.querySelector('#h-age').value) || 25;
      const gender = container.querySelector('#h-gender').value;
      const weight = parseFloat(container.querySelector('#h-weight').value) || 70;
      const height = parseFloat(container.querySelector('#h-height').value) || 175;
      const activity = parseFloat(container.querySelector('#h-activity').value) || 1.375;

      // 1. BMI = weight(kg) / (height(m))^2
      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);

      let bmiCategory = 'Normal';
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi < 25) bmiCategory = 'Normal Weight';
      else if (bmi < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';

      // 2. BMR (Mifflin-St Jeor)
      let bmr = 10 * weight + 6.25 * height - 5 * age;
      if (gender === 'male') bmr += 5;
      else bmr -= 161;

      // 3. TDEE
      const tdee = bmr * activity;

      // 4. Water = weight * 0.035
      const water = weight * 0.035;

      // 5. Protein = weight * 2.0
      const protein = weight * 2.0;

      // 6. Ideal Weight (Devine)
      const inchesOver5ft = Math.max(0, (height / 2.54) - 60);
      let ideal = gender === 'male' ? 50 + 2.3 * inchesOver5ft : 45.5 + 2.3 * inchesOver5ft;

      // Render Outputs
      container.querySelector('#h-res-bmi').innerText = bmi.toFixed(1);
      container.querySelector('#h-res-bmi-cat').innerText = bmiCategory;
      container.querySelector('#h-res-bmr').innerText = Math.round(bmr).toLocaleString();
      container.querySelector('#h-res-tdee').innerText = Math.round(tdee).toLocaleString();
      container.querySelector('#h-res-water').innerText = `${water.toFixed(2)} L`;
      container.querySelector('#h-res-protein').innerText = `${Math.round(protein)} g`;
      container.querySelector('#h-res-ideal').innerText = `${ideal.toFixed(1)} kg`;
    };

    container.querySelectorAll('.studio-input').forEach(inp => inp.addEventListener('input', compute));
    compute();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.HealthAnalytics.init();
});
