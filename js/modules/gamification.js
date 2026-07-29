/**
 * Math Intelligence Studio - Gamification & Stats Dashboard
 * Daily Challenge, Streaks, Speed Benchmark, Badges & Mathematical Quotes
 */

window.GamificationStudio = {
  stats: {
    calculationsCount: 14,
    streakDays: 5,
    speedBpm: 42,
    badgesUnlocked: ['first_calc', 'speed_demon']
  },

  badges: [
    { id: 'first_calc', name: 'Math Explorer', icon: '🐣', desc: 'Solved your 1st calculation' },
    { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', desc: 'Achieved 30+ OPS/min speed' },
    { id: 'geometry_master', name: 'Geometry Architect', icon: '📐', desc: 'Explored 3D shape lab' },
    { id: 'financial_wizard', name: 'Financial Wizard', icon: '💎', desc: 'Calculated SIP or EMI' },
    { id: 'voice_commander', name: 'Voice Commander', icon: '🎙️', desc: 'Used voice intelligence' }
  ],

  init() {
    window.EventBus.on('mount-module-gamification', container => {
      this.renderUI(container);
    });

    window.EventBus.on('calculation-performed', () => {
      this.stats.calculationsCount++;
      if (!this.stats.badgesUnlocked.includes('first_calc')) {
        this.stats.badgesUnlocked.push('first_calc');
        window.showToast("🏆 Unlocked Badge: Math Explorer!", "success");
      }
    });
  },

  renderUI(container) {
    container.innerHTML = `
      <div class="module-container">
        <!-- Daily Challenge Card -->
        <div class="glass-card" style="border-color:rgba(251, 191, 36, 0.3);">
          <div class="card-header">
            <span style="color:var(--accent-gold);">⚡ DAILY MATHEMATICAL CHALLENGE</span>
            <span style="color:var(--accent-cyan); font-weight:700;">🔥 ${this.stats.streakDays} Day Streak</span>
          </div>
          <div style="font-size:14px; font-weight:600; margin-bottom:8px;">Solve: If 2x + 8 = 24, what is x² - 10?</div>
          <div style="display:flex; gap:8px;">
            <input type="number" id="daily-puzzle-inp" class="studio-input" placeholder="Enter answer..." style="width:140px;">
            <button class="studio-btn" id="daily-puzzle-btn">Submit Answer</button>
          </div>
        </div>

        <!-- Personal Stats & Benchmark -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="metric-box">
            <div class="input-label">Total Calculations</div>
            <div class="metric-val" id="stat-calc-count">${this.stats.calculationsCount}</div>
          </div>
          <div class="metric-box">
            <div class="input-label">Speed Benchmark</div>
            <div class="metric-val" style="color:var(--accent-purple);">${this.stats.speedBpm} OPS/m</div>
          </div>
        </div>

        <!-- Achievement Badges -->
        <div>
          <div class="card-header">ACHIEVEMENT BADGES</div>
          <div class="badge-grid" id="badges-grid-area"></div>
        </div>

        <!-- Quote of the Day -->
        <div class="quote-box">
          "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding."
          <div class="quote-author">— William Paul Thurston</div>
        </div>
      </div>
    `;

    container.querySelector('#daily-puzzle-btn').addEventListener('click', () => {
      const val = container.querySelector('#daily-puzzle-inp').value;
      if (val === '54') {
        window.showToast("🎉 Correct Answer! Streak +1", "success");
        window.AudioSynth.playSuccess();
        this.stats.streakDays++;
      } else {
        window.showToast("Incorrect answer. Hint: 2x = 16 => x = 8 => 64 - 10 = 54", "error");
      }
    });

    this.renderBadges(container.querySelector('#badges-grid-area'));
  },

  renderBadges(container) {
    if (!container) return;
    container.innerHTML = '';

    this.badges.forEach(b => {
      const isUnlocked = this.stats.badgesUnlocked.includes(b.id);
      const card = document.createElement('div');
      card.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <span class="badge-icon">${b.icon}</span>
        <span class="badge-name">${b.name}</span>
        <span style="font-size:9px; color:var(--text-muted);">${b.desc}</span>
      `;
      container.appendChild(card);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.GamificationStudio.init();
});
