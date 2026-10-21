const alertsPage = {
  allAlerts: [],
  currentFilter: 'all',
  
  async render() {
    const pageContent = document.getElementById('page-content');
    this.allAlerts = await api.getAlertHistory();
    
    // Count by severity
    const criticalCount = this.allAlerts.filter(a => a.severity === 'critical').length;
    const warningCount = this.allAlerts.filter(a => a.severity === 'warning').length;
    const infoCount = this.allAlerts.filter(a => a.severity === 'info').length;
    
    pageContent.innerHTML = `
      <!-- Alert Stats -->
      <div class="metrics-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
        <div class="metric-card red animate-in">
          <div class="metric-value" style="color: var(--red);" id="alert-critical-count">0</div>
          <div class="metric-label">Critical Alerts</div>
        </div>
        <div class="metric-card amber animate-in">
          <div class="metric-value" style="color: var(--amber);" id="alert-warning-count">0</div>
          <div class="metric-label">Warnings</div>
        </div>
        <div class="metric-card cyan animate-in">
          <div class="metric-value" style="color: var(--cyan);" id="alert-info-count">0</div>
          <div class="metric-label">Info Notices</div>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="filters-bar animate-in">
        <button class="btn btn-sm ${this.currentFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" id="filter-all" onclick="alertsPage.filterAlerts('all')">All (${this.allAlerts.length})</button>
        <button class="btn btn-sm ${this.currentFilter === 'critical' ? 'btn-primary' : 'btn-secondary'}" id="filter-critical" onclick="alertsPage.filterAlerts('critical')">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--red); display: inline-block;"></span>
          Critical (${criticalCount})
        </button>
        <button class="btn btn-sm ${this.currentFilter === 'warning' ? 'btn-primary' : 'btn-secondary'}" id="filter-warning" onclick="alertsPage.filterAlerts('warning')">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--amber); display: inline-block;"></span>
          Warning (${warningCount})
        </button>
        <button class="btn btn-sm ${this.currentFilter === 'info' ? 'btn-primary' : 'btn-secondary'}" id="filter-info" onclick="alertsPage.filterAlerts('info')">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--cyan); display: inline-block;"></span>
          Info (${infoCount})
        </button>
      </div>
      
      <!-- Alerts List -->
      <div id="alerts-list">
        ${this.renderAlertsList(this.allAlerts)}
      </div>
    `;
    
    // Animate counts
    chartUtils.animateNumber(document.getElementById('alert-critical-count'), criticalCount, 1000);
    chartUtils.animateNumber(document.getElementById('alert-warning-count'), warningCount, 1000);
    chartUtils.animateNumber(document.getElementById('alert-info-count'), infoCount, 1000);
  },
  
  renderAlertsList(alerts) {
    if (alerts.length === 0) {
      return `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p style="margin-top: 12px;">No alerts match your filter</p>
        </div>
      `;
    }
    
    return alerts.map(alert => {
      const moduleIcons = {
        quality: '📊',
        hallucination: '⚠️',
        dependency: '🔗',
        learning: '🎓'
      };
      
      return `
        <div class="alert-card ${alert.severity} animate-in" id="alert-${alert.id}">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span class="badge-${alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info'}">${alert.severity}</span>
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: var(--bg-card); color: var(--text-muted);">${moduleIcons[alert.module] || '📋'} ${alert.module}</span>
            </div>
            <div class="alert-message">${alert.message}</div>
            <div class="alert-meta">
              ${alert.student_name ? `<span>👤 ${alert.student_name}</span>` : ''}
              <span>🕐 ${typeof timeAgo === 'function' ? timeAgo(alert.timestamp) : new Date(alert.timestamp).toLocaleString()}</span>
              ${alert.resolved ? '<span style="color: var(--green);">✓ Resolved</span>' : ''}
            </div>
          </div>
          ${!alert.resolved ? `
            <button class="btn btn-sm btn-secondary" onclick="alertsPage.resolveAlert('${alert.id}')" id="resolve-btn-${alert.id}" style="flex-shrink: 0; align-self: center;">
              Resolve
            </button>
          ` : ''}
        </div>
      `;
    }).join('');
  },
  
  filterAlerts(filter) {
    this.currentFilter = filter;
    
    // Update filter button states
    document.querySelectorAll('.filters-bar .btn').forEach(btn => {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
    });
    const activeBtn = document.getElementById(`filter-${filter}`);
    if (activeBtn) {
      activeBtn.classList.remove('btn-secondary');
      activeBtn.classList.add('btn-primary');
    }
    
    // Filter and render
    const filtered = filter === 'all' ? this.allAlerts : this.allAlerts.filter(a => a.severity === filter);
    const listDiv = document.getElementById('alerts-list');
    if (listDiv) {
      listDiv.innerHTML = this.renderAlertsList(filtered);
    }
  },
  
  async resolveAlert(alertId) {
    const btn = document.getElementById(`resolve-btn-${alertId}`);
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Resolving...';
    }
    
    await api.resolveAlert(alertId);
    
    // Update local data
    const alert = this.allAlerts.find(a => a.id === alertId);
    if (alert) alert.resolved = true;
    
    // Re-render the card
    const card = document.getElementById(`alert-${alertId}`);
    if (card) {
      card.style.opacity = '0.6';
      if (btn) {
        btn.textContent = '✓ Resolved';
        btn.disabled = true;
        btn.classList.remove('btn-secondary');
        btn.style.color = 'var(--green)';
      }
    }
  },
  
  destroy() {}
};
