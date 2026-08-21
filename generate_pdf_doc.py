import subprocess
import os

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Presentation Evaluator - Technical Documentation (A to Z)</title>
    <style>
        @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
        }
        body {
            font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        .header-banner {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0369a1 100%);
            color: #ffffff;
            padding: 30px;
            border-radius: 16px;
            margin-bottom: 25px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .header-banner h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .header-banner p {
            margin: 5px 0;
            font-size: 14px;
            color: #cbd5e1;
        }
        .badge {
            display: inline-block;
            background-color: #0284c7;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }
        h2 {
            color: #0f172a;
            font-size: 20px;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 6px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h3 {
            color: #0369a1;
            font-size: 16px;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        p, li {
            font-size: 13px;
            color: #334155;
        }
        ul, ol {
            margin-top: 5px;
            padding-left: 20px;
        }
        li {
            margin-bottom: 6px;
        }
        .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 5px solid #0284c7;
            padding: 15px 18px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .tech-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 20px;
            font-size: 12px;
        }
        .tech-table th {
            background-color: #0f172a;
            color: #ffffff;
            text-align: left;
            padding: 10px 12px;
            font-weight: 700;
        }
        .tech-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        .tech-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .code-block {
            background-color: #0f172a;
            color: #38bdf8;
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            padding: 12px 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin-bottom: 15px;
            line-height: 1.4;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }
    </style>
</head>
<body>

    <!-- Header Banner -->
    <div class="header-banner">
        <span class="badge">Full Project Documentation (A to Z)</span>
        <h1>Presentation Evaluator - Technical Guide</h1>
        <p><strong>Application Type:</strong> AI-Powered Speech & Presentation Evaluation Platform</p>
        <p><strong>Team:</strong> Team Pro | Rajiv Gandhi University of Knowledge Technologies (RGUKT Ongole)</p>
        <p><strong>Architecture:</strong> React 18 (Frontend) + Java Spring Boot 3 (Backend) + PostgreSQL & pgvector (Database)</p>
    </div>

    <!-- Section 1: Executive Overview -->
    <h2>1. Executive Overview & Purpose</h2>
    <div class="card">
        <p><strong>Presentation Evaluator</strong> is an automated, AI-driven assessment system designed to help students, executives, and public speakers measure, refine, and master their communication and speech delivery skills.</p>
        <p>In traditional speech preparation, presenters lack objective, quantitative feedback regarding speech cadence (Words Per Minute), filler word frequency (e.g., 'um', 'uh', 'like'), slide visual structure, and delivery sentiment. This platform solves this challenge by analyzing uploaded presentation recordings or live microphone rehearsals and providing instant, data-driven feedback, interactive timeline charts, overall score badges, and exportable branded PDF executive reports.</p>
    </div>

    <!-- Section 2: Technology Stack Breakdown (A to Z) -->
    <h2>2. Technology Stack Breakdown (A to Z)</h2>
    <p>The following table provides a comprehensive overview of all frameworks, libraries, tools, and databases utilized across the full-stack architecture and their specific roles in the project:</p>
    
    <table class="tech-table">
        <thead>
            <tr>
                <th style="width: 25%;">Technology</th>
                <th style="width: 25%;">Category</th>
                <th style="width: 50%;">Function & Role in Project</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>React 18</strong></td>
                <td>Frontend UI Library</td>
                <td>Manages reactive UI rendering, component hierarchy, view switching, and stateful presentation interfaces.</td>
            </tr>
            <tr>
                <td><strong>TypeScript (TS)</strong></td>
                <td>Programming Language</td>
                <td>Enforces strict compile-time type safety across data interfaces (`types/index.ts`), props, and state definitions.</td>
            </tr>
            <tr>
                <td><strong>Vite 6</strong></td>
                <td>Build Tool & Dev Server</td>
                <td>Provides ultra-fast Hot Module Replacement (HMR) during development and generates optimized bundle assets.</td>
            </tr>
            <tr>
                <td><strong>Tailwind CSS 3</strong></td>
                <td>Styling Framework</td>
                <td>Powers the modern design system, glassmorphism cards, responsive layouts, and seamless Light/Dark theme switching.</td>
            </tr>
            <tr>
                <td><strong>Recharts</strong></td>
                <td>Data Visualization</td>
                <td>Renders interactive timeline graphs for Words Per Minute (WPM) cadence tracking and performance metric breakdowns.</td>
            </tr>
            <tr>
                <td><strong>jsPDF + html2canvas</strong></td>
                <td>PDF Document Engine</td>
                <td>Captures HTML report DOM elements and programmatically generates downloadable executive PDF documents on the client side.</td>
            </tr>
            <tr>
                <td><strong>Lucide React</strong></td>
                <td>UI Icon Library</td>
                <td>Provides lightweight, consistent vector icons for navigation hubs, metrics cards, and action controls.</td>
            </tr>
            <tr>
                <td><strong>Canvas Confetti</strong></td>
                <td>Visual Animations</td>
                <td>Triggers celebratory particle animations upon successful rehearsal analysis and report generation.</td>
            </tr>
            <tr>
                <td><strong>Java 21</strong></td>
                <td>Backend Language</td>
                <td>Provides modern, high-performance LTS Java execution runtime for backend business logic.</td>
            </tr>
            <tr>
                <td><strong>Spring Boot 3.3</strong></td>
                <td>Backend Framework</td>
                <td>Powers RESTful Web Services, Dependency Injection, Service Repositories, and Cross-Origin Resource Sharing (CORS).</td>
            </tr>
            <tr>
                <td><strong>Spring Data JPA</strong></td>
                <td>ORM Framework</td>
                <td>Handles Object-Relational Mapping, connecting Java domain entities to database tables with automated SQL execution.</td>
            </tr>
            <tr>
                <td><strong>PostgreSQL 16</strong></td>
                <td>Relational Database</td>
                <td>Stores structured relational data including user accounts, evaluation scores, metadata, and historical records.</td>
            </tr>
            <tr>
                <td><strong>pgvector Extension</strong></td>
                <td>Vector Database Engine</td>
                <td>Stores 1536-dimensional AI vector embeddings for transcript segments and performs native Cosine Similarity Search (`<=>`).</td>
            </tr>
        </tbody>
    </table>

    <!-- Section 3: Architecture & Workflow -->
    <h2>3. System Architecture & Processing Workflow</h2>
    <div class="card">
        <ol>
            <li><strong>Stage 1: Input Ingestion</strong>
                <ul>
                    <li>Users upload presentation files (.mp4 video, .wav/.mp3 audio, .pdf/.pptx slides) or record live speech directly via the built-in <strong>Live Mic Recording Hub</strong>.</li>
                </ul>
            </li>
            <li><strong>Stage 2: AI Processing Pipeline</strong>
                <ul>
                    <li><strong>Neural Audio Ingestion:</strong> Converts speech into structured text transcripts.</li>
                    <li><strong>Cadence Velocity Calculation:</strong> Measures speaking rate in Words Per Minute (WPM) across timestamps.</li>
                    <li><strong>Filler Word & Pause Classification:</strong> Categorizes filler words ('um', 'uh', 'like') and measures hesitation rates.</li>
                    <li><strong>Visual & Slide Scoring:</strong> Evaluates visual balance, readability, and bullet-point density.</li>
                </ul>
            </li>
            <li><strong>Stage 3: Output & Executive Report Synthesis</strong>
                <ul>
                    <li>Generates overall score badges (e.g., 92% - Top 5% speaker tier), Recharts pace charts, customized strengths and areas of improvement, and downloadable executive PDF reports.</li>
                </ul>
            </li>
        </ol>
    </div>

    <!-- Section 4: Directory Structure -->
    <h2>4. Complete Project Directory Structure</h2>
    <div class="code-block">
presentation-evaluator/
├── database/                     # Dedicated Database Module
│   ├── docker-compose.yml        # PostgreSQL 16 + pgvector container configuration
│   ├── schema.sql                # PostgreSQL DDL & pgvector HNSW index setup
│   └── README.md                 # Database setup and execution guide
├── src/                          # Frontend React Codebase
│   ├── components/               # React UI Components
│   │   ├── auth/                 # LoginForm.tsx, RegisterForm.tsx
│   │   ├── dashboard/            # Dashboard.tsx (Upload Hub & Control Panel)
│   │   ├── evaluation/           # EvaluationResultView.tsx (Charts & Feedback)
│   │   ├── landing/              # LandingPage.tsx
│   │   ├── layout/               # Navbar.tsx, Sidebar.tsx, Footer.tsx
│   │   ├── profile/              # ProfileDashboardView.tsx, SettingsView.tsx
│   │   └── reports/              # ReportPreviewModal.tsx (PDF Generation Engine)
│   ├── context/                  # AuthContext, EvaluationContext, ThemeContext
│   ├── services/                 # api.ts (Spring Boot API Connection Client)
│   ├── types/                    # index.ts (TypeScript Interfaces & Types)
│   └── utils/                    # mockData.ts
├── backend/                      # Backend Java Spring Boot Codebase
│   ├── src/main/java/com/presentation/evaluator/
│   │   ├── config/               # CorsConfig.java
│   │   ├── controller/           # AuthController, EvaluationController, VectorSearchController
│   │   ├── dto/                  # LoginRequest, RegisterRequest, AnalysisRequest
│   │   ├── entity/               # UserEntity, EvaluationEntity, TranscriptSegmentEntity
│   │   ├── repository/           # UserRepository, EvaluationRepository, TranscriptSegmentRepository (pgvector)
│   │   └── service/              # AuthService, EvaluationService, VectorSearchService
│   ├── src/main/resources/       # application.yml
│   └── pom.xml                   # Maven dependencies (Java 21, Spring Boot 3.3)
└── package.json                  # Frontend dependencies
    </div>

    <!-- Section 5: Execution Commands -->
    <h2>5. Execution Commands & Startup Guide</h2>
    <div class="card">
        <p><strong>1. Starting the Frontend Dev Server (React + Vite):</strong></p>
        <div class="code-block">
cd /home/kulayappa/Desktop/SE_Project/presentation-evaluator
npm run dev
# Server running at: http://localhost:5173
        </div>

        <p><strong>2. Starting the Backend Server (Java Spring Boot 3):</strong></p>
        <div class="code-block">
cd /home/kulayappa/Desktop/SE_Project/presentation-evaluator/backend
./mvnw spring-boot:run
# REST API running at: http://localhost:8080/api/v1
        </div>

        <p><strong>3. Starting PostgreSQL + pgvector Container:</strong></p>
        <div class="code-block">
cd /home/kulayappa/Desktop/SE_Project/presentation-evaluator/backend
docker compose up -d
# Database listening at: localhost:5432 (Database: presentation_db)
        </div>
    </div>

    <div class="footer">
        <p>© Presentation Evaluator - Developed by Team Pro | RGUKT Ongole</p>
        <p>Technical Documentation generated automatically. All rights reserved.</p>
    </div>

</body>
</html>
"""

html_filename = "/home/kulayappa/Desktop/SE_Project/presentation-evaluator/Presentation_Evaluator_Full_Documentation.html"
pdf_filename = "/home/kulayappa/Desktop/SE_Project/presentation-evaluator/Presentation_Evaluator_Full_Documentation.pdf"

with open(html_filename, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML document saved to {html_filename}")

# Convert HTML to PDF using LibreOffice
cmd = f"libreoffice --headless --convert-to pdf {html_filename} --outdir /home/kulayappa/Desktop/SE_Project/presentation-evaluator/"
res = subprocess.run(cmd, shell=True, capture_output=True, text=True)

if os.path.exists(pdf_filename):
    print(f"SUCCESS: English PDF generated and saved at {pdf_filename}")
else:
    print(f"Conversion log: {res.stdout} {res.stderr}")
