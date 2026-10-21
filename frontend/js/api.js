const API_BASE = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:8050';

// ==========================================
// DEMO DATA - Used when backend is unreachable
// ==========================================

const DEMO_STUDENTS = [
  {
    id: 'stu-001',
    name: 'Aarav Sharma',
    grade: 10,
    email: 'aarav.sharma@school.edu',
    avatar_color: '#06b6d4',
    avg_quality: 82.3,
    avg_hallucination_risk: 0.14,
    dependency_level: 0.22,
    avg_learning_score: 78.6,
    total_sessions: 38,
    status: 'active',
    last_active: new Date(Date.now() - 1 * 86400000).toISOString(),
    subjects: ['Mathematics', 'Science', 'English']
  },
  {
    id: 'stu-002',
    name: 'Priya Patel',
    grade: 9,
    email: 'priya.patel@school.edu',
    avatar_color: '#8b5cf6',
    avg_quality: 75.8,
    avg_hallucination_risk: 0.21,
    dependency_level: 0.38,
    avg_learning_score: 71.2,
    total_sessions: 29,
    status: 'active',
    last_active: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    subjects: ['Science', 'History', 'Geography']
  },
  {
    id: 'stu-003',
    name: 'Rahul Gupta',
    grade: 11,
    email: 'rahul.gupta@school.edu',
    avatar_color: '#f59e0b',
    avg_quality: 61.4,
    avg_hallucination_risk: 0.35,
    dependency_level: 0.58,
    avg_learning_score: 55.9,
    total_sessions: 42,
    status: 'at-risk',
    last_active: new Date(Date.now() - 3 * 86400000).toISOString(),
    subjects: ['Mathematics', 'Science', 'Economics']
  },
  {
    id: 'stu-004',
    name: 'Sneha Reddy',
    grade: 8,
    email: 'sneha.reddy@school.edu',
    avatar_color: '#10b981',
    avg_quality: 88.1,
    avg_hallucination_risk: 0.11,
    dependency_level: 0.18,
    avg_learning_score: 84.7,
    total_sessions: 35,
    status: 'active',
    last_active: new Date(Date.now() - 0.2 * 86400000).toISOString(),
    subjects: ['English', 'History', 'Science']
  },
  {
    id: 'stu-005',
    name: 'Arjun Kumar',
    grade: 12,
    email: 'arjun.kumar@school.edu',
    avatar_color: '#ef4444',
    avg_quality: 69.5,
    avg_hallucination_risk: 0.29,
    dependency_level: 0.45,
    avg_learning_score: 63.8,
    total_sessions: 22,
    status: 'improving',
    last_active: new Date(Date.now() - 2 * 86400000).toISOString(),
    subjects: ['Mathematics', 'Science', 'Geography']
  },
  {
    id: 'stu-006',
    name: 'Ananya Singh',
    grade: 7,
    email: 'ananya.singh@school.edu',
    avatar_color: '#8b5cf6',
    avg_quality: 79.2,
    avg_hallucination_risk: 0.18,
    dependency_level: 0.30,
    avg_learning_score: 75.1,
    total_sessions: 31,
    status: 'active',
    last_active: new Date(Date.now() - 1 * 86400000).toISOString(),
    subjects: ['Science', 'English', 'Mathematics']
  },
  {
    id: 'stu-007',
    name: 'Vivek Nair',
    grade: 10,
    email: 'vivek.nair@school.edu',
    avatar_color: '#06b6d4',
    avg_quality: 66.7,
    avg_hallucination_risk: 0.32,
    dependency_level: 0.52,
    avg_learning_score: 59.3,
    total_sessions: 18,
    status: 'at-risk',
    last_active: new Date(Date.now() - 5 * 86400000).toISOString(),
    subjects: ['History', 'Geography', 'English']
  },
  {
    id: 'stu-008',
    name: 'Meera Joshi',
    grade: 9,
    email: 'meera.joshi@school.edu',
    avatar_color: '#f59e0b',
    avg_quality: 85.4,
    avg_hallucination_risk: 0.12,
    dependency_level: 0.20,
    avg_learning_score: 81.3,
    total_sessions: 44,
    status: 'active',
    last_active: new Date(Date.now() - 0.8 * 86400000).toISOString(),
    subjects: ['Mathematics', 'Science', 'English']
  },
  {
    id: 'stu-009',
    name: 'Karthik Iyer',
    grade: 11,
    email: 'karthik.iyer@school.edu',
    avatar_color: '#10b981',
    avg_quality: 72.9,
    avg_hallucination_risk: 0.24,
    dependency_level: 0.35,
    avg_learning_score: 68.4,
    total_sessions: 27,
    status: 'improving',
    last_active: new Date(Date.now() - 1.5 * 86400000).toISOString(),
    subjects: ['Science', 'Mathematics', 'History']
  },
  {
    id: 'stu-010',
    name: 'Diya Mehta',
    grade: 6,
    email: 'diya.mehta@school.edu',
    avatar_color: '#ef4444',
    avg_quality: 63.1,
    avg_hallucination_risk: 0.38,
    dependency_level: 0.61,
    avg_learning_score: 57.2,
    total_sessions: 12,
    status: 'at-risk',
    last_active: new Date(Date.now() - 4 * 86400000).toISOString(),
    subjects: ['English', 'Science', 'Geography']
  },
  {
    id: 'stu-011',
    name: 'Rohan Verma',
    grade: 8,
    email: 'rohan.verma@school.edu',
    avatar_color: '#8b5cf6',
    avg_quality: 77.6,
    avg_hallucination_risk: 0.19,
    dependency_level: 0.28,
    avg_learning_score: 73.9,
    total_sessions: 33,
    status: 'active',
    last_active: new Date(Date.now() - 0.3 * 86400000).toISOString(),
    subjects: ['Mathematics', 'History', 'English']
  },
  {
    id: 'stu-012',
    name: 'Ishita Das',
    grade: 12,
    email: 'ishita.das@school.edu',
    avatar_color: '#06b6d4',
    avg_quality: 90.2,
    avg_hallucination_risk: 0.10,
    dependency_level: 0.15,
    avg_learning_score: 85.4,
    total_sessions: 45,
    status: 'active',
    last_active: new Date(Date.now() - 0.1 * 86400000).toISOString(),
    subjects: ['Science', 'Mathematics', 'Economics']
  },
  {
    id: 'stu-013',
    name: 'Aditya Rao',
    grade: 7,
    email: 'aditya.rao@school.edu',
    avatar_color: '#f59e0b',
    avg_quality: 68.3,
    avg_hallucination_risk: 0.27,
    dependency_level: 0.42,
    avg_learning_score: 62.5,
    total_sessions: 20,
    status: 'improving',
    last_active: new Date(Date.now() - 2.5 * 86400000).toISOString(),
    subjects: ['Geography', 'Science', 'History']
  },
  {
    id: 'stu-014',
    name: 'Kavya Pillai',
    grade: 10,
    email: 'kavya.pillai@school.edu',
    avatar_color: '#10b981',
    avg_quality: 81.7,
    avg_hallucination_risk: 0.16,
    dependency_level: 0.25,
    avg_learning_score: 77.8,
    total_sessions: 36,
    status: 'active',
    last_active: new Date(Date.now() - 0.7 * 86400000).toISOString(),
    subjects: ['English', 'Mathematics', 'Science']
  },
  {
    id: 'stu-015',
    name: 'Siddharth Bhat',
    grade: 11,
    email: 'siddharth.bhat@school.edu',
    avatar_color: '#ef4444',
    avg_quality: 64.9,
    avg_hallucination_risk: 0.33,
    dependency_level: 0.55,
    avg_learning_score: 58.1,
    total_sessions: 8,
    status: 'at-risk',
    last_active: new Date(Date.now() - 6 * 86400000).toISOString(),
    subjects: ['Science', 'History', 'Geography']
  }
];

