/**
 * Math Intelligence Studio - Smart Timeline History Module
 * Timeline cards with Search, Favorite, Copy, Rename & Delete
 */

window.HistoryTimeline = {
  items: [
    { id: 1, expr: '25^2 + sqrt(144)', ans: '637', timestamp: '10:42 AM', favorited: true },
    { id: 2, expr: 'sin(Math.PI / 2)', ans: '1', timestamp: '10:38 AM', favorited: false }
  ],

  init() {
    window.EventBus.on('mount-module-history', container => {
      this.renderUI(container);
    });

    window.EventBus.on('add-history-item', item => {
      this.items.unshift({
        id: Date.now(),
        expr: item.expr,
        ans: item.ans,
        timestamp: item.timestamp,
        favorited: false
      });
      this.renderList();
    });
  },

  renderUI(container) {
    container.innerHTML = `
      <div class="module-container">
        <div class="formula-search-bar" style="display:flex; gap:8px;">
          <input type="text" id="history-search-input" class="studio-input" placeholder="🔍 Search timeline calculations...">
          <button class="studio-btn secondary" id="history-clear-all" style="white-space:nowrap;">Clear All</button>
        </div>

        <div class="timeline-list" id="history-timeline-area"></div>
      </div>
    `;

    container.querySelector('#history-search-input').addEventListener('input', e => {
      this.renderList(e.target.value.toLowerCase());
    });

    container.querySelector('#history-clear-all').addEventListener('click', () => {
      this.items = [];
      this.renderList();
      window.showToast("Timeline history cleared.", "info");
    });

    this.renderList();
  },

  renderList(query = '') {
    const area = document.getElementById('history-timeline-area');
    if (!area) return;
    area.innerHTML = '';

    const filtered = this.items.filter(item =>
      item.expr.toLowerCase().includes(query) ||
      item.ans.toString().includes(query)
    );

    if (filtered.length === 0) {
      area.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:13px; margin-top:20px;">No calculations found.</div>`;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'timeline-card';
      card.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:4px;">
          <span class="timeline-time">${item.timestamp}</span>
          <span class="timeline-expr">${item.expr}</span>
          <span class="timeline-ans">= ${item.ans}</span>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="w-control-btn hist-fav-btn ${item.favorited ? 'active' : ''}" title="Favorite">★</button>
          <button class="w-control-btn hist-copy-btn" title="Copy Result">📋</button>
          <button class="w-control-btn hist-del-btn" title="Delete">&times;</button>
        </div>
      `;

      card.querySelector('.hist-fav-btn').addEventListener('click', () => {
        item.favorited = !item.favorited;
        this.renderList(query);
      });

      card.querySelector('.hist-copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(`${item.expr} = ${item.ans}`);
        window.showToast("Copied to clipboard!", "success");
      });

      card.querySelector('.hist-del-btn').addEventListener('click', () => {
        this.items = this.items.filter(i => i.id !== item.id);
        this.renderList(query);
      });

      area.appendChild(card);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.HistoryTimeline.init();
});
