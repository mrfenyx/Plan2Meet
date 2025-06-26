# -- Build frontend --
FROM node:23 AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# -- Build backend --
FROM python:3.13-slim AS backend
WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./
COPY --from=frontend-build /frontend/dist ./frontend_dist

EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0"]
