---
marp: true
theme: default
paginate: true
size: 16:9
header: 'EVOLOTHON 1.0 - Round 1: Idea Pitch & Screening'
footer: 'Team Utkmizs | AlertNest'
style: |
  section {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background-color: #ffffff;
    color: #1e293b;
  }
  h1 { 
    color: #dc2626; 
    font-weight: 800; 
    border-bottom: 3px solid #f87171; 
    padding-bottom: 5px; 
    margin-bottom: 15px;
    font-size: 1.8em;
  }
  h2 { 
    color: #2563eb; 
    font-weight: 700; 
    font-size: 1.4em;
    margin-bottom: 15px;
  }
  strong { 
    color: #0f172a; 
    font-weight: 800; 
  }
  p, li { 
    font-size: 0.9em; 
    line-height: 1.4; 
    margin-bottom: 8px; 
  }
  ul {
    margin-top: 5px;
    margin-bottom: 5px;
  }
  .data-box { 
    background-color: #f1f5f9; 
    padding: 10px; 
    border-left: 5px solid #3b82f6; 
    border-radius: 4px; 
    font-style: italic; 
    font-weight: bold; 
    font-size: 0.85em; 
    margin-top: 10px;
  }
---

# AlertNest 🚨
## Hyperlocal AI-Powered Emergency Response Ecosystem
Transforming bystanders into first responders through AI and real-time routing.

**Team:** Utkmizs
**Team Leader:** Utkarsh Mishra
**Team Member:** Shashank Mishra
**Focus Area:** AI & Automation / Health & Safety

---

# 1. The Precise Pain Point
**In medical emergencies and safety crises, every second dictates survival.**
- **Delayed Dispatch:** Official ambulances face severe traffic constraints, often taking 15-30+ minutes to reach victims in urban areas.
- **The Information Gap:** In panic, bystanders lack immediate medical or safety knowledge (e.g., CPR or fire evacuation steps).
- **The Bystander Paradox:** Capable off-duty professionals (doctors, nurses) might be just 100 meters away but remain unaware of the crisis.

<div class="data-box">Data Fact: Thousands of lives are lost annually due to pre-hospital delay. Rapid hyperlocal intervention drastically improves survival rates.</div>

---

# 2. Our Breakthrough Solution
**AlertNest** is a hyperlocal SOS platform that bridges the gap between an incident and official dispatch by instantly mobilizing the nearest verified civilian and medical volunteers.

**Core Mechanisms:**
- **One-Tap Smart SOS:** Instantly broadcasts the victim's exact GPS, emergency type, and pre-saved family contact details.
- **Global Toast & Audio Alerts:** All registered active volunteers within a defined radius receive a loud audio ping and a flashing high-visibility notification with live tracking.

---

# 3. Raw Innovation: AI & Smart Routing
AlertNest integrates cutting-edge technology to automate crisis management:

- **Agentic AI Triage (Gemini 1.5):** The moment an SOS is pressed, Google's advanced AI analyzes the emergency type and instantly outputs actionable, life-saving safety instructions for the victim.
- **Live OSRM Routing:** Replaces static straight-line maps with real physical street routing, dynamically calculating the fastest path for a volunteer to reach the victim.
- **Dynamic Visual Hierarchy:** CSS-rendered map markers categorize threats (e.g., Flashing Pink for Women Safety, Pulsing Red Heartbeat for Medical).

---

# 4. Technical Feasibility & Architecture
Built on a robust, highly scalable, and modern tech stack:

- **Frontend:** React.js, TailwindCSS (High-performance UI & responsiveness).
- **Map Engine:** Leaflet.js with live OpenStreetMap & OSRM integration.
- **Backend & Realtime Data:** Supabase (PostgreSQL) handling instant event broadcasting across global channels with Row Level Security.
- **AI Integration:** Google Generative AI SDK for sub-second protocol generation.

*Status: The MVP is already functional, demonstrating instant event broadcasting and AI generation.*

---

# 5. Impact & Target Audiences
**A Solution Delivering Tangible Value across a Multi-sided Marketplace:**

- **The Vulnerable:** Anyone requiring immediate help, with specialized "Women Safety" rapid-response features for extreme visibility.
- **Verified Volunteers:** Off-duty doctors, nurses, paramedics, police, and trained civilians willing to act as first responders.
- **Medical Ecosystem:** Reduces the burden on official EMS networks by providing crucial first-aid during the "golden hour" and diverting victims to partnered clinics.

---

# 6. Market Scalability
**Growth Potential is Massive and Highly Modular:**

- **Phase 1 (Hyperlocal):** Launch in select tier-1 cities or university campuses to build initial volunteer network density.
- **Phase 2 (B2B/Gig Integration):** Partner with gig-economy workers (delivery drivers) who are always on the road to act as mobile verified responders.
- **Phase 3 (National Scale):** API integrations with government emergency services (112, 108) to act as a supplementary data feed.

---

# 7. Business & Revenue Model
While prioritizing social impact, AlertNest has a credible path to financial sustainability:

- **Enterprise Safety Packages:** B2B SaaS subscriptions for corporate tech-parks, universities, and large residential societies to maintain internal emergency response grids.
- **Premium Data APIs:** Licensing our anonymized, localized emergency clustering data to urban planners and insurance companies.
- **Govt Grants & CSR:** Leveraging Corporate Social Responsibility funds focused on community health and women's safety initiatives.

---

# 8. Execution Roadmap
**How we scale post-EVOLOTHON:**

- **Month 1-2:** Finalize MVP testing, refine AI response accuracy, and conduct simulated emergency drills.
- **Month 3-4:** Onboard the first 500 verified medical volunteers in a pilot city (Lucknow) through community outreach.
- **Month 5-6:** Launch mobile applications (React Native/Flutter) for push notifications even when the app is closed, ensuring zero-delay alerts.

---

# 9. Summary
**AlertNest is not just an application; it is a movement to build a Zero-Delay Emergency Ecosystem.**

**Team Utkmizs**
- **Utkarsh Mishra (Team Leader)**
- **Shashank Mishra**

*Thank you to the Evolotek Leadership Panel. We are ready to Build. Pitch. Win. Scale.*
