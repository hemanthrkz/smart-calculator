/**
 * Math Intelligence Studio - Theme Manager & Customizer Engine
 */

window.ThemeEngine = {
  presets: {
    cyberpunk: {
      '--bg-dark': '#070913',
      '--primary': '#6366f1',
      '--primary-glow': '#818cf8',
      '--secondary': '#06b6d4',
      '--accent': '#f43f5e',
      '--accent-cyan': '#22d3ee'
    },
    apple: {
      '--bg-dark': '#0f1117',
      '--primary': '#3b82f6',
      '--primary-glow': '#60a5fa',
      '--secondary': '#64748b',
      '--accent': '#ef4444',
      '--accent-cyan': '#38bdf8'
    },
    hyperion: {
      '--bg-dark': '#120f06',
      '--primary': '#f59e0b',
      '--primary-glow': '#fbbf24',
      '--secondary': '#d97706',
      '--accent': '#ec4899',
      '--accent-cyan': '#fde047'
    },
    deepspace: {
      '--bg-dark': '#030712',
      '--primary': '#1d4ed8',
      '--primary-glow': '#3b82f6',
      '--secondary': '#0284c7',
      '--accent': '#8b5cf6',
      '--accent-cyan': '#06b6d4'
    },
    matrix: {
      '--bg-dark': '#021008',
      '--primary': '#10b981',
      '--primary-glow': '#34d399',
      '--secondary': '#059669',
      '--accent': '#84cc16',
      '--accent-cyan': '#22c55e'
    }
  },

  init() {
    document.getElementById('btn-theme-modal')?.addEventListener('click', () => {
      document.getElementById('modal-theme')?.classList.add('active');
    });

    document.querySelectorAll('.theme-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const themeKey = btn.getAttribute('data-theme');
        this.applyPreset(themeKey);
      });
    });

    const picker = document.getElementById('theme-color-picker');
    picker?.addEventListener('input', e => {
      this.applyCustomColor(e.target.value);
    });
  },

  applyPreset(key) {
    const preset = this.presets[key];
    if (!preset) return;
    Object.keys(preset).forEach(varName => {
      document.documentElement.style.setProperty(varName, preset[varName]);
    });
    window.showToast(`Applied ${key.toUpperCase()} Theme`, 'success');
  },

  applyCustomColor(colorHex) {
    document.documentElement.style.setProperty('--primary', colorHex);
    document.documentElement.style.setProperty('--primary-glow', colorHex);
    document.documentElement.style.setProperty('--border-glow', colorHex);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.ThemeEngine.init();
});
