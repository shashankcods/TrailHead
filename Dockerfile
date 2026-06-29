FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --omit=dev
EXPOSE 5000
CMD ["node", "src/server.js"]
