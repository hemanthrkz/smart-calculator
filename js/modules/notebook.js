/**
 * Math Intelligence Studio - Scientific Notebook Module
 */

window.ScientificNotebook = {
  content: '',

  init() {
    window.EventBus.on('mount-module-notebook', container => {
      this.renderUI(container);
    });
  },

  renderUI(container) {
    const savedNote = localStorage.getItem('math_studio_notebook') || '# Scientific Scratchpad\n- 25^2 + sqrt(144) = 637\n- Kinetic Energy = 1/2 * m * v^2\n';

    container.innerHTML = `
      <div class="module-container">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="card-header" style="margin:0;">SCIENTIFIC NOTES & SCRATCHPAD</span>
          <button class="studio-btn secondary" id="nb-clear-btn" style="padding:4px 8px; font-size:11px;">Clear</button>
        </div>
        <textarea class="notebook-textarea" id="notebook-text">${savedNote}</textarea>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="studio-btn" id="nb-insert-pi" style="padding:6px 12px; font-size:12px;">+ Add π</button>
          <button class="studio-btn" id="nb-insert-sqrt" style="padding:6px 12px; font-size:12px;">+ Add √</button>
          <button class="studio-btn secondary" id="nb-copy-btn" style="padding:6px 12px; font-size:12px;">📋 Copy Note</button>
        </div>
      </div>
    `;

    const textarea = container.querySelector('#notebook-text');

    textarea.addEventListener('input', () => {
      localStorage.setItem('math_studio_notebook', textarea.value);
    });

    container.querySelector('#nb-clear-btn').addEventListener('click', () => {
      textarea.value = '';
      localStorage.removeItem('math_studio_notebook');
    });

    container.querySelector('#nb-insert-pi').addEventListener('click', () => {
      textarea.value += ' π ';
    });

    container.querySelector('#nb-insert-sqrt').addEventListener('click', () => {
      textarea.value += ' √(';
    });

    container.querySelector('#nb-copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(textarea.value);
      window.showToast("Copied notebook contents!", "success");
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.ScientificNotebook.init();
});
