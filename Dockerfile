# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/trailhead-frontend
COPY trailhead-frontend/package*.json ./
RUN npm install
COPY trailhead-frontend/ ./
RUN npm run build

# Stage 2: Run backend (serves built frontend)
FROM node:20-alpine
WORKDIR /app
COPY trailhead-backend/package*.json ./trailhead-backend/
RUN cd trailhead-backend && npm install --omit=dev
COPY trailhead-backend/ ./trailhead-backend/
COPY --from=frontend-build /app/trailhead-frontend/dist ./trailhead-frontend/dist
EXPOSE 5000
CMD ["node", "trailhead-backend/src/server.js"]
