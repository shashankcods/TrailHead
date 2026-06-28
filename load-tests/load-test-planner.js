import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
  scenarios: {
    baseline: {
      executor: 'constant-vus',
      vus: 1,
      duration: '2m',
    },
    light_load: {
      executor: 'constant-vus',
      vus: 5,
      duration: '2m',
      startTime: '3m',
    },
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 0 },
      ],
      startTime: '6m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<35000'], // services timeout at 30s
    http_req_failed: ['rate<0.1'],
  },
}

const PAYLOAD = JSON.stringify({
  source: 'New York',
  destination: 'Paris',
  start_date: '2025-08-01',
  trip_days: 5,
  adults: 2,
  interests: ['City Sightseeing', 'Food Exploration', 'Nightlife'],
  budget: {
    total: 5000,
    totalUSD: 5000,
    currency: 'USD',
    exchangeRate: 1.0,
    travel: 25,
    accommodation: 35,
    food: 20,
    activities: 20,
    travelUSD: 1250,
    accommodationUSD: 1750,
    foodUSD: 1000,
    activitiesUSD: 1000,
  },
})

export default function () {
  const res = http.post('http://localhost:5000/api/planner', PAYLOAD, {
    headers: { 'Content-Type': 'application/json' },
    timeout: '60s',
  })

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has plannerData': (r) => {
      try { return !!JSON.parse(r.body).data } catch { return false }
    },
  })

  sleep(1)
}
