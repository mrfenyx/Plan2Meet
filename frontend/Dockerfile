# frontend/Dockerfile

# Build the app
FROM node:22 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve the app with a lightweight static server
FROM nginx:alpine

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (default Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
