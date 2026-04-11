FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/proto ./proto
COPY .env.docker .
EXPOSE 3000
CMD ["node", "dist/main"]


# for building the image inside the web-api-gateway folder
# docker build -t web-api-gateway .

