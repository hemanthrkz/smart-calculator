/**
 * Math Intelligence Studio - Interactive Graph Studio
 * HTML5 Canvas 2D function plotter with multi-graph, pan, zoom & tracer
 */

window.GraphStudio = {
  equations: ['sin(x)', 'x^2 - 4'],
  colors: ['#22d3ee', '#f43f5e', '#a855f7', '#10b981', '#fbbf24'],
  scale: 40, // pixels per unit
  offsetX: 0,
  offsetY: 0,

  init() {
    window.EventBus.on('mount-module-grapher', container => {
      this.renderUI(container);
    });

    window.EventBus.on('voice-plot-equation', eq => {
      if (!this.equations.includes(eq)) {
        this.equations.push(eq);
        this.renderGraph();
      }
    });

    window.EventBus.on('resize-module-grapher', () => {
      this.resizeCanvas();
    });
  },

  renderUI(container) {
    container.innerHTML = `
      <div class="module-container">
        <div class="graph-toolbar">
          <input type="text" id="graph-eq-input" class="studio-input" placeholder="e.g. sin(x), cos(x), x^2, log(x)" style="flex:1;">
          <button class="studio-btn" id="graph-add-btn">+ Plot</button>
          <button class="studio-btn secondary" id="graph-reset-btn">Reset View</button>
        </div>

        <div class="canvas-wrapper" id="graph-canvas-container">
          <div class="graph-info-tag" id="graph-hover-tag">x: 0.0, y: 0.0</div>
          <canvas id="main-graph-canvas" class="graph-canvas"></canvas>
          <div class="graph-controls-overlay">
            <button class="w-control-btn" id="graph-zoom-in" title="Zoom In">+</button>
            <button class="w-control-btn" id="graph-zoom-out" title="Zoom Out">−</button>
          </div>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#main-graph-canvas');
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.resizeCanvas();

    // Event listeners
    container.querySelector('#graph-add-btn').addEventListener('click', () => {
      const input = container.querySelector('#graph-eq-input');
      if (input.value.trim()) {
        this.equations.push(input.value.trim());
        input.value = '';
        this.renderGraph();
      }
    });

    container.querySelector('#graph-reset-btn').addEventListener('click', () => {
      this.scale = 40;
      this.offsetX = 0;
      this.offsetY = 0;
      this.renderGraph();
    });

    container.querySelector('#graph-zoom-in').addEventListener('click', () => {
      this.scale *= 1.25;
      this.renderGraph();
    });

    container.querySelector('#graph-zoom-out').addEventListener('click', () => {
      this.scale /= 1.25;
      this.renderGraph();
    });

    // Pan & Drag setup
    let isDragging = false;
    let startX, startY;

    canvas.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
    });

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Coordinate tracking
      const centerX = canvas.width / 2 + this.offsetX;
      const centerY = canvas.height / 2 + this.offsetY;
      const mathX = ((mouseX - centerX) / this.scale).toFixed(2);
      const mathY = (-(mouseY - centerY) / this.scale).toFixed(2);

      const tag = container.querySelector('#graph-hover-tag');
      if (tag) tag.innerText = `x: ${mathX}, y: ${mathY}`;

      if (isDragging) {
        this.offsetX += e.clientX - startX;
        this.offsetY += e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        this.renderGraph();
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      if (e.deltaY < 0) this.scale *= 1.1;
      else this.scale /= 1.1;
      this.renderGraph();
    });

    this.renderGraph();
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
    this.renderGraph();
  },

  evalMathFunction(expr, x) {
    try {
      let sanitized = expr
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/x\^2/g, 'Math.pow(x, 2)')
        .replace(/x\^([\d\.]+)/g, 'Math.pow(x, $1)');

      return Function('x', `return ${sanitized};`)(x);
    } catch (e) {
      return NaN;
    }
  },

  renderGraph() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const centerX = w / 2 + this.offsetX;
    const centerY = h / 2 + this.offsetY;

    // Clear background
    ctx.fillStyle = '#04060d';
    ctx.fillRect(0, 0, w, h);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    const step = this.scale;
    const startGridX = centerX % step;
    for (let x = startGridX; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const startGridY = centerY % step;
    for (let y = startGridY; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Main Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, h);
    ctx.stroke();

    // Render Each Function Curve
    this.equations.forEach((eq, index) => {
      const color = this.colors[index % this.colors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let started = false;
      for (let px = 0; px < w; px += 2) {
        const mathX = (px - centerX) / this.scale;
        const mathY = this.evalMathFunction(eq, mathX);

        if (!isNaN(mathY) && isFinite(mathY)) {
          const py = centerY - mathY * this.scale;
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.GraphStudio.init();
});
