import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def create_document():
    doc = Document()

    # Set page margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Title
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = title.add_run("VEXUS: AI-Powered Multilingual Tutoring & Evaluation Platform")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(14, 116, 144) # Cyan/Teal

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = subtitle.add_run("Complete System Architecture, Prediction Algorithms, and Technical Specification")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    def add_heading_1(text):
        h = doc.add_heading(level=1)
        run = h.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 41, 59)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
        return h

    def add_heading_2(text):
        h = doc.add_heading(level=2)
        run = h.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(14, 116, 144)
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(4)
        return h

    def add_para(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(4)
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = "Calibri"
            r_bold.font.size = Pt(11)
            r_bold.font.bold = True
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(11)
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(3)
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = "Calibri"
            r_bold.font.size = Pt(11)
            r_bold.font.bold = True
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(11)
        return p

    # --- SECTION 1 ---
    add_heading_1("1. Executive Summary & Core Purpose")
    add_para("Vexus is an enterprise-grade AI tutoring and evaluation platform designed to assess, audit, and enhance AI pedagogical assistants across five core dimensions:")
    add_bullet(" Measures factual accuracy, completeness, clarity, pedagogical framing, and age suitability.", "1. Answer Quality (Pedagogical Efficacy):")
    add_bullet(" Audits unverified claims, fabricated citations, faulty formulas, and uncalibrated confidence.", "2. Hallucination Risk (Factuality & Safety):")
    add_bullet(" Tracks over-reliance telemetry including query volume, copy-paste similarities, and scaffolding bypass.", "3. Student Dependency (Over-reliance Telemetry):")
    add_bullet(" Quantifies educational gain by comparing pre/post assessments, Bloom's cognitive levels, and retention.", "4. Learning Outcomes (Knowledge Progression & Retention):")
    add_bullet(" Ensures equitable tutoring quality and calibrated accuracy across multiple native languages.", "5. Multilingual Parity (Equitable Cross-Lingual Tutoring):")

    # --- SECTION 2 ---
    add_heading_1("2. End-to-End System Architecture & Data Flow")
    add_para("The system consists of a four-tier architecture designed for high throughput, caching efficiency, and fault tolerance:")
    add_bullet(" Built with vanilla HTML5, CSS3, JavaScript, and Chart.js. Delivers an executive dark-mode dashboard, single/batch evaluation interface, student learning profiles, live safety alerts feed, and an interactive AI tutor chat simulator.", "1. Client & Presentation Layer:")
    add_bullet(" High-performance asynchronous FastAPI service exposing RESTful JSON endpoints. Implements CORS middleware, static file serving, and background PPTX generation.", "2. Application & API Routing Layer:")
    add_bullet(" Houses the five dedicated Python evaluation modules, in-memory MD5 caching, deep translation pipeline, and Wikipedia reference grounding.", "3. Inference & Evaluation Engine:")
    add_bullet(" SQLite database (evaluations.db) with SQLAlchemy ORM, local domain knowledge base (knowledge_base.json), and Groq LLaMA 3.3 70B inference.", "4. Persistence & External Services:")

    # --- SECTION 3 ---
    add_heading_1("3. Data Lifecycle: Ingestion, Inference & Return")
    add_heading_2("3.1 Ingestion Flow")
    add_para("When a user submits a query or evaluation request:")
    add_bullet(" The frontend client validates the form fields and sends an asynchronous HTTP POST request to /api/evaluate or /api/simulator/chat.", "• Input Submission:")
    add_bullet(" langdetect detects the student's native language ISO code (e.g., 'hi', 'fr', 'es', 'en'). Non-English inputs are seamlessly translated to standard English via deep-translator.", "• Language Normalization:")
    add_bullet(" An MD5 hash of the request payload is checked against _EVAL_CACHE. If a match is found, cached metrics are returned instantly.", "• In-Memory Deduplication:")

    add_heading_2("3.2 Inference & Evaluation Execution")
    add_bullet(" If ground truth is omitted, the engine queries the Wikipedia API to retrieve top summary sentences for factual reference.", "• Dynamic Grounding:")
    add_bullet(" Evaluated concurrently via Groq LLaMA 3.3 70B using strict JSON-only schema outputs.", "• Quality & Hallucination Scoring:")
    add_bullet(" Calculated deterministically from student historical records, session timestamps, and pre/post/retention assessment scores in SQLite.", "• Telemetry & Learning Outcomes:")
    add_bullet(" If hallucination risk > 0.5 or dependency index ≥ 0.3, system alerts are triggered and stored in SQLite.", "• Alert Triggering:")

    add_heading_2("3.3 Return & Visualisation")
    add_para("The server serializes results into strongly-typed Pydantic response models. The frontend updates radar score charts, metric trend lines, A–F grade badges, and pedagogical recommendations in real time.")

    # --- SECTION 4 ---
    add_heading_1("4. Evaluation Modules & Mathematical Prediction Models")
    
    add_heading_2("Module 1: Answer Quality Scorer")
    add_para("Formula: Quality Score = (0.30 × Accuracy) + (0.25 × Completeness) + (0.20 × Clarity) + (0.15 × Pedagogical Value) + (0.10 × Age Appropriateness)")
    add_bullet(" Factual correctness compared against ground truth and domain knowledge.", "• Accuracy (30%):")
    add_bullet(" Breadth and depth covering all facets of the student query.", "• Completeness (25%):")
    add_bullet(" Easy to understand, structural elegance, and readability.", "• Clarity (20%):")
    add_bullet(" Pedagogical scaffolding, analogies, and intuitive conceptual explanations.", "• Pedagogical Value (15%):")
    add_bullet(" Vocabulary and cognitive suitability for the specified grade level.", "• Age Appropriateness (10%):")

    add_heading_2("Module 2: Hallucination Detector")
    add_para("Formula: Hallucination Risk = (0.40 × Fabrication) + (0.20 × Citation) + (0.20 × Formula) + (0.20 × Confidence)")
    add_bullet(" Risk of invented entities, historical dates, or unsupported claims.", "• Fabrication Score (40%):")
    add_bullet(" Risk of fake, non-existent, or distorted academic references.", "• Citation Score (20%):")
    add_bullet(" Mathematical, chemical, or logical syntax inaccuracies.", "• Formula Score (20%):")
    add_bullet(" Absolutist or uncalibrated language asserting uncertain/incorrect claims.", "• Confidence Score (20%):")

    add_heading_2("Module 3: Student Dependency Analyzer")
    add_para("Formula: Dependency Index = (0.25 × QF) + (0.30 × CPR) + (0.25 × SAT) + (0.20 × SB)")
    add_bullet(" Number of queries submitted within 24 hours (20+ queries = 1.0).", "• Query Frequency (QF, 25%):")
    add_bullet(" Jaccard similarity between consecutive AI responses to detect copy-pasting.", "• Copy-Paste Ratio (CPR, 30%):")
    add_bullet(" Time delta between sessions (< 2 min = 1.0; > 60 min = 0.0).", "• Self-Attempt Time (SAT, 25%):")
    add_bullet(" Ratio of direct answer requests vs. learning/explaining requests.", "• Scaffolding Bypass (SB, 20%):")

    add_heading_2("Module 4: Learning Outcomes Tracker")
    add_para("Formula: Learning Score = (0.40 × Assessment Gain) + (0.35 × Bloom Progression) + (0.25 × Retention Rate)")
    add_bullet(" Normalised improvement between Pre-Test and Post-Test scores.", "• Assessment Gain (40%):")
    add_bullet(" Average Bloom's Taxonomy cognitive level (1=Remembering to 6=Creating) mapped 0–100.", "• Bloom Progression (35%):")
    add_bullet(" Ratio of Retention Test score relative to Post-Test score.", "• Retention Rate (25%):")

    add_heading_2("Composite Evaluation Score & Letter Grade")
    add_para("Composite = (0.35 × Quality) + (0.25 × (1 - Hallucination Risk) × 100) + (0.15 × (1 - Dependency Index) × 100) + (0.25 × Learning Score)")
    add_bullet(" Grade A (90–100): Exemplary Tutoring Efficacy & High Student Independence.")
    add_bullet(" Grade B (80–89.9): High Pedagogical Quality with Low Safety Risks.")
    add_bullet(" Grade C (70–79.9): Satisfactory Performance; Minor Remediation Recommended.")
    add_bullet(" Grade D (60–69.9): Elevated Risk or Low Learning Gains Detected.")
    add_bullet(" Grade F (< 60): Critical Intervention Required.")

    # --- SECTION 5 ---
    add_heading_1("5. Complete Platform Features & Capabilities")
    
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'
    
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = "Feature Component"
    hdr_cells[1].text = "Technical Details & Capabilities"
    set_cell_background(hdr_cells[0], "0E7490")
    set_cell_background(hdr_cells[1], "0E7490")
    for cell in hdr_cells:
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)

    features = [
        ("Executive Dashboard", "Real-time aggregated KPIs, 30-day temporal trend charts, subject performance breakdown, score distribution histogram, and live safety alerts feed."),
        ("Interactive Evaluator", "Single and batch Q&A testing, automatic Wikipedia reference grounding, interactive radar breakdown, hallucination risk audits, and pedagogical action items."),
        ("AI Tutor Simulator", "Conversational tutoring powered by Groq LLaMA 3.3, grade-adaptive tone (Grades 1–12), Markdown formatting, and multilingual translation support."),
        ("Student Profiles", "Individual student tracking, alert badges (Healthy/Caution/Critical), 30-day longitudinal dependency charts, pre/post/retention bars, and session audit history."),
        ("Safety Alerts System", "Automated threshold triggers for hallucination and dependency spikes, multi-tier severity (Critical, Warning, Info), and single-click resolution workflow."),
        ("Presentation Generator", "On-demand dynamic PowerPoint presentation creation via python-pptx and instant download via /api/download-pptx endpoint.")
    ]

    for feat, desc in features:
        row = table.add_row()
        row.cells[0].text = feat
        row.cells[1].text = desc
        set_cell_background(row.cells[0], "F8FAFC")
        set_cell_background(row.cells[1], "FFFFFF")

    # --- SECTION 6 ---
    add_heading_1("6. API Endpoints Reference")
    api_table = doc.add_table(rows=1, cols=3)
    api_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    api_table.style = 'Table Grid'

    api_hdr = api_table.rows[0].cells
    api_hdr[0].text = "Method"
    api_hdr[1].text = "Endpoint"
    api_hdr[2].text = "Description"
    set_cell_background(api_hdr[0], "0E7490")
    set_cell_background(api_hdr[1], "0E7490")
    set_cell_background(api_hdr[2], "0E7490")
    for cell in api_hdr:
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)

    endpoints = [
        ("POST", "/api/evaluate", "Evaluates single Q&A response across all 4 modules."),
        ("POST", "/api/evaluate/batch", "Asynchronously evaluates batch of Q&A responses."),
        ("POST", "/api/simulator/chat", "Generates multilingual AI tutoring chat response."),
        ("GET", "/api/dashboard/overview", "Retrieves aggregate KPIs, trends, and recent alerts."),
        ("GET", "/api/dashboard/trends", "Retrieves 30-day metric time-series data."),
        ("GET", "/api/dashboard/subjects", "Retrieves subject-level performance metrics."),
        ("GET", "/api/dashboard/distribution", "Retrieves score distribution breakdown."),
        ("GET", "/api/students", "Lists all students with summary metrics."),
        ("GET", "/api/students/{id}", "Retrieves comprehensive student history and sessions."),
        ("GET", "/api/alerts", "Retrieves active unresolved safety alerts."),
        ("PUT", "/api/alerts/{id}/resolve", "Marks a specific alert as resolved."),
        ("GET", "/api/download-pptx", "Generates and downloads presentation PowerPoint.")
    ]

    for method, path, desc in endpoints:
        row = api_table.add_row()
        row.cells[0].text = method
        row.cells[1].text = path
        row.cells[2].text = desc
        set_cell_background(row.cells[0], "F1F5F9")
        set_cell_background(row.cells[1], "FFFFFF")
        set_cell_background(row.cells[2], "FFFFFF")

    # Output file
    output_path = r"d:\PROJECT\VEXUS\VEXUS_Complete_System_Documentation.docx"
    doc.save(output_path)
    print(f"Successfully created: {output_path}")

if __name__ == "__main__":
    create_document()
