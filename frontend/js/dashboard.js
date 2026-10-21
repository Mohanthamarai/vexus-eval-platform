// ============================================================
// Dashboard Page Module - EvalTutor
// Main landing page with metrics, charts, alerts, and at-risk students
// ============================================================

const dashboardPage = {
  charts: [],

  async render() {
    const pageContent = document.getElementById('page-content');

    // Fetch data (will use demo data if backend unreachable)
    const overview = await api.getDashboardOverview();
    const trends = await api.getDashboardTrends();
    const subjects = await api.getSubjectPerformance();
    const distribution = await api.getScoreDistribution();
    const alerts = await api.getAlerts();
    const students = await api.getStudents();

    // Filter at-risk students (dependency >= 0.35), sorted descending
    const atRiskStudents = students
      .filter(s => s.dependency_level >= 0.35)
      .sort((a, b) => b.dependency_level - a.dependency_level);

    const recentAlerts = (Array.isArray(alerts) ? alerts : []).slice(0, 10);

    pageContent.innerHTML = `
      <!-- Teacher Insights Panel -->
      <div class="chart-card animate-in" style="margin-bottom: 20px; border-left: 4px solid var(--purple);">
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div class="metric-icon purple" style="flex-shrink: 0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div>
            <h3 style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">AI Teacher Insights</h3>
            <ul style="color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-left: 18px;">
              <li><strong>Dependency Alert:</strong> ${atRiskStudents.length} students are showing highly elevated dependency levels. Consider assigning offline or open-ended homework to force independent problem solving.</li>
              <li><strong>Hallucination Trend:</strong> Overall risk has ${overview.risk_trend <= 0 ? 'decreased' : 'increased'} by ${Math.abs(overview.risk_trend * 100).toFixed(0)}% this week. Monitor Science responses closely.</li>
              <li><strong>Learning Outcomes:</strong> Average learning score is ${overview.avg_learning_score}%. Students are struggling most with applying concepts to new scenarios.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Metrics Row -->
      <div class="metrics-grid">
        <div class="metric-card cyan animate-in" id="metric-quality">
          <div class="metric-icon cyan">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div class="metric-value" id="metric-quality-value" data-target="${overview.avg_quality}">0</div>
          <div class="metric-label">Answer Quality</div>
          <div class="metric-trend ${overview.quality_trend >= 0 ? 'up' : 'down'}">
            ${overview.quality_trend >= 0 ? '↑' : '↓'} ${Math.abs(overview.quality_trend)}%
          </div>
        </div>

        <div class="metric-card red animate-in" id="metric-hallucination">
          <div class="metric-icon red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="metric-value" id="metric-risk-value" data-target="${(overview.avg_hallucination_risk * 100).toFixed(0)}">0</div>
          <div class="metric-label">Hallucination Risk</div>
          <div class="metric-trend ${overview.risk_trend <= 0 ? 'up' : 'down'}">
            ${overview.risk_trend <= 0 ? '↓' : '↑'} ${Math.abs(overview.risk_trend * 100).toFixed(0)}%
          </div>
        </div>

        <div class="metric-card purple animate-in" id="metric-dependency">
          <div class="metric-icon purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <div class="metric-value" id="metric-dep-value" data-target="${(overview.avg_dependency * 100).toFixed(0)}">0</div>
          <div class="metric-label">Dependency Index</div>
          <div class="metric-trend ${overview.dependency_trend <= 0 ? 'up' : 'down'}">
            ${overview.dependency_trend <= 0 ? '↓' : '↑'} ${Math.abs(overview.dependency_trend * 100).toFixed(0)}%
          </div>
        </div>

        <div class="metric-card green animate-in" id="metric-learning">
          <div class="metric-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div class="metric-value" id="metric-learning-value" data-target="${overview.avg_learning_score}">0</div>
          <div class="metric-label">Learning Score</div>
          <div class="metric-trend ${overview.learning_trend >= 0 ? 'up' : 'down'}">
            ${overview.learning_trend >= 0 ? '↑' : '↓'} ${Math.abs(overview.learning_trend)}%
          </div>
        </div>
      </div>

      <!-- Charts Row 1: Quality Trends (3fr) + Score Distribution (2fr) -->
      <div class="charts-row-2">
        <div class="chart-card animate-in">
          <div class="chart-header">
            <div>
              <div class="chart-title">Quality Trends</div>
              <div class="chart-subtitle">Last 30 days performance metrics</div>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="trends-chart"></canvas>
          </div>
        </div>
        <div class="chart-card animate-in">
          <div class="chart-header">
            <div>
              <div class="chart-title">Score Distribution</div>
              <div class="chart-subtitle">Evaluation results breakdown</div>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="distribution-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Charts Row 2: Subject Performance + Recent Alerts -->
      <div class="charts-row-equal">
        <div class="chart-card animate-in">
          <div class="chart-header">
            <div>
              <div class="chart-title">Subject Performance</div>
              <div class="chart-subtitle">Quality & Learning scores by subject</div>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="subjects-chart"></canvas>
          </div>
        </div>
        <div class="chart-card animate-in">
          <div class="chart-header">
            <div>
              <div class="chart-title">Recent Alerts</div>
              <div class="chart-subtitle">${recentAlerts.length} latest notifications</div>
            </div>
            <a href="#alerts" class="btn btn-sm btn-secondary" id="view-all-alerts-btn">View All</a>
          </div>
          <div class="alerts-feed" id="alerts-feed" style="max-height: 280px; overflow-y: auto;">
            ${recentAlerts.length > 0 ? recentAlerts.map(alert => `
              <div class="alert-item" style="display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-subtle);">
                <span class="badge-${alert.severity}" style="flex-shrink: 0;">${alert.severity}</span>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 13px; color: var(--text-primary); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${alert.message}</div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${alert.student_name || ''} · ${timeAgo(alert.timestamp)}</div>
                </div>
              </div>
            `).join('') : '<div class="empty-state"><p>No recent alerts</p></div>'}
          </div>
        </div>
      </div>

      <!-- Charts Row 3: Advanced Analytics -->
      <div class="charts-row-equal">
        <div class="chart-card animate-in">
          <div class="chart-header">
            <div>
              <div class="chart-title">Hallucination Risk Over Time</div>
              <div class="chart-subtitle">30-day risk trend across all subjects</div>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="hallucination-trend-chart"></canvas>
          </div>
        </div>
        <div class="chart-card animate-in">
          <div class="chart-header">
            <div>
              <div class="chart-title">Dependency vs. Learning Score</div>
              <div class="chart-subtitle">Correlation across all active students</div>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="dependency-scatter-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- At-Risk Students Table -->
      <div class="chart-card animate-in" style="margin-top: 8px;">
        <div class="chart-header">
          <div>
            <div class="chart-title">At-Risk Students</div>
            <div class="chart-subtitle">Students with elevated dependency levels</div>
          </div>
          <span class="badge-warning">${atRiskStudents.length} students</span>
        </div>
        <div class="table-wrapper" style="overflow-x: auto;">
          <table id="at-risk-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade</th>
                <th>Dependency Level</th>
                <th>Quality Avg</th>
                <th>Sessions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${atRiskStudents.map(student => {
                const depBadge = student.dependency_level >= 0.5 ? 'critical' : student.dependency_level >= 0.35 ? 'warning' : 'info';
                return `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="student-avatar" style="background: ${student.avatar_color || 'var(--cyan)'}; width: 36px; height: 36px; font-size: 14px;">
                          ${student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>${student.name}</span>
                      </div>
                    </td>
                    <td><span class="badge-info">${student.grade}</span></td>
                    <td><span class="badge-${depBadge}">${(student.dependency_level * 100).toFixed(0)}%</span></td>
                    <td style="font-family: var(--font-mono);">${student.avg_quality}%</td>
                    <td style="font-family: var(--font-mono);">${student.total_sessions}</td>
                    <td><button class="btn btn-sm btn-secondary" onclick="app.viewStudent('${student.id}')">View Profile</button></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Initialize Charts
    this.initCharts(trends, subjects, distribution, students);

    // Animate metric numbers
    this.animateMetrics(overview);
  },

  initCharts(trends, subjects, distribution, students) {
    // Cleanup any existing chart instances
    this.destroy();

    // 1. Quality Trends - Multi-line chart
    const trendsCtx = document.getElementById('trends-chart');
    if (trendsCtx) {
      this.charts.push(chartUtils.createLineChart(trendsCtx, trends.labels, [
        { label: 'Quality', data: trends.quality, color: chartUtils.colors.cyan },
        { label: 'Hallu Risk (×100)', data: trends.hallucination.map(v => v * 100), color: chartUtils.colors.red },
        { label: 'Dependency (×100)', data: trends.dependency.map(v => v * 100), color: chartUtils.colors.purple },
        { label: 'Learning', data: trends.learning, color: chartUtils.colors.green }
      ]));
    }

    // 2. Score Distribution - Doughnut chart
    const distCtx = document.getElementById('distribution-chart');
    if (distCtx) {
      this.charts.push(chartUtils.createDoughnutChart(
        distCtx,
        distribution.labels,
        distribution.values,
        [chartUtils.colors.green, chartUtils.colors.cyan, chartUtils.colors.amber, chartUtils.colors.red]
      ));
    }

    // 3. Subject Performance - Grouped bar chart
    const subjectsCtx = document.getElementById('subjects-chart');
    if (subjectsCtx) {
      this.charts.push(chartUtils.createBarChart(subjectsCtx, subjects.labels, [
        { label: 'Quality', data: subjects.quality, color: chartUtils.colors.cyan },
        { label: 'Learning', data: subjects.learning, color: chartUtils.colors.green }
      ]));
    }

    // 4. Hallucination Risk Over Time - Line chart
    const halluCtx = document.getElementById('hallucination-trend-chart');
    if (halluCtx) {
      this.charts.push(chartUtils.createLineChart(halluCtx, trends.labels, [
        { label: 'Hallucination Risk (%)', data: trends.hallucination.map(v => (v * 100).toFixed(1)), color: chartUtils.colors.red }
      ]));
    }

    // 5. Dependency vs Learning - Scatter Plot
    const scatterCtx = document.getElementById('dependency-scatter-chart');
    if (scatterCtx && students && students.length > 0) {
      const scatterData = students.map(s => ({
        x: (s.dependency_level * 100).toFixed(1),
        y: s.avg_learning_score || s.learning_score || 70,
        label: s.name
      }));
      
      this.charts.push(chartUtils.createScatterChart(scatterCtx, [
        { label: 'Student', data: scatterData, color: chartUtils.colors.purple }
      ]));
    }
  },

  animateMetrics(overview) {
    const qualityEl = document.getElementById('metric-quality-value');
    const riskEl = document.getElementById('metric-risk-value');
    const depEl = document.getElementById('metric-dep-value');
    const learningEl = document.getElementById('metric-learning-value');

    if (qualityEl) chartUtils.animateNumber(qualityEl, overview.avg_quality, 1500, '%');
    if (riskEl) chartUtils.animateNumber(riskEl, overview.avg_hallucination_risk * 100, 1500, '%');
    if (depEl) chartUtils.animateNumber(depEl, overview.avg_dependency * 100, 1500, '%');
    if (learningEl) chartUtils.animateNumber(learningEl, overview.avg_learning_score, 1500, '%');
  },

  destroy() {
    this.charts.forEach(c => chartUtils.destroyChart(c));
    this.charts = [];
  }
};

// ============================================================
// Utility: Relative Time Display
// ============================================================
function timeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
