const studentsPage = {
  charts: [],
  currentView: 'grid', // 'grid' or 'table'
  selectedStudent: null,
  
  async render() {
    const pageContent = document.getElementById('page-content');
    const students = await api.getStudents();
    
    if (this.selectedStudent) {
      await this.renderDetail(this.selectedStudent);
      return;
    }
    
    pageContent.innerHTML = `
      <!-- Filters Bar -->
      <div class="filters-bar animate-in">
        <div class="search-box" style="flex: 1; max-width: 320px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" class="form-input" id="student-search" placeholder="Search students..." style="padding-left: 40px; border-radius: 24px;">
        </div>
        <select class="form-select" id="filter-grade" style="width: 140px;">
          <option value="">All Grades</option>
          ${[6,7,8,9,10,11,12].map(g => `<option value="${g}">Grade ${g}</option>`).join('')}
        </select>
        <select class="form-select" id="filter-status" style="width: 160px;">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="at-risk">At Risk</option>
          <option value="improving">Improving</option>
        </select>
        <div class="view-toggle">
          <button class="${this.currentView === 'grid' ? 'active' : ''}" id="view-grid-btn" onclick="studentsPage.setView('grid')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button class="${this.currentView === 'table' ? 'active' : ''}" id="view-table-btn" onclick="studentsPage.setView('table')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>
        ${api.isAdmin() ? `
          <button class="btn btn-primary" onclick="studentsPage.openCreateStudentModal()" style="padding: 8px 16px; font-size: 13px; font-weight: 600;">
            + Add Student Account
          </button>
        ` : ''}
      </div>
      
      <!-- Content Area -->
      <div id="students-content">
        ${this.currentView === 'grid' ? this.renderGrid(students) : this.renderTable(students)}
      </div>
    `;
    
    // Setup search & filter listeners
    this.setupFilters(students);
  },
  
  renderGrid(students) {
    const avatarColors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];
    
    return `
      <div class="students-grid">
        ${students.map((student, i) => {
          const color = student.avatar_color || avatarColors[i % avatarColors.length];
          const initials = student.name.split(' ').map(n => n[0]).join('');
          const statusBadge = student.status === 'at-risk' ? 'badge-critical' : 
                             student.status === 'improving' ? 'badge-success' : 'badge-info';
          
          return `
            <div class="student-card animate-in" onclick="studentsPage.viewStudent('${student.id}')" id="student-card-${student.id}">
              <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
                <div class="student-avatar" style="background: ${color};">${initials}</div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: var(--text-primary); font-size: 15px;">${student.name}</div>
                  <div style="display: flex; gap: 8px; margin-top: 4px;">
                    <span class="badge-info" style="font-size: 10px;">Grade ${student.grade}</span>
                    <span class="${statusBadge}" style="font-size: 10px;">${student.status}</span>
                  </div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
                <div style="text-align: center;">
                  <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--cyan);">${student.avg_quality}%</div>
                  <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">Quality</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--red);">${(student.avg_hallucination_risk * 100).toFixed(0)}%</div>
                  <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">Risk</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--purple);">${(student.dependency_level * 100).toFixed(0)}%</div>
                  <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">Dependency</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
                <span style="font-size: 12px; color: var(--text-muted);">${student.total_sessions} sessions</span>
                <span style="font-size: 11px; color: var(--text-muted);">Last active: ${new Date(student.last_active).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },
  
  renderTable(students) {
    return `
      <div class="chart-card" style="padding: 0; overflow: hidden;">
        <table id="students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Grade</th>
              <th>Quality</th>
              <th>Risk</th>
              <th>Dependency</th>
              <th>Learning</th>
              <th>Sessions</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(student => {
              const statusBadge = student.status === 'at-risk' ? 'badge-critical' : 
                                 student.status === 'improving' ? 'badge-success' : 'badge-info';
              const initials = student.name.split(' ').map(n => n[0]).join('');
              return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div class="student-avatar" style="background: ${student.avatar_color || 'var(--cyan)'}; width: 32px; height: 32px; font-size: 12px;">${initials}</div>
                      <span>${student.name}</span>
                    </div>
                  </td>
                  <td>${student.grade}</td>
                  <td style="font-family: var(--font-mono);">${student.avg_quality}%</td>
                  <td style="font-family: var(--font-mono);">${(student.avg_hallucination_risk * 100).toFixed(0)}%</td>
                  <td><span class="badge-${student.dependency_level >= 0.5 ? 'critical' : student.dependency_level >= 0.35 ? 'warning' : 'info'}">${(student.dependency_level * 100).toFixed(0)}%</span></td>
                  <td style="font-family: var(--font-mono);">${student.avg_learning_score}%</td>
                  <td style="font-family: var(--font-mono);">${student.total_sessions}</td>
                  <td><span class="${statusBadge}">${student.status}</span></td>
                  <td><button class="btn btn-sm btn-secondary" onclick="studentsPage.viewStudent('${student.id}')">View</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
  
  setView(view) {
    this.currentView = view;
    this.render();
  },
  
  async viewStudent(studentId) {
    this.selectedStudent = studentId;
    await this.renderDetail(studentId);
  },
  
  async renderDetail(studentId) {
    const pageContent = document.getElementById('page-content');
    const student = await api.getStudent(studentId);
    
    if (!student) {
      pageContent.innerHTML = '<div class="empty-state"><p>Student not found</p></div>';
      return;
    }
    
    const initials = student.name.split(' ').map(n => n[0]).join('');
    const statusBadge = student.status === 'at-risk' ? 'badge-critical' : 
                       student.status === 'improving' ? 'badge-success' : 'badge-info';
    
    pageContent.innerHTML = `
      <!-- Back Button -->
      <button class="btn btn-secondary animate-in" id="back-to-students-btn" onclick="studentsPage.backToList()" style="margin-bottom: 20px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Students
      </button>
      
      <!-- Student Header -->
      <div class="chart-card animate-in" style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div class="student-avatar" style="background: ${student.avatar_color || 'var(--cyan)'}; width: 64px; height: 64px; font-size: 24px;">${initials}</div>
          <div style="flex: 1;">
            <h2 style="font-size: 22px; font-weight: 700; color: var(--text-primary);">${student.name}</h2>
            <div style="display: flex; gap: 12px; margin-top: 8px; align-items: center; flex-wrap: wrap;">
              <span class="badge-info">Grade ${student.grade}</span>
              <span class="${statusBadge}">${student.status}</span>
              <span style="font-size: 13px; color: var(--text-muted);">${student.total_sessions} total sessions</span>
              ${api.isAdmin() ? `
                <button class="btn btn-secondary" onclick="studentsPage.openResetPasswordModal('${student.id}', '${student.name}')" style="padding: 4px 10px; font-size: 11px;">
                  🔑 Reset Password
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Metrics Row -->
      <div class="metrics-grid">
        <div class="metric-card cyan animate-in">
          <div class="metric-value" id="detail-quality">${student.avg_quality}%</div>
          <div class="metric-label">Quality Score</div>
        </div>
        <div class="metric-card red animate-in">
          <div class="metric-value" id="detail-risk">${(student.avg_hallucination_risk * 100).toFixed(0)}%</div>
          <div class="metric-label">Hallucination Risk</div>
        </div>
        <div class="metric-card purple animate-in">
          <div class="metric-value" id="detail-dependency">${(student.dependency_level * 100).toFixed(0)}%</div>
          <div class="metric-label">Dependency Index</div>
        </div>
        <div class="metric-card green animate-in">
          <div class="metric-value" id="detail-learning">${student.avg_learning_score}%</div>
          <div class="metric-label">Learning Score</div>
        </div>
      </div>
      
      <!-- Student Dashboard Specifics -->
      <div class="chart-card animate-in" style="margin-bottom: 24px; border-left: 4px solid var(--green);">
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div class="metric-icon green" style="flex-shrink: 0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div style="flex: 1;">
            <h3 style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">Student Progress Dashboard</h3>
            <div style="display: flex; gap: 32px; color: var(--text-muted); font-size: 14px;">
              <div><strong style="color: var(--text-primary); font-size: 18px;">18</strong> <br/>Topics Mastered</div>
              <div><strong style="color: var(--text-primary); font-size: 18px;">3</strong> <br/>Weak Topics</div>
              <div><strong style="color: var(--green); font-size: 18px;">Upward ↗</strong> <br/>Progress Trend</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Charts Row -->
      <div class="charts-row-equal">
        <div class="chart-card animate-in">
          <div class="chart-header">
            <div>
              <div class="chart-title">Dependency Trend</div>
              <div class="chart-subtitle">Last 30 days</div>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="student-dependency-chart"></canvas>
          </div>
        </div>
        <div class="chart-card animate-in">
          <div class="chart-header">
            <div>
              <div class="chart-title">Assessment Comparison</div>
              <div class="chart-subtitle">Pre-test vs Post-test vs Retention</div>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="student-assessment-chart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Recent Sessions Table -->
      <div class="chart-card animate-in" style="margin-top: 24px;">
        <div class="chart-header">
          <div>
            <div class="chart-title">Recent Sessions</div>
            <div class="chart-subtitle">Last ${student.recent_sessions ? student.recent_sessions.length : 0} evaluation sessions</div>
          </div>
        </div>
        <div style="overflow-x: auto;">
          <table id="sessions-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Subject</th>
                <th>Quality</th>
                <th>Risk</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${(student.recent_sessions || []).map(session => `
                <tr>
                  <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${session.question}</td>
                  <td><span class="badge-info">${session.subject}</span></td>
                  <td style="font-family: var(--font-mono);">${session.quality_score}%</td>
                  <td style="font-family: var(--font-mono);">${(session.risk_score * 100).toFixed(0)}%</td>
                  <td style="font-size: 12px; color: var(--text-muted);">${new Date(session.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // Initialize charts
    this.destroy();
    
    // Dependency Trend Chart
    if (student.dependency_trend) {
      const depCtx = document.getElementById('student-dependency-chart');
      if (depCtx) {
        this.charts.push(chartUtils.createLineChart(
          depCtx,
          student.dependency_trend.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }),
          [{ label: 'Dependency Index', data: student.dependency_trend.map(d => d.value * 100), color: chartUtils.colors.purple }]
        ));
      }
    }
    
    // Assessment Comparison Chart
    if (student.assessment_comparison) {
      const assessCtx = document.getElementById('student-assessment-chart');
      if (assessCtx) {
        this.charts.push(chartUtils.createBarChart(
          assessCtx,
          ['Pre-Test', 'Post-Test', 'Retention'],
          [{
            label: 'Score',
            data: [
              student.assessment_comparison.pre_test,
              student.assessment_comparison.post_test,
              student.assessment_comparison.retention
            ],
            color: chartUtils.colors.cyan
          }]
        ));
      }
    }
  },
  
  backToList() {
    this.selectedStudent = null;
    this.render();
  },
  
  setupFilters(allStudents) {
    const searchInput = document.getElementById('student-search');
    const gradeFilter = document.getElementById('filter-grade');
    const statusFilter = document.getElementById('filter-status');
    
    const applyFilters = () => {
      const search = (searchInput?.value || '').toLowerCase();
      const grade = gradeFilter?.value || '';
      const status = statusFilter?.value || '';
      
      let filtered = allStudents.filter(s => {
        const matchSearch = !search || s.name.toLowerCase().includes(search);
        const matchGrade = !grade || s.grade.toString() === grade;
        const matchStatus = !status || s.status === status;
        return matchSearch && matchGrade && matchStatus;
      });
      
      const contentDiv = document.getElementById('students-content');
      if (contentDiv) {
        contentDiv.innerHTML = this.currentView === 'grid' ? this.renderGrid(filtered) : this.renderTable(filtered);
      }
    };
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (gradeFilter) gradeFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
  },
  
  destroy() {
    this.charts.forEach(c => chartUtils.destroyChart(c));
    this.charts = [];
  },

  openCreateStudentModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (!modalOverlay || !modalContent) return;

    modalContent.innerHTML = `
      <div style="padding: 8px;">
        <h2 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-top: 0; margin-bottom: 6px;">Create New Student Account</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 18px;">Provisions a new student profile and their login account.</p>

        <form id="create-student-form" style="display: flex; flex-direction: column; gap: 12px;">
          <div id="create-student-msg" style="display: none; padding: 10px; border-radius: 6px; font-size: 13px;"></div>

          <div>
            <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Student Full Name</label>
            <input type="text" id="new-stu-name" class="form-input" placeholder="e.g. Maya Lin" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Grade Level</label>
              <select class="form-select" id="new-stu-grade" required>
                ${[6,7,8,9,10,11,12].map(g => `<option value="${g}">Grade ${g}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Primary Language</label>
              <select class="form-select" id="new-stu-lang">
                <option value="en">English (en)</option>
                <option value="hi">Hindi (hi)</option>
                <option value="es">Spanish (es)</option>
                <option value="fr">French (fr)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Initial Password (Optional - auto-generated if empty)</label>
            <input type="password" id="new-stu-pwd" class="form-input" placeholder="Leave empty for auto-generated" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
            <button type="submit" class="btn btn-primary" id="create-stu-btn">Create Account</button>
          </div>
        </form>
      </div>
    `;

    modalOverlay.classList.add('active');

    document.getElementById('create-student-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('new-stu-name').value.trim();
      const grade = parseInt(document.getElementById('new-stu-grade').value);
      const language = document.getElementById('new-stu-lang').value;
      const pwd = document.getElementById('new-stu-pwd').value.trim();
      const btn = document.getElementById('create-stu-btn');
      const msg = document.getElementById('create-student-msg');

      btn.disabled = true;
      btn.innerHTML = 'Creating...';

      try {
        const payload = { name, grade, language };
        if (pwd) payload.password = pwd;
        const res = await api.createStudent(payload);

        modalContent.innerHTML = `
          <div style="padding: 16px; text-align: center;">
            <div style="width: 48px; height: 48px; background: rgba(16, 185, 129, 0.15); color: var(--emerald); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px;">✓</div>
            <h3 style="margin: 0; color: var(--text-primary);">Student Account Created!</h3>
            <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border-subtle); padding: 14px; border-radius: 8px; margin: 16px 0; text-align: left; font-size: 13px;">
              <div><strong>Name:</strong> ${res.name}</div>
              <div style="margin-top: 4px;"><strong>Username:</strong> <code style="color: var(--cyan);">${res.username}</code></div>
              <div style="margin-top: 4px;"><strong>Initial Password:</strong> <code style="color: var(--emerald);">${res.initial_password}</code></div>
            </div>
            <button class="btn btn-primary" onclick="document.getElementById('modal-overlay').classList.remove('active'); studentsPage.render();">Done</button>
          </div>
        `;
      } catch (err) {
        msg.style.display = 'block';
        msg.style.background = 'rgba(239, 68, 68, 0.15)';
        msg.style.color = 'var(--red)';
        msg.textContent = 'Error: ' + err.message;
        btn.disabled = false;
        btn.innerHTML = 'Create Account';
      }
    });
  },

  openResetPasswordModal(studentId, studentName) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (!modalOverlay || !modalContent) return;

    modalContent.innerHTML = `
      <div style="padding: 8px;">
        <h2 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-top: 0; margin-bottom: 6px;">Reset Student Password</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Reset credentials for <strong>${studentName}</strong> (ID: ${studentId}).</p>

        <form id="reset-student-form" style="display: flex; flex-direction: column; gap: 12px;">
          <div id="reset-student-msg" style="display: none; padding: 10px; border-radius: 6px; font-size: 13px;"></div>

          <div>
            <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">New Password (Optional - random if blank)</label>
            <input type="password" id="reset-new-pwd" class="form-input" placeholder="Leave empty for auto-generated password" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
            <button type="submit" class="btn btn-primary" id="reset-stu-btn">Reset Password</button>
          </div>
        </form>
      </div>
    `;

    modalOverlay.classList.add('active');

    document.getElementById('reset-student-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwd = document.getElementById('reset-new-pwd').value.trim();
      const btn = document.getElementById('reset-stu-btn');
      const msg = document.getElementById('reset-student-msg');

      btn.disabled = true;
      btn.innerHTML = 'Resetting...';

      try {
        const payload = pwd ? { new_password: pwd } : {};
        const res = await api.resetStudentPassword(studentId, payload);

        modalContent.innerHTML = `
          <div style="padding: 16px; text-align: center;">
            <div style="width: 48px; height: 48px; background: rgba(16, 185, 129, 0.15); color: var(--emerald); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px;">✓</div>
            <h3 style="margin: 0; color: var(--text-primary);">Password Successfully Reset!</h3>
            <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border-subtle); padding: 14px; border-radius: 8px; margin: 16px 0; text-align: left; font-size: 13px;">
              <div><strong>Username:</strong> <code style="color: var(--cyan);">${res.username}</code></div>
              <div style="margin-top: 4px;"><strong>New Password:</strong> <code style="color: var(--emerald);">${res.new_password}</code></div>
            </div>
            <button class="btn btn-primary" onclick="document.getElementById('modal-overlay').classList.remove('active')">Close</button>
          </div>
        `;
      } catch (err) {
        msg.style.display = 'block';
        msg.style.background = 'rgba(239, 68, 68, 0.15)';
        msg.style.color = 'var(--red)';
        msg.textContent = 'Error: ' + err.message;
        btn.disabled = false;
        btn.innerHTML = 'Reset Password';
      }
    });
  }
};
