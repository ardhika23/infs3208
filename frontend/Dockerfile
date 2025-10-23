# --- build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# Lebih toleran terhadap lock yang out-of-sync
RUN npm install
COPY . .
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- serve
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html