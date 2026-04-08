# TrailHead

**TrailHead** is an AI-powered trip planning platform that unifies travel data from multiple sources into a single intelligent itinerary generator. It eliminates the need to switch between different apps for routes, weather, accommodation, events, and food by orchestrating multiple specialized agents that collectively produce a structured travel plan.

---

# The Problem

Planning a trip today typically requires juggling several separate tools:

- Maps for routes and travel times  
- Weather apps for forecasts  
- Booking platforms for hotels  
- Restaurant discovery tools  
- Event discovery platforms  
- Safety and sustainability checks  

This fragmented process is **time-consuming, inefficient, and rarely optimized for personal preferences or budget constraints**.

TrailHead addresses this by creating a **unified, orchestrated planning system** that aggregates travel information, processes it intelligently, and generates a **cohesive, personalized itinerary**.

---

# Solution Overview

TrailHead acts as a **multi-agent orchestration platform** for travel planning.

At its core is an **Orchestrator inspired by the Model Context Protocol (MCP)**. This orchestrator coordinates multiple specialized agents, each responsible for retrieving and processing a particular type of travel information.

The orchestrator merges their outputs and produces a **structured AI-generated itinerary** tailored to the user’s preferences, travel dates, weather conditions, and budget.

---

# Architecture Overview

```
User Input
│
▼
Orchestrator (Node.js Backend)
│
├── Maps Agent
├── Weather Agent
├── Food Agent
├── Events Agent
├── Accommodation Agent
├── Reddit Insights Agent
└── Safety & Sustainability Agent
│
▼
Local LLM (Mistral via Ollama)
│
▼
AI Generated Trip Summary + Day-wise Itinerary
```

---

# Agents and Data Integrations

### Maps Agent
Uses **OpenRouteService API** to determine optimal travel routes, distances, and estimated travel time.

### Weather Agent
Fetches current and forecast weather data using **Open-Meteo API** to ensure itinerary activities align with weather conditions.

### Food Agent
Discovers nearby restaurants and local food spots using **Google Places API**.

### Events Agent
Aggregates local events using:

- **PredictHQ API**
- **TicketMaster API**

### Accommodation Agent
Fetches hotel options and availability through **Booking.com API (RapidAPI)**.

### Reddit Insights Agent
Uses the **Reddit API** to gather community discussions and travel advice.

Performs **sentiment analysis** to highlight useful, positive, and authentic travel insights from real travelers.

### Safety & Sustainability Agent

Uses:

- **Overpass API** to analyze nearby infrastructure and safety indicators
- **Climatiq API** to estimate **carbon footprint and sustainability impact**

---

# AI-Powered Itinerary Generation

Once the agents collect travel data, the **Orchestrator aggregates and normalizes the information** into a structured format.

This structured data is then passed to a **local LLM (Mistral running via Ollama)**, which generates:

- A **coherent travel summary**
- A **day-by-day itinerary**
- Recommendations based on **weather, location proximity, and user preferences**

---

# Key Features

- AI-generated **day-by-day itineraries**
- Unified dashboard for **routes, weather, hotels, restaurants, and events**
- **Budget-aware planning**
- Discovery of **real traveler insights from Reddit**
- **Safety and sustainability insights**
- Local LLM summarization for **fast and private AI processing**

---

# Technical Stack

## Frontend
- React.js
- TypeScript
- Tailwind CSS

## Backend
- Node.js
- Express.js

## AI
- Local LLM: **Mistral via Ollama**

## Data Sources
- OpenRouteService
- Open-Meteo
- Google Places
- PredictHQ
- TicketMaster
- Booking.com (RapidAPI)
- Reddit API
- Overpass API
- Climatiq API

## Microservices
- Python FastAPI service for **Reddit scraping and sentiment analysis**

---

# Challenges We Faced

### Orchestrator Design
Managing multiple asynchronous agents while maintaining consistent data schemas and avoiding race conditions required careful orchestration logic.

### Data Normalization
Each external API returned data in different formats. We implemented normalization layers so that agents produce consistent structures suitable for LLM processing.

### LLM Summarization Performance
Passing large JSON payloads into the LLM caused high CPU usage and token overflow. We optimized:

- Prompt design  
- Input filtering  
- Data caching  

### Reddit Sentiment Pipeline
The Reddit insights pipeline required a **Python FastAPI microservice** for scraping and sentiment analysis.

Integrating this with the **Node.js backend** required managing subprocess communication, rate limits, and reliable sentiment scoring.

### Frontend Synchronization
Ensuring that the React frontend remained synchronized with orchestrator outputs while maintaining clean state management required careful API design and UI architecture.

---

# Future Improvements

- Add **LangGraph-based orchestration for agent execution graphs**
- Improve recommendation quality using **user preference learning**
- Add **real-time itinerary adjustments**
- Integrate **flight APIs**
- Enhance **map-based visual itinerary exploration**