const DEMO_DASHBOARD = {
  overview: {
    avg_quality: 74.2,
    avg_hallucination_risk: 0.23,
    avg_dependency: 0.35,
    avg_learning_score: 68.5,
    total_students: 15,
    total_evaluations: 342,
    quality_trend: 2.4,
    risk_trend: -0.03,
    dependency_trend: -0.02,
    learning_trend: 3.1
  },
  trends: {
    labels: [],
    quality: [],
    hallucination: [],
    dependency: [],
    learning: []
  },
  subject_performance: {
    labels: ['Mathematics', 'Science', 'History', 'English', 'Geography'],
    quality: [78, 72, 69, 81, 66],
    learning: [72, 68, 65, 75, 62]
  },
  score_distribution: {
    labels: ['Excellent (80+)', 'Good (60-79)', 'Average (40-59)', 'Poor (<40)'],
    values: [85, 142, 78, 37]
  }
};

// Generate realistic 30-day trend data
function generateTrendData() {
  const labels = [];
  const quality = [];
  const hallucination = [];
  const dependency = [];
  const learning = [];

  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    // Generate realistic fluctuating data with trends
    quality.push(Math.round((68 + (29 - i) * 0.4 + (Math.random() - 0.5) * 8) * 10) / 10);
    hallucination.push(Math.round((0.28 - (29 - i) * 0.002 + (Math.random() - 0.5) * 0.08) * 100) / 100);
    dependency.push(Math.round((0.36 + (Math.random() - 0.5) * 0.1) * 100) / 100);
    learning.push(Math.round((60 + (29 - i) * 0.5 + (Math.random() - 0.5) * 7) * 10) / 10);
  }

  DEMO_DASHBOARD.trends = { labels, quality, hallucination, dependency, learning };
}

