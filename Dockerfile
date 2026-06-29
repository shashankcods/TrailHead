# Stage 1: Build everything
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN ls -la /app
RUN cd trailhead-frontend && npm install && npm run build
RUN cd trailhead-backend && npm install --omit=dev

# Stage 2: Lean production image
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/trailhead-backend ./trailhead-backend
COPY --from=build /app/trailhead-frontend/dist ./trailhead-frontend/dist
EXPOSE 5000
CMD ["node", "trailhead-backend/src/server.js"]
