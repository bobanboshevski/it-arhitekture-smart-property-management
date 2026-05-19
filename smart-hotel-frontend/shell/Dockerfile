FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_PROPERTIES_MFE_URL
ARG VITE_BOOKINGS_MFE_URL
ARG VITE_PRICING_MFE_URL
ENV VITE_PROPERTIES_MFE_URL=$VITE_PROPERTIES_MFE_URL
ENV VITE_BOOKINGS_MFE_URL=$VITE_BOOKINGS_MFE_URL
ENV VITE_PRICING_MFE_URL=$VITE_PRICING_MFE_URL

RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]