// ==========================================
// DEMO ALERTS
// ==========================================

const DEMO_ALERTS = [];

function generateAlerts() {
  DEMO_ALERTS.length = 0;

  const criticalAlerts = [
    { module: 'hallucination', student_id: 'stu-001', student_name: 'Aarav Sharma', message: 'High hallucination risk (0.72) detected in Science response for Aarav Sharma' },
    { module: 'dependency', student_id: 'stu-010', student_name: 'Diya Mehta', message: 'Critical dependency level (0.81) — Diya Mehta is heavily reliant on AI hints in Mathematics' },
    { module: 'quality', student_id: 'stu-015', student_name: 'Siddharth Bhat', message: 'Response quality dropped below 40 for Siddharth Bhat in 3 consecutive History sessions' },
    { module: 'hallucination', student_id: 'stu-003', student_name: 'Rahul Gupta', message: 'Fabricated citation detected in Economics essay response for Rahul Gupta' },
    { module: 'learning', student_id: 'stu-007', student_name: 'Vivek Nair', message: 'Learning score regression: Vivek Nair dropped from 68 to 41 in Geography over 5 sessions' }
  ];

  const warningAlerts = [
    { module: 'dependency', student_id: 'stu-003', student_name: 'Rahul Gupta', message: 'Dependency index increased to 0.58 for Rahul Gupta in Mathematics' },
    { module: 'hallucination', student_id: 'stu-005', student_name: 'Arjun Kumar', message: 'Moderate hallucination risk (0.45) in Science — Arjun Kumar received partially incorrect explanation of thermodynamics' },
    { module: 'quality', student_id: 'stu-013', student_name: 'Aditya Rao', message: 'Response quality inconsistency: Aditya Rao scored 82 then 49 in consecutive Geography sessions' },
    { module: 'dependency', student_id: 'stu-007', student_name: 'Vivek Nair', message: 'Vivek Nair requested hints 8 times in a single History session — potential over-reliance' },
    { module: 'learning', student_id: 'stu-010', student_name: 'Diya Mehta', message: 'Bloom\'s taxonomy level stagnant at "Remembering" for Diya Mehta in English — no higher-order engagement in 10 sessions' },
    { module: 'hallucination', student_id: 'stu-009', student_name: 'Karthik Iyer', message: 'Unverified statistical claim detected in Karthik Iyer\'s Science session about climate data' },
    { module: 'quality', student_id: 'stu-002', student_name: 'Priya Patel', message: 'Pedagogy sub-score dropped to 52 for Priya Patel in History — responses lack scaffolding' },
    { module: 'dependency', student_id: 'stu-015', student_name: 'Siddharth Bhat', message: 'Self-correction rate is 0.12 for Siddharth Bhat — rarely attempts to fix mistakes independently' },
    { module: 'learning', student_id: 'stu-005', student_name: 'Arjun Kumar', message: 'Arjun Kumar\'s retention indicator dropped to 0.38 in Mathematics — previously learned concepts being forgotten' },
    { module: 'quality', student_id: 'stu-007', student_name: 'Vivek Nair', message: 'Completeness score averaged only 48 for Vivek Nair across last 5 English sessions' }
  ];

  const infoAlerts = [
    { module: 'learning', student_id: 'stu-006', student_name: 'Ananya Singh', message: 'Learning score improved by 12% for Ananya Singh in English Literature' },
    { module: 'quality', student_id: 'stu-012', student_name: 'Ishita Das', message: 'Ishita Das achieved a perfect quality score (100) in Mathematics — 3rd time this month' },
    { module: 'dependency', student_id: 'stu-004', student_name: 'Sneha Reddy', message: 'Dependency level decreased to 0.15 for Sneha Reddy — showing strong independent learning' },
    { module: 'learning', student_id: 'stu-014', student_name: 'Kavya Pillai', message: 'Kavya Pillai reached Bloom\'s "Evaluating" level in Science for the first time' },
    { module: 'hallucination', student_id: 'stu-008', student_name: 'Meera Joshi', message: 'Zero hallucination flags in last 10 sessions for Meera Joshi — excellent response accuracy' },
    { module: 'quality', student_id: 'stu-011', student_name: 'Rohan Verma', message: 'Rohan Verma\'s average quality score improved from 72 to 81 over the past two weeks' },
    { module: 'learning', student_id: 'stu-009', student_name: 'Karthik Iyer', message: 'Karthik Iyer demonstrated strong critical thinking in History debate session — score 88' },
    { module: 'dependency', student_id: 'stu-006', student_name: 'Ananya Singh', message: 'Ananya Singh\'s scaffolding ratio improved to 0.72 — using hints more strategically' },
    { module: 'quality', student_id: 'stu-014', student_name: 'Kavya Pillai', message: 'Kavya Pillai maintained quality scores above 80 for 7 consecutive sessions in English' },
    { module: 'learning', student_id: 'stu-011', student_name: 'Rohan Verma', message: 'Concept grasp score reached 85 for Rohan Verma in Mathematics — highest in class' }
  ];

  let alertId = 1;
  const now = Date.now();

  // Critical alerts — recent, within last 12 hours
  criticalAlerts.forEach((alert, i) => {
    DEMO_ALERTS.push({
      id: `alert-${String(alertId++).padStart(3, '0')}`,
      severity: 'critical',
      module: alert.module,
      message: alert.message,
      student_name: alert.student_name,
      student_id: alert.student_id,
      timestamp: new Date(now - (i * 2.4 + Math.random() * 2) * 3600000).toISOString(),
      resolved: i >= 3 // last 2 critical alerts resolved
    });
  });

  // Warning alerts — spread over last 24 hours
  warningAlerts.forEach((alert, i) => {
    DEMO_ALERTS.push({
      id: `alert-${String(alertId++).padStart(3, '0')}`,
      severity: 'warning',
      module: alert.module,
      message: alert.message,
      student_name: alert.student_name,
      student_id: alert.student_id,
      timestamp: new Date(now - (i * 2.4 + Math.random() * 3) * 3600000).toISOString(),
      resolved: i >= 7 // last 3 warning alerts resolved
    });
  });

  // Info alerts — spread over last 48 hours
  infoAlerts.forEach((alert, i) => {
    DEMO_ALERTS.push({
      id: `alert-${String(alertId++).padStart(3, '0')}`,
      severity: 'info',
      module: alert.module,
      message: alert.message,
      student_name: alert.student_name,
      student_id: alert.student_id,
      timestamp: new Date(now - (i * 4.8 + Math.random() * 5) * 3600000).toISOString(),
      resolved: i >= 6 // last 4 info alerts resolved
    });
  });

  // Sort all alerts by timestamp descending (most recent first)
  DEMO_ALERTS.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// ==========================================
// DEMO EVALUATION RESULT
// ==========================================

const DEMO_EVALUATION_RESULT = {
  overall_grade: 'B',
  overall_score: 73.5,
  quality: {
    overall: 76,
    sub_scores: {
      correctness: 82,
      completeness: 71,
      clarity: 78,
      relevance: 85,
      pedagogy: 64
    }
  },
  hallucination: {
    risk_score: 0.18,
    risk_level: 'low',
    flagged_claims: [
      { claim: 'The mitochondria produces 40 ATP molecules per glucose molecule', severity: 'minor', explanation: 'Theoretical maximum is 36-38 ATP' },
      { claim: 'Photosynthesis only occurs in green leaves', severity: 'minor', explanation: 'Photosynthesis can also occur in stems and other green parts of plants' }
    ]
  },
  dependency: {
    index: 0.32,
    alert_level: 'moderate',
    sub_scores: {
      scaffolding_ratio: 0.65,
      student_initiative: 0.58,
      hint_dependency: 0.28,
      self_correction_rate: 0.42
    }
  },
  learning: {
    score: 68,
    blooms_level: 3,
    blooms_label: 'Applying',
    sub_scores: {
      concept_grasp: 72,
      application_ability: 65,
      retention_indicator: 70,
      critical_thinking: 58
    }
  },
  recommendations: [
    'Increase Socratic questioning to promote independent thinking',
    'Add more real-world application examples for better concept retention',
    'Reduce direct answer provision — guide students to discover answers',
    'Include periodic review questions to strengthen retention',
    'Introduce higher-order thinking tasks (analysis, evaluation)'
  ]
};

// ==========================================
// STUDENT DETAIL GENERATOR
// ==========================================

function generateStudentDetail(studentId) {
  const student = DEMO_STUDENTS.find(s => s.id === studentId) || DEMO_STUDENTS[0];

  return {
    ...student,
    dependency_trend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
      value: Math.round((student.dependency_level + (Math.random() - 0.5) * 0.15) * 100) / 100
    })),
    assessment_comparison: {
      pre_test: Math.round(student.avg_quality * 0.7),
      post_test: Math.round(student.avg_quality * 1.05),
      retention: Math.round(student.avg_quality * 0.9)
    },
    recent_sessions: Array.from({ length: 8 }, (_, i) => ({
      id: `session-${studentId}-${i}`,
      question: [
        'What is photosynthesis?',
        'Explain Newton\'s laws',
        'Solve x² + 5x + 6 = 0',
        'What caused World War I?',
        'Explain the water cycle',
        'What is GDP?',
        'Describe cell division',
        'Explain gravity'
      ][i],
      subject: ['Science', 'Science', 'Mathematics', 'History', 'Geography', 'Economics', 'Science', 'Science'][i],
      quality_score: Math.round(60 + Math.random() * 30),
      risk_score: Math.round((0.1 + Math.random() * 0.3) * 100) / 100,
      date: new Date(Date.now() - i * 86400000 * 2).toISOString()
    }))
  };
}

