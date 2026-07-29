/**
 * Math Intelligence Studio - Geometry 3D & 2D Lab
 * Real-time canvas wireframe rendering & metric sliders for 9 shapes
 */

window.GeometryLab = {
  activeShape: 'cube',
  params: {
    radius: 5,
    length: 6,
    width: 4,
    height: 8
  },
  rotationAngle: 0,

  init() {
    window.EventBus.on('mount-module-geometry', container => {
      this.renderUI(container);
    });

    window.EventBus.on('resize-module-geometry', () => {
      this.renderShapeCanvas();
    });
  },

  renderUI(container) {
    container.innerHTML = `
      <div class="module-container">
        <!-- Shape Selector Pills -->
        <div class="shape-selector">
          <button class="shape-pill ${this.activeShape === 'circle' ? 'active' : ''}" data-shape="circle">Circle</button>
          <button class="shape-pill ${this.activeShape === 'rectangle' ? 'active' : ''}" data-shape="rectangle">Rectangle</button>
          <button class="shape-pill ${this.activeShape === 'triangle' ? 'active' : ''}" data-shape="triangle">Triangle</button>
          <button class="shape-pill ${this.activeShape === 'cube' ? 'active' : ''}" data-shape="cube">Cube</button>
          <button class="shape-pill ${this.activeShape === 'cylinder' ? 'active' : ''}" data-shape="cylinder">Cylinder</button>
          <button class="shape-pill ${this.activeShape === 'cone' ? 'active' : ''}" data-shape="cone">Cone</button>
          <button class="shape-pill ${this.activeShape === 'sphere' ? 'active' : ''}" data-shape="sphere">Sphere</button>
          <button class="shape-pill ${this.activeShape === 'pyramid' ? 'active' : ''}" data-shape="pyramid">Pyramid</button>
          <button class="shape-pill ${this.activeShape === 'prism' ? 'active' : ''}" data-shape="prism">Prism</button>
        </div>

        <div class="geometry-layout">
          <!-- Left: Canvas Projection -->
          <div class="canvas-wrapper">
            <canvas id="geometry-canvas" class="graph-canvas"></canvas>
          </div>

          <!-- Right: Sliders & Live Metrics -->
          <div style="display:flex; flex-direction:column; gap:10px;">
            <div id="geometry-sliders-area" class="slider-group"></div>

            <div class="metric-grid">
              <div class="metric-box">
                <div class="input-label">Area / Surface</div>
                <div class="metric-val" id="geom-area-val">0</div>
              </div>
              <div class="metric-box">
                <div class="input-label">Volume</div>
                <div class="metric-val" id="geom-vol-val">0</div>
              </div>
              <div class="metric-box">
                <div class="input-label">Perimeter</div>
                <div class="metric-val" id="geom-peri-val">0</div>
              </div>
              <div class="metric-box">
                <div class="input-label">Status</div>
                <div class="metric-val" style="font-size:13px; color:var(--primary-glow);">Live 60 FPS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Shape pill selectors
    container.querySelectorAll('.shape-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.shape-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeShape = btn.getAttribute('data-shape');
        this.renderSliders(container);
        this.calculateMetrics();
      });
    });

    this.canvas = container.querySelector('#geometry-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.renderSliders(container);
    this.calculateMetrics();
    this.startAnimationLoop();
  },

  renderSliders(container) {
    const area = container.querySelector('#geometry-sliders-area');
    if (!area) return;
    area.innerHTML = '';

    const sliders = [];
    if (['circle', 'sphere', 'cylinder', 'cone'].includes(this.activeShape)) {
      sliders.push({ id: 'radius', label: 'Radius (r)', val: this.params.radius, min: 1, max: 20 });
    }
    if (['rectangle', 'triangle', 'cube', 'cylinder', 'cone', 'pyramid', 'prism'].includes(this.activeShape)) {
      sliders.push({ id: 'length', label: 'Length / Base (l)', val: this.params.length, min: 1, max: 20 });
    }
    if (['rectangle', 'prism'].includes(this.activeShape)) {
      sliders.push({ id: 'width', label: 'Width (w)', val: this.params.width, min: 1, max: 20 });
    }
    if (['cylinder', 'cone', 'pyramid', 'prism', 'triangle'].includes(this.activeShape)) {
      sliders.push({ id: 'height', label: 'Height (h)', val: this.params.height, min: 1, max: 20 });
    }

    sliders.forEach(s => {
      const item = document.createElement('div');
      item.className = 'slider-item';
      item.innerHTML = `
        <div class="slider-info">
          <span>${s.label}</span>
          <span id="slider-val-${s.id}">${s.val}</span>
        </div>
        <input type="range" class="range-slider" min="${s.min}" max="${s.max}" value="${s.val}" data-param="${s.id}">
      `;
      area.appendChild(item);

      item.querySelector('input').addEventListener('input', e => {
        const param = e.target.getAttribute('data-param');
        const val = parseFloat(e.target.value);
        this.params[param] = val;
        item.querySelector(`#slider-val-${param}`).innerText = val;
        this.calculateMetrics();
      });
    });
  },

  calculateMetrics() {
    let area = 0, volume = 0, peri = 0;
    const { radius: r, length: l, width: w, height: h } = this.params;

    switch (this.activeShape) {
      case 'circle':
        area = Math.PI * r * r;
        peri = 2 * Math.PI * r;
        volume = 0;
        break;
      case 'rectangle':
        area = l * w;
        peri = 2 * (l + w);
        volume = 0;
        break;
      case 'triangle':
        area = 0.5 * l * h;
        peri = l + 2 * Math.sqrt((l / 2) ** 2 + h ** 2);
        volume = 0;
        break;
      case 'cube':
        area = 6 * (l ** 2);
        volume = l ** 3;
        peri = 12 * l;
        break;
      case 'cylinder':
        area = 2 * Math.PI * r * h + 2 * Math.PI * (r ** 2);
        volume = Math.PI * (r ** 2) * h;
        peri = 4 * Math.PI * r;
        break;
      case 'cone':
        const slant = Math.sqrt(r ** 2 + h ** 2);
        area = Math.PI * r * slant + Math.PI * (r ** 2);
        volume = (1 / 3) * Math.PI * (r ** 2) * h;
        peri = 2 * Math.PI * r;
        break;
      case 'sphere':
        area = 4 * Math.PI * (r ** 2);
        volume = (4 / 3) * Math.PI * (r ** 3);
        peri = 2 * Math.PI * r;
        break;
      case 'pyramid':
        area = l ** 2 + 2 * l * Math.sqrt((l / 2) ** 2 + h ** 2);
        volume = (1 / 3) * (l ** 2) * h;
        peri = 4 * l;
        break;
      case 'prism':
        area = 2 * (l * w + l * h + w * h);
        volume = l * w * h;
        peri = 4 * (l + w + h);
        break;
    }

    document.getElementById('geom-area-val').innerText = area.toFixed(2);
    document.getElementById('geom-vol-val').innerText = volume.toFixed(2);
    document.getElementById('geom-peri-val').innerText = peri.toFixed(2);
  },

  startAnimationLoop() {
    const animate = () => {
      this.rotationAngle += 0.015;
      this.renderShapeCanvas();
      requestAnimationFrame(animate);
    };
    animate();
  },

  renderShapeCanvas() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const parent = this.canvas.parentElement;
    if (this.canvas.width !== parent.clientWidth || this.canvas.height !== parent.clientHeight) {
      this.canvas.width = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
    }

    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#22d3ee';
    ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
    ctx.lineWidth = 2;

    // Render wireframe projection based on active shape
    const scale = 12;
    const angle = this.rotationAngle;

    if (this.activeShape === 'circle') {
      ctx.beginPath();
      ctx.arc(cx, cy, this.params.radius * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (this.activeShape === 'rectangle') {
      const rw = this.params.length * scale;
      const rh = this.params.width * scale;
      ctx.fillRect(cx - rw / 2, cy - rh / 2, rw, rh);
      ctx.strokeRect(cx - rw / 2, cy - rh / 2, rw, rh);
    } else if (this.activeShape === 'cube') {
      // Pseudo 3D Cube Projection
      const size = this.params.length * scale * 0.7;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const vertices = [
        [-size, -size, -size], [size, -size, -size], [size, size, -size], [-size, size, -size],
        [-size, -size, size], [size, -size, size], [size, size, size], [-size, size, size]
      ];

      const projected = vertices.map(v => {
        const x = v[0] * cosA - v[2] * sinA;
        const z = v[0] * sinA + v[2] * cosA;
        return [cx + x, cy + v[1]];
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];

      ctx.beginPath();
      edges.forEach(e => {
        ctx.moveTo(projected[e[0]][0], projected[e[0]][1]);
        ctx.lineTo(projected[e[1]][0], projected[e[1]][1]);
      });
      ctx.stroke();
    } else {
      // Default 3D wireframe cylinder/sphere representation
      ctx.beginPath();
      ctx.ellipse(cx, cy, this.params.radius * scale, (this.params.radius * scale) / 2, angle, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.GeometryLab.init();
});
