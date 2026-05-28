# 🔐 KRA AI Network Incident Assistant

> An AI-powered internal tool that helps Kenya Revenue Authority (KRA) ICT teams diagnose and resolve VPN and network incidents faster — replacing manual log analysis with intelligent, automated recommendations.

---

## 📌 Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Team & Roles](#team--roles)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

KRA operates critical digital infrastructure — iTax, Customs, internal email, and staff portals — all accessed through a secure VPN network. When the network goes down, ICT staff manually sift through dense router and firewall logs to find the root cause. This takes 30–60 minutes per incident and requires deep networking expertise.

The **KRA AI Network Incident Assistant** cuts that time down to under a minute by using AI to read logs, identify issues, and suggest precise fixes — all through a clean, intuitive dashboard.

---

## The Problem

When KRA staff cannot access iTax, Customs, email, or secure applications, the ICT team must manually troubleshoot:

- VPN tunnel failures
- DNS resolution errors
- Expired SSL/TLS certificates
- Firewall rules silently blocking traffic
- MTU mismatches causing packet fragmentation
- Dead Peer Detection (DPD) failures on IPSec tunnels

This process is slow, repetitive, and heavily dependent on individual expertise.

---

## Our Solution

A web-based internal tool with four core capabilities:

1. **Log Analyzer** — paste or upload any router/firewall log and receive a structured AI diagnosis in seconds
2. **AI Chat Assistant** — ask questions about any network incident in plain English and get step-by-step technical guidance
3. **VPN Tunnel Dashboard** — real-time health monitor for all active tunnels with status, latency, and uptime
4. **Live Alert Feed** — network events streamed and ranked by severity (Critical / Warning / Info)

---

## Features

| Feature | Description |
|---|---|
| 🔍 Log Analysis | Upload or paste firewall/router logs for instant AI-powered diagnosis |
| 🤖 AI Assistant | Conversational incident support with KRA network context built in |
| 📡 Tunnel Monitor | Live status dashboard for all VPN tunnels |
| 🚨 Alert Feed | Real-time severity-ranked network events |
| 📜 Cert Expiry Detection | Flags certificates nearing expiry before they cause outages |
| 🌐 DNS Failure Detection | Identifies SERVFAIL events and suggests DNS fixes |
| 🧱 Firewall Block Detection | Highlights rules blocking critical KRA traffic |
| 📦 MTU Mismatch Detection | Detects fragmentation issues on VPN tunnels |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| AI Engine | Groq API (Llama 3 70B) / Claude API (Anthropic) |
| Backend | Node.js + Express |
| Containerization | Docker |
| Database (planned) | PostgreSQL |
| Version Control | Git + GitHub |

---

## Project Structure

```
kra-network-assistant/
├── frontend/                  # React application
│   ├── public/
│   ├── src/
│   │   ├── App.jsx            # Main component (dashboard, diagnostics, chat, tunnels)
│   │   └── index.js
│   ├── .env                   # API keys (never commit this)
│   ├── .env.example           # Template for environment variables
│   └── package.json
│
├── backend/                   # Node.js API server (in progress)
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.js
│   └── package.json
│
├── docs/                      # Project documentation
│   ├── architecture.md
│   └── api-reference.md
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Git
- A Groq API key (free) — [console.groq.com](https://console.groq.com)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/kra-network-assistant.git
cd kra-network-assistant
```

### 2. Set up the frontend

```bash
cd frontend
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your API key (see [Environment Variables](#environment-variables) below).

### 4. Start the development server

```bash
npm start
```

The app will open at `http://localhost:3000`

---

## Environment Variables

Create a `.env` file inside the `frontend/` folder. **Never commit this file to GitHub.**

```env
# Groq API (free tier available)
REACT_APP_GROQ_KEY=your_groq_api_key_here

# OR Anthropic Claude API
REACT_APP_ANTHROPIC_KEY=your_anthropic_api_key_here
```

A `.env.example` file is included in the repo as a template — copy it and fill in your own keys.

> ⚠️ Each team member should create their own API key for local development. Never share keys directly.

---

## Team & Roles

| Role | Responsibility |
|---|---|
| Project Lead | Overall architecture, AI/backend integration |
| Frontend Developer | React UI, dashboard components, styling |
| Log Parser Engineer | Log parsing logic, issue detection rules |
| Networking Specialist | Mock data, AI system prompt, VPN research |
| DevOps & Docs | Docker setup, deployment, README, presentation |

---

## Roadmap

### MVP (Current)
- [x] Dashboard with metric cards and alert feed
- [x] Log analyzer with AI diagnostics
- [x] AI chat assistant with KRA network context
- [x] VPN tunnel health monitor

### Phase 2
- [ ] Move AI calls to backend (hide API key from browser)
- [ ] Real log file upload support
- [ ] Incident history stored in PostgreSQL
- [ ] User authentication for KRA staff

### Phase 3
- [ ] Real-time tunnel monitoring via SNMP/ping
- [ ] Email/SMS alerts for critical incidents
- [ ] PDF incident report generation
- [ ] Admin dashboard with incident analytics

---

## License

This project is developed for academic and internship purposes at the Kenya Revenue Authority.  
© 2025 KRA Network Assistant Team — Kisii University

---

<div align="center">
  Built with ❤️ for KRA ICT Operations
</div>