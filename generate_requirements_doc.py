import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_document():
    doc = docx.Document()

    # Set standard page margins (0.8 inches)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Color Palette Constants
    NAVY = RGBColor(9, 39, 61)       # #09273D Primary Brand
    INDIGO = RGBColor(79, 70, 229)   # #4F46E5 Accent
    EMERALD = RGBColor(16, 163, 74)  # #10B981 Success / Option A
    PURPLE = RGBColor(124, 58, 237)  # #7C3AED Option B
    DARK_TEXT = RGBColor(30, 41, 59) # #1E293B
    MUTED = RGBColor(100, 116, 139)  # #64748B

    # Header / Meta
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run_head = p_header.add_run("CITS WEEK 2026 • STI COLLEGE LAOAG • PROJECT EXHIBITION")
    run_head.font.name = "Arial"
    run_head.font.size = Pt(8.5)
    run_head.font.bold = True
    run_head.font.color.rgb = MUTED

    # Title Banner
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(2)
    run_title = p_title.add_run("CSIT Project Showcase & Web Hub\nStudent Submission Requirements & Checklist")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(14)
    run_sub = p_sub.add_run("Gabay at kumpletong listahan ng mga kailangang ihanda para sa pag-feature ng inyong Web Application o Mobile Application sa official exhibition portal ng CITS Week 2026.")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(11)
    run_sub.font.italic = True
    run_sub.font.color.rgb = MUTED

    # Callout Box: Overview
    callout = doc.add_table(rows=1, cols=1)
    callout.alignment = WD_TABLE_ALIGNMENT.CENTER
    callout.autofit = False
    callout.columns[0].width = Inches(6.9)
    cell = callout.cell(0, 0)
    set_cell_background(cell, "EEF2FF")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    p_call = cell.paragraphs[0]
    p_call.paragraph_format.space_after = Pt(0)
    r_call_title = p_call.add_run("📌 PAALALA PARA SA LAHAT NG THESIS AT CAPSTONE GROUPS:\n")
    r_call_title.font.name = "Arial"
    r_call_title.font.size = Pt(10)
    r_call_title.font.bold = True
    r_call_title.font.color.rgb = INDIGO

    r_call_body = p_call.add_run(
        "Ang template na ito ay hango sa structure ng opisyal na AgriGuard Project Showcase page. "
        "Dahil ito ay para sa CITS Week Tech Fair, bukas ang portal para sa parehong Mobile Applications (Android .apk) "
        "at Web Applications (Live Cloud Link o Local Booth Server). Punan ang bawat kategorya sa ibaba at i-submit sa inyong "
        "CITS Tech Committee bago ang exhibition deadline."
    )
    r_call_body.font.name = "Calibri"
    r_call_body.font.size = Pt(10)
    r_call_body.font.color.rgb = DARK_TEXT

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 1: General Project Identity
    def add_section_header(title, color_rgb):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(title)
        run.font.name = "Arial"
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = color_rgb

    add_section_header("1. General Project Identity & Basic Information", NAVY)

    # Table 1: Basic Info Checklist
    t1 = doc.add_table(rows=1, cols=3)
    t1.alignment = WD_TABLE_ALIGNMENT.CENTER
    t1.autofit = False
    widths1 = [Inches(0.6), Inches(2.2), Inches(4.1)]
    for i, w in enumerate(widths1):
        t1.columns[i].width = w

    hdr_cells1 = t1.rows[0].cells
    hdr_titles1 = ["Check", "Requirement Field", "Description & Gabay sa Paghahanda"]
    for i, title in enumerate(hdr_titles1):
        set_cell_background(hdr_cells1[i], "09273D")
        set_cell_margins(hdr_cells1[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells1[i].paragraphs[0]
        r = p.add_run(title)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    items1 = [
        ("[  ]", "Project Official Name", "Halimbawa: AgriGuard, MediTrack, EduBot. Ang opisyal na display name ng inyong system."),
        ("[  ]", "System Tagline / Punchline", "Isang maikling subtitle (10-15 salita). Hal: 'Smart Crop Protection & IoT Field Monitoring System'."),
        ("[  ]", "Full Academic Project Title", "Ang kumpletong aprubadong title sa inyong Title Defense Manuscript."),
        ("[  ]", "Degree Program & Course", "Lagyan ng tsek: [  ] BSCS (Thesis)    [  ] BSIT (Capstone Project)."),
        ("[  ]", "Research Track / Category", "Halimbawa: Agriculture & AI, Healthcare IoT, EdTech & Web AI, Computer Vision, Smart Campus."),
        ("[  ]", "Project Logo / App Icon", "Square 1:1 image (PNG o JPEG). Minimum 512x512 pixels. Malinis, walang blur, at may official branding ng inyong app.")
    ]

    for item in items1:
        row = t1.add_row()
        for i, val in enumerate(item):
            cell = row.cells[i]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            if i == 0:
                set_cell_background(cell, "F8FAFC")
                cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = DARK_TEXT

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Section 2: Platform Deliverable Selection (The Choice: Android APK vs Web App)
    add_section_header("2. Platform Deliverable Selection (Pumili ng isa o pareho)", INDIGO)

    p_choice_desc = doc.add_paragraph()
    p_choice_desc.paragraph_format.space_after = Pt(6)
    r_cd = p_choice_desc.add_run(
        "PUMILI KUNG PAANO MA-A-ACCESS NG MGA BISITA AT PANEL ANG INYONG PROYEKTO SA EXHIBIT. "
        "Maaaring Mobile Application (.apk), Web Application (Live Link), o Hybrid (parehong may APK at Web Portal):"
    )
    r_cd.font.name = "Calibri"
    r_cd.font.size = Pt(10)
    r_cd.font.bold = True
    r_cd.font.color.rgb = DARK_TEXT

    # Choice Table
    t_choice = doc.add_table(rows=1, cols=2)
    t_choice.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_choice.autofit = False
    t_choice.columns[0].width = Inches(3.45)
    t_choice.columns[1].width = Inches(3.45)

    c0 = t_choice.cell(0, 0)
    c1 = t_choice.cell(0, 1)
    set_cell_background(c0, "F0FDF4") # Light Green
    set_cell_background(c1, "F5F3FF") # Light Purple
    set_cell_margins(c0, top=140, bottom=140, left=160, right=160)
    set_cell_margins(c1, top=140, bottom=140, left=160, right=160)

    # Column 1: Option A (Android APK)
    p_c0 = c0.paragraphs[0]
    r_c0_t = p_c0.add_run("📱 OPTION A: ANDROID MOBILE APPLICATION\n(Tulad ng AgriGuard.apk)\n\n")
    r_c0_t.font.name = "Arial"
    r_c0_t.font.size = Pt(10)
    r_c0_t.font.bold = True
    r_c0_t.font.color.rgb = EMERALD

    r_c0_b = p_c0.add_run(
        "[  ] Compiled Android Package (.apk file)\n"
        "      • File name: YourApp.apk (Hal: AgriGuard.apk)\n"
        "      • File size: Maximum 100 MB\n"
        "[  ] Build Version: (Hal: v1.0.0 Stable Release)\n"
        "[  ] Minimum Android OS: (Hal: Android 8.0 Oreo+)\n"
        "[  ] Recommended RAM: (Hal: 2GB minimum / 4GB rec.)\n"
        "[  ] Free Storage Needed: (Hal: 100MB+ storage)\n"
        "[  ] Device Permissions Needed:\n"
        "      • Camera, Storage, Wi-Fi, o Bluetooth\n"
        "[  ] Installation Guide:\n"
        "      • Paalala kung paano i-enable ang 'Install Unknown Apps' sa Android settings."
    )
    r_c0_b.font.name = "Calibri"
    r_c0_b.font.size = Pt(9.5)
    r_c0_b.font.color.rgb = DARK_TEXT

    # Column 2: Option B (Web Application)
    p_c1 = c1.paragraphs[0]
    r_c1_t = p_c1.add_run("🌐 OPTION B: WEB APPLICATION / CLOUD PORTAL\n(Interactive Browser-Based System)\n\n")
    r_c1_t.font.name = "Arial"
    r_c1_t.font.size = Pt(10)
    r_c1_t.font.bold = True
    r_c1_t.font.color.rgb = PURPLE

    r_c1_b = p_c1.add_run(
        "[  ] Live Production Web Link / URL:\n"
        "      • Hal: https://yourproject.vercel.app\n"
        "      • O kaya: http://localhost / Booth IP (kung local server)\n"
        "[  ] Demo / Guest Testing Credentials:\n"
        "      • Username / Email: __________________\n"
        "      • Password: __________________\n"
        "[  ] Browser Compatibility:\n"
        "      • Google Chrome, Mozilla Firefox, Microsoft Edge, Safari\n"
        "[  ] Responsive Support:\n"
        "      • [  ] Mobile-Responsive (Pwedeng buksan sa phone)\n"
        "      • [  ] Desktop-Only (Para sa booth laptop/tablet)\n"
        "[  ] Deployment Platform:\n"
        "      • Vercel, Netlify, Render, Firebase, GitHub Pages, etc."
    )
    r_c1_b.font.name = "Calibri"
    r_c1_b.font.size = Pt(9.5)
    r_c1_b.font.color.rgb = DARK_TEXT

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 3: Visual Assets & Screenshots (The 5-Picture Rule)
    add_section_header("3. Visual Media & Screenshots Requirement (5 Screens)", NAVY)

    p_media = doc.add_paragraph()
    r_m = p_media.add_run(
        "Kagaya ng 5 screenshots (pic1.jpeg hanggang pic5.jpeg) sa AgriGuard download page, kailangan mag-provide ng 5 high-resolution captures na magpapakita sa daloy ng inyong system:"
    )
    r_m.font.name = "Calibri"
    r_m.font.size = Pt(10)
    r_m.font.color.rgb = DARK_TEXT

    t2 = doc.add_table(rows=1, cols=3)
    t2.alignment = WD_TABLE_ALIGNMENT.CENTER
    t2.autofit = False
    widths2 = [Inches(1.2), Inches(2.2), Inches(3.5)]
    for i, w in enumerate(widths2):
        t2.columns[i].width = w

    hdr_cells2 = t2.rows[0].cells
    hdr_titles2 = ["Asset Name", "Screen Focus / Subject", "Technical Specification"]
    for i, title in enumerate(hdr_titles2):
        set_cell_background(hdr_cells2[i], "09273D")
        set_cell_margins(hdr_cells2[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells2[i].paragraphs[0]
        r = p.add_run(title)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    items2 = [
        ("Screen 1 (pic1)", "Main Dashboard / Home Feed", "Overview ng pangunahing controls, status indicators, o initial landing interface."),
        ("Screen 2 (pic2)", "Core Feature #1 (Input/Scan/Detect)", "Ang unang aksyon ng user (Hal: Camera Bird Detector, Patient Registration, File Upload)."),
        ("Screen 3 (pic3)", "Core Feature #2 (Process/Alert/Action)", "Ang live processing o automatic reaction (Hal: Alarm Trigger, Sensor Alert, AI Result)."),
        ("Screen 4 (pic4)", "Data Logs & Analytics History", "Table ng detection events, history report, graph trend, o database records summary."),
        ("Screen 5 (pic5)", "Hardware Control / System Settings", "Interface para sa IoT settings, user account management, o hardware connection state.")
    ]

    for item in items2:
        row = t2.add_row()
        for i, val in enumerate(item):
            cell = row.cells[i]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = DARK_TEXT
            if i == 0:
                r.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 4: Narrative Description & 4-Step How It Works
    add_section_header("4. Project Descriptions & 'How It Works' Workflow", NAVY)

    p_desc_info = doc.add_paragraph()
    r_di = p_desc_info.add_run(
        "Kagaya ng 'How AgriGuard Works' (Detect → Alert → Record → Measure), ilarawan ang 4 na pangunahing hakbang kung paano gumagana ang inyong system:"
    )
    r_di.font.name = "Calibri"
    r_di.font.size = Pt(10)
    r_di.font.color.rgb = DARK_TEXT

    t3 = doc.add_table(rows=1, cols=3)
    t3.alignment = WD_TABLE_ALIGNMENT.CENTER
    t3.autofit = False
    widths3 = [Inches(1.0), Inches(2.0), Inches(3.9)]
    for i, w in enumerate(widths3):
        t3.columns[i].width = w

    hdr_cells3 = t3.rows[0].cells
    hdr_titles3 = ["Step #", "Workflow Title", "Detalyadong Paliwanag (1-2 Pangungusap)"]
    for i, title in enumerate(hdr_titles3):
        set_cell_background(hdr_cells3[i], "09273D")
        set_cell_margins(hdr_cells3[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells3[i].paragraphs[0]
        r = p.add_run(title)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    items3 = [
        ("Step 1", "Hal: 1. Detect (Input / Sensing)", "Paano kinukuha ng system ang input mula sa user, camera, o sensor."),
        ("Step 2", "Hal: 2. Alert (Action / Processing)", "Ano ang ginagawa ng software/hardware kapag natanggap ang input."),
        ("Step 3", "Hal: 3. Record (Storage / Telemetry)", "Paano sine-save ang datos sa database o ulap (cloud) para sa documentation."),
        ("Step 4", "Hal: 4. Measure (Output / Analytics)", "Ano ang benepisyong nakikita ng end-user (scores, graphs, reports, conclusions).")
    ]

    for item in items3:
        row = t3.add_row()
        for i, val in enumerate(item):
            cell = row.cells[i]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = DARK_TEXT
            if i == 0 or i == 1:
                r.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 5: Technical Specifications & Architecture
    add_section_header("5. Technical Stack & Hardware Architecture", NAVY)

    t4 = doc.add_table(rows=1, cols=2)
    t4.alignment = WD_TABLE_ALIGNMENT.CENTER
    t4.autofit = False
    widths4 = [Inches(2.5), Inches(4.4)]
    for i, w in enumerate(widths4):
        t4.columns[i].width = w

    hdr_cells4 = t4.rows[0].cells
    hdr_titles4 = ["Technical Layer", "Halimbawa mula sa AgriGuard & Inyong Ilalagay"]
    for i, title in enumerate(hdr_titles4):
        set_cell_background(hdr_cells4[i], "09273D")
        set_cell_margins(hdr_cells4[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells4[i].paragraphs[0]
        r = p.add_run(title)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    items4 = [
        ("Programming Languages", "Kotlin, Python, JavaScript, TypeScript, PHP, o Java."),
        ("Frameworks / Libraries", "OpenCV, YOLO, Flask API, React.js, Tailwind CSS, Express, TensorFlow Lite."),
        ("Database / Storage Layer", "SQLite, PostgreSQL, MySQL, Firebase Firestore, o MongoDB."),
        ("Hardware / IoT Components (Kung Mayroon)", "Raspberry Pi 4, ESP32, Arduino, Camera Module, Sensors, Buzzer/Speaker."),
        ("Cloud / API Services", "Google Gemini AI API, MQTT Broker, Vercel Serverless, Cloudinary, Twilio SMS.")
    ]

    for item in items4:
        row = t4.add_row()
        for i, val in enumerate(item):
            cell = row.cells[i]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = DARK_TEXT
            if i == 0:
                r.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 6: Research & Development Team Directory
    add_section_header("6. Research Team Members & Roles (Para sa Team Cards)", NAVY)

    t5 = doc.add_table(rows=1, cols=3)
    t5.alignment = WD_TABLE_ALIGNMENT.CENTER
    t5.autofit = False
    widths5 = [Inches(1.8), Inches(2.2), Inches(2.9)]
    for i, w in enumerate(widths5):
        t5.columns[i].width = w

    hdr_cells5 = t5.rows[0].cells
    hdr_titles5 = ["Team Role Halimbawa", "Pangalan ng Miyembro", "Partikular na Responsibilidad"]
    for i, title in enumerate(hdr_titles5):
        set_cell_background(hdr_cells5[i], "09273D")
        set_cell_margins(hdr_cells5[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells5[i].paragraphs[0]
        r = p.add_run(title)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    items5 = [
        ("Project Lead / System Integrator", "Jaymar Budduan (Halimbawa)", "Overall system integration, software pipeline & architecture."),
        ("Documentation / Technical Writer", "Lencher Marcos (Halimbawa)", "Manuscript, technical specifications, and user manuals."),
        ("System Evaluator / QA Tester", "Justine Felipe (Halimbawa)", "System evaluation metrics, test cases, and accuracy audits."),
        ("Hardware & Field Testing", "Ahronne Jian Pinera (Halimbawa)", "Physical setup, circuit wiring, and live agricultural tests.")
    ]

    for item in items5:
        row = t5.add_row()
        for i, val in enumerate(item):
            cell = row.cells[i]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = DARK_TEXT
            if i == 0:
                r.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 7: Frequently Asked Questions (FAQ)
    add_section_header("7. Frequently Asked Questions (FAQ) Section", NAVY)

    p_faq = doc.add_paragraph()
    r_faq = p_faq.add_run(
        "Maghanda ng 3 hanggang 4 na karaniwang itinatanong ng mga panelist, guro, at kapwa estudyante tungkol sa inyong system (halimbawa mula sa AgriGuard FAQ):"
    )
    r_faq.font.name = "Calibri"
    r_faq.font.size = Pt(10)
    r_faq.font.color.rgb = DARK_TEXT

    faq_box = doc.add_table(rows=1, cols=1)
    faq_box.alignment = WD_TABLE_ALIGNMENT.CENTER
    faq_box.autofit = False
    faq_box.columns[0].width = Inches(6.9)
    faq_cell = faq_box.cell(0, 0)
    set_cell_background(faq_cell, "F8FAFC")
    set_cell_margins(faq_cell, top=120, bottom=120, left=160, right=160)

    p_fc = faq_cell.paragraphs[0]
    p_fc.paragraph_format.space_after = Pt(0)
    r_fc = p_fc.add_run(
        "Q1: Ano ang pangunahing suliranin na nilulutas ng inyong application / web system?\n"
        "      A1: [Isulat ang inyong sagot dito]\n\n"
        "Q2: Paano nakikipag-ugnayan ang software sa hardware o backend server?\n"
        "      A2: [Isulat ang inyong sagot dito]\n\n"
        "Q3: Gumagana ba ito offline o kailangan ng koneksyon sa internet?\n"
        "      A3: [Isulat ang inyong sagot dito]\n\n"
        "Q4: Sino ang mga direktang makikinabang o gagamit ng inyong inobasyon?\n"
        "      A4: [Isulat ang inyong sagot dito]"
    )
    r_fc.font.name = "Calibri"
    r_fc.font.size = Pt(9.5)
    r_fc.font.color.rgb = DARK_TEXT

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Footer note
    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_ft = p_foot.add_run("Computing & Information Technology Society (CITS) • STI College Laoag • 2026 Tech Expo")
    r_ft.font.name = "Arial"
    r_ft.font.size = Pt(8.5)
    r_ft.font.bold = True
    r_ft.font.color.rgb = MUTED

    output_path = r"c:\Users\User\Downloads\web_download\CITS_Week_Project_Submission_Requirements.docx"
    doc.save(output_path)
    print("SUCCESS: Document created at", output_path)

if __name__ == "__main__":
    create_document()
