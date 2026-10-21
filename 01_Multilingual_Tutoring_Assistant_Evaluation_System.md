# Problem Statement 1

## Design a Multilingual Tutoring Assistant Evaluation System

> **Domain:** EdTech · AI Safety · Learning Analytics  
> **Difficulty:** Advanced  
> **Team Size:** 3–5 members  
> **Duration:** 12–16 weeks  

---

## 1. Problem Background

AI-powered tutoring assistants (e.g., ChatGPT-based tutors, Duolingo Max, Khan Academy's Khanmigo) are rapidly being adopted in classrooms and self-study environments worldwide. These systems promise personalized, on-demand academic support across subjects and languages.

However, **no standardized evaluation framework exists** to continuously monitor whether these tutoring assistants are:

| Concern | Description |
|---|---|
| **Accurate** | Are the answers factually correct and pedagogically sound? |
| **Hallucination-Free** | Does the tutor fabricate facts, citations, or formulas? |
| **Non-Dependency-Inducing** | Are students learning to think, or becoming over-reliant on the AI? |
| **Effective** | Do students actually improve in measurable learning outcomes? |
| **Multilingual-Fair** | Is quality consistent across English, Hindi, Spanish, Arabic, etc.? |

This is a **critical real-world gap** — schools and universities are deploying AI tutors with no quality monitoring dashboard, no hallucination alerts, and no way to measure whether students are actually learning or just copy-pasting answers.

---

## 2. Problem Statement (Formal)

> **Design and develop a multilingual evaluation system that continuously monitors and scores AI tutoring assistants across four dimensions — answer quality, hallucination risk, student dependency level, and learning outcome effectiveness — providing real-time dashboards and alerts to educators and administrators.**

---

## 3. Real-World Industry Relevance

| Industry Player | Current Gap |
|---|---|
| **Khan Academy (Khanmigo)** | No public hallucination monitoring or dependency tracking |
| **Duolingo Max** | Limited to language learning; no cross-subject quality metrics |
| **Chegg / Course Hero** | Accused of enabling academic dishonesty; no dependency measurement |
| **University LMS Systems** | Integrating AI tutors without evaluation frameworks |
| **Government EdTech Programs** | India's DIKSHA, EU's AI Act — need compliance evaluation for AI in education |

### Why This Matters Now
- The **EU AI Act (2024)** classifies educational AI as "high-risk" requiring continuous monitoring
- India's **National Education Policy (NEP 2020)** promotes AI-assisted learning but lacks evaluation standards
- Studies show **40–60% of GPT-generated educational content contains subtle inaccuracies** in STEM subjects

---

## 4. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION LAYER                     │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Student   │  │ AI Tutor     │  │ Ground Truth           │ │
│  │ Queries   │  │ Responses    │  │ Knowledge Base         │ │
│  │ (multi-   │  │ (multi-      │  │ (textbooks, curricula, │ │
│  │  lingual) │  │  lingual)    │  │  verified answers)     │ │
│  └─────┬─────┘  └──────┬───────┘  └───────────┬────────────┘ │
│        │               │                      │              │
│        ▼               ▼                      ▼              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              EVALUATION ENGINE                          │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐  │ │
│  │  │ Answer      │ │ Hallucin-   │ │ Dependency        │  │ │
│  │  │ Quality     │ │ ation       │ │ Detector          │  │ │
│  │  │ Scorer      │ │ Detector    │ │                   │  │ │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘  │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐  │ │
│  │  │ Learning    │ │ Multilingual│ │ Pedagogical       │  │ │
│  │  │ Outcome     │ │ Parity      │ │ Alignment         │  │ │
│  │  │ Tracker     │ │ Analyzer    │ │ Checker           │  │ │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│        │               │                      │              │
│        ▼               ▼                      ▼              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           DASHBOARD & ALERT SYSTEM                      │ │
│  │  Real-time scores │ Trend analysis │ Risk alerts        │ │
│  │  Per-language reports │ Student progress │ Compliance   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Core Modules — Detailed Breakdown

### Module A: Answer Quality Scorer

**Objective:** Evaluate the correctness, completeness, and pedagogical value of AI tutor responses.

| Metric | How to Measure | Score Range |
|---|---|---|
| **Factual Accuracy** | Compare against verified knowledge base using semantic similarity + fact-checking | 0–100 |
| **Completeness** | Does the answer cover all parts of the question? (rubric-based) | 0–100 |
| **Clarity** | Readability score (Flesch-Kincaid adapted per language) + structure analysis | 0–100 |
| **Pedagogical Value** | Does it explain *why*, not just *what*? Does it use examples, analogies? | 0–100 |
| **Age Appropriateness** | Is the language suitable for the student's grade level? | Pass/Fail |

**Technical Approach:**
- Use embedding models (e.g., multilingual-e5, LaBSE) for semantic comparison
- Rule-based rubric engine for pedagogical scoring
- NLP readability analysis adapted for Hindi, Spanish, Arabic, etc.

---

### Module B: Hallucination Risk Detector

**Objective:** Identify when the AI tutor fabricates information, cites non-existent sources, or presents incorrect facts confidently.

| Hallucination Type | Example | Detection Method |
|---|---|---|
| **Factual Fabrication** | "The Pythagorean theorem was discovered in 1823" | Knowledge base cross-reference |
| **Citation Hallucination** | "According to Smith et al. (2019)..." (paper doesn't exist) | Citation verification API |
| **Formula Errors** | Incorrect mathematical derivations | Symbolic math verification (SymPy) |
| **Confident Uncertainty** | States uncertain facts with high confidence | Confidence calibration analysis |
| **Cross-lingual Drift** | Correct in English but mistranslated facts in Hindi | Parallel response comparison |

**Hallucination Risk Score:**

$$H_{risk} = \alpha \cdot F_{fabrication} + \beta \cdot C_{citation} + \gamma \cdot M_{math} + \delta \cdot D_{drift}$$

Where $\alpha + \beta + \gamma + \delta = 1$ (configurable weights per subject domain).

**Technical Approach:**
- Retrieval-Augmented Generation (RAG) based fact-checking
- SelfCheckGPT-style consistency checking (sample multiple responses)
- SymPy / Wolfram Alpha API for mathematical verification
- Cross-lingual parallel evaluation pipeline

---

### Module C: Student Dependency Analyzer

**Objective:** Measure whether students are developing independent thinking or becoming over-reliant on the AI tutor.

| Dependency Indicator | What It Signals | Measurement |
|---|---|---|
| **Query Frequency Spike** | Student asks AI before attempting anything | Queries per hour / per assignment |
| **Copy-Paste Ratio** | Student submits AI answer verbatim | Text similarity: submission vs. AI response |
| **Decreasing Self-Attempt Time** | Student spends less time thinking before asking | Time-to-first-query per problem |
| **Scaffolding Bypass** | Student asks for full solutions, skipping hints | Interaction pattern analysis |
| **Performance Without AI** | Test scores drop when AI is unavailable | Controlled A/B assessment comparison |

**Dependency Index (DI):**

$$DI = \frac{w_1 \cdot QF + w_2 \cdot CPR + w_3 \cdot (1 - SAT) + w_4 \cdot SB}{w_1 + w_2 + w_3 + w_4}$$

Where:
- $QF$ = Normalized Query Frequency
- $CPR$ = Copy-Paste Ratio
- $SAT$ = Self-Attempt Time (normalized)
- $SB$ = Scaffolding Bypass Rate

**Alert Levels:**
- 🟢 **Healthy (DI < 0.3):** Student uses AI as a learning aid
- 🟡 **Caution (0.3 ≤ DI < 0.6):** Increasing reliance detected
- 🔴 **Critical (DI ≥ 0.6):** Student is dependent; intervention recommended

---

### Module D: Learning Outcome Tracker

**Objective:** Measure whether AI-assisted tutoring actually improves student learning.

| Metric | Description | Data Source |
|---|---|---|
| **Pre/Post Assessment Gain** | Score improvement after AI tutoring sessions | Quiz / test scores |
| **Bloom's Taxonomy Progression** | Movement from recall → analysis → synthesis | Question complexity analysis |
| **Retention Rate** | Can students solve similar problems days/weeks later? | Spaced repetition testing |
| **Transfer Learning** | Can students apply concepts to new contexts? | Cross-topic problem solving |
| **Self-Efficacy Score** | Does the student feel more confident? | Periodic surveys (Likert scale) |

**Learning Effectiveness Score (LES):**

$$LES = 0.3 \cdot \Delta_{assessment} + 0.25 \cdot B_{progression} + 0.2 \cdot R_{retention} + 0.15 \cdot T_{transfer} + 0.1 \cdot S_{efficacy}$$

---

### Module E: Multilingual Parity Analyzer

**Objective:** Ensure the AI tutor provides equitable quality across all supported languages.

| Analysis Dimension | Method |
|---|---|
| **Quality Parity** | Compare Answer Quality Scores across languages for the same question |
| **Hallucination Parity** | Are hallucination rates higher in low-resource languages? |
| **Response Completeness** | Are Hindi/Arabic responses shorter or less detailed than English? |
| **Cultural Sensitivity** | Are examples culturally appropriate per region? |
| **Code-Switching Handling** | Can the tutor handle "Hinglish" or "Spanglish" inputs? |

**Parity Score:**

$$P_{lang} = 1 - \frac{|Q_{lang} - Q_{English}|}{Q_{English}}$$

Where $Q_{lang}$ is the quality score in the target language.

---

## 6. Technology Stack (Recommended)

| Layer | Technology Options |
|---|---|
| **Backend** | Python (FastAPI / Flask) or Node.js |
| **NLP / AI Models** | HuggingFace Transformers, OpenAI API, Google Gemini API |
| **Multilingual Embeddings** | multilingual-e5-large, LaBSE, SONAR |
| **Math Verification** | SymPy, Wolfram Alpha API |
| **Database** | PostgreSQL + Redis (caching) |
| **Dashboard** | React.js / Next.js with Chart.js or D3.js |
| **Real-Time Alerts** | WebSockets + Email/SMS notifications |
| **Deployment** | Docker + AWS/GCP or local server |
| **Languages Supported** | English, Hindi, Spanish, Arabic, French (extensible) |

---

## 7. Dataset Requirements

| Dataset | Purpose | Source |
|---|---|---|
| **Subject QA Pairs** | Ground truth for answer quality | NCERT, Khan Academy, OpenStax textbooks |
| **Hallucination Benchmarks** | Known incorrect AI outputs | HaluEval, TruthfulQA (adapted for education) |
| **Student Interaction Logs** | Dependency analysis training | Simulated or anonymized LMS data |
| **Multilingual QA** | Cross-language evaluation | XQuAD, MLQA, TyDi QA |
| **Assessment Scores** | Learning outcome tracking | Synthetic student performance data |

---

## 8. Key Deliverables

| # | Deliverable | Description |
|---|---|---|
| 1 | **Evaluation Engine** | Backend system with all 5 scoring modules |
| 2 | **Real-Time Dashboard** | Web-based UI showing scores, trends, and alerts |
| 3 | **Alert System** | Automated notifications for high hallucination risk or dependency |
| 4 | **Multilingual Report Generator** | PDF/CSV reports comparing quality across languages |
| 5 | **API Documentation** | RESTful API for integration with existing LMS systems |
| 6 | **Research Paper / Report** | Findings, methodology, and evaluation results |

---

## 9. Evaluation Criteria (For Grading)

| Criteria | Weight | Description |
|---|---|---|
| **Technical Implementation** | 30% | Code quality, architecture, working prototype |
| **Innovation** | 20% | Novel approaches to hallucination detection and dependency measurement |
| **Multilingual Coverage** | 15% | Support for 3+ languages with parity analysis |
| **Dashboard & UX** | 15% | Clean, informative, real-time visualization |
| **Documentation & Presentation** | 10% | Clear problem statement, methodology, results |
| **Real-World Applicability** | 10% | Can this be deployed in an actual school/university? |

---

## 10. Expected Challenges

| Challenge | Mitigation Strategy |
|---|---|
| Lack of labeled educational hallucination data | Create synthetic dataset + manual annotation |
| Multilingual NLP model limitations for low-resource languages | Use multilingual models + language-specific fine-tuning |
| Privacy concerns with student data | Use anonymized/synthetic data; follow FERPA/GDPR guidelines |
| Defining "good pedagogy" computationally | Collaborate with education experts for rubric design |
| Real-time processing latency | Batch processing for reports + streaming for critical alerts |

---

## 11. Stretch Goals (Optional Enhancements)

- 🎯 **Adaptive Difficulty Engine** — Recommend AI tutor difficulty adjustments based on learning outcomes
- 🎯 **Cheating Detection** — Flag students submitting AI responses as their own work
- 🎯 **Teacher Co-Pilot Mode** — Dashboard helps teachers identify struggling students
- 🎯 **Voice Input Evaluation** — Extend to spoken tutoring sessions (speech-to-text + evaluation)
- 🎯 **LLM Comparison Mode** — Compare GPT-4 vs. Gemini vs. Claude as tutors on the same questions

---

## 12. References & Reading

1. Ji, Z. et al. (2023). *Survey of Hallucination in Natural Language Generation.* ACM Computing Surveys.
2. Kasneci, E. et al. (2023). *ChatGPT for Good? On Opportunities and Challenges of LLMs for Education.* Learning and Individual Differences.
3. Bai, Y. et al. (2022). *Constitutional AI: Harmlessness from AI Feedback.* Anthropic.
4. EU AI Act (2024). *Classification of AI Systems in Education as High-Risk.*
5. Manakul, P. et al. (2023). *SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection.* EMNLP.
6. NCERT Curriculum Frameworks — *Subject-wise learning outcomes for K-12.*

---

> [!TIP]
> **Getting Started:** Begin with Module A (Answer Quality) and Module B (Hallucination Detection) for a minimum viable product. Add Dependency and Learning Outcome modules in subsequent sprints.

> [!IMPORTANT]
> **Ethics Note:** All student data must be anonymized. Follow institutional IRB (Institutional Review Board) guidelines if conducting studies with real students. Use synthetic data for development and testing.
