# Detailed Outline of the App: Lightweight Local Notion Clone (Google Sheets Dashboard GUI)

## Overview
App Name: Hospice Dashboard Clone.  
Goal: A simple, Notion-like GUI for managing hospice/EOL patient data from the Dashboard Clone.xlsx (synced to Google Sheets). Features include dashboards, search, note-taking with hyperlinks, and bi-directional sync for multi-device use (same Gmail). Lightweight to minimize errors/crashes: Vanilla JS core, poll-based sync. HIPAA-aware: Local run, no external storage beyond Sheets.

## Key Constraints
- Runs locally (browser/Electron desktop app).
- Sync: Bi-directional with Google Sheets (poll every 30s for live updates).
- Multi-Device: Works on 2+ computers via shared Sheets access.
- Simplicity: Minimal deps (e.g., Google APIs, Chart.js); offline-first with localStorage cache.
- Data: Sheets tabs match Excel + "Notes" and "DashboardData".

## High-Level Architecture
1. **Data Model (Google Sheets)**:
   - Tabs: Active, Past patient Outreach, Consulting Docs, Closed, Outstanding, Call Log.
   - Added Tabs:
     - Notes: Columns - EntityID (e.g., "Adam Jones"), NoteText, Hyperlink, Timestamp, User.
     - DashboardData: Formulas for aggregates (e.g., COUNT of active patients).
   - Keys: PatientName as primary for linking/search/notes.

2. **UI Components**:
   - Sidebar: Tabs for each sheet + Dashboard + Notes.
   - Search Bar: Fuzzy search across all data (e.g., "Adam Jones" shows card with Active details + notes).
   - Dashboard: Tables, charts (Chart.js: pie for areas, bar for TTS/TTD), metric cards (e.g., "Active: 10").
   - Entity View: Detailed page for patients/doctors/calls with related data and note editor.
   - Note Editor: Textarea with hyperlink insert; saves to Notes tab; displays clickable links.

3. **Core Features**:
   - **Dashboarding**: Render tables editable; charts from data (e.g., age histogram from DOB/Age).
   - **Search**: Query any field; results with previews + add note button.
   - **Notes**: Add to entities; support hyperlinks (e.g., Gmail); sync live.
   - **Editing**: Inline updates to Sheets data (validate types like dates).
   - **Sync**: Fetch on load/interval; push changes; handle conflicts via timestamps.

4. **Workflow Examples**:
   - Search "Clare Burd": Displays Active row + add note "Email link: [hyperlink]".
   - Dashboard: Chart ingestion locations; drill-down to sheets.
   - Multi-Device: Edit on one, see on another after sync.

5. **Development Phases**:
   - Phase 1: Setup/Auth (OAuth for Sheets).
   - Phase 2: Sync (read/write tabs; date conversion).
   - Phase 3: GUI (tabs, search, notes).
   - Phase 4: Dashboards (charts, aggregates).
   - Phase 5: Edit/Sync Polish.
   - Phase 6: Test (multi-device, errors).

6. **Challenges/Mitigations**:
   - Dates: Convert serial to JS Date.
   - Perf: Paginate large data.
   - Security: Local-only; UI reminders for secure use.






Project Outline: Lightweight Local Notion Clone (Google Sheets Dashboard GUI)
Overview
This project aims to create a simple, lightweight web-based application that acts as a "poor man's Notion/Salesforce" clone. It will run locally on multiple computers (e.g., via a browser-based GUI), sync data bi-directionally with Google Sheets for real-time collaboration, and provide dashboard views, search functionality, note-taking, and hyperlink insertion. The app will be designed for minimalism to reduce errors and crashes—focusing on core features without unnecessary complexity.

Key principles:

