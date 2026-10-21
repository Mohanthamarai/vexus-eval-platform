const chartUtils = {
  // Default chart options for dark theme
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: 'Inter', size: 13, weight: '600' },
        bodyFont: { family: 'Inter', size: 12 },
        displayColors: true,
        boxPadding: 6
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.06)', drawBorder: false },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.06)', drawBorder: false },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } }
      }
    }
  },

  colors: {
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    green: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    cyanAlpha: 'rgba(6, 182, 212, 0.15)',
    purpleAlpha: 'rgba(139, 92, 246, 0.15)',
    greenAlpha: 'rgba(16, 185, 129, 0.15)',
    amberAlpha: 'rgba(245, 158, 11, 0.15)',
    redAlpha: 'rgba(239, 68, 68, 0.15)'
  },

  // Create gradient fill for line charts
  createGradient(ctx, color) {
    // Ensure we have a 2D rendering context
    const context = (ctx instanceof CanvasRenderingContext2D)
      ? ctx
      : (ctx.getContext ? ctx.getContext('2d') : ctx);
    const gradient = context.createLinearGradient(0, 0, 0, context.canvas.height);
    const rgb = this._hexToRgb(color);
    gradient.addColorStop(0, `rgba(${rgb}, 0.3)`);
    gradient.addColorStop(0.5, `rgba(${rgb}, 0.1)`);
    gradient.addColorStop(1, `rgba(${rgb}, 0)`);
    return gradient;
  },

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  },

  /**
   * Resolve a canvas element and its 2D context from various input types.
   * Accepts: HTMLCanvasElement, CanvasRenderingContext2D, or a string ID.
   */
  _resolveCanvas(ctx) {
    let canvas, context;
    if (typeof ctx === 'string') {
      canvas = document.getElementById(ctx);
      if (!canvas) throw new Error(`Canvas element not found: ${ctx}`);
      context = canvas.getContext('2d');
    } else if (ctx instanceof HTMLCanvasElement) {
      canvas = ctx;
      context = canvas.getContext('2d');
    } else if (ctx instanceof CanvasRenderingContext2D) {
      context = ctx;
      canvas = ctx.canvas;
    } else if (ctx && ctx.canvas) {
      // Some wrappers expose .canvas
      canvas = ctx.canvas;
      context = canvas.getContext ? canvas.getContext('2d') : ctx;
    } else {
      // Last resort — assume it's a canvas-like object
      canvas = ctx;
      context = ctx;
    }
    return { canvas, context };
  },

  // ========================================
  // LINE CHART - smooth curves with gradient fills
  // ========================================
  createLineChart(ctx, labels, datasets) {
    const { canvas, context } = this._resolveCanvas(ctx);

    return new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map(ds => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color,
          backgroundColor: this.createGradient(context, ds.color),
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: ds.color,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }))
      },
      options: {
        ...this.defaultOptions,
        interaction: { mode: 'index', intersect: false }
      }
    });
  },

  // ========================================
  // BAR CHART - rounded bars
  // ========================================
  createBarChart(ctx, labels, datasets) {
    const { canvas } = this._resolveCanvas(ctx);

    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: (Array.isArray(datasets) ? datasets : [datasets]).map(ds => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.color + '40', // 25% opacity
          borderColor: ds.color,
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }))
      },
      options: {
        ...this.defaultOptions,
        scales: {
          ...this.defaultOptions.scales,
          y: { ...this.defaultOptions.scales.y, beginAtZero: true }
        }
      }
    });
  },

  // ========================================
  // DOUGHNUT CHART with center text
  // ========================================
  createDoughnutChart(ctx, labels, data, colors) {
    const { canvas } = this._resolveCanvas(ctx);

    return new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.map(c => c + '60'),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { ...this.defaultOptions.plugins.legend, position: 'bottom' },
          tooltip: this.defaultOptions.plugins.tooltip
        }
      },
      plugins: [{
        id: 'centerText',
        afterDraw(chart) {
          const { ctx: c, width, height } = chart;
          const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          c.save();
          c.font = '600 28px JetBrains Mono';
          c.fillStyle = '#f1f5f9';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(total.toLocaleString(), width / 2, height / 2 - 10);
          c.font = '400 12px Inter';
          c.fillStyle = '#94a3b8';
          c.fillText('Total', width / 2, height / 2 + 15);
          c.restore();
        }
      }]
    });
  },

  // ========================================
  // SCATTER CHART
  // ========================================
  createScatterChart(ctx, datasets) {
    const { canvas } = this._resolveCanvas(ctx);

    return new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: datasets.map(ds => ({
          label: ds.label,
          data: ds.data, // format: [{x: number, y: number, studentId?: string, label?: string}]
          backgroundColor: ds.color + '80', // 50% opacity
          borderColor: ds.color,
          borderWidth: 1,
          pointRadius: 6,
          pointHoverRadius: 8
        }))
      },
      options: {
        ...this.defaultOptions,
        plugins: {
          ...this.defaultOptions.plugins,
          tooltip: {
            ...this.defaultOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                const pt = context.raw;
                let label = pt.label || context.dataset.label;
                return `${label}: Dependency ${pt.x}%, Learning ${pt.y}%`;
              }
            }
          }
        },
        scales: {
          x: {
            ...this.defaultOptions.scales.x,
            title: { display: true, text: 'Dependency Level (%)', color: '#94a3b8' },
            min: 0, max: 100
          },
          y: {
            ...this.defaultOptions.scales.y,
            title: { display: true, text: 'Learning Score (%)', color: '#94a3b8' },
            min: 0, max: 100
          }
        }
      }
    });
  },

  // ========================================
  // RADAR CHART
  // ========================================
  createRadarChart(ctx, labels, datasets) {
    const { canvas } = this._resolveCanvas(ctx);

    return new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: datasets.map(ds => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color,
          backgroundColor: ds.color + '20',
          borderWidth: 2,
          pointBackgroundColor: ds.color,
          pointRadius: 4
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            angleLines: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { display: false },
            pointLabels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
          }
        },
        plugins: {
          legend: { ...this.defaultOptions.plugins.legend, position: 'bottom' },
          tooltip: this.defaultOptions.plugins.tooltip
        }
      }
    });
  },

  // ========================================
  // CIRCULAR GAUGE - custom HTML/CSS
  // ========================================
  createGauge(container, value, max, color, label) {
    const percentage = (value / max) * 100;
    const displayValue = max === 1 ? Math.round(value * 100) + '%' : Math.round(value);
    const gaugeHTML = `
      <div class="gauge-ring" style="background: conic-gradient(${color} 0deg, rgba(148, 163, 184, 0.1) 0deg)">
        <span class="gauge-value" style="color: ${color}" data-target="${Math.round(value)}">${displayValue}</span>
      </div>
      <span class="gauge-label">${label}</span>
    `;
    container.innerHTML = gaugeHTML;

    // Animate the conic-gradient
    requestAnimationFrame(() => {
      const ring = container.querySelector('.gauge-ring');
      if (!ring) return;

      let current = 0;
      const target = percentage * 3.6;
      const totalFrames = 60;
      const step = target / totalFrames;

      const animate = () => {
        current = Math.min(current + step, target);
        ring.style.background = `conic-gradient(${color} ${current}deg, rgba(148, 163, 184, 0.1) ${current}deg)`;
        if (current < target) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    });
  },

  // ========================================
  // ANIMATE NUMBER count up
  // ========================================
  animateNumber(element, target, duration = 1500, suffix = '') {
    if (!element) return;
    const isFloat = target % 1 !== 0;
    const start = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;

      element.textContent = (isFloat ? current.toFixed(2) : Math.round(current)) + suffix;

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  },

  // ========================================
  // DESTROY chart safely
  // ========================================
  destroyChart(chartInstance) {
    if (chartInstance && typeof chartInstance.destroy === 'function') {
      chartInstance.destroy();
    }
  }
};
