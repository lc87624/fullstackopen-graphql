FROM node:24-alpine AS build

WORKDIR /usr/src/app

ENV VITE_GRAPHQL_HTTP_URL=/graphql

COPY library-frontend/package*.json ./
RUN npm ci

COPY library-frontend .
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
