const simulatorPage = {
  chatHistory: [],

  async render() {
    const pageContent = document.getElementById('page-content');
    
    pageContent.innerHTML = `
      <div class="eval-grid" style="height: calc(100vh - 120px); gap: 24px; padding-bottom: 24px;">
        <!-- LEFT: Chat Area -->
        <div class="eval-panel animate-in" style="display: flex; flex-direction: column; height: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Vexus Simulator
            </h2>
            <div style="display: flex; gap: 12px;">
              <select class="form-select" id="sim-subject" style="width: 140px; padding: 6px 12px;">
                <option value="mathematics">Mathematics</option>
                <option value="science">Science</option>
                <option value="engineering">Engineering</option>
                <option value="history">History</option>
                <option value="english">English Lit</option>
              </select>
              <select class="form-select" id="sim-grade" style="width: 110px; padding: 6px 12px;">
                ${[6, 7, 8, 9, 10, 11, 12].map(g => `<option value="${g}">Grade ${g}</option>`).join('')}
                <option value="13">College 1</option>
                <option value="14">College 2</option>
                <option value="15">College 3</option>
                <option value="16">College 4</option>
              </select>
            </div>
          </div>
          
          <div id="chat-messages" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding-right: 8px; margin-bottom: 16px;">
            <div class="chat-message tutor" style="display: flex; gap: 12px; align-items: flex-start; max-width: 85%;">
              <div class="chat-avatar" style="background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--cyan); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="16" height="16" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" stroke-width="2" stroke-linejoin="round"/><path d="M10 12L18 26L26 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 12L18 19L22 12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="12" r="2" fill="currentColor"/></svg>
              </div>
              <div class="chat-bubble" style="background: var(--bg-card); padding: 12px 16px; border-radius: 4px 16px 16px 16px; border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 14px; line-height: 1.5;">
                Hello! I am Vexus, your AI Tutor. What would you like to learn today?
              </div>
            </div>
          </div>

          <form id="chat-form" style="display: flex; gap: 12px;">
            <input type="text" id="chat-input" class="form-input" placeholder="Type your message as a student..." autocomplete="off" required style="flex: 1;" />
            <button type="submit" class="btn btn-primary" id="chat-send-btn">
              Send <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>

        <!-- RIGHT: Live Evaluation Panel -->
        <div class="eval-panel animate-in" id="sim-eval-panel" style="overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="font-size: 18px; font-weight: 600; color: var(--text-primary);">Live Evaluation</h2>
            <span class="badge-info" id="eval-status" style="display: none;">Analyzing...</span>
          </div>
          
          <div id="sim-eval-placeholder" style="display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; color: var(--text-muted); min-height: 300px; text-align: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <p style="font-size: 14px;">Chat with the tutor to see<br>real-time pedagogical evaluations.</p>
          </div>
          
          <div id="sim-eval-results"></div>
        </div>
      </div>
    `;

    this.setupListeners();
    this.chatHistory = []; // Reset on render
  },

  setupListeners() {
    const form = document.getElementById('chat-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.sendMessage();
      });
    }
  },

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    
    // Add student message
    this.appendMessage('user', message);
    
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px;"></span>';

    const subject = document.getElementById('sim-subject').value;
    const grade_level = parseInt(document.getElementById('sim-grade').value);

    // Add typing indicator
    const typingId = 'typing-' + Date.now();
    this.appendTypingIndicator(typingId);

    try {
      // Call API
      const response = await api.simulateChat({
        subject,
        grade_level,
        history: this.chatHistory,
        message
      });

      // Remove typing
      document.getElementById(typingId)?.remove();
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'Send <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

      // Add tutor response
      const tutorMessage = response.response;
      this.appendMessage('tutor', tutorMessage);
      
      // Update history
      this.chatHistory.push({ role: 'user', content: message });
      this.chatHistory.push({ role: 'tutor', content: tutorMessage });

      // Auto-evaluate this pair
      this.runLiveEvaluation(subject, grade_level, message, tutorMessage);
    } catch (err) {
      document.getElementById(typingId)?.remove();
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'Send <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
      
      // Show error in chat
      this.appendMessage('system', 'Error: ' + err.message);
    }
  },

  appendMessage(role, text) {
    const chatMessages = document.getElementById('chat-messages');
    
    let html = '';
    if (role === 'user') {
      html = `
        <div class="chat-message student" style="display: flex; gap: 12px; align-items: flex-start; max-width: 85%; align-self: flex-end;">
          <div class="chat-bubble" style="background: rgba(6, 182, 212, 0.15); padding: 12px 16px; border-radius: 16px 4px 16px 16px; border: 1px solid rgba(6, 182, 212, 0.3); color: var(--text-primary); font-size: 14px; line-height: 1.5;">
            ${this.escapeHtml(text)}
          </div>
          <div class="chat-avatar" style="background: var(--cyan); color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; font-weight: bold;">
            ST
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
        <div class="chat-message tutor" style="display: flex; gap: 12px; align-items: flex-start; max-width: 85%;">
          <div class="chat-avatar" style="background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--cyan); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="16" height="16" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" stroke-width="2" stroke-linejoin="round"/><path d="M10 12L18 26L26 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 12L18 19L22 12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="12" r="2" fill="currentColor"/></svg>
          </div>
          <div class="chat-bubble markdown-body" style="background: var(--bg-card); padding: 12px 16px; border-radius: 4px 16px 16px 16px; border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 14px; line-height: 1.5; width: 100%;">
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
    const chatMessages = document.getElementById('chat-messages');
    const html = `
      <div id="${id}" class="chat-message tutor" style="display: flex; gap: 12px; align-items: flex-start; max-width: 85%;">
        <div class="chat-avatar" style="background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--cyan); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg width="16" height="16" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" stroke-width="2" stroke-linejoin="round"/><path d="M10 12L18 26L26 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 12L18 19L22 12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="12" r="2" fill="currentColor"/></svg>
        </div>
        <div class="chat-bubble" style="background: var(--bg-card); padding: 12px 16px; border-radius: 4px 16px 16px 16px; border: 1px solid var(--border-subtle); display: flex; gap: 4px; align-items: center; height: 46px;">
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

  async runLiveEvaluation(subject, grade, question, response) {
    const statusEl = document.getElementById('eval-status');
    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.textContent = 'Evaluating...';
      statusEl.className = 'badge-warning';
    }

    const result = await api.evaluate({ 
      subject, 
      grade_level: parseInt(grade), 
      question, 
      ai_response: response 
    });

    if (statusEl) {
      statusEl.style.display = 'none';
    }

    // Hide placeholder
    const placeholder = document.getElementById('sim-eval-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Show results
    const resultsDiv = document.getElementById('sim-eval-results');
    const gradeClass = `grade-${result.overall_grade}`;

    const resultHtml = `
      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px; animation: slideIn 0.3s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
          <div style="font-size: 13px; color: var(--text-secondary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Q: ${this.escapeHtml(question)}</div>
          <div class="badge-grade ${gradeClass}" style="width: 32px; height: 32px; font-size: 16px; flex-shrink: 0;">${result.overall_grade}</div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div style="background: rgba(15, 23, 42, 0.4); padding: 8px 12px; border-radius: var(--radius-sm);">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Quality</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--cyan); font-family: var(--font-mono);">${result.overall_score}%</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.4); padding: 8px 12px; border-radius: var(--radius-sm);">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Hallu Risk</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--red); font-family: var(--font-mono);">${(result.hallucination.risk_score * 100).toFixed(0)}%</div>
          </div>
        </div>
        
        <div style="font-size: 12px; color: var(--text-muted);">
          Dependency: <span class="badge-${result.dependency.alert_level === 'high' ? 'critical' : result.dependency.alert_level === 'moderate' ? 'warning' : 'success'}" style="font-size: 10px; padding: 2px 6px;">${result.dependency.alert_level}</span>
        </div>
      </div>
    `;

    // Prepend so latest is on top
    resultsDiv.insertAdjacentHTML('afterbegin', resultHtml);
  },

  escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  },

  destroy() {
    // Cleanup if necessary
  }
};
