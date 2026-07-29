/**
 * Math Intelligence Studio - Export & Screenshot Engine
 */

window.ExportEngine = {
  init() {
    document.getElementById('export-screenshot-btn')?.addEventListener('click', () => {
      this.captureScreenshot();
    });

    document.getElementById('export-csv-btn')?.addEventListener('click', () => {
      this.exportCSV();
    });

    document.getElementById('export-json-btn')?.addEventListener('click', () => {
      this.exportJSON();
    });
  },

  captureScreenshot() {
    window.showToast("Generating workspace snapshot...", "info");

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Draw dark background
    ctx.fillStyle = '#070913';
    ctx.fillRect(0, 0, width, height);

    // Draw header title
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 24px Outfit, sans-serif';
    ctx.fillText('MATH INTELLIGENCE STUDIO - WORKSPACE SNAPSHOT', 40, 50);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Generated on ${new Date().toLocaleString()}`, 40, 75);

    // Draw active widgets preview frames
    const widgets = document.querySelectorAll('.widget-window:not(.minimized)');
    widgets.forEach(w => {
      const rect = w.getBoundingClientRect();
      ctx.fillStyle = 'rgba(18, 24, 43, 0.9)';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.roundRect(rect.left, rect.top, rect.width, rect.height, 12);
      ctx.fill();
      ctx.stroke();

      const title = w.querySelector('.widget-title')?.innerText || 'Widget';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(title, rect.left + 16, rect.top + 28);
    });

    // Trigger Download
    const link = document.createElement('a');
    link.download = `Math_Studio_Workspace_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    window.showToast("Workspace screenshot saved!", "success");
    document.getElementById('modal-export')?.classList.remove('active');
  },

  exportCSV() {
    const items = window.HistoryTimeline ? window.HistoryTimeline.items : [];
    if (!items.length) {
      window.showToast("No history items to export.", "warning");
      return;
    }

    let csv = "ID,Timestamp,Expression,Result,Favorited\n";
    items.forEach(item => {
      csv += `"${item.id}","${item.timestamp}","${item.expr}","${item.ans}","${item.favorited}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Math_Studio_History_${Date.now()}.csv`;
    link.click();
    window.showToast("Exported history CSV file!", "success");
    document.getElementById('modal-export')?.classList.remove('active');
  },

  exportJSON() {
    const data = {
      workspaces: window.WorkspaceManager ? window.WorkspaceManager.workspaces : [],
      history: window.HistoryTimeline ? window.HistoryTimeline.items : [],
      notebook: localStorage.getItem('math_studio_notebook') || '',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Math_Studio_Backup_${Date.now()}.json`;
    link.click();
    window.showToast("Backup JSON exported!", "success");
    document.getElementById('modal-export')?.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.ExportEngine.init();
});
