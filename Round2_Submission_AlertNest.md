# AlertNest - Round 2: Prototype & Project Submission
## Team Utkmizs (Utkarsh Mishra, Shashank Mishra)

---

## 1. Executive Summary
AlertNest is a hyperlocal, AI-powered SOS platform designed to transform verified bystanders (off-duty doctors, nurses, and trained civilians) into first responders. By instantly broadcasting emergencies to the nearest volunteers, it severely reduces response times during the critical "golden hour," effectively mitigating pre-hospital delays.

---

## 2. Technical Stack
Our MVP is built utilizing a modern, scalable, and highly responsive technology stack designed for real-time operations:

### Frontend
*   **Framework:** React 19 powered by Vite for rapid HMR and optimized builds.
*   **Styling:** Tailwind CSS 4 & PostCSS for a dynamic, utility-first design system and responsive UI.
*   **Icons & Assets:** Lucide React for consistent, scalable iconography.

### Mapping & Geolocation
*   **Map Engine:** Leaflet.js with React-Leaflet bindings.
*   **Routing:** OSRM (Open Source Routing Machine) API integration for calculating the fastest physical street route rather than straight-line distance.

### Backend & Database (BaaS)
*   **Database:** Supabase (PostgreSQL).
*   **Real-time:** Supabase Realtime subscriptions to instantly push SOS events to all active client devices.
*   **Security:** Row Level Security (RLS) ensures secure, authenticated data access.

### Artificial Intelligence
*   **Agentic Triage:** Google Generative AI SDK (Gemini 1.5 Pro/Flash) integrated directly into the client via API.
*   **Fallback / Alternative AI:** Groq SDK for ultra-low latency AI inference where immediate text streaming is crucial.

---

## 3. System Architecture
The system follows a decoupled client-serverless architecture optimizing for speed and high availability.

### 3.1 Client Layer
A React SPA designed as a Progressive Web App (PWA). It continuously monitors the user's GPS coordinates. 
*   **Victim Interface:** A one-tap SOS button that captures location, selected emergency type, and triggers the AI triage sequence.
*   **Volunteer Dashboard:** A live-updating map interface listening to a Supabase Realtime channel.

### 3.2 Data Flow & Processing
1.  **Event Trigger:** Victim presses SOS.
2.  **Database Write:** A new `emergency_event` record is created in Supabase with `ST_Point` geospatial data.
3.  **Real-time Broadcast:** Supabase emits an `INSERT` payload over WebSockets to all connected volunteer clients.
4.  **Routing Calculation:** Volunteer's client receives the payload, calculates distance, and pings the OSRM API to draw the fastest physical route to the victim.
5.  **AI Invocation:** Concurrently, the victim's client sends the emergency context to the Google GenAI SDK to stream life-saving first-aid instructions instantly.

### 3.3 Visual & Audio Alert Hierarchy
*   **Audio Alerts:** High-decibel audio ping triggers on the volunteer dashboard bypassing silent modes if permissions allow.
*   **Dynamic CSS Map Markers:** Threat levels dictate marker styling (e.g., Pulsing Red for Medical, Flashing Pink for Women's Safety).

---

## 4. Functional MVP Performance
The current MVP successfully demonstrates:
*   **Zero-Delay Dispatch:** Real-time event broadcasting over WebSockets with < 500ms latency.
*   **AI Contextual Output:** Generating situational awareness and first-aid protocols in under 2 seconds.
*   **Responsive UI:** A fully mobile-optimized interface catering to high-stress, on-the-go usage scenarios.

---

## 5. Deployment Roadmap & Future Scaling

### Phase 1: MVP Hardening & Cloud Deployment (Current)
*   **Frontend Hosting:** Deploy the Vite React app on Vercel or Netlify via CI/CD pipelines.
*   **Backend Hosting:** Production Supabase project with hardened RLS policies.
*   **Environment:** Setup strict `.env` configurations for AI SDKs and map providers.

### Phase 2: Native Transition (Months 1-3)
*   **Mobile App:** Re-write or wrap the application using React Native/Expo or Flutter to ensure deep OS integration.
*   **Background Services:** Implement background geolocation tracking and push notifications (Firebase Cloud Messaging/APNs) so volunteers receive alerts even when the app is closed.

### Phase 3: Ecosystem Integrations (Months 4-6)
*   **B2B & Gig Economy:** API hooks for ride-share drivers and food delivery partners to act as mobile first responders.
*   **Official EMS Integration:** Secure webhooks forwarding high-severity events to local government dispatch (112, 108).

---

## 6. Structural Integrity & Security
*   **Data Minimization:** We only transmit coordinate data and generic emergency types; personal identifiable information (PII) is obfuscated or encrypted.
*   **Abuse Prevention:** Rate-limiting on SOS triggers and a community-reporting system for false alarms.
*   **Code Quality:** Enforced via strict ESLint rules and modular React component design.

*We are ready to Build. Pitch. Win. Scale.*
