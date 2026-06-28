import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<500'], // DB reads should be fast
    http_req_failed: ['rate<0.01'],
  },
}

// Get this from browser devtools → Application → Local Storage → accessToken
// after logging into TrailHead
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMjczNWM2NjY3OTU5NjQ1YjgzNDlkYiIsImVtYWlsIjoic2hhYW4yMjA1MDZAZ21haWwuY29tIiwiaWF0IjoxNzgyNjg5Mjc3LCJleHAiOjE3ODMyOTQwNzd9.Q88xP0Qi0sjjEIGq0rfu31LPLfduMuLRjohN033LXYk'

export default function () {
  const res = http.get('http://localhost:5000/api/trips', {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })

  check(res, {
    'status is 200': (r) => r.status === 200,
  })

  sleep(0.5)
}
