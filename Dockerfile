FROM node:17.9.1-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npx ngcc --properties es2023 browser module main --first-only --create-ivy-entry-points
COPY . .

RUN npm run build
FROM nginx:stable
COPY default.conf /etc/nginx/conf.d
COPY --from=build /app/dist/msg-recycling-rewards-frontend/ /usr/a/nginx/html
EXPOSE 80
