# Plan2Meet

**Plan2Meet** is a collaborative web application for finding the best time for groups to meet—fast, visual, and no registration required.

---

## Features

- Visual calendar grid for availability (30-min slots)
- No login—just share event link, enter your name, optional password
- Real-time availability overview, mobile & desktop
- Hover/tap to see who’s available per slot
- “Best slots” crowned for easy picking
- Shareable invite link

---

## Quickstart (Development)

### Prerequisites

- [Node.js](https://nodejs.org/) (for frontend)
- [Python 3.11+](https://www.python.org/) (for backend)
- [MongoDB](https://www.mongodb.com/) (local or Docker)

### Backend

```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Adjust .env if needed (e.g., MONGO_URI)
flask run
````

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### MongoDB (with Docker)

```bash
docker run -d -p 27017:27017 --name plan2meet-mongo mongo
```

## Running with Docker Compose

1. (If needed) Adjust ```VITE_API_URL``` value
2. Run everything:

```bash
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000)


## CI/CD: Publish to Docker Hub with GitHub Actions

### 1. Set GitHub repo secrets:

* `DOCKERHUB_USERNAME`
* `DOCKERHUB_TOKEN` (Docker Hub "Access Token", not password)

### 2. Manually trigger the workflow:

* Go to **Actions** tab in GitHub
* Select the **Build and Push Docker Image** workflow
* Click **Run workflow**, specify a tag (e.g. `v1.0.0`), and run

Images pushed:

* `yourusername/plan2meet:<tag>`
* `yourusername/plan2meet:latest`


## Project Structure

```
/backend       # Python Flask API
/frontend      # React app (Vite, Tailwind, Lucide icons)
/docker-compose.yml
```

## License

MIT