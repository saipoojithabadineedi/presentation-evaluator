# Software Requirements Specification (SRS)
## For Presentation Evaluator — AI-Powered Speech & Presentation Evaluation Engine

**Version 1.0 Approved**  
**Prepared by:** Development Team  
**Organization:** Presentation Evaluator Project  
**Date Created:** September 28, 2026  

---

## Table of Contents
- [Revision History](#revision-history)
- [1. Introduction](#1-introduction)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Document Conventions](#12-document-conventions)
  - [1.3 Intended Audience and Reading Suggestions](#13-intended-audience-and-reading-suggestions)
  - [1.4 Product Scope](#14-product-scope)
  - [1.5 References](#15-references)
- [2. Overall Description](#2-overall-description)
  - [2.1 Product Perspective](#21-product-perspective)
  - [2.2 Product Functions](#22-product-functions)
  - [2.3 User Classes and Characteristics](#23-user-classes-and-characteristics)
  - [2.4 Operating Environment](#24-operating-environment)
  - [2.5 Design and Implementation Constraints](#25-design-and-implementation-constraints)
  - [2.6 User Documentation](#26-user-documentation)
  - [2.7 Assumptions and Dependencies](#27-assumptions-and-dependencies)
- [3. External Interface Requirements](#3-external-interface-requirements)
  - [3.1 User Interfaces](#31-user-interfaces)
  - [3.2 Hardware Interfaces](#32-hardware-interfaces)
  - [3.3 Software Interfaces](#33-software-interfaces)
  - [3.4 Communications Interfaces](#34-communications-interfaces)
- [4. System Features](#4-system-features)
  - [4.1 System Feature 1: Presentation Media Upload & Live Mic Recording](#41-system-feature-1-presentation-media-upload--live-mic-recording)
  - [4.2 System Feature 2: Multimodal Google Gemini LLM Analysis Engine](#42-system-feature-2-multimodal-google-gemini-llm-analysis-engine)
  - [4.3 System Feature 3: Web Audio API Real-Time Signal Processing & Cadence Analysis](#43-system-feature-3-web-audio-api-real-time-signal-processing--cadence-analysis)
  - [4.4 System Feature 4: User Authentication & Live OTP Password Verification](#44-system-feature-4-user-authentication--live-otp-password-verification)
  - [4.5 System Feature 5: Profile Dashboard & Performance Analytics](#45-system-feature-5-profile-dashboard--performance-analytics)
  - [4.6 System Feature 6: PDF Evaluation Report Generation & Export](#46-system-feature-6-pdf-evaluation-report-generation--export)
- [5. Other Nonfunctional Requirements](#5-other-nonfunctional-requirements)
  - [5.1 Performance Requirements](#51-performance-requirements)
  - [5.2 Safety Requirements](#52-safety-requirements)
  - [5.3 Security Requirements](#53-security-requirements)
  - [5.4 Software Quality Attributes](#54-software-quality-attributes)
  - [5.5 Business Rules](#55-business-rules)
- [6. Other Requirements](#6-other-requirements)
  - [Appendix A: Glossary](#appendix-a-glossary)
  - [Appendix B: Analysis Models](#appendix-b-analysis-models)
  - [Appendix C: To Be Determined List](#appendix-c-to-be-determined-list)

---

## Revision History

| Name | Date | Reason For Changes | Version |
| :--- | :--- | :--- | :--- |
| Core Development Team | Sep 17, 2026 | Initial System Specification & Audio Analyzer Engine | 0.1 |
| Core Development Team | Sep 21, 2026 | Added Gemini LLM Integration, Live OTP Dispatch & Pre-filled Auth | 0.9 |
| Core Development Team | Sep 28, 2026 | Finalized UI Layout (Dedicated Upload Page & Profile Dashboard) and Baseline Release | 1.0 |

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document describes the functional, nonfunctional, interface, and behavioral requirements for the **Presentation Evaluator** application, Version 1.0. Presentation Evaluator is a web application designed to analyze video, audio, and slide deck rehearsals using multimodal artificial intelligence (Google Gemini 1.5 Flash LLM) and Web Audio API real-time signal processing.

### 1.2 Document Conventions
- **High Priority (H):** Mandatory features required for core operation (e.g., file upload, Gemini LLM evaluation, user authentication, OTP verification).
- **Medium Priority (M):** Features enhancing user experience (e.g., live mic recorder, historical progress charts, theme toggle).
- **Low Priority (L):** Optional extensions (e.g., export to third-party LMS platforms).
- **Formatting:** Monospaced font (`code`) denotes API endpoints, file names, data models, or code parameters.

### 1.3 Intended Audience and Reading Suggestions
This document is intended for:
- **Software Engineers & Developers:** To implement system modules and API connections.
- **UI/UX Designers:** To align page layouts with specified user workflows.
- **Quality Assurance Testers:** To design test suites and verify software quality attributes.
- **Academic Evaluators & Project Stakeholders:** To assess software scope, architecture, and compliance.

### 1.4 Product Scope
Presentation Evaluator replaces manual speech coaching with an automated, objective evaluation suite. The software accepts video files (`.mp4`, `.mov`), audio files (`.wav`, `.mp3`), slide decks (`.pdf`, `.pptx`), or live microphone input, and calculates pitch clarity, pace cadence in words-per-minute (WPM), silence ratios, and filler word frequency ("um", "like", "actually"). It leverages Google Gemini LLM to generate executive feedback summaries, slide readability scores, and actionable delivery recommendations.

### 1.5 References
1. IEEE Std 830-1998, *IEEE Recommended Practice for Software Requirements Specifications*.
2. Karl E. Wiegers, *Software Requirements*, Microsoft Press, 1999.
3. Google Gemini API Documentation: `https://ai.google.dev/docs`
4. W3C Web Audio API Specification: `https://www.w3.org/TR/webaudio/`

---

## 2. Overall Description

### 2.1 Product Perspective
Presentation Evaluator is a self-contained, client-centric Single Page Application (SPA) built with React, TypeScript, and Vite, styled with TailwindCSS. It integrates with external REST services including Google Gemini 1.5 Flash API for AI reasoning, EmailJS and Spring Boot backend services for live OTP code dispatch, and browser local storage for persistent user sessions.

```
+-----------------------------------------------------------------------------------+
|                                 WEB BROWSER UI                                    |
|   +--------------------------+  +-------------------+  +----------------------+   |
|   | Upload File & Video Page |  | Profile Dashboard |  | Evaluation Report UI |   |
|   +--------------------------+  +-------------------+  +----------------------+   |
+----------------------------------------|------------------------------------------+
                                         |
            +----------------------------+----------------------------+
            |                            |                            |
            v                            v                            v
+-----------------------+    +-----------------------+    +-----------------------+
|  Web Audio Signal     |    |  Google Gemini 1.5    |    |  Live OTP Dispatch    |
|  Analyzer (Browser)   |    |  Flash LLM API        |    |  (EmailJS / Backend)  |
+-----------------------+    +-----------------------+    +-----------------------+
```

### 2.2 Product Functions
- **Direct Login Landing:** Upon successful login, users land on the dedicated **Upload File & Video Page** (`dashboard` view).
- **Multimodal Upload & Recording:** Upload presentation media or record speech live via browser microphone.
- **Real-Time Signal Extraction:** Compute RMS volume, pitch frequency, WPM speech rate, silence pause ratio, and filler word counts.
- **AI Neural Inference:** Pass metrics to Google Gemini 1.5 Flash LLM to produce overall delivery scores (70–98%), executive summaries, strengths, and improvements.
- **Profile Dashboard:** Accessible via the top-right profile button (`sweety`), rendering overall speaker tier, historical average WPM, filler word rates, Recharts performance trend graphs, and recent evaluation tables.
- **Secure Authentication & Live OTP:** Password reset workflows backed by live 6-digit OTP codes dispatched via Email/SMS channels.

### 2.3 User Classes and Characteristics
- **Student / Rehearsing Speaker:** Uses the system to practice pitch decks, keynote speeches, or academic presentations. Needs fast feedback and actionable pacing guidance.
- **Executive / Professional:** Seeks structured metric breakdowns (WPM, filler word rate, slide bullet density) and downloadable PDF evaluation reports.
- **System Administrator:** Oversees authentication rules, API key configurations, and telemetry standards.

### 2.4 Operating Environment
- **Client OS:** Cross-platform (Linux, Windows, macOS, Android, iOS).
- **Web Browsers:** Google Chrome (v110+), Mozilla Firefox (v110+), Apple Safari (v16+), Microsoft Edge (v110+).
- **Runtime Stack:** Node.js (v18+), React (v18+), Vite (v6+), TypeScript (v5+).

### 2.5 Design and Implementation Constraints
- **Client-Side Execution:** Signal processing must execute locally in the browser via Web Audio API without requiring mandatory cloud audio uploading.
- **API Key Fallback:** If `VITE_GEMINI_API_KEY` is not provided, the system must fallback gracefully to local neural inference rules without crashing.
- **UI Responsiveness:** Must support light/dark modes and render responsively on mobile, tablet, and desktop viewports.

### 2.6 User Documentation
The software provides in-app guidance cards, interactive tooltips, live speech coach recommendations, and modal notifications.

### 2.7 Assumptions and Dependencies
- User devices possess a functional audio input device (microphone) for live recording.
- Client browsers support ES2022 JavaScript syntax, Web Audio API (`AudioContext`), and `fetch` API.
- Internet connectivity is required to access Google Gemini LLM API and live OTP email dispatch services.

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- **Header Navigation Bar:** Contains brand logo (top left), light/dark mode toggle, "+ New Evaluation" CTA, profile badge (`sweety`), and logout button.
- **Upload File & Video Page (`dashboard`):** Main landing view post-login featuring drag-and-drop file upload, live mic controls, sample presets, title input, and "AI Analyze Presentation" button.
- **Profile Dashboard Page (`profile`):** Triggered by clicking the top-right profile badge, displaying user profile card, 4 KPI cards (Overall Score, Avg Cadence, Filler Word Rate, Total Rehearsals), Recharts growth trend graph, recent evaluations table, and side navigation menu.

### 3.2 Hardware Interfaces
- **Microphone Interface:** Standard audio capture interface via HTML5 `navigator.mediaDevices.getUserMedia({ audio: true })`.
- **Display Resolution:** Minimum resolution 360px (mobile) up to 4K desktop screens.

### 3.3 Software Interfaces
- **Google Gemini LLM API:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}`
- **EmailJS API:** `POST https://api.emailjs.com/api/v1.0/email/send` for client-side OTP email delivery.
- **Spring Boot Telephony Gateway:** `POST http://localhost:8080/api/v1/auth/send-otp` (optional local backend).

### 3.4 Communications Interfaces
- **HTTPS Protocol:** All external API requests use TLS/HTTPS encryption.
- **JSON Data Interchange:** Payloads sent and received use standard `application/json` formatting.

---

## 4. System Features

### 4.1 System Feature 1: Presentation Media Upload & Live Mic Recording
#### 4.1.1 Description and Priority
Allows users to upload presentation media (`.mp4`, `.mov`, `.wav`, `.mp3`, `.pdf`, `.pptx`) or record live speech via microphone. **Priority: High**.

#### 4.1.2 Stimulus/Response Sequences
1. User navigates to Upload File & Video Page (`dashboard` view).
2. User selects a file or clicks the live mic record icon.
3. System validates file format/size or starts live recording timer.
4. System updates selected file label and enables the "AI Analyze Presentation" button.

#### 4.1.3 Functional Requirements
- **REQ-1.1:** System shall accept files up to 200MB of format MP4, MOV, WAV, MP3, PDF, and PPTX.
- **REQ-1.2:** System shall provide live mic start/stop recording with real-time timer display (`MM:SS`).
- **REQ-1.3:** System shall pre-load sample preset presentations (Q3 Product Pitch, AI Pitch Deck, Series A Investor Deck) for instant testing.

### 4.2 System Feature 2: Multimodal Google Gemini LLM Analysis Engine
#### 4.2.1 Description and Priority
Sends presentation delivery metrics to Google Gemini 1.5 Flash LLM to obtain structured neural evaluation feedback. **Priority: High**.

#### 4.2.2 Stimulus/Response Sequences
1. User clicks "AI Analyze Presentation".
2. System triggers `analyzePresentationWithGeminiLLM()` with duration, WPM, clarity, and filler metrics.
3. System receives JSON response containing overall score, tier, executive summary, strengths, and pacing feedback.
4. System renders Evaluation Results View (`evaluation`).

#### 4.2.3 Functional Requirements
- **REQ-2.1:** System shall format Gemini API prompt requesting JSON response matching `GeminiLLMAnalysisResponse` schema.
- **REQ-2.2:** System shall fallback to internal deterministic scoring rules if API key is missing or network call fails.

### 4.3 System Feature 3: Web Audio API Real-Time Signal Processing & Cadence Analysis
#### 4.3.1 Description and Priority
Decodes raw audio buffers to calculate volume RMS, pitch stability, WPM pace, and filler word detection. **Priority: High**.

#### 4.3.2 Stimulus/Response Sequences
1. System receives audio buffer or live media stream.
2. `AudioContext` and `AnalyserNode` perform Fast Fourier Transform (FFT) analysis.
3. System extracts pitch frequency, silent pause ratios, and cadence WPM.

#### 4.3.3 Functional Requirements
- **REQ-3.1:** System shall calculate WPM cadence and benchmark against optimal speech range (125–150 WPM).
- **REQ-3.2:** System shall detect filler words ("um", "like", "actually", "you know") and calculate filler word rate percentage.

### 4.4 System Feature 4: User Authentication & Live OTP Password Verification
#### 4.4.1 Description and Priority
Manages user sign-in, credential auto-fill, and mandatory 6-digit OTP verification for password reset. **Priority: High**.

#### 4.4.2 Stimulus/Response Sequences
1. User clicks "Forgot Password?" on Login screen.
2. User enters registered Email or Phone number and clicks "Send OTP".
3. System dispatches a random 6-digit OTP via `sendLiveOtp()` service.
4. User must enter exact OTP code before system permits setting a new password.

#### 4.4.3 Functional Requirements
- **REQ-4.1:** System shall pre-fill previously registered email or phone credentials on the Login screen.
- **REQ-4.2:** System shall enforce mandatory 6-digit OTP code verification before password update.

### 4.5 System Feature 5: Profile Dashboard & Performance Analytics
#### 4.5.1 Description and Priority
Provides speaker overview, historical average WPM, filler word rates, Recharts performance trend graphs, and recent evaluations table. **Priority: Medium**.

#### 4.5.2 Stimulus/Response Sequences
1. User clicks top-right Profile badge (`sweety`) on Navbar.
2. System navigates to Profile Dashboard (`profile` view).
3. System displays left sidebar navigation hub alongside performance analytics.

#### 4.5.3 Functional Requirements
- **REQ-5.1:** System shall display 4 KPI metric cards (Overall Score %, Avg Cadence WPM, Filler Word Rate %, Total Rehearsals / Practice Hours).
- **REQ-5.2:** System shall render an interactive Recharts Area Chart displaying historical performance score progression.

### 4.6 System Feature 6: PDF Evaluation Report Generation & Export
#### 4.6.1 Description and Priority
Generates downloadable, printable PDF evaluation reports containing transcript breakdowns and score summaries. **Priority: Medium**.

#### 4.6.2 Stimulus/Response Sequences
1. User clicks "Export PDF Report" on Evaluation Result or Reports Archive view.
2. System compiles report graphics and triggers browser PDF print dialog.

#### 4.6.3 Functional Requirements
- **REQ-6.1:** System shall format PDF report including speaker name, title, date, metric breakdown, and executive summary.

---

## 5. Other Nonfunctional Requirements

### 5.1 Performance Requirements
- **Page Load Time:** Initial SPA load time shall be under 1.5 seconds on standard broadband connections.
- **AI Processing Latency:** Audio signal processing and Gemini LLM analysis combined shall complete within 3.5 seconds.
- **UI Frame Rate:** Smooth 60 FPS transitions during theme toggling and modal animations.

### 5.2 Safety Requirements
- User data shall be processed strictly within the active browser session.
- System shall prevent audio recording without explicit browser microphone permission.

### 5.3 Security Requirements
- **Data Privacy:** Presentation media files shall not be stored permanently on external servers without user consent.
- **Input Sanitization:** All text inputs (titles, search queries, credentials) shall be sanitized to prevent XSS attacks.
- **OTP Expiration:** Dispatched OTP verification codes shall expire after 5 minutes.

### 5.4 Software Quality Attributes
- **Usability:** Intuitive glassmorphic UI requiring zero prior training for new users.
- **Reliability:** 99.9% uptime for client-side evaluation logic via built-in offline fallbacks.
- **Maintainability:** Modular React component architecture adhering to strict TypeScript typing.
- **Portability:** Fully responsive layout adaptable across mobile, tablet, and desktop viewports.

### 5.5 Business Rules
- Only registered and authenticated users can view historical evaluation archives and PDF reports.
- Unauthenticated users attempting to access in-app views shall be redirected to the Landing Page.

---

## 6. Other Requirements

### Appendix A: Glossary
- **FFT (Fast Fourier Transform):** Algorithm used in Web Audio API to convert time-domain audio signals into frequency domain metrics.
- **WPM (Words Per Minute):** Standard measure of speech pacing.
- **LLM (Large Language Model):** Artificial intelligence model (Google Gemini 1.5 Flash) used for semantic evaluation.
- **OTP (One-Time Password):** A dynamic 6-digit security code used for identity verification.

### Appendix B: Analysis Models
#### Data Flow Diagram (DFD Level 1)

```
[ User ] --- (1. Upload Media / Record Mic) ---> [ Audio Signal Analyzer ]
                                                        |
                                                        v (Extract WPM, Pitch, Fillers)
                                            [ Gemini LLM Evaluation Service ]
                                                        |
                                                        v (Generate Score & Feedback)
[ User ] <--- (2. Render Evaluation & PDF) --- [ Evaluation Result View ]
```

### Appendix C: To Be Determined (TBD) List
1. Integration with enterprise Learning Management Systems (LMS) via LTI standard.
2. Automated real-time translation of speech transcripts into international languages.

---
*Document end — Presentation Evaluator SRS Version 1.0 approved.*
