// ============================================================
// Evaluation Page Module - EvalTutor
// Single evaluation form with detailed results display
// ============================================================

const evaluationPage = {
  charts: [],

  async render() {
    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
      <div class="eval-grid">
        <!-- LEFT: Input Form -->
        <div class="eval-panel animate-in">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 24px; color: var(--text-primary);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            New Evaluation
          </h2>
          <form id="eval-form">
            <div class="form-group">
              <label class="form-label" for="eval-subject">Subject</label>
              <select class="form-select" id="eval-subject" required>
                <option value="">Select Subject...</option>
                <option value="mathematics">Mathematics</option>
                <option value="science">Science</option>
                <option value="engineering">Engineering</option>
                <option value="history">History</option>
                <option value="english">English Literature</option>
                <option value="geography">Geography</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="eval-grade">Grade Level</label>
              <select class="form-select" id="eval-grade" required>
                <option value="">Select Grade...</option>
                ${[6, 7, 8, 9, 10, 11, 12].map(g => `<option value="${g}">Grade ${g}</option>`).join('')}
                <option value="13">College Year 1 (Freshman)</option>
                <option value="14">College Year 2 (Sophomore)</option>
                <option value="15">College Year 3 (Junior)</option>
                <option value="16">College Year 4 (Senior)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="eval-question">Student Question</label>
              <textarea class="form-textarea" id="eval-question" placeholder="Enter the student question..." required></textarea>
            </div>
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
                <label class="form-label" for="eval-response" style="margin-bottom: 0;">AI Tutor Response</label>
                <button type="button" class="btn" id="eval-auto-generate-btn" style="padding: 4px 10px; font-size: 12px; display: flex; align-items: center; gap: 4px; background: rgba(6, 182, 212, 0.1); color: var(--cyan); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 4px; cursor: pointer;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Auto-Generate
                </button>
              </div>
              <textarea class="form-textarea" id="eval-response" placeholder="Enter the AI tutor response to evaluate..." required style="min-height: 160px;"></textarea>
            </div>
            <div class="form-group">
              <div style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin-bottom: 8px;" id="ground-truth-toggle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="transition: transform 0.2s ease;"><polyline points="6 9 12 15 18 9"/></svg>
                <label class="form-label" style="margin-bottom: 0; cursor: pointer;">Ground Truth (Optional)</label>
              </div>
              <textarea class="form-textarea" id="eval-ground-truth" placeholder="Enter the correct/expected answer for comparison..." style="display: none; min-height: 100px;"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" id="eval-submit-btn" style="width: 100%; padding: 14px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Run Evaluation
            </button>
          </form>
        </div>

        <!-- RIGHT: Results Panel (hidden until evaluation runs) -->
        <div class="eval-panel animate-in" id="eval-results-panel" style="display: none;">
          <div id="eval-results"></div>
        </div>

        <!-- Placeholder when no results -->
        <div class="eval-panel animate-in" id="eval-placeholder" style="display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; color: var(--text-muted); min-height: 400px;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3;">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <p style="font-size: 16px;">Submit an evaluation to see results</p>
          <p style="font-size: 13px;">Fill in the form and click 'Run Evaluation'</p>
        </div>
      </div>
    `;

    // Setup event listeners
    this.setupListeners();
  },

  setupListeners() {
    // Ground truth toggle
    const toggle = document.getElementById('ground-truth-toggle');
    const groundTruth = document.getElementById('eval-ground-truth');
    if (toggle && groundTruth) {
      toggle.addEventListener('click', () => {
        const isHidden = groundTruth.style.display === 'none';
        groundTruth.style.display = isHidden ? 'block' : 'none';
        toggle.querySelector('svg').style.transform = isHidden ? 'rotate(180deg)' : '';
      });
    }

    // Form submit
    const form = document.getElementById('eval-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.runEvaluation();
      });
    }

    // Auto-generate
    const autoGenBtn = document.getElementById('eval-auto-generate-btn');
    if (autoGenBtn) {
      autoGenBtn.addEventListener('click', async () => {
        const subject = document.getElementById('eval-subject').value;
        const grade = document.getElementById('eval-grade').value;
        const question = document.getElementById('eval-question').value;

        if (!subject || !grade || !question) {
          alert('Please fill in Subject, Grade Level, and Student Question before auto-generating.');
          return;
        }

        autoGenBtn.disabled = true;
        autoGenBtn.innerHTML = '<span class="spinner" style="width: 12px; height: 12px;"></span> Generating...';
        autoGenBtn.style.opacity = '0.7';

        try {
          const result = await api.simulateChat({
            subject,
            grade_level: parseInt(grade),
            history: [],
            message: question
          });
          document.getElementById('eval-response').value = result.response;
        } catch (err) {
          alert('Failed to generate response. Please try again.');
        } finally {
          autoGenBtn.disabled = false;
          autoGenBtn.style.opacity = '1';
          autoGenBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Auto-Generate';
        }
      });
    }
  },

  async runEvaluation() {
    const btn = document.getElementById('eval-submit-btn');
    const subject = document.getElementById('eval-subject').value;
    const grade = document.getElementById('eval-grade').value;
    const question = document.getElementById('eval-question').value;
    const response = document.getElementById('eval-response').value;
    const groundTruth = document.getElementById('eval-ground-truth').value;

    // Validation (form required attributes handle basics)
    if (!subject || !grade || !question || !response) {
      return;
    }

    // Loading state
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Evaluating...';

    // Simulate processing delay for demo feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Call API
    const result = await api.evaluate({
      subject,
      grade_level: parseInt(grade),
      question,
      ai_response: response,
      ground_truth: groundTruth || null
    });

    // Reset button
    btn.disabled = false;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Run Evaluation`;

    // Show results
    this.showResults(result);
  },

  showResults(result) {
    // Hide placeholder, show results panel
    const placeholder = document.getElementById('eval-placeholder');
    const resultsPanel = document.getElementById('eval-results-panel');
    const resultsDiv = document.getElementById('eval-results');

    if (placeholder) placeholder.style.display = 'none';
    if (resultsPanel) resultsPanel.style.display = 'block';

    // Grade badge class
    const gradeClass = `grade-${result.overall_grade}`;

    resultsDiv.innerHTML = `
      <!-- Overall Grade Display -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: var(--text-primary);">Evaluation Results</h2>
        <div class="badge-grade ${gradeClass}" style="font-size: 32px; width: 72px; height: 72px; margin: 0 auto;">${result.overall_grade}</div>
        <div style="font-family: var(--font-mono); font-size: 14px; color: var(--text-secondary); margin-top: 8px;">Overall Score: ${result.overall_score}%</div>
      </div>

      <!-- Score Gauges Row -->
      <div class="result-gauges">
        <div class="score-gauge" id="gauge-quality"></div>
        <div class="score-gauge" id="gauge-hallucination"></div>
        <div class="score-gauge" id="gauge-dependency"></div>
        <div class="score-gauge" id="gauge-learning"></div>
      </div>

      <!-- Detailed Breakdowns -->

      <!-- Quality Analysis -->
      <div class="breakdown-section">
        <div class="breakdown-header" id="breakdown-quality-header">
          <span style="font-weight: 600; color: var(--text-primary);">📊 Quality Analysis</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="transition: transform 0.2s ease;"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="breakdown-content" id="breakdown-quality-content" style="display: none; padding-top: 12px;">
          ${Object.entries(result.quality.sub_scores).map(([key, val]) => `
            <div class="sub-score-bar">
              <span class="bar-label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              <div class="bar-track"><div class="bar-fill" style="width: 0%; background: var(--cyan);" data-width="${val}"></div></div>
              <span class="bar-value">${val}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Hallucination Check -->
      <div class="breakdown-section">
        <div class="breakdown-header" id="breakdown-hallucination-header">
          <span style="font-weight: 600; color: var(--text-primary);">⚠️ Hallucination Check</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="transition: transform 0.2s ease;"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="breakdown-content" id="breakdown-hallucination-content" style="display: none; padding-top: 12px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <span style="font-size: 13px; color: var(--text-secondary);">Risk Level:</span>
            <span class="badge-${result.hallucination.risk_level === 'high' ? 'critical' : result.hallucination.risk_level === 'medium' ? 'warning' : 'success'}">${result.hallucination.risk_level}</span>
            <span style="font-family: var(--font-mono); color: var(--text-primary);">${(result.hallucination.risk_score * 100).toFixed(0)}%</span>
          </div>
          ${result.hallucination.flagged_claims.length > 0 ? `
            <div style="margin-top: 8px;">
              <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Flagged Claims</div>
              ${result.hallucination.flagged_claims.map(claim => `
                <div style="background: var(--red-glow); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 8px; border-left: 3px solid var(--red);">
                  <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">"${claim.claim}"</div>
                  <div style="font-size: 12px; color: var(--text-muted);">${claim.explanation}</div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="font-size: 13px; color: var(--green);">✓ No flagged claims detected</p>'}
        </div>
      </div>

      <!-- Dependency Analysis -->
      <div class="breakdown-section">
        <div class="breakdown-header" id="breakdown-dependency-header">
          <span style="font-weight: 600; color: var(--text-primary);">🔗 Dependency Analysis</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="transition: transform 0.2s ease;"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="breakdown-content" id="breakdown-dependency-content" style="display: none; padding-top: 12px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <span style="font-size: 13px; color: var(--text-secondary);">Alert Level:</span>
            <span class="badge-${result.dependency.alert_level === 'high' ? 'critical' : result.dependency.alert_level === 'moderate' ? 'warning' : 'success'}">${result.dependency.alert_level}</span>
          </div>
          ${Object.entries(result.dependency.sub_scores).map(([key, val]) => `
            <div class="sub-score-bar">
              <span class="bar-label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              <div class="bar-track"><div class="bar-fill" style="width: 0%; background: var(--purple);" data-width="${val * 100}"></div></div>
              <span class="bar-value">${(val * 100).toFixed(0)}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Learning Assessment -->
      <div class="breakdown-section">
        <div class="breakdown-header" id="breakdown-learning-header">
          <span style="font-weight: 600; color: var(--text-primary);">🎓 Learning Assessment</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="transition: transform 0.2s ease;"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="breakdown-content" id="breakdown-learning-content" style="display: none; padding-top: 12px;">
          <div style="margin-bottom: 16px;">
            <span style="font-size: 13px; color: var(--text-secondary);">Bloom's Taxonomy Level:</span>
            <div class="blooms-indicator">
              ${['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map((level, i) => `
                <div class="blooms-level ${i < result.learning.blooms_level ? 'active' : ''}"
                     style="${i < result.learning.blooms_level ? `background: hsl(${160 + i * 30}, 70%, ${45 + i * 3}%);` : ''}"
                     title="${level}"></div>
              `).join('')}
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Level ${result.learning.blooms_level}: ${result.learning.blooms_label}</div>
          </div>
          ${Object.entries(result.learning.sub_scores).map(([key, val]) => `
            <div class="sub-score-bar">
              <span class="bar-label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              <div class="bar-track"><div class="bar-fill" style="width: 0%; background: var(--green);" data-width="${val}"></div></div>
              <span class="bar-value">${val}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recommendations -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-subtle);">
        <h3 style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">
          💡 Recommendations
        </h3>
        ${result.recommendations.map(rec => `
          <div class="recommendation-item">
            <span class="recommendation-icon">→</span>
            <span style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">${rec}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Initialize gauges and animations after DOM render
    setTimeout(() => {
      // Create gauge visualizations using hex colors (not CSS variables)
      const gaugeQuality = document.getElementById('gauge-quality');
      const gaugeHallu = document.getElementById('gauge-hallucination');
      const gaugeDep = document.getElementById('gauge-dependency');
      const gaugeLearning = document.getElementById('gauge-learning');

      if (gaugeQuality) chartUtils.createGauge(gaugeQuality, result.quality.overall, 100, chartUtils.colors.cyan, 'Quality');
      if (gaugeHallu) chartUtils.createGauge(gaugeHallu, result.hallucination.risk_score * 100, 100, chartUtils.colors.red, 'Hallu Risk');
      if (gaugeDep) chartUtils.createGauge(gaugeDep, result.dependency.index * 100, 100, chartUtils.colors.purple, 'Dependency');
      if (gaugeLearning) chartUtils.createGauge(gaugeLearning, result.learning.score, 100, chartUtils.colors.green, 'Learning');

      // Animate breakdown bars from 0 to target width
      document.querySelectorAll('.bar-fill').forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = width + '%'; }, 100);
      });

      // Setup breakdown section toggle listeners
      document.querySelectorAll('.breakdown-header').forEach(header => {
        header.addEventListener('click', () => {
          const content = header.nextElementSibling;
          const isVisible = content.style.display !== 'none';
          content.style.display = isVisible ? 'none' : 'block';
          header.querySelector('svg').style.transform = isVisible ? '' : 'rotate(180deg)';
        });
      });
    }, 100);
  },

  destroy() {
    this.charts.forEach(c => chartUtils.destroyChart(c));
    this.charts = [];
  }
};
