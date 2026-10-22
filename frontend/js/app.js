/**
 * VEXUS Application Controller
 * Handles role-based routing (Admin vs Student), dynamic sidebar rendering,
 * page transitions, authentication state sync, and search.
 */

const app = {
  currentPage: null,

  // All page controllers
  pages: {
    // Admin Portal Pages
    dashboard: dashboardPage,
    evaluate: evaluationPage,
    students: studentsPage,
    alerts: alertsPage,
    simulator: simulatorPage,
    health: healthPage,

    // Student Portal Pages
    'student-tutor': studentTutorPage,
    'student-dashboard': studentDashboardPage,
    'student-history': studentHistoryPage,
    'student-assessments': studentAssessmentsPage,
    'student-settings': studentSettingsPage,
  },

  pageTitles: {
    // Admin titles
    dashboard: 'Executive Dashboard & Platform Telemetry',
    evaluate: 'Pedagogical Evaluation & Grounding',
    students: 'Student Directory & Longitudinal Telemetry',
    alerts: 'System Safety Alerts & Interventions',
    simulator: 'AI Tutor Testing Sandbox',
    health: 'Subsystem Health & Diagnostics',

    // Student titles
    'student-tutor': 'AI Pedagogical Tutor Workspace',
    'student-dashboard': 'My Learning Progress & Analytics',
    'student-history': 'My Tutoring Conversation History',
    'student-assessments': 'Assessments & Mastery Tracking',
    'student-settings': 'Account Credentials & Settings',
  },

  async init() {
    // Set up auth event listeners
    window.addEventListener('vexus:loggedin', (e) => {
      this.handleAuthChange();
      const role = api.getRole();
      const defaultHash = role === 'student' ? 'student-tutor' : 'dashboard';
      window.location.hash = defaultHash;
      this.navigate(defaultHash);
    });

    window.addEventListener('vexus:loggedout', () => {
      this.handleAuthChange();
      authModal.showLoginModal(true);
    });

    window.addEventListener('vexus:unauthorized', () => {
      this.handleAuthChange();
      authModal.showLoginModal(true);
    });

    // Hash change routing
    window.addEventListener('hashchange', () => this.handleRoute());

    // Search input
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            const role = api.getRole();
            if (role === 'student') {
              window.location.hash = 'student-history';
              setTimeout(() => {
                const hSearch = document.getElementById('history-search-input');
                if (hSearch) {
                  hSearch.value = query;
                  hSearch.dispatchEvent(new Event('input'));
                }
              }, 300);
            } else {
              window.location.hash = 'students';
              setTimeout(() => {
                const sSearch = document.getElementById('student-search');
                if (sSearch) {
                  sSearch.value = query;
                  sSearch.dispatchEvent(new Event('input'));
                }
              }, 300);
            }
          }
        }
      });
    }

    // Notification bell
    const notifBtn = document.getElementById('notification-btn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        if (api.isAdmin()) {
          window.location.hash = 'alerts';
        } else {
          window.location.hash = 'student-dashboard';
        }
      });
    }

    // Mobile menu toggle & backdrop
    const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
    const sidebarEl = document.getElementById('sidebar');
    const backdropEl = document.getElementById('sidebar-backdrop');

    if (mobileToggleBtn && sidebarEl) {
      mobileToggleBtn.addEventListener('click', () => {
        sidebarEl.classList.toggle('open');
        if (backdropEl) backdropEl.classList.toggle('active');
      });
    }

    if (backdropEl && sidebarEl) {
      backdropEl.addEventListener('click', () => {
        sidebarEl.classList.remove('open');
        backdropEl.classList.remove('active');
      });
    }

    // Verify authentication and render
    await this.verifyAuthAndSetup();
  },

  async verifyAuthAndSetup() {
    if (api.isAuthenticated()) {
      try {
        await api.getMe();
      } catch (e) {
        console.warn("Session check returned error:", e);
      }
    }

    this.handleAuthChange();

    if (!api.isAuthenticated()) {
      // Show login modal if not logged in
      authModal.showLoginModal(true);
    } else {
      this.handleRoute();
    }
  },

  handleAuthChange() {
    authModal.renderUserControls();
    this.renderSidebar();
    this.updateRoleBadge();
  },

  updateRoleBadge() {
    const badge = document.getElementById('portal-role-badge');
    if (!badge) return;

    const user = api.getUser();
    if (!user) {
      badge.textContent = 'Sign In Required';
      badge.style.background = 'rgba(255,255,255,0.08)';
      badge.style.color = 'var(--text-muted)';
      return;
    }

    if (user.role === 'admin') {
      badge.textContent = 'ADMIN PORTAL';
      badge.style.background = 'rgba(139, 92, 246, 0.2)';
      badge.style.color = 'var(--purple)';
      badge.style.border = '1px solid rgba(139, 92, 246, 0.4)';
    } else {
      badge.textContent = 'STUDENT PORTAL';
      badge.style.background = 'rgba(6, 182, 212, 0.2)';
      badge.style.color = 'var(--cyan)';
      badge.style.border = '1px solid rgba(6, 182, 212, 0.4)';
    }
  },

  renderSidebar() {
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!sidebarNav) return;

    const role = api.getRole();

    if (role === 'student') {
      // Dedicated Student Portal Navigation
      sidebarNav.innerHTML = `
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); padding: 0 16px 8px 16px; letter-spacing: 0.5px;">
          Student Learning
        </div>

        <!-- AI Tutor Workspace -->
        <a href="#student-tutor" class="nav-item" id="nav-student-tutor" data-page="student-tutor">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>My AI Tutor</span>
        </a>

        <!-- My Learning Progress -->
        <a href="#student-dashboard" class="nav-item" id="nav-student-dashboard" data-page="student-dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>My Progress</span>
        </a>

        <!-- My Tutoring History -->
        <a href="#student-history" class="nav-item" id="nav-student-history" data-page="student-history">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>My History</span>
        </a>

        <!-- Assessments & Mastery -->
        <a href="#student-assessments" class="nav-item" id="nav-student-assessments" data-page="student-assessments">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Assessments</span>
        </a>

        <!-- Account Settings -->
        <a href="#student-settings" class="nav-item" id="nav-student-settings" data-page="student-settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>Settings</span>
        </a>
      `;
    } else {
      // Administrator Portal Navigation
      sidebarNav.innerHTML = `
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); padding: 0 16px 8px 16px; letter-spacing: 0.5px;">
          Admin Administration
        </div>

        <!-- Dashboard -->
        <a href="#dashboard" class="nav-item" id="nav-dashboard" data-page="dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>Dashboard</span>
        </a>

        <!-- Evaluate -->
        <a href="#evaluate" class="nav-item" id="nav-evaluate" data-page="evaluate">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <path d="M9 12L11 14L15 10"/>
            <line x1="9" y1="6" x2="15" y2="6"/>
          </svg>
          <span>AI Evaluations</span>
        </a>

        <!-- Students -->
        <a href="#students" class="nav-item" id="nav-students" data-page="students">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="7" r="4"/>
            <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>
            <circle cx="19" cy="7" r="3"/>
            <path d="M22 21v-1.5a3 3 0 0 0-3-3h-1"/>
          </svg>
          <span>Students</span>
        </a>

        <!-- Alerts -->
        <a href="#alerts" class="nav-item" id="nav-alerts" data-page="alerts">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span>Alerts</span>
          <span class="nav-badge-pill" id="nav-alerts-badge">Active</span>
        </a>

        <!-- AI Simulator -->
        <a href="#simulator" class="nav-item" id="nav-simulator" data-page="simulator">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>AI Simulator</span>
        </a>

        <!-- System Health & Diagnostics -->
        <a href="#health" class="nav-item" id="nav-health" data-page="health">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <span>System Health</span>
          <span class="status-indicator-dot online"></span>
        </a>

        <!-- PPTX Download -->
        <a href="/api/download-pptx" target="_blank" class="nav-item" style="margin-top: 10px; border: 1px dashed var(--border-subtle); background: rgba(14, 116, 144, 0.1);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span style="color: var(--cyan); font-weight: 600;">Download Report</span>
        </a>
      `;
    }

    // Bind navigation click handlers
    sidebarNav.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const page = item.dataset.page;
        if (page) {
          e.preventDefault();
          window.location.hash = page;
        }
      });
    });
  },

  handleRoute() {
    const rawHash = window.location.hash.slice(1);
    const role = api.getRole();

    // Default route per role
    let defaultPage = role === 'student' ? 'student-tutor' : 'dashboard';
    let targetPage = rawHash || defaultPage;

    // Guard: prevent student from visiting admin pages
    const adminPages = ['dashboard', 'evaluate', 'students', 'alerts', 'simulator', 'health'];
    const studentPages = ['student-tutor', 'student-dashboard', 'student-history', 'student-assessments', 'student-settings'];

    if (role === 'student' && adminPages.includes(targetPage)) {
      targetPage = 'student-tutor';
      window.location.hash = 'student-tutor';
    } else if (role === 'admin' && studentPages.includes(targetPage)) {
      targetPage = 'dashboard';
      window.location.hash = 'dashboard';
    }

    if (!Object.keys(this.pages).includes(targetPage)) {
      targetPage = defaultPage;
    }

    this.navigate(targetPage);
  },

  async navigate(pageName) {
    if (this.currentPage === pageName) return;

    // Destroy old page
    const oldPageObj = this.pages[this.currentPage];
    if (oldPageObj && typeof oldPageObj.destroy === 'function') {
      oldPageObj.destroy();
    }

    if (this.pages.students) {
      this.pages.students.selectedStudent = null;
    }

    this.currentPage = pageName;
    
    // Auto-close mobile drawer on navigation
    const sidebarEl = document.getElementById('sidebar');
    const backdropEl = document.getElementById('sidebar-backdrop');
    if (sidebarEl) sidebarEl.classList.remove('open');
    if (backdropEl) backdropEl.classList.remove('active');

    // Update active nav class
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageName);
    });

    // Update page title
    const titleEl = document.getElementById('page-title');
    if (titleEl) {
      titleEl.textContent = this.pageTitles[pageName] || 'Dashboard';
    }

    // Fade out and in
    const content = document.getElementById('page-content');
    if (content) {
      content.style.opacity = '0';
      content.style.transform = 'translateY(8px)';
    }

    await new Promise(r => setTimeout(r, 120));

    const page = this.pages[pageName];
    if (page && typeof page.render === 'function') {
      try {
        await page.render();
      } catch (err) {
        console.error('Render error:', err);
        if (content) {
          content.innerHTML = `
            <div style="padding: 30px; color: var(--red); background: rgba(239, 68, 68, 0.1); margin: 20px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">
              <h3 style="margin-top: 0;">Error rendering ${pageName}</h3>
              <p>${err.message}</p>
            </div>
          `;
        }
      }
    }

    if (content) {
      requestAnimationFrame(() => {
        content.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      });
    }

    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollTop = 0;
  },

  // Helper for admin to view student profile
  viewStudent(studentId) {
    window.location.hash = 'students';
    setTimeout(() => {
      if (typeof studentsPage !== 'undefined') {
        studentsPage.viewStudent(studentId);
      }
    }, 200);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
