FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run bundle

FROM grafana/k6:latest

WORKDIR /tests

COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/config/ ./config/

# Create results directory
RUN mkdir -p /tests/results

ENTRYPOINT ["k6", "run"]
CMD ["dist/restMarketSmoke.test.js"]