Local Execution: Runs in the browser or as a desktop app (e.g., using Electron for cross-platform compatibility on Windows/Mac/Linux).
Sync Mechanism: Uses Google Sheets as the backend database. All data (e.g., contacts, notes) is stored in sheets/tabs and synced via Google Apps Script or API.
Multi-User Support: Works on 2+ computers signed into the same Gmail account (for Google auth). Changes by one user update the sheet, enabling "live" sync for others (polling or real-time via Google APIs).
Lightweight Design: Avoid heavy frameworks; use vanilla JS/HTML/CSS or minimal libs like React for UI if needed. Prioritize simplicity for stability.
Core Features:
Dashboard: Visualize data from Google Sheets (e.g., tables, charts).
Search: Query names (e.g., "Stephen Clare") to pull up details like phone, email, etc.
Notes: Add shorthand notes, hyperlinks (e.g., to emails), stored in dedicated sheet tabs. Notes can reference beyond-sheet data (e.g., email links).
GUI: Intuitive interface like Notion—pages/tabs for views, inline editing, stay within app for note-taking on emails (e.g., hyperlink to Gmail threads).
Tech Stack:
Frontend: HTML/CSS/JS (or lightweight framework like Svelte/Vue for reactivity).
Backend/Sync: Google Sheets API (via OAuth for auth) or Apps Script for serverless ops.
Local Run: Serve via local server (e.g., Node.js/Express) or browser extensions; package as Electron app for desktop feel.
Libraries: Minimal—e.g., SheetJS for sheet parsing, Chart.js for dashboards, no heavy deps to keep it crash-free.
Constraints: No cloud hosting beyond Google Sheets; focus on offline-first with sync. Ensure notes/hyperlinks work across browsers signed into same Gmail (e.g., for opening Gmail links seamlessly).
High-Level Architecture
Data Model (Google Sheets Structure):
Main Sheet: "Contacts" tab – Columns: Name, Phone, Email, Address, etc. (e.g., row for "Stephen Clare").
Notes Sheet: "Notes" tab – Columns: LinkedTo (e.g., contact name or email ID), NoteText, Hyperlink, Timestamp, User.
Dashboard Data: Additional tabs for aggregated views (e.g., "Summary" with formulas).
Sync: App reads/writes via API; polls every 30s for changes or uses Google real-time API if feasible.
UI Components:
Dashboard View: Table/grid from Sheets data; simple charts (e.g., contact counts).
Search Bar: Fuzzy search across sheets; display results in a card/modal (e.g., "Stephen Clare: Phone - 123-456-7890").
Note Editor: Inline textarea for notes; button to insert hyperlinks (e.g., paste Gmail URL). Save updates sheet immediately.
Multi-Computer Sync: On load/interval, fetch latest from Sheets; on save, push to Sheets. Handle conflicts simply (e.g., last-write-wins).
Workflow Example:
User searches "Stephen Clare" → App queries Sheets → Displays details + associated notes.
User adds note: "Follow-up email: [hyperlink to Gmail]" → Saves to Notes tab.
On another computer (same Gmail login), app syncs and shows updated note.
Stay in app: Hyperlinks open in new tab, but note editing remains internal.
Development Phases:
Phase 1: Setup & Auth: Initialize project, handle Google OAuth for Sheets API.
Phase 2: Data Sync: Functions to read/write Sheets.
Phase 3: GUI Build: Dashboard, search, note editor.
Phase 4: Local Run & Packaging: Electron wrapper; test multi-device sync.
Phase 5: Polish & Test: Error handling, lightweight optimizations, cross-browser testing.
Potential Challenges & Mitigations:
Sync Conflicts: Use timestamps; notify users of changes.
Offline Support: Cache data locally (localStorage); sync on reconnect.
Security: Since same Gmail, rely on Google's auth; no custom user mgmt.
Performance: Limit to small datasets; avoid real-time if polling suffices.
Crashes/Errors: Use try-catch everywhere; log to console; keep code modular.
Cursor Rules File (.cursorrules)
Create a file named .cursorrules in the project root. This file provides project-specific guidelines for the AI (e.g., Claude in Cursor) to follow during code generation, refactoring, or suggestions. Copy-paste the following content into it:

text

Collapse

Wrap

Copy
# Project: Lightweight Local Notion Clone (Google Sheets Dashboard GUI)

## Core Guidelines
- Always prioritize simplicity: Use vanilla JS/HTML/CSS where possible. Only introduce libraries if essential (e.g., googleapis for Sheets API, Chart.js for dashboards). Avoid heavy frameworks like full React unless reactivity is critical—prefer Svelte or Vue if needed.
- Focus on lightweight code: Aim for minimal dependencies to reduce crashes. No unnecessary features; stick to outlined specs.
- Error Handling: Wrap all API calls and user interactions in try-catch. Log errors to console with clear messages. Handle offline scenarios gracefully (e.g., cache in localStorage).
- Modularity: Structure code in small files/modules (e.g., sync.js, ui.js, notes.js). Use ES6+ syntax.
- Testing: Suggest unit tests for key functions (e.g., sync logic) using Jest if added.
- Documentation: Add JSDoc comments to functions. Inline comments for complex logic.

## Tech Stack Constraints
- Frontend: HTML/CSS/JS primary; optional: Svelte/Vue for UI.
- Backend: Google Sheets API (Node.js/googleapis or browser-based).
- Local Server: Use Node.js/Express for dev; package with Electron for desktop.
- No Cloud: All runs locally; sync only via Google APIs.

## Feature-Specific Rules
- Sync: Bi-directional with Google Sheets. Poll every 30s; use timestamps for conflict resolution (last-write-wins).
- Search: Implement fuzzy search (e.g., via JS filter) on loaded data.
- Notes: Store in separate sheet tab; support hyperlink insertion (e.g., <a> tags in notes).
- Multi-Device: Assume same Gmail login; no custom auth.
- Dashboard: Simple tables/charts; pull from Sheets tabs.

## AI Interaction Style
- Be concise in suggestions: Provide code snippets directly.
- Explain changes: When refactoring, note why (e.g., "Simplified to reduce deps").
- Ask for clarification: If spec ambiguous, query user.
- Align with Outline: Reference the project outline document for all decisions.
Additional Details to Explain to the AI Model (e.g., Claude in Cursor)
When prompting the AI in Cursor (e.g., via chat or code completion), provide this context upfront to ensure alignment. You can copy this into your initial prompt:

"Project Context: We're building a lightweight Notion-like app that runs locally on browsers/computers, syncs with Google Sheets for data/notes, and acts as a simple CRM/dashboard. Users can search contacts (e.g., 'Stephen Clare' to show phone/etc.), add notes with hyperlinks (e.g., to emails), and view dashboards. It must work on multiple computers via same Gmail for sync—notes update live in Sheets for sharing.

Key Emphases:

Simplicity First: Minimal code to avoid bugs/crashes. Think 'poor man's Notion'—no bloat.
Data Flow: All persistent data in Google Sheets (tabs for contacts, notes). App is GUI layer.
Hyperlinks/Emails: Notes can include links to Gmail (open in new tab); keep users in app for editing.
Sync Details: Bi-directional; use Google Sheets API. Handle multi-user via sheet updates (no websockets—poll instead).
Local Run: Browser-based; optional Electron for desktop feel.
Outline Reference: Follow the provided project outline strictly. Use .cursorrules for guidelines.
Start by generating the initial project structure (e.g., index.html, app.js, sync.js) and setup instructions for Google API credentials."