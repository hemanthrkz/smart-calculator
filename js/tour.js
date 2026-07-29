/**
 * Math Intelligence Studio - Interactive Onboarding Tour Engine
 */

window.TourEngine = {
  steps: [
    {
      title: "Welcome to Math Intelligence Studio 🚀",
      text: "Think Beyond Numbers! This is a futuristic mathematical workspace with floating, draggable, pinnable widgets.",
      target: ".brand-section"
    },
    {
      title: "Multiple Workspaces 📁",
      text: "Switch between different workspaces or create new ones for custom layouts.",
      target: ".nav-center"
    },
    {
      title: "Voice Intelligence 🎙️",
      text: "Click the voice button and speak naturally: 'Convert 15 miles into kilometers' or 'What is square root of 625?'.",
      target: ".voice-btn"
    },
    {
      title: "Module Dock 🧮",
      text: "Click any icon in the bottom dock to open specialized tools: AI Calculator, Grapher, Geometry 3D Lab, Finance, Health, and Unit Universe.",
      target: ".bottom-dock"
    }
  ],
  currentStep: 0,

  init() {
    document.getElementById('btn-tour-start')?.addEventListener('click', () => {
      this.start();
    });
  },

  start() {
    this.currentStep = 0;
    this.showStep(0);
  },

  showStep(index) {
    if (index >= this.steps.length) {
      this.finish();
      return;
    }
    const step = this.steps[index];
    const existing = document.getElementById('tour-popover');
    if (existing) existing.remove();

    const popover = document.createElement('div');
    popover.id = 'tour-popover';
    popover.className = 'modal-card';
    popover.style.cssText = `
      position: fixed;
      z-index: 9999;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: 420px;
      box-shadow: 0 0 50px rgba(99, 102, 241, 0.6);
      border: 2px solid var(--primary-glow);
    `;

    popover.innerHTML = `
      <div class="modal-header">
        <h4 class="modal-title" style="font-size:16px;">${step.title}</h4>
        <span style="font-size:12px; color:var(--text-muted);">${index + 1} / ${this.steps.length}</span>
      </div>
      <p style="font-size:13px; color:var(--text-main); margin-bottom:16px; line-height:1.5;">${step.text}</p>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <button class="studio-btn secondary" id="tour-skip-btn" style="padding:6px 12px; font-size:12px;">Skip</button>
        <button class="studio-btn" id="tour-next-btn" style="padding:6px 16px; font-size:12px;">${index === this.steps.length - 1 ? 'Finish 🎉' : 'Next →'}</button>
      </div>
    `;

    document.body.appendChild(popover);

    document.getElementById('tour-next-btn').addEventListener('click', () => {
      this.showStep(index + 1);
    });

    document.getElementById('tour-skip-btn').addEventListener('click', () => {
      this.finish();
    });
  },

  finish() {
    document.getElementById('tour-popover')?.remove();
    window.showToast("Tour completed! Enjoy Math Intelligence Studio.", "success");
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.TourEngine.init();
});
