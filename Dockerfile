FROM node:17.9.1-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npx ngcc --properties es2023 browser module main --first-only --create-ivy-entry-points
COPY . .

RUN npm run build
FROM nginx:stable
COPY default-nginx.conf /etc/nginx/conf.d
COPY --from=build /app/dist/msg-recycling-rewards-frontend/ /usr/share/nginx/html
EXPOSE 5000
