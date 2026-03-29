# Dynamic Pricing Service

FROM node:20-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN npm run build

# second stage
FROM node:20-alpine as runner

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

# copy build files (.env, configs, ...)
COPY --from=builder /usr/src/app/dist ./dist

# Copy other necessary files (like .env, configs)
COPY --from=builder /usr/src/app/.env* ./

EXPOSE 3002

CMD ["node", "dist/main.js"]