// ==========================================
// API CLIENT - AUTHENTICATED & ROLE AWARE
// ==========================================

const api = {
  demoMode: false,

  // Auth state management
  getToken() {
    return localStorage.getItem('vexus_token');
  },

  setAuth(token, user) {
    if (token) localStorage.setItem('vexus_token', token);
    if (user) localStorage.setItem('vexus_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('vexus_token');
    localStorage.removeItem('vexus_user');
  },

  getUser() {
    const raw = localStorage.getItem('vexus_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  isAdmin() {
    return this.getRole() === 'admin';
  },

  isStudent() {
    return this.getRole() === 'student';
  },

  _getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async _handleResponse(response, endpoint) {
    if (!response.ok) {
      let errMsg = `HTTP ${response.status}`;
      try {
        const errData = await response.json();
        if (errData && errData.detail) errMsg = errData.detail;
      } catch (e) {}

      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('vexus:unauthorized', { detail: { endpoint } }));
      }

      // If explicit demo mode is on and server is offline, fallback
      if (this.demoMode) {
        console.warn(`[Demo Mode Fallback] API error (${endpoint}): ${errMsg}`);
        return this._getFallback(endpoint);
      }

      throw new Error(errMsg);
    }
    const data = await response.json();
    return this._normalizeResponse(endpoint, data);
  },

  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: this._getHeaders()
      });
      return await this._handleResponse(response, endpoint);
    } catch (error) {
      if (this.demoMode) {
        console.warn(`API unreachable (${endpoint}), using demo data:`, error.message);
        return this._getFallback(endpoint);
      }
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify(data)
      });
      return await this._handleResponse(response, endpoint);
    } catch (error) {
      if (this.demoMode) {
        console.warn(`API unreachable (${endpoint}), using demo data:`, error.message);
        return this._getFallback(endpoint);
      }
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: this._getHeaders(),
        body: data ? JSON.stringify(data) : undefined
      });
      return await this._handleResponse(response, endpoint);
    } catch (error) {
      if (this.demoMode) {
        return { success: true, message: 'Demo mode - action simulated' };
      }
      throw error;
    }
  },

  async patch(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PATCH',
        headers: this._getHeaders(),
        body: data ? JSON.stringify(data) : undefined
      });
      return await this._handleResponse(response, endpoint);
    } catch (error) {
      if (this.demoMode) {
        return { success: true, message: 'Demo mode - action simulated' };
      }
      throw error;
    }
  },

  _normalizeResponse(endpoint, data) {
    if (!data) return data;

    const normalizeStudent = (student) => {
      if (!student) return student;

      let status = student.status;
      if (!status && student.alert_level) {
        if (student.alert_level === 'critical') status = 'at-risk';
        else if (student.alert_level === 'caution') status = 'improving';
        else status = 'active';
      }

      let assessment_comparison = student.assessment_comparison;
      if (!assessment_comparison && student.assessments) {
        const pre = student.assessments.filter(a => a.assessment_type === 'pre');
        const post = student.assessments.filter(a => a.assessment_type === 'post');
        const ret = student.assessments.filter(a => a.assessment_type === 'retention');
        
        assessment_comparison = {
          pre_test: pre.length ? Math.round(pre.reduce((sum, a) => sum + a.score, 0) / pre.length) : 0,
          post_test: post.length ? Math.round(post.reduce((sum, a) => sum + a.score, 0) / post.length) : 0,
          retention: ret.length ? Math.round(ret.reduce((sum, a) => sum + a.score, 0) / ret.length) : 0
        };
      }

      let dependency_trend = student.dependency_trend;
      if (!dependency_trend && student.dependency_history) {
        dependency_trend = student.dependency_history.map(h => ({
          date: h.date,
          value: h.dependency_index
        }));
      }

      let recent_sessions = student.recent_sessions;
      if (!recent_sessions && student.sessions) {
        recent_sessions = student.sessions.map(s => ({
          id: s.id,
          question: s.question,
          subject: s.subject,
          quality_score: s.quality_score !== undefined ? s.quality_score : 70,
          risk_score: s.risk_score !== undefined ? s.risk_score : 0.2,
          date: s.timestamp || new Date().toISOString()
        }));
      }

      return {
        ...student,
        status: status || 'active',
        dependency_level: student.dependency_level !== undefined ? student.dependency_level : (student.dependency_index !== undefined ? student.dependency_index : 0.2),
        avg_learning_score: student.avg_learning_score !== undefined ? student.avg_learning_score : (student.learning_score !== undefined ? student.learning_score : 70),
        last_active: student.last_active || (student.sessions && student.sessions.length > 0 ? student.sessions[0].timestamp : new Date().toISOString()),
        assessment_comparison,
        dependency_trend,
        recent_sessions
      };
    };

    if (endpoint.match(/\/students\/[\w-]+/)) {
      return normalizeStudent(data);
    }
    if (endpoint.endsWith('/students')) {
      return Array.isArray(data) ? data.map(normalizeStudent) : data;
    }

    if (endpoint.includes('/evaluate')) {
      if (data.quality_score !== undefined) {
        return {
          overall_grade: data.overall_grade || 'C',
          overall_score: data.quality_score,
          quality: {
            overall: data.quality_score,
            sub_scores: data.quality_details ? {
              factual_accuracy: data.quality_details.factual_accuracy,
              completeness: data.quality_details.completeness,
              clarity: data.quality_details.clarity,
              pedagogical_value: data.quality_details.pedagogical_value,
              age_appropriateness: data.quality_details.age_appropriateness
            } : {}
          },
          hallucination: {
            risk_score: data.hallucination_risk,
            risk_level: data.hallucination_risk > 0.5 ? 'high' : (data.hallucination_risk > 0.2 ? 'medium' : 'low'),
            flagged_claims: (data.hallucination_details?.flagged_claims || []).map(claim => ({
              claim: claim,
              explanation: "Flagged by AI evaluation."
            }))
          },
          dependency: {
            index: data.dependency_index,
            alert_level: data.dependency_details?.alert_level || 'healthy',
            sub_scores: data.dependency_details ? {
              query_frequency: data.dependency_details.query_frequency,
              copy_paste_ratio: data.dependency_details.copy_paste_ratio,
              self_attempt_time: data.dependency_details.self_attempt_time,
              scaffolding_bypass: data.dependency_details.scaffolding_bypass
            } : {}
          },
          learning: {
            score: data.learning_score,
            blooms_level: Math.floor((data.learning_details?.bloom_progression || 30) / 16.7) || 1,
            blooms_label: 'Assessed',
            sub_scores: data.learning_details ? {
              assessment_gain: data.learning_details.assessment_gain,
              bloom_progression: data.learning_details.bloom_progression,
              retention_rate: data.learning_details.retention_rate
            } : {}
          },
          recommendations: data.recommendations || []
        };
      }
    }

    return data;
  },

  // Fallback routing for demo mode
  _getFallback(endpoint) {
    if (endpoint.includes('/dashboard/overview') || endpoint.includes('/admin/dashboard')) return DEMO_DASHBOARD.overview;
    if (endpoint.includes('/dashboard/trends')) return DEMO_DASHBOARD.trends;
    if (endpoint.includes('/dashboard/subjects')) return DEMO_DASHBOARD.subject_performance;
    if (endpoint.includes('/dashboard/distribution')) return DEMO_DASHBOARD.score_distribution;
    if (endpoint.match(/\/students\/[\w-]+/)) {
      const parts = endpoint.split('/');
      const id = parts[parts.length - 1];
      return generateStudentDetail(id);
    }
    if (endpoint.includes('/students')) return DEMO_STUDENTS;
    if (endpoint.includes('/alerts/history')) return DEMO_ALERTS;
    if (endpoint.includes('/alerts')) return DEMO_ALERTS.filter(a => !a.resolved);
    if (endpoint.includes('/evaluate')) return DEMO_EVALUATION_RESULT;
    return null;
  },

  // ----------------------------------------------------
  // Authentication Endpoints
  // ----------------------------------------------------
  async login(credentials) {
    const res = await this.post('/api/auth/login', credentials);
    if (res && res.session_token) {
      this.setAuth(res.session_token, {
        id: res.user_id,
        username: res.username,
        email: res.email,
        role: res.role,
        student_id: res.student_id,
        student_name: res.student_name
      });
    }
    return res;
  },

  async logout() {
    try {
      await this.post('/api/auth/logout', {});
    } catch (e) {
      console.warn("Logout request failed:", e);
    } finally {
      this.clearAuth();
      window.dispatchEvent(new CustomEvent('vexus:loggedout'));
    }
  },

  async getMe() {
    const user = await this.get('/api/auth/me');
    if (user) {
      const current = this.getUser() || {};
      this.setAuth(this.getToken(), { ...current, ...user });
    }
    return user;
  },

  async changePassword(data) {
    return this.post('/api/auth/change-password', data);
  },

  // ----------------------------------------------------
  // Student Portal Endpoints
  // ----------------------------------------------------
  async getStudentMe() {
    return this.get('/api/student/me');
  },

  async getStudentDashboard() {
    return this.get('/api/student/dashboard');
  },

  async getStudentSessions() {
    return this.get('/api/student/sessions');
  },

  async getStudentSession(sessionId) {
    return this.get(`/api/student/sessions/${sessionId}`);
  },

  async studentChat(data) {
    return this.post('/api/student/chat', data);
  },

  async getStudentAssessments() {
    return this.get('/api/student/assessments');
  },

  async getStudentProgress() {
    return this.get('/api/student/progress');
  },

  // ----------------------------------------------------
  // Admin Portal Endpoints
  // ----------------------------------------------------
  async getAdminDashboard() {
    return this.get('/api/admin/dashboard');
  },

  async getAdminStudents() {
    return this.get('/api/admin/students');
  },

  async createStudent(payload) {
    return this.post('/api/admin/students', payload);
  },

  async updateStudent(studentId, payload) {
    return this.patch(`/api/admin/students/${studentId}`, payload);
  },

  async resetStudentPassword(studentId, payload = {}) {
    return this.post(`/api/admin/students/${studentId}/reset-password`, payload);
  },

  async getAdminEvaluations(params = {}) {
    let url = '/api/admin/evaluations';
    const query = [];
    if (params.limit) query.push(`limit=${params.limit}`);
    if (params.skip) query.push(`skip=${params.skip}`);
    if (params.subject) query.push(`subject=${encodeURIComponent(params.subject)}`);
    if (query.length) url += `?${query.join('&')}`;
    return this.get(url);
  },

  async getAdminAlerts(resolved = null) {
    let url = '/api/admin/alerts';
    if (resolved !== null) url += `?resolved=${resolved}`;
    return this.get(url);
  },

  async resolveAdminAlert(alertId) {
    return this.put(`/api/admin/alerts/${alertId}/resolve`);
  },

  async getAdminAuditLogs() {
    return this.get('/api/admin/audit-logs');
  },

  // ----------------------------------------------------
  // Shared / Legacy Endpoints
  // ----------------------------------------------------
  async getDashboardOverview() { return this.get('/api/dashboard/overview'); },
  async getDashboardTrends() { return this.get('/api/dashboard/trends'); },
  async getSubjectPerformance() { return this.get('/api/dashboard/subjects'); },
  async getScoreDistribution() { return this.get('/api/dashboard/distribution'); },
  async getStudents() { return this.get('/api/students'); },
  async getStudent(id) { return this.get(`/api/students/${id}`); },
  async evaluate(data) { return this.post('/api/evaluate', data); },
  async simulateChat(data) { return this.post('/api/simulator/chat', data); },
  async getAlerts() { return this.get('/api/alerts'); },
  async getAlertHistory() { return this.get('/api/alerts/history'); },
  async resolveAlert(id) { return this.put(`/api/alerts/${id}/resolve`); },
  async getHealthStatus() { return this.get('/api/health'); },
  async runDiagnostics() { return this.post('/api/health/test', {}); }
};

// Initialize demo data on load
generateTrendData();
generateAlerts();

