# TrailHead

**TrailHead** is an AI-powered trip planning platform that unifies travel data from multiple sources into a single intelligent itinerary generator. It eliminates the need to switch between different apps for flights, hotels, weather, events, and restaurants by orchestrating multiple specialized agents that collectively produce a structured, personalized travel plan.

---

# The Problem

Planning a trip today typically requires juggling several separate tools:

- Flight search engines for travel options and pricing
- Weather apps for destination forecasts
- Booking platforms for hotels
- Restaurant and event discovery tools
- Manual budget tracking across multiple currencies
- Separate safety lookups for unfamiliar destinations

This fragmented process is **time-consuming, inefficient, and rarely optimized for personal preferences or budget constraints**.

TrailHead addresses this by creating a **unified, orchestrated planning system** that aggregates travel information, processes it intelligently, and generates a **cohesive, personalized itinerary** — all in one place.

---

# Solution Overview

TrailHead acts as a **multi-agent orchestration platform** for travel planning.

At its core is an **Orchestrator** running on a Node.js backend. It coordinates multiple specialized agents in parallel, each responsible for retrieving and processing a particular type of travel information.

The orchestrator merges their outputs and passes the aggregated data to **Gemini** (Google's LLM), which generates a structured day-by-day itinerary tailored to the user's preferences, travel dates, weather conditions, and budget.

Users can then refine their itinerary through a **conversational chat assistant** powered by a **LangGraph** agent graph, save trips to their account, and export plans to their calendar.

---

# Architecture Overview

```
User Input
│
▼
Orchestrator (Node.js / Express Backend)
│
├── Flights Agent
├── Maps Agent
├── Weather Agent
├── Food Agent
├── Events Agent
├── Accommodation Agent
├── Attractions Agent
└── Safety Agent
│
▼
Gemini LLM (Google Generative AI)
│
▼
AI-Generated Day-wise Itinerary
│
▼
LangGraph Chat Agent (real-time itinerary editing)
```

---

# Agents and Data Integrations

### Flights Agent
Constructs deep-linked **Google Flights** search URLs for the user's route and travel dates, surfacing real flight options with pricing context via **SerpAPI**.

### Maps Agent
Uses **OpenRouteService API** to determine optimal travel routes, distances, and estimated travel times between origin and destination.

### Weather Agent
Fetches current and multi-day forecast data using **Open-Meteo API** to ensure planned activities align with expected conditions at the destination.

### Food Agent
Discovers nearby restaurants and local dining spots using **Google Places API**, including ratings, categories, estimated costs, and photos.

### Events Agent
Aggregates local events around the travel dates using **Ticketmaster API**, covering concerts, sports, arts, theatre, and more.

### Accommodation Agent
Fetches hotel options and availability using **SerpAPI (Google Hotels)**, returning pricing, ratings, and booking links.

### Attractions Agent
Sources local points of interest, museums, landmarks, and experiences using **Google Places API**, enriched with photos and visit duration estimates.

### Safety Agent
Scrapes destination **crime and safety index data from Numbeo** to give users an honest safety overview of their destination before they travel.

---

# AI-Powered Itinerary Generation

Once the agents collect travel data in parallel, the **Orchestrator aggregates and normalizes** all outputs into a compact structured format.

This data is passed to **Gemini** (via the Google Generative AI SDK), which generates:

- A structured **day-by-day itinerary** with scheduled activities, time slots, and themes per day
- Activities drawn from real fetched data (attractions, restaurants, events)
- Scheduling that respects opening hours, travel time, and budget constraints

### LangGraph Chat Assistant
After the itinerary is generated, users can interact with a **conversational chat assistant** to modify it in real time. The assistant is built on **LangGraph** and supports:

- Adding nightlife or restaurants to specific days
- Removing activities by name
- Replacing activities with alternatives
- Relaxing the schedule
- Reducing the trip budget
- Summarizing the full trip

---

# Key Features

- AI-generated **day-by-day itineraries** with real flights, hotels, and local attractions
- **Multi-agent parallel data fetching** for fast results
- **Conversational itinerary editor** via LangGraph chat
- **Budget planner** with multi-currency support and category breakdowns
- **Live events** discovery via Ticketmaster
- **Weather forecasts** for each day of the trip
- **Safety scores** for the destination
- **Map view** of the itinerary
- **Google OAuth** authentication
- **Save and manage trips** — revisit, edit, and re-open past plans
- **Calendar export** — download your itinerary as an `.ics` file
- **Rate limiting** on the planner endpoint to prevent API cost abuse

---

# Technical Stack

## Frontend
- React.js + TypeScript
- Tailwind CSS
- React Router
- Deployed on **Vercel**

## Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Passport.js (Google OAuth)
- LangGraph (`@langchain/langgraph`)
- Deployed on **Railway**

## AI
- **Gemini** (Google Generative AI) — itinerary generation and chat intent extraction
- **LangGraph** — agentic itinerary modification workflow

## Data Sources
- Google Flights via SerpAPI
- Google Hotels via SerpAPI
- Google Places API (food + attractions)
- Ticketmaster API (events)
- OpenRouteService (maps + routing)
- Open-Meteo (weather)
- Numbeo (safety data)

---

# Challenges We Faced

### Parallel Agent Orchestration
Managing multiple asynchronous agents while maintaining consistent data schemas and avoiding race conditions required careful orchestration logic with `Promise.allSettled` to ensure partial failures don't block the full response.

### LLM Token Efficiency
Passing raw API responses directly into Gemini caused bloated prompts and slower responses. We implemented a **compact activity representation** — stripping fields unused by the LLM (coordinates, photos, addresses) — reducing prompt size and improving generation speed significantly.

### Payload Optimization
The `GET /api/trips` list endpoint originally returned full `plannerData` blobs for every saved trip — resulting in extremely large responses. We resolved this by excluding `plannerData` from list queries using MongoDB projection (`.select("-plannerData")`) and fetching it lazily only when a trip is opened.

### LangGraph Chat Reliability
The chat agent runs 2–3 sequential LLM calls per message (intent extraction → modification → validation). We added per-call timeouts and a two-model fallback chain to prevent the assistant from hanging indefinitely on slow or failed API responses.

### Split Deployment Constraints
Railway's build context was limited to the backend subdirectory, making a monorepo Docker build impossible. We resolved this by splitting into two independent deployments — **Railway for the backend** and **Vercel for the frontend** — with CORS and OAuth redirect URIs configured accordingly.

### Case-Sensitive Imports on Linux
Import paths that worked on Windows (case-insensitive filesystem) failed on Railway's Linux containers. All import paths were audited and corrected to match exact filenames.

---

# Future Improvements

- Streaming LLM responses for the chat assistant to reduce perceived latency
- User preference learning across multiple trips
- Real-time flight price tracking and alerts
- Collaborative trip planning for groups
- Mobile app
