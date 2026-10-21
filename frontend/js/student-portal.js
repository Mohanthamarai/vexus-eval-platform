/**
 * VEXUS Student Portal UI Modules
 * Provides dedicated student experiences:
 * 1. studentTutorPage: AI tutoring workspace with real-time evaluated responses
 * 2. studentDashboardPage: personal learning analytics, dependency index, and subjects
 * 3. studentHistoryPage: complete searchable tutoring interaction logs
 * 4. studentAssessmentsPage: pre/post/retention outcomes and Bloom's taxonomy
 * 5. studentSettingsPage: personal settings and password change
 */

// ---------------------------------------------------------------------------
// 1. AI Tutoring Workspace (studentTutorPage)
// ---------------------------------------------------------------------------
const studentTutorPage = {
  chatHistory: [],

  async render() {
    const pageContent = document.getElementById('page-content');
    const user = api.getUser() || { student_name: 'Student', grade: 8 };

    pageContent.innerHTML = `
      <div class="eval-grid" style="height: calc(100vh - 120px); gap: 24px; padding-bottom: 24px;">
        <!-- LEFT: Chat Area -->
        <div class="eval-panel animate-in" style="display: flex; flex-direction: column; height: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 12px;">
            <div>
              <h2 style="font-size: 19px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                AI Tutor Workspace
              </h2>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                Interacting as <strong style="color: var(--cyan);">${user.student_name || user.username}</strong> (Grade ${user.grade || 8})
              </div>
            </div>

            <div style="display: flex; gap: 10px; align-items: center;">
              <select class="form-select" id="student-subject" style="width: 140px; padding: 6px 12px; font-size: 13px;">
                <option value="science">Science</option>
                <option value="mathematics">Mathematics</option>
                <option value="history">History</option>
                <option value="english">English Lit</option>
                <option value="geography">Geography</option>
              </select>
              <select class="form-select" id="student-grade" style="width: 110px; padding: 6px 12px; font-size: 13px;">
                ${[6, 7, 8, 9, 10, 11, 12].map(g => `<option value="${g}" ${g === (user.grade || 8) ? 'selected' : ''}>Grade ${g}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <!-- Chat Message Thread -->
          <div id="student-chat-messages" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding-right: 8px; margin-bottom: 16px;">
            <div class="chat-message tutor" style="display: flex; gap: 12px; align-items: flex-start; max-width: 88%;">
              <div class="chat-avatar" style="background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--cyan); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="18" height="18" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M10 12L18 26L26 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="chat-bubble" style="background: var(--bg-card); padding: 14px 18px; border-radius: 4px 16px 16px 16px; border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 14px; line-height: 1.6;">
                Hello <strong>${user.student_name || 'there'}</strong>! I am your Vexus AI Tutor. What concept or problem would you like to explore together today?
              </div>
            </div>
          </div>

          <!-- Quick Prompts / Socratic Scaffolding Buttons -->
          <div style="display: flex; gap: 8px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 4px;">
            <button class="btn btn-secondary quick-prompt-btn" style="padding: 4px 10px; font-size: 12px; border-radius: 14px;" data-prompt="Can you give me a hint instead of the full answer?">
              💡 Request a Hint
            </button>
            <button class="btn btn-secondary quick-prompt-btn" style="padding: 4px 10px; font-size: 12px; border-radius: 14px;" data-prompt="Can you explain this step-by-step with a real-world analogy?">
              🔍 Step-by-Step Analogy
            </button>
            <button class="btn btn-secondary quick-prompt-btn" style="padding: 4px 10px; font-size: 12px; border-radius: 14px;" data-prompt="Give me a practice question to test if I understood this correctly.">
              🎯 Test My Understanding
            </button>
          </div>

          <!-- Input Form -->
          <form id="student-chat-form" style="display: flex; gap: 12px;">
            <input type="text" id="student-chat-input" class="form-input" placeholder="Ask a question or explain your reasoning..." autocomplete="off" required style="flex: 1;" />
            <button type="submit" class="btn btn-primary" id="student-chat-send-btn" style="padding: 0 20px;">
              Send <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 6px;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>

        <!-- RIGHT: Pedagogical Feedback & Learning Quality Card -->
        <div class="eval-panel animate-in" id="student-eval-panel" style="overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
            <h2 style="font-size: 17px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Learning Check & Quality
            </h2>
            <span class="badge-success" id="student-eval-status">Session Active</span>
          </div>

          <div id="student-eval-placeholder" style="display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 14px; color: var(--text-muted); min-height: 280px; text-align: center; border: 1px dashed var(--border-subtle); border-radius: 8px; padding: 20px;">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.4;">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p style="font-size: 13px; line-height: 1.5;">
              As you discuss concepts with Vexus,<br>each answer is scored for factual accuracy and clarity.
            </p>
          </div>

          <div id="student-eval-results"></div>
        </div>
      </div>
    `;

    this.setupListeners();
    this.chatHistory = [];
  },

  setupListeners() {
    const form = document.getElementById('student-chat-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.sendMessage();
      });
    }

    // Quick prompt buttons
    document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('student-chat-input');
        if (input) {
          input.value = btn.dataset.prompt;
          input.focus();
        }
      });
    });
  },

  async sendMessage() {
    const input = document.getElementById('student-chat-input');
    const sendBtn = document.getElementById('student-chat-send-btn');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    this.appendMessage('user', message);

    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px;"></span>';

    const subject = document.getElementById('student-subject').value;
    const grade_level = parseInt(document.getElementById('student-grade').value);

    const typingId = 'typing-' + Date.now();
    this.appendTypingIndicator(typingId);

    try {
      // Connect to genuine evaluated student chat endpoint
      const response = await api.studentChat({
        subject,
        grade_level,
        history: this.chatHistory,
        message
      });

      document.getElementById(typingId)?.remove();
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'Send <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 6px;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

      this.appendMessage('tutor', response.response);

      this.chatHistory.push({ role: 'user', content: message });
      this.chatHistory.push({ role: 'tutor', content: response.response });

      // Render verified evaluation feedback card
      this.renderEvaluationCard(response, message);
    } catch (err) {
      document.getElementById(typingId)?.remove();
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'Send <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 6px;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
      this.appendMessage('system', 'Error: ' + err.message);
    }
  },

  appendMessage(role, text) {
    const chatMessages = document.getElementById('student-chat-messages');
    let html = '';

    if (role === 'user') {
      html = `
        <div class="chat-message student" style="display: flex; gap: 12px; align-items: flex-start; max-width: 85%; align-self: flex-end;">
          <div class="chat-bubble" style="background: rgba(6, 182, 212, 0.15); padding: 12px 16px; border-radius: 16px 4px 16px 16px; border: 1px solid rgba(6, 182, 212, 0.3); color: var(--text-primary); font-size: 14px; line-height: 1.5;">
            ${this.escapeHtml(text)}
          </div>
          <div class="chat-avatar" style="background: var(--cyan); color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; font-weight: bold;">
            ME
          </div>
        </div>
      `;
    } else if (role === 'system') {
      html = `
        <div class="chat-message system" style="display: flex; justify-content: center; margin: 8px 0;">
          <div style="background: rgba(239, 68, 68, 0.1); color: var(--red); padding: 8px 16px; border-radius: 16px; font-size: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
            ${this.escapeHtml(text)}
          </div>
        </div>
      `;
    } else {
      html = `
        <div class="chat-message tutor" style="display: flex; gap: 12px; align-items: flex-start; max-width: 88%;">
          <div class="chat-avatar" style="background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--cyan); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="18" height="18" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" stroke-width="2" stroke-linejoin="round"/>
              <path d="M10 12L18 26L26 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="chat-bubble markdown-body" style="background: var(--bg-card); padding: 14px 18px; border-radius: 4px 16px 16px 16px; border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 14px; line-height: 1.6; width: 100%;">
            ${typeof marked !== 'undefined' ? marked.parse(text) : this.escapeHtml(text)}
          </div>
        </div>
      `;
    }

    const div = document.createElement('div');
    div.innerHTML = html;
    chatMessages.appendChild(div.firstElementChild);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  },

  appendTypingIndicator(id) {
    const chatMessages = document.getElementById('student-chat-messages');
    const html = `
      <div id="${id}" class="chat-message tutor" style="display: flex; gap: 12px; align-items: flex-start; max-width: 85%;">
        <div class="chat-avatar" style="background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--cyan); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg width="16" height="16" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" stroke-width="2" stroke-linejoin="round"/><path d="M10 12L18 26L26 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="chat-bubble" style="background: var(--bg-card); padding: 12px 16px; border-radius: 4px 16px 16px 16px; border: 1px solid var(--border-subtle); display: flex; gap: 4px; align-items: center; height: 44px;">
          <div style="width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; animation: pulse 1s infinite;"></div>
          <div style="width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; animation: pulse 1s infinite 0.2s;"></div>
          <div style="width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; animation: pulse 1s infinite 0.4s;"></div>
        </div>
      </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = html;
    chatMessages.appendChild(div.firstElementChild);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  },

  renderEvaluationCard(response, question) {
    const placeholder = document.getElementById('student-eval-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const resultsDiv = document.getElementById('student-eval-results');
    const gradeClass = `grade-${response.overall_grade}`;

    const cardHtml = `
      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px; animation: slideIn 0.3s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Recorded Session #${response.session_id}</div>
            <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${this.escapeHtml(question)}
            </div>
          </div>
          <div class="badge-grade ${gradeClass}" style="width: 36px; height: 36px; font-size: 18px; flex-shrink: 0;">
            ${response.overall_grade}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div style="background: rgba(15, 23, 42, 0.4); padding: 10px 12px; border-radius: 6px;">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Pedagogy Quality</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--cyan); font-family: var(--font-mono);">${response.quality_score}%</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.4); padding: 10px 12px; border-radius: 6px;">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Factuality Risk</div>
            <div style="font-size: 18px; font-weight: 700; color: ${response.hallucination_risk > 0.4 ? 'var(--red)' : 'var(--emerald)'}; font-family: var(--font-mono);">
              ${(response.hallucination_risk * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        ${response.pedagogical_feedback && response.pedagogical_feedback.length > 0 ? `
          <div style="background: rgba(6, 182, 212, 0.08); border-left: 3px solid var(--cyan); padding: 10px 12px; border-radius: 4px; font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
            <strong>Learning Guidance:</strong><br>
            ${response.pedagogical_feedback.join('<br>')}
          </div>
        ` : ''}

        <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between;">
          <span>Model: <strong>${response.model_used}</strong></span>
          <span>Latency: <strong>${response.latency_ms}ms</strong></span>
        </div>
      </div>
    `;

    resultsDiv.innerHTML = cardHtml + resultsDiv.innerHTML;
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};


// ---------------------------------------------------------------------------
// 2. Personal Learning Dashboard (studentDashboardPage)
// ---------------------------------------------------------------------------
const studentDashboardPage = {
  async render() {
    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `<div style="text-align: center; padding: 60px;"><span class="spinner" style="width: 32px; height: 32px;"></span><p style="margin-top: 16px; color: var(--text-muted);">Loading your learning profile...</p></div>`;

    try {
      const data = await api.getStudentDashboard();
      const alertBadge = data.alert_level === 'critical' ? 'badge-danger' : (data.alert_level === 'caution' ? 'badge-warning' : 'badge-success');

      pageContent.innerHTML = `
        <div class="animate-in" style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Welcome Banner -->
          <div style="background: linear-gradient(135deg, rgba(14, 116, 144, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="font-size: 12px; text-transform: uppercase; color: var(--cyan); font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px;">Student Learning Portal</div>
              <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0;">Welcome, ${data.name}!</h2>
              <p style="color: var(--text-secondary); margin: 6px 0 0 0; font-size: 14px;">Grade ${data.grade} • Primary Language: ${data.language.toUpperCase()}</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <span class="${alertBadge}" style="font-size: 13px; padding: 6px 14px; text-transform: capitalize;">
                Learning Habit: ${data.alert_level}
              </span>
              <button class="btn btn-primary" onclick="window.location.hash='student-tutor'">
                Ask AI Tutor 🚀
              </button>
            </div>
          </div>

          <!-- KPI Cards -->
          <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            <div class="metric-card">
              <div class="metric-label">Tutoring Sessions</div>
              <div class="metric-value" style="color: var(--cyan);">${data.total_sessions}</div>
              <div class="metric-subtext">Recorded educational interactions</div>
            </div>

            <div class="metric-card">
              <div class="metric-label">Avg Answer Quality</div>
              <div class="metric-value" style="color: var(--emerald);">${data.avg_quality}%</div>
              <div class="metric-subtext">Pedagogical clarity & accuracy</div>
            </div>

            <div class="metric-card">
              <div class="metric-label">Learning Progression</div>
              <div class="metric-value" style="color: var(--purple);">${data.avg_learning_score}%</div>
              <div class="metric-subtext">Bloom's taxonomy mastery</div>
            </div>

            <div class="metric-card">
              <div class="metric-label">Independence Score</div>
              <div class="metric-value" style="color: ${data.dependency_index > 0.5 ? 'var(--red)' : 'var(--cyan)'};">
                ${((1 - data.dependency_index) * 100).toFixed(0)}%
              </div>
              <div class="metric-subtext">Self-attempt vs solution reliance</div>
            </div>
          </div>

          <!-- Middle Split: Recent Sessions & Subjects Explored -->
          <div class="eval-grid" style="gap: 20px;">
            <!-- Recent Sessions -->
            <div class="eval-panel" style="padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0;">Recent Tutoring Sessions</h3>
                <a href="#student-history" style="color: var(--cyan); font-size: 12px; text-decoration: none;">View All &rarr;</a>
              </div>

              ${data.recent_sessions && data.recent_sessions.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  ${data.recent_sessions.slice(0, 5).map(s => `
                    <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px 14px;">
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span style="color: var(--cyan); font-weight: 600; text-transform: capitalize;">${s.subject}</span>
                        <span style="color: var(--text-muted);">${new Date(s.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div style="font-size: 13px; font-weight: 500; color: var(--text-primary); margin-bottom: 6px;">
                        ${studentTutorPage.escapeHtml(s.question)}
                      </div>
                      <div style="display: flex; gap: 14px; font-size: 11px; color: var(--text-muted);">
                        <span>Quality: <strong style="color: var(--emerald);">${s.quality_score}%</strong></span>
                        <span>Hallucination Risk: <strong style="color: ${s.hallucination_risk > 0.4 ? 'var(--red)' : 'var(--cyan)'};">${(s.hallucination_risk * 100).toFixed(0)}%</strong></span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <p style="color: var(--text-muted); font-size: 13px;">No tutoring sessions recorded yet. Start by asking a question!</p>
              `}
            </div>

            <!-- Subjects Explored -->
            <div class="eval-panel" style="padding: 20px;">
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px 0;">Subjects Explored</h3>
              ${data.subjects && data.subjects.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  ${data.subjects.map(subj => `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${subj.subject}</span>
                        <span style="color: var(--text-muted);">${subj.sessions} sessions • Avg Quality: <strong style="color: var(--cyan);">${subj.avg_quality}%</strong></span>
                      </div>
                      <div class="telemetry-bar" style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                        <div class="telemetry-bar-fill" style="width: ${subj.avg_quality}%; background: var(--cyan); height: 100%;"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <p style="color: var(--text-muted); font-size: 13px;">Explore subjects like Science, Math, or History with the AI tutor.</p>
              `}
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      pageContent.innerHTML = `
        <div style="padding: 30px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--red); border-radius: 8px; color: var(--red);">
          <h3>Error loading student dashboard</h3>
          <p>${err.message}</p>
        </div>
      `;
    }
  }
};


// ---------------------------------------------------------------------------
// 3. Learning History Page (studentHistoryPage)
// ---------------------------------------------------------------------------
const studentHistoryPage = {
  async render() {
    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `<div style="text-align: center; padding: 60px;"><span class="spinner" style="width: 32px; height: 32px;"></span><p style="margin-top: 16px; color: var(--text-muted);">Loading tutoring history...</p></div>`;

    try {
      const sessions = await api.getStudentSessions();

      pageContent.innerHTML = `
        <div class="animate-in" style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0;">My Tutoring History</h2>
              <p style="font-size: 13px; color: var(--text-muted); margin: 4px 0 0 0;">All your recorded Q&A sessions with Vexus AI Tutor (${sessions.length} total)</p>
            </div>
            <input type="text" id="history-search-input" class="form-input" placeholder="Search questions..." style="width: 240px; padding: 6px 12px; font-size: 13px;" />
          </div>

          <div class="eval-panel" style="padding: 0; overflow: hidden;">
            <div id="history-items-container" style="display: flex; flex-direction: column; divide-y: 1px solid var(--border-subtle);">
              ${sessions.length > 0 ? sessions.map(s => `
                <div class="history-item" style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <span class="badge-info" style="font-size: 11px; text-transform: uppercase;">${s.subject}</span>
                      <span style="font-size: 12px; color: var(--text-muted);">${new Date(s.timestamp).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; gap: 12px; font-size: 12px;">
                      <span>Quality: <strong style="color: var(--cyan); font-family: var(--font-mono);">${s.quality_score ? s.quality_score + '%' : 'N/A'}</strong></span>
                      <span>Risk: <strong style="color: ${s.hallucination_risk > 0.4 ? 'var(--red)' : 'var(--emerald)'}; font-family: var(--font-mono);">${s.hallucination_risk !== null ? (s.hallucination_risk * 100).toFixed(0) + '%' : '0%'}</strong></span>
                    </div>
                  </div>
                  <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">
                    Q: ${studentTutorPage.escapeHtml(s.question)}
                  </div>
                  <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; background: rgba(15, 23, 42, 0.3); padding: 10px 14px; border-radius: 6px; max-height: 120px; overflow-y: auto;">
                    ${studentTutorPage.escapeHtml(s.ai_response)}
                  </div>
                </div>
              `).join('') : `
                <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                  No tutoring sessions recorded yet. Start chatting in the AI Tutor workspace!
                </div>
              `}
            </div>
          </div>
        </div>
      `;

      // Search filter
      const searchInput = document.getElementById('history-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const val = e.target.value.toLowerCase();
          document.querySelectorAll('.history-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(val) ? 'flex' : 'none';
          });
        });
      }
    } catch (err) {
      pageContent.innerHTML = `<div style="padding: 24px; color: var(--red);">Error: ${err.message}</div>`;
    }
  }
};


// ---------------------------------------------------------------------------
// 4. Assessments Page (studentAssessmentsPage)
// ---------------------------------------------------------------------------
const studentAssessmentsPage = {
  async render() {
    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `<div style="text-align: center; padding: 60px;"><span class="spinner" style="width: 32px; height: 32px;"></span><p style="margin-top: 16px; color: var(--text-muted);">Loading assessments...</p></div>`;

    try {
      const assessments = await api.getStudentAssessments();
      const bloomLabels = {
        1: "Remembering",
        2: "Understanding",
        3: "Applying",
        4: "Analyzing",
        5: "Evaluating",
        6: "Creating"
      };

      pageContent.innerHTML = `
        <div class="animate-in" style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0;">Assessments & Practice Outcomes</h2>
            <p style="font-size: 13px; color: var(--text-muted); margin: 4px 0 0 0;">Evaluates knowledge acquisition from baseline (Pre-Test) to application and retention</p>
          </div>

          <div class="eval-panel" style="padding: 20px;">
            <table class="table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-subtle); text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase;">
                  <th style="padding: 10px;">Type</th>
                  <th style="padding: 10px;">Subject</th>
                  <th style="padding: 10px;">Score</th>
                  <th style="padding: 10px;">Bloom's Cognitive Level</th>
                  <th style="padding: 10px;">Date</th>
                </tr>
              </thead>
              <tbody>
                ${assessments.length > 0 ? assessments.map(a => `
                  <tr style="border-bottom: 1px solid var(--border-subtle); font-size: 13px;">
                    <td style="padding: 12px 10px;">
                      <span class="badge-${a.type === 'pre' ? 'info' : (a.type === 'post' ? 'success' : 'purple')}" style="text-transform: uppercase; font-size: 11px;">
                        ${a.type}-Test
                      </span>
                    </td>
                    <td style="padding: 12px 10px; font-weight: 600; color: var(--text-primary);">${a.subject}</td>
                    <td style="padding: 12px 10px; font-family: var(--font-mono); font-weight: 700; color: var(--cyan);">${a.score}%</td>
                    <td style="padding: 12px 10px;">
                      <span style="background: rgba(139, 92, 246, 0.15); color: var(--purple); padding: 3px 8px; border-radius: 4px; font-size: 12px;">
                        L${a.bloom_level}: ${bloomLabels[a.bloom_level] || 'Applied'}
                      </span>
                    </td>
                    <td style="padding: 12px 10px; color: var(--text-muted);">${new Date(a.timestamp).toLocaleDateString()}</td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--text-muted);">No assessments recorded.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      pageContent.innerHTML = `<div style="padding: 24px; color: var(--red);">Error: ${err.message}</div>`;
    }
  }
};


// ---------------------------------------------------------------------------
// 5. Settings & Profile Page (studentSettingsPage)
// ---------------------------------------------------------------------------
const studentSettingsPage = {
  async render() {
    const pageContent = document.getElementById('page-content');
    const user = api.getUser() || {};

    pageContent.innerHTML = `
      <div class="animate-in" style="max-width: 650px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0;">Student Account & Settings</h2>
          <p style="font-size: 13px; color: var(--text-muted); margin: 4px 0 0 0;">Manage your security credentials and learning preferences</p>
        </div>

        <!-- Account Profile Details -->
        <div class="eval-panel" style="padding: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-top: 0; margin-bottom: 16px;">Profile Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px;">
            <div>
              <label style="color: var(--text-muted); font-size: 12px;">Full Name</label>
              <div style="font-weight: 600; color: var(--text-primary); margin-top: 4px;">${user.student_name || 'N/A'}</div>
            </div>
            <div>
              <label style="color: var(--text-muted); font-size: 12px;">Username</label>
              <div style="font-weight: 600; color: var(--text-primary); margin-top: 4px; font-family: var(--font-mono);">${user.username || 'N/A'}</div>
            </div>
            <div>
              <label style="color: var(--text-muted); font-size: 12px;">Role</label>
              <div style="margin-top: 4px;"><span class="badge-info">STUDENT</span></div>
            </div>
            <div>
              <label style="color: var(--text-muted); font-size: 12px;">Account Status</label>
              <div style="margin-top: 4px;"><span class="badge-success">Active</span></div>
            </div>
          </div>
        </div>

        <!-- Change Password Form -->
        <div class="eval-panel" style="padding: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-top: 0; margin-bottom: 16px;">Update Password</h3>
          <form id="student-change-pwd-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div id="pwd-status-msg" style="display: none; padding: 10px; border-radius: 6px; font-size: 13px;"></div>
            <div>
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Current Password</label>
              <input type="password" id="curr-password" class="form-input" required autocomplete="current-password" />
            </div>
            <div>
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">New Password (min 6 characters)</label>
              <input type="password" id="new-password" class="form-input" required minlength="6" autocomplete="new-password" />
            </div>
            <button type="submit" class="btn btn-primary" id="pwd-submit-btn" style="align-self: flex-start; margin-top: 8px;">
              Update Password
            </button>
          </form>
        </div>
      </div>
    `;

    const form = document.getElementById('student-change-pwd-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const curr = document.getElementById('curr-password').value;
        const next = document.getElementById('new-password').value;
        const msgEl = document.getElementById('pwd-status-msg');
        const btn = document.getElementById('pwd-submit-btn');

        btn.disabled = true;
        btn.innerHTML = 'Updating...';

        try {
          await api.changePassword({ current_password: curr, new_password: next });
          msgEl.style.display = 'block';
          msgEl.style.background = 'rgba(16, 185, 129, 0.15)';
          msgEl.style.color = 'var(--emerald)';
          msgEl.textContent = 'Password updated successfully!';
          form.reset();
        } catch (err) {
          msgEl.style.display = 'block';
          msgEl.style.background = 'rgba(239, 68, 68, 0.15)';
          msgEl.style.color = 'var(--red)';
          msgEl.textContent = 'Error: ' + err.message;
        } finally {
          btn.disabled = false;
          btn.innerHTML = 'Update Password';
        }
      });
    }
  }
};
