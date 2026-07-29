/**
 * Math Intelligence Studio - Windowed Workspace Engine
 * Manages draggable, resizable, pinnable, hideable floating widgets, tabs & state persistence
 */

window.WorkspaceManager = {
  activeWsIndex: 0,
  workspaces: [
    { name: 'Main Workspace', widgets: {} },
    { name: 'Analytics & Finance', widgets: {} },
    { name: 'Geometry & Graph Lab', widgets: {} }
  ],
  highestZIndex: 100,

  init() {
    this.viewport = document.getElementById('workspace-viewport');
    this.loadState();
    this.bindEvents();
    this.renderCurrentWorkspace();
  },

  bindEvents() {
    // Dock click launchers
    document.querySelectorAll('.dock-item').forEach(item => {
      item.addEventListener('click', () => {
        const moduleKey = item.getAttribute('data-module');
        this.openWidget(moduleKey);
      });
    });

    // Workspace tabs switching
    document.querySelectorAll('.workspace-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const idx = parseInt(tab.getAttribute('data-ws'));
        this.switchWorkspace(idx);
      });
    });

    document.getElementById('btn-add-ws')?.addEventListener('click', () => {
      const name = prompt('Enter new Workspace Name:', `Workspace ${this.workspaces.length + 1}`);
      if (name) {
        this.workspaces.push({ name, widgets: {} });
        window.showToast(`Workspace '${name}' created!`, 'success');
        this.renderTabs();
        this.switchWorkspace(this.workspaces.length - 1);
      }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', e => {
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        this.openWidget('calculator');
      } else if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        this.openWidget('grapher');
      } else if (e.altKey && e.key === '1') {
        this.switchWorkspace(0);
      } else if (e.altKey && e.key === '2') {
        this.switchWorkspace(1);
      } else if (e.altKey && e.key === '3') {
        this.switchWorkspace(2);
      }
    });
  },

  switchWorkspace(index) {
    if (index < 0 || index >= this.workspaces.length) return;
    this.saveState();
    this.activeWsIndex = index;
    
    document.querySelectorAll('.workspace-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });

    this.renderCurrentWorkspace();
  },

  renderTabs() {
    const container = document.querySelector('.nav-center');
    if (!container) return;
    container.innerHTML = '';

    this.workspaces.forEach((ws, idx) => {
      const tab = document.createElement('div');
      tab.className = `workspace-tab ${idx === this.activeWsIndex ? 'active' : ''}`;
      tab.setAttribute('data-ws', idx);
      tab.innerHTML = `<span>${ws.name}</span>`;
      tab.addEventListener('click', () => this.switchWorkspace(idx));
      container.appendChild(tab);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'icon-btn';
    addBtn.id = 'btn-add-ws';
    addBtn.title = 'New Workspace';
    addBtn.innerText = '+';
    addBtn.addEventListener('click', () => {
      const name = prompt('Workspace Name:', `Workspace ${this.workspaces.length + 1}`);
      if (name) {
        this.workspaces.push({ name, widgets: {} });
        this.renderTabs();
        this.switchWorkspace(this.workspaces.length - 1);
      }
    });
    container.appendChild(addBtn);
  },

  getModuleConfig(moduleKey) {
    const configs = {
      calculator: { title: 'AI Calculator', icon: '🧮', defaultW: 380, defaultH: 520, x: 40, y: 40 },
      grapher: { title: 'Interactive Graph Studio', icon: '📈', defaultW: 520, defaultH: 420, x: 450, y: 40 },
      geometry: { title: 'Geometry 3D & 2D Lab', icon: '📐', defaultW: 560, defaultH: 440, x: 40, y: 180 },
      formulas: { title: 'Formula Explorer', icon: '📚', defaultW: 460, defaultH: 400, x: 620, y: 180 },
      equation_solver: { title: 'Equation Solver', icon: '⚛️', defaultW: 440, defaultH: 420, x: 100, y: 80 },
      finance: { title: 'Finance Studio', icon: '💎', defaultW: 540, defaultH: 460, x: 550, y: 80 },
      health: { title: 'Health Analytics', icon: '🩺', defaultW: 480, defaultH: 440, x: 120, y: 120 },
      unit_universe: { title: 'Unit Universe', icon: '🌌', defaultW: 440, defaultH: 380, x: 600, y: 100 },
      notebook: { title: 'Scientific Notebook', icon: '📝', defaultW: 420, defaultH: 360, x: 200, y: 200 },
      history: { title: 'Smart Timeline History', icon: '⏱️', defaultW: 440, defaultH: 400, x: 300, y: 140 },
      gamification: { title: 'Daily Math Challenge & Badges', icon: '🏆', defaultW: 460, defaultH: 440, x: 250, y: 60 }
    };
    return configs[moduleKey] || { title: moduleKey, icon: '⚡', defaultW: 400, defaultH: 350, x: 100, y: 100 };
  },

  openWidget(moduleKey) {
    let ws = this.workspaces[this.activeWsIndex];
    if (!ws.widgets) ws.widgets = {};

    let widgetElem = document.getElementById(`widget-${moduleKey}`);
    if (widgetElem) {
      widgetElem.classList.remove('minimized');
      this.bringToFront(widgetElem);
      return;
    }

    const cfg = this.getModuleConfig(moduleKey);
    const widgetData = ws.widgets[moduleKey] || {
      x: cfg.x,
      y: cfg.y,
      w: cfg.defaultW,
      h: cfg.defaultH,
      pinned: false,
      zIndex: ++this.highestZIndex
    };

    widgetElem = document.createElement('div');
    widgetElem.className = `widget-window ${widgetData.pinned ? 'pinned' : ''}`;
    widgetElem.id = `widget-${moduleKey}`;
    widgetElem.style.left = `${widgetData.x}px`;
    widgetElem.style.top = `${widgetData.y}px`;
    widgetElem.style.width = `${widgetData.w}px`;
    widgetElem.style.height = `${widgetData.h}px`;
    widgetElem.style.zIndex = widgetData.zIndex;

    widgetElem.innerHTML = `
      <div class="widget-header">
        <div class="widget-title-area">
          <span class="widget-icon">${cfg.icon}</span>
          <span class="widget-title">${cfg.title}</span>
        </div>
        <div class="widget-controls">
          <button class="w-control-btn pin-btn ${widgetData.pinned ? 'active' : ''}" title="Pin Widget">📌</button>
          <button class="w-control-btn min-btn" title="Minimize">─</button>
          <button class="w-control-btn close-btn" title="Close">&times;</button>
        </div>
      </div>
      <div class="widget-body" id="widget-body-${moduleKey}">
        <!-- Module content rendered by module controller -->
      </div>
      <div class="resize-handle r-right"></div>
      <div class="resize-handle r-bottom"></div>
      <div class="resize-handle r-corner"></div>
    `;

    this.viewport.appendChild(widgetElem);
    this.makeDraggableAndResizable(widgetElem, moduleKey);

    // Controls handlers
    const pinBtn = widgetElem.querySelector('.pin-btn');
    pinBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isPinned = widgetElem.classList.toggle('pinned');
      pinBtn.classList.toggle('active', isPinned);
      this.saveState();
    });

    const minBtn = widgetElem.querySelector('.min-btn');
    minBtn.addEventListener('click', e => {
      e.stopPropagation();
      widgetElem.classList.add('minimized');
      this.updateDockState();
    });

    const closeBtn = widgetElem.querySelector('.close-btn');
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      widgetElem.remove();
      delete this.workspaces[this.activeWsIndex].widgets[moduleKey];
      this.saveState();
      this.updateDockState();
    });

    widgetElem.addEventListener('mousedown', () => this.bringToFront(widgetElem));

    // Emit event for module script to render UI inside #widget-body-{moduleKey}
    window.EventBus.emit(`mount-module-${moduleKey}`, document.getElementById(`widget-body-${moduleKey}`));

    this.updateDockState();
    this.saveState();
  },

  bringToFront(elem) {
    document.querySelectorAll('.widget-window').forEach(w => w.classList.remove('active-window'));
    elem.classList.add('active-window');
    if (!elem.classList.contains('pinned')) {
      elem.style.zIndex = ++this.highestZIndex;
    } else {
      elem.style.zIndex = this.highestZIndex + 500;
    }
  },

  makeDraggableAndResizable(widgetElem, moduleKey) {
    const header = widgetElem.querySelector('.widget-header');
    let isDragging = false;
    let startX, startY, initialX, initialY;

    header.addEventListener('mousedown', e => {
      if (e.target.closest('.w-control-btn')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = widgetElem.offsetLeft;
      initialY = widgetElem.offsetTop;
      this.bringToFront(widgetElem);

      const onMouseMove = e => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newX = initialX + dx;
        let newY = initialY + dy;

        // Clamping to viewport
        newX = Math.max(0, Math.min(newX, this.viewport.clientWidth - widgetElem.offsetWidth));
        newY = Math.max(0, Math.min(newY, this.viewport.clientHeight - widgetElem.offsetHeight));

        widgetElem.style.left = `${newX}px`;
        widgetElem.style.top = `${newY}px`;
      };

      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        this.saveState();
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // Resizing logic
    const handleCorner = widgetElem.querySelector('.r-corner');
    const handleRight = widgetElem.querySelector('.r-right');
    const handleBottom = widgetElem.querySelector('.r-bottom');

    const setupResize = (handle, resizeW, resizeH) => {
      handle.addEventListener('mousedown', e => {
        e.stopPropagation();
        let rStartX = e.clientX;
        let rStartY = e.clientY;
        let rStartW = widgetElem.offsetWidth;
        let rStartH = widgetElem.offsetHeight;

        const onResizeMove = e => {
          if (resizeW) {
            const w = Math.max(300, rStartW + (e.clientX - rStartX));
            widgetElem.style.width = `${w}px`;
          }
          if (resizeH) {
            const h = Math.max(200, rStartH + (e.clientY - rStartY));
            widgetElem.style.height = `${h}px`;
          }
          // Emit resize event to module (e.g. Graph Canvas update)
          window.EventBus.emit(`resize-module-${moduleKey}`, {
            width: widgetElem.offsetWidth,
            height: widgetElem.offsetHeight
          });
        };

        const onResizeUp = () => {
          document.removeEventListener('mousemove', onResizeMove);
          document.removeEventListener('mouseup', onResizeUp);
          this.saveState();
        };

        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
      });
    };

    if (handleCorner) setupResize(handleCorner, true, true);
    if (handleRight) setupResize(handleRight, true, false);
    if (handleBottom) setupResize(handleBottom, false, true);
  },

  updateDockState() {
    const activeWidgets = Array.from(document.querySelectorAll('.widget-window:not(.minimized)')).map(w => w.id.replace('widget-', ''));
    document.querySelectorAll('.dock-item').forEach(item => {
      const key = item.getAttribute('data-module');
      item.classList.toggle('active', activeWidgets.includes(key));
    });
  },

  renderCurrentWorkspace() {
    this.viewport.innerHTML = '';
    const ws = this.workspaces[this.activeWsIndex];
    if (!ws.widgets) return;

    Object.keys(ws.widgets).forEach(moduleKey => {
      this.openWidget(moduleKey);
    });
  },

  saveState() {
    const ws = this.workspaces[this.activeWsIndex];
    if (!ws) return;
    ws.widgets = {};

    document.querySelectorAll('.widget-window').forEach(w => {
      const key = w.id.replace('widget-', '');
      ws.widgets[key] = {
        x: w.offsetLeft,
        y: w.offsetTop,
        w: w.offsetWidth,
        h: w.offsetHeight,
        pinned: w.classList.contains('pinned'),
        zIndex: parseInt(w.style.zIndex || 10)
      };
    });

    try {
      localStorage.setItem('math_studio_workspaces', JSON.stringify({
        activeWsIndex: this.activeWsIndex,
        workspaces: this.workspaces
      }));
    } catch (e) {}
  },

  loadState() {
    try {
      const saved = localStorage.getItem('math_studio_workspaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.workspaces && parsed.workspaces.length) {
          this.workspaces = parsed.workspaces;
          this.activeWsIndex = parsed.activeWsIndex || 0;
        }
      }
    } catch (e) {}

    // Default open initial widgets if empty workspace
    if (Object.keys(this.workspaces[0].widgets || {}).length === 0) {
      this.workspaces[0].widgets = {
        calculator: { x: 40, y: 40, w: 380, h: 520, pinned: false, zIndex: 10 },
        grapher: { x: 450, y: 40, w: 500, h: 420, pinned: false, zIndex: 11 },
        geometry: { x: 40, y: 260, w: 520, h: 420, pinned: false, zIndex: 12 }
      };
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.WorkspaceManager.init();
});
