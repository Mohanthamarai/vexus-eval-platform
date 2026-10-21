/**
 * VEXUS Authentication & Session Modal
 * Manages user sign-in, role switching, user avatar dropdown, and logout.
 */

const authModal = {
  showLoginModal(forced = false) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    if (!modalOverlay || !modalContent) return;

    modalContent.innerHTML = `
      <div style="padding: 10px 4px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: rgba(6, 182, 212, 0.1); border-radius: 50%; margin-bottom: 12px; border: 1px solid rgba(6, 182, 212, 0.3);">
            <svg width="26" height="26" viewBox="0 0 36 36" fill="none" stroke="var(--cyan)" stroke-width="2.2">
              <path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" stroke-linejoin="round"/>
              <path d="M10 12L18 26L26 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0;">Sign In to VEXUS</h2>
          <p style="font-size: 13px; color: var(--text-muted); margin: 6px 0 0 0;">AI Tutoring Evaluation & Safety Platform</p>
        </div>

        <!-- Quick Demo Role Switcher -->
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--cyan); font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">Quick Role Select (Development & Testing)</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="demo-admin-btn" style="padding: 8px; font-size: 12px; border-radius: 6px; text-align: left; display: flex; flex-direction: column;">
              <span style="font-weight: 700; color: var(--purple);">🔑 Administrator</span>
              <span style="font-size: 10px; color: var(--text-muted);">Platform monitoring & audits</span>
            </button>
            <button type="button" class="btn btn-secondary" id="demo-student-btn" style="padding: 8px; font-size: 12px; border-radius: 6px; text-align: left; display: flex; flex-direction: column;">
              <span style="font-weight: 700; color: var(--cyan);">🎓 Student</span>
              <span style="font-size: 10px; color: var(--text-muted);">AI tutoring & practice</span>
            </button>
          </div>
        </div>

        <form id="vexus-login-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div id="login-error-msg" style="display: none; padding: 10px 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; color: var(--red); font-size: 13px;"></div>

          <div>
            <label class="form-label" style="font-size: 12px; margin-bottom: 6px;">Username or Email</label>
            <input type="text" id="login-username" class="form-input" placeholder="e.g. admin or alicesmith" required autocomplete="username" />
          </div>

          <div>
            <label class="form-label" style="font-size: 12px; margin-bottom: 6px;">Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••••••" required autocomplete="current-password" />
          </div>

          <button type="submit" class="btn btn-primary" id="login-submit-btn" style="padding: 12px; font-size: 14px; font-weight: 700; margin-top: 6px;">
            Sign In to Portal
          </button>
        </form>
      </div>
    `;

    modalOverlay.classList.add('active');

    // Quick demo buttons
    document.getElementById('demo-admin-btn')?.addEventListener('click', () => {
      document.getElementById('login-username').value = 'admin';
      document.getElementById('login-password').value = 'AdminSecureVexus2026!';
    });

    document.getElementById('demo-student-btn')?.addEventListener('click', () => {
      document.getElementById('login-username').value = 'alicesmith';
      document.getElementById('login-password').value = 'Alicesmith2026!';
    });

    // Form submit
    const form = document.getElementById('vexus-login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const errorMsg = document.getElementById('login-error-msg');
      const submitBtn = document.getElementById('login-submit-btn');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="width: 16px; height: 16px;"></span> Signing in...';
      errorMsg.style.display = 'none';

      try {
        const res = await api.login({ username, password });
        modalOverlay.classList.remove('active');
        window.dispatchEvent(new CustomEvent('vexus:loggedin', { detail: res }));
      } catch (err) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = err.message || 'Login failed. Please verify credentials.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In to Portal';
      }
    });
  },

  hideModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
  },

  renderUserControls() {
    const topBarActions = document.querySelector('.top-bar-actions');
    if (!topBarActions) return;

    // Check if controls container already exists
    let userBox = document.getElementById('vexus-user-box');
    if (!userBox) {
      userBox = document.createElement('div');
      userBox.id = 'vexus-user-box';
      userBox.style.display = 'flex';
      userBox.style.alignItems = 'center';
      userBox.style.gap = '10px';
      topBarActions.appendChild(userBox);
    }

    const user = api.getUser();

    if (!user) {
      userBox.innerHTML = `
        <button class="btn btn-primary" id="top-sign-in-btn" style="padding: 6px 14px; font-size: 13px;">
          Sign In
        </button>
      `;
      document.getElementById('top-sign-in-btn')?.addEventListener('click', () => {
        this.showLoginModal();
      });
      return;
    }

    const isAdm = user.role === 'admin';
    const roleBadge = isAdm ? 'badge-purple' : 'badge-info';
    const roleLabel = isAdm ? 'ADMIN' : 'STUDENT';
    const displayName = user.student_name || user.username;

    userBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-subtle); padding: 4px 10px 4px 6px; border-radius: 20px;">
        <div style="width: 26px; height: 26px; border-radius: 50%; background: ${isAdm ? 'var(--purple)' : 'var(--cyan)'}; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;">
          ${displayName.substring(0, 2).toUpperCase()}
        </div>
        <div style="display: flex; flex-direction: column; line-height: 1.2;">
          <span style="font-size: 12px; font-weight: 600; color: var(--text-primary); max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${displayName}
          </span>
          <span style="font-size: 9px; font-weight: 700; color: ${isAdm ? 'var(--purple)' : 'var(--cyan)'}; letter-spacing: 0.5px;">
            ${roleLabel}
          </span>
        </div>
      </div>

      <button class="btn btn-secondary" id="top-logout-btn" title="Sign out" style="padding: 6px 10px; font-size: 12px; border-radius: 6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    `;

    document.getElementById('top-logout-btn')?.addEventListener('click', async () => {
      await api.logout();
    });
  }
};
